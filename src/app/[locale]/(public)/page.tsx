export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import {
  HeroSection,
  StatsSection,
  ServicesPreview,
  FeaturedProjects,
  AboutSection,
  TestimonialsSection,
  FeaturedProducts,
  CTASection,
} from "@/components/home";
import { generateSEOMetadata, getPageSEO, type Locale } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

// ═══════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSEO(locale as Locale, "home");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "",
    keywords: [
      "menuiserie maroc",
      "artisan bois",
      "meubles sur mesure",
      "portes bois",
      "escaliers bois",
      "LE TATCHE BOIS",
    ],
  });
}

// ═══════════════════════════════════════════════════════════
// HOMEPAGE
// ═══════════════════════════════════════════════════════════

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main>
      {/* JSON-LD Structured Data */}
      <JsonLd locale={locale} pageType="home" />

      {/* Hero Section - Full screen slider */}
      <HeroSection />

      {/* Stats Section - Animated counters */}
      <StatsSection />

      {/* Services Preview - 6 service cards */}
      <ServicesPreview />

      {/* Featured Projects - Filterable gallery */}
      <FeaturedProjects />

      {/* About Section - Image + text */}
      <AboutSection />

      {/* Testimonials - Carousel */}
      <TestimonialsSection />

      {/* Featured Products - 4 products from shop */}
      <FeaturedProducts />

      {/* CTA Section - Background + buttons */}
      <CTASection />
    </main>
  );
}
