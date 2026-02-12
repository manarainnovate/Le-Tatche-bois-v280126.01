export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { FactureFormClient } from "../../new/FactureFormClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Edit Facture
// ═══════════════════════════════════════════════════════════

interface EditFacturePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditFacturePage({ params }: EditFacturePageProps) {
  const { locale, id } = await params;

  // Fetch the document to edit
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
          ice: true,
          taxId: true,
          paymentTerms: true,
        },
      },
      project: {
        select: { id: true, name: true, projectNumber: true },
      },
      items: {
        include: {
          catalogItem: {
            select: { id: true, sku: true, name: true },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  // Check if document exists
  if (!document) {
    notFound();
  }

  // Check if document is a facture
  if (document.type !== "FACTURE" && document.type !== "FACTURE_ACOMPTE") {
    redirect(`/${locale}/admin/facturation/factures`);
  }

  // Check if document is editable (not locked/issued)
  if (document.isLocked || !document.isDraft) {
    redirect(`/${locale}/admin/facturation/factures/${id}?error=locked`);
  }

  // Fetch clients for the selector
  const clients = await prisma.cRMClient.findMany({
    select: {
      id: true,
      fullName: true,
      clientNumber: true,
      email: true,
      phone: true,
      billingAddress: true,
      billingCity: true,
      billingPostalCode: true,
      ice: true,
      taxId: true,
      paymentTerms: true,
    },
    orderBy: { fullName: "asc" },
  });

  // Fetch available documents that can be invoiced
  const availableDocuments = await prisma.cRMDocument.findMany({
    where: {
      OR: [
        { type: "PV_RECEPTION", status: "SIGNED" },
        { type: "BON_LIVRAISON", status: { in: ["DELIVERED", "PARTIAL"] } },
        { type: "BON_COMMANDE", status: { in: ["CONFIRMED", "PARTIAL"] } },
      ],
    },
    include: {
      client: {
        select: { id: true, fullName: true, clientNumber: true },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Fetch catalog items
  const catalogItems = await prisma.catalogItem.findMany({
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      name: true,
      sellingPriceHT: true,
      tvaRate: true,
      unit: true,
    },
    orderBy: { name: "asc" },
    take: 500,
  });

  // Transform document to match the form's expected format
  const transformedDocument = {
    ...document,
    totalHT: Number(document.totalHT),
    discountAmount: Number(document.discountAmount),
    netHT: Number(document.netHT),
    totalTVA: Number(document.totalTVA),
    totalTTC: Number(document.totalTTC),
    paidAmount: Number(document.paidAmount),
    balance: Number(document.balance),
    discountValue: document.discountValue ? Number(document.discountValue) : null,
    depositPercent: document.depositPercent ? Number(document.depositPercent) : null,
    depositAmount: document.depositAmount ? Number(document.depositAmount) : null,
    items: document.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPriceHT: Number(item.unitPriceHT),
      discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
      discountAmount: Number(item.discountAmount),
      tvaRate: Number(item.tvaRate),
      totalHT: Number(item.totalHT),
      totalTVA: Number(item.totalTVA),
      totalTTC: Number(item.totalTTC),
    })),
  };

  return (
    <FactureFormClient
      locale={locale}
      clients={clients}
      availableDocuments={availableDocuments.map((doc) => ({
        ...doc,
        totalTTC: Number(doc.totalTTC),
        items: doc.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPriceHT: Number(item.unitPriceHT),
          discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
          discountAmount: Number(item.discountAmount),
          tvaRate: Number(item.tvaRate),
          totalHT: Number(item.totalHT),
          totalTVA: Number(item.totalTVA),
          totalTTC: Number(item.totalTTC),
        })),
      }))}
      catalogItems={catalogItems.map((item) => ({
        ...item,
        sellingPriceHT: Number(item.sellingPriceHT),
        tvaRate: Number(item.tvaRate),
      }))}
      parentDocument={null}
      existingDocument={transformedDocument}
    />
  );
}
