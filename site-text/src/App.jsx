import "./App.css";
import Aurora from "./components/Aurora";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import DemoPage from "./components/DemoPage";
import {
  Channels, Inbound, Outbound, Guardrails, Steps, Pricing, Proof, Faq, Contact, Footer,
} from "./components/Sections";

/**
 * Two pages, no router.
 *
 * A dependency that exists to compare one string is a dependency that has to be
 * upgraded forever. Links are ordinary anchors, so each navigation is a real
 * page load — which is what we want anyway: /demo is an ad landing page, and it
 * should start clean rather than inherit whatever state the marketing page left
 * behind. Both dev and the nginx config fall back to index.html for unknown
 * paths, so deep links work.
 */
function currentPage() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === "/demo" ? "demo" : "home";
}

/**
 * Order is the argument: they already have this problem, here is the thing
 * answering it (try it yourself), here is what it does on the way in, here is
 * what it does on its own, here is why it will not get your number banned,
 * then setup, then price.
 */
export default function App() {
  if (currentPage() === "demo") return <DemoPage />;

  return (
    <>
      <Aurora />
      <Nav />
      <main>
        <Hero />
        <Channels />
        <Inbound />
        <Outbound />
        <Guardrails />
        <Steps />
        <Pricing />
        <Proof />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
