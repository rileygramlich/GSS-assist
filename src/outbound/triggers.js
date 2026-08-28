import { schedule, cancelFor } from "./scheduler.js";
import { isSuppressed } from "./optout.js";

/**
 * The four moments a business should say something first.
 *
 * Each one is a decision about timing more than copy. Text back a missed call
 * within a minute and you are still the business they were trying to reach;
 * text back an hour later and you are interrupting someone who already called
 * your competitor. A reminder the evening before gets read; one sent at
 * booking time is forgotten by the appointment.
 *
 * All four route through the scheduler, so all four inherit its gates: quiet
 * hours, opt-out, and the WhatsApp session window.
 */

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

/** Preferred channel for a given person: WhatsApp if that is how they arrived. */
function channelPreference(biz, { channel } = {}) {
  if (channel) return channel;
  return biz.outbound?.defaultChannel || "sms";
}

function enabled(biz, name) {
  const cfg = biz.outbound?.[name];
  if (cfg === undefined) return false;
  return cfg === true || cfg?.enabled === true;
}

function tuning(biz, name, key, fallback) {
  const cfg = biz.outbound?.[name];
  return (cfg && typeof cfg === "object" && cfg[key] !== undefined) ? cfg[key] : fallback;
}

/**
 * A call rang out. This is the highest-value message the system sends and the
 * most time-sensitive: the caller still has the problem that made them dial.
 *
 * Deliberately not instant. A caller who hangs up and immediately redials, or
 * who is still leaving a voicemail, should not get a text mid-sentence — so we
 * wait out a short grace period, and `onCallAnswered` cancels the job if
 * somebody picks up inside it.
 */
export function onMissedCall(biz, { from, channel } = {}) {
  if (!enabled(biz, "missedCallTextBack")) return null;
  if (!from) return null;

  const ch = channelPreference(biz, { channel: channel || "sms" });
  if (isSuppressed(biz.id, ch, from)) return null;

  const graceMs = tuning(biz, "missedCallTextBack", "graceSeconds", 45) * 1000;
  const body =
    tuning(biz, "missedCallTextBack", "message", null) ||
    `Sorry we missed your call — this is ${biz.receptionistName} at ${biz.name}. What can I help you with? I can get you booked in right here.`;

  return schedule({
    bizId: biz.id,
    channel: ch,
    to: from,
    kind: "missed-call",
    runAt: Date.now() + graceMs,
    body,
    /* One text-back per caller per hour. Someone who calls three times in a
       row is anxious, not three separate leads. */
    dedupeKey: `${biz.id}|${ch}|${from}|missed-call|${Math.floor(Date.now() / HOUR)}`,
  });
}

/** Someone picked up inside the grace period, so the apology is now a lie. */
export function onCallAnswered(biz, { from } = {}) {
  if (!from) return 0;
  return cancelFor({ bizId: biz.id, to: from, kind: "missed-call" });
}

/**
 * An appointment was booked. Queues the reminder and, if the client wants one,
 * the review request that follows the visit.
 *
 * `startISO` is the appointment time; both jobs are anchored to it rather than
 * to now, so a booking made three weeks out still reminds the night before.
 */
export function onBooked(biz, { startISO, callerPhone, callerName, service, channel, durationMin } = {}) {
  if (!startISO || !callerPhone) return [];
  const ch = channelPreference(biz, { channel });
  const start = new Date(startISO).getTime();
  if (!Number.isFinite(start)) return [];

  const queued = [];

  if (enabled(biz, "reminders")) {
    const leadHours = tuning(biz, "reminders", "leadHours", 18);
    const runAt = start - leadHours * HOUR;
    /* A booking made for tomorrow morning can put the reminder in the past.
       Sending it immediately would be noise on top of the confirmation they
       just got, so skip it — the confirmation is the reminder. */
    if (runAt > Date.now() + 30 * MIN) {
      queued.push(
        schedule({
          bizId: biz.id,
          channel: ch,
          to: callerPhone,
          kind: "reminder",
          runAt,
          body:
            tuning(biz, "reminders", "message", null) ||
            `Reminder from ${biz.name}: ${service || "your appointment"} is coming up ${friendly(start, biz.timezone)}. Reply here if you need to move it.`,
          template: tuning(biz, "reminders", "template", null),
          dedupeKey: `${biz.id}|${ch}|${callerPhone}|reminder|${startISO}`,
        })
      );
    }
  }

  if (enabled(biz, "reviewRequests")) {
    const delayHours = tuning(biz, "reviewRequests", "delayHours", 3);
    const after = start + (durationMin || 60) * MIN + delayHours * HOUR;
    const link = tuning(biz, "reviewRequests", "link", biz.reviewLink);
    if (link) {
      queued.push(
        schedule({
          bizId: biz.id,
          channel: ch,
          to: callerPhone,
          kind: "review",
          runAt: after,
          body:
            tuning(biz, "reviewRequests", "message", null) ||
            `Thanks for choosing ${biz.name}${callerName ? `, ${firstName(callerName)}` : ""}. If we did right by you, a quick review helps us a lot: ${link}`,
          template: tuning(biz, "reviewRequests", "template", null),
          dedupeKey: `${biz.id}|${ch}|${callerPhone}|review|${startISO}`,
        })
      );
    }
  }

  return queued.filter(Boolean);
}

/** Booking moved or cancelled — retract anything anchored to the old time. */
export function onBookingChanged(biz, { callerPhone, channel } = {}) {
  if (!callerPhone) return 0;
  const ch = channelPreference(biz, { channel });
  return (
    cancelFor({ bizId: biz.id, channel: ch, to: callerPhone, kind: "reminder" }) +
    cancelFor({ bizId: biz.id, channel: ch, to: callerPhone, kind: "review" })
  );
}

/**
 * They did not show. Worth one message, and only one — a no-show is often
 * embarrassment, and the goal is to make rebooking easy rather than to
 * extract an explanation.
 */
export function onNoShow(biz, { callerPhone, callerName, service, channel } = {}) {
  if (!enabled(biz, "noShowFollowUp")) return null;
  if (!callerPhone) return null;
  const ch = channelPreference(biz, { channel });

  /* Cancel the review request first: asking someone to review a visit that did
     not happen is the worst message this system could send. */
  cancelFor({ bizId: biz.id, channel: ch, to: callerPhone, kind: "review" });

  return schedule({
    bizId: biz.id,
    channel: ch,
    to: callerPhone,
    kind: "no-show",
    runAt: Date.now() + tuning(biz, "noShowFollowUp", "delayMinutes", 90) * MIN,
    body:
      tuning(biz, "noShowFollowUp", "message", null) ||
      `Hi${callerName ? ` ${firstName(callerName)}` : ""}, we had you down for ${service || "an appointment"} today and missed you. Want me to find another time?`,
    template: tuning(biz, "noShowFollowUp", "template", null),
    dedupeKey: `${biz.id}|${ch}|${callerPhone}|no-show|${new Date().toISOString().slice(0, 10)}`,
  });
}

function firstName(full) {
  return String(full).trim().split(/\s+/)[0];
}

function friendly(ts, timezone) {
  const d = new Date(ts);
  const day = d.toLocaleDateString("en-CA", { weekday: "long", timeZone: timezone });
  const time = d
    .toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", timeZone: timezone })
    .replace(/:00/, "")
    .replace(/\s?([ap])\.?m\.?/i, (_, p) => p.toLowerCase() + "m");
  return `${day} at ${time}`;
}

export const __test = { friendly, firstName, enabled, tuning };
