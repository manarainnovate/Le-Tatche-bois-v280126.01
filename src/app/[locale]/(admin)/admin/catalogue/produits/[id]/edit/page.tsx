import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ItemForm } from "@/components/catalog";

// ═══════════════════════════════════════════════════════════
// Server Component - Edit Product Page
// ═══════════════════════════════════════════════════════════

interface EditProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

// Helper: Build category tree
function buildCategoryTree(categories: any[]): any[] {
  const map = new Map();
  const roots: any[] = [];

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of categories) {
    const node = map.get(cat.id);
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { locale, id } = await params;

  // Fetch item, categories, and suppliers
  const [item, categories, suppliers] = await Promise.all([
    prisma.catalogItem.findUnique({
      where: { id },
      select: {
        id: true,
        sku: true,
        type: true,
        categoryId: true,
        name: true,
        description: true,
        unit: true,
        purchasePrice: true,
        sellingPriceHT: true,
        tvaRate: true,
        maxDiscount: true,
        trackStock: true,
        stockQty: true,
        stockMin: true,
        stockMax: true,
        stockLocation: true,
        supplierId: true,
        images: true,
        isActive: true,
      },
    }),
    prisma.catalogCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!item) {
    notFound();
  }

  const categoryTree = buildCategoryTree(categories);

  // Transform item for form
  const initialData = {
    id: item.id,
    sku: item.sku,
    type: item.type as "PRODUCT" | "SERVICE",
    categoryId: item.categoryId || undefined,
    name: item.name,
    description: item.description || undefined,
    unit: item.unit,
    purchasePrice: item.purchasePrice ? Number(item.purchasePrice) : undefined,
    sellingPriceHT: Number(item.sellingPriceHT),
    tvaRate: Number(item.tvaRate),
    maxDiscount: item.maxDiscount ? Number(item.maxDiscount) : undefined,
    trackStock: item.trackStock,
    stockQty: Number(item.stockQty),
    stockMin: item.stockMin ? Number(item.stockMin) : undefined,
    stockMax: item.stockMax ? Number(item.stockMax) : undefined,
    stockLocation: item.stockLocation || undefined,
    supplierId: item.supplierId || undefined,
    images: item.images as string[],
    isActive: item.isActive,
  };

  return (
    <ItemForm
      type="PRODUCT"
      locale={locale}
      categories={categoryTree}
      suppliers={suppliers}
      initialData={initialData}
      isEdit
    />
  );
}
