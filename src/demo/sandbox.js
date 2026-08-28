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

/** Next N openings on business days, skipping lunch, from tomorrow morning. */
function openings(biz, { after, count = 3, durationMin = 60 }) {
  const out = [];
  const start = new Date(after || Date.now());
  const cursor = new Date(start.getTime() + 18 * HOUR);
  cursor.setMinutes(0, 0, 0);

  let guard = 0;
  while (out.length < count && guard++ < 200) {
    const day = cursor.getDay();
    const hour = cursor.getHours();

    if (day === 0 || day === 6) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(8, 0, 0, 0);
      continue;
    }
    if (hour < 8) {
      cursor.setHours(8, 0, 0, 0);
      continue;
    }
    if (hour >= 16) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(8, 0, 0, 0);
      continue;
    }
    if (hour === 12) {
      cursor.setHours(13, 0, 0, 0);
      continue;
    }

    out.push(new Date(cursor).toISOString());
    cursor.setTime(cursor.getTime() + Math.max(durationMin, 60) * MIN + 30 * MIN);
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
