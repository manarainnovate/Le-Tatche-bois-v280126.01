import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { z } from "zod";
import { generateOrderId } from "@/lib/orders";
import { sendOrderConfirmation, notifyAdminNewOrder } from "@/lib/email";

// ═══════════════════════════════════════════════════════════
// Validation schema
// ═══════════════════════════════════════════════════════════

const createSessionSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      image: z.string().optional(),
    })
  ).min(1, "Cart cannot be empty"),
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
  }),
  locale: z.enum(["fr", "en", "es", "ar"]).optional().default("fr"),
});

// ═══════════════════════════════════════════════════════════
// POST /api/stripe/create-session - Create Stripe Checkout Session
// ═══════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    const body: unknown = await req.json();
    const result = createSessionSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { items, customer, locale } = result.data;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= 1000 ? 0 : 50;

    // Build line items for Stripe
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: {
          name: string;
          images?: string[];
        };
        unit_amount: number;
      };
      quantity: number;
    }> = items.map((item) => ({
      price_data: {
        currency: "mad",
        product_data: {
          name: item.name,
          ...(item.image && { images: [item.image] }),
        },
        unit_amount: Math.round(item.price * 100), // Convert to centimes
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if not free
    if (shippingCost > 0) {
      const shippingLabels = {
        fr: "Frais de livraison",
        en: "Shipping",
        es: "Gastos de envío",
        ar: "رسوم الشحن",
      } as const;
      const shippingName = shippingLabels[locale as keyof typeof shippingLabels] ?? shippingLabels.fr;
      lineItems.push({
        price_data: {
          currency: "mad",
          product_data: {
            name: shippingName,
          },
          unit_amount: shippingCost * 100,
        },
        quantity: 1,
      });
    }

    // Get base URL from request headers
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Generate our custom order ID FIRST
    const orderId = generateOrderId();

    // Map locale to Stripe-supported locale (Arabic not supported)
    const stripeLocales: Record<string, "fr" | "en" | "es"> = {
      fr: "fr",
      en: "en",
      es: "es",
      ar: "en",
    };

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        orderId, // Store our custom order ID
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.address,
        shippingCity: customer.city,
        shippingPostalCode: customer.postalCode,
        locale,
        subtotal: String(subtotal),
        shippingCost: String(shippingCost),
        total: String(subtotal + shippingCost),
      },
      customer_email: customer.email,
      success_url: `${origin}/${locale}/checkout/success?orderId=${orderId}&payment=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/checkout?canceled=true`,
      locale: stripeLocales[locale] ?? "fr",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    // eslint-disable-next-line no-console
    console.log("═══════════════════════════════════════════════════════════════");
    // eslint-disable-next-line no-console
    console.log("💳 STRIPE CHECKOUT SESSION CREATED");
    // eslint-disable-next-line no-console
    console.log("═══════════════════════════════════════════════════════════════");
    // eslint-disable-next-line no-console
    console.log("Order ID:", orderId);
    // eslint-disable-next-line no-console
    console.log("Session ID:", checkoutSession.id);
    // eslint-disable-next-line no-console
    console.log("Customer:", customer.firstName, customer.lastName);
    // eslint-disable-next-line no-console
    console.log("Email:", customer.email);
    // eslint-disable-next-line no-console
    console.log("Total:", subtotal + shippingCost, "DH");
    // eslint-disable-next-line no-console
    console.log("═══════════════════════════════════════════════════════════════");

    // Prepare email data
    const emailData = {
      orderNumber: orderId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      shipping: shippingCost,
      total: subtotal + shippingCost,
      shippingAddress: `${customer.address}, ${customer.city} ${customer.postalCode}`,
      paymentMethod: "STRIPE",
      locale,
      createdAt: new Date(),
    };

    // Send confirmation email (async, don't wait)
    sendOrderConfirmation(emailData).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to send customer email:", err);
    });

    // Send admin notification (async, don't wait)
    notifyAdminNewOrder(emailData).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to send admin notification:", err);
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      orderId,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[Stripe] Error creating checkout session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/stripe/create-session - Check if Stripe is configured
// ═══════════════════════════════════════════════════════════

export function GET() {
  return NextResponse.json({
    configured: isStripeConfigured(),
    message: isStripeConfigured()
      ? "Stripe is configured and ready"
      : "Stripe is not configured - add STRIPE_SECRET_KEY to .env.local",
  });
}
