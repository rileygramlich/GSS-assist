import fs from "node:fs";
import path from "node:path";
import { channelFor } from "../channels/index.js";
import { isSuppressed } from "./optout.js";

/**
 * A durable queue for messages the business starts.
 *
 * Inbound is easy: someone texted, so reply. Outbound is where the ways to get
 * this wrong live. A reminder must not fire at 3am. A follow-up must not go to
 * someone who unsubscribed an hour after it was queued. A WhatsApp message
 * queued on Monday may find a closed session window by Tuesday. And the
 * process restarts, so none of it can live only in memory.
 *
 * Jobs are checked against every one of those gates at send time rather than
 * at queue time, because all of them can change while a job waits.
 */
const STORE = process.env.OUTBOUND_STORE || "data/outbound.json";
const TICK_MS = 30 * 1000;
const MAX_ATTEMPTS = 4;
const BACKOFF_MS = [0, 60_000, 5 * 60_000, 30 * 60_000];

/* TCPA and CRTC both fence marketing and reminder traffic into the recipient's
   waking hours. 9am-8pm is inside every rule we care about with room to spare. */
const QUIET_START_HOUR = 9;
const QUIET_END_HOUR = 20;

let jobs = [];
let loaded = false;
let timer = null;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    jobs = JSON.parse(fs.readFileSync(STORE, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") console.error("outbound store unreadable, starting empty", err);
    jobs = [];
  }
}

function persist() {
  try {
    fs.mkdirSync(path.dirname(STORE), { recursive: true });
    fs.writeFileSync(STORE, JSON.stringify(jobs, null, 2));
  } catch (err) {
    console.error("outbound store unwritable", err);
  }
}

/** Local wall-clock hour for the tenant, so quiet hours mean their hours. */
function hourIn(timezone) {
  const s = new Date().toLocaleString("en-US", { timeZone: timezone, hour: "numeric", hour12: false });
  return parseInt(s, 10);
}

function withinSendingHours(biz) {
  if (biz.outbound?.ignoreQuietHours) return true;
  const h = hourIn(biz.timezone);
  return h >= QUIET_START_HOUR && h < QUIET_END_HOUR;
}

/** Next moment inside sending hours, so a job deferred at 2am lands at 9am. */
function nextSendingWindow(biz) {
  const now = new Date();
  const h = hourIn(biz.timezone);
  const ms = 60 * 60 * 1000;
  if (h < QUIET_START_HOUR) return now.getTime() + (QUIET_START_HOUR - h) * ms;
  return now.getTime() + (24 - h + QUIET_START_HOUR) * ms;
}

/**
 * Queue a message.
 *
 * `dedupeKey` makes queueing idempotent: a webhook Twilio retries, or a
 * reminder swept twice, must not text the same person the same thing twice.
 */
export function schedule({ bizId, channel, to, kind, runAt, body, template, dedupeKey }) {
  load();
  const key = dedupeKey || `${bizId}|${channel}|${to}|${kind}|${runAt}`;
  if (jobs.some((j) => j.dedupeKey === key && j.state !== "failed")) return null;

  const job = {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    bizId,
    channel,
    to,
    kind,
    runAt: runAt || Date.now(),
    body: body || null,
    template: template || null,
    dedupeKey: key,
    attempts: 0,
    state: "pending",
    queuedAt: Date.now(),
  };
  jobs.push(job);
  persist();
  return job;
}

/** Drop queued work for someone — used when a thread reaches its own ending. */
export function cancelFor({ bizId, channel, to, kind }) {
  load();
  const bare = String(to || "").replace(/^whatsapp:/, "");
  let n = 0;
  for (const j of jobs) {
    if (j.state !== "pending") continue;
    if (j.bizId !== bizId) continue;
    if (channel && j.channel !== channel) continue;
    if (kind && j.kind !== kind) continue;
    if (String(j.to).replace(/^whatsapp:/, "") !== bare) continue;
    j.state = "cancelled";
    n++;
  }
  if (n) persist();
  return n;
}

async function runJob(job, { tenants, threads }) {
  const biz = tenants.get(job.bizId);
  if (!biz) {
    job.state = "failed";
    job.error = `no tenant ${job.bizId}`;
    return;
  }

  if (isSuppressed(biz.id, job.channel, job.to)) {
    job.state = "suppressed";
    return;
  }

  if (!withinSendingHours(biz)) {
    job.runAt = nextSendingWindow(biz);
    job.deferrals = (job.deferrals || 0) + 1;
    return;
  }

  const ch = channelFor(job.channel);

  /* WhatsApp closes the free-form window 24 hours after the customer's last
     message. Past that a template is the only legal instrument, and if this
     job has none, deferring forever would be a leak — fail it loudly instead. */
  if (ch.hasSessionWindow) {
    const lastInboundAt = threads?.lastInboundAt(biz.id, job.channel, job.to) ?? null;
    if (!ch.windowIsOpen(lastInboundAt)) {
      if (!job.template) {
        job.state = "failed";
        job.error = "whatsapp session window closed and no approved template on the job";
        return;
      }
      await ch.sendTemplate(biz, job.to, job.template);
      job.state = "sent";
      job.sentAt = Date.now();
      return;
    }
  }

  await ch.send(biz, job.to, job.body);
  job.state = "sent";
  job.sentAt = Date.now();
}

async function tick(ctx) {
  load();
  const now = Date.now();
  const due = jobs.filter((j) => j.state === "pending" && j.runAt <= now);
  if (!due.length) return;

  for (const job of due) {
    try {
      await runJob(job, ctx);
    } catch (err) {
      job.attempts++;
      job.error = String(err?.message || err);
      if (job.attempts >= MAX_ATTEMPTS) {
        job.state = "failed";
        console.error(`outbound ${job.id} failed permanently:`, job.error);
      } else {
        job.runAt = Date.now() + BACKOFF_MS[job.attempts];
        console.warn(`outbound ${job.id} retry ${job.attempts}: ${job.error}`);
      }
    }
  }

  /* Keep the store from growing without bound; a week is long enough to debug
     what went out and short enough that the file stays small. */
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  jobs = jobs.filter((j) => j.state === "pending" || (j.sentAt || j.queuedAt) > weekAgo);
  persist();
}

export function startScheduler(ctx) {
  if (timer) return;
  load();
  timer = setInterval(() => {
    tick(ctx).catch((err) => console.error("outbound tick", err));
  }, TICK_MS);
  timer.unref();
  console.log(`Outbound scheduler running (${jobs.filter((j) => j.state === "pending").length} pending)`);
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function pendingJobs() {
  load();
  return jobs.filter((j) => j.state === "pending");
}

export const __test = { withinSendingHours, nextSendingWindow, hourIn };
