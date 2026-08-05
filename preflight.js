import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";
import twilio from "twilio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let failed = false;
const ok = (m) => console.log(`  ok    ${m}`);
const bad = (m) => { failed = true; console.log(`  FAIL  ${m}`); };

console.log("\nenv");
for (const k of ["ANTHROPIC_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY", "PUBLIC_HOSTNAME"]) {
  if (!process.env[k]) bad(`${k} is not set`);
  else ok(k);
}
if (/^https?:\/\//.test(process.env.PUBLIC_HOSTNAME || "")) {
  bad("PUBLIC_HOSTNAME must be a bare hostname, no https:// prefix");
}
if (process.env.PUBLIC_HOSTNAME === "your-app.onrender.com") {
  bad("PUBLIC_HOSTNAME is still the placeholder — set it to your ngrok host");
}
if (!(process.env.GOOGLE_PRIVATE_KEY || "").includes("BEGIN PRIVATE KEY")) {
  bad("GOOGLE_PRIVATE_KEY does not look like a service-account private key");
}

console.log("\ntenants");
const configDir = path.join(__dirname, "src", "config");
const tenants = [];
for (const f of fs.readdirSync(configDir).filter((f) => f.endsWith(".json"))) {
  const biz = JSON.parse(fs.readFileSync(path.join(configDir, f), "utf8"));
  tenants.push(biz);
  ok(`${f} → ${biz.name} on ${biz.twilioNumber}`);
  const nums = [biz.twilioNumber, biz.escalation.transferTo, ...biz.notify.smsTo];
  for (const n of nums) {
    if (!/^\+[1-9]\d{6,14}$/.test(n)) bad(`not valid E.164: ${JSON.stringify(n)}`);
  }
  const todos = JSON.stringify(biz).match(/TODO/g);
  if (todos) bad(`${todos.length} unfilled TODO(s) remain in ${f}`);
}

console.log("\ntwilio");
try {
  const tw = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const acct = await tw.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
  ok(`authenticated as "${acct.friendlyName}" (${acct.status})`);
  const owned = await tw.incomingPhoneNumbers.list({ limit: 50 });
  const have = owned.map((n) => n.phoneNumber);
  for (const biz of tenants) {
    if (have.includes(biz.twilioNumber)) {
      const n = owned.find((x) => x.phoneNumber === biz.twilioNumber);
      ok(`${biz.twilioNumber} owned; voice webhook = ${n.voiceUrl || "(unset)"}`);
      const want = `https://${process.env.PUBLIC_HOSTNAME}/voice`;
      if (n.voiceUrl !== want) bad(`voice webhook should be ${want}`);
    } else {
      bad(`${biz.twilioNumber} is not on this Twilio account. Owned: ${have.join(", ") || "none"}`);
    }
  }
} catch (e) {
  bad(`twilio: ${e.message}`);
}

console.log("\ngoogle calendar");
for (const biz of tenants) {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/calendar"],
      ...(biz.booking.delegatedAuth ? { subject: biz.booking.calendarId } : {}),
    });
    const cal = google.calendar({ version: "v3", auth });
    const r = await cal.freebusy.query({
      requestBody: {
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 864e5).toISOString(),
        items: [{ id: biz.booking.calendarId }],
      },
    });
    const c = r.data.calendars[biz.booking.calendarId];
    if (c?.errors?.length) bad(`${biz.booking.calendarId}: ${JSON.stringify(c.errors)}`);
    else ok(`${biz.booking.calendarId} readable (${(c.busy || []).length} busy block(s) next 24h)`);
  } catch (e) {
    bad(`${biz.booking.calendarId}: ${e.message}`);
    if (String(e.message).includes("not found")) {
      console.log(`        → share the calendar with ${process.env.GOOGLE_CLIENT_EMAIL} ("Make changes to events")`);
    }
  }
}

console.log("\nanthropic");
try {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const a = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const r = await a.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
    max_tokens: 8,
    messages: [{ role: "user", content: "Say OK." }],
  });
  ok(`${r.model} responded`);
} catch (e) {
  bad(`anthropic: ${e.message}`);
}

console.log(failed ? "\nPREFLIGHT FAILED — fix the above before calling.\n" : "\nAll checks passed. Ready to call.\n");
process.exit(failed ? 1 : 0);
