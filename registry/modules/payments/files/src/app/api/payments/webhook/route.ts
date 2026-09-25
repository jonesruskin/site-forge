import { payments } from "@/lib/payments";
import { dispatchPaymentEvent } from "@/lib/payments/dispatch";

/**
 * Provider webhooks. Signature failures return 400 (the provider won't retry);
 * handler failures return 500 so the provider retries later.
 */
export async function POST(request: Request) {
  let event;
  try {
    event = await payments.parseWebhook(request);
  } catch (error) {
    console.warn("[payments] rejected webhook", error instanceof Error ? error.message : error);
    return new Response("Invalid signature", { status: 400 });
  }
  if (!event) return new Response("Ignored", { status: 200 });

  try {
    await dispatchPaymentEvent(event);
  } catch (error) {
    console.error(`[payments] handler failed for ${event.type} (${event.id})`, error);
    return new Response("Handler error", { status: 500 });
  }
  return new Response("OK", { status: 200 });
}
