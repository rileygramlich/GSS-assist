/**
 * Everything Riley needs to fill in or change lives here, so copy edits never
 * mean hunting through components.
 */

export const BOOKING_URL = "https://calendar.app.google/GqTFUm5e6bbdmGJW9";
export const CONTACT_EMAIL = "gramlichsoftware@gmail.com";

/** The live receptionist line. Callers reach Jimmy directly — this is the demo. */
export const DEMO_PHONE_DISPLAY = "(587) 316-5050";
export const DEMO_PHONE_HREF = "tel:+15873165050";

/**
 * Margin check at ~$0.25/min all-in and a ~2.5 min average call (~$0.63/call):
 *   Starter   100 calls ≈ $63 cost   → $199/mo
 *   Standard  300 calls ≈ $188 cost  → $399/mo
 *   Busy      750 calls ≈ $469 cost  → $799/mo
 * Overage is billed at $1.50/call, which covers cost with room and still beats
 * what the human answering services charge per call.
 */
export const TIERS = [
    {
        name: "Starter",
        blurb: "One person, one phone. You're on a job and it keeps ringing.",
        price: "$199",
        priceNote: "per month",
        setup: "$499",
        popular: false,
        includes: [
            "Up to 100 calls a month",
            "Answers 24/7, books into your calendar",
            "Confirmation text to the customer, summary text to you"
        ]
    },
    {
        name: "Standard",
        blurb: "A small crew with steady call volume and after-hours work.",
        price: "$399",
        priceNote: "per month",
        setup: "$499",
        popular: true,
        includes: [
            "Up to 300 calls a month",
            "Everything in Starter, plus customers can text your number",
            "Live transfer to your cell, and after-hours emergency handling"
        ]
    },
    {
        name: "Busy shop",
        blurb: "Multiple crews, more than one service area, phones going all day.",
        price: "$799",
        priceNote: "per month",
        setup: "$899",
        popular: false,
        includes: [
            "Up to 750 calls a month",
            "Everything in Standard, plus transfers to different people by job type",
            "Multiple locations or service areas, and same-day changes when you ask"
        ]
    }
];

export const FAQS = [
    {
        q: "What happens if I go over the calls in my plan?",
        a: "Jimmy keeps answering. He does not stop at your limit and start sending people to voicemail — that would defeat the point of having him. Extra calls are billed at $1.50 each on your next invoice. If you go over two months running, Riley will tell you that the next tier up is cheaper than the overage, because it will be."
    },
    {
        q: "Am I locked into a contract?",
        a: "No. Month to month, cancel with 30 days' notice. The setup fee is one time and covers building Jimmy around your business. Your phone number is always yours: you forwarded it to Jimmy, so you cancel the forward and calls ring where they used to. Nothing to port back, nothing to unwind."
    },
    {
        q: "How fast can this be answering my phone?",
        a: "Setup takes a couple of hours, most of it a conversation about how you answer the phone today — your services, your hours, what you never want said to a caller. After that, you forward your existing number to Jimmy. Forwarding is the low-risk way in: you keep your number and can undo it in a minute."
    },
    {
        q: "What does Jimmy handle, and what do I still handle?",
        a: "Jimmy answers, books, reschedules, cancels, texts confirmations, and takes messages. He transfers the call to you when a caller asks for a person, when it's an emergency, or when the question needs an answer he doesn't have. Your customers stay your customers: quoting, following up, and doing the work are yours. Riley builds and maintains Jimmy and tunes what he says as you find edge cases — he is not an answering service and does not talk to your callers."
    }
];
