import { useEffect, useRef, useState } from "react";
import "./Different.css";

function Different() {
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

    const className = "Different hidden " + (isVisible ? "show" : "");

    return (
        <section ref={targetRef} className={className} id="different">
            <h2 className="title">You get a person, not a portal</h2>
            <p className="section-subtitle">
                Jimmy is built and run by Riley Gramlich, one developer in Calgary.
            </p>
            <div className="different-top">
                <div className="different-bio">
                    <p className="different-copy">
                        Most AI receptionists are a signup form and a help desk in another
                        time zone. Call centers are a room of people reading a script about
                        a trade they've never worked. Either way, when something goes wrong
                        on a Tuesday you're filing a ticket.
                    </p>
                    <p className="different-copy">
                        Here you have Riley's number. He sets Jimmy up around how you
                        already answer the phone — your services, your hours, the things
                        you never want a caller told — and when you spot something Jimmy
                        got wrong, you tell him and he fixes it. Usually same day.
                    </p>
                    <p className="different-copy">
                        Riley is a full stack software engineer with a computer science
                        degree and five years behind him, running Gramlich Software
                        Services out of Calgary since 2024. He does ongoing contract
                        work for UrbanTec Property
                        Management, a Calgary condo management company, along with
                        ongoing work for a post-secondary institution. If you want to
                        hear it from someone who isn't him, ask on the call and he'll
                        put you in touch with a Calgary realtor he works with.
                    </p>
                </div>
                <aside className="capability-list">
                    <h4>How setup goes</h4>
                    <ul>
                        <li>A conversation about how you answer the phone today</li>
                        <li>Riley builds Jimmy around your services and hours</li>
                        <li>You test him yourself and say what to change</li>
                        <li>Forward your existing number when you're happy</li>
                        <li>Undo the forward in a minute if you're not</li>
                    </ul>
                </aside>
            </div>
        </section>
    );
}

export default Different;
