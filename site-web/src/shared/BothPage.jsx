import "./BothPage.css";
import ProductSwitch from "./ProductSwitch";
import { BOOKING_URL, CONTACT_EMAIL, DEMO_PHONE_DISPLAY, DEMO_PHONE_HREF } from "../text/content";

/**
 * The bundle.
 *
 * This page exists because the two products are sold together more often than
 * either is sold alone, and because a prospect who has to assemble the offer
 * from two other pages usually doesn't.
 *
 * Priced above the voice Pro tier rather than level with it. At the same price
 * a bundle that includes everything Pro has plus a second channel makes Pro
 * unsellable, which is a strange thing to do to the tier most people buy.
 */
const BUNDLE_PRICE = 699;

const SPLIT = [
  {
    side: "voice",
    title: "The phone",
    lines: [
      "Answers on the first ring, 24/7",
      "Books into your calendar mid-call",
      "Transfers to your cell when it should",
      "600 talk minutes",
    ],
  },
  {
    side: "text",
    title: "The texts",
    lines: [
      "SMS and WhatsApp, same agent",
      "Missed-call text-back within a minute",
      "Reminders, no-show chase, review requests",
      "1,500 conversations",
    ],
  },
];

const WHY = [
  {
    title: "One calendar, so the two can't collide",
    body: "A caller and a texter cannot be given the same slot, because the same availability is checked before either is offered a time. Two separate services from two vendors cannot promise you that.",
  },
  {
    title: "One agent, so the story doesn't change",
    body: "Same name, same voice, same rules about what it will and won't say. Someone who calls on Tuesday and texts on Thursday is talking to the same receptionist, and it knows it.",
  },
  {
    title: "One summary feed",
    body: "Calls and threads land in the same place, tagged the same way. You read what the phone did today in one list, not two.",
  },
  {
    title: "The channel follows the customer",
    body: "A call that rings out becomes a text. A texter who needs a person gets called. Neither product can do that alone — the handover is the whole point of buying both.",
  },
];

export default function BothPage() {
  return (
    <div className="p-both">
      <div className="both-glow" aria-hidden="true" />
      <ProductSwitch current="both" />

      <main className="both-main">
        <section className="both-hero">
          <span className="both-eyebrow">Both lines · one agent</span>
          <h1>
            Your phone and your texts,
            <br />
            <span className="both-grad">answered by the same person.</span>
          </h1>
          <p className="both-lede">
            Most businesses lose the same job twice — once when the phone rings out, and again
            when the text they sent instead sits until morning. Running one agent across both
            closes both holes, and lets it hand a customer from one to the other.
          </p>
          <div className="both-actions">
            <a className="both-btn both-btn-primary" href={BOOKING_URL} target="_blank" rel="noreferrer">
              Book a call
            </a>
            <a className="both-btn both-btn-ghost" href="/demo">
              Try the text demo
            </a>
          </div>
        </section>

        <section className="both-split">
          {SPLIT.map((s) => (
            <article key={s.side} className={`both-card both-card-${s.side}`}>
              <h2>{s.title}</h2>
              <ul>
                {s.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <a href={s.side === "voice" ? "/" : "/text"} className="both-more">
                What it does in full →
              </a>
            </article>
          ))}
          <div className="both-join" aria-hidden="true">
            <span>+</span>
          </div>
        </section>

        <section className="both-why">
          <h2>What you only get by running both</h2>
          <div className="both-why-grid">
            {WHY.map((w) => (
              <article key={w.title}>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="both-price">
          <div className="both-price-card">
            <span className="both-flag">Both lines</span>
            <div className="both-amount">
              <strong>${BUNDLE_PRICE}</strong>
              <span>/mo</span>
            </div>
            <p className="both-price-note">
              Everything on both pages, on one number if you want it. No setup fee — the build
              is included, the same as it is on either product alone.
            </p>
            <ul>
              <li>600 talk minutes and 1,500 text conversations</li>
              <li>One calendar, one summary feed, one agent</li>
              <li>Missed-call text-back across the two</li>
              <li>Priority changes, same-day</li>
            </ul>
            <a className="both-btn both-btn-primary both-btn-wide" href={BOOKING_URL} target="_blank" rel="noreferrer">
              Book twenty minutes
            </a>
            <p className="both-fine">
              Sold on a call rather than a checkout button — the two channels need configuring
              together, and that is a conversation.
            </p>
          </div>
        </section>

        <section className="both-foot">
          <p>
            Not sure which you need? Text <a href={DEMO_PHONE_HREF}>{DEMO_PHONE_DISPLAY}</a> and
            ask it — or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
