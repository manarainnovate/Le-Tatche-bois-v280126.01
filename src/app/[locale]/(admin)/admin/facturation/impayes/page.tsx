import { prisma } from "@/lib/prisma";
import { ImpayesPageClient } from "./ImpayesPageClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Unpaid Invoices Page
// ═══════════════════════════════════════════════════════════

interface ImpayesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ImpayesPage({ params }: ImpayesPageProps) {
  const { locale } = await params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch unpaid invoices
  const invoices = await prisma.cRMDocument.findMany({
    where: {
      type: "FACTURE",
      balance: { gt: 0 },
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  // Calculate aging buckets
  const agingData = {
    current: { count: 0, amount: 0, invoices: [] as typeof invoices },
    days1to30: { count: 0, amount: 0, invoices: [] as typeof invoices },
    days31to60: { count: 0, amount: 0, invoices: [] as typeof invoices },
    days61to90: { count: 0, amount: 0, invoices: [] as typeof invoices },
    over90: { count: 0, amount: 0, invoices: [] as typeof invoices },
  };

  for (const invoice of invoices) {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoice.date);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const balance = Number(invoice.balance);

    if (daysDiff <= 0) {
      agingData.current.count++;
      agingData.current.amount += balance;
      agingData.current.invoices.push(invoice);
    } else if (daysDiff <= 30) {
      agingData.days1to30.count++;
      agingData.days1to30.amount += balance;
      agingData.days1to30.invoices.push(invoice);
    } else if (daysDiff <= 60) {
      agingData.days31to60.count++;
      agingData.days31to60.amount += balance;
      agingData.days31to60.invoices.push(invoice);
    } else if (daysDiff <= 90) {
      agingData.days61to90.count++;
      agingData.days61to90.amount += balance;
      agingData.days61to90.invoices.push(invoice);
    } else {
      agingData.over90.count++;
      agingData.over90.amount += balance;
      agingData.over90.invoices.push(invoice);
    }
  }

  // Calculate totals
  const totalUnpaid = invoices.reduce((sum, inv) => sum + Number(inv.balance), 0);
  const totalOverdue = agingData.days1to30.amount + agingData.days31to60.amount + agingData.days61to90.amount + agingData.over90.amount;

  // Format invoices for client
  const formattedInvoices = invoices.map((inv) => {
    const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.date);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: inv.id,
      number: inv.number,
      date: inv.date.toISOString(),
      dueDate: dueDate.toISOString(),
      clientId: inv.clientId,
      clientName: inv.clientName,
      clientEmail: inv.client?.email ?? null,
      clientPhone: inv.client?.phone ?? null,
      total: Number(inv.totalTTC),
      paidAmount: Number(inv.paidAmount),
      balance: Number(inv.balance),
      daysOverdue: Math.max(0, daysDiff),
      status: inv.status,
    };
  });

  return (
    <ImpayesPageClient
      locale={locale}
      invoices={formattedInvoices}
      agingData={{
        current: { count: agingData.current.count, amount: agingData.current.amount },
        days1to30: { count: agingData.days1to30.count, amount: agingData.days1to30.amount },
        days31to60: { count: agingData.days31to60.count, amount: agingData.days31to60.amount },
        days61to90: { count: agingData.days61to90.count, amount: agingData.days61to90.amount },
        over90: { count: agingData.over90.count, amount: agingData.over90.amount },
      }}
      totalUnpaid={totalUnpaid}
      totalOverdue={totalOverdue}
    />
  );
}
