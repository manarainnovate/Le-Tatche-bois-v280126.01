import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

// ═══════════════════════════════════════════════════════════
// Get Categories
// ═══════════════════════════════════════════════════════════

async function getCategories() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      translations: {
        select: { name: true, locale: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return categories;
}

// ═══════════════════════════════════════════════════════════
// New Product Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewProductPage({ params }: PageProps) {
  const { locale } = await params;
  const categories = await getCategories();

  return <ProductForm categories={categories} locale={locale} />;
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "New Product",
};
