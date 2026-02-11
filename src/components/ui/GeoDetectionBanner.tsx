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
  // Banner disabled - geo-detection logic still runs in CurrencyInitializer
  // but the visible notification banner is hidden
  return null;
}
