/**
 * All the copy in one place, the way the voice site does it. Changing the
 * product's name, price or claims should never mean going component hunting.
 */

export const AGENT_NAME = "Tess";
export const COMPANY = "Gramlich Software Services";
export const BOOKING_URL = "https://calendar.app.google/GqTFUm5e6bbdmGJW9";
export const CONTACT_EMAIL = "gramlichsoftware@gmail.com";
export const DEMO_PHONE_DISPLAY = "(587) 316-5050";
export const DEMO_PHONE_HREF = "tel:+15873165050";

export const NAV = [
  { label: "Try her", href: "#demo" },
  { label: "What she does", href: "#inbound" },
  { label: "Follow-up", href: "#outbound" },
  { label: "Setup", href: "#setup" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const HERO = {
  eyebrow: "AI text receptionist · SMS + WhatsApp",
  title: ["Your customers", "already text you.", "Nobody's answering."],
  body: `${AGENT_NAME} answers every text and WhatsApp message the moment it lands, asks what you would ask, books the job into your calendar, and chases the ones that go quiet. She is answering the phone below — go ahead and try to trip her up.`,
  points: [
    "Replies in seconds, at 2am, on a Sunday",
    "Books straight into your real calendar",
    "Chases no-shows and quiet leads on her own",
  ],
};

/* Suggested openers for the demo. Deliberately includes an awkward one — the
   point of a live demo is that it survives things a script would not. */
export const DEMO_PROMPTS = [
  "My furnace quit overnight",
  "How much for a new AC?",
  "Are you open Saturday?",
  "I need to move my appointment",
  "just give me a person",
];

export const CHANNELS = [
  {
    key: "sms",
    name: "SMS",
    body: "Your existing business number, or a new one. Nothing to install and nothing for your customer to learn — they text you the way they already would.",
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    body: "The same agent on a WhatsApp Business number, with your name and logo on the profile. For trades with international customers this is often where the work actually comes from.",
  },
];

export const INBOUND = [
  {
    stat: "< 30s",
    label: "to first reply",
    title: "She answers immediately",
    body: "The window where a lead is still yours is minutes wide. A text that sits until morning has already been answered by whoever replied first.",
  },
  {
    stat: "6–9",
    label: "intake fields",
    title: "She asks what you would ask",
    body: "The reason for the job, the address, the callback number, whether it is an emergency. Written for your trade, not a generic form.",
  },
  {
    stat: "0",
    label: "double-bookings",
    title: "She books into your real calendar",
    body: "Live availability is checked before a time is offered, so the slot she gives out is a slot you actually have.",
  },
  {
    stat: "24/7",
    label: "escalation",
    title: "She knows when to get you",
    body: "Gas smell, no heat with a baby in the house, an angry regular, or anyone who just asks for a person — that goes to your phone, not into a queue.",
  },
  {
    stat: "2",
    label: "channels, one thread",
    title: "She works the same on both",
    body: "SMS and WhatsApp run the same agent and the same rules. You configure the business once.",
  },
  {
    stat: "100%",
    label: "logged",
    title: "She shows you what happened",
    body: "Every thread summarised: who texted, what they wanted, what she did, and whether it needs you.",
  },
];

export const OUTBOUND = [
  {
    tag: "The big one",
    title: "Missed-call text-back",
    body: "A call rings out and she texts them inside a minute — before they reach the next name on the list. This one message tends to pay for the whole service.",
    detail: "Waits out a short grace period first, and cancels itself if somebody picks up.",
  },
  {
    tag: "Fewer empty slots",
    title: "Appointment reminders",
    body: "The evening before, on the channel they came in on. Replying to reschedule just works — it is the same agent, so she moves the booking herself.",
    detail: "Skipped when the booking is so close that the confirmation is the reminder.",
  },
  {
    tag: "Rebooked, not lost",
    title: "No-show follow-up",
    body: "They did not turn up. One message, ninety minutes later, that makes rebooking easy instead of asking them to explain themselves.",
    detail: "Cancels the review request automatically — nobody reviews a visit that did not happen.",
  },
  {
    tag: "Compounding",
    title: "Review requests",
    body: "A few hours after the job, with your review link. The asking is the whole difference between a handful of reviews and a page of them.",
    detail: "Only after a visit that actually happened.",
  },
];

export const GUARDRAILS = [
  {
    title: "STOP is honoured instantly",
    body: "On both channels, kept on our side rather than trusted to the carrier, and per-business — unsubscribing from one client does not mute another.",
  },
  {
    title: "Nothing sends at 3am",
    body: "Outbound is fenced into 9am–8pm in your customer's timezone, which is inside every rule that applies in Canada and the US.",
  },
  {
    title: "WhatsApp's 24-hour rule is enforced",
    body: "Outside the window Meta only permits pre-approved templates. She checks before every send rather than getting the number flagged.",
  },
  {
    title: "She never guesses",
    body: "No price, no warranty term, no legal or medical opinion unless it is written in your FAQ — and then quoted exactly, never extrapolated.",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "The intake call",
    time: "About an hour",
    body: "How you answer texts today. Services, hours, service area, what you never want a customer told, and which follow-ups you want her sending.",
  },
  {
    n: "02",
    title: "Riley builds it",
    time: "Same day or next",
    body: "Configured against your calendar, with intake questions written for your trade. Included with every plan — this is the work a setup fee would pay for, and there is no setup fee.",
  },
  {
    n: "03",
    title: "You try to break it",
    time: "As long as you want",
    body: "Text your own agent. Tell Riley what she got wrong and it gets fixed. Nothing points at your real number until you are happy.",
  },
  {
    n: "04",
    title: "Go live",
    time: "One minute",
    body: "Your number starts forwarding texts to her, or WhatsApp points at your business profile. Undoing it takes about as long as setting it up.",
  },
];

export const REGISTRATION_NOTE =
  "Business texting in Canada and the US needs carrier registration (A2P 10DLC) before it can send at volume, and WhatsApp needs Meta's approval on your business profile. Riley files both. Budget a week or two of waiting on the carriers — everything else is ready before that.";

export const TIERS = [
  {
    name: "Replies",
    price: 199,
    tagline: "Inbound only",
    features: [
      "SMS or WhatsApp, your choice",
      "Answers, qualifies, books into your calendar",
      "Escalates to your phone when it should",
      "Thread summaries after every conversation",
      "500 conversations a month",
    ],
  },
  {
    name: "Replies + Chase",
    price: 349,
    tagline: "Inbound and follow-up",
    featured: true,
    features: [
      "Everything in Replies, on both channels",
      "Missed-call text-back",
      "Appointment reminders",
      "No-show follow-up and review requests",
      "1,500 conversations a month",
    ],
  },
  {
    name: "Both lines",
    price: 549,
    tagline: "Text and voice together",
    features: [
      "Everything in Replies + Chase",
      "The voice receptionist on the same number",
      "One agent, one calendar, one summary feed",
      "Priority changes, same-day",
    ],
  },
];

export const OVERAGE_NOTE = "Overage is $0.12 a conversation. A conversation is a thread, not a message.";

export const FAQS = [
  {
    q: "Is the demo on this page actually the product?",
    a: "Yes — same agent, same prompt, same tool definitions as a client's. The only difference is that the calendar and the outgoing texts are sandboxed, so nothing you do here books a real slot or texts a real person. If it hits its daily limit it says so and falls back to a script rather than pretending.",
  },
  {
    q: "Does it work on my existing number?",
    a: "Yes. Most people forward texts from the number they already advertise, which means nothing changes for customers and you can undo it in a minute. Porting the number outright is also possible if you would rather.",
  },
  {
    q: "What happens when she does not know something?",
    a: "She says she will have someone confirm and takes a message. She will not guess a price or invent a policy — the things she is allowed to state are the things you wrote down, quoted as written.",
  },
  {
    q: "Will my customers know it is not a person?",
    a: "Most do not ask. She is not instructed to claim she is human, and if someone asks directly she tells them, because getting caught lying is worse than the question.",
  },
  {
    q: "What about STOP and spam rules?",
    a: "STOP unsubscribes instantly on both channels and is stored per business. Outbound only sends between 9am and 8pm in the customer's timezone. WhatsApp's 24-hour rule is checked before every business-initiated message. Carrier registration is filed for you before anything goes out at volume.",
  },
  {
    q: "Can I turn the follow-ups off?",
    a: "Each of the four is a separate switch, and the timing on each is yours. Plenty of clients run missed-call text-back and nothing else.",
  },
  {
    q: "What if it gets something wrong?",
    a: "Tell Riley and it gets changed, usually the same day. The wording, what she asks, when she escalates — none of it is fixed, and changes are not billed.",
  },
];

export const PROOF = {
  title: "Built and run by one person, on purpose",
  body: `${COMPANY} is Riley Gramlich in Calgary. You are not filing a ticket into a queue — you text the person who built it and it changes. That is the whole advantage of buying this from someone small, and it is why the build is included rather than sold as onboarding.`,
};
