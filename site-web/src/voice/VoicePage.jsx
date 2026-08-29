import "./tokens.css";
import "./App.css";
import Aurora from "./components/Aurora";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Bleed from "./components/Bleed";
import Capabilities from "./components/Capabilities";
import Persona from "./components/Persona";
import Steps from "./components/Steps";
import Pricing from "./components/Pricing";
import Proof from "./components/Proof";
import Faq from "./components/Faq";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ProductSwitch from "../shared/ProductSwitch";

/**
 * The voice product, unchanged from the site that is live today.
 *
 * Order is the argument: the cost of the problem, what solves it, that it is
 * built for you rather than bought off a shelf, how long it takes, the price,
 * who is behind it, then the objections. Pricing deliberately comes after the
 * reader has seen their own bleed figure.
 *
 * Everything here renders inside .p-voice, which carries this product's tokens
 * and scopes its stylesheet away from the text product's.
 */
export default function VoicePage() {
    return (
        <div className="p-voice App">
            <Aurora />
            <ProductSwitch current="voice" />
            <Navbar />
            <main>
                <Hero />
                <Bleed />
                <Capabilities />
                <Persona />
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
