import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// GET /api/reports/b2c - E-Commerce (B2C) Reports
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (period) {
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(year, currentQuarter * 3, 1);
        previousStartDate = new Date(year, (currentQuarter - 1) * 3, 1);
        previousEndDate = new Date(year, currentQuarter * 3, 0);
        break;
      case "year":
        startDate = new Date(year, 0, 1);
        previousStartDate = new Date(year - 1, 0, 1);
        previousEndDate = new Date(year - 1, 11, 31);
        break;
      default:
        startDate = new Date(year, now.getMonth(), 1);
        previousStartDate = new Date(year, now.getMonth() - 1, 1);
        previousEndDate = new Date(year, now.getMonth(), 0);
    }

    // ═══════════════════════════════════════════════════════════
    // Order Statistics
    // ═══════════════════════════════════════════════════════════

    const [
      currentOrderStats,
      previousOrderStats,
      ordersByStatus,
      ordersByPaymentMethod,
      topProducts,
      topCategories,
      quoteStats,
      cartStats,
    ] = await Promise.all([
      // Current period
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        _sum: { total: true, subtotal: true, shippingAmount: true, discountAmount: true },
        _count: true,
        _avg: { total: true },
      }),

      // Previous period
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        _sum: { total: true },
        _count: true,
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate } },
        _count: true,
        _sum: { total: true },
      }),

      // Orders by payment method
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        _count: true,
        _sum: { total: true },
      }),

      // Top selling products
      prisma.orderItem.groupBy({
        by: ["productId", "name", "sku"],
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { notIn: ["CANCELLED", "REFUNDED"] },
          },
        },
        _sum: { quantity: true, total: true },
        _count: true,
        orderBy: { _sum: { total: "desc" } },
        take: 10,
      }),

      // Revenue by category
      prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { notIn: ["CANCELLED", "REFUNDED"] },
          },
        },
        include: {
          product: {
            include: {
              category: {
                include: {
                  translations: {
                    where: { locale: "fr" },
                  },
                },
              },
            },
          },
        },
      }),

      // Quote requests
      prisma.ecomQuote.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),

      // Active carts (for conversion analysis)
      prisma.cart.count({
        where: {
          updatedAt: { gte: startDate },
          items: { some: {} },
        },
      }),
    ]);

    // ═══════════════════════════════════════════════════════════
    // Process Category Revenue
    // ═══════════════════════════════════════════════════════════

    const categoryRevenueMap = new Map<string, { name: string; total: number; count: number }>();
    topCategories.forEach((item) => {
      const categoryName = item.product?.category?.translations?.[0]?.name || "Sans catégorie";
      const existing = categoryRevenueMap.get(categoryName) || { name: categoryName, total: 0, count: 0 };
      existing.total += Number(item.total);
      existing.count += item.quantity;
      categoryRevenueMap.set(categoryName, existing);
    });

    const revenueByCategory = Array.from(categoryRevenueMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // ═══════════════════════════════════════════════════════════
    // Calculate Metrics
    // ═══════════════════════════════════════════════════════════

    const currentRevenue = Number(currentOrderStats._sum.total || 0);
    const previousRevenue = Number(previousOrderStats._sum.total || 0);
    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const currentOrderCount = currentOrderStats._count;
    const previousOrderCount = previousOrderStats._count;
    const orderGrowth = previousOrderCount > 0
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
      : 0;

    // Conversion rate (orders / active carts)
    const conversionRate = cartStats > 0 ? (currentOrderCount / cartStats) * 100 : 0;

    // Quote request stats
    const quoteStatusMap: Record<string, number> = {};
    quoteStats.forEach((q) => {
      quoteStatusMap[q.status] = q._count;
    });

    // Order status breakdown
    const orderStatusBreakdown = ordersByStatus.map((s) => ({
      status: s.status,
      count: s._count,
      total: Number(s._sum.total || 0),
    }));

    // Payment method breakdown
    const paymentBreakdown = ordersByPaymentMethod.map((p) => ({
      method: p.paymentMethod || "UNKNOWN",
      count: p._count,
      total: Number(p._sum.total || 0),
    }));

    // ═══════════════════════════════════════════════════════════
    // Monthly Trend
    // ═══════════════════════════════════════════════════════════

    const monthlyTrend = await getB2CMonthlyTrend();

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            growth: revenueGrowth,
          },
          orders: {
            current: currentOrderCount,
            previous: previousOrderCount,
            growth: orderGrowth,
          },
          averageOrderValue: Number(currentOrderStats._avg.total || 0),
          shipping: Number(currentOrderStats._sum.shippingAmount || 0),
          discounts: Number(currentOrderStats._sum.discountAmount || 0),
          conversionRate,
        },

        orders: {
          byStatus: orderStatusBreakdown,
          byPaymentMethod: paymentBreakdown,
        },

        products: {
          topSelling: topProducts.map((p) => ({
            productId: p.productId,
            name: p.name,
            sku: p.sku,
            quantity: p._sum.quantity,
            revenue: Number(p._sum.total || 0),
            orders: p._count,
          })),
          byCategory: revenueByCategory,
        },

        quotes: {
          total: Object.values(quoteStatusMap).reduce((a, b) => a + b, 0),
          byStatus: quoteStatusMap,
        },

        charts: {
          monthlyTrend,
        },

        period: {
          type: period,
          year,
          startDate,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching B2C reports:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des rapports B2C" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// Helper: Get B2C monthly trend
// ═══════════════════════════════════════════════════════════

async function getB2CMonthlyTrend() {
  const now = new Date();
  const months = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const orders = await prisma.order.aggregate({
      where: {
        createdAt: { gte: date, lte: endDate },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { total: true },
      _count: true,
      _avg: { total: true },
    });

    months.push({
      month: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      revenue: Number(orders._sum.total || 0),
      orders: orders._count,
      avgOrderValue: Number(orders._avg.total || 0),
    });
  }

  return months;
}
