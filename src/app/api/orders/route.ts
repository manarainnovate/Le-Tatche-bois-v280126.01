import { NextRequest, NextResponse } from "next/server";
import { generateOrderId } from "@/lib/orders";
import { sendOrderConfirmation, notifyAdminNewOrder } from "@/lib/email";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderRequest {
  items: OrderItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: "cod" | "card";
  subtotal: number;
  shippingCost: number;
  total: number;
  locale?: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════
// POST /api/orders - Create order with custom ID format
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequest;

    // Generate order ID: TB + DDMMYY + 5-digit sequence
    const orderId = generateOrderId();

    // eslint-disable-next-line no-console
    console.log("═══════════════════════════════════════════════════════════════");
    // eslint-disable-next-line no-console
    console.log("📦 NEW ORDER RECEIVED");
    // eslint-disable-next-line no-console
    console.log("═══════════════════════════════════════════════════════════════");
    // eslint-disable-next-line no-console
    console.log("Order ID:", orderId);
    // eslint-disable-next-line no-console
    console.log("Customer:", body.customer.firstName, body.customer.lastName);
    // eslint-disable-next-line no-console
    console.log("Email:", body.customer.email);
    // eslint-disable-next-line no-console
    console.log("Phone:", body.customer.phone);
    // eslint-disable-next-line no-console
    console.log("Address:", body.customer.address, body.customer.city, body.customer.postalCode);
    // eslint-disable-next-line no-console
    console.log("Items:", body.items.length);
    body.items.forEach((item, i) => {
      // eslint-disable-next-line no-console
      console.log(`  ${i + 1}. ${item.name} x${item.quantity} = ${item.price * item.quantity} DH`);
    });
    // eslint-disable-next-line no-console
    console.log("Subtotal:", body.subtotal, "DH");
    // eslint-disable-next-line no-console
    console.log("Shipping:", body.shippingCost, "DH");
    // eslint-disable-next-line no-console
    console.log("Total:", body.total, "DH");
    // eslint-disable-next-line no-console
    console.log("Payment:", body.paymentMethod);
    // eslint-disable-next-line no-console
    console.log("═══════════════════════════════════════════════════════════════");

    // Prepare email data
    const emailData = {
      orderNumber: orderId,
      customerName: `${body.customer.firstName} ${body.customer.lastName}`,
      customerEmail: body.customer.email,
      items: body.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: body.subtotal,
      shippingCost: body.shippingCost,
      total: body.total,
      shippingAddress: `${body.customer.address}, ${body.customer.city} ${body.customer.postalCode}, ${body.customer.country}`,
      paymentMethod: body.paymentMethod === "card" ? "STRIPE" : "COD",
    };

    // Send confirmation email to customer (async, don't wait)
    sendOrderConfirmation(emailData).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to send customer email:", err);
    });

    // Send notification to admin (async, don't wait)
    notifyAdminNewOrder(emailData).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to send admin notification:", err);
    });

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order created successfully",
      order: {
        id: orderId,
        status: "confirmed",
        paymentMethod: body.paymentMethod,
        total: body.total,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[Orders API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/orders - Get order info
// ═══════════════════════════════════════════════════════════

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");

  return NextResponse.json({
    status: "Orders API is running",
    format: "TB + DDMMYY + 5-digit sequence",
    example: "TB0202260001",
    requestedId: orderId ?? null,
  });
}
