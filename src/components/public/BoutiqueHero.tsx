"use client";

import { useThemeSettings } from "@/stores/themeSettings";
import { hexToRgba } from "@/lib/utils";

interface BoutiqueHeroProps {
  isRTL: boolean;
  translations: {
    badge: string;
    title: string;
    subtitle: string;
  };
}

export function BoutiqueHero({ isRTL, translations }: BoutiqueHeroProps) {
  const theme = useThemeSettings();
  const bg = theme.boutiqueHero;

  // Build background style
  const sectionStyle: React.CSSProperties = {};
  if (bg.type === "image" && bg.image) {
    sectionStyle.backgroundImage = `url(${bg.image})`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  } else {
    sectionStyle.backgroundColor = bg.color;
  }

  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
      style={sectionStyle}
    >
      {/* Overlay */}
      {bg.overlayEnabled && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: hexToRgba(bg.overlayColor, bg.overlayOpacity / 100) }}
        />
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

      <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
        {/* Card wrapper */}
        {bg.cardEnabled ? (
          <div
            className="inline-block px-8 py-8 rounded-2xl max-w-3xl mx-auto"
            style={{
              backgroundColor: hexToRgba(bg.cardColor, bg.cardOpacity / 100),
              ...(bg.cardBlur ? { backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } : {}),
            }}
          >
            <span
              className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6"
              style={{ color: bg.titleColor }}
            >
              {translations.badge}
            </span>
            <h1
              className={`font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${isRTL ? "text-right" : ""}`}
              style={{ color: bg.titleColor }}
            >
              {translations.title}
            </h1>
            <p
              className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${isRTL ? "text-right" : ""}`}
              style={{ color: bg.bodyColor }}
            >
              {translations.subtitle}
            </p>
          </div>
        ) : (
          <>
            <span
              className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6"
              style={{ color: bg.titleColor }}
            >
              {translations.badge}
            </span>
            <h1
              className={`font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${isRTL ? "text-right" : ""}`}
              style={{ color: bg.titleColor }}
            >
              {translations.title}
            </h1>
            <p
              className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${isRTL ? "text-right" : ""}`}
              style={{ color: bg.bodyColor }}
            >
              {translations.subtitle}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
