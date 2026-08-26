import "./Capabilities.css";
import { CAPABILITIES } from "../../content";
import { useReveal, useSpecular } from "../../hooks/useMotion";

function Capabilities() {
    const [headRef, headIn] = useReveal();

    return (
        <section id="what-it-does" className="caps">
            <div className="shell">
                <header
                    className={"section-head reveal" + (headIn ? " is-in" : "")}
                    ref={headRef}
                >
                    <p className="eyebrow">What Jimmy does</p>
                    <h2 className="section-title">
                        Everything a good receptionist does, on the calls that don't need you.
                    </h2>
                    <p className="section-sub">
                        The calls that do need you go to your cell. What follows is configured
                        per business — the questions Jimmy asks a roofing company are not the
                        questions he asks a dental office.
                    </p>
                </header>

                <div className="caps-grid">
                    {CAPABILITIES.map((c, i) => (
                        <Card key={c.kicker} card={c} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function Card({ card, index }) {
    const spec = useSpecular();
    const [ref, shown] = useReveal({ threshold: 0.1 });

    return (
        <div
            className={"reveal" + (shown ? " is-in" : "")}
            style={{ "--d": `${(index % 3) * 0.1}s` }}
            ref={ref}
        >
            <article
                className="cap glass"
                ref={spec.ref}
                onPointerMove={spec.onPointerMove}
            >
                <header className="cap-head">
                    <span className="cap-kicker">{card.kicker}</span>
                    <span className="cap-stat">
                        <strong className="tnum">{card.stat}</strong>
                        <em>{card.statLabel}</em>
                    </span>
                </header>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
            </article>
        </div>
    );
}

export default Capabilities;
