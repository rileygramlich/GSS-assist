/**
 * Every number, price, link and headline the site says out loud lives here, so a
 * copy or pricing change never means hunting through components.
 */

export const BOOKING_URL = "https://calendar.app.google/GqTFUm5e6bbdmGJW9";
export const CONTACT_EMAIL = "gramlichsoftware@gmail.com";

/** The live receptionist line. Callers reach Gus directly — this is the demo. */
export const DEMO_PHONE_DISPLAY = "(587) 316-5050";
export const DEMO_PHONE_HREF = "tel:+15873165050";

/* ------------------------------------------------------------------ pricing --
 * Priced against the client's economics, not against the self-serve AI
 * receptionist market. The benchmark that matters in the room is a human
 * receptionist at $2,800–$4,500/mo, not Rosie at $49.
 *
 * Stripe: live prices in CAD, tax exclusive. Plan only — there is no setup or
 * build fee on any checkout link. Annual is 10 months for 12.
 * Lookup keys (jimmy_core_monthly, jimmy_pro_annual, …) are stable, so prices
 * can be re-pointed in Stripe without touching this file.
 * -------------------------------------------------------------------------- */

/* No one-time fee. The build is included, and the whole business is monthly
   recurring — which puts the churn risk on us, so the copy leans on annual
   prepay rather than on a fee that filters tyre-kickers. */
export const OVERAGE_PER_MIN = 0.75;
export const HUMAN_RECEPTIONIST_LOW = 2800;
export const HUMAN_RECEPTIONIST_HIGH = 4500;

export const TIERS = [
    {
        id: "core",
        name: "Core",
        blurb: "One location, one calendar. The phone rings while you're on the job.",
        monthly: 299,
        annual: 2990,
        minutes: 300,
        popular: false,
        selfServe: true,
        fitFor: "Trades, solo operators, small service businesses",
        includes: [
            "Answers 24/7 — evenings, weekends, statutory holidays",
            "Books straight into your Google Calendar, never double-books",
            "Confirmation text to the caller, summary text to you",
            "Live transfer to your cell when someone asks for a person",
            "300 talk minutes included"
        ],
        checkout: {
            monthly: "https://buy.stripe.com/5kQ8wO90F4rN79J6r19sk08",
            annual: "https://buy.stripe.com/aFafZg6Sx6zVdy75mX9sk09"
        }
    },
    {
        id: "pro",
        name: "Pro",
        blurb: "You have a CRM, an intake process, and money walking out after hours.",
        monthly: 549,
        annual: 5490,
        minutes: 600,
        popular: true,
        selfServe: true,
        fitFor: "HVAC and plumbing, med spas, property management, multi-tech crews",
        includes: [
            "Everything in Core",
            "Writes the lead into your CRM, not just your calendar",
            "Custom intake questions per service type",
            "SMS follow-up on quotes and no-shows",
            "Routes emergencies and different job types to different people",
            "600 talk minutes included"
        ],
        checkout: {
            monthly: "https://buy.stripe.com/cNi14m5OtcYj51B4iT9sk0a",
            annual: "https://buy.stripe.com/3cIbJ02Chf6r0Ll6r19sk0b"
        }
    },
    {
        id: "practice",
        name: "Practice",
        blurb: "Several locations or a regulated intake you cannot get wrong.",
        monthly: 999,
        annual: 9990,
        minutes: 1500,
        popular: false,
        selfServe: false,
        fitFor: "Dental and medical groups, law firms, multi-location operators",
        includes: [
            "Everything in Pro",
            "Custom intake scripts written for your practice area",
            "Multiple locations and per-provider routing",
            "Conflict checks and screening questions before anything is booked",
            "Priority support with a same-day change window",
            "1,500 talk minutes included"
        ],
        checkout: {
            monthly: "https://buy.stripe.com/8x2cN45OtcYj3Xx2aL9sk0c",
            annual: "https://buy.stripe.com/7sY14m2Ch0bx1PpeXx9sk0d"
        }
    }
];

/** Performance-priced entry option. Deliberately not a fourth card — it is offered, not advertised. */
export const FOUNDING_OFFER = {
    base: 199,
    perBooking: 25,
    note: "A lower base rate plus a fee on each appointment the agent actually books, so you are mostly paying for results rather than for access. It out-earns Core once bookings pass about four a month, which is the point. Offered while there are still no case studies to point at — ask on the intro call."
};

/* ------------------------------------------------------- the bleed calculator --
 * The whole pitch in one interaction: missed calls × close rate × job value is
 * what the phone is costing them, and the plan is a fraction of it.
 * -------------------------------------------------------------------------- */

export const VERTICALS = [
    {
        id: "trades",
        label: "Trades",
        detail: "HVAC, plumbing, electrical, roofing",
        missedCalls: 15,
        closeRate: 30,
        jobValue: 600
    },
    {
        id: "clinic",
        label: "Clinic",
        detail: "Dental, med spa, physio, veterinary",
        missedCalls: 20,
        closeRate: 40,
        jobValue: 1200
    },
    {
        id: "legal",
        label: "Law firm",
        detail: "Personal injury, family, immigration",
        missedCalls: 10,
        closeRate: 20,
        jobValue: 4000
    },
    {
        id: "property",
        label: "Property",
        detail: "Condo boards, rentals, maintenance",
        missedCalls: 25,
        closeRate: 25,
        jobValue: 450
    }
];

export const CALC_LIMITS = {
    missedCalls: { min: 2, max: 60, step: 1 },
    closeRate: { min: 5, max: 80, step: 5 },
    jobValue: { min: 100, max: 6000, step: 50 }
};

/** Below this much monthly bleed, Gus costs more than he returns. Say so.
    Set at roughly 3x the entry plan — below that the margin is too thin to be
    worth anyone's trouble, including ours. */
export const DISQUALIFY_BELOW = 900;

/* ------------------------------------------------------------------ persona --
 * "Gus" is the demo agent's name, not the product's. Prospects consistently
 * assume they are buying a fixed personality called Gus, so the site now lets
 * them rename and re-voice him in place.
 * -------------------------------------------------------------------------- */

export const DEMO_AGENT_NAME = "Gus";
export const DEFAULT_BUSINESS = "Apex Heating & Air";

/** Suggestions only — any name works, including a person who already works there. */
export const PERSONA_NAMES = [
    "Gus",
    "Sarah",
    "Marcus",
    "Nadia",
    "Theo",
    "Rosa"
];

export const VOICES = [
    {
        id: "warm",
        label: "Warm and unhurried",
        detail: "Lower pitch, slower pace, lets a caller finish. Suits clinics and anyone whose callers are worried when they ring.",
        tint: "var(--accent-2)",
        peak: 0.62,
        speed: "0.9s"
    },
    {
        id: "brisk",
        label: "Bright and quick",
        detail: "Higher, faster, gets to the booking. Suits trades and dispatch, where the caller wants a time and a truck.",
        tint: "var(--accent)",
        peak: 1,
        speed: "0.55s"
    },
    {
        id: "formal",
        label: "Measured and formal",
        detail: "Even pace, careful diction, no filler. Suits law firms and anything where the intake has to sound exact.",
        tint: "var(--mint)",
        peak: 0.78,
        speed: "0.72s"
    }
];

/** What the agent opens with, per voice. The greeting is written with you, not picked from a list. */
export const GREETINGS = {
    warm:   (name, biz) => `Thanks for calling ${biz}. This is ${name} — what's going on?`,
    brisk:  (name, biz) => `${biz}, this is ${name}. How can I help?`,
    formal: (name, biz) => `Good afternoon, you've reached ${biz}. My name is ${name}. How may I direct your call?`
};

export const PERSONA_POINTS = [
    {
        title: "The name is yours",
        body: "Gus is what the demo line answers to. Your agent can be called anything — a name that fits your area, or the name of the person who used to answer the phone before the business outgrew it."
    },
    {
        title: "The voice is chosen, not assigned",
        body: "Male or female, higher or lower, faster or slower. Riley plays you options on the build call and you pick the one that sounds like it works there. If it grates on you after a week, it gets changed."
    },
    {
        title: "The script is written around your business",
        body: "How the greeting runs, what gets asked before anything is booked, what is never said to a caller, and how a price question gets deflected. That is the part that makes the agent sound like your business rather than a bot, and it is included rather than billed as setup."
    },
    {
        title: "Nobody has to know",
        body: "Most callers do not ask, and your agent never volunteers it. He is not instructed to claim he is human either — if a caller asks him directly, he tells them, because getting caught lying is worse than the question."
    }
];

/* ----------------------------------------------------------------- sections -- */

export const CAPABILITIES = [
    {
        kicker: "Answers",
        title: "He picks up on the first ring",
        body: "No voicemail, no hold music, no phone tree. Two in the afternoon and two in the morning are the same to him, and he sounds like a person rather than a menu.",
        stat: "< 1s",
        statLabel: "to answer"
    },
    {
        kicker: "Qualifies",
        title: "He asks what you would ask",
        body: "The reason for the call, the address, the callback number, whether it's an emergency, and whatever else your trade needs before a truck rolls. Written for your business, not a template.",
        stat: "6–9",
        statLabel: "intake fields"
    },
    {
        kicker: "Books",
        title: "He books it into your real calendar",
        body: "Gus checks live availability before he offers a time, so he cannot double-book you. The appointment is written in with the notes attached before the caller hangs up.",
        stat: "0",
        statLabel: "double-bookings"
    },
    {
        kicker: "Follows up",
        title: "He texts both sides",
        body: "The caller gets a confirmation with the time and what to expect. You get a summary of who called, what they wanted, and whether it needs you. Callers can text the number back and he answers there too.",
        stat: "2",
        statLabel: "texts per call"
    },
    {
        kicker: "Escalates",
        title: "He knows when to get you",
        body: "Ask for a person and the call goes through to your cell without an argument. Same for emergencies and for anyone upset. He never guesses a price and never makes a promise on your behalf.",
        stat: "24/7",
        statLabel: "transfer window"
    },
    {
        kicker: "Reports",
        title: "He shows you what the phone did",
        body: "Every call transcribed and summarised, tagged booked, message, or transferred. At the end of the month you can see what came in, what got booked, and what Gus handed to you.",
        stat: "100%",
        statLabel: "calls logged"
    }
];

export const STEPS = [
    {
        n: "01",
        title: "The intake call",
        time: "About an hour",
        body: "One conversation about how you answer the phone today. Your services, your hours, your service area, your prices if you quote them, the name and voice you want on the agent, and the things you never want a caller told."
    },
    {
        n: "02",
        title: "Riley builds it",
        time: "Same day or next",
        body: "Configured against your calendar and your CRM, with intake questions written for your trade. Included with every plan — this is the work a setup fee would have paid for, and there is no setup fee."
    },
    {
        n: "03",
        title: "You test it yourself",
        time: "As long as you want",
        body: "Call your own agent and try to break it. Tell Riley what it got wrong and it gets fixed. Nothing is forwarded until you are happy with what your callers will hear."
    },
    {
        n: "04",
        title: "You forward your number",
        time: "One minute",
        body: "Your existing number forwards to the agent. You keep the number, there is nothing to port, and you can undo the forward in about a minute if you ever want to."
    }
];

export const PROOF = [
    {
        stat: "5 yrs",
        label: "Full stack engineering, CS degree",
        body: "Riley Gramlich has been building production software for five years and has run Gramlich Software Services out of Calgary since 2024."
    },
    {
        stat: "Ongoing",
        label: "Contract clients, not one-off builds",
        body: "The work that pays the bills is ongoing contract engineering for established organisations — the kind of relationship where you have to still be good in month eighteen."
    },
    {
        stat: "1",
        label: "Person who answers when you call",
        body: "Not a support queue in another time zone. When Gus says something wrong on a Tuesday, you text the person who built him and it is usually fixed the same day."
    }
];

export const FAQS = [
    {
        q: "How is this different from Rosie, Dialzara, or the $49/month AI receptionists?",
        a: "Those are software you configure yourself. Here someone else does it, and keeps doing it. Riley sits down with you, writes the intake questions around your trade, wires the agent into your calendar and your CRM, and then keeps tuning it as you find edge cases. If a self-serve tool at $49 a month genuinely covers what you need, take it — Riley will tell you so on the call. What the monthly fee buys is the configuration and a person who is accountable when it goes wrong."
    },
    {
        q: "There's no setup fee. What's the catch?",
        a: "There isn't one, but here is the honest reasoning. The build is half a day to a day of work, and charging for it mostly just stalled deals with people who would have been good clients. So it is included and the whole thing is monthly. That does mean the risk sits with Riley rather than with you: if you leave after one month, he has done the build for the price of one month. Which is why he will be straight with you on the intro call about whether this fits — signing up a business the agent cannot help is now his problem, not just yours."
    },
    {
        q: "What happens if I go over my included minutes?",
        a: "Gus keeps answering. He does not hit the limit and start dumping people to voicemail, which would defeat the entire point. Minutes past your bundle are billed at $0.75 each on the next invoice. If you run over two months in a row, Riley will tell you the next tier up is cheaper than the overage, because it will be."
    },
    {
        q: "Am I locked into a contract?",
        a: "No. Month to month, cancel with 30 days' notice, and the build is included either way. Annual prepay is optional and gets you twelve months for the price of ten — worth doing if you already know this works for you, and it is the version Riley would rather sell. Your phone number is always yours: you forwarded it, so cancelling means cancelling the forward and calls ring where they used to. Nothing to port back, nothing to unwind."
    },
    {
        q: "What does Gus handle, and what do I still handle?",
        a: "Gus answers, qualifies, books, reschedules, cancels, texts confirmations, and takes messages. He transfers to you when a caller asks for a person, when it's an emergency, or when the question needs an answer he doesn't have. Quoting, following up, and doing the work stay yours. Riley builds and maintains Gus — he is not an answering service and does not talk to your callers."
    },
    {
        q: "Is my business too small for this?",
        a: "Possibly, and that is a real answer rather than a sales move. Run the calculator above. If missed calls are costing you less than about $900 a month, this will cost you more than it returns and Riley will say so on the call rather than sign you up. Salons and small retail with $60 tickets are usually in that bucket."
    },
    {
        q: "What about the calls Gus gets wrong?",
        a: "There will be some, particularly in the first two weeks. Every call is transcribed, so when one goes badly you forward it to Riley and the rule that caused it gets changed. That feedback loop is what the monthly fee buys, and it is the part a self-serve product cannot give you."
    },
    {
        q: "Can I hear him before I commit to anything?",
        a: "Call (587) 316-5050 right now. That is Gus answering his own line, and he will book your intro call with Riley while you're on it. It is the entire product demonstrating itself."
    }
];
