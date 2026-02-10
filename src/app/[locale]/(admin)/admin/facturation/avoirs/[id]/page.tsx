import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AvoirDetailClient } from "./AvoirDetailClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Avoir Detail Page
// ═══════════════════════════════════════════════════════════

interface AvoirDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function AvoirDetailPage({ params }: AvoirDetailPageProps) {
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
        select: { id: true, number: true, type: true, totalTTC: true },
      },
      items: {
        include: {
          catalogItem: {
            select: { id: true, sku: true, name: true },
          },
        },
        orderBy: { order: "asc" },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!document || document.type !== "AVOIR") {
    notFound();
  }

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
    items: document.items.map((item) => ({
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
    parent: document.parent
      ? {
          ...document.parent,
          totalTTC: Number(document.parent.totalTTC),
        }
      : null,
  };

  return <AvoirDetailClient document={transformedDocument} locale={locale} />;
}
