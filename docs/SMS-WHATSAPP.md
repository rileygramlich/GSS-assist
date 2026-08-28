# Tess — the text receptionist

The second product. Same agent, same prompt, same tools as the voice
receptionist; different front door and a lot more that happens on its own.

Where the voice product waits for the phone to ring, this one also starts
conversations: a missed call gets texted back, a booking gets reminded, a
no-show gets chased, a finished job gets asked for a review.

---

## What's here

```
src/
  server-text.js        entrypoint — webhooks, demo API, scheduler boot
  threads.js            channel-agnostic thread state (was sms.js, generalised)
  channels/
    index.js            transport registry + webhook routing
    sms.js              Twilio SMS
    whatsapp.js         Twilio WhatsApp, incl. the 24-hour window rules
  outbound/
    scheduler.js        durable job queue: quiet hours, retries, opt-out gate
    triggers.js         the four outbound moments
    optout.js           STOP/START/HELP + per-business suppression list
  demo/
    router.js           the public demo API
    sandbox.js          fake calendar + fake sends
    limits.js           per-visitor and per-day ceilings
    script.js           what it says once a ceiling is hit
    demo-business.json  the fictional business the demo answers for

site-text/              the landing page, with the live demo in the hero
business.text.example.json
```

The conversation layer (`src/prompt.js`, `src/agent.js`, `src/tools/`) is
withheld from the public repo, exactly as on `main`. This branch depends on one
small addition to it, described under **Agent interface** below.

---

## Running it

```bash
npm install
cp .env.example .env          # same keys as the voice product
node src/server-text.js       # :3001 by default

cd site-text && npm install && npm run dev   # :5174, proxies /api to :3001
```

The site's dev proxy expects the text server on `localhost:3101`; change it in
`site-text/vite.config.js` or run with `PORT=3101`.

### Agent interface

`Conversation` needs two things this branch added:

- `new Conversation(biz, call, { runTool })` — an optional tool runner, so the
  demo can swap in the sandbox. Defaults to the real one.
- `convo.lastTurnText()` — the text of the final tool hop.

That second one is a **bug fix, not a feature**. `respondTo` streams text from
every hop, and the old text path joined all of them. When the model says a line,
calls a tool, then restates after seeing the result, the customer got the
sentence twice, stuck together. Voice never hit this because ConversationRelay
speaks each hop as it streams. If you are backporting anything to `main`, this
is the piece worth taking.

---

## Channels

Both channels post to the same webhook shape. The `whatsapp:` prefix on `To`
is the only reliable discriminator, which is what `channelFromWebhook` keys on.

| | SMS | WhatsApp |
|---|---|---|
| Address | `+14035551234` | `whatsapp:+14035551234` |
| Sender | your Twilio number | Meta-approved sender, or the shared sandbox |
| Business-initiated | any time consent allows | **only inside 24h, or a template** |
| Length | billed per 160-char segment | 4096 chars, unmetered |

### The 24-hour window

Meta's rule: once a customer messages you, you may reply freely for 24 hours.
After that the thread is closed, and the only way back in is a template Meta
approved in advance. Sending free-form text into a closed window does not fail
politely — Twilio returns 63016 and the business takes a quality-rating hit.

The scheduler checks before every WhatsApp send. A job with no template that
finds a closed window fails loudly rather than deferring forever, because a
silently-postponed reminder is worse than a visible failure.

One caveat worth knowing: thread state is in memory, so a restart forgets when
each customer last messaged. The scheduler then treats windows as **closed**,
which is the safe direction to be wrong in. If that starts costing real
reminders, persist `lastInboundAt` — that is the only change needed.

### The sandbox

Without an approved sender, `senderFor()` falls back to Twilio's shared sandbox
(`whatsapp:+14155238886`). Testers join by texting a code to it. Good enough to
build and demo against; it shows Twilio's name rather than the client's, is rate
limited, and **cannot send templates** — so outbound WhatsApp does not really
work until approval lands.

The sandbox is one shared address, so only one tenant can claim it. The server
warns and refuses the second claimant rather than silently misrouting.

---

## Outbound

Four triggers, each independently switchable per tenant.

| Trigger | Fires | Notes |
|---|---|---|
| `missed-call` | call ends unanswered | 45s grace; cancelled if someone picks up; one per caller per hour |
| `reminder` | 18h before appointment | skipped if the booking is <30min away — the confirmation is the reminder |
| `no-show` | manually, 90min later | cancels the pending review request first |
| `review` | 3h after the visit | needs a review link configured |

Every job passes four gates **at send time, not queue time**, because all four
can change while a job waits:

1. **Opt-out** — checked against the suppression list.
2. **Quiet hours** — 9am–8pm in the tenant's timezone. Outside it, the job is
   pushed to the next window rather than dropped.
3. **WhatsApp window** — as above.
4. **Retries** — four attempts, backing off 1m → 5m → 30m.

Jobs are keyed by `dedupeKey` so a retried webhook cannot double-text anyone.
State lives in `data/outbound.json`; suppression in `data/optout.json`. Both are
gitignored.

### Opt-out

`STOP`, `UNSUBSCRIBE`, `CANCEL`, `END`, `QUIT`, `OPTOUT` unsubscribe.
`START`, `UNSTOP`, `YES`, `RESUME` resubscribe. `HELP` and `INFO` return help.

Matched on the **whole trimmed message**, case-insensitive. "Stop by around
four?" is a normal message and must never unsubscribe anybody — there is a test
for exactly that.

Suppression is per business *and* per channel, so unsubscribing from one client
does not mute a different one the person actually wants to hear from.

Twilio honours STOP on its own for US/CA long codes, but that is not enough:
it does not cover WhatsApp, and it drops the message without telling us. We keep
our own list and check it ourselves.

---

## Before you can send at volume

Two approvals, both slow, both filed before launch:

- **A2P 10DLC** — carrier registration for business texting in the US and
  Canada. Unregistered traffic gets filtered or blocked. Days to weeks.
- **WhatsApp Business** — Meta approves the business profile and each template.
  Days to weeks; templates are approved individually.

Everything else is ready before either lands, which is why the sandbox path
exists. **Do not point a client's real number at this before registration
clears.**

---

## The demo

`/api/demo` on the text server, rendered by the phone in the landing page hero.

It runs the **real** agent, prompt and tool schemas against `makeSandboxRunner`,
which fakes the calendar and swallows the sends. So a visitor gets genuine
answers to whatever they type, but nothing books a real slot or texts a real
person.

Ceilings, all overridable by env:

| | Default | Env |
|---|---|---|
| Per visitor | 14 messages / 30 min | `DEMO_MAX_PER_VISITOR` |
| Per day, all visitors | 1200 messages | `DEMO_MAX_PER_DAY` |
| Turns per thread | 24 | `DEMO_MAX_TURNS` |

Hitting a ceiling is **not** an error: it falls back to `script.js`, a keyword
tree that tells the visitor it is scripted and points them at the real number.
A prospect who catches a "live" demo being canned has learned something worse
about us than that we rate-limit.

The per-visitor key is `X-Forwarded-For`, which is spoofable. That is fine — the
daily budget is what actually protects the bill, so a spoofed key costs a
handful of messages rather than the ceiling.

`GET /api/demo/status` returns today's usage. Counts only, no content.

---

## Wiring Twilio

| Webhook | Points at |
|---|---|
| Messaging (SMS number) | `POST https://HOST/sms` |
| Messaging (WhatsApp sender) | `POST https://HOST/whatsapp` |
| Voice status callback | `POST https://HOST/voice/status` |

The status callback is what drives missed-call text-back. It counts
`no-answer`, `busy`, `failed` and `canceled` as missed, plus `completed` calls
shorter than `shortCallSeconds` — someone who hung up on the hold music was not
helped either.

---

## Still to do

- **Persist `lastInboundAt`** so a restart stops treating open WhatsApp windows
  as closed.
- **No-show detection is manual.** `onNoShow` exists and works; nothing calls it
  yet. It needs either a calendar sweep or a "did they show?" prompt to the owner.
- **Template management.** Approved templates are configured by hand as content
  SIDs. Fine for a handful of clients, tedious past that.
- **Client dashboard.** Same gap as the voice product — `calls.jsonl` has the
  data, there is no UI.
- **The demo's rate limiter is per-process.** Two instances behind a load
  balancer means two independent budgets.
