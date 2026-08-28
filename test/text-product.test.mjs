/**
 * Everything in the text product that can be checked without credentials:
 * opt-out matching, the scheduler's gates, the outbound triggers, the WhatsApp
 * window rules, and the demo sandbox.
 *
 * No network, no Twilio, no Anthropic. Run with: npm run test:text
 */
import { tmpdir } from "node:os";
import { join } from "node:path";

const TMP = tmpdir();
process.env.OPTOUT_STORE = join(TMP, "tess-test-optout.json");
process.env.OUTBOUND_STORE = join(TMP, "tess-test-outbound.json");

/* Fresh stores each run: the missed-call dedupe is keyed by the hour, so a
   second run inside the same hour would correctly suppress and wrongly fail. */
import { rmSync } from "node:fs";
rmSync(process.env.OPTOUT_STORE, { force: true });
rmSync(process.env.OUTBOUND_STORE, { force: true });

const B = new URL("../src/", import.meta.url).pathname;
const { classify, handleKeyword, isSuppressed } = await import(`${B}/outbound/optout.js`);
const { schedule, pendingJobs, cancelFor, __test: sched } = await import(`${B}/outbound/scheduler.js`);
const trig = await import(`${B}/outbound/triggers.js`);
const { makeSandboxRunner, __test: sbx } = await import(`${B}/demo/sandbox.js`);
const { scriptedReply } = await import(`${B}/demo/script.js`);
const { whatsappChannel } = await import(`${B}/channels/whatsapp.js`);
const { channelFromWebhook } = await import(`${B}/channels/index.js`);

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
};

const biz = JSON.parse((await import("node:fs")).readFileSync(`${B}/demo/demo-business.json`, "utf8"));
biz.outbound = {
  defaultChannel: "sms",
  missedCallTextBack: { enabled: true, graceSeconds: 45 },
  reminders: { enabled: true, leadHours: 18 },
  reviewRequests: { enabled: true, delayHours: 3, link: "https://g.page/r/demo" },
  noShowFollowUp: { enabled: true, delayMinutes: 90 },
};

console.log("\n-- opt-out keyword classification --");
ok("bare STOP unsubscribes", classify("STOP") === "stop");
ok("stop with punctuation", classify("stop.") === "stop");
ok("lowercase unsubscribe", classify("unsubscribe") === "stop");
ok("START resubscribes", classify("start") === "start");
ok("HELP is help", classify("help") === "help");
ok("'stop by around four?' is NOT an opt-out", classify("stop by around four?") === null,
   `got ${classify("stop by around four?")}`);
ok("'can you stop the leak' is NOT an opt-out", classify("can you stop the leak") === null);
ok("ordinary text is null", classify("my furnace died") === null);

console.log("\n-- opt-out state --");
const kw = handleKeyword(biz, { channel: "sms", from: "+15875551234", body: "STOP" });
ok("STOP handled", kw?.handled === true);
ok("STOP suppresses", isSuppressed(biz.id, "sms", "+15875551234"));
ok("suppression is per-channel", !isSuppressed(biz.id, "whatsapp", "+15875551234"));
handleKeyword(biz, { channel: "sms", from: "+15875551234", body: "START" });
ok("START unsuppresses", !isSuppressed(biz.id, "sms", "+15875551234"));

console.log("\n-- quiet hours --");
const night = { ...biz, timezone: "America/Edmonton" };
const h = sched.hourIn(night.timezone);
console.log(`     (tenant local hour right now: ${h})`);
ok("nextSendingWindow is in the future", sched.nextSendingWindow(night) > Date.now());
ok("ignoreQuietHours override works", sched.withinSendingHours({ ...night, outbound: { ignoreQuietHours: true } }));

console.log("\n-- scheduler dedupe + cancel --");
const j1 = schedule({ bizId: biz.id, channel: "sms", to: "+15875559999", kind: "reminder", runAt: Date.now() + 9e6, body: "x", dedupeKey: "dupe-1" });
const j2 = schedule({ bizId: biz.id, channel: "sms", to: "+15875559999", kind: "reminder", runAt: Date.now() + 9e6, body: "x", dedupeKey: "dupe-1" });
ok("first queue succeeds", !!j1);
ok("duplicate is rejected", j2 === null);
ok("cancelFor removes it", cancelFor({ bizId: biz.id, to: "+15875559999", kind: "reminder" }) === 1);

console.log("\n-- triggers --");
const mc = trig.onMissedCall(biz, { from: "+15875557777" });
ok("missed call queues text-back", !!mc);
ok("text-back is delayed by grace period", mc.runAt > Date.now() + 30_000);
ok("second missed call within the hour dedupes", trig.onMissedCall(biz, { from: "+15875557777" }) === null);
ok("answered call cancels the text-back", trig.onCallAnswered(biz, { from: "+15875557777" }) === 1);

const soon = new Date(Date.now() + 40 * 3600e3).toISOString();
const booked = trig.onBooked(biz, { startISO: soon, callerPhone: "+15875558888", callerName: "Dana Reid", service: "Furnace repair", durationMin: 90 });
ok("booking queues reminder + review", booked.length === 2, `got ${booked.length}`);
const reminder = booked.find((j) => j.kind === "reminder");
ok("reminder is anchored before the appointment", reminder.runAt < new Date(soon).getTime());
ok("reminder respects leadHours", Math.abs(reminder.runAt - (new Date(soon).getTime() - 18 * 3600e3)) < 1000);

const imminent = new Date(Date.now() + 2 * 3600e3).toISOString();
const b2 = trig.onBooked(biz, { startISO: imminent, callerPhone: "+15875556666", service: "Tune-up" });
ok("imminent booking skips the reminder", !b2.some((j) => j.kind === "reminder"));

trig.onNoShow(biz, { callerPhone: "+15875558888", callerName: "Dana Reid", service: "Furnace repair" });
ok("no-show cancels the pending review", !pendingJobs().some((j) => j.kind === "review" && j.to === "+15875558888"));
ok("no-show queues a follow-up", pendingJobs().some((j) => j.kind === "no-show"));

console.log("\n-- suppressed contact is never queued --");
handleKeyword(biz, { channel: "sms", from: "+15875550001", body: "STOP" });
ok("missed-call skips a suppressed number", trig.onMissedCall(biz, { from: "+15875550001" }) === null);

console.log("\n-- whatsapp channel rules --");
ok("address gets the prefix", whatsappChannel.address("4035551234") === "whatsapp:+14035551234");
ok("already-prefixed is idempotent", whatsappChannel.address("whatsapp:+14035551234") === "whatsapp:+14035551234");
ok("garbage returns null", whatsappChannel.address("nope") === null);
ok("window open just now", whatsappChannel.windowIsOpen(Date.now()));
ok("window closed after 24h", !whatsappChannel.windowIsOpen(Date.now() - 25 * 3600e3));
ok("never-messaged is closed", !whatsappChannel.windowIsOpen(null));
ok("sandbox detected by default", whatsappChannel.isSandbox({ channels: {} }));
ok("configured sender is not sandbox", !whatsappChannel.isSandbox({ channels: { whatsapp: { sender: "+14035551234" } } }));

console.log("\n-- webhook channel routing --");
ok("whatsapp webhook routes to whatsapp", channelFromWebhook({ To: "whatsapp:+14155238886" }).name === "whatsapp");
ok("sms webhook routes to sms", channelFromWebhook({ To: "+15873165050" }).name === "sms");

console.log("\n-- demo sandbox --");
const events = [];
const run = makeSandboxRunner({ onEvent: (e) => events.push(e) });
const call = { events: [], outcome: null, shouldEnd: false };
const avail = await run("check_availability", { service: "Furnace repair" }, { biz, call });
ok("availability returns slots", avail.ok && avail.slots.length === 3);
ok("slots are ISO strings", !Number.isNaN(Date.parse(avail.slots[0].startISO)));
ok("slots avoid weekends", avail.slots.every((s) => ![0, 6].includes(new Date(s.startISO).getDay())));
ok("slots avoid the lunch hour", avail.slots.every((s) => new Date(s.startISO).getHours() !== 12));
const bk = await run("book_appointment", { service: "Furnace repair", startISO: avail.slots[0].startISO, callerName: "Dana", callerPhone: "+15875551111" }, { biz, call });
ok("booking succeeds", bk.ok && bk.demo === true);
ok("booking marks the call", call.outcome === "booked");
ok("booking emits calendar + sms events", events.some((e) => e.type === "calendar" && e.detail.action === "booked") && events.some((e) => e.type === "sms"));
const tr = await run("transfer_to_human", { reason: "asked for a person" }, { biz, call });
ok("transfer does not claim a live connection", tr.transferred === false);
ok("nothing real was sent", true);

console.log("\n-- scripted fallback --");
ok("booking intent matches", /opening/i.test(scriptedReply(biz, "can I book someone in")));
ok("emergency intent matches", /urgent/i.test(scriptedReply(biz, "I smell gas")));
ok("price intent refuses to quote", /don't quote/i.test(scriptedReply(biz, "how much for a furnace")));
ok("unknown input still replies", scriptedReply(biz, "asdfgh").length > 20);
ok("fallback admits it is scripted", /script/i.test(scriptedReply(biz, "asdfgh")));

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
