"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useDirection } from "@/hooks/useDirection";
import { cn, hexToRgba } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// FEATURES DATA
// ═══════════════════════════════════════════════════════════

const features = [
  "feature1",
  "feature2",
  "feature3",
  "feature4",
];

// ═══════════════════════════════════════════════════════════
// ABOUT SECTION COMPONENT
// ═══════════════════════════════════════════════════════════

export function AboutSection() {
  const t = useTranslations("home.about");
  const locale = useLocale();
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { aboutBackground: bg, aboutImage } = useThemeSettings();
  const sectionRef = useRef<HTMLDivElement>(null);
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
  const resolvedImage = aboutImage || "/uploads/projects/plafonds-murs/04-projet-plafond-decoratif-bois-sculpte/avant-IMG_20200226_160352.jpg";

  return (
    <section
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

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4">
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center",
            isRTL && "lg:grid-flow-dense"
          )}
        >
          {/* Image Side */}
          <div
            className={cn(
              "relative",
              isRTL && "lg:col-start-2",
              "transform transition-all duration-700",
              isVisible
                ? "translate-x-0 opacity-100"
                : isRTL
                ? "translate-x-20 opacity-0"
                : "-translate-x-20 opacity-0"
            )}
          >
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-wood-lg">
              <Image
                src={resolvedImage}
                alt={t("imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Experience Badge */}
            <div
              className={cn(
                "absolute -bottom-6 bg-white rounded-2xl shadow-wood p-6",
                "transform transition-all duration-700 delay-300",
                isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0",
                isRTL ? "-left-6 md:-left-12" : "-right-6 md:-right-12"
              )}
            >
              <div className="text-center">
                <span className="block text-4xl md:text-5xl font-bold text-wood-primary font-heading">
                  1995
                </span>
                <span className="block text-wood-muted text-sm mt-1">
                  {t("since")}
                </span>
              </div>
            </div>

            {/* Decorative Element */}
            <div
              className={cn(
                "absolute -top-6 w-24 h-24 bg-wood-primary/10 rounded-full -z-10",
                isRTL ? "-right-6" : "-left-6"
              )}
            />
          </div>

          {/* Content Side */}
          <div
            className={cn(
              isRTL && "lg:col-start-1 text-right",
              "transform transition-all duration-700 delay-200",
              isVisible
                ? "translate-x-0 opacity-100"
                : isRTL
                ? "-translate-x-20 opacity-0"
                : "translate-x-20 opacity-0"
            )}
          >
            <div
              className={cn(
                bg.cardEnabled && "rounded-2xl p-6 md:p-8 shadow-lg",
                bg.cardEnabled && bg.cardBlur && "backdrop-blur-sm"
              )}
              style={
                bg.cardEnabled
                  ? { backgroundColor: hexToRgba(bg.cardColor || "#FFFFFF", (bg.cardOpacity ?? 85) / 100) }
                  : undefined
              }
            >
              {/* Badge */}
              <span className="inline-block px-4 py-1 bg-wood-light/50 rounded-full text-sm font-medium mb-4" style={{ color: bg.titleColor }}>
                {t("badge")}
              </span>

              {/* Title */}
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6" style={{ color: bg.titleColor }}>
                {t("title")}
              </h2>

              {/* Description */}
              <p className="text-lg mb-6 leading-relaxed" style={{ color: bg.bodyColor }}>
                {t("description1")}
              </p>
              <p className="mb-8 leading-relaxed" style={{ color: bg.bodyColor }}>
                {t("description2")}
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li
                    key={feature}
                    className={cn(
                      "flex items-center gap-3",
                      isRTL && "flex-row-reverse",
                      "transform transition-all duration-500",
                      isVisible
                        ? "translate-x-0 opacity-100"
                        : "translate-x-10 opacity-0"
                    )}
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-wood-primary flex-shrink-0" />
                    <span style={{ color: bg.bodyColor }}>{t(`features.${feature}`)}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/${locale}/atelier`}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3",
                  "bg-wood-primary text-white rounded-lg",
                  "hover:bg-wood-secondary transition-colors",
                  "font-medium",
                  isRTL && "flex-row-reverse"
                )}
              >
                {t("cta")}
                {isRTL ? (
                  <ArrowLeft className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

AboutSection.displayName = "AboutSection";

export default AboutSection;
