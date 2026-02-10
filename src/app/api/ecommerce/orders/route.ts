import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  withAuth,
  handleApiError,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api-helpers";

// ═══════════════════════════════════════════════════════════
// GET /api/ecommerce/orders - List orders with stats
// ═══════════════════════════════════════════════════════════

export const GET = withAuth(
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit, skip } = getPaginationParams(searchParams, 10);

      // Build filters
      const status = searchParams.get("status");
      const paymentStatus = searchParams.get("paymentStatus");
      const search = searchParams.get("search");
      const range = searchParams.get("range");

      const where: Prisma.OrderWhereInput = {};

      if (status) where.status = status as Prisma.EnumOrderStatusFilter;
      if (paymentStatus) where.paymentStatus = paymentStatus as Prisma.EnumPaymentStatusFilter;

      // Search in customer info
      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
          { customerEmail: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search, mode: "insensitive" } },
        ];
      }

      // Date range filter
      if (range) {
        const now = new Date();
        let startDate: Date;

        switch (range) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }

        where.createdAt = { gte: startDate };
      }

      // Fetch orders
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalOrders, pendingOrders, todayOrders, revenueResult] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { createdAt: { gte: today } } }),
        prisma.order.aggregate({
          where: { paymentStatus: "PAID" },
          _sum: { total: true },
        }),
      ]);

      // Transform orders
      const transformedOrders = orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        itemsCount: order.items.length,
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt.toISOString(),
      }));

      return apiSuccess({
        ...paginatedResponse(transformedOrders, total, { page, limit, skip }),
        stats: {
          totalOrders,
          pendingOrders,
          totalRevenue: Number(revenueResult._sum.total ?? 0),
          todayOrders,
        },
      });
    } catch (error) {
      return handleApiError(error, "E-commerce Orders GET");
    }
  },
  ["ADMIN", "MANAGER", "COMMERCIAL"]
);
