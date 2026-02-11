export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { PVFormClient } from "./PVFormClient";

// ═══════════════════════════════════════════════════════════
// Server Component - New PV de Réception
// ═══════════════════════════════════════════════════════════

interface NewPVPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    blId?: string;
  }>;
}

export default async function NewPVPage({ params, searchParams }: NewPVPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  // If coming from a BL, load it
  let parentDocument = null;
  if (search.blId) {
    parentDocument = await prisma.cRMDocument.findUnique({
      where: { id: search.blId },
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
    },
    orderBy: { fullName: "asc" },
  });

  // Fetch available BLs (delivered or partial)
  const bonsLivraison = await prisma.cRMDocument.findMany({
    where: {
      type: "BON_LIVRAISON",
      status: { in: ["DELIVERED", "PARTIAL"] },
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
          totalHT: Number(item.totalHT),
          tvaRate: Number(item.tvaRate),
          tvaAmount: Number(item.totalTVA),
          totalTTC: Number(item.totalTTC),
        })),
      }
    : null;

  return (
    <PVFormClient
      locale={locale}
      clients={clients}
      bonsLivraison={bonsLivraison.map((bl) => ({
        ...bl,
        totalTTC: Number(bl.totalTTC),
        items: bl.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPriceHT: Number(item.unitPriceHT),
          discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
          totalHT: Number(item.totalHT),
          tvaRate: Number(item.tvaRate),
          tvaAmount: Number(item.totalTVA),
          totalTTC: Number(item.totalTTC),
        })),
      }))}
      parentDocument={transformedParent}
    />
  );
}
