"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface SiteService {
  id: string;
  titleFr: string;
  titleEn: string | null;
  titleEs: string | null;
  titleAr: string | null;
  shortDescFr: string | null;
  shortDescEn: string | null;
  icon: string | null;
  image: string | null;
  slug: string | null;
  hasDetailPage: boolean;
  isFeatured: boolean;
}

type Locale = "fr" | "en" | "es" | "ar";

// ═══════════════════════════════════════════════════════════
// HELPER: Get localized text with French fallback
// ═══════════════════════════════════════════════════════════

function getLocalizedTitle(service: SiteService, locale: Locale): string {
  if (locale === "en" && service.titleEn?.trim()) return service.titleEn;
  if (locale === "es" && service.titleEs?.trim()) return service.titleEs;
  if (locale === "ar" && service.titleAr?.trim()) return service.titleAr;
  return service.titleFr;
}

function getShortDesc(service: SiteService, locale: Locale): string {
  if (locale === "en" && service.shortDescEn?.trim()) return service.shortDescEn;
  return service.shortDescFr || "";
}

// ═══════════════════════════════════════════════════════════
// SERVICE CARD COMPONENT
// ═══════════════════════════════════════════════════════════

function ServiceCard({
  service,
  locale,
  isRTL,
  t,
  index,
  isVisible,
}: {
  service: SiteService;
  locale: Locale;
  isRTL: boolean;
  t: (key: string) => string;
  index: number;
  isVisible: boolean;
}) {
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const title = getLocalizedTitle(service, locale);
  const desc = getShortDesc(service, locale);
  const href = service.slug && service.hasDetailPage
    ? `/${locale}/services/${service.slug}`
    : `/${locale}/services`;

  return (
    <Link
      href={href}
      className={cn(
        "group relative block bg-white rounded-2xl overflow-hidden",
        "border border-gray-100 shadow-sm",
        "hover:shadow-xl hover:border-wood-primary/30",
        "transition-all duration-500",
        "transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Service image or icon header */}
      {service.image ? (
        <div className="relative h-44 overflow-hidden">
          <img
            src={service.image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Icon overlay */}
          {service.icon && (
            <span className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl shadow-sm">
              {service.icon}
            </span>
          )}
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-wood-cream to-wood-light flex items-center justify-center">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {service.icon || "🪵"}
          </span>
        </div>
      )}

      {/* Content */}
      <div className={cn("p-5", isRTL && "text-right")}>
        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-gray-900 mb-2 group-hover:text-wood-primary transition-colors">
          {title}
        </h3>

        {/* Short Description */}
        {desc && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {desc}
          </p>
        )}

        {/* CTA link */}
        <div
          className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse justify-end"
          )}
        >
          <span className="text-sm font-medium text-wood-primary group-hover:text-wood-dark transition-colors">
            {t("learnMore")}
          </span>
          <div className="w-8 h-8 bg-wood-light group-hover:bg-wood-primary rounded-full flex items-center justify-center transition-colors">
            <Arrow className="w-4 h-4 text-wood-primary group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════
// SERVICES PREVIEW COMPONENT
// ═══════════════════════════════════════════════════════════

export function ServicesPreview() {
  const t = useTranslations("home.servicesPreview");
  const locale = useLocale() as Locale;
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [services, setServices] = useState<SiteService[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real services from API
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/services?limit=6");
        if (res.ok) {
          const json = await res.json();
          // API returns: { success, data: { data: [...], pagination: {...} } }
          const list: SiteService[] = json.data?.data || json.data || [];
          // Only show featured services, or all if none are featured
          const featured = list.filter((s) => s.isFeatured);
          setServices(featured.length > 0 ? featured.slice(0, 6) : list.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to load services:", error);
      }
      setLoading(false);
    };
    void fetchServices();
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

  // Don't render if no services loaded and not loading
  if (!loading && services.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className={cn("text-center mb-12", isRTL && "text-right")}>
          <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {t("badge")}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl text-white font-bold mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {t("title")}
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {t("subtitle")}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        ) : (
          <>
            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  locale={locale}
                  isRTL={isRTL}
                  t={t}
                  index={index}
                  isVisible={isVisible}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                href={`/${locale}/services`}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3",
                  "bg-wood-primary text-white rounded-lg",
                  "hover:bg-wood-secondary transition-colors",
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

ServicesPreview.displayName = "ServicesPreview";

export default ServicesPreview;
