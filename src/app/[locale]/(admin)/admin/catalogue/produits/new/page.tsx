export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { ItemForm } from "@/components/catalog";

// ═══════════════════════════════════════════════════════════
// Server Component - New Product Page
// ═══════════════════════════════════════════════════════════

interface NewProductPageProps {
  params: Promise<{ locale: string }>;
}

// Helper: Build category tree
function buildCategoryTree(categories: any[]): any[] {
  const map = new Map();
  const roots: any[] = [];

  // Create map of all categories
  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  // Build tree
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

export default async function NewProductPage({ params }: NewProductPageProps) {
  const { locale } = await params;

  // Fetch categories and suppliers for the form
  const [categories, suppliers] = await Promise.all([
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

  const categoryTree = buildCategoryTree(categories);

  return (
    <ItemForm
      type="PRODUCT"
      locale={locale}
      categories={categoryTree}
      suppliers={suppliers}
    />
  );
}
