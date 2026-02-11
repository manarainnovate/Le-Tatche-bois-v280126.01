"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDirection } from "@/hooks/useDirection";
import { cn, hexToRgba } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import { Accordion } from "@/components/ui/Accordion";
import {
  MessageSquare,
  PenTool,
  Hammer,
  Truck,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Award,
  Shield,
  CheckCircle,
  Clock,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface ServiceItem {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  titleEs: string;
  titleAr: string;
  shortDescFr: string;
  shortDescEn: string;
  icon: string;
  image: string;
  hasDetailPage: boolean;
  isFeatured: boolean;
  galleryImages: string[];
}

interface ProcessStep {
  icon: typeof MessageSquare;
  key: string;
}

interface ServicesContentProps {
  locale: string;
  services: ServiceItem[];
  heroImages: string[];
  translations: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    servicesTitle: string;
    servicesSubtitle: string;
    requestQuote: string;
    viewDetails: string;
    processTitle: string;
    processSubtitle: string;
    processStepLabel: string;
    processSteps: Record<string, { title: string; description: string }>;
    faqTitle: string;
    faqSubtitle: string;
    faqItems: Record<string, { question: string; answer: string }>;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
  };
}

// ═══════════════════════════════════════════════════════════
// LOCALE HELPER
// ═══════════════════════════════════════════════════════════

function t(
  item: { titleFr: string; titleEn: string; titleEs: string; titleAr: string },
  field: "title",
  locale: string
): string;
function t(
  item: { shortDescFr: string; shortDescEn: string },
  field: "shortDesc",
  locale: string
): string;
function t(item: Record<string, string>, field: string, locale: string): string {
  const suffix = locale === "fr" ? "Fr" : locale === "en" ? "En" : locale === "es" ? "Es" : "Ar";
  const key = `${field}${suffix}`;
  return item[key] || item[`${field}Fr`] || "";
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

const processSteps: ProcessStep[] = [
  { icon: MessageSquare, key: "consultation" },
  { icon: PenTool, key: "design" },
  { icon: Hammer, key: "fabrication" },
  { icon: Truck, key: "installation" },
];

const faqKeys = ["delays", "woodTypes", "deliveryZone", "howToQuote", "warranty"];

// ═══════════════════════════════════════════════════════════
// IMAGE SLIDER COMPONENT
// ═══════════════════════════════════════════════════════════

function ServiceImageSlider({
  images,
  serviceName,
}: {
  images: string[];
  serviceName: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const MIN_SWIPE_DISTANCE = 50;

  const nextSlide = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  const prevSlide = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length]
  );

  // Auto-slide when hovering
  useEffect(() => {
    if (!isHovering || images.length <= 1) return;
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, [isHovering, nextSlide, images.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0]?.clientX ?? 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? 0);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  if (images.length === 0) {
    return (
      <div className="relative h-64 w-full bg-wood-cream flex items-center justify-center">
        <span className="text-wood-muted text-sm">No images</span>
      </div>
    );
  }

  return (
    <div
      className="relative h-64 w-full overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      {images.slice(0, 6).map((img, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            idx === currentIndex ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={img}
            alt={`${serviceName} - Image ${idx + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Navigation Arrows (always visible on mobile, show on hover on desktop) */}
      {images.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between px-2 md:transition-opacity md:opacity-0 md:hover:opacity-100">
          <button
            onClick={prevSlide}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} className="text-wood-dark" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight size={20} className="text-wood-dark" />
          </button>
        </div>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.slice(0, 6).map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === currentIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 rounded text-white text-xs z-10">
          {currentIndex + 1}/{Math.min(images.length, 6)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SERVICE CARD COMPONENT
// ═══════════════════════════════════════════════════════════

function ServiceCard({
  service,
  locale,
  isRTL,
  viewDetails,
  isVisible,
  index,
}: {
  service: ServiceItem;
  locale: string;
  isRTL: boolean;
  viewDetails: string;
  isVisible: boolean;
  index: number;
}) {
  const title = t(service, "title", locale);
  const description = t(
    { shortDescFr: service.shortDescFr, shortDescEn: service.shortDescEn },
    "shortDesc",
    locale
  );

  return (
    <div
      className={cn(
        "transform transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Link
        href={service.hasDetailPage ? `/${locale}/services/${service.slug}` : `/${locale}/devis?service=${service.slug}`}
        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden block h-full"
      >
        {/* Image Slider */}
        <ServiceImageSlider images={service.galleryImages} serviceName={title} />

        {/* Content */}
        <div className="p-6">
          {/* Icon & Title Row */}
          <div
            className={cn(
              "flex items-center gap-3 mb-4",
              isRTL && "flex-row-reverse"
            )}
          >
            {service.icon && (
              <span className="text-3xl" role="img" aria-hidden="true">
                {service.icon}
              </span>
            )}
            <h3
              className={cn(
                "text-xl font-bold text-wood-dark group-hover:text-wood-primary transition-colors",
                isRTL && "text-right"
              )}
            >
              {title}
            </h3>
          </div>

          {/* Description */}
          <p
            className={cn(
              "text-wood-muted mb-6 line-clamp-3",
              isRTL && "text-right"
            )}
          >
            {description}
          </p>

          {/* Action Button */}
          <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
            <span
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2",
                "py-3 px-4 bg-wood-primary text-white font-semibold rounded-xl",
                "group-hover:bg-wood-secondary transition-colors"
              )}
            >
              {viewDetails}
              {isRTL ? (
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              ) : (
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              )}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TRUST BADGES COMPONENT
// ═══════════════════════════════════════════════════════════

function TrustBadges({ isRTL }: { isRTL: boolean }) {
  const badges = [
    { icon: Award, text: "30 ans d'experience" },
    { icon: Shield, text: "Garantie 2 ans" },
    { icon: CheckCircle, text: "Devis gratuit" },
    { icon: Clock, text: "Reponse sous 24h" },
  ];

  return (
    <section className="bg-white py-6 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className={cn(
            "flex flex-wrap justify-center gap-8 md:gap-12",
            isRTL && "flex-row-reverse"
          )}
        >
          {badges.map((badge, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 text-wood-dark",
                isRTL && "flex-row-reverse"
              )}
            >
              <badge.icon className="w-5 h-5 text-wood-primary" />
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// PROCESS STEP COMPONENT
// ═══════════════════════════════════════════════════════════

function ProcessStepCard({
  step,
  index,
  isLast,
  isRTL,
  stepLabel,
  title,
  description,
  isVisible,
}: {
  step: ProcessStep;
  index: number;
  isLast: boolean;
  isRTL: boolean;
  stepLabel: string;
  title: string;
  description: string;
  isVisible: boolean;
}) {
  const Icon = step.icon;
  const stepNumber = index + 1;

  return (
    <div
      className={cn(
        "relative text-center",
        "transform transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Connector line */}
      {!isLast && (
        <div
          className={cn(
            "hidden lg:block absolute top-10 h-0.5 bg-gradient-to-r from-wood-primary/50 to-wood-secondary/50",
            isRTL ? "right-1/2 left-0" : "left-1/2 right-0",
            "w-full"
          )}
        />
      )}

      <div className="relative z-10">
        {/* Icon Circle */}
        <div
          className={cn(
            "w-20 h-20 mx-auto mb-5",
            "bg-gradient-to-br from-wood-primary to-wood-secondary",
            "text-white rounded-2xl",
            "flex items-center justify-center",
            "shadow-lg shadow-wood-primary/30",
            "transform transition-transform duration-300",
            "hover:scale-110 hover:rotate-3"
          )}
        >
          <Icon className="w-10 h-10" />
        </div>

        {/* Step Label */}
        <span
          className={cn(
            "inline-block px-3 py-1 mb-3",
            "bg-wood-light/50 rounded-full",
            "text-sm font-medium text-wood-primary"
          )}
        >
          {stepLabel.replace("{number}", String(stepNumber))}
        </span>

        {/* Title */}
        <h3
          className={cn(
            "text-lg font-semibold text-wood-dark mb-2",
            isRTL && "text-right"
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            "text-wood-muted text-sm leading-relaxed max-w-xs mx-auto",
            isRTL && "text-right"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN CONTENT COMPONENT
// ═══════════════════════════════════════════════════════════

export function ServicesContent({
  locale,
  services,
  heroImages,
  translations,
}: ServicesContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const theme = useThemeSettings();

  // Hero slideshow state
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const heroNext = useCallback(() => {
    if (heroImages.length <= 1) return;
    setHeroIndex((prev) => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  const heroPrev = useCallback(() => {
    if (heroImages.length <= 1) return;
    setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  }, [heroImages.length]);

  // Auto-play hero slideshow
  useEffect(() => {
    if (heroImages.length <= 1 || heroPaused) return;
    const interval = setInterval(heroNext, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length, heroPaused, heroNext]);

  // Section visibility states
  const servicesRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const [servicesVisible, setServicesVisible] = useState(false);
  const [processVisible, setProcessVisible] = useState(false);
  const [faqVisible, setFaqVisible] = useState(false);

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };

    const servicesObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        setServicesVisible(true);
        servicesObserver.disconnect();
      }
    }, observerOptions);

    const processObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        setProcessVisible(true);
        processObserver.disconnect();
      }
    }, observerOptions);

    const faqObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        setFaqVisible(true);
        faqObserver.disconnect();
      }
    }, observerOptions);

    if (servicesRef.current) servicesObserver.observe(servicesRef.current);
    if (processRef.current) processObserver.observe(processRef.current);
    if (faqRef.current) faqObserver.observe(faqRef.current);

    return () => {
      servicesObserver.disconnect();
      processObserver.disconnect();
      faqObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* Hero Section - Full-width background slideshow */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "75vh", minHeight: "500px" }}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        {/* Background Slides */}
        <div className="absolute inset-0">
          {heroImages.length > 0 ? (
            heroImages.map((img, i) => {
              const prev = (heroIndex - 1 + heroImages.length) % heroImages.length;
              const next = (heroIndex + 1) % heroImages.length;
              const isVisible = i === heroIndex || i === prev || i === next;
              if (!isVisible) return null;
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700 bg-cover bg-center bg-no-repeat",
                    i === heroIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  )}
                  style={{ backgroundImage: `url(${img})` }}
                />
              );
            })
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-wood-primary via-wood-secondary to-wood-dark" />
          )}
        </div>

        {/* Dynamic overlay */}
        {theme.servicesHero.overlayEnabled && (
          <div
            className="absolute inset-0 z-20"
            style={{ backgroundColor: hexToRgba(theme.servicesHero.overlayColor, theme.servicesHero.overlayOpacity / 100) }}
          />
        )}

        {/* Content */}
        <div className="relative z-30 h-full flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-4 w-full text-center">
            {theme.servicesHero.cardEnabled ? (
              <div
                className="inline-block px-8 py-8 rounded-2xl max-w-3xl mx-auto"
                style={{
                  backgroundColor: hexToRgba(theme.servicesHero.cardColor, theme.servicesHero.cardOpacity / 100),
                  ...(theme.servicesHero.cardBlur ? { backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } : {}),
                }}
              >
                <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6" style={{ color: theme.servicesHero.titleColor }}>
                  {translations.heroBadge}
                </span>
                <h1 className={cn("font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6", isRTL && "text-right")} style={{ color: theme.servicesHero.titleColor }}>
                  {translations.heroTitle}
                </h1>
                <p className={cn("text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed", isRTL && "text-right")} style={{ color: theme.servicesHero.bodyColor }}>
                  {translations.heroSubtitle}
                </p>
              </div>
            ) : (
              <>
                <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6" style={{ color: theme.servicesHero.titleColor }}>
                  {translations.heroBadge}
                </span>
                <h1 className={cn("font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6", isRTL && "text-right")} style={{ color: theme.servicesHero.titleColor }}>
                  {translations.heroTitle}
                </h1>
                <p className={cn("text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed", isRTL && "text-right")} style={{ color: theme.servicesHero.bodyColor }}>
                  {translations.heroSubtitle}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={heroPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={heroNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot indicators (for ≤20 images) */}
        {heroImages.length > 1 && heroImages.length <= 20 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={cn(
                  "h-3 rounded-full transition-all",
                  i === heroIndex
                    ? "bg-amber-500 w-8"
                    : "bg-white/50 hover:bg-white/80 w-3"
                )}
              />
            ))}
          </div>
        )}

        {/* Counter (for >20 images) */}
        {heroImages.length > 20 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-black/40 rounded-full text-white text-sm font-medium">
            {heroIndex + 1} / {heroImages.length}
          </div>
        )}

        {/* Slide counter top-right */}
        {heroImages.length > 1 && (
          <div className="absolute top-4 right-4 z-30 px-3 py-1 bg-black/30 rounded-full text-white text-sm">
            {heroIndex + 1} / {heroImages.length}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <TrustBadges isRTL={isRTL} />

      {/* Services Grid Section */}
      <section
        ref={servicesRef}
        className="relative py-16 md:py-24"
        style={{
          ...(theme.servicesGrid.type === "image" && theme.servicesGrid.image
            ? { backgroundImage: `url(${theme.servicesGrid.image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { backgroundColor: theme.servicesGrid.color }),
        }}
      >
        {theme.servicesGrid.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.servicesGrid.overlayColor, theme.servicesGrid.overlayOpacity / 100) }} />
        )}
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className={cn("text-center mb-12", isRTL && "text-right")}>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.servicesGrid.titleColor }}>
              {translations.servicesTitle}
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.servicesGrid.bodyColor }}>
              {translations.servicesSubtitle}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                locale={locale}
                isRTL={isRTL}
                viewDetails={translations.viewDetails ?? "Voir les details"}
                isVisible={servicesVisible}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section ref={processRef} className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className={cn("text-center mb-16", isRTL && "text-right")}>
            <h2 className="font-heading text-3xl md:text-4xl text-wood-dark font-bold mb-4">
              {translations.processTitle}
            </h2>
            <p className="text-wood-muted text-lg max-w-2xl mx-auto">
              {translations.processSubtitle}
            </p>
          </div>

          {/* Process Steps */}
          <div
            className={cn(
              "grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4",
              isRTL && "lg:flex-row-reverse"
            )}
          >
            {processSteps.map((step, index) => (
              <ProcessStepCard
                key={step.key}
                step={step}
                index={index}
                isLast={index === processSteps.length - 1}
                isRTL={isRTL}
                stepLabel={translations.processStepLabel}
                title={translations.processSteps[step.key]?.title ?? ""}
                description={
                  translations.processSteps[step.key]?.description ?? ""
                }
                isVisible={processVisible}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-16 md:py-24 bg-wood-cream">
        <div className="max-w-3xl mx-auto px-4">
          {/* Section Header */}
          <div className={cn("text-center mb-12", isRTL && "text-right")}>
            <h2 className="font-heading text-3xl md:text-4xl text-wood-dark font-bold mb-4">
              {translations.faqTitle}
            </h2>
            <p className="text-wood-muted text-lg">
              {translations.faqSubtitle}
            </p>
          </div>

          {/* Accordion */}
          <div
            className={cn(
              "transform transition-all duration-500",
              faqVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            )}
          >
            <Accordion type="single" collapsible>
              {faqKeys.map((key) => (
                <Accordion.Item key={key} value={key}>
                  <Accordion.Trigger>
                    {translations.faqItems[key]?.question ?? ""}
                  </Accordion.Trigger>
                  <Accordion.Content>
                    {translations.faqItems[key]?.answer ?? ""}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-16 md:py-24"
        style={{
          ...(theme.servicesCta.type === "image" && theme.servicesCta.image
            ? { backgroundImage: `url(${theme.servicesCta.image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { backgroundColor: theme.servicesCta.color }),
        }}
      >
        {theme.servicesCta.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.servicesCta.overlayColor, theme.servicesCta.overlayOpacity / 100) }} />
        )}
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2
            className={cn(
              "font-heading text-2xl md:text-3xl lg:text-4xl font-bold mb-6",
              isRTL && "text-right"
            )}
            style={{ color: theme.servicesCta.titleColor }}
          >
            {translations.ctaTitle}
          </h2>
          <p
            className={cn(
              "text-lg mb-8 max-w-2xl mx-auto",
              isRTL && "text-right"
            )}
            style={{ color: theme.servicesCta.bodyColor }}
          >
            {translations.ctaDescription}
          </p>
          <Link
            href={`/${locale}/devis`}
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "px-8 py-4 text-lg font-medium rounded-lg",
              "bg-white text-wood-primary",
              "shadow-lg hover:bg-wood-cream transition-all duration-200",
              "transform hover:scale-105 active:scale-[0.98]",
              isRTL && "flex-row-reverse"
            )}
          >
            {translations.ctaButton}
            {isRTL ? (
              <ArrowLeft className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </Link>
        </div>
      </section>
    </>
  );
}

ServicesContent.displayName = "ServicesContent";
