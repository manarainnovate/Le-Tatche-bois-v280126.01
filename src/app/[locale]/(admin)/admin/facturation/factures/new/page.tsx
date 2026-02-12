export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { FactureFormClient } from "./FactureFormClient";

// ═══════════════════════════════════════════════════════════
// Server Component - New Facture
// ═══════════════════════════════════════════════════════════

interface NewFacturePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    pvId?: string;
    blId?: string;
    bcId?: string;
  }>;
}

export default async function NewFacturePage({ params, searchParams }: NewFacturePageProps) {
  const { locale } = await params;
  const search = await searchParams;

  // If coming from a PV, BL or BC, load it
  let parentDocument = null;
  const parentId = search.pvId || search.blId || search.bcId;

  if (parentId) {
    parentDocument = await prisma.cRMDocument.findUnique({
      where: { id: parentId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            company: true,
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
  }

  // Fetch clients
  const clients = await prisma.cRMClient.findMany({
    select: {
      id: true,
      fullName: true,
      company: true,
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

  // Fetch available documents that can be invoiced (PV, BL, BC with appropriate status)
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

  // Fetch catalog items for line selection
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

  // Transform parent document if exists
  const transformedParent = parentDocument
    ? {
        ...parentDocument,
        totalHT: Number(parentDocument.totalHT),
        discountAmount: Number(parentDocument.discountAmount),
        netHT: Number(parentDocument.netHT),
        totalTVA: Number(parentDocument.totalTVA),
        totalTTC: Number(parentDocument.totalTTC),
        paidAmount: Number(parentDocument.paidAmount),
        balance: Number(parentDocument.balance),
        items: parentDocument.items.map((item) => ({
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
      }
    : null;

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
      parentDocument={transformedParent}
    />
  );
}
