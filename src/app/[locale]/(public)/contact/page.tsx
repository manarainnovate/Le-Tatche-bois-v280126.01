export const dynamic = 'force-dynamic';


import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { ContactContent } from "./ContactContent";
import { generateSEOMetadata, getPageSEO, Locale } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { prisma } from "@/lib/prisma";

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
  const seo = getPageSEO(locale as Locale, "contact");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/contact",
    keywords: [
      "contact menuiserie",
      "devis gratuit",
      "LE TATCHE BOIS",
      "menuiserie casablanca",
      "artisan bois maroc",
    ],
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const tValidation = await getTranslations({ locale, namespace: "validation" });

  // Fetch map embed URL from CMS
  let mapEmbedUrl: string | undefined;
  try {
    const mapSection = await prisma.pageSection.findUnique({
      where: { pageSlug_sectionKey: { pageSlug: "contact", sectionKey: "map" } },
    });
    if (mapSection?.videoUrl) {
      let raw = mapSection.videoUrl.trim();
      // Extract src= URL if user pasted full <iframe> HTML
      if (raw.includes("<iframe")) {
        const srcMatch = raw.match(/src=["']([^"']+)["']/);
        if (srcMatch) raw = srcMatch[1];
      }
      if (raw.startsWith("https://")) {
        mapEmbedUrl = raw;
      }
    }
  } catch {
    // Fall back to hardcoded URL
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd locale={locale} pageType="contact" />

      <ContactContent
        locale={locale}
        mapEmbedUrl={mapEmbedUrl}
        translations={{
          title: t("title"),
        subtitle: t("subtitle"),
        form: {
          title: t("form.title"),
          name: t("form.name"),
          namePlaceholder: t("form.namePlaceholder"),
          email: t("form.email"),
          emailPlaceholder: t("form.emailPlaceholder"),
          phone: t("form.phone"),
          phonePlaceholder: t("form.phonePlaceholder"),
          subject: t("form.subject"),
          subjectPlaceholder: t("form.subjectPlaceholder"),
          subjectOptions: {
            general: t("form.subjectOptions.general"),
            quote: t("form.subjectOptions.quote"),
            order: t("form.subjectOptions.order"),
            partnership: t("form.subjectOptions.partnership"),
            other: t("form.subjectOptions.other"),
          },
          message: t("form.message"),
          messagePlaceholder: t("form.messagePlaceholder"),
          submit: t("form.submit"),
          submitting: t("form.submitting"),
          success: t("form.success"),
          successMessage: t("form.successMessage"),
          error: t("form.error"),
          errorMessage: t("form.errorMessage"),
        },
        info: {
          title: t("info.title"),
          address: {
            label: t("info.address.label"),
            value: t("info.address.value"),
            city: t("info.address.city"),
            viewOnMap: t("info.address.viewOnMap"),
          },
          phone: {
            label: t("info.phone.label"),
            value: t("info.phone.value"),
            whatsapp: t("info.phone.whatsapp"),
          },
          email: {
            label: t("info.email.label"),
            value: t("info.email.value"),
          },
          hours: {
            label: t("info.hours.label"),
            weekdays: t("info.hours.weekdays"),
            saturday: t("info.hours.saturday"),
            sunday: t("info.hours.sunday"),
          },
        },
        map: {
          title: t("map.title"),
        },
        social: {
          title: t("social.title"),
          facebook: t("social.facebook"),
          instagram: t("social.instagram"),
          youtube: t("social.youtube"),
        },
        whatsapp: {
          button: t("whatsapp.button"),
          message: t("whatsapp.message"),
        },
        validation: {
          required: tValidation("required"),
          email: tValidation("email"),
          phone: tValidation("phone"),
          minLength: tValidation("minLength"),
        },
      }}
    />
    </>
  );
}
