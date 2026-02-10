// ═══════════════════════════════════════════════════════════
// LOCALIZATION HELPER LIBRARY
// Utilities for multilingual content handling
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type SupportedLocale = "fr" | "en" | "es" | "ar";

export interface MultilingualText {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
}

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

export const SUPPORTED_LOCALES: SupportedLocale[] = ["fr", "en", "es", "ar"];
export const DEFAULT_LOCALE: SupportedLocale = "fr";

export const LOCALE_CONFIGS: Record<SupportedLocale, LocaleConfig> = {
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    dir: "ltr",
    dateFormat: "DD/MM/YYYY",
    numberFormat: {
      decimal: ",",
      thousands: " ",
      currency: "€",
    },
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    dir: "ltr",
    dateFormat: "MM/DD/YYYY",
    numberFormat: {
      decimal: ".",
      thousands: ",",
      currency: "$",
    },
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    dir: "ltr",
    dateFormat: "DD/MM/YYYY",
    numberFormat: {
      decimal: ",",
      thousands: ".",
      currency: "€",
    },
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    dir: "rtl",
    dateFormat: "YYYY/MM/DD",
    numberFormat: {
      decimal: "٫",
      thousands: "٬",
      currency: "د.م.",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Validation Functions
// ═══════════════════════════════════════════════════════════

export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function getValidLocale(locale: string | undefined): SupportedLocale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

// ═══════════════════════════════════════════════════════════
// Content Extraction Functions
// ═══════════════════════════════════════════════════════════

/**
 * Get localized text from a multilingual object
 * Falls back to French if the requested locale is not available
 */
export function getLocalizedText(
  content: MultilingualText | string | null | undefined,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  if (!content) return "";

  // If it's already a string, return it
  if (typeof content === "string") return content;

  // Try requested locale first
  if (content[locale] && content[locale].trim()) {
    return content[locale];
  }

  // Fallback to French
  if (content.fr && content.fr.trim()) {
    return content.fr;
  }

  // Fallback to any available content
  for (const loc of SUPPORTED_LOCALES) {
    if (content[loc] && content[loc].trim()) {
      return content[loc];
    }
  }

  return "";
}

/**
 * Get all translations from a multilingual object
 */
export function getAllTranslations(
  content: MultilingualText | null | undefined
): MultilingualText {
  return {
    fr: content?.fr || "",
    en: content?.en || "",
    es: content?.es || "",
    ar: content?.ar || "",
  };
}

/**
 * Create an empty multilingual text object
 */
export function createEmptyMultilingual(): MultilingualText {
  return {
    fr: "",
    en: "",
    es: "",
    ar: "",
  };
}

/**
 * Check if any translation exists
 */
export function hasAnyTranslation(
  content: MultilingualText | null | undefined
): boolean {
  if (!content) return false;
  return SUPPORTED_LOCALES.some(
    (locale) => content[locale] && content[locale].trim()
  );
}

/**
 * Check if all translations exist
 */
export function hasAllTranslations(
  content: MultilingualText | null | undefined
): boolean {
  if (!content) return false;
  return SUPPORTED_LOCALES.every(
    (locale) => content[locale] && content[locale].trim()
  );
}

/**
 * Get missing translations
 */
export function getMissingTranslations(
  content: MultilingualText | null | undefined
): SupportedLocale[] {
  if (!content) return [...SUPPORTED_LOCALES];
  return SUPPORTED_LOCALES.filter(
    (locale) => !content[locale] || !content[locale].trim()
  );
}

// ═══════════════════════════════════════════════════════════
// Direction & RTL Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Get text direction for a locale
 */
export function getDirection(locale: SupportedLocale): "ltr" | "rtl" {
  return LOCALE_CONFIGS[locale]?.dir || "ltr";
}

/**
 * Check if locale is RTL
 */
export function isRTL(locale: SupportedLocale): boolean {
  return getDirection(locale) === "rtl";
}

/**
 * Get HTML dir attribute value
 */
export function getDirAttribute(locale: SupportedLocale): string {
  return getDirection(locale);
}

// ═══════════════════════════════════════════════════════════
// URL Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Add locale prefix to a path
 */
export function localizedPath(
  path: string,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Check if path already has a locale prefix
  const firstSegment = cleanPath.split("/")[0];
  if (isValidLocale(firstSegment)) {
    // Replace existing locale
    return `/${locale}/${cleanPath.slice(firstSegment.length + 1)}`;
  }

  return `/${locale}/${cleanPath}`;
}

/**
 * Remove locale prefix from a path
 */
export function unlocalizedPath(path: string): string {
  const segments = path.split("/").filter(Boolean);

  if (segments.length > 0 && isValidLocale(segments[0])) {
    return "/" + segments.slice(1).join("/");
  }

  return path;
}

/**
 * Extract locale from a path
 */
export function extractLocaleFromPath(path: string): SupportedLocale {
  const segments = path.split("/").filter(Boolean);

  if (segments.length > 0 && isValidLocale(segments[0])) {
    return segments[0];
  }

  return DEFAULT_LOCALE;
}

// ═══════════════════════════════════════════════════════════
// Date & Number Formatting
// ═══════════════════════════════════════════════════════════

/**
 * Format a date according to locale
 */
export function formatDate(
  date: Date | string,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return d.toLocaleDateString(locale, options);
}

/**
 * Format a number according to locale
 */
export function formatNumber(
  number: number,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  return number.toLocaleString(locale);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  amount: number,
  locale: SupportedLocale = DEFAULT_LOCALE,
  currency: string = "MAD"
): string {
  return amount.toLocaleString(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ═══════════════════════════════════════════════════════════
// JSON Parsing Helpers (for database fields)
// ═══════════════════════════════════════════════════════════

/**
 * Parse a JSON field that might contain multilingual content
 */
export function parseMultilingualField(
  field: string | object | null | undefined
): MultilingualText {
  if (!field) {
    return createEmptyMultilingual();
  }

  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return getAllTranslations(parsed);
    } catch {
      // If not valid JSON, treat as French content
      return {
        fr: field,
        en: "",
        es: "",
        ar: "",
      };
    }
  }

  return getAllTranslations(field as MultilingualText);
}

/**
 * Stringify a multilingual object for database storage
 */
export function stringifyMultilingualField(
  content: MultilingualText
): string {
  return JSON.stringify(content);
}

// ═══════════════════════════════════════════════════════════
// React Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Get locale config for display
 */
export function getLocaleConfig(locale: SupportedLocale): LocaleConfig {
  return LOCALE_CONFIGS[locale] || LOCALE_CONFIGS[DEFAULT_LOCALE];
}

/**
 * Get all locale configs as array
 */
export function getAllLocaleConfigs(): LocaleConfig[] {
  return SUPPORTED_LOCALES.map((locale) => LOCALE_CONFIGS[locale]);
}
