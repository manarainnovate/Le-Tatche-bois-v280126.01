import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import {
  apiSuccess,
  apiError,
  apiNotFound,
  handleApiError,
} from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation schema
// ═══════════════════════════════════════════════════════════

const createCheckoutSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  locale: z.enum(["fr", "en", "es", "ar"]).optional().default("fr"),
});

// ═══════════════════════════════════════════════════════════
// POST /api/checkout/stripe - Create Stripe Checkout Session
// ═══════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return apiError("Stripe is not configured", 503);
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const body: unknown = await req.json();
    const result = createCheckoutSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    const { orderId, locale } = result.data;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return apiNotFound("Order not found");
    }

    // Verify ownership if user is logged in
    if (userId && order.customerId && order.customerId !== userId) {
      return apiError("Access denied", 403);
    }

    // Check if order is already paid
    if (order.paymentStatus === "PAID") {
      return apiError("Order is already paid", 400);
    }

    // Check if payment method is Card (Stripe)
    if (order.paymentMethod !== "CARD") {
      return apiError("This order is not configured for card payment", 400);
    }

    // Check order status
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return apiError("Order cannot be paid in current status", 400);
    }

    // Build line items from order
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "mad", // Moroccan Dirham
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(Number(item.unitPrice) * 100), // Convert to centimes
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if present
    if (order.shippingAmount && Number(order.shippingAmount) > 0) {
      lineItems.push({
        price_data: {
          currency: "mad",
          product_data: {
            name: getShippingLabel(locale),
            images: undefined,
          },
          unit_amount: Math.round(Number(order.shippingAmount) * 100),
        },
        quantity: 1,
      });
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      customer_email: order.customerEmail ?? undefined,
      success_url: `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${order.orderNumber}`,
      cancel_url: `${baseUrl}/${locale}/checkout/cancel?order=${order.orderNumber}`,
      locale: getStripeLocale(locale),
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        stripeSessionId: checkoutSession.id,
      },
    });

    console.log(`[Stripe] Checkout session created: ${checkoutSession.id} for order ${order.orderNumber}`);

    return apiSuccess({
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    return handleApiError(error, "Checkout Stripe POST");
  }
}

// ═══════════════════════════════════════════════════════════
// HELPER: Get shipping label by locale
// ═══════════════════════════════════════════════════════════

function getShippingLabel(locale: string): string {
  const labels = {
    fr: "Frais de livraison",
    en: "Shipping",
    es: "Gastos de envio",
    ar: "رسوم الشحن",
  } as const;

  if (locale in labels) {
    return labels[locale as keyof typeof labels];
  }
  return labels.fr;
}

// ═══════════════════════════════════════════════════════════
// HELPER: Map locale to Stripe locale
// Note: Stripe doesn't support Arabic, fallback to English for AR users
// ═══════════════════════════════════════════════════════════

function getStripeLocale(locale: string): "fr" | "en" | "es" {
  const stripeLocales = {
    fr: "fr",
    en: "en",
    es: "es",
    ar: "en", // Stripe doesn't support Arabic, use English as fallback
  } as const;

  if (locale in stripeLocales) {
    return stripeLocales[locale as keyof typeof stripeLocales];
  }
  return "fr";
}
