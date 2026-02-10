"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useDirection } from "@/hooks/useDirection";
import { cn, hexToRgba } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  textKey: string;
}

// ═══════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ahmed Benali",
    role: "Propriétaire de Riad",
    image: "/images/testimonials/client-1.jpg",
    rating: 5,
    textKey: "testimonial1",
  },
  {
    id: "2",
    name: "Sophie Martin",
    role: "Architecte d'intérieur",
    image: "/images/testimonials/client-2.jpg",
    rating: 5,
    textKey: "testimonial2",
  },
  {
    id: "3",
    name: "Hassan El Mansouri",
    role: "Directeur d'hôtel",
    image: "/images/testimonials/client-3.jpg",
    rating: 5,
    textKey: "testimonial3",
  },
  {
    id: "4",
    name: "Marie Dubois",
    role: "Décoratrice",
    image: "/images/testimonials/client-4.jpg",
    rating: 4,
    textKey: "testimonial4",
  },
];

// ═══════════════════════════════════════════════════════════
// TESTIMONIAL CARD COMPONENT
// ═══════════════════════════════════════════════════════════

function TestimonialCard({
  testimonial,
  isRTL,
  t,
}: {
  testimonial: Testimonial;
  isRTL: boolean;
  t: (key: string) => string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 md:p-8 shadow-wood",
        "flex flex-col h-full",
        isRTL && "text-right"
      )}
    >
      {/* Quote Icon */}
      <div className="mb-4">
        <Quote className="w-10 h-10 text-wood-primary/20" />
      </div>

      {/* Rating */}
      <div className={cn("flex gap-1 mb-4", isRTL && "justify-end")}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-5 h-5",
              i < testimonial.rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-wood-dark flex-grow mb-6 leading-relaxed">
        &ldquo;{t(`testimonials.${testimonial.textKey}`)}&rdquo;
      </p>

      {/* Author */}
      <div
        className={cn(
          "flex items-center gap-4 pt-4 border-t border-wood-light/50",
          isRTL && "flex-row-reverse"
        )}
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div>
          <h4 className="font-semibold text-wood-dark">{testimonial.name}</h4>
          <p className="text-sm text-wood-muted">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TESTIMONIALS SECTION COMPONENT
// ═══════════════════════════════════════════════════════════

export function TestimonialsSection() {
  const t = useTranslations("home.testimonials");
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { testimonialsBackground: bg } = useThemeSettings();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Items to show based on screen size (simplified for SSR)
  const itemsPerView = 3;
  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

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

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const isImageBg = bg.type === "image" && bg.image;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 overflow-hidden"
      style={
        isImageBg
          ? undefined
          : { background: `linear-gradient(135deg, ${bg.color || "#FDF6EC"}, ${bg.color || "#FDF6EC"}dd)` }
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
            bg.cardEnabled && "rounded-2xl p-6 md:p-8 shadow-lg max-w-3xl mx-auto",
            bg.cardEnabled && bg.cardBlur && "backdrop-blur-sm"
          )}
          style={bg.cardEnabled ? { backgroundColor: hexToRgba(bg.cardColor || "#FFFFFF", (bg.cardOpacity ?? 80) / 100) } : undefined}
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

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={isRTL ? nextSlide : prevSlide}
            disabled={isRTL ? currentIndex >= maxIndex : currentIndex <= 0}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10",
              "w-12 h-12 rounded-full bg-white shadow-lg",
              "flex items-center justify-center",
              "text-wood-dark hover:text-wood-primary hover:shadow-xl",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isRTL ? "-right-4 md:-right-6" : "-left-4 md:-left-6"
            )}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={isRTL ? prevSlide : nextSlide}
            disabled={isRTL ? currentIndex <= 0 : currentIndex >= maxIndex}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10",
              "w-12 h-12 rounded-full bg-white shadow-lg",
              "flex items-center justify-center",
              "text-wood-dark hover:text-wood-primary hover:shadow-xl",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isRTL ? "-left-4 md:-left-6" : "-right-4 md:-right-6"
            )}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Testimonials Grid */}
          <div className="overflow-hidden mx-8">
            <div
              className={cn(
                "flex transition-transform duration-500 ease-out gap-6",
                isVisible ? "opacity-100" : "opacity-0"
              )}
              style={{
                transform: `translateX(${isRTL ? currentIndex * (100 / itemsPerView + 2) : -currentIndex * (100 / itemsPerView + 2)}%)`,
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0"
                >
                  <TestimonialCard
                    testimonial={testimonial}
                    isRTL={isRTL}
                    t={t}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-wood-primary w-6"
                  : "bg-wood-light hover:bg-wood-muted"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

TestimonialsSection.displayName = "TestimonialsSection";

export default TestimonialsSection;
