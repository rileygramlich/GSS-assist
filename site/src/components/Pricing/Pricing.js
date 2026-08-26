import { useState } from "react";
import "./Pricing.css";
import {
    BOOKING_URL,
    FOUNDING_OFFER,
    OVERAGE_PER_MIN,
    TIERS
} from "../../content";
import { useReveal } from "../../hooks/useMotion";

const money = (n) => "$" + n.toLocaleString("en-CA");

/**
 * Three prices for the same product, because the product is worth different
 * amounts to different businesses. Practice is deliberately not self-serve —
 * a multi-location clinic is a conversation, and the card says so.
 */
function Pricing() {
    const [annual, setAnnual] = useState(false);
    const [headRef, headIn] = useReveal();

    return (
        <section id="pricing" className="pricing">
            <div className="shell">
                <header
                    className={"section-head reveal" + (headIn ? " is-in" : "")}
                    ref={headRef}
                >
                    <p className="eyebrow">Pricing</p>
                    <h2 className="section-title">Priced against the phone, not against an app.</h2>
                    <p className="section-sub">
                        No setup fee and nothing to pay up front. The build is included with
                        every plan, and the monthly rate is set by what your calls are worth.
                        Every plan answers every call — the tiers differ in how much of your
                        operation the agent is wired into.
                    </p>

                    <div className="pricing-toggle" role="group" aria-label="Billing period">
                        <button
                            type="button"
                            className={!annual ? "is-active" : ""}
                            onClick={() => setAnnual(false)}
                            aria-pressed={!annual}
                        >
                            Monthly
                        </button>
                        <button
                            type="button"
                            className={annual ? "is-active" : ""}
                            onClick={() => setAnnual(true)}
                            aria-pressed={annual}
                        >
                            Annual
                            <span className="pricing-toggle-save">2 months free</span>
                        </button>
                    </div>
                </header>

                <div className="pricing-grid">
                    {TIERS.map((tier, i) => (
                        <PlanCard key={tier.id} tier={tier} annual={annual} index={i} />
                    ))}
                </div>

                <div className="pricing-fine">
                    <div className="pricing-fine-item">
                        <h4>The build is included</h4>
                        <p>
                            The intake call, the logic written for your trade, calendar and
                            CRM wiring, and testing on your own line before anything is
                            forwarded. Half a day to a day of work, and none of it is billed
                            separately. You pay your first month when the agent goes live.
                        </p>
                    </div>
                    <div className="pricing-fine-item">
                        <h4>Minutes past your bundle — ${OVERAGE_PER_MIN.toFixed(2)} each</h4>
                        <p>
                            Jimmy never stops answering at the limit. Overage is billed in
                            arrears. Run over two months running and Riley will move you up a
                            tier, because it will be cheaper than the overage.
                        </p>
                    </div>
                    <div className="pricing-fine-item">
                        <h4>Founding client option — {money(FOUNDING_OFFER.base)}/mo + ${FOUNDING_OFFER.perBooking} a booking</h4>
                        <p>{FOUNDING_OFFER.note}</p>
                    </div>
                </div>

                <p className="pricing-footnote">
                    All prices in CAD, before GST. Month to month, cancel with 30 days'
                    notice. Not sure which one fits?{" "}
                    <a href={BOOKING_URL}>Riley will tell you on the call</a> — including if
                    the answer is none of them.
                </p>
            </div>
        </section>
    );
}

function PlanCard({ tier, annual, index }) {
    const [ref, shown] = useReveal({ threshold: 0.12 });

    const price = annual ? Math.round(tier.annual / 12) : tier.monthly;
    const href = annual ? tier.checkout.annual : tier.checkout.monthly;

    return (
        <div
            className={"reveal" + (shown ? " is-in" : "")}
            style={{ "--d": `${index * 0.12}s` }}
            ref={ref}
        >
            <article className={"plan panel" + (tier.popular ? " is-popular" : "")}>
                {tier.popular ? (
                    <span className="plan-badge">Most businesses land here</span>
                ) : (
                    <span className="plan-badge-slot" aria-hidden="true" />
                )}

                <h3 className="plan-name">{tier.name}</h3>
                <p className="plan-blurb">{tier.blurb}</p>

                <div className="plan-price">
                    <span className="plan-price-value tnum">{money(price)}</span>
                    <span className="plan-price-unit">/month</span>
                </div>
                <p className="plan-price-note">
                    {annual
                        ? `${money(tier.annual)} billed yearly · ${money(tier.monthly - price)}/mo saved`
                        : "build included · no setup fee"}
                </p>

                <p className="plan-fit">{tier.fitFor}</p>

                <ul className="plan-includes">
                    {tier.includes.map((item) => (
                        <li key={item}>
                            <CheckIcon />
                            {item}
                        </li>
                    ))}
                </ul>

                <div className="plan-actions">
                    {tier.selfServe ? (
                        <>
                            <a
                                className={"btn btn-block " + (tier.popular ? "btn-primary" : "btn-ghost")}
                                href={href}
                            >
                                Start {tier.name}
                            </a>
                            <a className="plan-alt" href={BOOKING_URL}>
                                or talk to Riley first
                            </a>
                        </>
                    ) : (
                        <>
                            <a className="btn btn-ghost btn-block" href={BOOKING_URL}>
                                Book the scoping call
                            </a>
                            <a className="plan-alt" href={href}>
                                or start {tier.name} now
                            </a>
                        </>
                    )}
                </div>
            </article>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M20 6 9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default Pricing;
