import { useEffect, useRef, useState } from "react";
import "./WhatItDoes.css";

const CARDS = [
    {
        kicker: "Answers",
        title: "He picks up every time",
        body: "No voicemail, no hold music, no busy signal. Jimmy answers on the first ring at two in the afternoon and at two in the morning, and he sounds like a person, not a phone menu."
    },
    {
        kicker: "Books",
        title: "He books the job",
        body: "Jimmy checks your real calendar before he offers a time, so he never double-books you. He gets the reason for the visit, the name, the callback number, and the address, then writes the appointment straight into your Google Calendar."
    },
    {
        kicker: "Texts",
        title: "He texts everyone back",
        body: "The customer gets a confirmation text with their appointment time. You get a text with who called, what they wanted, and whether you need to do anything about it. People can text your number too, and he answers there the same way."
    },
    {
        kicker: "Hands off",
        title: "He knows when to get you",
        body: "Ask for a person and Jimmy puts the call through to your cell, no argument. Same for emergencies and upset customers. Anything he doesn't have a real answer to, he takes a message and texts it to you. He never guesses at a price or makes a promise on your behalf."
    }
];

function WhatItDoes() {
    const targetRef = useRef();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isVisible) {
                setIsVisible(true);
            }
        });
        observer.observe(targetRef.current);
    }, [isVisible]);

    const className = "WhatItDoes hidden " + (isVisible ? "show" : "");

    return (
        <section ref={targetRef} className={className} id="what-it-does">
            <h2 className="title">What Jimmy does</h2>
            <p className="section-subtitle">
                He handles the calls that don't need you, and gets you the ones that
                do. Exactly what he does is set up around your business.
            </p>
            <div className="service-grid">
                {CARDS.map((card) => (
                    <article className="service-card" key={card.kicker}>
                        <p className="service-kicker">{card.kicker}</p>
                        <h3>{card.title}</h3>
                        <p>{card.body}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default WhatItDoes;
