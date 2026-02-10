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
  const seo = getPageSEO(locale as Locale, "privacy");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/confidentialite",
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  const tCommon = await getTranslations({ locale, namespace: "legal.common" });

  const sections: LegalSection[] = [
    {
      id: "introduction",
      title: t("sections.introduction.title"),
      content: t("sections.introduction.content"),
    },
    {
      id: "data-collection",
      title: t("sections.dataCollection.title"),
      content: t("sections.dataCollection.content"),
      subsections: [
        {
          title: t("sections.dataCollection.personal.title"),
          content: t("sections.dataCollection.personal.content"),
        },
        {
          title: t("sections.dataCollection.automatic.title"),
          content: t("sections.dataCollection.automatic.content"),
        },
      ],
    },
    {
      id: "data-usage",
      title: t("sections.dataUsage.title"),
      content: [
        t("sections.dataUsage.content"),
        t("sections.dataUsage.purposes"),
      ],
    },
    {
      id: "data-sharing",
      title: t("sections.dataSharing.title"),
      content: t("sections.dataSharing.content"),
    },
    {
      id: "data-security",
      title: t("sections.dataSecurity.title"),
      content: t("sections.dataSecurity.content"),
    },
    {
      id: "your-rights",
      title: t("sections.yourRights.title"),
      content: [
        t("sections.yourRights.content"),
        t("sections.yourRights.rights"),
      ],
    },
    {
      id: "cookies",
      title: t("sections.cookies.title"),
      content: t("sections.cookies.content"),
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
