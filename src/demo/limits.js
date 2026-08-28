/**
 * A public endpoint that calls a paid model is a standing invitation. These are
 * the ceilings that make it safe to leave one on a landing page.
 *
 * Two independent limits, because they stop different things. The per-visitor
 * limit stops one person monopolising the demo or using it as a free Claude
 * terminal. The global daily budget stops a crowd — or a script — from turning
 * a good day of traffic into a bad invoice. Hitting either is not an error:
 * the caller falls back to the scripted conversation, so the page keeps working.
 */

const WINDOW_MS = 30 * 60 * 1000;

/* Roughly what an interested prospect needs to satisfy themselves it is real.
   Enough to book an appointment and try to trip it up; not enough to hold a
   long conversation for entertainment. */
const PER_VISITOR = Number(process.env.DEMO_MAX_PER_VISITOR || 14);

/* Sized in messages rather than dollars so it is legible. At the demo's turn
   sizes a message is well under a cent, so this is a few dollars a day at the
   ceiling — set DEMO_MAX_PER_DAY to move it. */
const PER_DAY = Number(process.env.DEMO_MAX_PER_DAY || 1200);

/* A conversation past this is no longer evaluating the product. Ending it
   keeps context windows small and costs predictable. */
export const MAX_TURNS_PER_THREAD = Number(process.env.DEMO_MAX_TURNS || 24);

const visitors = new Map(); // ip -> { count, resetAt }
let today = { day: currentDay(), count: 0 };

function currentDay() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Behind Caddy or any proxy, req.ip is the proxy. X-Forwarded-For's first entry
 * is the client — spoofable, but the global budget is what actually protects
 * the bill, so a spoofed value costs us a handful of messages, not the ceiling.
 */
export function visitorKey(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.ip || "unknown";
}

export function check(req) {
  const now = Date.now();

  if (today.day !== currentDay()) today = { day: currentDay(), count: 0 };
  if (today.count >= PER_DAY) {
    return { allowed: false, reason: "daily", retryAfterMs: msUntilMidnight() };
  }

  const key = visitorKey(req);
  let v = visitors.get(key);
  if (!v || now > v.resetAt) {
    v = { count: 0, resetAt: now + WINDOW_MS };
    visitors.set(key, v);
  }
  if (v.count >= PER_VISITOR) {
    return { allowed: false, reason: "visitor", retryAfterMs: v.resetAt - now };
  }

  return { allowed: true, remaining: PER_VISITOR - v.count - 1 };
}

/** Called only after a message is actually sent to the model. */
export function record(req) {
  const key = visitorKey(req);
  const v = visitors.get(key);
  if (v) v.count++;
  today.count++;
}

function msUntilMidnight() {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime() - Date.now();
}

export function stats() {
  return { day: today.day, used: today.count, cap: PER_DAY, visitors: visitors.size };
}

/* Visitors expire on their own, but the map does not shrink without help. */
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of visitors) if (now > v.resetAt) visitors.delete(k);
}, WINDOW_MS).unref();
