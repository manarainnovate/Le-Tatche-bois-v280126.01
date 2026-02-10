import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { CartContent } from "./CartContent";
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
  const seo = getPageSEO(locale as Locale, "cart");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/cart",
    noIndex: true,
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <CartContent
      locale={locale}
      translations={{
        title: t("title"),
        items: t("items"),
        empty: t("empty"),
        emptyDescription: t("emptyDescription"),
        continueShopping: t("continueShopping"),
        clearCart: t("clearCart"),
        removeItem: t("removeItem"),
        orderSummary: t("orderSummary"),
        promoCode: t("promoCode"),
        applyCode: t("applyCode"),
        promoApplied: t("promoApplied"),
        promoInvalid: t("promoInvalid"),
        subtotal: t("subtotal"),
        discount: t("discount"),
        shipping: t("shipping"),
        total: t("total"),
        checkout: t("checkout"),
        freeShippingBadge: t("freeShippingBadge"),
        freeShippingThreshold: t("freeShippingThreshold"),
        secureCheckout: t("secureCheckout"),
        free: tCommon("free"),
      }}
    />
  );
}
