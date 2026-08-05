# Virtual Receptionist

Answers the phone, books into Google Calendar, texts confirmations, takes messages, transfers to a human when it should. Multi-tenant — one deployment serves every client.

## How a call flows

```
Caller dials client's number
  → Twilio hits POST /voice
  → TwiML opens a ConversationRelay WebSocket
  → Twilio does speech-to-text, sends us plain text
  → agent.js runs Claude with tools
      check_availability → Google Calendar freebusy
      book_appointment   → creates event, SMS to caller
      take_message       → SMS to owner
      transfer_to_human  → live call redirect
  → we send text back, Twilio speaks it
  → on hangup: call summary SMS to owner + calls.jsonl
```

ConversationRelay handles barge-in, turn detection, STT and TTS. That is the part most people get wrong when they build this from raw media streams, and it is why the codebase is this small.

## Setup

1. `npm install`, copy `.env.example` to `.env`, fill it in.
2. Deploy somewhere with a public hostname and WebSocket support (Render, Fly, Railway). Set `PUBLIC_HOSTNAME`.
3. Buy a Twilio number, point Voice webhook at `https://YOUR_HOST/voice`.
4. Google Cloud: service account, enable Calendar API, turn on domain-wide delegation, have the client grant it access to the booking calendar. Or swap `calendar.js` to per-tenant OAuth refresh tokens if clients are on personal Gmail.
5. Drop a tenant JSON in `src/config/`. Restart.

## Onboarding a client

Everything client-specific lives in one JSON file. Nothing else changes per client.

1. Copy `business.example.json`, fill in hours, services with real durations, service area, FAQ, escalation rules, `neverSay`.
2. Get calendar access.
3. Test-call it yourself ten times, including the awkward ones: mumbling, background noise, "just give me a person," a caller who changes their mind mid-booking.
4. Port the client's existing number, or forward it. Forwarding first is the low-risk way in — they keep their number and can undo it in a minute.

Budget 2–3 hours per client. Most of it is on the phone with the owner extracting what they actually say to callers.

## Rough per-minute cost

- Twilio voice + ConversationRelay (STT/TTS bundled): ~$0.15–0.20/min
- Claude Sonnet: ~$0.02–0.05/min at these turn sizes
- SMS: pennies

Call it **$0.25/min all-in**. A client taking 200 calls a month at 3 minutes each is 600 minutes, about **$150 in cost**. Price accordingly — see the offer notes.

## Not built yet

- Client dashboard (call log, transcripts, recordings). `calls.jsonl` is the data; the UI is a weekend.
- Outbound follow-up calls for no-shows.
- Bilingual (Deepgram + ElevenLabs both do French; it is a config change plus prompt work).
- Recording consent announcement — **required in Alberta if you record.** If you enable Twilio recording, add a consent line to the greeting.
