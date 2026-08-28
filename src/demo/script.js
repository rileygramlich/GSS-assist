/**
 * What the demo says once a limit is hit.
 *
 * This exists so a capped visitor sees a working product rather than an error.
 * It is a decision tree, and it is honest about being one — the reply tells
 * them the live demo is resting and offers the real number, because a prospect
 * who catches a "live" demo being canned has learned something worse about us
 * than that we rate-limit.
 */

const RULES = [
  {
    match: /\b(book|appointment|schedule|come out|send someone|availability|available)\b/i,
    reply: (biz) =>
      `I can get someone out to you — the next opening is tomorrow morning between 8 and 10. Can I take your name and the best number to reach you? (The live demo is resting right now, so this part is scripted. Call ${biz.demoPhone} to talk to the real one.)`,
  },
  {
    match: /\b(emergency|urgent|flood|leak|gas|burst|no heat|freezing)\b/i,
    reply: (biz) =>
      `That sounds urgent — I'd get a person on this straight away rather than book it. (Scripted reply: the live demo has hit its limit for now. Call ${biz.demoPhone} to hear the real thing handle this.)`,
  },
  {
    match: /\b(price|cost|how much|quote|charge|rate)\b/i,
    reply: () =>
      `I don't quote prices over text — a tech confirms that on site once they've seen the job. I can get you booked in for a free quote though. (Scripted: the live demo is resting.)`,
  },
  {
    match: /\b(hours|open|closed|when are you)\b/i,
    reply: () => `We're open weekdays 8 to 5, and I pick up texts any time. (Scripted: the live demo is resting.)`,
  },
  {
    match: /\b(human|person|someone|real|manager|talk to)\b/i,
    reply: (biz) =>
      `Of course — I'll have someone call you. What's the best number? (Scripted: the live demo has hit its limit. ${biz.demoPhone} reaches a real one.)`,
  },
];

const OPENER = (biz) => `${biz.name}, this is ${biz.receptionistName}. What can I help you with?`;

const FALLBACK = (biz) =>
  `I've hit my limit for the moment, so I'm answering from a script rather than thinking. Text ${biz.demoPhone} and you'll get the real agent, or ask me about booking, hours, or pricing and I'll do my best from here.`;

export function scriptedReply(biz, body, turnIndex = 0) {
  if (turnIndex === 0 && !String(body || "").trim()) return OPENER(biz);
  for (const rule of RULES) {
    if (rule.match.test(String(body || ""))) return rule.reply(biz);
  }
  return FALLBACK(biz);
}

export const __test = { RULES, OPENER, FALLBACK };
