import { prisma } from "@/lib/prisma";
import { ItemForm } from "@/components/catalog";

// ═══════════════════════════════════════════════════════════
// Server Component - New Service Page
// ═══════════════════════════════════════════════════════════

interface NewServicePageProps {
  params: Promise<{ locale: string }>;
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

export default async function NewServicePage({ params }: NewServicePageProps) {
  const { locale } = await params;

  // Fetch categories (services don't need suppliers)
  const categories = await prisma.catalogCategory.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
    orderBy: { name: "asc" },
  });

  const categoryTree = buildCategoryTree(categories);

  return (
    <ItemForm
      type="SERVICE"
      locale={locale}
      categories={categoryTree}
      suppliers={[]}
    />
  );
}
