import { prisma } from "@/lib/prisma";
import { AvoirFormClient } from "./AvoirFormClient";

// ═══════════════════════════════════════════════════════════
// Server Component - New Avoir (Credit Note)
// ═══════════════════════════════════════════════════════════

interface NewAvoirPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    factureId?: string;
  }>;
}

export default async function NewAvoirPage({ params, searchParams }: NewAvoirPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  // If coming from a Facture, load it
  let parentDocument = null;
  if (search.factureId) {
    parentDocument = await prisma.cRMDocument.findUnique({
      where: { id: search.factureId },
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
      clientNumber: true,
      email: true,
      phone: true,
      billingAddress: true,
      billingCity: true,
      billingPostalCode: true,
      ice: true,
      taxId: true,
    },
    orderBy: { fullName: "asc" },
  });

  // Fetch factures that can have avoirs
  const factures = await prisma.cRMDocument.findMany({
    where: {
      type: "FACTURE",
      status: { in: ["PAID", "PARTIAL", "SENT"] },
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
    <AvoirFormClient
      locale={locale}
      clients={clients}
      factures={factures.map((doc) => ({
        ...doc,
        totalTTC: Number(doc.totalTTC),
        paidAmount: Number(doc.paidAmount),
        balance: Number(doc.balance),
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
