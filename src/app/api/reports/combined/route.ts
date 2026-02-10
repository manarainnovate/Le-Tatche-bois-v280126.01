import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// GET /api/reports/combined - Combined B2C + B2B Dashboard
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // month, quarter, year
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
      default: // month
        startDate = new Date(year, now.getMonth(), 1);
        previousStartDate = new Date(year, now.getMonth() - 1, 1);
        previousEndDate = new Date(year, now.getMonth(), 0);
    }

    // ═══════════════════════════════════════════════════════════
    // B2C (E-Commerce) Stats
    // ═══════════════════════════════════════════════════════════

    const [
      b2cOrderStats,
      b2cPreviousOrderStats,
      b2cOrderStatusBreakdown,
      b2cQuoteStats,
      b2cTopProducts,
    ] = await Promise.all([
      // Current period orders
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        _sum: { total: true },
        _count: true,
        _avg: { total: true },
      }),

      // Previous period orders
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        _sum: { total: true },
        _count: true,
      }),

      // Order status breakdown
      prisma.order.groupBy({
        by: ["status"],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
        _sum: { total: true },
      }),

      // Quote requests
      prisma.ecomQuote.aggregate({
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      }),

      // Top selling products
      prisma.orderItem.groupBy({
        by: ["productId", "name"],
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { notIn: ["CANCELLED", "REFUNDED"] },
          },
        },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      }),
    ]);

    // ═══════════════════════════════════════════════════════════
    // B2B (CRM/Facturation) Stats
    // ═══════════════════════════════════════════════════════════

    const [
      b2bInvoiceStats,
      b2bPreviousInvoiceStats,
      b2bQuoteStats,
      b2bPaymentStats,
      b2bOutstandingStats,
      b2bOverdueStats,
      b2bTopClients,
    ] = await Promise.all([
      // Current period invoices
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          date: { gte: startDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalTTC: true, paidAmount: true, balance: true },
        _count: true,
      }),

      // Previous period invoices
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          date: { gte: previousStartDate, lte: previousEndDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalTTC: true },
        _count: true,
      }),

      // Quotes
      prisma.cRMDocument.aggregate({
        where: {
          type: "DEVIS",
          date: { gte: startDate },
        },
        _sum: { totalTTC: true },
        _count: true,
      }),

      // Payments received
      prisma.cRMPayment.aggregate({
        where: {
          date: { gte: startDate },
          status: "COMPLETED",
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Outstanding (unpaid) invoices
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          balance: { gt: 0 },
          status: { in: ["SENT", "PARTIAL", "OVERDUE"] },
        },
        _sum: { balance: true },
        _count: true,
      }),

      // Overdue invoices
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          status: "OVERDUE",
        },
        _sum: { balance: true },
        _count: true,
      }),

      // Top B2B clients
      prisma.cRMDocument.groupBy({
        by: ["clientId", "clientName"],
        where: {
          type: "FACTURE",
          date: { gte: startDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalTTC: true },
        orderBy: { _sum: { totalTTC: "desc" } },
        take: 5,
      }),
    ]);

    // ═══════════════════════════════════════════════════════════
    // Combined Monthly Trend (Last 12 months)
    // ═══════════════════════════════════════════════════════════

    const monthlyTrend = await getMonthlyTrend();

    // ═══════════════════════════════════════════════════════════
    // Calculate Growth Rates
    // ═══════════════════════════════════════════════════════════

    const b2cCurrentRevenue = Number(b2cOrderStats._sum.total || 0);
    const b2cPreviousRevenue = Number(b2cPreviousOrderStats._sum.total || 0);
    const b2cGrowth = b2cPreviousRevenue > 0
      ? ((b2cCurrentRevenue - b2cPreviousRevenue) / b2cPreviousRevenue) * 100
      : 0;

    const b2bCurrentRevenue = Number(b2bInvoiceStats._sum.totalTTC || 0);
    const b2bPreviousRevenue = Number(b2bPreviousInvoiceStats._sum.totalTTC || 0);
    const b2bGrowth = b2bPreviousRevenue > 0
      ? ((b2bCurrentRevenue - b2bPreviousRevenue) / b2bPreviousRevenue) * 100
      : 0;

    const totalCurrentRevenue = b2cCurrentRevenue + b2bCurrentRevenue;
    const totalPreviousRevenue = b2cPreviousRevenue + b2bPreviousRevenue;
    const totalGrowth = totalPreviousRevenue > 0
      ? ((totalCurrentRevenue - totalPreviousRevenue) / totalPreviousRevenue) * 100
      : 0;

    // Order status map for B2C
    const b2cOrderStatusMap: Record<string, { count: number; total: number }> = {};
    b2cOrderStatusBreakdown.forEach((item) => {
      b2cOrderStatusMap[item.status] = {
        count: item._count,
        total: Number(item._sum.total || 0),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: {
            current: totalCurrentRevenue,
            previous: totalPreviousRevenue,
            growth: totalGrowth,
          },
          b2cShare: totalCurrentRevenue > 0 ? (b2cCurrentRevenue / totalCurrentRevenue) * 100 : 0,
          b2bShare: totalCurrentRevenue > 0 ? (b2bCurrentRevenue / totalCurrentRevenue) * 100 : 0,
        },

        b2c: {
          revenue: {
            current: b2cCurrentRevenue,
            previous: b2cPreviousRevenue,
            growth: b2cGrowth,
          },
          orders: {
            count: b2cOrderStats._count,
            averageValue: Number(b2cOrderStats._avg.total || 0),
            statusBreakdown: b2cOrderStatusMap,
          },
          quoteRequests: b2cQuoteStats._count,
          topProducts: b2cTopProducts.map((p) => ({
            productId: p.productId,
            name: p.name,
            quantity: p._sum.quantity,
            revenue: Number(p._sum.total || 0),
          })),
        },

        b2b: {
          revenue: {
            current: b2bCurrentRevenue,
            previous: b2bPreviousRevenue,
            growth: b2bGrowth,
          },
          invoices: {
            count: b2bInvoiceStats._count,
            total: b2bCurrentRevenue,
            paid: Number(b2bInvoiceStats._sum.paidAmount || 0),
          },
          quotes: {
            count: b2bQuoteStats._count,
            total: Number(b2bQuoteStats._sum.totalTTC || 0),
          },
          payments: {
            count: b2bPaymentStats._count,
            total: Number(b2bPaymentStats._sum.amount || 0),
          },
          outstanding: {
            count: b2bOutstandingStats._count,
            total: Number(b2bOutstandingStats._sum.balance || 0),
          },
          overdue: {
            count: b2bOverdueStats._count,
            total: Number(b2bOverdueStats._sum.balance || 0),
          },
          topClients: b2bTopClients.map((c) => ({
            clientId: c.clientId,
            clientName: c.clientName,
            revenue: Number(c._sum.totalTTC || 0),
          })),
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
    console.error("Error fetching combined reports:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des rapports" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// Helper: Get combined monthly trend for last 12 months
// ═══════════════════════════════════════════════════════════

async function getMonthlyTrend() {
  const now = new Date();
  const months = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const [b2cOrders, b2bInvoices] = await Promise.all([
      // B2C orders
      prisma.order.aggregate({
        where: {
          createdAt: { gte: date, lte: endDate },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        _sum: { total: true },
        _count: true,
      }),

      // B2B invoices
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          date: { gte: date, lte: endDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalTTC: true },
        _count: true,
      }),
    ]);

    months.push({
      month: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      b2c: Number(b2cOrders._sum.total || 0),
      b2b: Number(b2bInvoices._sum.totalTTC || 0),
      total: Number(b2cOrders._sum.total || 0) + Number(b2bInvoices._sum.totalTTC || 0),
      b2cCount: b2cOrders._count,
      b2bCount: b2bInvoices._count,
    });
  }

  return months;
}
