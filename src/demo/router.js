import express from "express";
import { randomUUID } from "node:crypto";
import { Conversation } from "../agent.js";
import { makeSandboxRunner } from "./sandbox.js";
import { scriptedReply } from "./script.js";
import * as limits from "./limits.js";

/**
 * The public demo endpoint.
 *
 * Sessions live in memory and expire quickly. There is no login, so the thread
 * id is the only identity — it is a random UUID handed to the browser, which
 * means a visitor can only ever reach their own conversation, and losing it
 * costs them nothing but a fresh start.
 */
const SESSION_TTL_MS = 45 * 60 * 1000;
const MAX_BODY_CHARS = 400;

const sessions = new Map();

function reap() {
  const now = Date.now();
  for (const [id, s] of sessions) if (now - s.lastAt > SESSION_TTL_MS) sessions.delete(id);
}
setInterval(reap, 5 * 60 * 1000).unref();

export function demoRouter(demoBusiness) {
  const router = express.Router();
  router.use(express.json({ limit: "16kb" }));

  /** Start a thread. Returns the greeting without spending a model call. */
  router.post("/start", (req, res) => {
    reap();
    const id = randomUUID();
    const channel = req.body?.channel === "whatsapp" ? "whatsapp" : "sms";
    const biz = { ...demoBusiness, channel };

    const call = {
      sid: `demo:${id}`,
      from: "+15550000000",
      channel: "sms",
      startedAt: Date.now(),
      events: [],
      outcome: null,
      shouldEnd: false,
    };

    const events = [];
    const convo = new Conversation(biz, call, {
      runTool: makeSandboxRunner({ onEvent: (e) => events.push(e) }),
    });

    sessions.set(id, { id, biz, call, convo, events, turns: 0, lastAt: Date.now(), scripted: false });

    res.json({
      threadId: id,
      channel,
      greeting: `${demoBusiness.name}, this is ${demoBusiness.receptionistName}. What can I help you with?`,
      business: {
        name: demoBusiness.name,
        agent: demoBusiness.receptionistName,
        services: demoBusiness.services.map((s) => s.name),
      },
    });
  });

  /**
   * One turn. Replies as a whole message rather than streaming, because a text
   * message arrives whole — streaming it token by token would look like a chat
   * window, which is exactly the wrong mental model for this product.
   */
  router.post("/message", async (req, res) => {
    reap();
    const { threadId, body } = req.body || {};
    const s = sessions.get(threadId);
    if (!s) return res.status(404).json({ error: "thread_expired" });

    const text = String(body || "").slice(0, MAX_BODY_CHARS).trim();
    if (!text) return res.status(400).json({ error: "empty" });

    s.lastAt = Date.now();
    s.turns++;

    if (s.turns > limits.MAX_TURNS_PER_THREAD) {
      return res.json({
        reply: `That's the end of what I can show you here — text or call ${demoBusiness.demoPhone} and you'll get the real thing.`,
        events: [],
        mode: "ended",
      });
    }

    const verdict = limits.check(req);
    if (!verdict.allowed || s.scripted) {
      s.scripted = true;
      return res.json({
        reply: scriptedReply(demoBusiness, text, s.turns - 1),
        events: [],
        mode: "scripted",
        reason: verdict.reason || "scripted",
      });
    }

    const before = s.events.length;
    try {
      for await (const _ of s.convo.respondTo(text)) { /* drained */ }
      limits.record(req);

      const reply = s.convo.lastTurnText();
      const fresh = s.events.slice(before);

      /* The agent can legitimately produce no text — it ends the thread after a
         confirmation. Say something rather than render an empty bubble. */
      return res.json({
        reply: reply || "You're all set. I'll text you the confirmation now.",
        events: fresh,
        mode: "live",
        ended: Boolean(s.call.shouldEnd),
        outcome: s.call.outcome,
      });
    } catch (err) {
      console.error("demo turn failed", err);
      s.scripted = true;
      return res.json({
        reply: scriptedReply(demoBusiness, text, s.turns - 1),
        events: [],
        mode: "scripted",
        reason: "error",
      });
    }
  });

  /* Operational visibility: is the demo live right now, and how much of today's
     budget is gone. Safe to expose — it is counts, not content. */
  router.get("/status", (_req, res) => {
    res.json({ ...limits.stats(), sessions: sessions.size });
  });

  return router;
}
