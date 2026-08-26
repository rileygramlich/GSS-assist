import "./Steps.css";
import { STEPS } from "../../content";
import { useReveal } from "../../hooks/useMotion";

/**
 * The setup timeline. Each step draws its own connector as it enters, so the
 * line appears to grow down the page as you scroll it.
 */
function Steps() {
    const [headRef, headIn] = useReveal();

    return (
        <section id="how" className="steps">
            <div className="shell">
                <header
                    className={"section-head reveal" + (headIn ? " is-in" : "")}
                    ref={headRef}
                >
                    <p className="eyebrow">Getting live</p>
                    <h2 className="section-title">
                        Live in a day or two, and undone in a minute if you want out.
                    </h2>
                    <p className="section-sub">
                        Nothing touches your live phone line until you have called your own
                        agent, tried to break it, and told Riley what to change. The build is
                        included, so none of this is billed before you have heard it work.
                    </p>
                </header>

                <ol className="steps-list">
                    {STEPS.map((step, i) => (
                        <Step key={step.n} step={step} last={i === STEPS.length - 1} />
                    ))}
                </ol>
            </div>
        </section>
    );
}

function Step({ step, last }) {
    const [ref, shown] = useReveal({ threshold: 0.35 });

    return (
        <li
            className={"step" + (shown ? " is-in" : "") + (last ? " is-last" : "")}
            ref={ref}
        >
            <div className="step-marker">
                <span className="step-n">{step.n}</span>
                {!last && <span className="step-line" />}
            </div>
            <div className="step-body">
                <div className="step-head">
                    <h3>{step.title}</h3>
                    <span className="step-time">{step.time}</span>
                </div>
                <p>{step.body}</p>
            </div>
        </li>
    );
}

export default Steps;
