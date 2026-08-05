import "dotenv/config";
import express from "express";
import { WebSocketServer } from "ws";
import twilio from "twilio";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Conversation } from "./agent.js";
import { notifyOwner } from "./tools/messaging.js";
import { handleInboundSms } from "./sms.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------- tenant loading: one JSON file per client, keyed by phone number ---------- */
const configDir = path.join(__dirname, "config");
const tenants = new Map();
for (const f of fs.readdirSync(configDir).filter((f) => f.endsWith(".json"))) {
  const biz = JSON.parse(fs.readFileSync(path.join(configDir, f), "utf8"));
  tenants.set(biz.twilioNumber, biz);
}
console.log(`Loaded ${tenants.size} tenant(s):`, [...tenants.values()].map((b) => b.name).join(", "));

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get("/health", (_, res) => res.send("ok"));

/* ---------- inbound call: hand Twilio a ConversationRelay socket ----------
   ConversationRelay does speech-to-text and text-to-speech for us and streams
   plain text over a WebSocket. That removes the two hardest parts of voice AI
   (barge-in and turn detection) from our codebase.                            */
app.post("/voice", (req, res) => {
  const biz = tenants.get(req.body.To);
  const vr = new twilio.twiml.VoiceResponse();

  if (!biz) {
    vr.say("This number is not configured. Goodbye.");
    return res.type("text/xml").send(vr.toString());
  }

  const connect = vr.connect({ action: `/voice/done` });
  // ttsProvider/voice are omitted unless the tenant sets them: ElevenLabs is a
  // gated add-on and Twilio rejects the whole TwiML (error 64101) if the account
  // is not enabled for it. Omitted means Twilio's built-in default voice.
  connect.conversationRelay({
    url: `wss://${process.env.PUBLIC_HOSTNAME}/relay?to=${encodeURIComponent(req.body.To)}`,
    welcomeGreeting: biz.greeting,
    ...(biz.voice?.ttsProvider ? { ttsProvider: biz.voice.ttsProvider } : {}),
    ...(biz.voice?.name ? { voice: biz.voice.name } : {}),
    transcriptionProvider: "Deepgram",
    speechModel: "nova-3-general",
    interruptible: true,
    dtmfDetection: true,
  });

  res.type("text/xml").send(vr.toString());
});

app.post("/voice/done", (_, res) => res.type("text/xml").send("<Response/>"));

/* ---------- inbound SMS ----------
   We acknowledge immediately with empty TwiML and send the reply through the
   REST API instead. A tool loop that hits the calendar can outrun Twilio's 15s
   webhook timeout, and a timed-out webhook shows the texter an error.         */
app.post("/sms", (req, res) => {
  res.type("text/xml").send("<Response/>");

  const biz = tenants.get(req.body.To);
  if (!biz) return console.warn("SMS to unconfigured number", req.body.To);

  const body = (req.body.Body || "").trim();
  if (!body) return;

  console.log(`sms in  ${req.body.From} → ${req.body.To}: ${body.slice(0, 80)}`);
  handleInboundSms(biz, { from: req.body.From, to: req.body.To, body });
});

const server = app.listen(process.env.PORT || 3000, () =>
  console.log(`listening on ${process.env.PORT || 3000}`)
);

/* ---------- the live conversation ---------- */
const wss = new WebSocketServer({ server, path: "/relay" });

wss.on("connection", (ws, req) => {
  const to = new URL(req.url, "http://x").searchParams.get("to");
  const biz = tenants.get(to);
  if (!biz) return ws.close();

  let convo = null;
  let call = null;
  let busy = false;
  const queue = [];

  const say = (text, last = false) =>
    ws.send(JSON.stringify({ type: "text", token: text, last }));

  async function handle(utterance) {
    if (busy) return queue.push(utterance);
    busy = true;
    try {
      for await (const chunk of convo.respondTo(utterance)) say(chunk);
      say("", true);
      if (call.shouldEnd) {
        ws.send(JSON.stringify({ type: "end", handoffData: JSON.stringify({ outcome: call.outcome }) }));
      }
    } catch (err) {
      console.error("turn failed", err);
      say("Sorry, I lost that for a second. Could you say it again?", true);
    } finally {
      busy = false;
      const next = queue.shift();
      if (next) handle(next);
    }
  }

  ws.on("message", async (raw) => {
    const msg = JSON.parse(raw.toString());

    switch (msg.type) {
      case "setup":
        call = {
          sid: msg.callSid,
          from: msg.from,
          startedAt: Date.now(),
          events: [],
          outcome: null,
          shouldEnd: false,
        };
        convo = new Conversation(biz, call);
        // The greeting was already spoken by Twilio; seed it so the model knows.
        convo.messages.push(
          { role: "user", content: "[call connected]" },
          { role: "assistant", content: biz.greeting }
        );
        break;

      case "prompt": // final transcript of what the caller said
        if (msg.voicePrompt?.trim()) await handle(msg.voicePrompt);
        break;

      case "dtmf":
        await handle(`[caller pressed ${msg.digit}]`);
        break;

      case "interrupt":
        // ConversationRelay already stopped playback; nothing to do.
        break;

      case "error":
        console.error("relay error", msg);
        break;
    }
  });

  ws.on("close", async () => {
    if (!convo || !call) return;
    call.endedAt = Date.now();
    try {
      const summary = await convo.summarize();
      const mins = Math.round((call.endedAt - call.startedAt) / 6000) / 10;
      if (call.outcome !== "transferred") {
        await notifyOwner(biz, `Call from ${call.from} (${mins} min)\n\n${summary}`);
      }
      fs.appendFileSync(
        process.env.CALL_LOG || "calls.jsonl",
        JSON.stringify({ biz: biz.id, ...call, summary }) + "\n"
      );
    } catch (err) {
      console.error("post-call failed", err);
    }
  });
});
