import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { OrderConfirmationContent } from "./OrderConfirmationContent";
import { generateSEOMetadata, Locale } from "@/lib/seo";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}

// ═══════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "order" });

  return generateSEOMetadata({
    title: t("confirmation.title"),
    description: t("confirmation.subtitle"),
    locale: locale as Locale,
    path: "/commande/confirmation",
    noIndex: true,
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: "order" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const orderNumber = resolvedSearchParams.order ?? "ORD-00000";

  // TODO: Fetch order details from database using orderNumber

  return (
    <OrderConfirmationContent
      locale={locale}
      orderNumber={orderNumber}
      translations={{
        title: t("confirmation.title"),
        subtitle: t("confirmation.subtitle"),
        orderNumber: t("confirmation.orderNumber"),
        whatsNext: t("confirmation.whatsNext"),
        emailSent: t("confirmation.emailSent"),
        emailSentDesc: t("confirmation.emailSentDesc"),
        preparation: t("confirmation.preparation"),
        preparationDesc: t("confirmation.preparationDesc"),
        delivery: t("confirmation.delivery"),
        deliveryDesc: t("confirmation.deliveryDesc"),
        continueShopping: t("confirmation.continueShopping"),
        trackOrder: t("confirmation.trackOrder"),
        needHelp: t("confirmation.needHelp"),
        contactUs: tCommon("contactUs"),
      }}
    />
  );
}
