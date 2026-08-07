import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";
import "./Footer.css";
import { CONTACT_EMAIL } from "../../content";

function Footer() {
    return (
        <footer className="Footer">
            <p className="footer-text">
                © {new Date().getFullYear()} Gramlich Software Services
            </p>
            <p className="footer-text">
                <a className="footer-brand-link" href="https://services.rileygramlich.dev">
                    services.rileygramlich.dev
                </a>
            </p>
            <div className="footer-contact">
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
        </footer>
    );
}

export default Footer;
