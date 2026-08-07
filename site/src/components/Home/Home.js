import { useEffect, useRef, useState } from "react";
import "./Home.css";
import { BOOKING_URL, DEMO_PHONE_DISPLAY, DEMO_PHONE_HREF } from "../../content";

function Home() {
    const targetRef = useRef();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isVisible) {
                setIsVisible(true);
            }
        });
        observer.observe(targetRef.current);
    }, [isVisible]);

    const className = "Home hidden " + (isVisible ? "show" : "");

    return (
        <section ref={targetRef} className={className} id="home">
            <div className="intro-content">
                <p className="eyebrow">AI phone receptionist · Calgary</p>
                <h1 className="name">The call you miss is the job you lose.</h1>
                <h3 className="one-liner">
                    Jimmy answers your phone every time it rings, books the appointment
                    into your calendar, and texts the customer back before they call
                    someone else.
                </h3>
                <p className="description">
                    For Calgary and Alberta small businesses — trades, clinics, property
                    managers, professional services — where the owner is on a roof, under
                    a sink, or with a client when the phone goes.
                </p>
                <div className="hero-cta-group">
                    <a className="hero-cta" href={BOOKING_URL}>
                        Book a free intro call
                    </a>
                    <a className="hero-secondary-cta" href={DEMO_PHONE_HREF}>
                        Call Jimmy now — {DEMO_PHONE_DISPLAY}
                    </a>
                </div>
                <ul className="hero-points">
                    <li>Answers 24/7, including evenings and weekends</li>
                    <li>Books straight into your Google Calendar</li>
                    <li>Texts you a summary of every call</li>
                    <li>Puts a caller through to a person when it matters</li>
                </ul>
            </div>
        </section>
    );
}

export default Home;
