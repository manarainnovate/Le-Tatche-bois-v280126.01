"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageGallery, type GalleryImage } from "@/components/ui/ImageGallery";
import {
  Quote,
  Layers,
  ListChecks,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Calendar,
  Eye,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ProjectData {
  slug: string;
  title: string;
  category: string;
  location: string;
  year: number;
  duration: string;
  heroImage: string;
  galleryImages: GalleryImage[];
  materials: string[];
  specifications: { label: string; value: string }[];
  challenge: string;
  solution: string;
  result: string;
  testimonial?: {
    text: string;
    author: string;
    role: string;
  };
}

interface RelatedProject {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: number;
  image: string;
}

interface ProjectDetailContentProps {
  locale: string;
  project: ProjectData;
  relatedProjects: RelatedProject[];
  translations: {
    challenge: string;
    solution: string;
    result: string;
    gallery: string;
    materials: string;
    specifications: string;
    testimonialTitle: string;
    similarProjectCTA: string;
    requestQuote: string;
    contactUs: string;
    relatedProjects: string;
    viewAll: string;
    viewProject: string;
    categories: Record<string, string>;
  };
}

// ═══════════════════════════════════════════════════════════
// RELATED PROJECT CARD
// ═══════════════════════════════════════════════════════════

function RelatedProjectCard({
  project,
  locale,
  isRTL,
  categoryLabel,
  viewProjectLabel,
}: {
  project: RelatedProject;
  locale: string;
  isRTL: boolean;
  categoryLabel: string;
  viewProjectLabel: string;
}) {
  return (
    <Card className="group overflow-hidden">
      <Link href={`/${locale}/realisations/${project.slug}`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

          <div className={cn("absolute top-3", isRTL ? "right-3" : "left-3")}>
            <Badge variant="gold" size="sm">
              {categoryLabel}
            </Badge>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-wood-primary rounded-full font-medium text-sm">
              <Eye className="w-4 h-4" />
              {viewProjectLabel}
            </span>
          </div>
        </div>

        <div className={cn("p-4", isRTL && "text-right")}>
          <h3 className="font-semibold text-wood-dark group-hover:text-wood-primary transition-colors line-clamp-2 mb-2">
            {project.title}
          </h3>
          <div
            className={cn(
              "flex items-center gap-3 text-xs text-wood-muted",
              isRTL && "flex-row-reverse justify-end"
            )}
          >
            <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <MapPin className="w-3 h-3" />
              {project.location}
            </span>
            <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <Calendar className="w-3 h-3" />
              {project.year}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function ProjectDetailContent({
  locale,
  project,
  relatedProjects,
  translations,
}: ProjectDetailContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";

  // Animation states
  const contentRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Main Content Section */}
      <section ref={contentRef} className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div
              className={cn(
                "lg:col-span-2 space-y-12",
                "transform transition-all duration-700",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              )}
            >
              {/* Challenge Section */}
              <div className={cn(isRTL && "text-right")}>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-wood-primary mb-4">
                  {translations.challenge}
                </h2>
                <p className="text-wood-muted leading-relaxed text-lg">
                  {project.challenge}
                </p>
              </div>

              {/* Solution Section */}
              <div className={cn(isRTL && "text-right")}>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-wood-primary mb-4">
                  {translations.solution}
                </h2>
                <p className="text-wood-muted leading-relaxed text-lg">
                  {project.solution}
                </p>
              </div>

              {/* Result Section */}
              <div className={cn(isRTL && "text-right")}>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-wood-primary mb-4">
                  {translations.result}
                </h2>
                <p className="text-wood-muted leading-relaxed text-lg">
                  {project.result}
                </p>
              </div>

              {/* Gallery Section */}
              <div>
                <h2
                  className={cn(
                    "font-heading text-2xl md:text-3xl font-bold text-wood-primary mb-6",
                    isRTL && "text-right"
                  )}
                >
                  {translations.gallery}
                </h2>
                <ImageGallery
                  images={project.galleryImages}
                  aspectRatio="video"
                  showThumbnails
                  enableLightbox
                  enableZoom
                />
              </div>

              {/* Testimonial Section */}
              {project.testimonial && (
                <Card className="p-8 bg-gradient-to-br from-wood-light/30 to-wood-cream/30 border-wood-primary/20">
                  <h2
                    className={cn(
                      "font-heading text-xl font-bold text-wood-primary mb-6",
                      isRTL && "text-right"
                    )}
                  >
                    {translations.testimonialTitle}
                  </h2>
                  <Quote className="w-12 h-12 text-wood-primary/20 mb-4" />
                  <blockquote
                    className={cn(
                      "text-lg md:text-xl text-wood-dark italic mb-6 leading-relaxed",
                      isRTL && "text-right"
                    )}
                  >
                    &ldquo;{project.testimonial.text}&rdquo;
                  </blockquote>
                  <div className={cn(isRTL && "text-right")}>
                    <p className="font-semibold text-wood-dark">
                      {project.testimonial.author}
                    </p>
                    <p className="text-sm text-wood-muted">
                      {project.testimonial.role}
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div
              className={cn(
                "lg:col-span-1",
                "transform transition-all duration-700 delay-200",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              )}
            >
              <Card className="p-6 sticky top-24">
                {/* Materials */}
                <div className="mb-8">
                  <h3
                    className={cn(
                      "font-semibold flex items-center gap-2 mb-4 text-wood-dark",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <Layers className="w-5 h-5 text-wood-primary" />
                    {translations.materials}
                  </h3>
                  <ul className={cn("space-y-2", isRTL && "text-right")}>
                    {project.materials.map((material) => (
                      <li
                        key={material}
                        className={cn(
                          "flex items-center gap-2 text-wood-muted",
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-wood-primary shrink-0" />
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specifications */}
                <div className="mb-8">
                  <h3
                    className={cn(
                      "font-semibold flex items-center gap-2 mb-4 text-wood-dark",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <ListChecks className="w-5 h-5 text-wood-primary" />
                    {translations.specifications}
                  </h3>
                  <div className="space-y-3">
                    {project.specifications.map((spec) => (
                      <div
                        key={spec.label}
                        className={cn(
                          "flex justify-between items-center py-2 border-b border-wood-light/50",
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        <span className="text-wood-muted text-sm">{spec.label}</span>
                        <span className="font-medium text-wood-dark text-sm">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-3 pt-4 border-t border-wood-light">
                  <p className={cn("text-sm text-wood-muted", isRTL && "text-right")}>
                    {translations.similarProjectCTA}
                  </p>
                  <Link
                    href={`/${locale}/devis?service=${project.category}`}
                    className={cn(
                      "w-full inline-flex items-center justify-center gap-2",
                      "px-6 py-3 rounded-lg font-medium",
                      "bg-gradient-to-r from-wood-primary to-wood-secondary",
                      "text-white shadow-md",
                      "hover:brightness-110 transition-all duration-200",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    {translations.requestQuote}
                    {isRTL ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className={cn(
                      "w-full inline-flex items-center justify-center gap-2",
                      "px-6 py-3 rounded-lg font-medium",
                      "border-2 border-wood-primary text-wood-primary",
                      "hover:bg-wood-primary hover:text-white transition-all duration-200",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    {translations.contactUs}
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects Section */}
      {relatedProjects.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-wood-cream/30 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div
              className={cn(
                "flex items-center justify-between mb-8",
                isRTL && "flex-row-reverse"
              )}
            >
              <h2
                className={cn(
                  "font-heading text-2xl md:text-3xl font-bold text-wood-primary",
                  isRTL && "text-right"
                )}
              >
                {translations.relatedProjects}
              </h2>
              <Link
                href={`/${locale}/realisations`}
                className={cn(
                  "inline-flex items-center gap-2 text-wood-primary hover:text-wood-secondary transition-colors font-medium",
                  isRTL && "flex-row-reverse"
                )}
              >
                {translations.viewAll}
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.slice(0, 3).map((relatedProject) => (
                <RelatedProjectCard
                  key={relatedProject.id}
                  project={relatedProject}
                  locale={locale}
                  isRTL={isRTL}
                  categoryLabel={translations.categories[relatedProject.category] ?? relatedProject.category}
                  viewProjectLabel={translations.viewProject}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

ProjectDetailContent.displayName = "ProjectDetailContent";
