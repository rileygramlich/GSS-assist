import { useEffect, useRef, useState } from "react";
import "./ProductMenu.css";

/**
 * The product switcher, as a dropdown inside each product's existing nav.
 *
 * It began as a full-width bar above the header, which worked but cost every
 * page 46px of permanent chrome for a control most visitors use once or never.
 * A dropdown sits inside the nav row that already exists, so the header is
 * exactly the height it was before the two sites merged.
 *
 * Still ordinary anchors underneath: a stateless toggle would leave the text
 * product without a URL to text a prospect, point an ad at, or index.
 */
const PRODUCTS = [
  { key: "voice", label: "Voice", href: "/", hint: "Answers the phone", dot: "#4dd4ff" },
  { key: "text", label: "Text", href: "/text", hint: "Answers SMS + WhatsApp", dot: "#34e0a1" },
  { key: "both", label: "Both", href: "/both", hint: "One agent, both lines", dot: "#40dad0" },
];

export default function ProductMenu({ current = "voice" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const active = PRODUCTS.find((p) => p.key === current) || PRODUCTS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`pm ${open ? "pm-open" : ""}`} ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className="pm-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pm-dot" style={{ background: active.dot }} aria-hidden="true" />
        <span className="pm-current">{active.label}</span>
        <svg className="pm-caret" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="pm-menu" role="menu">
          {PRODUCTS.map((p) => (
            <a
              key={p.key}
              href={p.href}
              role="menuitem"
              className={`pm-item ${p.key === current ? "on" : ""}`}
              aria-current={p.key === current ? "page" : undefined}
            >
              <span className="pm-dot" style={{ background: p.dot }} aria-hidden="true" />
              <span className="pm-item-text">
                <strong>{p.label}</strong>
                <small>{p.hint}</small>
              </span>
              {p.key === current && <span className="pm-tick" aria-hidden="true">✓</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
