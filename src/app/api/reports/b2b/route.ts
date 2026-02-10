import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// GET /api/reports/b2b - CRM (B2B) Reports
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
    // CRM Document Statistics
    // ═══════════════════════════════════════════════════════════

    const [
      // Devis stats
      devisStats,
      previousDevisStats,
      devisByStatus,

      // Factures stats
      factureStats,
      previousFactureStats,
      facturesByStatus,

      // BL stats
      blStats,

      // Avoirs stats
      avoirStats,

      // Top clients
      topClients,

      // Receivables aging
      receivablesAging,

      // Payments received
      paymentsReceived,
      previousPayments,

      // Client count
      clientCount,
      newClients,
    ] = await Promise.all([
      // Current period devis
      prisma.cRMDocument.aggregate({
        where: {
          type: "DEVIS",
          date: { gte: startDate },
        },
        _sum: { totalHT: true, totalTTC: true },
        _count: true,
      }),

      // Previous period devis
      prisma.cRMDocument.aggregate({
        where: {
          type: "DEVIS",
          date: { gte: previousStartDate, lte: previousEndDate },
        },
        _count: true,
      }),

      // Devis by status
      prisma.cRMDocument.groupBy({
        by: ["status"],
        where: {
          type: "DEVIS",
          date: { gte: startDate },
        },
        _count: true,
        _sum: { totalTTC: true },
      }),

      // Current period factures
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          date: { gte: startDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalHT: true, totalTVA: true, totalTTC: true, paidAmount: true, balance: true },
        _count: true,
      }),

      // Previous period factures
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          date: { gte: previousStartDate, lte: previousEndDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalTTC: true },
        _count: true,
      }),

      // Factures by status
      prisma.cRMDocument.groupBy({
        by: ["status"],
        where: {
          type: "FACTURE",
          date: { gte: startDate },
        },
        _count: true,
        _sum: { totalTTC: true },
      }),

      // BL stats
      prisma.cRMDocument.aggregate({
        where: {
          type: "BON_LIVRAISON",
          date: { gte: startDate },
        },
        _count: true,
      }),

      // Avoirs stats
      prisma.cRMDocument.aggregate({
        where: {
          type: "AVOIR",
          date: { gte: startDate },
        },
        _sum: { totalTTC: true },
        _count: true,
      }),

      // Top clients by revenue
      prisma.cRMDocument.groupBy({
        by: ["clientId", "clientName"],
        where: {
          type: "FACTURE",
          date: { gte: startDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalTTC: true, paidAmount: true, balance: true },
        _count: true,
        orderBy: { _sum: { totalTTC: "desc" } },
        take: 10,
      }),

      // Receivables aging
      prisma.cRMDocument.findMany({
        where: {
          type: "FACTURE",
          status: { in: ["SENT", "PARTIAL"] },
          balance: { gt: 0 },
        },
        select: {
          id: true,
          number: true,
          date: true,
          dueDate: true,
          clientName: true,
          totalTTC: true,
          balance: true,
        },
      }),

      // Payments received this period
      prisma.cRMPayment.aggregate({
        where: {
          date: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Previous period payments
      prisma.cRMPayment.aggregate({
        where: {
          date: { gte: previousStartDate, lte: previousEndDate },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Total clients
      prisma.cRMClient.count(),

      // New clients this period
      prisma.cRMClient.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
    ]);

    // ═══════════════════════════════════════════════════════════
    // Process Receivables Aging
    // ═══════════════════════════════════════════════════════════

    const agingBuckets = {
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 0,
    };

    receivablesAging.forEach((invoice) => {
      const balance = Number(invoice.balance);
      const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoice.date);
      const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      agingBuckets.total += balance;

      if (daysPastDue <= 0) {
        agingBuckets.current += balance;
      } else if (daysPastDue <= 30) {
        agingBuckets.days30 += balance;
      } else if (daysPastDue <= 60) {
        agingBuckets.days60 += balance;
      } else if (daysPastDue <= 90) {
        agingBuckets.days90 += balance;
      } else {
        agingBuckets.over90 += balance;
      }
    });

    // ═══════════════════════════════════════════════════════════
    // Calculate Metrics
    // ═══════════════════════════════════════════════════════════

    const currentRevenue = Number(factureStats._sum.totalTTC || 0);
    const previousRevenue = Number(previousFactureStats._sum.totalTTC || 0);
    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const currentPayments = Number(paymentsReceived._sum.amount || 0);
    const previousPaymentsAmount = Number(previousPayments._sum.amount || 0);
    const paymentGrowth = previousPaymentsAmount > 0
      ? ((currentPayments - previousPaymentsAmount) / previousPaymentsAmount) * 100
      : 0;

    // Conversion rate: accepted devis -> factures
    const devisValidated = devisByStatus.find((d) => d.status === "ACCEPTED")?._count || 0;
    const conversionRate = devisStats._count > 0
      ? (devisValidated / devisStats._count) * 100
      : 0;

    // Collection rate
    const collectionRate = currentRevenue > 0
      ? (Number(factureStats._sum.paidAmount || 0) / currentRevenue) * 100
      : 0;

    // ═══════════════════════════════════════════════════════════
    // Monthly Trend
    // ═══════════════════════════════════════════════════════════

    const monthlyTrend = await getB2BMonthlyTrend();

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
            previous: previousPaymentsAmount,
            growth: paymentGrowth,
            count: paymentsReceived._count,
          },
          devis: {
            count: devisStats._count,
            previousCount: previousDevisStats._count,
            totalHT: Number(devisStats._sum.totalHT || 0),
            conversionRate,
          },
          factures: {
            count: factureStats._count,
            previousCount: previousFactureStats._count,
            totalHT: Number(factureStats._sum.totalHT || 0),
            totalTVA: Number(factureStats._sum.totalTVA || 0),
            totalTTC: currentRevenue,
            paidAmount: Number(factureStats._sum.paidAmount || 0),
            balance: Number(factureStats._sum.balance || 0),
            collectionRate,
          },
          bonsLivraison: blStats._count,
          avoirs: {
            count: avoirStats._count,
            total: Number(avoirStats._sum.totalTTC || 0),
          },
          clients: {
            total: clientCount,
            new: newClients,
          },
        },

        documents: {
          devisByStatus: devisByStatus.map((d) => ({
            status: d.status,
            count: d._count,
            total: Number(d._sum.totalTTC || 0),
          })),
          facturesByStatus: facturesByStatus.map((f) => ({
            status: f.status,
            count: f._count,
            total: Number(f._sum.totalTTC || 0),
          })),
        },

        clients: {
          top: topClients.map((c) => ({
            clientId: c.clientId,
            clientName: c.clientName,
            invoicesCount: c._count,
            totalTTC: Number(c._sum.totalTTC || 0),
            paidAmount: Number(c._sum.paidAmount || 0),
            balance: Number(c._sum.balance || 0),
          })),
        },

        receivables: {
          aging: agingBuckets,
          unpaidInvoices: receivablesAging.length,
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
    console.error("Error fetching B2B reports:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des rapports B2B" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// Helper: Get B2B monthly trend
// ═══════════════════════════════════════════════════════════

async function getB2BMonthlyTrend() {
  const now = new Date();
  const months = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const [factures, devis, payments] = await Promise.all([
      prisma.cRMDocument.aggregate({
        where: {
          type: "FACTURE",
          date: { gte: date, lte: endDate },
          status: { not: "DRAFT" },
        },
        _sum: { totalTTC: true },
        _count: true,
      }),
      prisma.cRMDocument.count({
        where: {
          type: "DEVIS",
          date: { gte: date, lte: endDate },
        },
      }),
      prisma.cRMPayment.aggregate({
        where: {
          date: { gte: date, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    months.push({
      month: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      revenue: Number(factures._sum.totalTTC || 0),
      invoices: factures._count,
      devis: devis,
      payments: Number(payments._sum.amount || 0),
    });
  }

  return months;
}
