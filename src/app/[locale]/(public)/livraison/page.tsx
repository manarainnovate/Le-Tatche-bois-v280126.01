import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LegalPageContent, LegalSection } from "@/components/legal/LegalPageContent";
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
  const seo = getPageSEO(locale as Locale, "shipping");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/livraison",
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function ShippingReturnsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.shipping" });
  const tCommon = await getTranslations({ locale, namespace: "legal.common" });

  const sections: LegalSection[] = [
    {
      id: "shipping-zones",
      title: t("sections.shippingZones.title"),
      content: t("sections.shippingZones.content"),
      subsections: [
        {
          title: t("sections.shippingZones.morocco.title"),
          content: t("sections.shippingZones.morocco.content"),
        },
        {
          title: t("sections.shippingZones.international.title"),
          content: t("sections.shippingZones.international.content"),
        },
      ],
    },
    {
      id: "delivery-times",
      title: t("sections.deliveryTimes.title"),
      content: [
        t("sections.deliveryTimes.content"),
        t("sections.deliveryTimes.times"),
      ],
    },
    {
      id: "shipping-costs",
      title: t("sections.shippingCosts.title"),
      content: t("sections.shippingCosts.content"),
    },
    {
      id: "tracking",
      title: t("sections.tracking.title"),
      content: t("sections.tracking.content"),
    },
    {
      id: "delivery-issues",
      title: t("sections.deliveryIssues.title"),
      content: t("sections.deliveryIssues.content"),
    },
    {
      id: "returns-policy",
      title: t("sections.returnsPolicy.title"),
      content: t("sections.returnsPolicy.content"),
      subsections: [
        {
          title: t("sections.returnsPolicy.conditions.title"),
          content: t("sections.returnsPolicy.conditions.content"),
        },
        {
          title: t("sections.returnsPolicy.process.title"),
          content: t("sections.returnsPolicy.process.content"),
        },
      ],
    },
    {
      id: "refunds",
      title: t("sections.refunds.title"),
      content: t("sections.refunds.content"),
    },
    {
      id: "exchanges",
      title: t("sections.exchanges.title"),
      content: t("sections.exchanges.content"),
    },
    {
      id: "custom-orders",
      title: t("sections.customOrders.title"),
      content: t("sections.customOrders.content"),
    },
    {
      id: "contact",
      title: t("sections.contact.title"),
      content: t("sections.contact.content"),
    },
  ];

  return (
    <LegalPageContent
      locale={locale}
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      lastUpdatedLabel={tCommon("lastUpdated")}
      tocTitle={tCommon("tableOfContents")}
      sections={sections}
      backToTop={tCommon("backToTop")}
    />
  );
}
