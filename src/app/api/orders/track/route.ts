import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  handleApiError,
  getClientIP,
  checkRateLimit,
} from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation schema for order tracking
// ═══════════════════════════════════════════════════════════

const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  email: z.string().email("Valid email is required"),
});

// ═══════════════════════════════════════════════════════════
// POST /api/orders/track - Public order tracking
// ═══════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const clientIP = getClientIP(req);
    const { allowed, resetIn } = checkRateLimit(`track:${clientIP}`, 10, 60 * 1000);

    if (!allowed) {
      return apiError(
        "Too many requests. Please try again later.",
        429,
        [{ field: "rateLimit", message: `Try again in ${Math.ceil(resetIn / 1000)} seconds` }]
      );
    }

    const body: unknown = await req.json();
    const result = trackOrderSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    const { orderNumber, email } = result.data;

    // Find order by number and email
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        customerEmail: {
          equals: email,
          mode: "insensitive",
        },
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            image: true,
            quantity: true,
            unitPrice: true,
            total: true,
          },
        },
      },
    });

    if (!order) {
      return apiNotFound("Order not found. Please check your order number and email.");
    }

    // Return limited order info (public tracking)
    return apiSuccess({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingMethod: order.shippingMethod,
      shippingAmount: order.shippingAmount,
      trackingNumber: order.trackingNumber,
      subtotal: order.subtotal,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      // Status timeline
      timeline: getStatusTimeline(order.status, order.createdAt, order.updatedAt),
    });
  } catch (error) {
    return handleApiError(error, "Order Track POST");
  }
}

// ═══════════════════════════════════════════════════════════
// HELPER: Generate status timeline
// ═══════════════════════════════════════════════════════════

function getStatusTimeline(
  currentStatus: string,
  createdAt: Date,
  updatedAt: Date
) {
  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const statusIndex = statuses.indexOf(currentStatus);

  // Handle cancelled orders
  if (currentStatus === "CANCELLED") {
    return [
      {
        status: "PENDING",
        label: "Order Placed",
        completed: true,
        date: createdAt,
      },
      {
        status: "CANCELLED",
        label: "Order Cancelled",
        completed: true,
        date: updatedAt,
        isCurrent: true,
      },
    ];
  }

  return statuses.map((status, index) => {
    const labels: Record<string, string> = {
      PENDING: "Order Placed",
      CONFIRMED: "Order Confirmed",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
    };

    return {
      status,
      label: labels[status],
      completed: index <= statusIndex,
      isCurrent: index === statusIndex,
      date: index === 0 ? createdAt : index === statusIndex ? updatedAt : null,
    };
  });
}
