import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { ServicesContent } from "./ServicesContent";
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
  const seo = getPageSEO(locale as Locale, "services");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/services",
    keywords: [
      "services menuiserie",
      "portes bois",
      "fenêtres bois",
      "escaliers bois",
      "meubles sur mesure",
      "plafonds bois",
      "menuiserie maroc",
    ],
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const isRTL = locale === "ar";

  // Fetch services from database
  const dbServices = await prisma.siteService.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  // For each service, fetch portfolio images (afterImages from matching category projects)
  const servicesWithImages = await Promise.all(
    dbServices.map(async (service) => {
      let galleryImages: string[] = [];

      if (service.slug) {
        const category = await prisma.portfolioCategory.findUnique({
          where: { slug: service.slug },
          include: {
            projects: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              select: { afterImages: true, coverImage: true },
            },
          },
        });

        if (category?.projects) {
          // Collect afterImages from all projects
          for (const project of category.projects) {
            if (project.afterImages?.length) {
              galleryImages.push(...project.afterImages);
            } else if (project.coverImage) {
              galleryImages.push(project.coverImage);
            }
          }
        }
      }

      // Fallback to service image if no portfolio images
      if (galleryImages.length === 0 && service.image) {
        galleryImages = [service.image];
      }

      return {
        id: service.id,
        slug: service.slug ?? "",
        titleFr: service.titleFr,
        titleEn: service.titleEn ?? "",
        titleEs: service.titleEs ?? "",
        titleAr: service.titleAr ?? "",
        shortDescFr: service.shortDescFr ?? "",
        shortDescEn: service.shortDescEn ?? "",
        icon: service.icon ?? "",
        image: service.image ?? "",
        hasDetailPage: service.hasDetailPage,
        isFeatured: service.isFeatured,
        galleryImages,
      };
    })
  );

  // Collect all images across services for hero slideshow
  const heroImages: string[] = [];
  for (const s of servicesWithImages) {
    if (s.galleryImages?.length) {
      heroImages.push(...s.galleryImages);
    } else if (s.image) {
      heroImages.push(s.image);
    }
  }

  // FAQ data for JSON-LD
  const faqs = [
    { question: t("faq.delays.question"), answer: t("faq.delays.answer") },
    { question: t("faq.woodTypes.question"), answer: t("faq.woodTypes.answer") },
    { question: t("faq.deliveryZone.question"), answer: t("faq.deliveryZone.answer") },
    { question: t("faq.howToQuote.question"), answer: t("faq.howToQuote.answer") },
    { question: t("faq.warranty.question"), answer: t("faq.warranty.answer") },
  ];

  return (
    <main className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <JsonLd locale={locale} pageType="services" faqs={faqs} />

      {/* Client-side content with interactive components */}
      <ServicesContent
        locale={locale}
        services={servicesWithImages}
        heroImages={heroImages}
        translations={{
          heroBadge: t("hero.badge"),
          heroTitle: t("hero.title"),
          heroSubtitle: t("hero.subtitle"),
          // Services section
          servicesTitle: t("services.title"),
          servicesSubtitle: t("services.subtitle"),
          requestQuote: t("services.requestQuote"),
          viewDetails: t("viewDetails"),
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
            deliveryZone: {
              question: t("faq.deliveryZone.question"),
              answer: t("faq.deliveryZone.answer"),
            },
            howToQuote: {
              question: t("faq.howToQuote.question"),
              answer: t("faq.howToQuote.answer"),
            },
            warranty: {
              question: t("faq.warranty.question"),
              answer: t("faq.warranty.answer"),
            },
          },
          // CTA section
          ctaTitle: t("cta.title"),
          ctaDescription: t("cta.description"),
          ctaButton: tCommon("requestQuote"),
        }}
      />
    </main>
  );
}
