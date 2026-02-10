import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// GET /api/crm/reports/receivables - Accounts receivable aging
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const now = new Date();

    // Build where clause for unpaid invoices
    const where: any = {
      type: "FACTURE",
      balance: { gt: 0 },
      status: { in: ["SENT", "PARTIAL", "OVERDUE"] },
    };

    if (clientId) {
      where.clientId = clientId;
    }

    // Get all unpaid invoices
    const invoices = await prisma.cRMDocument.findMany({
      where,
      select: {
        id: true,
        number: true,
        date: true,
        dueDate: true,
        clientId: true,
        clientName: true,
        totalTTC: true,
        paidAmount: true,
        balance: true,
        status: true,
        client: {
          select: {
            id: true,
            fullName: true,
            clientNumber: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // Aging buckets: Current (not due), 1-30, 31-60, 61-90, 90+
    const aging = {
      current: { count: 0, total: 0, invoices: [] as any[] },
      days30: { count: 0, total: 0, invoices: [] as any[] },
      days60: { count: 0, total: 0, invoices: [] as any[] },
      days90: { count: 0, total: 0, invoices: [] as any[] },
      over90: { count: 0, total: 0, invoices: [] as any[] },
    };

    // By client summary
    const byClient: Record<
      string,
      {
        clientId: string | null;
        clientName: string;
        clientNumber: string | null;
        current: number;
        days30: number;
        days60: number;
        days90: number;
        over90: number;
        total: number;
        invoicesCount: number;
      }
    > = {};

    invoices.forEach((inv) => {
      const balance = Number(inv.balance);
      const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.date);
      const daysOverdue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const invoiceData = {
        id: inv.id,
        number: inv.number,
        date: inv.date,
        dueDate: inv.dueDate,
        clientName: inv.clientName,
        totalTTC: Number(inv.totalTTC),
        paidAmount: Number(inv.paidAmount),
        balance,
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
      };

      // Categorize by age
      let bucket: keyof typeof aging;
      if (daysOverdue <= 0) {
        bucket = "current";
      } else if (daysOverdue <= 30) {
        bucket = "days30";
      } else if (daysOverdue <= 60) {
        bucket = "days60";
      } else if (daysOverdue <= 90) {
        bucket = "days90";
      } else {
        bucket = "over90";
      }

      aging[bucket].count++;
      aging[bucket].total += balance;
      aging[bucket].invoices.push(invoiceData);

      // By client
      const clientKey = inv.clientId || inv.clientName;
      if (!byClient[clientKey]) {
        byClient[clientKey] = {
          clientId: inv.clientId,
          clientName: inv.clientName,
          clientNumber: inv.client?.clientNumber || null,
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          over90: 0,
          total: 0,
          invoicesCount: 0,
        };
      }

      byClient[clientKey][bucket] += balance;
      byClient[clientKey].total += balance;
      byClient[clientKey].invoicesCount++;
    });

    // Sort clients by total outstanding
    const clientList = Object.values(byClient).sort((a, b) => b.total - a.total);

    // Summary
    const summary = {
      totalOutstanding:
        aging.current.total +
        aging.days30.total +
        aging.days60.total +
        aging.days90.total +
        aging.over90.total,
      totalInvoices: invoices.length,
      totalClients: Object.keys(byClient).length,
      current: aging.current.total,
      overdue:
        aging.days30.total + aging.days60.total + aging.days90.total + aging.over90.total,
      overduePercent: 0,
    };

    summary.overduePercent =
      summary.totalOutstanding > 0
        ? (summary.overdue / summary.totalOutstanding) * 100
        : 0;

    // Average days outstanding
    const totalDays = invoices.reduce((sum, inv) => {
      const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.date);
      const days = Math.max(
        0,
        Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      return sum + days;
    }, 0);

    const avgDaysOutstanding = invoices.length > 0 ? totalDays / invoices.length : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          ...summary,
          avgDaysOutstanding: Math.round(avgDaysOutstanding),
        },
        aging: {
          current: { count: aging.current.count, total: aging.current.total },
          days30: { count: aging.days30.count, total: aging.days30.total },
          days60: { count: aging.days60.count, total: aging.days60.total },
          days90: { count: aging.days90.count, total: aging.days90.total },
          over90: { count: aging.over90.count, total: aging.over90.total },
        },
        byClient: clientList,
        invoices: invoices.map((inv) => {
          const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.date);
          const daysOverdue = Math.max(
            0,
            Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          );
          return {
            id: inv.id,
            number: inv.number,
            date: inv.date,
            dueDate: inv.dueDate,
            clientId: inv.clientId,
            clientName: inv.clientName,
            clientNumber: inv.client?.clientNumber,
            totalTTC: Number(inv.totalTTC),
            paidAmount: Number(inv.paidAmount),
            balance: Number(inv.balance),
            daysOverdue,
            status: inv.status,
          };
        }),
      },
    });
  } catch (error) {
    console.error("Error fetching receivables report:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la génération du rapport" },
      { status: 500 }
    );
  }
}
