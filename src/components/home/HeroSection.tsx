"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface HeroSlide {
  id: string;
  targetPage: string;
  mediaType: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoPoster?: string | null;
  titleFr: string;
  titleEn?: string | null;
  titleEs?: string | null;
  titleAr?: string | null;
  subtitleFr?: string | null;
  subtitleEn?: string | null;
  subtitleEs?: string | null;
  subtitleAr?: string | null;
  ctaTextFr?: string | null;
  ctaTextEn?: string | null;
  ctaUrl?: string | null;
  cta2TextFr?: string | null;
  cta2TextEn?: string | null;
  cta2Url?: string | null;
  order: number;
  isActive: boolean;
}

// Fallback slides when database is empty
const fallbackSlides = [
  {
    id: "fallback-1",
    targetPage: "home",
    mediaType: "image",
    titleFr: "L'Art du Bois Marocain",
    titleEn: "The Art of Moroccan Wood",
    titleAr: "فن الخشب المغربي",
    subtitleFr: "Menuiserie artisanale et décoration sur mesure depuis 2010",
    subtitleEn: "Artisanal woodworking and custom decoration since 2010",
    subtitleAr: "نجارة حرفية وديكور مخصص منذ 2010",
    imageUrl: "/images/hero/slide-1.jpg",
    ctaTextFr: "Nos Réalisations",
    ctaTextEn: "Our Projects",
    ctaUrl: "/realisations",
    cta2TextFr: "Demander un Devis",
    cta2TextEn: "Request Quote",
    cta2Url: "/devis",
    order: 0,
    isActive: true,
  },
  {
    id: "fallback-2",
    targetPage: "home",
    mediaType: "image",
    titleFr: "Menuiserie Sur Mesure",
    titleEn: "Custom Woodworking",
    titleAr: "نجارة مخصصة",
    subtitleFr: "Des créations uniques adaptées à vos besoins",
    subtitleEn: "Unique creations tailored to your needs",
    subtitleAr: "إبداعات فريدة مصممة حسب احتياجاتك",
    imageUrl: "/images/hero/slide-2.jpg",
    ctaTextFr: "Nos Services",
    ctaTextEn: "Our Services",
    ctaUrl: "/services",
    cta2TextFr: "Contactez-nous",
    cta2TextEn: "Contact Us",
    cta2Url: "/contact",
    order: 1,
    isActive: true,
  },
  {
    id: "fallback-3",
    targetPage: "home",
    mediaType: "image",
    titleFr: "Excellence et Tradition",
    titleEn: "Excellence and Tradition",
    titleAr: "التميز والتقاليد",
    subtitleFr: "Le savoir-faire marocain au service de vos projets",
    subtitleEn: "Moroccan craftsmanship at the service of your projects",
    subtitleAr: "الحرفية المغربية في خدمة مشاريعك",
    imageUrl: "/images/hero/slide-3.jpg",
    ctaTextFr: "Découvrir l'Atelier",
    ctaTextEn: "Discover Workshop",
    ctaUrl: "/atelier",
    cta2TextFr: "Voir la Boutique",
    cta2TextEn: "View Shop",
    cta2Url: "/boutique",
    order: 2,
    isActive: true,
  },
  // Atelier fallback slides
  {
    id: "fallback-atelier-1",
    targetPage: "atelier",
    mediaType: "image",
    titleFr: "L'Atelier",
    titleEn: "The Workshop",
    titleAr: "الورشة",
    titleEs: "El Taller",
    subtitleFr: "Où l'Art du Bois Prend Vie",
    subtitleEn: "Where the Art of Wood Comes to Life",
    subtitleAr: "حيث يولد فن الخشب",
    imageUrl: null,
    ctaTextFr: "Visiter l'atelier",
    ctaTextEn: "Visit the workshop",
    ctaUrl: "/contact",
    cta2TextFr: "Nos Réalisations",
    cta2TextEn: "Our Projects",
    cta2Url: "/realisations",
    order: 0,
    isActive: true,
  },
];

// ═══════════════════════════════════════════════════════════
// HERO SECTION COMPONENT
// ═══════════════════════════════════════════════════════════

interface HeroSectionProps {
  page?: string;
  autoPlayInterval?: number;
}

export function HeroSection({
  page = "home",
  autoPlayInterval = 3000,
}: HeroSectionProps) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const direction = useDirection();
  const isRTL = direction === "rtl";

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`/api/public/hero-slides/${page}`);
        if (res.ok) {
          const data = await res.json();
          if (data.slides && data.slides.length > 0) {
            setSlides(data.slides);
          } else {
            // Use fallback slides if none in database
            setSlides(fallbackSlides.filter((s) => s.targetPage === page));
          }
        } else {
          setSlides(fallbackSlides.filter((s) => s.targetPage === page));
        }
      } catch (error) {
        console.error("Error fetching hero slides:", error);
        setSlides(fallbackSlides.filter((s) => s.targetPage === page));
      }
      setLoading(false);
    };

    fetchSlides();
  }, [page]);

  // Get localized content
  const getLocalized = useCallback(
    (
      slide: HeroSlide,
      field: "title" | "subtitle" | "ctaText" | "cta2Text"
    ): string => {
      const fieldMap: Record<string, Record<string, keyof HeroSlide>> = {
        title: { fr: "titleFr", en: "titleEn", es: "titleEs", ar: "titleAr" },
        subtitle: {
          fr: "subtitleFr",
          en: "subtitleEn",
          es: "subtitleEs",
          ar: "subtitleAr",
        },
        ctaText: { fr: "ctaTextFr", en: "ctaTextEn" },
        cta2Text: { fr: "cta2TextFr", en: "cta2TextEn" },
      };

      const localeField = fieldMap[field]?.[locale];
      const frField = fieldMap[field]?.["fr"];

      if (localeField && slide[localeField]) {
        return slide[localeField] as string;
      }
      if (frField && slide[frField]) {
        return slide[frField] as string;
      }
      return "";
    },
    [locale]
  );

  // Navigation functions
  const goToSlide = useCallback(
    (index: number) => {
      if (!isAnimating && index !== currentSlide && slides.length > 1) {
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 500);
      }
    },
    [isAnimating, currentSlide, slides.length]
  );

  const nextSlide = useCallback(() => {
    if (slides.length > 1) {
      goToSlide((currentSlide + 1) % slides.length);
    }
  }, [currentSlide, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    if (slides.length > 1) {
      goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }
  }, [currentSlide, slides.length, goToSlide]);

  // Auto-advance slides - INFINITE LOOP (images use interval, videos play to end)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const active = slides[currentSlide];
    const isVideo = active?.mediaType === "video" && active.videoUrl;

    if (isVideo) {
      // For video slides: advance when video ends (with 15s fallback)
      const video = videoRefs.current[active.id];
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Browser blocked unmuted autoplay — fall back to muted
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
      const handleEnded = () => {
        if (!isAnimating) {
          setIsAnimating(true);
          setCurrentSlide((prev) => (prev + 1) % slides.length);
          setTimeout(() => setIsAnimating(false), 500);
        }
      };
      if (video) {
        video.addEventListener("ended", handleEnded);
      }
      const fallback = setTimeout(handleEnded, 15000);
      return () => {
        if (video) video.removeEventListener("ended", handleEnded);
        clearTimeout(fallback);
      };
    } else {
      // For image slides: use fixed interval
      const timer = setInterval(() => {
        if (!isAnimating) {
          setIsAnimating(true);
          setCurrentSlide((prev) => (prev + 1) % slides.length);
          setTimeout(() => setIsAnimating(false), 500);
        }
      }, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [slides, currentSlide, isAnimating, isPaused, autoPlayInterval]);

  // Pause/play videos when slide changes
  useEffect(() => {
    slides.forEach((slide, index) => {
      if (slide.mediaType !== "video" || !slide.videoUrl) return;
      const video = videoRefs.current[slide.id];
      if (!video) return;
      if (index === currentSlide) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Browser blocked unmuted autoplay — fall back to muted
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      } else {
        video.pause();
      }
    });
  }, [currentSlide, slides]);

  const scrollToContent = () => {
    const heroSection = document.querySelector('section');
    window.scrollTo({
      top: heroSection?.offsetHeight || 700,
      behavior: "smooth",
    });
  };

  // Loading state
  if (loading) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px] md:min-h-[500px] w-full bg-gradient-to-r from-amber-800 to-amber-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        </div>
      </section>
    );
  }

  // No slides fallback
  if (slides.length === 0) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px] md:min-h-[500px] w-full bg-gradient-to-r from-amber-800 to-amber-600 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Le Tatche Bois</h1>
          <p className="text-lg md:text-xl">L&apos;Art du Bois Marocain</p>
        </div>
      </section>
    );
  }

  const activeSlide = slides[currentSlide];
  if (!activeSlide) return null;

  return (
    <section
      className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px] md:min-h-[500px] w-full overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides - only render current, prev, next for performance */}
      {slides.map((slide, index) => {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        const next = (currentSlide + 1) % slides.length;
        const shouldRender = index === currentSlide || index === prev || index === next;
        if (!shouldRender) return null;

        const isVideo = slide.mediaType === "video" && slide.videoUrl;

        return (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {isVideo ? (
              <video
                ref={(el) => { videoRefs.current[slide.id] = el; }}
                src={slide.videoUrl!}
                poster={slide.videoPoster || undefined}
                className="absolute inset-0 w-full h-full object-cover"
                muted={isMuted}
                playsInline
                preload="auto"
              />
            ) : slide.imageUrl ? (
              <Image
                src={slide.imageUrl}
                alt={getLocalized(slide, "title") || "Hero image"}
                fill
                priority={index === currentSlide}
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-600" />
            )}

            {/* Overlay: bottom-heavy gradient on mobile, subtle on desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent md:bg-gradient-to-b md:from-black/30 md:via-transparent md:to-black/40" />
          </div>
        );
      })}

      {/* Slide Counter - TOP RIGHT (never overlaps buttons) */}
      {slides.length > 1 && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/50 text-white text-xs md:text-sm px-3 py-1.5 rounded-full">
          {activeSlide.mediaType === "video" ? "▶ " : ""}
          {currentSlide + 1} / {slides.length}
        </div>
      )}

      {/* Content - Bottom-aligned on mobile, centered-left on desktop */}
      <div className={cn(
        "relative z-20 h-full flex flex-col justify-end items-start pb-8",
        "md:flex-row md:items-center md:justify-start md:pb-0",
        "px-4 sm:px-8 md:px-16 lg:px-24"
      )}>
        <div className={cn(
          "max-w-[280px] sm:max-w-sm md:max-w-2xl",
          "text-left md:text-left",
          isRTL && "text-right md:text-right md:ml-auto md:mr-0"
        )}>
          {/* Title - Compact on mobile, large on desktop */}
          <h1
            key={`title-${currentSlide}`}
            className={cn(
              "font-heading text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl",
              "text-white font-bold leading-tight mb-2 md:mb-4",
              "animate-fade-up"
            )}
          >
            {getLocalized(activeSlide, "title") || t("slide1.title")}
          </h1>

          {/* Subtitle - Compact single-line on mobile, full on desktop */}
          <p
            key={`subtitle-${currentSlide}`}
            className={cn(
              "text-xs sm:text-sm md:text-lg lg:text-xl text-white/90",
              "mb-3 md:mb-6 lg:mb-8 max-w-xl",
              "truncate md:whitespace-normal md:overflow-visible",
              "animate-fade-up animation-delay-200",
              isRTL ? "md:mr-0 md:ml-auto" : "md:mx-0"
            )}
          >
            {getLocalized(activeSlide, "subtitle") || t("slide1.subtitle")}
          </p>

          {/* CTAs - Side by side on mobile, row on desktop */}
          <div
            className={cn(
              "flex flex-row gap-3 w-auto",
              "justify-start",
              "animate-fade-up animation-delay-400",
              isRTL && "flex-row-reverse"
            )}
          >
            {activeSlide.ctaUrl && getLocalized(activeSlide, "ctaText") && (
              <Link
                href={
                  activeSlide.ctaUrl.startsWith("/")
                    ? `/${locale}${activeSlide.ctaUrl}`
                    : activeSlide.ctaUrl
                }
                className={cn(
                  "inline-flex items-center justify-center",
                  "px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold rounded-lg",
                  "bg-amber-600 hover:bg-amber-700",
                  "text-white shadow-lg",
                  "transition-colors text-center"
                )}
              >
                {getLocalized(activeSlide, "ctaText")}
              </Link>
            )}
            {activeSlide.cta2Url && getLocalized(activeSlide, "cta2Text") && (
              <Link
                href={
                  activeSlide.cta2Url.startsWith("/")
                    ? `/${locale}${activeSlide.cta2Url}`
                    : activeSlide.cta2Url
                }
                className={cn(
                  "inline-flex items-center justify-center",
                  "px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold rounded-lg",
                  "bg-white/10 hover:bg-white/20 border border-white/30",
                  "text-white",
                  "transition-colors text-center"
                )}
              >
                {getLocalized(activeSlide, "cta2Text")}
              </Link>
            )}
            {/* Fallback CTAs if no database CTAs */}
            {!activeSlide.ctaUrl && (
              <>
                <Link
                  href={`/${locale}/realisations`}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold rounded-lg",
                    "bg-amber-600 hover:bg-amber-700",
                    "text-white shadow-lg",
                    "transition-colors text-center"
                  )}
                >
                  {t("cta.projects")}
                </Link>
                <Link
                  href={`/${locale}/devis`}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold rounded-lg",
                    "bg-white/10 hover:bg-white/20 border border-white/30",
                    "text-white",
                    "transition-colors text-center"
                  )}
                >
                  {t("cta.quote")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on small mobile */}
      {slides.length > 1 && (
        <>
          <button
            onClick={isRTL ? nextSlide : prevSlide}
            className={cn(
              "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-30",
              "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full",
              "bg-black/30 hover:bg-black/50",
              "items-center justify-center",
              "text-white transition-colors",
              isRTL ? "right-2 md:right-4" : "left-2 md:left-4"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={isRTL ? prevSlide : nextSlide}
            className={cn(
              "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-30",
              "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full",
              "bg-black/30 hover:bg-black/50",
              "items-center justify-center",
              "text-white transition-colors",
              isRTL ? "left-2 md:left-4" : "right-2 md:right-4"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Video Mute/Unmute Button */}
      {activeSlide.mediaType === "video" && activeSlide.videoUrl && (
        <button
          onClick={() => {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            Object.values(videoRefs.current).forEach((v) => {
              if (v) v.muted = newMuted;
            });
          }}
          className="absolute bottom-16 md:bottom-20 right-4 z-30 p-2 md:p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
        </button>
      )}

      {/* Progress Bar (only for image slides) */}
      {slides.length > 1 && !isPaused && activeSlide.mediaType !== "video" && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-30">
          <div
            key={currentSlide}
            className="h-full bg-amber-500"
            style={{
              animation: `heroProgress ${autoPlayInterval}ms linear`,
            }}
          />
        </div>
      )}

      {/* Scroll Indicator - Only on desktop */}
      <button
        onClick={scrollToContent}
        className={cn(
          "hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-30",
          "flex-col items-center gap-1",
          "text-white/70 hover:text-white transition-colors",
          "animate-bounce"
        )}
        aria-label="Scroll to content"
      >
        <span className="text-sm font-medium">{t("scroll")}</span>
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes heroProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

HeroSection.displayName = "HeroSection";

export default HeroSection;
