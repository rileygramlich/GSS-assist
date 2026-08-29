import VoicePage from "./voice/VoicePage";
import TextPage from "./text/TextPage";
import BothPage from "./shared/BothPage";
import DemoPage from "./text/components/DemoPage";

/**
 * Four pages, no router.
 *
 * A dependency that exists to compare one string is a dependency that has to be
 * upgraded forever. Links are ordinary anchors, so each navigation is a real
 * page load — which suits this site: the two products carry different design
 * tokens and only one of them mounts at a time, so there is no shared state
 * worth preserving across a switch, and /demo should start clean rather than
 * inherit whatever a marketing page left behind.
 *
 * `/` stays the voice product. Every card, ad and QR code already pointing at
 * the bare domain lands exactly where it did before, and the Stripe checkout
 * paths are untouched.
 */
const ROUTES = {
  "": VoicePage,
  "/text": TextPage,
  "/both": BothPage,
  "/demo": DemoPage,
};

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "");
  const Page = ROUTES[path] || VoicePage;
  return <Page />;
}
