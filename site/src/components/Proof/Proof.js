import "./Proof.css";
import { BOOKING_URL, PROOF } from "../../content";
import { useReveal } from "../../hooks/useMotion";

/**
 * The "why trust a one-person shop" section. It deliberately makes no claims a
 * prospect cannot check on the intro call — the strongest available proof is
 * that Riley will hand over a client reference and let them ask directly.
 */
function Proof() {
    const [headRef, headIn] = useReveal();

    return (
        <section id="why" className="proof">
            <div className="shell">
                <header
                    className={"section-head reveal" + (headIn ? " is-in" : "")}
                    ref={headRef}
                >
                    <p className="eyebrow">Who you are actually hiring</p>
                    <h2 className="section-title">You get a person, not a portal.</h2>
                    <p className="section-sub">
                        Jimmy is built and run by Riley Gramlich, one developer in Calgary.
                        That is the trade-off on the table, stated plainly: less company
                        behind it, and far more attention on your account.
                    </p>
                </header>

                <div className="proof-grid">
                    {PROOF.map((item, i) => (
                        <ProofCard key={item.label} item={item} index={i} />
                    ))}
                </div>

                <div className="proof-note panel">
                    <div className="proof-note-body">
                        <h3>The honest version of the pitch</h3>
                        <p>
                            Most AI receptionists are a signup form and a help desk in another
                            time zone. Answering services are a room of people reading a script
                            about a trade they have never worked. Either way, when something
                            goes wrong on a Tuesday afternoon you are filing a ticket and
                            waiting.
                        </p>
                        <p>
                            Here you have Riley's number. He builds Jimmy around how you
                            already answer the phone, and when you catch something Jimmy got
                            wrong you tell him and it gets fixed — usually the same day. The
                            flip side is that this is one person, not a company with a
                            support rota, and you should price that risk honestly.
                        </p>
                        <p className="proof-reference">
                            <strong>Want it from someone who isn't him?</strong> Ask on the
                            intro call and Riley will put you in touch with a current client
                            who will tell you what the working relationship is actually like.
                        </p>
                    </div>
                    <a className="btn btn-ghost" href={BOOKING_URL}>
                        Book the intro call
                    </a>
                </div>
            </div>
        </section>
    );
}

function ProofCard({ item, index }) {
    const [ref, shown] = useReveal({ threshold: 0.2 });

    return (
        <article
            className={"proof-card reveal" + (shown ? " is-in" : "")}
            style={{ "--d": `${index * 0.1}s` }}
            ref={ref}
        >
            <strong className="proof-stat">{item.stat}</strong>
            <span className="proof-label">{item.label}</span>
            <p>{item.body}</p>
        </article>
    );
}

export default Proof;
