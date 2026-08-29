import "./ProductSwitch.css";

/**
 * The voice/text switch.
 *
 * Looks like a toggle, behaves like navigation. A stateless toggle would mean
 * the text product has no URL — nothing to text a prospect, nothing to point an
 * ad at, nothing for a search engine to index. These are ordinary anchors, so
 * every position on the switch is a real, shareable address.
 *
 * Rendered above each product's own nav, and deliberately not styled from
 * either product's stylesheet: it is the one element that belongs to the site
 * rather than to a product, so it keeps its own colours in both places.
 */
const PRODUCTS = [
  { key: "voice", label: "Voice", href: "/", hint: "Answers the phone" },
  { key: "text", label: "Text", href: "/text", hint: "Answers SMS + WhatsApp" },
  { key: "both", label: "Both", href: "/both", hint: "One agent, both lines" },
];

export default function ProductSwitch({ current }) {
  return (
    <div className="psw">
      <div className="psw-inner" role="navigation" aria-label="Product">
        <span className="psw-label">Gramlich Software Services</span>
        <div className="psw-track">
          {PRODUCTS.map((p) => (
            <a
              key={p.key}
              href={p.href}
              className={`psw-opt psw-${p.key} ${current === p.key ? "on" : ""}`}
              aria-current={current === p.key ? "page" : undefined}
              title={p.hint}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
