import { useEffect, useRef, useState } from "react";
import "./Contact.css";
import {
    BOOKING_URL,
    CONTACT_EMAIL,
    DEMO_PHONE_DISPLAY,
    DEMO_PHONE_HREF
} from "../../content";

function Contact() {
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

    const className = "Contact hidden " + (isVisible ? "show" : "");

    return (
        <section ref={targetRef} className={className} id="contact">
            <h2 className="title">See if Jimmy fits</h2>
            <p className="section-subtitle contact-subtitle">
                Thirty minutes, no pitch. Riley will tell you straight if this isn't
                right for your business.
            </p>
            <div className="contact-card">
                <a className="contact-booking" href={BOOKING_URL}>
                    Book a free intro call
                </a>
                <a className="contact-email" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                </a>
                <p className="contact-note">
                    Or hear him yourself first — call{" "}
                    <a href={DEMO_PHONE_HREF}>{DEMO_PHONE_DISPLAY}</a> and book the intro
                    call through Jimmy. That's the whole product, answering his own phone.
                </p>
            </div>
        </section>
    );
}

export default Contact;
