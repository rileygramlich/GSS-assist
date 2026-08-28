import twilio from "twilio";
import { toE164 } from "../tools/messaging.js";

const tw = () => twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/* Long replies are a billing problem, not just a style problem: SMS bills per
   160-character segment (70 if the text goes Unicode, which one emoji is enough
   to trigger). The prompt is told to stay near a sentence or two; this is the
   backstop for when it does not. */
const MAX_CHARS = 1200;

export const smsChannel = {
  name: "sms",
  label: "SMS",
  maxChars: MAX_CHARS,

  /* SMS has no session window. Consent is the only gate, and that is the
     opt-out list's job rather than the channel's. */
  hasSessionWindow: false,
  requiresTemplateOutsideWindow: false,

  address: (e164) => toE164(e164),
  displayAddress: (addr) => String(addr || "").replace(/^whatsapp:/, ""),

  parseInbound(body) {
    return {
      channel: "sms",
      from: String(body.From || ""),
      to: String(body.To || ""),
      body: String(body.Body || "").trim(),
      messageSid: body.MessageSid || null,
    };
  },

  senderFor(biz) {
    return biz.channels?.sms?.number || biz.twilioNumber;
  },

  async send(biz, to, text) {
    const dest = toE164(to);
    if (!dest) {
      console.warn(`sms skipped — unusable number ${JSON.stringify(to)}`);
      return null;
    }
    return tw().messages.create({
      from: this.senderFor(biz),
      to: dest,
      body: String(text).slice(0, MAX_CHARS),
    });
  },
};
