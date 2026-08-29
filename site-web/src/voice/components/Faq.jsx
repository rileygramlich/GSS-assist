import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./Faq.css";
import { FAQS } from "../content";
import { useReveal } from "../useMotion";

function Faq() {
    // one open at a time; the first is open on load so the section never looks empty
    const [open, setOpen] = useState(0);
    const [headRef, headIn] = useReveal();

    return (
        <section id="faq" className="faq">
            <div className="shell">
                <header
                    className={"section-head reveal" + (headIn ? " is-in" : "")}
                    ref={headRef}
                >
                    <p className="eyebrow">Before you hand over your line</p>
                    <h2 className="section-title">The questions people actually ask.</h2>
                    <p className="section-sub">
                        Including the two Riley gets asked most and answers against his own
                        interest — whether a $49 tool would do, and whether you are too small
                        for this at all.
                    </p>
                </header>

                <div className="faq-list">
                    {FAQS.map((faq, i) => (
                        <Item
                            key={faq.q}
                            faq={faq}
                            index={i}
                            isOpen={open === i}
                            onToggle={() => setOpen(open === i ? -1 : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function Item({ faq, index, isOpen, onToggle }) {
    const bodyRef = useRef(null);
    const [height, setHeight] = useState(0);
    const [ref, shown] = useReveal({ threshold: 0.1 });

    /* Measure after layout so the open panel animates to a real pixel height
       rather than to `auto`, which does not transition. */
    useLayoutEffect(() => {
        setHeight(isOpen ? bodyRef.current?.scrollHeight ?? 0 : 0);
    }, [isOpen]);

    /* Text reflows when the window narrows, so a panel left open across a resize
       would keep a stale height and clip its own answer. */
    useEffect(() => {
        if (!isOpen) return;
        const el = bodyRef.current;
        if (!el || typeof ResizeObserver === "undefined") return;

        const ro = new ResizeObserver(() => {
            // firstChild is the <p>; the wrapper is height-constrained by us
            const inner = el.firstElementChild;
            if (inner) setHeight(inner.getBoundingClientRect().height);
        });
        ro.observe(el.firstElementChild ?? el);
        return () => ro.disconnect();
    }, [isOpen]);

    return (
        <div
            className={"faq-item reveal" + (shown ? " is-in" : "") + (isOpen ? " is-open" : "")}
            style={{ "--d": `${Math.min(index, 5) * 0.06}s` }}
            ref={ref}
        >
            <button
                type="button"
                className="faq-q"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={`faq-body-${index}`}
            >
                <span>{faq.q}</span>
                <span className="faq-icon" aria-hidden="true">
                    <i />
                    <i />
                </span>
            </button>
            <div
                className="faq-a"
                id={`faq-body-${index}`}
                role="region"
                ref={bodyRef}
                style={{ height }}
            >
                <p>{faq.a}</p>
            </div>
        </div>
    );
}

export default Faq;
