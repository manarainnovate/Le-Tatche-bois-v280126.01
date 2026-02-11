// ═══════════════════════════════════════════════════════════
// GEO-DETECTION: Auto-detect language and currency from IP + browser
// ═══════════════════════════════════════════════════════════

export type SupportedLocale = "fr" | "en" | "es" | "ar";
export type SupportedCurrency = "MAD" | "EUR" | "USD" | "GBP";

// ═══════════════════════════════════════════════════════════
// COUNTRY TO LANGUAGE MAPPING
// ═══════════════════════════════════════════════════════════

const FRENCH_COUNTRIES = new Set([
  "FR", "BE", "CH", "TN", "DZ", "SN", "CI", "CM", "CD", "MG",
  "ML", "NE", "BF", "BJ", "TG", "GA", "CG", "CF", "TD", "GN",
  "RW", "BI", "DJ", "KM", "SC", "MU", "VU", "NC", "PF", "WF",
  "MC", "LU", "HT", "GF", "GP", "MQ", "RE", "YT", "PM", "BL",
  "MF", "WF", "PF", "NC", "TF",
]);

const ARABIC_COUNTRIES = new Set([
  "SA", "AE", "QA", "KW", "BH", "OM", "JO", "LB", "IQ", "LY",
  "EG", "SD", "YE", "PS", "SY", "MA", "DZ", "TN", "MR", "SO",
  "KM", "DJ",
]);

const SPANISH_COUNTRIES = new Set([
  "ES", "MX", "CO", "AR", "CL", "PE", "VE", "EC", "GT", "CU",
  "BO", "DO", "HN", "PY", "SV", "NI", "CR", "PA", "UY", "PR",
  "GQ", "BZ",
]);

// ═══════════════════════════════════════════════════════════
// COUNTRY TO CURRENCY MAPPING
// ═══════════════════════════════════════════════════════════

const EUROZONE_COUNTRIES = new Set([
  "FR", "DE", "IT", "ES", "PT", "BE", "NL", "LU", "IE", "GR",
  "AT", "FI", "SK", "SI", "EE", "LV", "LT", "CY", "MT",
  // French-speaking African countries use EUR as reference
  "TN", "DZ", "SN", "CI", "CM", "CD", "MG", "ML", "NE", "BF",
  "BJ", "TG", "GA", "CG", "CF", "TD", "GN",
]);

const GBP_COUNTRIES = new Set(["GB"]);

// Morocco uses MAD
const MAD_COUNTRIES = new Set(["MA"]);

// All others default to USD
// Including: US, CA, AU, SA, AE, QA, KW, BH, OM, MX, BR, JP, CN, IN, etc.

// ═══════════════════════════════════════════════════════════
// PARSE BROWSER LANGUAGE
// ═══════════════════════════════════════════════════════════

/**
 * Parse Accept-Language header to extract primary language preference
 * Example: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7" → "fr"
 */
export function parseBrowserLanguage(acceptLanguage: string): string {
  if (!acceptLanguage) return "";

  // Split by comma to get all language preferences
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      // Extract language code before quality value (q=)
      const [code] = lang.split(";");
      return code?.trim().toLowerCase() || "";
    })
    .filter(Boolean);

  // Find first supported language
  for (const lang of languages) {
    const primaryLang = lang.split("-")[0]; // Extract "fr" from "fr-FR"
    if (["fr", "en", "es", "ar"].includes(primaryLang || "")) {
      return primaryLang || "";
    }
  }

  return "";
}

// ═══════════════════════════════════════════════════════════
// DETECT LOCALE FROM COUNTRY + BROWSER LANGUAGE
// ═══════════════════════════════════════════════════════════

/**
 * Detect best locale based on country code and browser language
 * Priority: Browser language (if clear) → Country mapping → Default (fr)
 */
export function detectLocale(
  countryCode: string,
  browserLang: string
): SupportedLocale {
  const country = countryCode.toUpperCase();
  const browser = browserLang.toLowerCase();

  // PRIORITY 1: If browser language is clearly set and supported, use it
  // This handles cases like:
  // - User from Germany but browser set to Arabic → use Arabic
  // - User from USA but browser set to Spanish → use Spanish
  if (browser === "ar" && !["MA", "TN", "DZ"].includes(country)) {
    // Arabic browser preference from non-Maghreb country → use Arabic
    return "ar";
  }
  if (browser === "es" && !SPANISH_COUNTRIES.has(country)) {
    // Spanish browser preference from non-Spanish country → use Spanish
    return "es";
  }
  if (browser === "fr" && !FRENCH_COUNTRIES.has(country)) {
    // French browser preference from non-French country → use French
    return "fr";
  }

  // PRIORITY 2: Map country to primary language

  // Morocco: Special case - Arabic or French based on browser
  if (country === "MA") {
    if (browser === "ar") return "ar";
    if (browser === "fr") return "fr";
    // Default for Morocco: French (as it's a French-speaking country officially)
    return "fr";
  }

  // Other Arabic countries (excluding Morocco which is handled above)
  if (ARABIC_COUNTRIES.has(country) && country !== "MA") {
    return "ar";
  }

  // French-speaking countries
  if (FRENCH_COUNTRIES.has(country)) {
    return "fr";
  }

  // Spanish-speaking countries
  if (SPANISH_COUNTRIES.has(country)) {
    return "es";
  }

  // Special cases
  if (country === "CA") {
    // Canada: Use browser preference (en or fr)
    if (browser === "fr") return "fr";
    return "en";
  }

  if (country === "CH") {
    // Switzerland: Use browser preference (fr, de, it)
    // We only have fr and en, so:
    if (browser === "fr") return "fr";
    // de or it → fallback to English
    return "en";
  }

  if (country === "BE") {
    // Belgium: Use browser preference (fr or nl)
    if (browser === "fr") return "fr";
    // nl → fallback to English
    return "en";
  }

  // PRIORITY 3: Default to French (site's primary language)
  return "fr";
}

// ═══════════════════════════════════════════════════════════
// DETECT CURRENCY FROM COUNTRY
// ═══════════════════════════════════════════════════════════

/**
 * Detect currency based on country code
 */
export function detectCurrency(countryCode: string): SupportedCurrency {
  const country = countryCode.toUpperCase();

  // Morocco → MAD
  if (MAD_COUNTRIES.has(country)) {
    return "MAD";
  }

  // Eurozone → EUR
  if (EUROZONE_COUNTRIES.has(country)) {
    return "EUR";
  }

  // UK → GBP
  if (GBP_COUNTRIES.has(country)) {
    return "GBP";
  }

  // Default: USD (includes US, CA, AU, Gulf countries, LATAM, Asia, etc.)
  return "USD";
}

// ═══════════════════════════════════════════════════════════
// CHECK IF REQUEST IS FROM BOT/CRAWLER
// ═══════════════════════════════════════════════════════════

/**
 * Check if User-Agent is a bot/crawler
 * Bots should not be redirected for SEO purposes
 */
export function isBot(userAgent: string): boolean {
  const botPatterns = [
    "googlebot",
    "bingbot",
    "slurp", // Yahoo
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "sogou",
    "exabot",
    "facebot", // Facebook
    "ia_archiver", // Alexa
    "bot",
    "crawler",
    "spider",
    "scraper",
    "headless", // Headless browsers
    "phantom", // PhantomJS
    "prerender", // Prerender.io
  ];

  const ua = userAgent.toLowerCase();
  return botPatterns.some((pattern) => ua.includes(pattern));
}

// ═══════════════════════════════════════════════════════════
// GET COUNTRY FROM CLOUDFLARE OR IP
// ═══════════════════════════════════════════════════════════

/**
 * Extract country code from Cloudflare headers or fallback
 * Returns ISO 3166-1 alpha-2 country code (e.g., "US", "FR", "MA")
 */
export function getCountryFromHeaders(headers: Headers): string {
  // Try Cloudflare header first (most reliable if behind Cloudflare)
  const cfCountry = headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX") {
    return cfCountry;
  }

  // Fallback: Try to get from X-Vercel-IP-Country (if on Vercel)
  const vercelCountry = headers.get("x-vercel-ip-country");
  if (vercelCountry) {
    return vercelCountry;
  }

  // Default to US if we can't determine
  return "US";
}

// ═══════════════════════════════════════════════════════════
// COOKIE HELPERS
// ═══════════════════════════════════════════════════════════

export const COOKIES = {
  PREFERRED_LOCALE: "preferred-locale", // User's manual choice (highest priority)
  AUTO_DETECTED_LOCALE: "auto-detected-locale", // Auto-detected on first visit
  AUTO_DETECTED_CURRENCY: "auto-detected-currency", // Auto-detected on first visit
  BANNER_DISMISSED: "geo-banner-dismissed", // User dismissed the geo banner
} as const;

/**
 * Get cookie value from cookie string
 */
export function getCookieValue(cookies: string, name: string): string | null {
  const match = cookies.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2] ?? "") : null;
}

// ═══════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════

export function isValidLocale(locale: string): locale is SupportedLocale {
  return ["fr", "en", "es", "ar"].includes(locale);
}

export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return ["MAD", "EUR", "USD", "GBP"].includes(currency);
}
