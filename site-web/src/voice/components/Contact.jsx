import "./Contact.css";
import {
    BOOKING_URL,
    CONTACT_EMAIL,
    DEMO_PHONE_DISPLAY,
    DEMO_PHONE_HREF
} from "../content";
import { useReveal } from "../useMotion";

function Contact() {
    const [ref, shown] = useReveal({ threshold: 0.2 });

    return (
        <section id="contact" className="contact">
            <div className="shell">
                <div
                    className={"contact-card reveal" + (shown ? " is-in" : "")}
                    ref={ref}
                >
                    <div className="contact-inner">
                        <p className="eyebrow">Thirty minutes, no pitch</p>
                        <h2 className="contact-title">
                            Find out if Gus is worth it for your business.
                        </h2>
                        <p className="contact-sub">
                            Riley will run your numbers on the call. If the phone isn't costing
                            you enough to justify this, he will tell you that instead of
                            selling you something.
                        </p>

                        <div className="contact-actions">
                            <a className="btn btn-primary btn-lg" href={BOOKING_URL}>
                                Book the intro call
                            </a>
                            <a className="btn btn-ghost btn-lg" href={DEMO_PHONE_HREF}>
                                Or call Gus — {DEMO_PHONE_DISPLAY}
                            </a>
                        </div>

                        <p className="contact-email">
                            Prefer email?{" "}
                            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Contact;
