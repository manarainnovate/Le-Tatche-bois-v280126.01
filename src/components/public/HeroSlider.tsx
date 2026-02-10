"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface HeroSlide {
  id: string;
  titleFr?: string | null;
  titleEn?: string | null;
  titleEs?: string | null;
  titleAr?: string | null;
  subtitleFr?: string | null;
  subtitleEn?: string | null;
  subtitleEs?: string | null;
  subtitleAr?: string | null;
  imageUrl: string | null;
  ctaTextFr?: string | null;
  ctaTextEn?: string | null;
  ctaUrl?: string | null;
  cta2TextFr?: string | null;
  cta2TextEn?: string | null;
  cta2Url?: string | null;
  overlayColor?: string | null;
  overlayOpacity?: number | null;
  textPosition?: string | null;
  textColor?: string | null;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  locale?: string;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  pauseOnHover?: boolean;
  transitionDuration?: number;
  height?: string;
}

// ═══════════════════════════════════════════════════════════
// Hero Slider Component
// ═══════════════════════════════════════════════════════════

export default function HeroSlider({
  slides,
  locale = "fr",
  autoPlayInterval = 3000,
  showControls = true,
  showIndicators = true,
  pauseOnHover = true,
  transitionDuration = 700,
  height = "70vh",
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isRTL = locale === "ar";

  // Get localized content
  const getLocalized = (
    item: HeroSlide,
    field: "title" | "subtitle" | "ctaText" | "cta2Text"
  ): string => {
    const fieldMap: Record<string, Record<string, keyof HeroSlide>> = {
      title: { fr: "titleFr", en: "titleEn", es: "titleEs", ar: "titleAr" },
      subtitle: { fr: "subtitleFr", en: "subtitleEn", es: "subtitleEs", ar: "subtitleAr" },
      ctaText: { fr: "ctaTextFr", en: "ctaTextEn" },
      cta2Text: { fr: "cta2TextFr", en: "cta2TextEn" },
    };

    const localeField = fieldMap[field]?.[locale];
    const frField = fieldMap[field]?.["fr"];

    if (localeField && item[localeField]) {
      return item[localeField] as string;
    }
    if (frField && item[frField]) {
      return item[frField] as string;
    }
    return "";
  };

  // Go to next slide
  const nextSlide = useCallback(() => {
    if (isTransitioning || slides.length <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);

    setTimeout(() => setIsTransitioning(false), transitionDuration);
  }, [slides.length, isTransitioning, transitionDuration]);

  // Go to previous slide
  const prevSlide = useCallback(() => {
    if (isTransitioning || slides.length <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

    setTimeout(() => setIsTransitioning(false), transitionDuration);
  }, [slides.length, isTransitioning, transitionDuration]);

  // Go to specific slide
  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;

      setIsTransitioning(true);
      setCurrentIndex(index);

      setTimeout(() => setIsTransitioning(false), transitionDuration);
    },
    [currentIndex, isTransitioning, transitionDuration]
  );

  // Auto-play effect - INFINITE LOOP
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [slides.length, isPaused, autoPlayInterval, nextSlide]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        isRTL ? nextSlide() : prevSlide();
      }
      if (e.key === "ArrowRight") {
        isRTL ? prevSlide() : nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isRTL]);

  // If no slides, show placeholder
  if (!slides || slides.length === 0) {
    return (
      <div
        className="relative w-full bg-gradient-to-r from-amber-800 to-amber-600 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Le Tatche Bois</h1>
          <p className="text-xl">L&apos;Art du Bois Marocain</p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];
  if (!currentSlide) return null;

  const textPosition = currentSlide.textPosition || "center";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative w-full overflow-hidden group"
      style={{ height }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{ transitionDuration: `${transitionDuration}ms` }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: slide.imageUrl ? `url(${slide.imageUrl})` : undefined }}
            />

            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: slide.overlayColor || "rgba(0,0,0,0.4)",
                opacity: slide.overlayOpacity ?? 0.4,
              }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div
          className={`container mx-auto px-4 md:px-8 ${
            textPosition === "left"
              ? "text-left"
              : textPosition === "right"
              ? "text-right ml-auto"
              : "text-center mx-auto"
          }`}
          style={{
            maxWidth: textPosition === "center" ? "900px" : "600px",
          }}
        >
          {/* Title */}
          {getLocalized(currentSlide, "title") && (
            <h1
              key={`title-${currentIndex}`}
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight animate-fade-in-up"
              style={{ color: currentSlide.textColor || "#ffffff" }}
            >
              {getLocalized(currentSlide, "title")}
            </h1>
          )}

          {/* Subtitle */}
          {getLocalized(currentSlide, "subtitle") && (
            <p
              key={`subtitle-${currentIndex}`}
              className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-90 animate-fade-in-up"
              style={{
                color: currentSlide.textColor || "#ffffff",
                animationDelay: "0.2s",
              }}
            >
              {getLocalized(currentSlide, "subtitle")}
            </p>
          )}

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap gap-4 animate-fade-in-up ${
              textPosition === "center"
                ? "justify-center"
                : textPosition === "right"
                ? "justify-end"
                : "justify-start"
            }`}
            style={{ animationDelay: "0.4s" }}
          >
            {currentSlide.ctaUrl && getLocalized(currentSlide, "ctaText") && (
              <Link
                href={currentSlide.ctaUrl}
                className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                {getLocalized(currentSlide, "ctaText")}
              </Link>
            )}

            {currentSlide.cta2Url && getLocalized(currentSlide, "cta2Text") && (
              <Link
                href={currentSlide.cta2Url}
                className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all border border-white/40"
              >
                {getLocalized(currentSlide, "cta2Text")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {showControls && slides.length > 1 && (
        <>
          <button
            onClick={isRTL ? nextSlide : prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <button
            onClick={isRTL ? prevSlide : nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-amber-500 w-8"
                  : "bg-white/50 hover:bg-white/80 w-3"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {slides.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-30">
          <div
            key={currentIndex}
            className="h-full bg-amber-500 hero-progress-bar"
            style={{
              animation: `heroProgress ${autoPlayInterval}ms linear`,
            }}
          />
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 z-30 px-3 py-1 bg-black/30 rounded-full text-white text-sm">
        {currentIndex + 1} / {slides.length}
      </div>

      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes heroProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
