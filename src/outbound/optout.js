import fs from "node:fs";
import path from "node:path";

/**
 * Consent, kept on our side of the line.
 *
 * Twilio will honour STOP on its own for US/CA long codes, but relying on that
 * alone is wrong for two reasons: it does not cover WhatsApp, and it silently
 * drops the message rather than telling us we tried. A business that keeps
 * texting someone who opted out is the kind of thing that costs a client their
 * number, so every outbound send checks this list first and every inbound
 * message is inspected for a keyword before the agent ever sees it.
 *
 * Inbound keywords are matched on the whole trimmed message, case-insensitive.
 * A message that merely contains "stop" ("stop by around four?") is a normal
 * message and must not unsubscribe anybody.
 */
const STOP_WORDS = new Set(["stop", "stopall", "unsubscribe", "cancel", "end", "quit", "optout", "opt-out"]);
const START_WORDS = new Set(["start", "unstop", "yes", "resume", "optin", "opt-in"]);
const HELP_WORDS = new Set(["help", "info"]);

const STORE = process.env.OPTOUT_STORE || "data/optout.json";

/* key -> { at, reason }. Key is biz|channel|address so opting out of texts
   from one client does not mute a different client the person actually wants
   to hear from. */
let suppressed = new Map();
let loaded = false;

function keyFor(bizId, channel, address) {
  const bare = String(address || "").replace(/^whatsapp:/, "");
  return `${bizId}|${channel}|${bare}`;
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = JSON.parse(fs.readFileSync(STORE, "utf8"));
    suppressed = new Map(Object.entries(raw));
  } catch (err) {
    if (err.code !== "ENOENT") console.error("optout store unreadable, starting empty", err);
    suppressed = new Map();
  }
}

function persist() {
  try {
    fs.mkdirSync(path.dirname(STORE), { recursive: true });
    fs.writeFileSync(STORE, JSON.stringify(Object.fromEntries(suppressed), null, 2));
  } catch (err) {
    console.error("optout store unwritable", err);
  }
}

/** Classify an inbound message. Returns null when it is ordinary traffic. */
export function classify(body) {
  const word = String(body || "").trim().toLowerCase().replace(/[.!]+$/, "");
  if (STOP_WORDS.has(word)) return "stop";
  if (START_WORDS.has(word)) return "start";
  if (HELP_WORDS.has(word)) return "help";
  return null;
}

export function isSuppressed(bizId, channel, address) {
  load();
  return suppressed.has(keyFor(bizId, channel, address));
}

export function suppress(bizId, channel, address, reason = "inbound STOP") {
  load();
  suppressed.set(keyFor(bizId, channel, address), { at: Date.now(), reason });
  persist();
}

export function unsuppress(bizId, channel, address) {
  load();
  suppressed.delete(keyFor(bizId, channel, address));
  persist();
}

export function suppressionCount() {
  load();
  return suppressed.size;
}

/**
 * Handle a keyword if the message is one. Returns the reply to send and
 * whether the agent should be skipped for this turn.
 *
 * The STOP confirmation is itself a message to someone who just asked for no
 * more messages. One is required by carriers and expected by Meta; a second
 * would be a violation, which is why nothing else may follow it.
 */
export function handleKeyword(biz, { channel, from, body }) {
  const kind = classify(body);
  if (!kind) return null;

  if (kind === "stop") {
    suppress(biz.id, channel, from);
    return {
      handled: true,
      reply: `You're unsubscribed from ${biz.name} and won't get further messages. Reply START to resume.`,
    };
  }

  if (kind === "start") {
    unsuppress(biz.id, channel, from);
    return {
      handled: true,
      reply: `You're resubscribed to ${biz.name}. Reply STOP at any time to unsubscribe.`,
    };
  }

  return {
    handled: true,
    reply: `${biz.name}: ${biz.helpText || "reply with your question and we'll help you out."} Reply STOP to unsubscribe.${
      biz.phone ? ` Or call ${biz.phone}.` : ""
    }`,
  };
}
