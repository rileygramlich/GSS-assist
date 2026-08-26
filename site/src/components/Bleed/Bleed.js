import { useMemo, useState } from "react";
import "./Bleed.css";
import {
    CALC_LIMITS,
    DISQUALIFY_BELOW,
    HUMAN_RECEPTIONIST_HIGH,
    HUMAN_RECEPTIONIST_LOW,
    TIERS,
    VERTICALS
} from "../../content";
import { useCountUp, useReveal, useSpecular } from "../../hooks/useMotion";

const money = (n) =>
    n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

/**
 * The argument the whole site rests on: what the unanswered phone already costs,
 * next to what answering it costs. Picking a vertical loads that industry's
 * typical numbers, and the sliders let a visitor argue with them.
 */
function Bleed() {
    const [verticalId, setVerticalId] = useState(VERTICALS[0].id);
    const [inputs, setInputs] = useState(() => {
        const v = VERTICALS[0];
        return { missedCalls: v.missedCalls, closeRate: v.closeRate, jobValue: v.jobValue };
    });

    const [headRef, headIn] = useReveal();
    const spec = useSpecular();

    const chooseVertical = (v) => {
        setVerticalId(v.id);
        setInputs({ missedCalls: v.missedCalls, closeRate: v.closeRate, jobValue: v.jobValue });
    };

    const set = (key) => (e) =>
        setInputs((prev) => ({ ...prev, [key]: Number(e.target.value) }));

    const monthlyBleed = Math.round(
        inputs.missedCalls * (inputs.closeRate / 100) * inputs.jobValue
    );

    const vertical = VERTICALS.find((v) => v.id === verticalId);

    /* The recommended plan is whichever tier costs under ~20% of the bleed, taking
       the most capable one that still clears that bar. Below the floor, nothing
       is recommended — that visitor should be told to keep their money. */
    const recommended = useMemo(() => {
        if (monthlyBleed < DISQUALIFY_BELOW) return null;
        const affordable = TIERS.filter((t) => t.monthly <= monthlyBleed * 0.2);
        return affordable.length ? affordable[affordable.length - 1] : TIERS[0];
    }, [monthlyBleed]);

    const planCost = recommended ? recommended.monthly : TIERS[0].monthly;
    const kept = Math.max(monthlyBleed - planCost, 0);

    const [bleedRef, bleedValue] = useCountUp(monthlyBleed);
    const [keptRef, keptValue] = useCountUp(kept);

    const viable = monthlyBleed >= DISQUALIFY_BELOW;

    return (
        <section id="bleed" className="bleed">
            <div className="shell">
                <header
                    className={"section-head reveal" + (headIn ? " is-in" : "")}
                    ref={headRef}
                >
                    <p className="eyebrow">The number that decides this</p>
                    <h2 className="section-title">
                        You are not buying software. You are buying back the calls you
                        already lose.
                    </h2>
                    <p className="section-sub">
                        Missed calls × how often you close × what a job is worth. That figure
                        is what the phone costs you every month whether you do anything about
                        it or not. Move the sliders until they look like your business.
                    </p>
                </header>

                <div
                    className="bleed-panel glass"
                    ref={spec.ref}
                    onPointerMove={spec.onPointerMove}
                >
                    <div className="bleed-inputs">
                        <div className="bleed-verticals" role="group" aria-label="Business type">
                            {VERTICALS.map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    className={"bleed-chip" + (v.id === verticalId ? " is-active" : "")}
                                    onClick={() => chooseVertical(v)}
                                    aria-pressed={v.id === verticalId}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                        <p className="bleed-vertical-detail">{vertical.detail}</p>

                        <Slider
                            label="Calls you miss a month"
                            hint="Rings out, voicemail, or after hours"
                            value={inputs.missedCalls}
                            display={String(inputs.missedCalls)}
                            onChange={set("missedCalls")}
                            {...CALC_LIMITS.missedCalls}
                        />
                        <Slider
                            label="How often you win the job"
                            hint="Of the calls you actually answer"
                            value={inputs.closeRate}
                            display={`${inputs.closeRate}%`}
                            onChange={set("closeRate")}
                            {...CALC_LIMITS.closeRate}
                        />
                        <Slider
                            label="What that job is worth"
                            hint="First job, or lifetime value if they come back"
                            value={inputs.jobValue}
                            display={money(inputs.jobValue)}
                            onChange={set("jobValue")}
                            {...CALC_LIMITS.jobValue}
                        />
                    </div>

                    <div className="bleed-result">
                        <div className="bleed-figure" ref={bleedRef}>
                            <span className="bleed-figure-label">Walking out the door</span>
                            <strong className="bleed-figure-value tnum">
                                {money(Math.round(bleedValue))}
                            </strong>
                            <span className="bleed-figure-unit">every month</span>
                            <span className="bleed-figure-year tnum">
                                {money(monthlyBleed * 12)} a year
                            </span>
                        </div>

                        {viable ? (
                            <div className="bleed-verdict">
                                <div className="bleed-row">
                                    <span>Jimmy — {recommended.name}</span>
                                    <strong className="tnum">{money(planCost)}/mo</strong>
                                </div>
                                <div className="bleed-row is-kept" ref={keptRef}>
                                    <span>You keep</span>
                                    <strong className="tnum">
                                        {money(Math.round(keptValue))}/mo
                                    </strong>
                                </div>
                                <div className="bleed-bar" aria-hidden="true">
                                    <span
                                        className="bleed-bar-fill"
                                        style={{
                                            width: `${Math.min((planCost / monthlyBleed) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                                <p className="bleed-bar-note">
                                    The plan is{" "}
                                    <strong>
                                        {Math.round((planCost / monthlyBleed) * 100)}%
                                    </strong>{" "}
                                    of what you are already losing.
                                </p>
                                <a className="btn btn-primary btn-block" href="#pricing">
                                    See the {recommended.name} plan
                                </a>
                            </div>
                        ) : (
                            <div className="bleed-verdict is-disqualified">
                                <h3>Jimmy is the wrong call for you.</h3>
                                <p>
                                    At {money(monthlyBleed)} a month, the plan costs more than
                                    the calls are worth. A cheap self-serve answering app or a
                                    better voicemail greeting will serve you better, and Riley
                                    will say the same thing on a call rather than sign you up.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="bleed-anchor">
                    For scale: a human receptionist in Calgary runs{" "}
                    <strong className="tnum">
                        {money(HUMAN_RECEPTIONIST_LOW)}–{money(HUMAN_RECEPTIONIST_HIGH)}
                    </strong>{" "}
                    a month, works forty hours of the week's hundred and sixty-eight, and
                    takes holidays.
                </p>
            </div>
        </section>
    );
}

function Slider({ label, hint, value, display, onChange, min, max, step }) {
    // fill the track up to the thumb so the control reads as a gauge, not a scrollbar
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <label className="bleed-slider">
            <span className="bleed-slider-head">
                <span className="bleed-slider-label">{label}</span>
                <span className="bleed-slider-value tnum">{display}</span>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                style={{ "--pct": `${pct}%` }}
            />
            <span className="bleed-slider-hint">{hint}</span>
        </label>
    );
}

export default Bleed;
