/**
 * The demo runs the real agent, the real prompt and the real tool schemas
 * against fake implementations.
 *
 * That distinction is the whole design. A visitor who asks something awkward
 * gets a genuine answer, because the model and its instructions are the ones a
 * client would get. But nothing here touches a calendar, and nothing sends a
 * message to a phone — the two things that would turn a public demo into a way
 * to spam strangers or fill someone's real schedule with junk.
 *
 * Availability is generated rather than queried, on a fixed pseudo-schedule so
 * the same visitor sees consistent times as the conversation goes on.
 */

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

/**
 * Wall-clock parts for an instant, in a given timezone.
 *
 * The server runs in UTC and the tenant does not. Reading hours off a Date with
 * getHours() gives you the server's idea of the time, which is how the demo
 * came to offer a Calgary customer a 2am appointment and then describe it as
 * 8am: the business-hours filter ran in UTC while the display ran in Edmonton.
 */
function partsIn(date, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short",
  });
  const p = Object.fromEntries(
    dtf.formatToParts(date).filter((x) => x.type !== "literal").map((x) => [x.type, x.value])
  );
  return {
    year: +p.year, month: +p.month, day: +p.day,
    hour: +p.hour % 24, minute: +p.minute,
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday),
  };
}

/** Offset of `timeZone` from UTC at this instant, in ms. */
function offsetMs(date, timeZone) {
  const p = partsIn(date, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, 0) - date.getTime();
}

/**
 * The instant at which the tenant's wall clock reads this date and time.
 * Two passes so a slot that lands across a DST boundary still resolves.
 */
function instantAt(y, m, d, hour, minute, timeZone) {
  let guess = Date.UTC(y, m - 1, d, hour, minute, 0);
  for (let i = 0; i < 2; i++) {
    guess = Date.UTC(y, m - 1, d, hour, minute, 0) - offsetMs(new Date(guess), timeZone);
  }
  return new Date(guess);
}

/**
 * Next N openings on business days, skipping lunch, from tomorrow morning —
 * all reckoned in the tenant's timezone, not the server's.
 */
function openings(biz, { after, count = 3, durationMin = 60 }) {
  const tz = biz.timezone;
  const from = new Date(after || Date.now());
  const out = [];

  const startParts = partsIn(new Date(from.getTime() + 12 * HOUR), tz);
  let { year, month, day } = startParts;

  const SLOTS = [8, 9.5, 11, 13, 14.5];
  const step = Math.max(durationMin, 60);

  for (let dayOffset = 0; dayOffset < 21 && out.length < count; dayOffset++) {
    const probe = instantAt(year, month, day + dayOffset, 12, 0, tz);
    const wd = partsIn(probe, tz).weekday;
    if (wd === 0 || wd === 6) continue; // closed weekends

    const p = partsIn(probe, tz);
    for (const slot of SLOTS) {
      if (out.length >= count) break;
      const h = Math.floor(slot);
      const min = Math.round((slot - h) * 60);
      const when = instantAt(p.year, p.month, p.day, h, min, tz);
      if (when.getTime() < from.getTime() + 2 * HOUR) continue; // respect notice
      if (h + step / 60 > 17) continue;                          // must finish by close
      out.push(when.toISOString());
    }
  }
  return out;
}

function spoken(iso, timezone) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-CA", { weekday: "long", timeZone: timezone });
  const time = d
    .toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", timeZone: timezone })
    .replace(":00", "")
    .toLowerCase();
  return `${day} at ${time}`;
}

/**
 * A tool runner with the same signature as the production one. Every side
 * effect is replaced by a recorded event, which the frontend renders as the
 * little "booked into Google Calendar" and "confirmation sent" chips beside
 * the phone — so the visitor sees the work the agent is doing, not just text.
 */
export function makeSandboxRunner({ onEvent } = {}) {
  const booked = [];

  return async function runSandboxTool(name, args, ctx) {
    const { biz, call } = ctx;
    const emit = (type, detail) => onEvent?.({ type, detail, at: Date.now() });

    switch (name) {
      case "check_availability": {
        const svc = biz.services.find((s) => s.name === args.service) || biz.services[0];
        const slots = openings(biz, { after: args.afterISO, durationMin: svc?.durationMin });
        emit("calendar", { action: "checked", service: svc?.name });
        return {
          ok: true,
          service: svc?.name,
          slots: slots.map((iso) => ({ startISO: iso, spoken: spoken(iso, biz.timezone) })),
        };
      }

      case "book_appointment": {
        const rec = {
          service: args.service,
          startISO: args.startISO,
          callerName: args.callerName,
          callerPhone: args.callerPhone,
          notes: args.notes || null,
        };
        booked.push(rec);
        call.outcome = "booked";
        emit("calendar", {
          action: "booked",
          service: args.service,
          when: spoken(args.startISO, biz.timezone),
          name: args.callerName,
        });
        emit("sms", { action: "confirmation", to: args.callerPhone });
        return { ok: true, spoken: spoken(args.startISO, biz.timezone), demo: true };
      }

      case "find_appointment": {
        const found = booked[booked.length - 1] || null;
        emit("calendar", { action: "looked-up" });
        return found
          ? { ok: true, eventId: "demo-1", ...found, spoken: spoken(found.startISO, biz.timezone) }
          : { ok: true, found: false };
      }

      case "cancel_appointment":
        call.outcome = "cancelled";
        emit("calendar", { action: "cancelled" });
        return { ok: true };

      case "take_message":
        call.outcome = "message";
        emit("owner", { action: "message", subject: args.subject, urgency: args.urgency || "normal" });
        return { ok: true };

      case "transfer_to_human":
        call.outcome = "transferred";
        emit("owner", { action: "paged", reason: args.reason });
        /* Mirrors the production SMS behaviour: there is no live call to
           redirect in a text thread, so the owner is paged instead. */
        return {
          ok: true,
          transferred: false,
          note: "The team has been paged. You cannot connect anyone live over text — tell them someone will call shortly and confirm the best number.",
        };

      case "end_call":
        call.outcome = call.outcome || args.outcome || "handled";
        call.shouldEnd = true;
        return { ok: true };

      default:
        return { ok: false, error: `Unknown tool ${name}` };
    }
  };
}

export const __test = { openings, spoken };
