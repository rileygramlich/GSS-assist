import twilio from "twilio";
import { toE164 } from "../tools/messaging.js";

const tw = () => twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/* Meta's rule, not ours: once a customer messages you, you may reply freely for
   24 hours. After that the thread is closed and the only way back in is a
   template Meta approved in advance. Sending free-form text into a closed
   window does not bounce politely — Twilio returns 63016 and the business eats
   a quality-rating hit for it. The scheduler checks this before every send. */
export const SESSION_WINDOW_MS = 24 * 60 * 60 * 1000;

/* Twilio's shared sandbox sender. Testers opt in by texting a join code to it.
   Fine for development and for the demo; it is rate-limited, shows Twilio's
   name rather than the client's, and cannot send templates. */
export const SANDBOX_SENDER = "whatsapp:+14155238886";

export const whatsappChannel = {
  name: "whatsapp",
  label: "WhatsApp",
  maxChars: 4096,

  hasSessionWindow: true,
  requiresTemplateOutsideWindow: true,
  sessionWindowMs: SESSION_WINDOW_MS,

  /* WhatsApp addresses are E.164 wearing a prefix. Normalizing first means a
     number typed by a caller works the same on both channels. */
  address(e164) {
    const raw = String(e164 ?? "").replace(/^whatsapp:/, "");
    const norm = toE164(raw);
    return norm ? `whatsapp:${norm}` : null;
  },
  displayAddress: (addr) => String(addr || "").replace(/^whatsapp:/, ""),

  parseInbound(body) {
    return {
      channel: "whatsapp",
      from: String(body.From || ""),
      to: String(body.To || ""),
      body: String(body.Body || "").trim(),
      messageSid: body.MessageSid || null,
      profileName: body.ProfileName || null,
    };
  },

  /**
   * Production senders are per-tenant and Meta-approved. Absent one we fall
   * back to the shared sandbox, which is what makes this buildable before
   * approval lands — see docs/SMS-WHATSAPP.md.
   */
  senderFor(biz) {
    const configured = biz.channels?.whatsapp?.sender;
    if (configured) {
      return configured.startsWith("whatsapp:") ? configured : `whatsapp:${configured}`;
    }
    return SANDBOX_SENDER;
  },

  isSandbox(biz) {
    return this.senderFor(biz) === SANDBOX_SENDER;
  },

  /** True when a free-form reply is still allowed on this thread. */
  windowIsOpen(lastInboundAt) {
    if (!lastInboundAt) return false;
    return Date.now() - lastInboundAt < SESSION_WINDOW_MS;
  },

  async send(biz, to, text) {
    const dest = this.address(to);
    if (!dest) {
      console.warn(`whatsapp skipped — unusable number ${JSON.stringify(to)}`);
      return null;
    }
    return tw().messages.create({
      from: this.senderFor(biz),
      to: dest,
      body: String(text).slice(0, this.maxChars),
    });
  },

  /**
   * Business-initiated message outside the 24-hour window. `template` is a
   * content SID Meta approved; `variables` fills its placeholders. There is no
   * way to send arbitrary text here, which is the entire point of the rule.
   */
  async sendTemplate(biz, to, { contentSid, variables }) {
    const dest = this.address(to);
    if (!dest) return null;
    if (this.isSandbox(biz)) {
      throw new Error(
        "The WhatsApp sandbox cannot send templates. An approved production sender is required for business-initiated messages."
      );
    }
    return tw().messages.create({
      from: this.senderFor(biz),
      to: dest,
      contentSid,
      contentVariables: JSON.stringify(variables || {}),
    });
  },
};
