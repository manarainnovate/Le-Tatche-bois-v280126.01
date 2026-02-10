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
  const seo = getPageSEO(locale as Locale, "terms");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/conditions",
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function TermsConditionsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  const tCommon = await getTranslations({ locale, namespace: "legal.common" });

  const sections: LegalSection[] = [
    {
      id: "acceptance",
      title: t("sections.acceptance.title"),
      content: t("sections.acceptance.content"),
    },
    {
      id: "definitions",
      title: t("sections.definitions.title"),
      content: t("sections.definitions.content"),
    },
    {
      id: "products",
      title: t("sections.products.title"),
      content: t("sections.products.content"),
      subsections: [
        {
          title: t("sections.products.description.title"),
          content: t("sections.products.description.content"),
        },
        {
          title: t("sections.products.pricing.title"),
          content: t("sections.products.pricing.content"),
        },
      ],
    },
    {
      id: "orders",
      title: t("sections.orders.title"),
      content: t("sections.orders.content"),
    },
    {
      id: "payment",
      title: t("sections.payment.title"),
      content: [
        t("sections.payment.content"),
        t("sections.payment.methods"),
      ],
    },
    {
      id: "delivery",
      title: t("sections.delivery.title"),
      content: t("sections.delivery.content"),
    },
    {
      id: "returns",
      title: t("sections.returns.title"),
      content: t("sections.returns.content"),
    },
    {
      id: "warranty",
      title: t("sections.warranty.title"),
      content: t("sections.warranty.content"),
    },
    {
      id: "liability",
      title: t("sections.liability.title"),
      content: t("sections.liability.content"),
    },
    {
      id: "intellectual-property",
      title: t("sections.intellectualProperty.title"),
      content: t("sections.intellectualProperty.content"),
    },
    {
      id: "governing-law",
      title: t("sections.governingLaw.title"),
      content: t("sections.governingLaw.content"),
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
