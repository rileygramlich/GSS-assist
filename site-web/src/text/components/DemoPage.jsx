import "./DemoPage.css";
import Aurora from "./Aurora";
import "../tokens.css";
import PhoneDemo from "./PhoneDemo";
import { AGENT_NAME, COMPANY, BOOKING_URL, DEMO_PHONE_DISPLAY, DEMO_PHONE_HREF } from "../content";

/**
 * The funnel target.
 *
 * One job: get a stranger into a conversation with her inside five seconds.
 * No section nav, no pricing, no FAQ — anything that invites reading instead of
 * typing is working against the page. The only exits are booking a call and
 * texting the real line, and both sit below the fold so they cannot compete
 * with the phone for a first glance.
 *
 * This is the link to text a prospect, which is the pitch demonstrating itself.
 */
export default function DemoPage() {
  return (
    <div className="p-text demopage">
      <Aurora />

      <header className="demopage-top">
        <a className="nav-brand" href="/">
          <span className="nav-dot" aria-hidden="true" />
          <span>
            <strong>{AGENT_NAME}</strong>
            <small>{COMPANY}</small>
          </span>
        </a>
        <a className="demopage-back" href="/">What she does →</a>
      </header>

      <main className="demopage-main">
        <div className="demopage-intro">
          <span className="eyebrow">Live demo · SMS + WhatsApp</span>
          <h1>Text her. She's really answering.</h1>
          <p className="lede">
            This is the same agent a client gets — same instructions, same tools. She's
            answering for a made-up Calgary furnace company, on a sandboxed calendar,
            so nothing you book here is real. Try to trip her up.
          </p>
        </div>

        <PhoneDemo mode="page" />
      </main>

      <footer className="demopage-foot">
        <p>Want one that knows your business, your hours and your calendar?</p>
        <div className="demopage-actions">
          <a className="btn btn-primary" href={BOOKING_URL} target="_blank" rel="noreferrer">
            Book 20 minutes
          </a>
          <a className="btn btn-ghost" href={DEMO_PHONE_HREF}>
            Or text {DEMO_PHONE_DISPLAY}
          </a>
        </div>
      </footer>
    </div>
  );
}
