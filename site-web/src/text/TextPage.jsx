import "./tokens.css";
import Aurora from "./components/Aurora";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import {
  Channels, Inbound, Outbound, Guardrails, Steps, Pricing, Proof, Faq, Contact, Footer,
} from "./components/Sections";

/**
 * The text product. Renders inside .p-text, which swaps the accent to green and
 * scopes this stylesheet away from the voice product's.
 */
export default function TextPage() {
  return (
    <div className="p-text">
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
    </div>
  );
}
