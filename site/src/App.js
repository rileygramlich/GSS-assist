import "./App.css";
import Aurora from "./components/Aurora/Aurora";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Bleed from "./components/Bleed/Bleed";
import Capabilities from "./components/Capabilities/Capabilities";
import Persona from "./components/Persona/Persona";
import Steps from "./components/Steps/Steps";
import Pricing from "./components/Pricing/Pricing";
import Proof from "./components/Proof/Proof";
import Faq from "./components/Faq/Faq";
import Contact from "./components/Contact/Contact";
import Footer from "./components/Footer/Footer";

/**
 * Order is the argument: the cost of the problem, what solves it, that it is
 * built for you rather than bought off a shelf, how long it takes, the price,
 * who is behind it, then the objections. Pricing deliberately comes after the
 * reader has seen their own bleed figure.
 */
function App() {
    return (
        <div className="App">
            <Aurora />
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

export default App;
