import { useEffect, useState } from "react";
import "./Nav.css";
import { NAV, AGENT_NAME, COMPANY, BOOKING_URL } from "../content";

export default function Nav() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${stuck ? "stuck" : ""}`}>
      <div className="wrap nav-inner">
        <a className="nav-brand" href="#top">
          <span className="nav-dot" aria-hidden="true" />
          <span>
            <strong>{AGENT_NAME}</strong>
            <small>{COMPANY}</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Sections">
          {NAV.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <a className="btn btn-primary nav-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
          Book a call
        </a>
      </div>
    </header>
  );
}
