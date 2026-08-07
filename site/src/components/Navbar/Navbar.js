import { useState } from "react";
import "./Navbar.css";
import { BOOKING_URL } from "../../content";

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="navbar">
            <a className="navbar-brand" href="#home" onClick={closeMenu}>
                Jimmy — Gramlich Software Services
            </a>
            <button
                className={"hamburger " + (isOpen ? "active" : "")}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div className={"nav-wrapper " + (isOpen ? "open" : "")}>
                <ul className="navbar-links">
                    <li>
                        <a className="nav-link" href="#what-it-does" onClick={closeMenu}>
                            What it does
                        </a>
                    </li>
                    <li>
                        <a className="nav-link" href="#pricing" onClick={closeMenu}>
                            Pricing
                        </a>
                    </li>
                    <li>
                        <a className="nav-link" href="#faq" onClick={closeMenu}>
                            FAQ
                        </a>
                    </li>
                    <li>
                        <a className="nav-link" href="#different" onClick={closeMenu}>
                            Why me
                        </a>
                    </li>
                </ul>
                <a className="nav-cta" href={BOOKING_URL} onClick={closeMenu}>
                    Book a free intro call
                </a>
            </div>
        </nav>
    );
}

export default Navbar;
