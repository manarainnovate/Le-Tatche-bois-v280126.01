import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailContent } from "./ServiceDetailContent";
import { generateSEOMetadata, Locale } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// ═══════════════════════════════════════════════════════════
// LOCALE HELPER
// ═══════════════════════════════════════════════════════════

function getLocalizedField(
  obj: Record<string, unknown>,
  field: string,
  locale: string
): string {
  const suffix = locale === "fr" ? "Fr" : locale === "en" ? "En" : locale === "es" ? "Es" : "Ar";
  return (obj[`${field}${suffix}`] as string) || (obj[`${field}Fr`] as string) || "";
}

// ═══════════════════════════════════════════════════════════
// GENERATE STATIC PARAMS
// ═══════════════════════════════════════════════════════════

export async function generateStaticParams() {
  const locales = ["fr", "en", "es", "ar"];
  const services = await prisma.siteService.findMany({
    where: { isActive: true, hasDetailPage: true },
    select: { slug: true },
  });

  return locales.flatMap((locale) =>
    services
      .filter((s) => s.slug)
      .map((s) => ({ locale, slug: s.slug! }))
  );
}

// ═══════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  const service = await prisma.siteService.findUnique({
    where: { slug },
  });

  if (!service || !service.isActive) {
    return {};
  }

  const title = getLocalizedField(service as unknown as Record<string, unknown>, "title", locale);
  const description = getLocalizedField(service as unknown as Record<string, unknown>, "shortDesc", locale)
    || getLocalizedField(service as unknown as Record<string, unknown>, "description", locale).slice(0, 160);

  return generateSEOMetadata({
    title: `${title} - LE TATCHE BOIS`,
    description,
    locale: locale as Locale,
    path: `/services/${slug}`,
    keywords: [
      title.toLowerCase(),
      "menuiserie",
      "bois",
      "artisan",
      "maroc",
      "sur mesure",
    ],
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function ServiceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // Fetch service from DB
  const service = await prisma.siteService.findUnique({
    where: { slug },
  });

  if (!service || !service.isActive) {
    notFound();
  }

  // Fetch related portfolio category + projects
  const portfolioCategory = await prisma.portfolioCategory.findUnique({
    where: { slug },
    include: {
      projects: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          titleFr: true,
          titleEn: true,
          titleEs: true,
          titleAr: true,
          descriptionFr: true,
          descriptionEn: true,
          descriptionEs: true,
          descriptionAr: true,
          afterImages: true,
          coverImage: true,
          slug: true,
          isFeatured: true,
        },
      },
    },
  });

  const projects = portfolioCategory?.projects ?? [];

  // Build gallery: service.images first, then portfolio afterImages
  const galleryImages: string[] = [];

  // 1) Service's own gallery images
  if (service.images?.length) {
    galleryImages.push(...service.images);
  }

  // 2) Portfolio project afterImages
  for (const project of projects) {
    if (project.afterImages?.length) {
      galleryImages.push(...project.afterImages);
    } else if (project.coverImage) {
      galleryImages.push(project.coverImage);
    }
  }

  // 3) Fallback to service cover image
  if (galleryImages.length === 0 && service.image) {
    galleryImages.push(service.image);
  }

  // Serialize service data for client component
  const serviceData = {
    id: service.id,
    slug: service.slug ?? "",
    titleFr: service.titleFr,
    titleEn: service.titleEn ?? "",
    titleEs: service.titleEs ?? "",
    titleAr: service.titleAr ?? "",
    shortDescFr: service.shortDescFr ?? "",
    shortDescEn: service.shortDescEn ?? "",
    descriptionFr: service.descriptionFr ?? "",
    descriptionEn: service.descriptionEn ?? "",
    descriptionEs: service.descriptionEs ?? "",
    descriptionAr: service.descriptionAr ?? "",
    icon: service.icon ?? "",
    image: service.image ?? "",
  };

  const projectsData = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    titleFr: p.titleFr,
    titleEn: p.titleEn ?? "",
    titleEs: p.titleEs ?? "",
    titleAr: p.titleAr ?? "",
    descriptionFr: p.descriptionFr ?? "",
    descriptionEn: p.descriptionEn ?? "",
    descriptionEs: p.descriptionEs ?? "",
    descriptionAr: p.descriptionAr ?? "",
    coverImage: p.coverImage ?? "",
    afterImages: p.afterImages ?? [],
    isFeatured: p.isFeatured,
  }));

  const t = await getTranslations({ locale, namespace: "services" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  // Get FAQ items
  const faqs = [
    { question: t("faq.delays.question"), answer: t("faq.delays.answer") },
    { question: t("faq.woodTypes.question"), answer: t("faq.woodTypes.answer") },
    { question: t("faq.warranty.question"), answer: t("faq.warranty.answer") },
  ];

  return (
    <main className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <JsonLd locale={locale} pageType="services" faqs={faqs} />

      {/* Client-side content */}
      <ServiceDetailContent
        locale={locale}
        service={serviceData}
        galleryImages={galleryImages}
        projects={projectsData}
        translations={{
          requestQuote: tCommon("requestQuote"),
          backToServices: t("backToServices") || "Retour aux services",
          // Process section
          processTitle: t("process.title"),
          processSubtitle: t("process.subtitle"),
          processStepLabel: t("process.stepLabel"),
          processSteps: {
            consultation: {
              title: t("process.consultation.title"),
              description: t("process.consultation.description"),
            },
            design: {
              title: t("process.design.title"),
              description: t("process.design.description"),
            },
            fabrication: {
              title: t("process.fabrication.title"),
              description: t("process.fabrication.description"),
            },
            installation: {
              title: t("process.installation.title"),
              description: t("process.installation.description"),
            },
          },
          // Why us section
          whyUsTitle: t("whyUs.title"),
          whyUs: {
            experience: {
              title: t("whyUs.experience.title"),
              description: t("whyUs.experience.description"),
            },
            quality: {
              title: t("whyUs.quality.title"),
              description: t("whyUs.quality.description"),
            },
            custom: {
              title: t("whyUs.custom.title"),
              description: t("whyUs.custom.description"),
            },
            warranty: {
              title: t("whyUs.warranty.title"),
              description: t("whyUs.warranty.description"),
            },
          },
          // FAQ section
          faqTitle: t("faq.title"),
          faqSubtitle: t("faq.subtitle"),
          faqItems: {
            delays: {
              question: t("faq.delays.question"),
              answer: t("faq.delays.answer"),
            },
            woodTypes: {
              question: t("faq.woodTypes.question"),
              answer: t("faq.woodTypes.answer"),
            },
            warranty: {
              question: t("faq.warranty.question"),
              answer: t("faq.warranty.answer"),
            },
            howToQuote: {
              question: t("faq.howToQuote.question"),
              answer: t("faq.howToQuote.answer"),
            },
          },
          // CTA section
          ctaTitle: t("cta.title"),
          ctaDescription: t("cta.description"),
          ctaButton: tCommon("requestQuote"),
          // Gallery
          galleryTitle: t("galleryTitle") || "Galerie",
          // Related projects
          relatedProjectsTitle: t("relatedProjectsTitle") || "Projets realises",
          viewProject: tCommon("viewDetails") || "Voir le projet",
        }}
      />
    </main>
  );
}
