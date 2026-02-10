import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { StockPageClient } from "./StockPageClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Stock Management Page
// ═══════════════════════════════════════════════════════════

interface StockPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    lowStock?: string;
    categoryId?: string;
    search?: string;
  }>;
}

export default async function StockPage({
  params,
  searchParams,
}: StockPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  // Fetch tracked items
  const where: any = {
    trackStock: true,
    isActive: true,
  };

  if (search.categoryId) where.categoryId = search.categoryId;
  if (search.search) {
    where.OR = [
      { name: { contains: search.search, mode: "insensitive" } },
      { sku: { contains: search.search, mode: "insensitive" } },
    ];
  }

  const [items, categories] = await Promise.all([
    prisma.catalogItem.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.catalogCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Transform and calculate alerts
  const transformedItems = items.map((item) => {
    const stockQty = Number(item.stockQty);
    const stockMin = item.stockMin ? Number(item.stockMin) : null;
    const stockMax = item.stockMax ? Number(item.stockMax) : null;

    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      unit: item.unit,
      stockQty,
      stockMin,
      stockMax,
      stockLocation: item.stockLocation,
      category: item.category,
      supplier: item.supplier,
      isLowStock: stockMin !== null && stockQty <= stockMin,
      isOverStock: stockMax !== null && stockQty >= stockMax,
    };
  });

  // Filter low stock if requested
  const filteredItems = search.lowStock === "true"
    ? transformedItems.filter((item) => item.isLowStock)
    : transformedItems;

  // Stats
  const stats = {
    totalItems: items.length,
    lowStockItems: transformedItems.filter((i) => i.isLowStock).length,
    overStockItems: transformedItems.filter((i) => i.isOverStock).length,
    outOfStockItems: transformedItems.filter((i) => i.stockQty === 0).length,
  };

  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      }
    >
      <StockPageClient
        items={filteredItems}
        categories={categories}
        stats={stats}
        locale={locale}
        filters={{
          lowStock: search.lowStock === "true",
          categoryId: search.categoryId || "",
          search: search.search || "",
        }}
      />
    </Suspense>
  );
}
