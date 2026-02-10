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
  const seo = getPageSEO(locale as Locale, "cookies");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/cookies",
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function CookiePolicyPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.cookies" });
  const tCommon = await getTranslations({ locale, namespace: "legal.common" });

  const sections: LegalSection[] = [
    {
      id: "what-are-cookies",
      title: t("sections.whatAreCookies.title"),
      content: t("sections.whatAreCookies.content"),
    },
    {
      id: "types",
      title: t("sections.types.title"),
      content: t("sections.types.content"),
      subsections: [
        {
          title: t("sections.types.essential.title"),
          content: t("sections.types.essential.content"),
        },
        {
          title: t("sections.types.functional.title"),
          content: t("sections.types.functional.content"),
        },
        {
          title: t("sections.types.analytics.title"),
          content: t("sections.types.analytics.content"),
        },
        {
          title: t("sections.types.marketing.title"),
          content: t("sections.types.marketing.content"),
        },
      ],
    },
    {
      id: "how-we-use",
      title: t("sections.howWeUse.title"),
      content: [
        t("sections.howWeUse.content"),
        t("sections.howWeUse.purposes"),
      ],
    },
    {
      id: "third-party",
      title: t("sections.thirdParty.title"),
      content: t("sections.thirdParty.content"),
    },
    {
      id: "manage-cookies",
      title: t("sections.manageCookies.title"),
      content: [
        t("sections.manageCookies.content"),
        t("sections.manageCookies.instructions"),
      ],
    },
    {
      id: "consent",
      title: t("sections.consent.title"),
      content: t("sections.consent.content"),
    },
    {
      id: "updates",
      title: t("sections.updates.title"),
      content: t("sections.updates.content"),
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
