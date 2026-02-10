"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useDirection } from "@/hooks/useDirection";
import { cn, hexToRgba } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import { FileText, Phone } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// CTA SECTION COMPONENT
// ═══════════════════════════════════════════════════════════

export function CTASection() {
  const t = useTranslations("home.cta");
  const locale = useLocale();
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { ctaBackground: bg } = useThemeSettings();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isImageBg = bg.type === "image" && bg.image;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden"
      style={
        isImageBg
          ? undefined
          : { background: `linear-gradient(135deg, ${bg.color || "#5D3A1A"}, ${bg.color || "#5D3A1A"}dd)` }
      }
    >
      {/* Dynamic Background */}
      {isImageBg && (
        <div className="absolute inset-0">
          <Image
            src={bg.image}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          {/* Overlay */}
          {bg.overlayEnabled !== false && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: bg.overlayColor || "#3B1E0A",
                opacity: (bg.overlayOpacity ?? 85) / 100,
              }}
            />
          )}
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating shapes */}
        <div
          className={cn(
            "absolute w-64 h-64 rounded-full",
            "bg-wood-primary/20 blur-3xl",
            "-top-32 -right-32"
          )}
        />
        <div
          className={cn(
            "absolute w-48 h-48 rounded-full",
            "bg-wood-secondary/20 blur-3xl",
            "-bottom-24 -left-24"
          )}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div
          className={cn(
            "max-w-3xl",
            isRTL ? "mr-auto ml-0 text-right" : "ml-auto mr-0 text-left",
            "md:text-center md:mx-auto",
            bg.cardEnabled && "rounded-2xl p-6 md:p-8 shadow-lg",
            bg.cardEnabled && bg.cardBlur && "backdrop-blur-sm"
          )}
          style={bg.cardEnabled ? { backgroundColor: hexToRgba(bg.cardColor || "#FFFFFF", (bg.cardOpacity ?? 80) / 100) } : undefined}
        >
          {/* Badge */}
          <span
            className={cn(
              "inline-block px-4 py-1 mb-6",
              "bg-white/10 backdrop-blur-sm rounded-full",
              "text-white/90 text-sm font-medium",
              "transform transition-all duration-700",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            {t("badge")}
          </span>

          {/* Title */}
          <h2
            className={cn(
              "font-heading text-3xl md:text-4xl lg:text-5xl",
              "font-bold mb-6 leading-tight",
              "transform transition-all duration-700 delay-100",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
            style={{ color: bg.titleColor }}
          >
            {t("title")}
          </h2>

          {/* Description */}
          <p
            className={cn(
              "text-lg md:text-xl mb-10",
              "max-w-2xl md:mx-auto",
              "transform transition-all duration-700 delay-200",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
            style={{ color: bg.bodyColor }}
          >
            {t("description")}
          </p>

          {/* CTAs */}
          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center",
              "transform transition-all duration-700 delay-300",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
              isRTL && "sm:flex-row-reverse"
            )}
          >
            {/* Primary CTA - Quote */}
            <Link
              href={`/${locale}/devis`}
              className={cn(
                "inline-flex items-center justify-center gap-3",
                "px-8 py-4 text-lg font-medium rounded-xl",
                "bg-gradient-to-r from-wood-primary to-wood-secondary",
                "text-white shadow-lg",
                "hover:brightness-110 transition-all duration-200",
                "transform hover:scale-105",
                isRTL && "flex-row-reverse"
              )}
            >
              <FileText className="w-5 h-5" />
              {t("ctaQuote")}
            </Link>

            {/* Secondary CTA - Contact */}
            <Link
              href={`/${locale}/contact`}
              className={cn(
                "inline-flex items-center justify-center gap-3",
                "px-8 py-4 text-lg font-medium rounded-xl",
                "bg-white/10 backdrop-blur-sm border-2 border-white/30",
                "text-white",
                "hover:bg-white/20 transition-all duration-200",
                "transform hover:scale-105",
                isRTL && "flex-row-reverse"
              )}
            >
              <Phone className="w-5 h-5" />
              {t("ctaContact")}
            </Link>
          </div>

          {/* Trust badges */}
          <div
            className={cn(
              "mt-12 flex flex-wrap justify-center gap-8",
              "transform transition-all duration-700 delay-400",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            <div className="text-center">
              <span className="block text-3xl font-bold text-white">25+</span>
              <span className="text-white/60 text-sm">{t("trustYears")}</span>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <span className="block text-3xl font-bold text-white">500+</span>
              <span className="text-white/60 text-sm">{t("trustProjects")}</span>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <span className="block text-3xl font-bold text-white">100%</span>
              <span className="text-white/60 text-sm">{t("trustSatisfaction")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

CTASection.displayName = "CTASection";

export default CTASection;
