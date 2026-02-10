import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { OrderTrackingContent } from "./OrderTrackingContent";
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
    title: t("tracking.title"),
    description: t("tracking.description"),
    locale: locale as Locale,
    path: "/commande/suivi",
    noIndex: true,
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function OrderTrackingPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: "order" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const initialOrderNumber = resolvedSearchParams.order ?? "";

  return (
    <OrderTrackingContent
      locale={locale}
      initialOrderNumber={initialOrderNumber}
      translations={{
        title: t("tracking.title"),
        description: t("tracking.description"),
        searchTitle: t("tracking.searchTitle"),
        orderNumber: t("tracking.orderNumber"),
        email: t("tracking.email"),
        search: t("tracking.search"),
        searching: t("tracking.searching"),
        orderDate: t("tracking.orderDate"),
        statusTitle: t("tracking.statusTitle"),
        estimatedDelivery: t("tracking.estimatedDelivery"),
        shippingAddress: t("tracking.shippingAddress"),
        orderItems: t("tracking.orderItems"),
        total: t("tracking.total"),
        searchAnother: t("tracking.searchAnother"),
        trackingNumber: t("tracking.trackingNumber"),
        notFound: t("tracking.notFound"),
        notFoundDesc: t("tracking.notFoundDesc"),
        statuses: {
          confirmed: t("status.confirmed"),
          processing: t("status.processing"),
          shipped: t("status.shipped"),
          delivered: t("status.delivered"),
        },
        needHelp: t("tracking.needHelp"),
        contactUs: tCommon("contactUs"),
        whatsapp: t("tracking.whatsapp"),
      }}
    />
  );
}
