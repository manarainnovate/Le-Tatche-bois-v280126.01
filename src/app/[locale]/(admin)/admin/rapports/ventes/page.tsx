import { prisma } from "@/lib/prisma";
import { SalesReportClient } from "./SalesReportClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Sales Report Page
// ═══════════════════════════════════════════════════════════

interface SalesReportPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    groupBy?: string;
    clientId?: string;
  }>;
}

export default async function SalesReportPage({
  params,
  searchParams,
}: SalesReportPageProps) {
  const { locale } = await params;
  const filters = await searchParams;

  const now = new Date();
  const startDate = filters.startDate
    ? new Date(filters.startDate)
    : new Date(now.getFullYear(), 0, 1);
  const endDate = filters.endDate ? new Date(filters.endDate) : now;
  const groupBy = filters.groupBy || "month";

  // Build where clause
  const where: any = {
    type: "FACTURE",
    date: { gte: startDate, lte: endDate },
    status: { not: "DRAFT" },
  };

  if (filters.clientId) {
    where.clientId = filters.clientId;
  }

  // Get invoices
  const invoices = await prisma.cRMDocument.findMany({
    where,
    select: {
      id: true,
      number: true,
      date: true,
      clientId: true,
      clientName: true,
      totalHT: true,
      totalTVA: true,
      totalTTC: true,
      paidAmount: true,
      balance: true,
      status: true,
    },
    orderBy: { date: "asc" },
  });

  // Group data by period
  const grouped: Record<
    string,
    {
      period: string;
      invoicesCount: number;
      totalHT: number;
      totalTVA: number;
      totalTTC: number;
      paidAmount: number;
      balance: number;
    }
  > = {};

  invoices.forEach((inv) => {
    const date = new Date(inv.date);
    let key: string;

    switch (groupBy) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "week":
        const weekNum = Math.ceil(
          (date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) /
            7
        );
        key = `S${weekNum} - ${date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })}`;
        break;
      default: // month
        key = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        invoicesCount: 0,
        totalHT: 0,
        totalTVA: 0,
        totalTTC: 0,
        paidAmount: 0,
        balance: 0,
      };
    }

    grouped[key].invoicesCount++;
    grouped[key].totalHT += Number(inv.totalHT);
    grouped[key].totalTVA += Number(inv.totalTVA);
    grouped[key].totalTTC += Number(inv.totalTTC);
    grouped[key].paidAmount += Number(inv.paidAmount);
    grouped[key].balance += Number(inv.balance);
  });

  // Sales by client
  const byClientRaw = await prisma.cRMDocument.groupBy({
    by: ["clientId", "clientName"],
    where,
    _sum: { totalTTC: true, paidAmount: true },
    _count: true,
    orderBy: { _sum: { totalTTC: "desc" } },
    take: 10,
  });

  // Summary
  const summary = invoices.reduce(
    (acc, inv) => ({
      count: acc.count + 1,
      totalHT: acc.totalHT + Number(inv.totalHT),
      totalTVA: acc.totalTVA + Number(inv.totalTVA),
      totalTTC: acc.totalTTC + Number(inv.totalTTC),
      paidAmount: acc.paidAmount + Number(inv.paidAmount),
      balance: acc.balance + Number(inv.balance),
    }),
    { count: 0, totalHT: 0, totalTVA: 0, totalTTC: 0, paidAmount: 0, balance: 0 }
  );

  // Get clients for filter
  const clients = await prisma.cRMClient.findMany({
    select: { id: true, fullName: true, clientNumber: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <SalesReportClient
      summary={summary}
      byPeriod={Object.values(grouped)}
      byClient={byClientRaw.map((c) => ({
        clientId: c.clientId,
        clientName: c.clientName,
        invoicesCount: c._count,
        totalTTC: Number(c._sum.totalTTC || 0),
        paidAmount: Number(c._sum.paidAmount || 0),
      }))}
      clients={clients}
      filters={{
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        groupBy,
        clientId: filters.clientId || "",
      }}
      locale={locale}
    />
  );
}
