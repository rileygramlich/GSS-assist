import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { channelFromWebhook, channelFor } from "./channels/index.js";
import { handleInbound, threads } from "./threads.js";
import { startScheduler } from "./outbound/scheduler.js";
import { onMissedCall, onCallAnswered } from "./outbound/triggers.js";
import { demoRouter } from "./demo/router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The text product's entrypoint.
 *
 * Deliberately a separate server from the voice one. They share the agent, the
 * prompt and the tools, but they are sold separately, deployed separately and
 * fail separately — a client who bought texting should not lose it because the
 * voice deployment is being restarted.
 *
 * Tenants are keyed by the address a message arrived at, which is how one
 * process serves every client on both channels: an SMS number and a WhatsApp
 * sender can both point at the same tenant.
 */
const configDir = path.join(__dirname, "config");
const tenants = new Map(); // address -> biz  (address is E.164 or whatsapp:E.164)
const byId = new Map();

function registerTenant(biz) {
  byId.set(biz.id, biz);
  const sms = biz.channels?.sms?.number || biz.twilioNumber;
  if (sms) tenants.set(sms, biz);

  const wa = biz.channels?.whatsapp?.sender;
  if (wa) tenants.set(wa.startsWith("whatsapp:") ? wa : `whatsapp:${wa}`, biz);

  /* The shared sandbox sender is the same address for everybody, so it can only
     ever be claimed by one tenant. First one wins, loudly. */
  if (biz.channels?.whatsapp?.useSandbox) {
    const sandbox = channelFor("whatsapp").senderFor(biz);
    if (tenants.has(sandbox)) {
      console.warn(`WhatsApp sandbox already claimed by ${tenants.get(sandbox).id}; ${biz.id} will not receive on it`);
    } else {
      tenants.set(sandbox, biz);
    }
  }
}

for (const f of fs.readdirSync(configDir).filter((f) => f.endsWith(".json"))) {
  registerTenant(JSON.parse(fs.readFileSync(path.join(configDir, f), "utf8")));
}
console.log(`Loaded ${byId.size} tenant(s):`, [...byId.values()].map((b) => b.name).join(", ") || "none");

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get("/health", (_, res) => res.send("ok"));

/* ---------- inbound text, both channels ----------
   Twilio posts the same shape for SMS and WhatsApp; the address prefix is what
   tells them apart. We ack immediately with empty TwiML and reply over the REST
   API, because a tool loop that hits the calendar can outrun Twilio's 15-second
   webhook timeout and a timed-out webhook shows the sender an error.          */
function inbound(req, res) {
  res.type("text/xml").send("<Response/>");

  const ch = channelFromWebhook(req.body);
  const msg = ch.parseInbound(req.body);

  const biz = tenants.get(msg.to);
  if (!biz) return console.warn(`${ch.name} to unconfigured address`, msg.to);
  if (!msg.body) return;

  handleInbound(biz, { channel: ch.name, from: msg.from, body: msg.body }).catch((err) =>
    console.error(`${ch.name} inbound failed`, err)
  );
}

app.post("/sms", inbound);
app.post("/whatsapp", inbound);

/* ---------- missed-call text-back ----------
   Twilio posts here when a call completes. "no-answer", "busy" and "failed"
   mean nobody got helped; "completed" with a very short duration usually means
   they hung up on the hold music, which counts too.                           */
app.post("/voice/status", (req, res) => {
  res.type("text/xml").send("<Response/>");

  const to = String(req.body.To || "");
  const from = String(req.body.From || "");
  const status = String(req.body.CallStatus || "");
  const seconds = Number(req.body.CallDuration || 0);

  const biz = tenants.get(to);
  if (!biz || !from) return;

  const missed =
    ["no-answer", "busy", "failed", "canceled"].includes(status) ||
    (status === "completed" && seconds > 0 && seconds < (biz.outbound?.missedCallTextBack?.shortCallSeconds ?? 12));

  if (missed) {
    const job = onMissedCall(biz, { from });
    if (job) console.log(`missed call from ${from} -> text-back queued for ${new Date(job.runAt).toISOString()}`);
  } else if (status === "completed") {
    onCallAnswered(biz, { from });
  }
});

/* ---------- public demo ---------- */
const demoBusiness = JSON.parse(fs.readFileSync(path.join(__dirname, "demo", "demo-business.json"), "utf8"));
app.use("/api/demo", demoRouter(demoBusiness));

startScheduler({ tenants: byId, threads });

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Text receptionist listening on :${port}`));
