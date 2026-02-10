import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { QuoteFormContent } from "./QuoteFormContent";
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
  const seo = getPageSEO(locale as Locale, "quote");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/devis",
    keywords: [
      "devis menuiserie",
      "devis gratuit",
      "estimation projet bois",
      "menuiserie sur mesure",
      "demande devis",
    ],
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function QuotePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quote" });
  const tServices = await getTranslations({ locale, namespace: "services.categories" });
  const tValidation = await getTranslations({ locale, namespace: "validation" });

  return (
    <QuoteFormContent
      locale={locale}
      translations={{
        title: t("title"),
        subtitle: t("subtitle"),
        free: t("free"),
        steps: {
          service: t("steps.service"),
          details: t("steps.details"),
          dimensions: t("steps.dimensions"),
          contact: t("steps.contact"),
        },
        step1: {
          title: t("step1.title"),
          subtitle: t("step1.subtitle"),
        },
        step2: {
          title: t("step2.title"),
          subtitle: t("step2.subtitle"),
          projectType: t("step2.projectType"),
          woodType: t("step2.woodType"),
          style: t("step2.style"),
          styleOptions: {
            traditional: t("step2.styleOptions.traditional"),
            modern: t("step2.styleOptions.modern"),
            mixed: t("step2.styleOptions.mixed"),
          },
          description: t("step2.description"),
          descriptionPlaceholder: t("step2.descriptionPlaceholder"),
          attachments: t("step2.attachments"),
          uploadHint: t("step2.uploadHint"),
        },
        step3: {
          title: t("step3.title"),
          subtitle: t("step3.subtitle"),
          width: t("step3.width"),
          height: t("step3.height"),
          depth: t("step3.depth"),
          quantity: t("step3.quantity"),
          budget: t("step3.budget"),
          budgetOptions: {
            under5k: t("step3.budgetOptions.under5k"),
            "5to10k": t("step3.budgetOptions.5to10k"),
            "10to25k": t("step3.budgetOptions.10to25k"),
            "25to50k": t("step3.budgetOptions.25to50k"),
            over50k: t("step3.budgetOptions.over50k"),
          },
          deadline: t("step3.deadline"),
        },
        step4: {
          title: t("step4.title"),
          subtitle: t("step4.subtitle"),
          firstName: t("step4.firstName"),
          lastName: t("step4.lastName"),
          email: t("step4.email"),
          phone: t("step4.phone"),
          city: t("step4.city"),
          preferredContact: t("step4.preferredContact"),
          contactOptions: {
            email: t("step4.contactOptions.email"),
            phone: t("step4.contactOptions.phone"),
            whatsapp: t("step4.contactOptions.whatsapp"),
          },
          newsletter: t("step4.newsletter"),
        },
        submit: t("submit"),
        submitting: t("submitting"),
        success: {
          title: t("success.title"),
          message: t("success.message"),
          reference: t("success.reference"),
          backHome: t("success.backHome"),
        },
        navigation: {
          back: "Précédent",
          next: "Suivant",
        },
        services: {
          doors: {
            title: tServices("doors.title"),
            description: tServices("doors.description"),
          },
          windows: {
            title: tServices("windows.title"),
            description: tServices("windows.description"),
          },
          furniture: {
            title: tServices("furniture.title"),
            description: tServices("furniture.description"),
          },
          stairs: {
            title: tServices("stairs.title"),
            description: tServices("stairs.description"),
          },
          ceilings: {
            title: tServices("ceilings.title"),
            description: tServices("ceilings.description"),
          },
          restoration: {
            title: tServices("restoration.title"),
            description: tServices("restoration.description"),
          },
        },
        validation: {
          required: tValidation("required"),
          email: tValidation("email"),
          phone: tValidation("phone"),
          minLength: tValidation("minLength"),
        },
      }}
    />
  );
}
