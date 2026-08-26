import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";
import "./Footer.css";
import { CONTACT_EMAIL, DEMO_PHONE_DISPLAY, DEMO_PHONE_HREF } from "../../content";

function Footer() {
    return (
        <footer className="footer">
            <div className="shell footer-inner">
                <div className="footer-brand">
                    <span className="footer-name">Jimmy</span>
                    <span className="footer-by">
                        by Gramlich Software Services · Calgary, Alberta
                    </span>
                </div>

                <div className="footer-mid">
                    <a href={DEMO_PHONE_HREF}>{DEMO_PHONE_DISPLAY}</a>
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    <a href="https://services.rileygramlich.dev">services.rileygramlich.dev</a>
                </div>

                <div className="footer-social">
                    <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email Riley">
                        <FaEnvelope aria-hidden="true" />
                    </a>
                    <a
                        href="https://github.com/rileygramlich"
                        aria-label="GitHub"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaGithub aria-hidden="true" />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/rileygramlich"
                        aria-label="LinkedIn"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaLinkedin aria-hidden="true" />
                    </a>
                </div>
            </div>

            <p className="footer-legal">
                © {new Date().getFullYear()} Gramlich Software Services. Prices in CAD,
                before GST.
            </p>
        </footer>
    );
}

export default Footer;
