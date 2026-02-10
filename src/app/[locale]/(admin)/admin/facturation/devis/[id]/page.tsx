import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DevisDetailClient } from "./DevisDetailClient";

// ═══════════════════════════════════════════════════════════
// Page Component - Server Side
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function DevisDetailPage({ params }: PageProps) {
  const { locale, id } = await params;

  // Fetch document with items and deposit invoices
  const document = await prisma.cRMDocument.findUnique({
    where: { id },
    include: {
      client: {
        select: { id: true, clientNumber: true },
      },
      project: {
        select: { id: true, name: true, projectNumber: true },
      },
      items: {
        orderBy: { order: "asc" },
      },
      children: {
        select: { id: true, number: true, type: true },
      },
      // Include deposit invoices linked to this devis
      depositInvoices: {
        select: {
          id: true,
          number: true,
          totalTTC: true,
          status: true,
          date: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!document || document.type !== "DEVIS") {
    notFound();
  }

  // Serialize data for client component (convert Decimal/Date to primitives)
  const serializedDocument = {
    id: document.id,
    number: document.number,
    status: document.status,
    date: document.date,
    validUntil: document.validUntil,
    deliveryTime: document.deliveryTime,
    clientId: document.clientId,
    clientName: document.clientName,
    clientAddress: document.clientAddress,
    clientCity: document.clientCity,
    clientPhone: document.clientPhone,
    clientEmail: document.clientEmail,
    clientIce: document.clientIce,
    totalHT: Number(document.totalHT),
    discountAmount: Number(document.discountAmount),
    netHT: Number(document.netHT),
    totalTVA: Number(document.totalTVA),
    totalTTC: Number(document.totalTTC),
    depositPercent: document.depositPercent ? Number(document.depositPercent) : null,
    depositAmount: document.depositAmount ? Number(document.depositAmount) : null,
    publicNotes: document.publicNotes,
    internalNotes: document.internalNotes,
    conditions: document.conditions,
    includes: document.includes as string[] | null,
    excludes: document.excludes as string[] | null,
    client: document.client,
    project: document.project,
    children: document.children,
    items: document.items.map((item) => ({
      id: item.id,
      reference: item.reference,
      designation: item.designation,
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPriceHT: Number(item.unitPriceHT),
      discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
      totalHT: Number(item.totalHT),
      order: item.order,
    })),
    depositInvoices: document.depositInvoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      totalTTC: Number(inv.totalTTC),
      status: inv.status,
      date: inv.date,
    })),
  };

  return <DevisDetailClient document={serializedDocument} locale={locale} />;
}
