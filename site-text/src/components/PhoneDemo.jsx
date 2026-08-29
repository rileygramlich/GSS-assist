import { useCallback, useEffect, useRef, useState } from "react";
import "./PhoneDemo.css";
import { DEMO_PROMPTS, DEMO_PHONE_DISPLAY, BOOKING_URL } from "../content";

/**
 * The product demonstrating itself.
 *
 * The visitor is the customer here: their messages go out on the right, the
 * agent's come back on the left, and the chips underneath show the work she is
 * doing between them — checking the calendar, writing the booking, sending the
 * confirmation. Those chips are the argument. Without them this looks like a
 * chatbot; with them it looks like a receptionist.
 *
 * Two modes:
 *   inline  in the hero. Starts small so trying it costs nothing, then expands
 *           into an overlay on the first message, once the visitor has shown
 *           they actually want to read a conversation.
 *   page    the /demo funnel target, where the phone is the whole point and
 *           there is nothing to expand away from.
 */

const API = "/api/demo";

function useAutoScroll(dep) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* Two frames, not one: the effect runs before the browser has laid the new
       bubble out, so scrollHeight is still the previous value and the newest
       message ends up hidden under the composer. */
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; })
    );
    return () => cancelAnimationFrame(raf);
  }, [dep]);
  return ref;
}

function EventChip({ event }) {
  const { type, detail } = event;
  const text = (() => {
    if (type === "calendar" && detail.action === "checked") return `Checking availability · ${detail.service || "calendar"}`;
    if (type === "calendar" && detail.action === "booked") return `Booked · ${detail.when}`;
    if (type === "calendar" && detail.action === "cancelled") return "Appointment cancelled";
    if (type === "calendar") return "Calendar updated";
    if (type === "sms") return "Confirmation text sent";
    if (type === "owner" && detail.action === "paged") return "Owner paged — a person will call";
    if (type === "owner") return `Message taken · ${detail.subject || "for the owner"}`;
    return type;
  })();

  const icon = type === "calendar" ? "▦" : type === "sms" ? "✓" : "!";
  return (
    <div className={`chip chip-${type}`}>
      <span className="chip-icon" aria-hidden="true">{icon}</span>
      {text}
    </div>
  );
}

export default function PhoneDemo({ mode = "inline" }) {
  const [channel, setChannel] = useState("sms");
  const [thread, setThread] = useState(null);
  const [items, setItems] = useState([]); // {kind: 'msg'|'event', ...}
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [replyMode, setReplyMode] = useState("live");
  const [failed, setFailed] = useState(false);
  const [ended, setEnded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [holdHeight, setHoldHeight] = useState(null);

  const expandable = mode === "inline";
  const listRef = useAutoScroll(items.length + (busy ? 1 : 0));
  const inputRef = useRef(null);
  const shellRef = useRef(null);
  const closeRef = useRef(null);

  const start = useCallback(async (ch) => {
    setBusy(true);
    setFailed(false);
    setEnded(false);
    setReplyMode("live");
    setItems([]);
    try {
      const res = await fetch(`${API}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: ch }),
      });
      if (!res.ok) throw new Error("start failed");
      const data = await res.json();
      setThread(data.threadId);
      setItems([{ kind: "msg", who: "agent", text: data.greeting }]);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { start(channel); }, [channel, start]);

  /* While the overlay is open: escape closes it, the page behind it does not
     scroll, and focus moves to the close button so a keyboard user is not
     stranded behind the backdrop. */
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => { if (e.key === "Escape") setExpanded(false); };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  /* Going fixed removes the demo from the flow, which would yank the hero up
     under the reader mid-sentence. Freeze the space it occupied first. */
  function expand() {
    const h = shellRef.current?.getBoundingClientRect().height;
    if (h) setHoldHeight(h);
    setExpanded(true);
  }

  async function send(text) {
    const body = String(text || "").trim();
    if (!body || busy || !thread || ended) return;

    if (expandable && !expanded) expand();

    setItems((prev) => [...prev, { kind: "msg", who: "me", text: body }]);
    setDraft("");
    setBusy(true);

    try {
      const res = await fetch(`${API}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread, body }),
      });

      if (res.status === 404) {
        // Session aged out on the server; start a fresh one rather than dead-end.
        await start(channel);
        return;
      }

      const data = await res.json();
      if (data.mode) setReplyMode(data.mode);
      if (data.ended || data.mode === "ended") setEnded(true);

      setItems((prev) => [
        ...prev,
        ...(data.events || []).map((e) => ({ kind: "event", event: e })),
        { kind: "msg", who: "agent", text: data.reply },
      ]);
    } catch {
      setItems((prev) => [
        ...prev,
        { kind: "msg", who: "agent", text: "I dropped that one — the demo lost its connection. Try again?" },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const wa = channel === "whatsapp";
  const capped = replyMode === "scripted";

  const shell = (
    <div
      ref={shellRef}
      className={`demo mode-${mode} ${wa ? "is-wa" : "is-sms"} ${expanded ? "is-expanded" : ""}`}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded ? "true" : undefined}
      aria-label={expanded ? "Live demo conversation" : undefined}
    >
      <div className="demo-bar">
        <div className="demo-switch" role="tablist" aria-label="Channel">
          {["sms", "whatsapp"].map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={channel === c}
              className={`demo-switch-btn ${channel === c ? "on" : ""}`}
              onClick={() => channel !== c && setChannel(c)}
            >
              {c === "sms" ? "SMS" : "WhatsApp"}
            </button>
          ))}
        </div>
        {expanded && (
          <button ref={closeRef} className="demo-close" onClick={() => setExpanded(false)}>
            Close
          </button>
        )}
      </div>

      <div className="phone">
        <div className="phone-notch" aria-hidden="true" />
        <header className="phone-head">
          <div className="phone-avatar" aria-hidden="true">A</div>
          <div className="phone-who">
            <strong>Apex Heating &amp; Air</strong>
            <span>{wa ? "WhatsApp Business" : DEMO_PHONE_DISPLAY}</span>
          </div>
          <span className={`phone-live ${replyMode === "live" ? "on" : "off"}`}>
            {replyMode === "live" ? "live" : replyMode === "ended" ? "ended" : "scripted"}
          </span>
        </header>

        <div className="phone-body" ref={listRef}>
          {failed ? (
            <div className="phone-empty">
              <p>The demo server isn't reachable right now.</p>
              <button className="btn btn-ghost" onClick={() => start(channel)}>Try again</button>
            </div>
          ) : (
            <>
              {items.map((it, i) =>
                it.kind === "event" ? (
                  <EventChip key={i} event={it.event} />
                ) : (
                  <div key={i} className={`bubble ${it.who === "me" ? "mine" : "theirs"}`}>
                    {it.text}
                  </div>
                )
              )}
              {busy && (
                <div className="bubble theirs typing" aria-label="typing">
                  <span /><span /><span />
                </div>
              )}
            </>
          )}
        </div>

        <div className="phone-compose">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(draft)}
            placeholder={ended ? "Demo finished — restart below" : "Text her something…"}
            aria-label="Your message"
            maxLength={400}
            disabled={busy || failed || ended}
          />
          <button
            className="phone-send"
            onClick={() => send(draft)}
            disabled={busy || failed || ended || !draft.trim()}
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>

      <div className="demo-prompts">
        {DEMO_PROMPTS.map((p) => (
          <button key={p} className="prompt" onClick={() => send(p)} disabled={busy || ended || failed}>
            {p}
          </button>
        ))}
        <button className="prompt prompt-reset" onClick={() => start(channel)}>Start over</button>
      </div>

      {/* A capped visitor who arrived from an ad is a lead already paid for.
          Give them somewhere to go rather than a apology. */}
      {capped ? (
        <div className="demo-capped">
          <p>
            The live demo has hit its limit for now, so she's answering from a script.
            Book twenty minutes and I'll run the real one with your business's details in it.
          </p>
          <a className="btn btn-primary" href={BOOKING_URL} target="_blank" rel="noreferrer">
            Book a call
          </a>
        </div>
      ) : (
        <p className="demo-note muted">
          Really her, really thinking — on a sandboxed calendar, so nothing you book here is real.
        </p>
      )}
    </div>
  );

  return (
    <>
      {expanded && <div className="demo-hold" style={{ height: holdHeight ?? undefined }} aria-hidden="true" />}
      {expanded && <div className="demo-backdrop" onClick={() => setExpanded(false)} />}
      {shell}
    </>
  );
}
