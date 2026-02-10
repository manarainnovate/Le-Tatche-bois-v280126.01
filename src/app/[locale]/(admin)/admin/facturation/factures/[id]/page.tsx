import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FactureDetailClient } from "./FactureDetailClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Facture Detail Page
// ═══════════════════════════════════════════════════════════

interface FactureDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function FactureDetailPage({ params }: FactureDetailPageProps) {
  const { locale, id } = await params;

  const document = await prisma.cRMDocument.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          clientNumber: true,
          email: true,
          phone: true,
          billingAddress: true,
          billingCity: true,
          billingPostalCode: true,
          billingCountry: true,
          ice: true,
          rc: true,
          taxId: true,
        },
      },
      project: {
        select: { id: true, name: true, projectNumber: true },
      },
      parent: {
        select: { id: true, number: true, type: true },
      },
      children: {
        select: { id: true, number: true, type: true, status: true, totalTTC: true },
      },
      items: {
        include: {
          catalogItem: {
            select: { id: true, sku: true, name: true },
          },
        },
        orderBy: { order: "asc" },
      },
      payments: {
        orderBy: { date: "desc" },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      // Include linked devis and its deposit invoices for deposit deduction display
      linkedDevis: {
        select: {
          id: true,
          number: true,
          totalTTC: true,
          depositInvoices: {
            where: {
              status: { in: ["PAID", "PARTIAL"] },
            },
            select: {
              id: true,
              number: true,
              totalTTC: true,
              paidAmount: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!document || (document.type !== "FACTURE" && document.type !== "FACTURE_ACOMPTE")) {
    notFound();
  }

  // Calculate applied deposits from linked devis
  const appliedDeposits = document.linkedDevis?.depositInvoices?.map((inv) => ({
    id: inv.id,
    number: inv.number,
    totalTTC: Number(inv.totalTTC),
    paidAmount: Number(inv.paidAmount),
    status: inv.status,
  })) || [];

  const totalDepositsApplied = document.totalDepositsApplied
    ? Number(document.totalDepositsApplied)
    : appliedDeposits.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);

  // Transform document
  const transformedDocument = {
    ...document,
    totalHT: Number(document.totalHT),
    discountAmount: Number(document.discountAmount),
    discountValue: document.discountValue ? Number(document.discountValue) : null,
    netHT: Number(document.netHT),
    totalTVA: Number(document.totalTVA),
    totalTTC: Number(document.totalTTC),
    paidAmount: Number(document.paidAmount),
    balance: Number(document.balance),
    depositPercent: document.depositPercent ? Number(document.depositPercent) : null,
    depositAmount: document.depositAmount ? Number(document.depositAmount) : null,
    totalDepositsApplied,
    appliedDeposits,
    linkedDevis: document.linkedDevis ? {
      id: document.linkedDevis.id,
      number: document.linkedDevis.number,
      totalTTC: Number(document.linkedDevis.totalTTC),
    } : null,
    items: document.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPriceHT: Number(item.unitPriceHT),
      discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
      totalHT: Number(item.totalHT),
      tvaRate: Number(item.tvaRate),
      tvaAmount: Number(item.totalTVA),
      totalTTC: Number(item.totalTTC),
    })),
    children: document.children.map((child) => ({
      ...child,
      totalTTC: Number(child.totalTTC),
    })),
    payments: document.payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
    })),
  };

  return <FactureDetailClient document={transformedDocument} locale={locale} />;
}
