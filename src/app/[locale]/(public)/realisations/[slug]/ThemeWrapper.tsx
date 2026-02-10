"use client";

import Link from "next/link";
import { useThemeSettings } from "@/stores/themeSettings";
import { hexToRgba } from "@/lib/utils";

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const theme = useThemeSettings();
  const detail = theme.realisationsDetail;

  return (
    <div className="min-h-screen relative">
      {/* Fixed background layer - covers entire viewport */}
      {detail.type === "color" && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ backgroundColor: detail.color, zIndex: 0 }}
        />
      )}
      {detail.type === "image" && detail.image && (
        <>
          <div
            className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${detail.image})`, zIndex: 0 }}
          />
          {detail.overlayEnabled && (
            <div
              className="fixed inset-0 pointer-events-none"
              style={{
                backgroundColor: hexToRgba(detail.overlayColor, detail.overlayOpacity / 100),
                zIndex: 1,
              }}
            />
          )}
        </>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// ─── CTA Section (reads realisationsCta theme settings) ───

interface CtaSectionProps {
  locale: string;
  title: string;
  description: string;
  buttonText: string;
}

export function CtaSection({ locale, title, description, buttonText }: CtaSectionProps) {
  const theme = useThemeSettings();
  const cta = theme.realisationsCta;

  return (
    <section className="py-16 pb-20">
      <div className="container mx-auto px-4">
        {/* Outer wrapper: background color or image */}
        <div
          className="max-w-3xl mx-auto rounded-2xl shadow-xl overflow-hidden relative"
          style={cta.type === "color"
            ? { backgroundColor: cta.color }
            : cta.type === "image" && cta.image
              ? { backgroundImage: `url(${cta.image})`, backgroundSize: "cover", backgroundPosition: "center" }
              : {}
          }
        >
          {/* Overlay layer */}
          {cta.type === "image" && cta.overlayEnabled && (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: hexToRgba(cta.overlayColor, cta.overlayOpacity / 100) }}
            />
          )}

          {/* Content with optional card */}
          <div className="relative p-10 md:p-12 text-center">
            {cta.cardEnabled ? (
              <div
                className="rounded-xl px-8 py-10 mx-auto max-w-2xl"
                style={{
                  backgroundColor: hexToRgba(cta.cardColor, cta.cardOpacity / 100),
                  ...(cta.cardBlur ? { backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } : {}),
                }}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: cta.titleColor }}>
                  {title}
                </h3>
                <p className="mb-8 max-w-2xl mx-auto" style={{ color: cta.bodyColor }}>
                  {description}
                </p>
                <Link
                  href={`/${locale}/devis`}
                  className="inline-block px-8 py-4 font-bold rounded-xl transition-colors hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: cta.paginationActiveBg, color: cta.paginationActiveColor }}
                >
                  {buttonText}
                </Link>
              </div>
            ) : (
              <>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: cta.titleColor }}>
                  {title}
                </h3>
                <p className="mb-8 max-w-2xl mx-auto" style={{ color: cta.bodyColor }}>
                  {description}
                </p>
                <Link
                  href={`/${locale}/devis`}
                  className="inline-block px-8 py-4 font-bold rounded-xl transition-colors hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: cta.paginationActiveBg, color: cta.paginationActiveColor }}
                >
                  {buttonText}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
