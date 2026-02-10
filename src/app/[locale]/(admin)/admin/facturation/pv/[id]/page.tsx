import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PVDetailClient } from "./PVDetailClient";

// ═══════════════════════════════════════════════════════════
// Server Component - PV Detail Page
// ═══════════════════════════════════════════════════════════

interface PVDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PVDetailPage({ params }: PVDetailPageProps) {
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

  if (!document || document.type !== "PV_RECEPTION") {
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
      id: item.id,
      catalogItemId: item.catalogItemId,
      reference: item.reference,
      designation: item.designation,
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPriceHT: Number(item.unitPriceHT),
      discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
      discountAmount: Number(item.discountAmount),
      totalHT: Number(item.totalHT),
      tvaRate: Number(item.tvaRate),
      tvaAmount: Number(item.totalTVA),
      totalTVA: Number(item.totalTVA),
      totalTTC: Number(item.totalTTC),
      catalogItem: item.catalogItem,
    })),
    children: document.children.map((child) => ({
      ...child,
      totalTTC: Number(child.totalTTC),
    })),
  };

  return <PVDetailClient document={transformedDocument} locale={locale} />;
}
