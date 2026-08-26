import { useEffect, useMemo, useState } from "react";
import "./Navbar.css";
import { BOOKING_URL, DEMO_PHONE_DISPLAY, DEMO_PHONE_HREF } from "../../content";
import { useActiveSection, useScrollY } from "../../hooks/useMotion";

const LINKS = [
    { id: "bleed", label: "The math" },
    { id: "what-it-does", label: "What it does" },
    { id: "persona", label: "Make him yours" },
    { id: "how", label: "Setup" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" }
];

function Navbar() {
    const [open, setOpen] = useState(false);
    const y = useScrollY();
    const ids = useMemo(() => LINKS.map((l) => l.id), []);
    const active = useActiveSection(ids);

    // past the fold the bar frosts over and tightens up
    const condensed = y > 40;

    /* Lock the page while the mobile sheet is open, or the body scrolls behind it. */
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            <header className={"nav" + (condensed ? " is-condensed" : "")}>
                <div className="nav-inner">
                    <a className="nav-brand" href="#home" onClick={() => setOpen(false)}>
                        <span className="nav-mark" aria-hidden="true" />
                        <span className="nav-brand-text">
                            Jimmy
                            <em>Gramlich Software Services</em>
                        </span>
                    </a>

                    <nav className="nav-links" aria-label="Sections">
                        {LINKS.map((link) => (
                            <a
                                key={link.id}
                                href={`#${link.id}`}
                                className={active === link.id ? "is-active" : ""}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="nav-actions">
                        <a className="nav-phone" href={DEMO_PHONE_HREF}>
                            {DEMO_PHONE_DISPLAY}
                        </a>
                        <a className="btn btn-primary nav-cta" href={BOOKING_URL}>
                            Book a call
                        </a>
                        <button
                            type="button"
                            className={"nav-burger" + (open ? " is-open" : "")}
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

            <div
                className={"nav-sheet" + (open ? " is-open" : "")}
                onClick={() => setOpen(false)}
            >
                <nav className="nav-sheet-inner" onClick={(e) => e.stopPropagation()}>
                    {LINKS.map((link, i) => (
                        <a
                            key={link.id}
                            href={`#${link.id}`}
                            style={{ "--i": i }}
                            onClick={() => setOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        className="btn btn-primary btn-block nav-sheet-cta"
                        href={BOOKING_URL}
                        style={{ "--i": LINKS.length }}
                        onClick={() => setOpen(false)}
                    >
                        Book a call
                    </a>
                    <a
                        className="nav-sheet-phone"
                        href={DEMO_PHONE_HREF}
                        style={{ "--i": LINKS.length + 1 }}
                    >
                        Call Jimmy — {DEMO_PHONE_DISPLAY}
                    </a>
                </nav>
            </div>
        </>
    );
}

export default Navbar;
