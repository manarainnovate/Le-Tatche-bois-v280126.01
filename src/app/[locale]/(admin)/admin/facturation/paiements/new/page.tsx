export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { NewPaymentFormClient } from "./NewPaymentFormClient";

// ═══════════════════════════════════════════════════════════
// Server Component - New Payment Page
// ═══════════════════════════════════════════════════════════

interface NewPaymentPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invoiceId?: string }>;
}

export default async function NewPaymentPage({
  params,
  searchParams,
}: NewPaymentPageProps) {
  const { locale } = await params;
  const { invoiceId } = await searchParams;

  // Get clients with their unpaid invoices
  const clients = await prisma.cRMClient.findMany({
    where: {
      documents: {
        some: {
          type: "FACTURE",
          balance: { gt: 0 },
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      clientNumber: true,
      documents: {
        where: {
          type: "FACTURE",
          balance: { gt: 0 },
        },
        select: {
          id: true,
          number: true,
          date: true,
          totalTTC: true,
          paidAmount: true,
          balance: true,
          status: true,
        },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { fullName: "asc" },
  });

  // Transform data
  const transformedClients = clients.map((client) => ({
    ...client,
    documents: client.documents.map((doc) => ({
      ...doc,
      totalTTC: Number(doc.totalTTC),
      paidAmount: Number(doc.paidAmount),
      balance: Number(doc.balance),
    })),
  }));

  // If invoiceId is provided, get that specific invoice
  let preselectedInvoice = null;
  if (invoiceId) {
    const invoice = await prisma.cRMDocument.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        number: true,
        clientId: true,
        clientName: true,
        totalTTC: true,
        paidAmount: true,
        balance: true,
      },
    });
    if (invoice) {
      preselectedInvoice = {
        ...invoice,
        totalTTC: Number(invoice.totalTTC),
        paidAmount: Number(invoice.paidAmount),
        balance: Number(invoice.balance),
      };
    }
  }

  return (
    <NewPaymentFormClient
      clients={transformedClients}
      preselectedInvoice={preselectedInvoice}
      locale={locale}
    />
  );
}
