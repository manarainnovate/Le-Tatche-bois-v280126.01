"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useDirection } from "@/hooks/useDirection";
import { cn, hexToRgba } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { MapPin, Calendar, ArrowRight, ArrowLeft, Eye, Star, Loader2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ProjectsContentProps {
  locale: string;
}

interface Category {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string | null;
  nameEs: string | null;
  nameAr: string | null;
  icon: string | null;
  _count?: { projects: number };
}

interface Project {
  id: string;
  titleFr: string;
  titleEn: string | null;
  titleEs: string | null;
  titleAr: string | null;
  slug: string;
  coverImage: string | null;
  location: string | null;
  year: number | null;
  isActive: boolean;
  isFeatured: boolean;
  category: Category | null;
}

type Locale = "fr" | "en" | "es" | "ar";

const ITEMS_PER_PAGE = 9;

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY VISUAL CONFIG - Gradients and emojis for each category
// ═══════════════════════════════════════════════════════════════════════════════

const categoryVisuals: Record<string, { gradient: string; emoji: string }> = {
  cuisines: { gradient: "from-amber-500 to-orange-600", emoji: "🍳" },
  placards: { gradient: "from-stone-500 to-stone-700", emoji: "🚪" },
  portes: { gradient: "from-wood-primary to-wood-secondary", emoji: "🚪" },
  escaliers: { gradient: "from-emerald-600 to-emerald-800", emoji: "🪜" },
  habillage: { gradient: "from-sky-500 to-sky-700", emoji: "🧱" },
  plafonds: { gradient: "from-purple-500 to-purple-700", emoji: "🏠" },
  mosquees: { gradient: "from-teal-500 to-teal-700", emoji: "🕌" },
  decoration: { gradient: "from-rose-500 to-rose-700", emoji: "🎨" },
  mobilier: { gradient: "from-indigo-500 to-indigo-700", emoji: "🪑" },
};

const getVisual = (categorySlug: string | undefined) => {
  return (
    categoryVisuals[categorySlug || ""] || {
      gradient: "from-wood-primary to-wood-dark",
      emoji: "🪵",
    }
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ProjectCard({
  project,
  locale,
  isRTL,
  viewProjectLabel,
  isVisible,
  index,
}: {
  project: Project;
  locale: Locale;
  isRTL: boolean;
  viewProjectLabel: string;
  isVisible: boolean;
  index: number;
}) {
  const visual = getVisual(project.category?.slug);

  // Get localized title
  const title =
    locale === "en" && project.titleEn
      ? project.titleEn
      : locale === "es" && project.titleEs
        ? project.titleEs
        : locale === "ar" && project.titleAr
          ? project.titleAr
          : project.titleFr;

  // Get localized category name
  const categoryName = project.category
    ? locale === "en" && project.category.nameEn
      ? project.category.nameEn
      : locale === "es" && project.category.nameEs
        ? project.category.nameEs
        : locale === "ar" && project.category.nameAr
          ? project.category.nameAr
          : project.category.nameFr
    : null;

  return (
    <div
      className={cn(
        "transform transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="group overflow-hidden h-full">
        <Link href={`/${locale}/realisations/${project.slug}`} className="block">
          {/* Image Container */}
          <span className="relative h-64 overflow-hidden block">
            {project.coverImage ? (
              <img
                src={project.coverImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span
                className={cn(
                  "absolute inset-0 bg-gradient-to-br flex items-center justify-center",
                  visual.gradient
                )}
              >
                <span className="text-7xl opacity-80 group-hover:scale-110 transition-transform duration-500">
                  {project.category?.icon || visual.emoji}
                </span>
              </span>
            )}

            {/* Overlay */}
            <span
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
                "opacity-60 group-hover:opacity-90 transition-opacity duration-300"
              )}
            />

            {/* Category Badge */}
            {categoryName && (
              <span className={cn("absolute top-4 block", isRTL ? "right-4" : "left-4")}>
                <Badge variant="gold" size="sm">
                  {project.category?.icon} {categoryName}
                </Badge>
              </span>
            )}

            {/* Featured Badge */}
            {project.isFeatured && (
              <span className={cn("absolute top-4 block", isRTL ? "left-4" : "right-4")}>
                <span className="w-8 h-8 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-4 h-4" fill="currentColor" />
                </span>
              </span>
            )}

            {/* Hover CTA */}
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "opacity-0 group-hover:opacity-100 transition-all duration-300"
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5",
                  "bg-white text-wood-primary rounded-full font-medium",
                  "shadow-lg transform scale-90 group-hover:scale-100",
                  "transition-transform duration-300"
                )}
              >
                <Eye className="w-4 h-4" />
                {viewProjectLabel}
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </span>
            </span>
          </span>

          {/* Content */}
          <span className={cn("p-5 block", isRTL && "text-right")}>
            <span
              className={cn(
                "text-lg font-semibold text-wood-dark mb-3 block",
                "group-hover:text-wood-primary transition-colors",
                "line-clamp-2"
              )}
            >
              {title}
            </span>

            <span
              className={cn(
                "flex items-center gap-4 text-sm text-wood-muted",
                isRTL && "flex-row-reverse justify-end"
              )}
            >
              {project.location && (
                <span className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                  <MapPin className="w-4 h-4" />
                  {project.location}
                </span>
              )}
              {project.year && (
                <span className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                  <Calendar className="w-4 h-4" />
                  {project.year}
                </span>
              )}
            </span>
          </span>
        </Link>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const translations = {
  filterAll: { fr: "Tous", en: "All", ar: "الكل", es: "Todos" },
  noProjects: {
    fr: "Aucun projet trouvé",
    en: "No projects found",
    ar: "لم يتم العثور على مشاريع",
    es: "No se encontraron proyectos",
  },
  viewProject: {
    fr: "Voir le projet",
    en: "View project",
    ar: "عرض المشروع",
    es: "Ver proyecto",
  },
  heroBadge: {
    fr: "Notre Portfolio",
    en: "Our Portfolio",
    ar: "أعمالنا",
    es: "Nuestro Portafolio",
  },
  heroTitle: {
    fr: "Nos Réalisations",
    en: "Our Projects",
    ar: "مشاريعنا",
    es: "Nuestros Proyectos",
  },
  heroSubtitle: {
    fr: "Découvrez nos créations artisanales, du bois brut à l'œuvre d'art",
    en: "Discover our artisan creations, from raw wood to artwork",
    ar: "اكتشفوا إبداعاتنا الحرفية، من الخشب الخام إلى العمل الفني",
    es: "Descubra nuestras creaciones artesanales, de la madera bruta a la obra de arte",
  },
  stats: {
    projects: { fr: "Projets", en: "Projects", ar: "مشروع", es: "Proyectos" },
    years: { fr: "Années", en: "Years", ar: "سنة", es: "Años" },
    custom: { fr: "Sur Mesure", en: "Custom", ar: "حسب الطلب", es: "A Medida" },
  },
  loading: {
    fr: "Chargement...",
    en: "Loading...",
    ar: "جاري التحميل...",
    es: "Cargando...",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CONTENT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ProjectsContent({ locale }: ProjectsContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const loc = (locale as Locale) || "fr";
  const theme = useThemeSettings();

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch projects and categories from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, categoriesRes] = await Promise.all([
          fetch("/api/cms/portfolio"),
          fetch("/api/cms/portfolio-categories"),
        ]);

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          // Filter only active projects
          const activeProjects = (data.projects || []).filter(
            (p: Project) => p.isActive
          );
          setProjects(activeProjects);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load portfolio data:", error);
      }
      setLoading(false);
    };
    void fetchData();
  }, []);

  // Intersection Observer for animations
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
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") return projects;
    return projects.filter((p) => p.category?.id === selectedCategory);
  }, [selectedCategory, projects]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Get localized category name
  const getCategoryName = (cat: Category): string => {
    if (loc === "en" && cat.nameEn) return cat.nameEn;
    if (loc === "es" && cat.nameEs) return cat.nameEs;
    if (loc === "ar" && cat.nameAr) return cat.nameAr;
    return cat.nameFr;
  };

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{
          ...(theme.realisationsHero.type === "image" && theme.realisationsHero.image
            ? { backgroundImage: `url(${theme.realisationsHero.image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { backgroundColor: theme.realisationsHero.color }),
        }}
      >
        {/* Overlay */}
        {theme.realisationsHero.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.realisationsHero.overlayColor, theme.realisationsHero.overlayOpacity / 100) }} />
        )}

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6" style={{ color: theme.realisationsHero.titleColor }}>
            🏆 {translations.heroBadge[loc]}
          </span>
          <h1
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{ color: theme.realisationsHero.titleColor }}
          >
            {translations.heroTitle[loc]}
          </h1>
          <p
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: theme.realisationsHero.bodyColor }}
          >
            {translations.heroSubtitle[loc]}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 mt-12">
            {[
              { value: `${projects.length || "..."}`, label: translations.stats.projects },
              { value: "30+", label: translations.stats.years },
              { value: "100%", label: translations.stats.custom },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: theme.realisationsHero.titleColor }}>{stat.value}</div>
                <div className="text-sm" style={{ color: theme.realisationsHero.bodyColor, opacity: 0.7 }}>{stat.label[loc]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-6 bg-white border-b border-wood-light/50 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={cn(
              "flex gap-2 overflow-x-auto pb-2 scrollbar-hide",
              isRTL && "flex-row-reverse"
            )}
          >
            {/* "All" button */}
            <button
              onClick={() => handleCategoryChange("all")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap",
                "transition-all duration-200",
                selectedCategory === "all"
                  ? "bg-wood-primary text-white shadow-md"
                  : "bg-wood-light/50 text-wood-dark hover:bg-wood-light"
              )}
            >
              {translations.filterAll[loc]} ({projects.length})
            </button>

            {/* Category buttons from database */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap",
                  "transition-all duration-200",
                  selectedCategory === cat.id
                    ? "bg-wood-primary text-white shadow-md"
                    : "bg-wood-light/50 text-wood-dark hover:bg-wood-light"
                )}
              >
                {cat.icon} {getCategoryName(cat)} ({cat._count?.projects || 0})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section
        ref={sectionRef}
        className="relative py-16 md:py-24"
        style={{
          ...(theme.realisationsGrid.type === "image" && theme.realisationsGrid.image
            ? { backgroundImage: `url(${theme.realisationsGrid.image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { backgroundColor: theme.realisationsGrid.color }),
        }}
      >
        {/* Overlay */}
        {theme.realisationsGrid.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.realisationsGrid.overlayColor, theme.realisationsGrid.overlayOpacity / 100) }} />
        )}
        <div className="relative max-w-7xl mx-auto px-4">
          {loading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-wood-primary animate-spin mb-4" />
              <p className="text-wood-muted text-lg">{translations.loading[loc]}</p>
            </div>
          ) : paginatedProjects.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-wood-light/50 rounded-full flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <p className="text-wood-muted text-lg">{translations.noProjects[loc]}</p>
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    locale={loc}
                    isRTL={isRTL}
                    viewProjectLabel={translations.viewProject[loc]}
                    isVisible={isVisible}
                    index={index}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredProjects.length}
                    pageSize={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    showFirstLast={totalPages > 3}
                    colors={{
                      color: theme.realisationsGrid.paginationColor,
                      activeColor: theme.realisationsGrid.paginationActiveColor,
                      activeBg: theme.realisationsGrid.paginationActiveBg,
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-20"
        style={{
          ...(theme.realisationsCta.type === "image" && theme.realisationsCta.image
            ? { backgroundImage: `url(${theme.realisationsCta.image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { backgroundColor: theme.realisationsCta.color }),
        }}
      >
        {theme.realisationsCta.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.realisationsCta.overlayColor, theme.realisationsCta.overlayOpacity / 100) }} />
        )}
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.realisationsCta.titleColor }}>
            {loc === "fr"
              ? "Vous avez un projet en tête ?"
              : loc === "en"
                ? "Have a project in mind?"
                : loc === "ar"
                  ? "هل لديك مشروع في ذهنك؟"
                  : "¿Tiene un proyecto en mente?"}
          </h2>
          <p className="mb-8 max-w-2xl mx-auto" style={{ color: theme.realisationsCta.bodyColor }}>
            {loc === "fr"
              ? "Contactez-nous pour discuter de votre projet et obtenir un devis personnalisé."
              : loc === "en"
                ? "Contact us to discuss your project and get a personalized quote."
                : loc === "ar"
                  ? "اتصل بنا لمناقشة مشروعك والحصول على عرض سعر مخصص."
                  : "Contáctenos para discutir su proyecto y obtener un presupuesto personalizado."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`/${locale}/devis`}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-8 py-4",
                "bg-wood-primary text-white font-bold rounded-xl",
                "hover:bg-wood-secondary transition-all"
              )}
            >
              {loc === "fr"
                ? "Demander un devis"
                : loc === "en"
                  ? "Request a quote"
                  : loc === "ar"
                    ? "طلب عرض سعر"
                    : "Solicitar presupuesto"}
              <ArrowRight size={20} className={isRTL ? "rotate-180" : ""} />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-8 py-4",
                "bg-white text-wood-dark font-bold rounded-xl",
                "border-2 border-wood-primary hover:bg-wood-cream transition-all"
              )}
            >
              {loc === "fr"
                ? "Nous contacter"
                : loc === "en"
                  ? "Contact us"
                  : loc === "ar"
                    ? "اتصل بنا"
                    : "Contáctenos"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

ProjectsContent.displayName = "ProjectsContent";
