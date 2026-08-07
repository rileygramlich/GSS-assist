import { useEffect, useRef, useState } from "react";
import "./Pricing.css";
import { BOOKING_URL, TIERS } from "../../content";

function Pricing() {
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

    const className = "Pricing hidden " + (isVisible ? "show" : "");

    return (
        <section ref={targetRef} className={className} id="pricing">
            <h2 className="title">Pricing</h2>
            <p className="section-subtitle">
                A setup fee to build Jimmy around how your business actually answers the
                phone, then a flat monthly rate. No per-minute billing surprises.
            </p>
            <div className="pricing-grid">
                {TIERS.map((tier) => (
                    <article
                        className={"pricing-card" + (tier.popular ? " popular" : "")}
                        key={tier.name}
                    >
                        {tier.popular && <span className="pricing-badge">Most popular</span>}
                        <p className="service-kicker">{tier.name}</p>
                        <p className="pricing-blurb">{tier.blurb}</p>
                        <p className="pricing-price">
                            {tier.price}
                            <span className="pricing-price-note">{tier.priceNote}</span>
                        </p>
                        <p className="pricing-setup">{tier.setup} to set up</p>
                        <ul className="pricing-includes">
                            {tier.includes.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        <a className="pricing-cta" href={BOOKING_URL}>
                            Book a free intro call
                        </a>
                    </article>
                ))}
            </div>
            <p className="pricing-note">
                Not sure which one fits? That's what the intro call is for — Riley will
                tell you if Jimmy is wrong for your business.
            </p>
        </section>
    );
}

export default Pricing;
