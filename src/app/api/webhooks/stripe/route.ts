/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { getClientIP } from "@/lib/api-helpers";
import {
  checkRateLimitEnhanced,
  RATE_LIMITS,
  recordSuspiciousActivity,
} from "@/lib/security";

// ═══════════════════════════════════════════════════════════
// Disable body parser for webhook signature verification
// ═══════════════════════════════════════════════════════════

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Known Stripe webhook IPs for additional validation (optional)
// Stripe IPs can change, so this is informational only
// Reference: https://stripe.com/docs/ips
/* const STRIPE_IP_RANGES = [
  "3.18.12.63", "3.130.192.231", "13.235.14.237",
  "13.235.122.149", "18.211.135.69", "35.154.171.200",
  "52.15.183.38", "54.88.130.119", "54.88.130.237",
  "54.187.174.169", "54.187.205.235", "54.187.216.72",
]; */

// ═══════════════════════════════════════════════════════════
// POST /api/webhooks/stripe - Handle Stripe webhooks
// ═══════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    console.error("[Stripe Webhook] Stripe is not configured");
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const clientIP = getClientIP(req);

  // Rate limiting for webhook endpoint (prevent abuse)
  const rateLimit = checkRateLimitEnhanced(
    `webhook:${clientIP}`,
    RATE_LIMITS.webhook
  );

  if (!rateLimit.allowed) {
    console.error(`[Stripe Webhook] Rate limit exceeded for IP: ${clientIP}`);
    recordSuspiciousActivity(clientIP);
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing signature");
    recordSuspiciousActivity(clientIP);
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  // Verify webhook signature (primary security check)
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
    recordSuspiciousActivity(clientIP);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Verify event is recent (within 5 minutes)
  const eventAge = Math.floor(Date.now() / 1000) - event.created;
  if (eventAge > 300) {
    console.warn(`[Stripe Webhook] Event is ${eventAge}s old, processing anyway`);
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        await handleCheckoutSessionExpired(session);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Stripe Webhook] Error processing event: ${message}`);
    // Return 200 to acknowledge receipt even on processing error
    // This prevents Stripe from retrying and allows us to investigate
    return NextResponse.json({ received: true, error: message });
  }
}

// ═══════════════════════════════════════════════════════════
// HANDLER: checkout.session.completed
// ═══════════════════════════════════════════════════════════

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const orderNumber = session.metadata?.orderNumber;

  console.log(`[Stripe Webhook] Checkout completed for order: ${orderNumber} (${orderId})`);

  if (!orderId) {
    console.error("[Stripe Webhook] No orderId in session metadata");
    return;
  }

  // Find the order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    console.error(`[Stripe Webhook] Order not found: ${orderId}`);
    return;
  }

  // Idempotent check - already paid?
  if (order.paymentStatus === "PAID") {
    console.log(`[Stripe Webhook] Order ${orderNumber} already marked as PAID, skipping`);
    return;
  }

  // Get payment intent ID safely
  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? null;

  // Update order
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      status: order.status === "PENDING" ? "CONFIRMED" : order.status,
      stripePaymentId: paymentIntentId,
    },
  });

  console.log(`[Stripe Webhook] Order ${orderNumber} updated to PAID`);

  // TODO: Send confirmation email
  // await sendOrderConfirmationEmail(order);
}

// ═══════════════════════════════════════════════════════════
// HANDLER: payment_intent.succeeded (backup confirmation)
// ═══════════════════════════════════════════════════════════

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment intent succeeded: ${paymentIntent.id}`);

  // Find order by payment intent ID
  const order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (!order) {
    // Try to find by session - payment might not have been linked yet
    console.log(`[Stripe Webhook] No order found for payment intent: ${paymentIntent.id}`);
    return;
  }

  // Idempotent check
  if (order.paymentStatus === "PAID") {
    console.log(`[Stripe Webhook] Order ${order.orderNumber} already PAID, skipping`);
    return;
  }

  // Update order
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      status: order.status === "PENDING" ? "CONFIRMED" : order.status,
    },
  });

  console.log(`[Stripe Webhook] Order ${order.orderNumber} confirmed via payment_intent.succeeded`);
}

// ═══════════════════════════════════════════════════════════
// HANDLER: payment_intent.payment_failed
// ═══════════════════════════════════════════════════════════

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`);

  // Find order by payment intent ID
  const order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (!order) {
    console.log(`[Stripe Webhook] No order found for failed payment: ${paymentIntent.id}`);
    return;
  }

  // Update payment status
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "FAILED",
    },
  });

  console.log(`[Stripe Webhook] Order ${order.orderNumber} marked as payment FAILED`);

  // TODO: Send payment failure email
  // await sendPaymentFailedEmail(order);
}

// ═══════════════════════════════════════════════════════════
// HANDLER: checkout.session.expired
// ═══════════════════════════════════════════════════════════

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const orderNumber = session.metadata?.orderNumber;

  console.log(`[Stripe Webhook] Checkout session expired for order: ${orderNumber}`);

  if (!orderId) {
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return;
  }

  // Only update if still pending payment
  // Note: PaymentStatus doesn't have EXPIRED, so we keep it as PENDING
  // The order can be retried or cancelled separately
  if (order.paymentStatus === "PENDING") {
    console.log(`[Stripe Webhook] Order ${orderNumber} checkout session expired (payment still PENDING)`);
  }
}
