"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useDirection } from "@/hooks/useDirection";
import { useThemeSettings } from "@/stores/themeSettings";
import { cn, hexToRgba } from "@/lib/utils";
import { Calendar, Briefcase, Users, Ruler } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Stat {
  id: string;
  icon: typeof Calendar;
  value: number;
  suffix: string;
  labelKey: string;
}

// ═══════════════════════════════════════════════════════════
// STATS DATA
// ═══════════════════════════════════════════════════════════

const stats: Stat[] = [
  {
    id: "years",
    icon: Calendar,
    value: 25,
    suffix: "+",
    labelKey: "years",
  },
  {
    id: "projects",
    icon: Briefcase,
    value: 500,
    suffix: "+",
    labelKey: "projects",
  },
  {
    id: "clients",
    icon: Users,
    value: 1000,
    suffix: "+",
    labelKey: "clients",
  },
  {
    id: "area",
    icon: Ruler,
    value: 5000,
    suffix: "+ m²",
    labelKey: "area",
  },
];

// ═══════════════════════════════════════════════════════════
// ANIMATED COUNTER HOOK
// ═══════════════════════════════════════════════════════════

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

// ═══════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════

function StatCard({
  stat,
  isVisible,
  t,
  titleColor,
  bodyColor,
}: {
  stat: Stat;
  isVisible: boolean;
  t: (key: string) => string;
  titleColor: string;
  bodyColor: string;
}) {
  const count = useCountUp(stat.value, 2000, isVisible);
  const Icon = stat.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center p-6 md:p-8",
        "bg-white/10 backdrop-blur-sm rounded-2xl",
        "transform transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
    >
      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" style={{ color: titleColor }} />
      </div>
      <div className="text-4xl md:text-5xl font-bold mb-2 ltr-force" style={{ color: titleColor }}>
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="text-lg" style={{ color: bodyColor }}>{t(stat.labelKey)}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STATS SECTION COMPONENT
// ═══════════════════════════════════════════════════════════

export function StatsSection() {
  const t = useTranslations("stats");
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { statsBackground: bg } = useThemeSettings();
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

  return (
    <section
      className="relative py-16 md:py-24"
      style={
        isImageBg
          ? undefined
          : { background: `linear-gradient(135deg, ${bg.color || "#8B4513"}, ${bg.color || "#8B4513"}dd)` }
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
                backgroundColor: bg.overlayColor || "#000000",
                opacity: (bg.overlayOpacity ?? 65) / 100,
              }}
            />
          )}
        </>
      )}

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div
          className={cn(
            "text-center mb-12",
            isRTL && "text-right",
            bg.cardEnabled && "rounded-2xl p-6 md:p-8 shadow-lg max-w-3xl mx-auto",
            bg.cardEnabled && bg.cardBlur && "backdrop-blur-sm"
          )}
          style={bg.cardEnabled ? { backgroundColor: hexToRgba(bg.cardColor || "#FFFFFF", (bg.cardOpacity ?? 80) / 100) } : undefined}
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4" style={{ color: bg.titleColor }}>
            {t("title")}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: bg.bodyColor }}>
            {t("subtitle")}
          </p>
        </div>

        {/* Stats Grid */}
        <div
          className={cn(
            "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6",
            isRTL && "direction-rtl"
          )}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <StatCard
                stat={stat}
                isVisible={isVisible}
                t={t}
                titleColor={bg.titleColor}
                bodyColor={bg.bodyColor}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

StatsSection.displayName = "StatsSection";

export default StatsSection;
