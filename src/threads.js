import fs from "node:fs";
import { Conversation } from "./agent.js";
import { channelFor } from "./channels/index.js";
import { handleKeyword, isSuppressed } from "./outbound/optout.js";
import { notifyOwner } from "./tools/messaging.js";

/**
 * A text thread is a conversation with no hangup.
 *
 * This is the SMS session handling from the voice product, generalized so a
 * WhatsApp thread and an SMS thread are the same object with a different
 * transport underneath. Two things had to change to make that true: the key
 * includes the channel (the same person on both channels is two threads, since
 * replying on the wrong one is worse than starting fresh), and we record when
 * each inbound message arrived, because WhatsApp's 24-hour window makes that
 * timestamp load-bearing for anything the business sends later.
 */
const IDLE_MS = 30 * 60 * 1000;
const SWEEP_MS = 5 * 60 * 1000;

const sessions = new Map(); // `${bizId}|${channel}|${address}` -> session

function keyFor(bizId, channel, address) {
  const bare = String(address || "").replace(/^whatsapp:/, "");
  return `${bizId}|${channel}|${bare}`;
}

function sessionFor(biz, channel, from) {
  const key = keyFor(biz.id, channel, from);
  let s = sessions.get(key);

  if (s && Date.now() - s.lastAt > IDLE_MS) {
    wrapUp(key, s);
    s = null;
  }

  if (!s) {
    const call = {
      sid: `${channel}:${key}:${Date.now()}`,
      from,
      channel,
      startedAt: Date.now(),
      events: [],
      outcome: null,
      shouldEnd: false,
    };
    s = {
      key,
      biz,
      channel,
      call,
      convo: new Conversation(biz, call),
      lastAt: Date.now(),
      lastInboundAt: null,
      chain: Promise.resolve(),
    };
    sessions.set(key, s);
  }

  s.lastAt = Date.now();
  return s;
}

/**
 * When this person last messaged us. The outbound scheduler asks before every
 * WhatsApp send, because outside 24 hours free-form text is not permitted.
 *
 * Sessions are in memory, so a restart forgets this and the scheduler will
 * correctly treat the window as closed rather than assuming it is open.
 */
export function lastInboundAt(bizId, channel, address) {
  return sessions.get(keyFor(bizId, channel, address))?.lastInboundAt ?? null;
}

async function turn(s, body) {
  const ch = channelFor(s.channel);
  let reply;
  try {
    // Drain the stream; a text channel sends one message, so the streamed
    // deltas are only consumed to drive the loop.
    for await (const _ of s.convo.respondTo(body)) { /* drained */ }
    reply = s.convo.lastTurnText();
  } catch (err) {
    console.error(`${s.channel} turn failed`, err);
    reply = "Sorry, something went wrong on my end. Someone will follow up with you shortly.";
  }

  if (!reply) return; // model chose to stay silent (e.g. right after end_call)

  try {
    await ch.send(s.biz, s.call.from, reply);
  } catch (err) {
    console.error(`${s.channel} send failed`, err);
  }
}

/**
 * Entry point for an inbound message on any channel.
 *
 * Keyword handling comes first and never reaches the model. Someone texting
 * STOP is making a legal request, not starting a conversation, and an agent
 * that tried to talk them out of it — or simply answered warmly and carried on
 * — would be a compliance problem wearing a friendly voice.
 */
export function handleInbound(biz, { channel, from, body }) {
  const ch = channelFor(channel);

  const keyword = handleKeyword(biz, { channel, from, body });
  if (keyword?.handled) {
    // Fire-and-forget: the reply is fixed text, so there is nothing to serialize.
    ch.send(biz, from, keyword.reply).catch((err) => console.error("keyword reply failed", err));
    if (sessions.has(keyFor(biz.id, channel, from))) {
      const s = sessions.get(keyFor(biz.id, channel, from));
      s.call.outcome = "opted-out";
    }
    return Promise.resolve();
  }

  /* Someone who opted out and then sends an ordinary message has, in practice,
     changed their mind — but consent is not something to infer. Stay silent
     rather than treat a stray text as re-subscription. */
  if (isSuppressed(biz.id, channel, from)) {
    console.log(`inbound from suppressed ${channel} contact, ignoring`);
    return Promise.resolve();
  }

  const s = sessionFor(biz, channel, from);
  s.lastInboundAt = Date.now();

  // Serialize per sender: two texts sent seconds apart must not run the model
  // twice against the same history and answer both halves out of order.
  s.chain = s.chain.then(() => turn(s, body)).catch((err) => console.error(`${channel} chain`, err));
  return s.chain;
}

async function wrapUp(key, s) {
  sessions.delete(key);
  if (!s.convo.messages.length) return;
  s.call.endedAt = Date.now();
  try {
    const summary = await s.convo.summarize();
    if (s.call.outcome !== "transferred" && s.call.outcome !== "opted-out") {
      await notifyOwner(s.biz, `${channelFor(s.channel).label} thread with ${s.call.from}\n\n${summary}`);
    }
    fs.appendFileSync(
      process.env.CALL_LOG || "calls.jsonl",
      JSON.stringify({ biz: s.biz.id, ...s.call, summary }) + "\n"
    );
  } catch (err) {
    console.error("thread wrap-up failed", err);
  }
}

setInterval(() => {
  for (const [key, s] of sessions) {
    if (Date.now() - s.lastAt > IDLE_MS) wrapUp(key, s);
  }
}, SWEEP_MS).unref();

export const threads = { lastInboundAt };
