import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ItemDetailClient } from "./ItemDetailClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Product Detail Page
// ═══════════════════════════════════════════════════════════

interface ProductDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, id } = await params;

  const item = await prisma.catalogItem.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      supplier: {
        select: { id: true, name: true, code: true, phone: true, email: true },
      },
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      priceHistory: {
        orderBy: { changedAt: "desc" },
        take: 10,
      },
      _count: {
        select: { documentItems: true },
      },
    },
  });

  if (!item) {
    notFound();
  }

  // Transform numeric values
  const transformedItem = {
    ...item,
    purchasePrice: item.purchasePrice ? Number(item.purchasePrice) : null,
    sellingPriceHT: Number(item.sellingPriceHT),
    tvaRate: Number(item.tvaRate),
    maxDiscount: item.maxDiscount ? Number(item.maxDiscount) : null,
    stockQty: Number(item.stockQty),
    stockMin: item.stockMin ? Number(item.stockMin) : null,
    stockMax: item.stockMax ? Number(item.stockMax) : null,
    sellingPriceTTC: Number(item.sellingPriceHT) * (1 + Number(item.tvaRate) / 100),
    isLowStock: Boolean(item.trackStock && item.stockMin && Number(item.stockQty) <= Number(item.stockMin)),
    stockMovements: item.stockMovements.map((m) => ({
      ...m,
      quantity: Number(m.quantity),
      previousQty: Number(m.previousQty),
      newQty: Number(m.newQty),
      unitCost: m.unitCost ? Number(m.unitCost) : null,
    })),
    priceHistory: item.priceHistory.map((p) => ({
      ...p,
      oldPrice: Number(p.oldPrice),
      newPrice: Number(p.newPrice),
    })),
  };

  return <ItemDetailClient item={transformedItem} locale={locale} />;
}
