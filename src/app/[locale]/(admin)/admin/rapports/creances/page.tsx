export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { ReceivablesReportClient } from "./ReceivablesReportClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Receivables Aging Report Page
// ═══════════════════════════════════════════════════════════

interface ReceivablesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ clientId?: string }>;
}

export default async function ReceivablesPage({
  params,
  searchParams,
}: ReceivablesPageProps) {
  const { locale } = await params;
  const { clientId } = await searchParams;

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
    current: { count: 0, total: 0 },
    days30: { count: 0, total: 0 },
    days60: { count: 0, total: 0 },
    days90: { count: 0, total: 0 },
    over90: { count: 0, total: 0 },
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

  // Process invoices
  const processedInvoices = invoices.map((inv) => {
    const balance = Number(inv.balance);
    const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.date);
    const daysOverdue = Math.floor(
      (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

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

    return {
      id: inv.id,
      number: inv.number,
      date: inv.date,
      dueDate: inv.dueDate,
      clientId: inv.clientId,
      clientName: inv.clientName,
      clientNumber: inv.client?.clientNumber || null,
      totalTTC: Number(inv.totalTTC),
      paidAmount: Number(inv.paidAmount),
      balance,
      daysOverdue: Math.max(0, daysOverdue),
      status: inv.status,
      bucket,
    };
  });

  // Summary
  const totalOutstanding =
    aging.current.total +
    aging.days30.total +
    aging.days60.total +
    aging.days90.total +
    aging.over90.total;

  const overdue =
    aging.days30.total + aging.days60.total + aging.days90.total + aging.over90.total;

  // Average days outstanding
  const totalDays = processedInvoices.reduce((sum, inv) => sum + inv.daysOverdue, 0);
  const avgDaysOutstanding =
    processedInvoices.length > 0 ? totalDays / processedInvoices.length : 0;

  // Get clients for filter
  const clients = await prisma.cRMClient.findMany({
    select: { id: true, fullName: true, clientNumber: true },
    orderBy: { fullName: "asc" },
  });

  // Sort clients by total
  const clientList = Object.values(byClient).sort((a, b) => b.total - a.total);

  return (
    <ReceivablesReportClient
      summary={{
        totalOutstanding,
        totalInvoices: processedInvoices.length,
        totalClients: Object.keys(byClient).length,
        current: aging.current.total,
        overdue,
        overduePercent: totalOutstanding > 0 ? (overdue / totalOutstanding) * 100 : 0,
        avgDaysOutstanding: Math.round(avgDaysOutstanding),
      }}
      aging={aging}
      byClient={clientList}
      invoices={processedInvoices}
      clients={clients}
      selectedClientId={clientId || ""}
      locale={locale}
    />
  );
}
