"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { X, Globe, DollarSign } from "lucide-react";
import { useCurrencyStore } from "@/stores/currency";
import { COOKIES } from "@/lib/geo-detection";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    detected: "🌍 Nous avons détecté que vous visitez depuis",
    showing: "Affichage en",
    with: "avec les prix en",
    notCorrect: "Pas correct ?",
    changeLanguage: "Changer la langue",
    changeCurrency: "Changer la devise",
  },
  en: {
    detected: "🌍 We detected you're visiting from",
    showing: "Showing in",
    with: "with prices in",
    notCorrect: "Not correct?",
    changeLanguage: "Change language",
    changeCurrency: "Change currency",
  },
  es: {
    detected: "🌍 Detectamos que estás visitando desde",
    showing: "Mostrando en",
    with: "con precios en",
    notCorrect: "¿No es correcto?",
    changeLanguage: "Cambiar idioma",
    changeCurrency: "Cambiar moneda",
  },
  ar: {
    detected: "🌍 اكتشفنا أنك تزور من",
    showing: "عرض في",
    with: "مع الأسعار بـ",
    notCorrect: "غير صحيح؟",
    changeLanguage: "تغيير اللغة",
    changeCurrency: "تغيير العملة",
  },
};

const languageNames = {
  fr: { fr: "Français", en: "French", es: "Francés", ar: "الفرنسية" },
  en: { fr: "Anglais", en: "English", es: "Inglés", ar: "الإنجليزية" },
  es: { fr: "Espagnol", en: "Spanish", es: "Español", ar: "الإسبانية" },
  ar: { fr: "Arabe", en: "Arabic", es: "Árabe", ar: "العربية" },
};

const currencyNames = {
  MAD: { fr: "Dirham", en: "Dirham", es: "Dirham", ar: "درهم" },
  EUR: { fr: "Euro", en: "Euro", es: "Euro", ar: "يورو" },
  USD: { fr: "Dollar", en: "Dollar", es: "Dólar", ar: "دولار" },
  GBP: { fr: "Livre", en: "Pound", es: "Libra", ar: "جنيه" },
};

const countryNames: Record<string, Record<string, string>> = {
  MA: { fr: "Maroc", en: "Morocco", es: "Marruecos", ar: "المغرب" },
  FR: { fr: "France", en: "France", es: "Francia", ar: "فرنسا" },
  US: { fr: "États-Unis", en: "United States", es: "Estados Unidos", ar: "الولايات المتحدة" },
  GB: { fr: "Royaume-Uni", en: "United Kingdom", es: "Reino Unido", ar: "المملكة المتحدة" },
  ES: { fr: "Espagne", en: "Spain", es: "España", ar: "إسبانيا" },
  DE: { fr: "Allemagne", en: "Germany", es: "Alemania", ar: "ألمانيا" },
  SA: { fr: "Arabie Saoudite", en: "Saudi Arabia", es: "Arabia Saudí", ar: "السعودية" },
  AE: { fr: "Émirats Arabes Unis", en: "UAE", es: "EAU", ar: "الإمارات" },
  // Add more as needed, or fallback to country code
};

// ═══════════════════════════════════════════════════════════
// GEO DETECTION BANNER COMPONENT
// ═══════════════════════════════════════════════════════════

export function GeoDetectionBanner() {
  const locale = useLocale();
  const { currency } = useCurrencyStore();
  const [isVisible, setIsVisible] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const isRTL = locale === "ar";

  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  useEffect(() => {
    // Check if banner was already dismissed
    const bannerDismissed = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${COOKIES.BANNER_DISMISSED}=`));

    if (bannerDismissed) {
      return; // Don't show banner if user dismissed it
    }

    // Get detected country from cookie
    const detectedCountryCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("detected-country="));

    if (detectedCountryCookie) {
      const countryCode = detectedCountryCookie.split("=")[1];
      setCountry(countryCode || null);
      setIsVisible(true);

      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);

      return () => clearTimeout(timer);
    }

    return undefined; // Explicit return for all code paths
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);

    // Set cookie to remember dismissal (1 year)
    const maxAge = 365 * 24 * 60 * 60;
    document.cookie = `${COOKIES.BANNER_DISMISSED}=true; path=/; max-age=${maxAge}; samesite=lax`;
  };

  if (!isVisible || !country) {
    return null;
  }

  const countryName =
    countryNames[country]?.[locale as keyof typeof translations] || country;
  const langName = languageNames[locale as keyof typeof languageNames]?.[
    locale as keyof typeof translations
  ];
  const currName = currencyNames[currency]?.[locale as keyof typeof translations];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700",
        "text-white shadow-2xl",
        "animate-in slide-in-from-bottom duration-500",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Message */}
          <div className="flex flex-1 flex-wrap items-center gap-2 text-sm md:text-base">
            <Globe className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">
              {t.detected} <strong>{countryName}</strong>.
            </span>
            <span>
              {t.showing} <strong>{langName}</strong> {t.with}{" "}
              <strong>{currName}</strong>.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <span className="hidden text-sm opacity-90 sm:inline">
              {t.notCorrect}
            </span>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className={cn(
                "rounded-lg p-2 transition-colors",
                "hover:bg-white/20 active:bg-white/30",
                "focus:outline-none focus:ring-2 focus:ring-white/50"
              )}
              aria-label="Close banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Optional: Links to change language/currency */}
        <div className="mt-2 flex flex-wrap gap-3 text-xs md:text-sm">
          <a
            href="#language-switcher"
            className="flex items-center gap-1 underline opacity-90 hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              // Trigger language switcher (you can implement this based on your UI)
              document.querySelector("[data-language-switcher]")?.dispatchEvent(
                new Event("click")
              );
            }}
          >
            <Globe className="h-3.5 w-3.5" />
            {t.changeLanguage}
          </a>
          <a
            href="#currency-switcher"
            className="flex items-center gap-1 underline opacity-90 hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              // Trigger currency switcher
              document.querySelector("[data-currency-switcher]")?.dispatchEvent(
                new Event("click")
              );
            }}
          >
            <DollarSign className="h-3.5 w-3.5" />
            {t.changeCurrency}
          </a>
        </div>
      </div>
    </div>
  );
}
