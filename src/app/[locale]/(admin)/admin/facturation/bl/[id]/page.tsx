export const dynamic = 'force-dynamic';


import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BLDetailClient } from "./BLDetailClient";

// ═══════════════════════════════════════════════════════════
// Server Component - BL Detail Page
// ═══════════════════════════════════════════════════════════

interface BLDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function BLDetailPage({ params }: BLDetailPageProps) {
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
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!document || document.type !== "BON_LIVRAISON") {
    notFound();
  }

  // Transform document
  const transformedDocument = {
    ...document,
    totalHT: Number(document.totalHT),
    discountAmount: Number(document.discountAmount),
    netHT: Number(document.netHT),
    totalTVA: Number(document.totalTVA),
    totalTTC: Number(document.totalTTC),
    paidAmount: Number(document.paidAmount),
    balance: Number(document.balance),
    depositPercent: document.depositPercent ? Number(document.depositPercent) : null,
    depositAmount: document.depositAmount ? Number(document.depositAmount) : null,
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
    children: document.children.map((child) => ({
      ...child,
      totalTTC: Number(child.totalTTC),
    })),
  };

  return <BLDetailClient document={transformedDocument} locale={locale} />;
}
