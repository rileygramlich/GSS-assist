import "./Hero.css";
import PhoneDemo from "./PhoneDemo";
import { HERO, BOOKING_URL, DEMO_PHONE_DISPLAY, DEMO_PHONE_HREF } from "../content";

/**
 * The demo sits in the hero rather than further down the page on purpose. The
 * single most persuasive thing available is letting someone try it in the first
 * ten seconds, and a demo below the fold is a demo most visitors never reach.
 */
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">{HERO.eyebrow}</span>
          <h1>
            {HERO.title.map((line, i) => (
              <span key={i} className={i === HERO.title.length - 1 ? "hero-accent" : ""}>
                {line}
                <br />
              </span>
            ))}
          </h1>

          <p className="lede hero-lede">{HERO.body}</p>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#demo">Try her now</a>
            <a className="btn btn-ghost" href={BOOKING_URL} target="_blank" rel="noreferrer">
              Book a call
            </a>
          </div>

          <p className="muted hero-sub">
            Or text the real one: <a href={DEMO_PHONE_HREF}>{DEMO_PHONE_DISPLAY}</a>
            <span className="hero-sep" aria-hidden="true">·</span>
            <a href="/demo">full-screen demo</a>
          </p>

          <ul className="hero-points">
            {HERO.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="hero-demo" id="demo">
          <PhoneDemo />
        </div>
      </div>
    </section>
  );
}
