import { smsChannel } from "./sms.js";
import { whatsappChannel } from "./whatsapp.js";

/**
 * A channel is a transport. It knows how to read an inbound Twilio webhook,
 * how to address a recipient, and how to put text in front of them. Everything
 * above this layer — threads, the agent, the outbound scheduler — is written
 * against this interface and never against Twilio directly.
 *
 * The two channels differ in ways that matter more than they look:
 *
 *   addressing   SMS is bare E.164. WhatsApp prefixes "whatsapp:".
 *   initiating   SMS can be sent whenever consent allows. WhatsApp can only be
 *                started outside the 24-hour customer service window with a
 *                template Meta has already approved.
 *   length       SMS bills per 160-char segment. WhatsApp does not.
 */
const CHANNELS = {
  [smsChannel.name]: smsChannel,
  [whatsappChannel.name]: whatsappChannel,
};

export function channelFor(name) {
  const ch = CHANNELS[name];
  if (!ch) throw new Error(`Unknown channel: ${name}`);
  return ch;
}

/**
 * Twilio posts SMS and WhatsApp to the same shape of webhook; the only
 * reliable discriminator is the "whatsapp:" prefix on the addresses.
 */
export function channelFromWebhook(body) {
  const to = String(body.To || "");
  return to.startsWith("whatsapp:") ? whatsappChannel : smsChannel;
}

export const allChannels = Object.values(CHANNELS);
