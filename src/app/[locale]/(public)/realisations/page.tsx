import { Metadata } from "next";
import { ProjectsContent } from "./ProjectsContent";
import { generateSEOMetadata, getPageSEO, Locale } from "@/lib/seo";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSEO(locale as Locale, "projects");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/realisations",
    keywords: [
      "réalisations menuiserie",
      "projets bois",
      "portfolio artisan",
      "travaux menuiserie",
      "galerie projets",
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main className="min-h-screen">
      <ProjectsContent locale={locale} />
    </main>
  );
}
