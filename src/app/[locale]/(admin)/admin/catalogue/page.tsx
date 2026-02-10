import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════════════════
// Catalog Index - Redirect to Products
// ═══════════════════════════════════════════════════════════

interface CatalogPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CatalogPage({ params }: CatalogPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/admin/catalogue/produits`);
}
