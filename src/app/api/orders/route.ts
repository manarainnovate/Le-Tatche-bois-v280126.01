import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/orders";
import { sendOrderConfirmation, notifyAdminNewOrder } from "@/lib/email";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface OrderItem {
  id?: string;
  productId?: string;
  name: string;
  price: number | string;
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
  };
  shipping: {
    firstName?: string;
    lastName?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: "cod" | "card" | "stripe";
  subtotal: number | string;
  shippingCost: number | string;
  total: number | string;
  locale?: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════
// POST /api/orders - Create order with custom ID format
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequest;

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📦 NEW ORDER RECEIVED");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!body.customer || !body.customer.email) {
      return NextResponse.json(
        { error: "Customer email is required" },
        { status: 400 }
      );
    }

    if (!body.shipping || !body.shipping.address) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Generate order ID: TB + DDMMYY + 5-digit sequence
    const orderId = generateOrderId();

    console.log("Order ID:", orderId);
    console.log("Customer:", body.customer.firstName, body.customer.lastName);
    console.log("Email:", body.customer.email);
    console.log("Phone:", body.customer.phone);
    console.log("Address:", body.shipping.address, body.shipping.city, body.shipping.postalCode);
    console.log("Items:", body.items.length);
    body.items.forEach((item, i) => {
      const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      console.log(`  ${i + 1}. ${item.name} x${item.quantity} = ${itemPrice * item.quantity} DH`);
    });
    console.log("Subtotal:", body.subtotal, "DH");
    console.log("Shipping:", body.shippingCost, "DH");
    console.log("Total:", body.total, "DH");
    console.log("Payment:", body.paymentMethod);
    console.log("═══════════════════════════════════════════════════════════════");

    // Determine payment status based on method
    const paymentMethod = body.paymentMethod.toUpperCase();
    const isCardPayment = paymentMethod === "CARD" || paymentMethod === "STRIPE";

    // Create shipping address first
    const shippingAddress = await prisma.address.create({
      data: {
        firstName: body.shipping.firstName || body.customer.firstName,
        lastName: body.shipping.lastName || body.customer.lastName,
        company: null,
        address1: body.shipping.address,
        address2: null,
        city: body.shipping.city,
        region: null,
        postalCode: body.shipping.postalCode,
        country: body.shipping.country || "MA",
        phone: body.customer.phone,
        isDefault: false,
      },
    });

    console.log("✅ Shipping address created:", shippingAddress.id);

    // Save order to database
    const order = await prisma.order.create({
      data: {
        orderNumber: orderId,
        customerName: `${body.customer.firstName} ${body.customer.lastName}`,
        customerEmail: body.customer.email,
        customerPhone: body.customer.phone,
        shippingAddressId: shippingAddress.id,
        subtotal: Number(body.subtotal),
        shippingAmount: Number(body.shippingCost),
        total: Number(body.total),
        currency: "MAD",
        paymentMethod: isCardPayment ? "STRIPE" : "COD",
        paymentStatus: isCardPayment ? "PAID" : "PENDING",
        status: isCardPayment ? "PROCESSING" : "PENDING",
        locale: body.locale || "fr",
        customerNote: body.notes || null,
        items: {
          create: body.items.map((item) => {
            const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            return {
              productId: item.id || item.productId || "",
              name: item.name,
              sku: "",
              quantity: item.quantity,
              unitPrice: itemPrice,
              total: itemPrice * item.quantity,
              image: item.image || null,
            };
          }),
        },
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    });

    console.log("✅ Order saved to database:", order.id);

    // Prepare email data
    const emailData = {
      orderNumber: orderId,
      customerName: `${body.customer.firstName} ${body.customer.lastName}`,
      customerEmail: body.customer.email,
      customerPhone: body.customer.phone,
      items: body.items.map((item) => {
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return {
          name: item.name,
          quantity: item.quantity,
          price: itemPrice,
        };
      }),
      subtotal: Number(body.subtotal),
      shipping: Number(body.shippingCost),
      total: Number(body.total),
      shippingAddress: `${body.shipping.address}, ${body.shipping.city} ${body.shipping.postalCode}, ${body.shipping.country}`,
      paymentMethod: isCardPayment ? "STRIPE" : "COD",
      locale: body.locale || "fr",
      createdAt: order.createdAt,
    };

    // Send confirmation email to customer (async, don't wait)
    sendOrderConfirmation(emailData).catch((err) => {
      console.error("Failed to send customer email:", err);
    });

    // Send notification to admin (async, don't wait)
    notifyAdminNewOrder(emailData).catch((err) => {
      console.error("Failed to send admin notification:", err);
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderNumber,
      message: "Order created successfully",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ [Orders API] Error creating order:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : "N/A");

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
