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
 *
 * The titles live here because nginx serves the one index.html for all four
 * paths (`try_files $uri $uri/ /index.html`), so the static markup can only
 * carry a title that is wrong for three of them. They lead with what the page
 * sells rather than with the agent's name: the persona is renamed per client,
 * it kept colliding with other products, and "AI receptionist calgary" is what
 * people actually type into a search box. Nobody searches for the agent.
 */
const ROUTES = {
    "": { Page: VoicePage, title: "AI phone receptionist · Calgary" },
    "/text": { Page: TextPage, title: "AI text receptionist · Calgary" },
    "/both": { Page: BothPage, title: "AI phone + text receptionist · Calgary" },
    /* The funnel target, and the link you text a prospect. Its tab is part of
       the pitch, so it invites rather than labels. */
    "/demo": { Page: DemoPage, title: "Text Kim, our AI receptionist · Calgary" },
};

export default function App() {
    const path = window.location.pathname.replace(/\/+$/, "");
    const { Page, title } = ROUTES[path] || ROUTES[""];

    /* Set during render rather than in an effect: an effect runs after first
       paint, which shows the generic title and then visibly corrects it. The
       assignment is idempotent, so StrictMode's double render costs nothing. */
    document.title = title;

    return <Page />;
}
