import { useEffect, useState } from "react";
import "./Nav.css";
import { NAV, AGENT_NAME, COMPANY, BOOKING_URL, DEMO_PHONE_DISPLAY, DEMO_PHONE_HREF } from "../content";
import ProductMenu from "../../shared/ProductMenu";

/**
 * Same shape as the voice product's nav, including its mobile behaviour.
 *
 * The links, the CTA and the number move into a sheet on a narrow screen rather
 * than staying in the bar. Leaving them in was what made this header feel
 * congested on a phone: a full-size "Book a call" pill does not belong in a
 * 69px row next to a brand, a switcher and a six-item menu.
 */
export default function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The sheet is a layer over the page: escape closes it, and the page behind
     it must not scroll while it is open. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header className={`nav ${stuck ? "stuck" : ""}`}>
        <div className="wrap nav-inner">
          <a className="nav-brand" href="#top" onClick={() => setOpen(false)}>
            <span className="nav-dot" aria-hidden="true" />
            <span>
              <strong>{AGENT_NAME}</strong>
              <small>{COMPANY}</small>
            </span>
          </a>

          <ProductMenu current="text" />

          <nav className="nav-links" aria-label="Sections">
            {NAV.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>

          <div className="nav-actions">
            <a className="nav-phone" href={DEMO_PHONE_HREF}>{DEMO_PHONE_DISPLAY}</a>
            <a className="btn btn-primary nav-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
              Book a call
            </a>
            <button
              type="button"
              className={`nav-burger ${open ? "is-open" : ""}`}
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-sheet ${open ? "is-open" : ""}`} onClick={() => setOpen(false)}>
        <nav className="nav-sheet-inner" onClick={(e) => e.stopPropagation()}>
          {NAV.map((l, i) => (
            <a key={l.href} href={l.href} style={{ "--i": i }} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a
            className="btn btn-primary btn-block nav-sheet-cta"
            href={BOOKING_URL}
            target="_blank"
            rel="noreferrer"
            style={{ "--i": NAV.length }}
            onClick={() => setOpen(false)}
          >
            Book a call
          </a>
          <a className="nav-sheet-phone" href={DEMO_PHONE_HREF} style={{ "--i": NAV.length + 1 }}>
            Text {AGENT_NAME} — {DEMO_PHONE_DISPLAY}
          </a>
        </nav>
      </div>
    </>
  );
}
