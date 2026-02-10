"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useDirection } from "@/hooks/useDirection";
import { cn, hexToRgba } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import { ArrowRight, ArrowLeft, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Category {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string | null;
  nameEs: string | null;
  nameAr: string | null;
  icon: string | null;
}

interface Project {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string | null;
  titleEs: string | null;
  titleAr: string | null;
  coverImage: string | null;
  afterImages: string[];
  location: string | null;
  year: number | null;
  isActive: boolean;
  isFeatured: boolean;
  category: Category | null;
}

type Locale = "fr" | "en" | "es" | "ar";

// ═══════════════════════════════════════════════════════════
// HELPER: Get localized text with French fallback
// ═══════════════════════════════════════════════════════════

function getLocalizedTitle(project: Project, locale: Locale): string {
  if (locale === "en" && project.titleEn?.trim()) return project.titleEn;
  if (locale === "es" && project.titleEs?.trim()) return project.titleEs;
  if (locale === "ar" && project.titleAr?.trim()) return project.titleAr;
  return project.titleFr; // Always fallback to French
}

function getLocalizedCategoryName(category: Category | null, locale: Locale): string {
  if (!category) return "";
  if (locale === "en" && category.nameEn?.trim()) return category.nameEn;
  if (locale === "es" && category.nameEs?.trim()) return category.nameEs;
  if (locale === "ar" && category.nameAr?.trim()) return category.nameAr;
  return category.nameFr; // Always fallback to French
}

// ═══════════════════════════════════════════════════════════
// PROJECT CARD COMPONENT
// ═══════════════════════════════════════════════════════════

function ProjectCard({
  project,
  locale,
  isRTL,
  isVisible,
  index,
}: {
  project: Project;
  locale: Locale;
  isRTL: boolean;
  isVisible: boolean;
  index: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const title = getLocalizedTitle(project, locale);
  const categoryName = getLocalizedCategoryName(project.category, locale);

  // Build images array: coverImage first, then afterImages (deduplicated)
  const images = (() => {
    const all: string[] = [];
    if (project.coverImage) all.push(project.coverImage);
    if (project.afterImages?.length) {
      for (const img of project.afterImages) {
        if (img && !all.includes(img)) all.push(img);
      }
    }
    return all;
  })();

  const hasMultiple = images.length > 1;

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link
      href={`/${locale}/realisations/${project.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl",
        "aspect-[4/3]",
        "transform transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Images */}
      {images.length > 0 ? (
        images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${title} ${i + 1}`}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-500",
              i === currentIndex ? "opacity-100 scale-100 group-hover:scale-110" : "opacity-0 scale-100"
            )}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-wood-primary to-wood-dark flex items-center justify-center">
          <span className="text-6xl opacity-60">{project.category?.icon || "🪵"}</span>
        </span>
      )}

      {/* Navigation Arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={goToPrevious}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-20",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            )}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={goToNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-20",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            )}
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {hasMultiple && (
        <span className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              className={cn(
                "h-2 rounded-full transition-all",
                i === currentIndex ? "bg-white w-4" : "bg-white/50 w-2"
              )}
            />
          ))}
        </span>
      )}

      {/* Image Count Badge */}
      {hasMultiple && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full z-20">
          {currentIndex + 1}/{images.length}
        </span>
      )}

      {/* Overlay */}
      <span
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
          "opacity-60 group-hover:opacity-90 transition-opacity duration-300"
        )}
      />

      {/* Content */}
      <span
        className={cn(
          "absolute inset-0 p-6 flex flex-col justify-end",
          isRTL && "text-right"
        )}
      >
        {/* Category Badge */}
        {categoryName && (
          <span
            className={cn(
              "inline-block px-3 py-1 mb-3 w-fit",
              "bg-wood-primary/90 text-white text-xs font-medium rounded-full",
              "transform -translate-y-2 opacity-0",
              "group-hover:translate-y-0 group-hover:opacity-100",
              "transition-all duration-300"
            )}
          >
            {project.category?.icon} {categoryName}
          </span>
        )}

        {/* Title */}
        <span className="block font-heading text-xl md:text-2xl text-white font-semibold mb-1">
          {title}
        </span>

        {/* Location */}
        {project.location && (
          <span className="block text-white/80 text-sm">{project.location}</span>
        )}

        {/* View Icon */}
        <span
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm",
            "flex items-center justify-center",
            "opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100",
            "transition-all duration-300"
          )}
        >
          <Eye className="w-6 h-6 text-white" />
        </span>
      </span>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════
// FEATURED PROJECTS COMPONENT
// ═══════════════════════════════════════════════════════════

export function FeaturedProjects() {
  const t = useTranslations("home.featuredProjects");
  const locale = useLocale() as Locale;
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { projectsBackground: bg } = useThemeSettings();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Fetch projects and categories from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, categoriesRes] = await Promise.all([
          fetch("/api/cms/portfolio?featured=true&limit=6"),
          fetch("/api/cms/portfolio-categories"),
        ]);

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(data.projects || []);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load featured projects:", error);
      }
      setLoading(false);
    };
    void fetchData();
  }, []);

  // Intersection Observer for scroll animation
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Filter projects by category
  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category?.id === activeCategory);

  // Get localized category name
  const getCategoryName = (cat: Category): string => {
    return getLocalizedCategoryName(cat, locale);
  };

  // Don't render if no projects
  if (!loading && projects.length === 0) {
    return null;
  }

  const isImageBg = bg.type === "image" && bg.image;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24"
      style={
        isImageBg
          ? undefined
          : { background: `linear-gradient(135deg, ${bg.color || "#FFFFFF"}, ${bg.color || "#FFFFFF"}dd)` }
      }
    >
      {/* Image background + overlay */}
      {isImageBg && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bg.image})` }}
          />
          {bg.overlayEnabled !== false && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: bg.overlayColor || "#FFFFFF",
                opacity: (bg.overlayOpacity ?? 0) / 100,
              }}
            />
          )}
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div
          className={cn(
            "text-center mb-12",
            isRTL && "text-right",
            (bg.cardEnabled || isImageBg) && "rounded-2xl p-6 md:p-8 shadow-lg max-w-3xl mx-auto",
            (bg.cardEnabled || isImageBg) && bg.cardBlur !== false && "backdrop-blur-sm"
          )}
          style={(bg.cardEnabled || isImageBg) ? { backgroundColor: hexToRgba(bg.cardColor || "#FFFFFF", (bg.cardOpacity ?? 80) / 100) } : undefined}
        >
          <span className="inline-block px-4 py-1 bg-wood-light/50 rounded-full text-sm font-medium mb-4" style={{ color: bg.titleColor }}>
            {t("badge")}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4" style={{ color: bg.titleColor }}>
            {t("title")}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: bg.bodyColor }}>
            {t("subtitle")}
          </p>
        </div>

        {/* Category Filter - Only show if we have categories */}
        {categories.length > 0 && (
          <div className="relative mb-10">
            {/* Mobile: sticky "All" + horizontal scroll row */}
            <div className={cn("flex gap-0 md:hidden items-center", isRTL && "flex-row-reverse")}>
              {/* Sticky "All" button */}
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "flex-shrink-0 z-10",
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                  isRTL ? "ml-2" : "mr-2",
                  activeCategory === "all"
                    ? "bg-wood-primary text-white shadow-md"
                    : "bg-wood-light/80 text-wood-dark"
                )}
              >
                {t("categories.all")}
              </button>
              {/* Scrollable categories */}
              <div className="relative flex-1 min-w-0">
                <div
                  className={cn(
                    "flex gap-2",
                    "overflow-x-auto scrollbar-hide",
                    "pb-1",
                    "snap-x snap-mandatory",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        "flex-shrink-0 snap-start",
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                        activeCategory === category.id
                          ? "bg-wood-primary text-white shadow-md"
                          : "bg-wood-light/50 text-wood-dark hover:bg-wood-light"
                      )}
                    >
                      {category.icon} {getCategoryName(category)}
                    </button>
                  ))}
                </div>
                {/* Scroll fade indicator */}
                <div
                  className="absolute top-0 bottom-1 w-8 pointer-events-none"
                  style={{
                    [isRTL ? "left" : "right"]: 0,
                    background: isImageBg
                      ? `linear-gradient(${isRTL ? "to right" : "to left"}, rgba(0,0,0,0.15), transparent)`
                      : `linear-gradient(${isRTL ? "to right" : "to left"}, ${bg.color || "#FFFFFF"}, transparent)`,
                  }}
                />
              </div>
            </div>

            {/* Desktop: wrapped layout, max 2 rows */}
            <div
              className={cn(
                "hidden md:flex flex-wrap justify-center gap-2 max-h-[5.5rem] overflow-hidden",
                isRTL && "flex-row-reverse"
              )}
            >
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeCategory === "all"
                    ? "bg-wood-primary text-white shadow-md"
                    : "bg-wood-light/50 text-wood-dark hover:bg-wood-light"
                )}
              >
                {t("categories.all")}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    activeCategory === category.id
                      ? "bg-wood-primary text-white shadow-md"
                      : "bg-wood-light/50 text-wood-dark hover:bg-wood-light"
                  )}
                >
                  {category.icon} {getCategoryName(category)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-10 h-10 text-wood-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  locale={locale}
                  isRTL={isRTL}
                  isVisible={isVisible}
                  index={index}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                href={`/${locale}/realisations`}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3",
                  "bg-wood-dark text-white rounded-lg",
                  "hover:bg-wood-primary transition-colors",
                  "font-medium",
                  isRTL && "flex-row-reverse"
                )}
              >
                {t("viewAll")}
                {isRTL ? (
                  <ArrowLeft className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

FeaturedProjects.displayName = "FeaturedProjects";

export default FeaturedProjects;
