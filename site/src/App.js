import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import WhatItDoes from "./components/WhatItDoes/WhatItDoes";
import Pricing from "./components/Pricing/Pricing";
import Faq from "./components/Faq/Faq";
import Different from "./components/Different/Different";
import Contact from "./components/Contact/Contact";
import Footer from "./components/Footer/Footer";

function App() {
    const [theme, setTheme] = useState(() => {
        const savedTheme = window.localStorage.getItem("gramlich-theme");
        return savedTheme === "light" ? "light" : "dark";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        window.localStorage.setItem("gramlich-theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
    const nextTheme = theme === "dark" ? "Light mode" : "Dark mode";

    return (
        <main className="App">
            <Navbar />
            <div className="main-pages">
                <Home />
                <WhatItDoes />
                <Pricing />
                <Faq />
                <Different />
                <Contact />
            </div>
            <Footer />
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${nextTheme.toLowerCase()}`}
            >
                {nextTheme}
            </button>
        </main>
    );
}

export default App;
