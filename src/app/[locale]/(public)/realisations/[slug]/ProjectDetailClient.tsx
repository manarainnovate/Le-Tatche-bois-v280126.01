"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { projectCategories, type Project, type Locale } from "@/data/projects";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ProjectDetailClientProps {
  project: Project;
  relatedProjects: Project[];
  locale: Locale;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const translations = {
  back: {
    fr: "Retour aux réalisations",
    en: "Back to projects",
    ar: "العودة إلى المشاريع",
    es: "Volver a proyectos",
  },
  location: { fr: "Lieu", en: "Location", ar: "الموقع", es: "Ubicación" },
  year: { fr: "Année", en: "Year", ar: "السنة", es: "Año" },
  similarProject: {
    fr: "Vous avez un projet similaire ?",
    en: "Have a similar project?",
    ar: "هل لديك مشروع مشابه؟",
    es: "¿Tiene un proyecto similar?",
  },
  requestQuote: {
    fr: "Demander un devis",
    en: "Request a quote",
    ar: "طلب عرض سعر",
    es: "Solicitar presupuesto",
  },
  contact: {
    fr: "Nous contacter",
    en: "Contact us",
    ar: "اتصل بنا",
    es: "Contáctenos",
  },
  relatedProjects: {
    fr: "Autres Réalisations",
    en: "Other Projects",
    ar: "مشاريع أخرى",
    es: "Otros Proyectos",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ProjectDetailClient({
  project,
  relatedProjects,
  locale,
}: ProjectDetailClientProps) {
  const isRTL = locale === "ar";

  const getText = (key: keyof typeof translations) =>
    translations[key][locale] ?? translations[key].fr;

  const getCategoryLabel = (categoryId: string) => {
    const category = projectCategories.find((c) => c.id === categoryId);
    return category?.[locale] ?? categoryId;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px]">
        <Image
          src={project.coverImage}
          alt={project.title[locale]}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-4 pb-12">
            {/* Back Button */}
            <Link
              href={`/${locale}/realisations`}
              className={cn(
                "inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
              {getText("back")}
            </Link>

            {/* Category Badge */}
            <div className="mb-4">
              <Badge variant="gold" size="lg">
                {getCategoryLabel(project.category)}
              </Badge>
            </div>

            {/* Title */}
            <h1
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4",
                isRTL && "text-right"
              )}
            >
              {project.title[locale]}
            </h1>

            {/* Description if available */}
            {project.description && (
              <p
                className={cn(
                  "text-xl text-white/80 mb-6 max-w-3xl",
                  isRTL && "text-right"
                )}
              >
                {project.description[locale]}
              </p>
            )}

            {/* Quick Info */}
            <div
              className={cn(
                "flex flex-wrap gap-6 text-white/90",
                isRTL && "flex-row-reverse justify-end"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  isRTL && "flex-row-reverse"
                )}
              >
                <MapPin size={18} />
                {project.location}
              </div>
              <div
                className={cn(
                  "flex items-center gap-2",
                  isRTL && "flex-row-reverse"
                )}
              >
                <Calendar size={18} />
                {project.year}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* CTA Section */}
        <div className="bg-wood-cream rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-wood-dark mb-6">
            {getText("similarProject")}
          </h3>
          <div
            className={cn(
              "flex flex-wrap justify-center gap-4",
              isRTL && "flex-row-reverse"
            )}
          >
            <Link
              href={`/${locale}/devis`}
              className={cn(
                "inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-colors",
                "bg-wood-primary text-white hover:bg-wood-secondary",
                isRTL && "flex-row-reverse"
              )}
            >
              {getText("requestQuote")}
              <ArrowRight size={20} className={isRTL ? "rotate-180" : ""} />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className={cn(
                "inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-colors",
                "bg-white text-wood-dark border-2 border-wood-primary hover:bg-wood-cream",
                isRTL && "flex-row-reverse"
              )}
            >
              {getText("contact")}
            </Link>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mt-16">
            <h3
              className={cn(
                "text-2xl font-bold text-wood-dark mb-8",
                isRTL && "text-right"
              )}
            >
              {getText("relatedProjects")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((relatedProject) => (
                <Link
                  key={relatedProject.id}
                  href={`/${locale}/realisations/${relatedProject.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={relatedProject.coverImage}
                        alt={relatedProject.title[locale]}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className={cn("p-6", isRTL && "text-right")}>
                      <h4 className="font-bold text-wood-dark group-hover:text-wood-primary transition-colors line-clamp-2">
                        {relatedProject.title[locale]}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {relatedProject.location} • {relatedProject.year}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ProjectDetailClient.displayName = "ProjectDetailClient";
