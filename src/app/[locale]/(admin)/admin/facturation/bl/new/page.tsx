export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { BLFormClient } from "./BLFormClient";

// ═══════════════════════════════════════════════════════════
// Server Component - New Bon de Livraison
// ═══════════════════════════════════════════════════════════

interface NewBLPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    bcId?: string;
  }>;
}

export default async function NewBLPage({ params, searchParams }: NewBLPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  // If coming from a BC, load it
  let parentDocument = null;
  if (search.bcId) {
    parentDocument = await prisma.cRMDocument.findUnique({
      where: { id: search.bcId },
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

  // Fetch available BCs (confirmed or partial)
  const bonsCommande = await prisma.cRMDocument.findMany({
    where: {
      type: "BON_COMMANDE",
      status: { in: ["CONFIRMED", "PARTIAL"] },
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
          discountAmount: Number(item.discountAmount),
          totalHT: Number(item.totalHT),
          tvaRate: Number(item.tvaRate),
          totalTVA: Number(item.totalTVA),
          totalTTC: Number(item.totalTTC),
        })),
      }
    : null;

  return (
    <BLFormClient
      locale={locale}
      clients={clients}
      bonsCommande={bonsCommande.map((bc) => ({
        ...bc,
        totalTTC: Number(bc.totalTTC),
        items: bc.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPriceHT: Number(item.unitPriceHT),
          discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
          discountAmount: Number(item.discountAmount),
          totalHT: Number(item.totalHT),
          tvaRate: Number(item.tvaRate),
          totalTVA: Number(item.totalTVA),
          totalTTC: Number(item.totalTTC),
        })),
      }))}
      parentDocument={transformedParent}
    />
  );
}
