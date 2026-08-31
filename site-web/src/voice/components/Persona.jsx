import { useEffect, useRef, useState } from "react";
import "./Persona.css";
import {
    DEFAULT_BUSINESS,
    DEMO_AGENT_NAME,
    GREETINGS,
    PERSONA_NAMES,
    PERSONA_POINTS,
    VOICES
} from "../content";
import { useReveal, useSpecular, prefersReducedMotion } from "../useMotion";

/**
 * Prospects kept reading "Gus" as the product rather than the demo line's
 * agent, and assuming they were buying a fixed personality. So the section lets
 * them rebuild the greeting in place — change the name, change the voice, and
 * watch the opening line rewrite itself.
 */
function Persona() {
    const [headRef, headIn] = useReveal();
    const spec = useSpecular();

    const [name, setName] = useState(PERSONA_NAMES[1]);
    const [voiceId, setVoiceId] = useState(VOICES[1].id);
    const [business, setBusiness] = useState(DEFAULT_BUSINESS);

    const voice = VOICES.find((v) => v.id === voiceId);
    const greeting = GREETINGS[voiceId](name || "your agent", business || "your business");

    return (
        <section id="persona" className="persona">
            <div className="shell">
                <header
                    className={"section-head reveal" + (headIn ? " is-in" : "")}
                    ref={headRef}
                >
                    <p className="eyebrow">He doesn't have to be Gus</p>
                    <h2 className="section-title">
                        Your agent. Your name on him, your voice, your script.
                    </h2>
                    <p className="section-sub">
                        {DEMO_AGENT_NAME} is what the demo line answers to. What answers your
                        line is built for your business — named, voiced and scripted with you
                        on the build call. Change the settings below and listen to the
                        greeting move.
                    </p>
                </header>

                <div
                    className="persona-panel glass"
                    ref={spec.ref}
                    onPointerMove={spec.onPointerMove}
                >
                    <div className="persona-controls">
                        <div className="persona-field">
                            <span className="persona-label">Call him</span>
                            <div className="persona-chips">
                                {PERSONA_NAMES.map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        className={"persona-chip" + (n === name ? " is-active" : "")}
                                        onClick={() => setName(n)}
                                        aria-pressed={n === name}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <input
                                className="persona-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value.slice(0, 18))}
                                aria-label="Or type any name"
                                placeholder="or type any name"
                            />
                        </div>

                        <div className="persona-field">
                            <span className="persona-label">Answering for</span>
                            <input
                                className="persona-input is-wide"
                                type="text"
                                value={business}
                                onChange={(e) => setBusiness(e.target.value.slice(0, 34))}
                                aria-label="Your business name"
                                placeholder="your business name"
                            />
                        </div>

                        <div className="persona-field">
                            <span className="persona-label">Voice</span>
                            <div className="persona-voices">
                                {VOICES.map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        className={"persona-voice" + (v.id === voiceId ? " is-active" : "")}
                                        onClick={() => setVoiceId(v.id)}
                                        aria-pressed={v.id === voiceId}
                                    >
                                        <strong>{v.label}</strong>
                                        <em>{v.detail}</em>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="persona-preview">
                        <span className="persona-preview-label">The first thing a caller hears</span>
                        <VoiceBars voice={voice} />
                        <TypedGreeting text={greeting} tint={voice.tint} />
                        <p className="persona-preview-note">
                            Written with you on the build call, then changed whenever you
                            hear something you don't like.
                        </p>
                    </div>
                </div>

                <div className="persona-points">
                    {PERSONA_POINTS.map((point, i) => (
                        <Point key={point.title} point={point} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/** Retypes the greeting whenever the name, business or voice changes. */
function TypedGreeting({ text, tint }) {
    const [shown, setShown] = useState(text);
    const [typing, setTyping] = useState(false);
    const timer = useRef(0);

    useEffect(() => {
        if (prefersReducedMotion()) {
            setShown(text);
            setTyping(false);
            return;
        }

        let i = 0;
        setShown("");
        setTyping(true);

        const step = () => {
            i += 1;
            setShown(text.slice(0, i));
            if (i < text.length) timer.current = setTimeout(step, 18);
            else setTyping(false);
        };

        timer.current = setTimeout(step, 90);
        return () => clearTimeout(timer.current);
    }, [text]);

    /* The caret only exists mid-type. Left up permanently it blinks between the
       question mark and the closing quote, which reads as a stray character. */
    return (
        <p className="persona-greeting" style={{ "--tint": tint }}>
            “{shown}
            {typing && <span className="persona-caret" aria-hidden="true" />}
            ”
        </p>
    );
}

/** The same bar treatment as the hero demo, re-tuned per voice. */
function VoiceBars({ voice }) {
    return (
        <div className="persona-wave" aria-hidden="true">
            {Array.from({ length: 32 }, (_, i) => (
                <span
                    key={i}
                    style={{
                        "--tint": voice.tint,
                        "--delay": `${(i * 0.045).toFixed(3)}s`,
                        "--speed": voice.speed,
                        "--peak": (
                            (0.3 + Math.abs(Math.sin(i * 1.7)) * 0.7) * voice.peak
                        ).toFixed(2)
                    }}
                />
            ))}
        </div>
    );
}

function Point({ point, index }) {
    const [ref, shown] = useReveal({ threshold: 0.2 });

    return (
        <article
            className={"persona-point reveal" + (shown ? " is-in" : "")}
            style={{ "--d": `${(index % 2) * 0.1}s` }}
            ref={ref}
        >
            <h3>{point.title}</h3>
            <p>{point.body}</p>
        </article>
    );
}

export default Persona;
