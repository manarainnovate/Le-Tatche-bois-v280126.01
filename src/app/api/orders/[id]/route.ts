import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  withAuth,
  handleApiError,
} from "@/lib/api-helpers";
import { updateOrderSchema, type UpdateOrderInput } from "@/lib/validations";

// ═══════════════════════════════════════════════════════════
// GET /api/orders/[id] - Get order details
// ═══════════════════════════════════════════════════════════

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const userRole = session?.user?.role ?? null;

    // Find by ID or order number
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    if (!order) {
      return apiNotFound("Order not found");
    }

    // Check access: admin/manager/commercial OR order owner
    const isAdmin = userRole && ["ADMIN", "MANAGER", "COMMERCIAL"].includes(userRole);
    const isOwner = order.customerId === userId;

    if (!isAdmin && !isOwner) {
      return apiError("Access denied", 403);
    }

    return apiSuccess({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      stripeSessionId: isAdmin ? order.stripeSessionId : undefined,
      stripePaymentId: isAdmin ? order.stripePaymentId : undefined,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      shippingAmount: order.shippingAmount,
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      total: order.total,
      customerNote: order.customerNote,
      adminNote: isAdmin ? order.adminNote : undefined,
      currency: order.currency,
      locale: order.locale,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productSlug: item.product.slug,
        name: item.name,
        sku: item.sku,
        image: item.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    });
  } catch (error) {
    return handleApiError(error, "Order GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PATCH /api/orders/[id] - Update order (admin)
// ═══════════════════════════════════════════════════════════

export const PATCH = withAuth(
  async (req, { params }) => {
    try {
      const { id } = await params;
      const body: unknown = await req.json();
      const result = updateOrderSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const data: UpdateOrderInput = result.data;

      const existing = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        return apiNotFound("Order not found");
      }

      // Validate status transitions
      if (data.status) {
        const validTransitions: Record<string, string[]> = {
          PENDING: ["CONFIRMED", "CANCELLED"],
          CONFIRMED: ["PROCESSING", "CANCELLED"],
          PROCESSING: ["SHIPPED", "CANCELLED"],
          SHIPPED: ["DELIVERED"],
          DELIVERED: [],
          CANCELLED: [],
        };

        const allowedStatuses = validTransitions[existing.status] ?? [];
        if (data.status !== existing.status && !allowedStatuses.includes(data.status)) {
          return apiError(
            `Cannot transition from ${existing.status} to ${data.status}`,
            400
          );
        }
      }

      // Build update data
      const updateData: Record<string, unknown> = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
      if (data.trackingNumber !== undefined) updateData.trackingNumber = data.trackingNumber;
      if (data.adminNote !== undefined) updateData.adminNote = data.adminNote;

      const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          items: true,
        },
      });

      // TODO: Send status update email
      // if (data.status && data.status !== existing.status) {
      //   await sendOrderStatusUpdateEmail(order);
      // }

      return apiSuccess({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        updatedAt: order.updatedAt,
      });
    } catch (error) {
      return handleApiError(error, "Order PATCH");
    }
  },
  ["ADMIN", "MANAGER", "COMMERCIAL"]
);

// ═══════════════════════════════════════════════════════════
// DELETE /api/orders/[id] - Cancel order (restore stock)
// ═══════════════════════════════════════════════════════════

export const DELETE = withAuth(
  async (_req, { params }) => {
    try {
      const { id } = await params;

      const existing = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        return apiNotFound("Order not found");
      }

      // Only allow cancellation if not shipped or delivered
      if (["SHIPPED", "DELIVERED"].includes(existing.status)) {
        return apiError(
          "Cannot cancel order that has been shipped or delivered",
          400
        );
      }

      // Already cancelled
      if (existing.status === "CANCELLED") {
        return apiError("Order is already cancelled", 400);
      }

      // Cancel order and restore stock
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id },
          data: { status: "CANCELLED" },
        });

        // Restore stock for each item
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQty: { increment: item.quantity },
            },
          });
        }
      });

      // TODO: Send cancellation email
      // await sendOrderCancellationEmail(existing);

      return apiSuccess({
        message: "Order cancelled successfully",
        orderNumber: existing.orderNumber,
      });
    } catch (error) {
      return handleApiError(error, "Order DELETE");
    }
  },
  ["ADMIN"]
);
