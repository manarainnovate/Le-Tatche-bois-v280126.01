import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// GET /api/crm/reports - Dashboard KPIs and stats
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

    // Get current period stats
    const [
      invoicesStats,
      quotesStats,
      paymentsStats,
      clientsCount,
      projectsStats,
      previousInvoicesStats,
      previousPaymentsStats,
    ] = await Promise.all([
      // Current period invoices
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          date: { gte: startDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalTTC: true },
        _count: true,
      }),

      // Quotes (devis) stats
      prisma.cRMDocument.aggregate({
        where: {
          type: "DEVIS",
          date: { gte: startDate },
        },
        _sum: { totalTTC: true },
        _count: true,
      }),

      // Payments
      prisma.cRMPayment.aggregate({
        where: {
          date: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Total clients
      prisma.cRMClient.count(),

      // Projects in progress
      prisma.cRMProject.groupBy({
        by: ["status"],
        _count: true,
      }),

      // Previous period invoices (for comparison)
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          date: { gte: previousStartDate, lte: previousEndDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalTTC: true },
        _count: true,
      }),

      // Previous period payments
      prisma.cRMPayment.aggregate({
        where: {
          date: { gte: previousStartDate, lte: previousEndDate },
        },
        _sum: { amount: true },
      }),
    ]);

    // Outstanding balance (unpaid invoices)
    const outstandingInvoices = await prisma.cRMDocument.aggregate({
      where: {
        type: "FACTURE",
        balance: { gt: 0 },
        status: { in: ["SENT", "PARTIAL", "OVERDUE"] },
      },
      _sum: { balance: true },
      _count: true,
    });

    // Overdue invoices
    const overdueInvoices = await prisma.cRMDocument.aggregate({
      where: {
        type: "FACTURE",
        status: "OVERDUE",
      },
      _sum: { balance: true },
      _count: true,
    });

    // Monthly revenue trend (last 12 months)
    const monthlyRevenue = await getMonthlyRevenue();

    // Revenue by category
    const revenueByCategory = await getRevenueByCategory(startDate);

    // Top clients
    const topClients = await getTopClients(startDate, 5);

    // Conversion rate (quotes to invoices)
    const quotesConverted = await prisma.cRMDocument.count({
      where: {
        type: "DEVIS",
        date: { gte: startDate },
        status: "ACCEPTED",
      },
    });

    const totalQuotes = quotesStats._count || 1;
    const conversionRate = (quotesConverted / totalQuotes) * 100;

    // Calculate growth percentages
    const currentRevenue = Number(invoicesStats._sum.totalTTC || 0);
    const previousRevenue = Number(previousInvoicesStats._sum.totalTTC || 0);
    const revenueGrowth =
      previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const currentPayments = Number(paymentsStats._sum.amount || 0);
    const previousPayments = Number(previousPaymentsStats._sum.amount || 0);
    const paymentsGrowth =
      previousPayments > 0
        ? ((currentPayments - previousPayments) / previousPayments) * 100
        : 0;

    // Project status summary
    const projectStatusMap: Record<string, number> = {};
    projectsStats.forEach((p) => {
      projectStatusMap[p.status] = p._count;
    });

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            growth: revenueGrowth,
          },
          payments: {
            current: currentPayments,
            previous: previousPayments,
            growth: paymentsGrowth,
            count: paymentsStats._count,
          },
          invoices: {
            count: invoicesStats._count,
            total: currentRevenue,
          },
          quotes: {
            count: quotesStats._count,
            total: Number(quotesStats._sum.totalTTC || 0),
            conversionRate,
          },
          outstanding: {
            total: Number(outstandingInvoices._sum.balance || 0),
            count: outstandingInvoices._count,
          },
          overdue: {
            total: Number(overdueInvoices._sum.balance || 0),
            count: overdueInvoices._count,
          },
          clients: {
            active: clientsCount,
          },
          projects: {
            inProgress: projectStatusMap["IN_PROGRESS"] || 0,
            completed: projectStatusMap["COMPLETED"] || 0,
            total: Object.values(projectStatusMap).reduce((a, b) => a + b, 0),
          },
        },
        charts: {
          monthlyRevenue,
          revenueByCategory,
          topClients,
        },
        period: {
          type: period,
          year,
          startDate,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des rapports" },
      { status: 500 }
    );
  }
}

// Helper: Get monthly revenue for last 12 months
async function getMonthlyRevenue() {
  const now = new Date();
  const months = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const result = await prisma.cRMDocument.aggregate({
      where: {
        type: "FACTURE",
        date: { gte: date, lte: endDate },
        status: { not: "DRAFT" },
      },
      _sum: { totalTTC: true },
    });

    const payments = await prisma.cRMPayment.aggregate({
      where: {
        date: { gte: date, lte: endDate },
      },
      _sum: { amount: true },
    });

    months.push({
      month: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      invoiced: Number(result._sum.totalTTC || 0),
      collected: Number(payments._sum.amount || 0),
    });
  }

  return months;
}

// Helper: Get revenue by category
async function getRevenueByCategory(startDate: Date) {
  // Get all invoice items with their catalog items (which have categoryId)
  const items = await prisma.cRMDocumentItem.findMany({
    where: {
      document: {
        type: "FACTURE",
        date: { gte: startDate },
        status: { not: "DRAFT" },
      },
    },
    select: {
      totalTTC: true,
      catalogItem: {
        select: {
          categoryId: true,
        },
      },
    },
  });

  // Aggregate by category
  const categoryTotals: Record<string, number> = {};
  items.forEach((item) => {
    const categoryId = item.catalogItem?.categoryId || "uncategorized";
    categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + Number(item.totalTTC || 0);
  });

  // Get category names
  const categoryIds = Object.keys(categoryTotals).filter((id) => id !== "uncategorized");
  const categories = await prisma.catalogCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return Object.entries(categoryTotals).map(([categoryId, total]) => ({
    category: categoryId === "uncategorized" ? "Sans catégorie" : categoryMap.get(categoryId) || "Autre",
    total,
  }));
}

// Helper: Get top clients by revenue
async function getTopClients(startDate: Date, limit: number) {
  const clients = await prisma.cRMDocument.groupBy({
    by: ["clientId", "clientName"],
    where: {
      type: "FACTURE",
      date: { gte: startDate },
      status: { not: "DRAFT" },
    },
    _sum: { totalTTC: true },
    orderBy: {
      _sum: { totalTTC: "desc" },
    },
    take: limit,
  });

  return clients.map((c) => ({
    clientId: c.clientId,
    clientName: c.clientName,
    total: Number(c._sum.totalTTC || 0),
  }));
}
