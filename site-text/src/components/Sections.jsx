import { useState } from "react";
import "./Sections.css";
import {
  CHANNELS, INBOUND, OUTBOUND, GUARDRAILS, STEPS, REGISTRATION_NOTE,
  TIERS, OVERAGE_NOTE, FAQS, PROOF, AGENT_NAME, COMPANY,
  BOOKING_URL, CONTACT_EMAIL, DEMO_PHONE_DISPLAY, DEMO_PHONE_HREF,
} from "../content";

function Head({ eyebrow, title, body }) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {body && <p className="lede">{body}</p>}
    </div>
  );
}

export function Channels() {
  return (
    <section id="channels">
      <div className="wrap">
        <Head
          eyebrow="Two channels, one agent"
          title="Wherever they already message you."
          body="You configure the business once. She behaves the same on both, and a customer who starts on one does not have to start over on the other."
        />
        <div className="grid-2">
          {CHANNELS.map((c) => (
            <article key={c.key} className={`card channel channel-${c.key}`}>
              <span className="channel-tag">{c.name}</span>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Inbound() {
  return (
    <section id="inbound">
      <div className="wrap">
        <Head
          eyebrow={`What ${AGENT_NAME} does`}
          title="Everything a good receptionist does, in a thread."
          body="All of it configured per business — what she asks a heating company is not what she asks a dental office."
        />
        <div className="grid-3">
          {INBOUND.map((c) => (
            <article key={c.title} className="card feature">
              <div className="feature-stat">
                <strong>{c.stat}</strong>
                <span>{c.label}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Outbound() {
  return (
    <section id="outbound">
      <div className="wrap">
        <Head
          eyebrow="When she goes first"
          title="The follow-up nobody in a busy shop has time to do."
          body="Answering is table stakes. The money is in the messages that go out on their own — the ones you mean to send and never do."
        />
        <div className="grid-2">
          {OUTBOUND.map((o) => (
            <article key={o.title} className="card trigger">
              <span className="trigger-tag">{o.tag}</span>
              <h3>{o.title}</h3>
              <p>{o.body}</p>
              <p className="trigger-detail">{o.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Guardrails() {
  return (
    <section id="guardrails" className="band">
      <div className="wrap">
        <Head
          eyebrow="Why this will not get your number banned"
          title="The boring parts, done properly."
          body="Business texting is regulated, and the penalty for getting it wrong is your number being blocked by the carriers. These are not settings you have to think about."
        />
        <div className="grid-2 guardrails">
          {GUARDRAILS.map((g) => (
            <article key={g.title} className="guardrail">
              <h3>{g.title}</h3>
              <p>{g.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Steps() {
  return (
    <section id="setup">
      <div className="wrap">
        <Head
          eyebrow="Getting live"
          title="Live in a day or two, undone in a minute."
          body="Nothing points at your real number until you have texted your own agent, tried to break it, and told Riley what to change."
        />
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="steps-n">{s.n}</span>
              <div>
                <h3>
                  {s.title} <em>{s.time}</em>
                </h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="note">{REGISTRATION_NOTE}</p>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="pricing">
      <div className="wrap">
        <Head
          eyebrow="Pricing"
          title="One number, everything included."
          body="No setup fee, no per-seat anything. The build is part of the price because the build is the product."
        />
        <div className="grid-3 tiers">
          {TIERS.map((t) => (
            <article key={t.name} className={`card tier ${t.featured ? "featured" : ""}`}>
              {t.featured && <span className="tier-flag">Most take this</span>}
              <h3>{t.name}</h3>
              <p className="tier-tagline">{t.tagline}</p>
              <div className="tier-price">
                <strong>${t.price}</strong>
                <span>/mo</span>
              </div>
              <ul>
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a
                className={`btn ${t.featured ? "btn-primary" : "btn-ghost"} tier-cta`}
                href={BOOKING_URL}
                target="_blank"
                rel="noreferrer"
              >
                Start with {t.name}
              </a>
            </article>
          ))}
        </div>
        <p className="note">{OVERAGE_NOTE}</p>
      </div>
    </section>
  );
}

export function Proof() {
  return (
    <section id="proof" className="band">
      <div className="wrap proof">
        <h2>{PROOF.title}</h2>
        <p className="lede">{PROOF.body}</p>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq">
      <div className="wrap">
        <Head eyebrow="Objections" title="The questions people actually ask." />
        <div className="faq">
          {FAQS.map((f, i) => (
            <article key={f.q} className={`faq-item ${open === i ? "open" : ""}`}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span>{f.q}</span>
                <span className="faq-mark" aria-hidden="true">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p>{f.a}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact">
      <div className="wrap contact">
        <h2>See it answer your own awkward questions.</h2>
        <p className="lede">
          Twenty minutes, no deck. Tell me how people text your business today and I will tell you
          straight whether this is worth it for you.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href={BOOKING_URL} target="_blank" rel="noreferrer">
            Book a call
          </a>
          <a className="btn btn-ghost" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
        <p className="muted" style={{ marginTop: "1rem" }}>
          Or just text <a href={DEMO_PHONE_HREF} style={{ color: "var(--accent)" }}>{DEMO_PHONE_DISPLAY}</a> and
          see what happens.
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>
          {AGENT_NAME} — {COMPANY}, Calgary
        </span>
        <span className="muted">Reply STOP to any message to unsubscribe.</span>
      </div>
    </footer>
  );
}
