import "./App.css";
import Aurora from "./components/Aurora";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import {
  Channels, Inbound, Outbound, Guardrails, Steps, Pricing, Proof, Faq, Contact, Footer,
} from "./components/Sections";

/**
 * Order is the argument: they already have this problem, here is the thing
 * answering it (try it yourself), here is what it does on the way in, here is
 * what it does on its own, here is why it will not get your number banned,
 * then setup, then price.
 */
export default function App() {
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
