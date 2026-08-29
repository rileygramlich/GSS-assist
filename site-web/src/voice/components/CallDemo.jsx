import { useEffect, useMemo, useRef, useState } from "react";
import "./CallDemo.css";
import { prefersReducedMotion } from "../useMotion";

/**
 * The product demonstrating itself: a call plays out in a phone frame while the
 * waveform reacts to whoever is talking and the appointment writes itself into
 * the calendar beside it.
 *
 * The script is deliberately an ordinary Tuesday-afternoon call — a furnace that
 * quit — because the point is competence, not novelty.
 */
const SCRIPT = [
    { who: "jimmy", text: "Apex Heating and Air, this is Jimmy. How can I help?" },
    { who: "caller", text: "My furnace quit overnight. It's freezing in here." },
    { who: "jimmy", text: "That's no good. Is anyone in the house at risk from the cold right now?" },
    { who: "caller", text: "No, it's just me and I've got a space heater going." },
    { who: "jimmy", text: "Okay. I can get a tech out tomorrow morning between 8 and 10. Does that work?" },
    { who: "caller", text: "Yeah, that's great." },
    { who: "jimmy", text: "Booked. Can I get the address and a good callback number?", books: true },
    { who: "caller", text: "1412 Riverbend Drive Southeast. 403-555-0148." },
    { who: "jimmy", text: "You're all set. I'll text you the confirmation now.", texts: true }
];

const TYPE_MS = 26;      // per character
const HOLD_MS = 620;     // pause after a line lands
const RESTART_MS = 3400; // pause before the call replays

function CallDemo() {
    const [turn, setTurn] = useState(0);
    const [typed, setTyped] = useState("");
    const [booked, setBooked] = useState(false);
    const [texted, setTexted] = useState(false);
    const [running, setRunning] = useState(true);

    const logRef = useRef(null);
    const timers = useRef([]);

    const reduced = useMemo(() => prefersReducedMotion(), []);

    /* Reduced motion gets the finished state immediately — the transcript is the
       content, so it must be readable without the animation ever running. */
    useEffect(() => {
        if (!reduced) return;
        setTurn(SCRIPT.length);
        setTyped("");
        setBooked(true);
        setTexted(true);
        setRunning(false);
    }, [reduced]);

    /* Pause the whole thing when it scrolls away — no point burning frames on a
       transcript nobody is looking at. */
    useEffect(() => {
        if (reduced) return;
        const el = logRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => setRunning(e.isIntersecting),
            { threshold: 0.2 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [reduced]);

    useEffect(() => {
        if (reduced || !running) return;

        const clear = () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };

        // the call has finished — hold the completed state, then start over
        if (turn >= SCRIPT.length) {
            timers.current.push(
                setTimeout(() => {
                    setTurn(0);
                    setTyped("");
                    setBooked(false);
                    setTexted(false);
                }, RESTART_MS)
            );
            return clear;
        }

        const line = SCRIPT[turn];
        let i = 0;

        const typeNext = () => {
            i += 1;
            setTyped(line.text.slice(0, i));
            if (i < line.text.length) {
                timers.current.push(setTimeout(typeNext, TYPE_MS));
                return;
            }
            // line finished: fire its side effect, commit it, move on
            if (line.books) setBooked(true);
            if (line.texts) setTexted(true);
            timers.current.push(
                setTimeout(() => {
                    setTyped("");
                    setTurn((t) => t + 1);
                }, HOLD_MS)
            );
        };

        timers.current.push(setTimeout(typeNext, 260));
        return clear;
    }, [turn, running, reduced]);

    const settled = SCRIPT.slice(0, turn);
    const active = turn < SCRIPT.length ? SCRIPT[turn] : null;
    const speaking = active ? active.who : null;

    return (
        <div className="calldemo glass">
            <header className="calldemo-bar">
                <span className="calldemo-live">
                    <span className="calldemo-dot" />
                    {active ? "On a call" : "Call ended"}
                </span>
                <span className="calldemo-num">(587) 316-5050</span>
            </header>

            <Waveform speaking={speaking} />

            <div className="calldemo-log" ref={logRef}>
                {settled.map((line, i) => (
                    <p className={`calldemo-line is-${line.who}`} key={`${i}-${line.text}`}>
                        <span className="calldemo-who">
                            {line.who === "jimmy" ? "Jimmy" : "Caller"}
                        </span>
                        {line.text}
                    </p>
                ))}

                {active && (
                    <p className={`calldemo-line is-${active.who} is-typing`}>
                        <span className="calldemo-who">
                            {active.who === "jimmy" ? "Jimmy" : "Caller"}
                        </span>
                        {typed}
                        <span className="calldemo-caret" />
                    </p>
                )}
            </div>

            <div className="calldemo-out">
                <div className={"calldemo-slot" + (booked ? " is-set" : "")}>
                    <span className="calldemo-slot-label">Google Calendar</span>
                    <strong className="calldemo-slot-value">
                        {booked ? "Tue 8:00–10:00 · Furnace no-heat" : "Checking availability…"}
                    </strong>
                </div>
                <div className={"calldemo-slot" + (texted ? " is-set" : "")}>
                    <span className="calldemo-slot-label">SMS</span>
                    <strong className="calldemo-slot-value">
                        {texted ? "Confirmation sent · summary to you" : "Waiting on the booking…"}
                    </strong>
                </div>
            </div>
        </div>
    );
}

/**
 * Twenty-eight bars on staggered loops. Whoever is speaking drives the class, so
 * the amplitude visibly changes hands mid-call — the animation is CSS, and React
 * only ever swaps one class name.
 */
function Waveform({ speaking }) {
    const bars = useMemo(
        () =>
            Array.from({ length: 28 }, (_, i) => ({
                delay: (i * 0.055).toFixed(3),
                // a fixed pseudo-random height per bar keeps the shape stable across renders
                scale: (0.35 + Math.abs(Math.sin(i * 1.7)) * 0.65).toFixed(2)
            })),
        []
    );

    return (
        <div className={"wave is-" + (speaking || "idle")} aria-hidden="true">
            {bars.map((b, i) => (
                <span
                    key={i}
                    className="wave-bar"
                    style={{ "--delay": `${b.delay}s`, "--peak": b.scale }}
                />
            ))}
        </div>
    );
}

export default CallDemo;
