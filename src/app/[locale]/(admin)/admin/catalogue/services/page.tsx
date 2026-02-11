export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CatalogPageClient } from "../produits/CatalogPageClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Services List Page
// ═══════════════════════════════════════════════════════════

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    categoryId?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ServicesPage({
  params,
  searchParams,
}: ServicesPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  const page = parseInt(search.page || "1", 10);
  const limit = 24;
  const offset = (page - 1) * limit;

  // Build where clause
  const where: any = {
    type: "SERVICE",
    isActive: true,
  };
  if (search.categoryId) where.categoryId = search.categoryId;
  if (search.search) {
    where.OR = [
      { name: { contains: search.search, mode: "insensitive" } },
      { sku: { contains: search.search, mode: "insensitive" } },
      { description: { contains: search.search, mode: "insensitive" } },
    ];
  }

  // Fetch data in parallel
  const [items, total, categories] = await Promise.all([
    prisma.catalogItem.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { name: "asc" },
      take: limit,
      skip: offset,
    }),
    prisma.catalogItem.count({ where }),
    prisma.catalogCategory.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              include: { _count: { select: { items: true } } },
            },
            _count: { select: { items: true } },
          },
        },
        _count: { select: { items: true, children: true } },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  // Transform items
  const transformedItems = items.map((item) => ({
    id: item.id,
    sku: item.sku,
    type: item.type,
    name: item.name,
    description: item.description,
    unit: item.unit,
    purchasePrice: item.purchasePrice ? Number(item.purchasePrice) : null,
    sellingPriceHT: Number(item.sellingPriceHT),
    tvaRate: Number(item.tvaRate),
    sellingPriceTTC: Number(item.sellingPriceHT) * (1 + Number(item.tvaRate) / 100),
    maxDiscount: item.maxDiscount ? Number(item.maxDiscount) : null,
    trackStock: false,
    stockQty: 0,
    stockMin: null,
    stockMax: null,
    stockLocation: null,
    images: item.images,
    isActive: item.isActive,
    isLowStock: false,
    category: item.category,
    supplier: null,
  }));

  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      }
    >
      <CatalogPageClient
        type="SERVICE"
        items={transformedItems}
        categories={categories}
        suppliers={[]}
        locale={locale}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        totalCount={total}
        filters={{
          categoryId: search.categoryId || "",
          supplierId: "",
          search: search.search || "",
          lowStock: false,
        }}
      />
    </Suspense>
  );
}
