import fs from "node:fs";
import { Conversation } from "./agent.js";
import { sendSms, notifyOwner } from "./tools/messaging.js";

/* A text thread is a conversation with no hangup. We keep it alive for a while
   after the last message, then wrap it up the way a call gets wrapped up on
   hangup: summary to the owner, row in calls.jsonl.                           */
const IDLE_MS = 30 * 60 * 1000;
const SWEEP_MS = 5 * 60 * 1000;
const MAX_REPLY_CHARS = 1200; // ~8 SMS segments; the prompt should stay far under this

const sessions = new Map(); // `${to}|${from}` -> session

function sessionFor(biz, to, from) {
  const key = `${to}|${from}`;
  let s = sessions.get(key);

  if (s && Date.now() - s.lastAt > IDLE_MS) {
    wrapUp(key, s);
    s = null;
  }

  if (!s) {
    const call = {
      sid: `sms:${key}:${Date.now()}`,
      from,
      channel: "sms",
      startedAt: Date.now(),
      events: [],
      outcome: null,
      shouldEnd: false,
    };
    s = { key, biz, call, convo: new Conversation(biz, call), lastAt: Date.now(), chain: Promise.resolve() };
    sessions.set(key, s);
  }

  s.lastAt = Date.now();
  return s;
}

async function turn(s, body) {
  const parts = [];
  try {
    for await (const chunk of s.convo.respondTo(body)) parts.push(chunk);
  } catch (err) {
    console.error("sms turn failed", err);
    parts.push("Sorry, something went wrong on my end. Someone will follow up with you shortly.");
  }

  // respondTo streams token deltas, which already carry their own spacing —
  // joining on anything but the empty string breaks words apart.
  const reply = parts.join("").trim();
  if (!reply) return; // model chose to stay silent (e.g. right after end_call)

  try {
    await sendSms(s.biz, s.call.from, reply.slice(0, MAX_REPLY_CHARS));
  } catch (err) {
    console.error("sms send failed", err);
  }
}

export function handleInboundSms(biz, { from, to, body }) {
  const s = sessionFor(biz, to, from);
  // Serialize per sender: two texts sent seconds apart must not run the model
  // twice against the same history and answer both halves out of order.
  s.chain = s.chain.then(() => turn(s, body)).catch((err) => console.error("sms chain", err));
  return s.chain;
}

async function wrapUp(key, s) {
  sessions.delete(key);
  if (!s.convo.messages.length) return;
  s.call.endedAt = Date.now();
  try {
    const summary = await s.convo.summarize();
    if (s.call.outcome !== "transferred") {
      await notifyOwner(s.biz, `Text thread with ${s.call.from}\n\n${summary}`);
    }
    fs.appendFileSync(
      process.env.CALL_LOG || "calls.jsonl",
      JSON.stringify({ biz: s.biz.id, ...s.call, summary }) + "\n"
    );
  } catch (err) {
    console.error("sms wrap-up failed", err);
  }
}

setInterval(() => {
  for (const [key, s] of sessions) {
    if (Date.now() - s.lastAt > IDLE_MS) wrapUp(key, s);
  }
}, SWEEP_MS).unref();
