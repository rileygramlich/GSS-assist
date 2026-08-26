import "./Hero.css";
import CallDemo from "../CallDemo/CallDemo";
import { useMagnetic } from "../../hooks/useMotion";
import { DEMO_PHONE_DISPLAY, DEMO_PHONE_HREF } from "../../content";

function Hero() {
    const primary = useMagnetic(0.22);
    const secondary = useMagnetic(0.18);

    return (
        <section className="hero" id="home">
            <div className="shell hero-shell">
                <div className="hero-copy">
                    <p className="eyebrow hero-stagger" style={{ "--i": 0 }}>
                        AI phone receptionist · Calgary
                    </p>

                    <h1 className="hero-title hero-stagger" style={{ "--i": 1 }}>
                        The call you miss is
                        <br />
                        <span className="hero-title-accent">the job you lose.</span>
                    </h1>

                    <p className="hero-lede hero-stagger" style={{ "--i": 2 }}>
                        Jimmy answers your phone every time it rings, qualifies the caller,
                        books the appointment into your calendar, and texts them back before
                        they get to the next name on the list.
                    </p>

                    <div className="hero-ctas hero-stagger" style={{ "--i": 3 }}>
                        <a
                            className="btn btn-primary btn-lg"
                            href={DEMO_PHONE_HREF}
                            ref={primary.ref}
                            onPointerMove={primary.onPointerMove}
                            onPointerLeave={primary.onPointerLeave}
                        >
                            <PhoneIcon />
                            Call Jimmy — {DEMO_PHONE_DISPLAY}
                        </a>
                        <a
                            className="btn btn-ghost btn-lg"
                            href="#pricing"
                            ref={secondary.ref}
                            onPointerMove={secondary.onPointerMove}
                            onPointerLeave={secondary.onPointerLeave}
                        >
                            See what it costs
                        </a>
                    </div>

                    <p className="hero-note hero-stagger" style={{ "--i": 4 }}>
                        That number is Jimmy answering his own line. He will book your intro
                        call while you're on it.
                    </p>

                    <ul className="hero-marks hero-stagger" style={{ "--i": 5 }}>
                        <li>Built around your business, not a template</li>
                        <li>Live on your number in a day or two</li>
                        <li>Cancel the forward and it's undone in a minute</li>
                    </ul>
                </div>

                <div className="hero-demo hero-stagger" style={{ "--i": 3 }}>
                    <CallDemo />
                </div>
            </div>

            <a className="hero-scroll" href="#bleed" aria-label="Scroll to the cost calculator">
                <span className="hero-scroll-line" />
            </a>
        </section>
    );
}

function PhoneIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default Hero;
