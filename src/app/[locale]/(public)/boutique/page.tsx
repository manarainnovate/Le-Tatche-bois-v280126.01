import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { BoutiqueContent } from "./BoutiqueContent";
import { BoutiqueHero } from "@/components/public/BoutiqueHero";
import { generateSEOMetadata, getPageSEO, Locale } from "@/lib/seo";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

// ═══════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSEO(locale as Locale, "shop");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/boutique",
    keywords: [
      "boutique artisanale",
      "meubles bois",
      "objets décoration",
      "artisanat marocain",
      "achat en ligne",
      "LE TATCHE BOIS",
    ],
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function BoutiquePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  const isRTL = locale === "ar";

  return (
    <main className="min-h-screen">
      {/* Hero Section (client component for theme settings) */}
      <BoutiqueHero
        isRTL={isRTL}
        translations={{
          badge: t("hero.badge"),
          title: t("hero.title"),
          subtitle: t("hero.subtitle"),
        }}
      />

      {/* Client-side content with filters and products */}
      <BoutiqueContent
        locale={locale}
        translations={{
          search: t("filters.search"),
          filterByCategory: t("filters.category"),
          sortBy: t("filters.sortBy"),
          filters: t("filters.title"),
          productsFound: t("productsFound"),
          noProducts: t("noProducts"),
          resetFilters: t("resetFilters"),
          addToCart: t("addToCart"),
          addedToCart: t("addedToCart"),
          outOfStock: t("outOfStock"),
          lowStock: t.raw("lowStock") as string,
          viewProduct: t("viewProduct"),
          categories: {
            all: t("categories.all"),
            decoration: t("categories.decoration"),
            mobilier: t("categories.mobilier"),
            accessoires: t("categories.accessoires"),
            textile: t("categories.textile"),
          },
          sortOptions: {
            newest: t("sort.newest"),
            priceAsc: t("sort.priceAsc"),
            priceDesc: t("sort.priceDesc"),
            popular: t("sort.popular"),
          },
        }}
      />
    </main>
  );
}
