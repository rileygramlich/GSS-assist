import { useEffect, useRef, useState } from "react";
import "./Faq.css";
import { FAQS } from "../../content";

function Faq() {
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

    const className = "Faq hidden " + (isVisible ? "show" : "");

    return (
        <section ref={targetRef} className={className} id="faq">
            <h2 className="title">Questions people ask</h2>
            <p className="section-subtitle">
                The things worth knowing before you hand Jimmy your phone line.
            </p>
            <div className="faq-grid">
                {FAQS.map((faq) => (
                    <article className="faq-card" key={faq.q}>
                        <h3>{faq.q}</h3>
                        <p>{faq.a}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default Faq;
