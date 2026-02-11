import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/config";
import {
  detectLocale,
  detectCurrency,
  parseBrowserLanguage,
  getCountryFromHeaders,
  isBot,
  getCookieValue,
  COOKIES,
  isValidLocale,
  isValidCurrency,
} from "@/lib/geo-detection";

// ═══════════════════════════════════════════════════════════
// Security Headers
// ═══════════════════════════════════════════════════════════

const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
};

// ═══════════════════════════════════════════════════════════
// Internationalization Middleware
// ═══════════════════════════════════════════════════════════

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

// ═══════════════════════════════════════════════════════════
// Geo-Detection Logic
// ═══════════════════════════════════════════════════════════

function handleGeoDetection(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const cookieHeader = request.headers.get("cookie") || "";

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Only handle root path or paths without locale
  if (pathnameHasLocale) {
    return null; // Let intlMiddleware handle it
  }

  // Skip geo-detection for admin routes, API routes, and auth routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel")
  ) {
    return null;
  }

  // Check if user is a bot/crawler (don't redirect bots for SEO)
  const userAgent = request.headers.get("user-agent") || "";
  if (isBot(userAgent)) {
    // Let bots see the default locale
    return null;
  }

  // PRIORITY 1: Check for user's manual preference (highest priority)
  const preferredLocale = getCookieValue(cookieHeader, COOKIES.PREFERRED_LOCALE);
  if (preferredLocale && isValidLocale(preferredLocale)) {
    // User has manually chosen a language — respect it
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // PRIORITY 2: Check for auto-detected locale from previous visit
  const autoDetectedLocale = getCookieValue(cookieHeader, COOKIES.AUTO_DETECTED_LOCALE);
  if (autoDetectedLocale && isValidLocale(autoDetectedLocale)) {
    // We already detected locale before, use it (avoids re-detection on every visit)
    const url = request.nextUrl.clone();
    url.pathname = `/${autoDetectedLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // PRIORITY 3: First-time visitor — Auto-detect based on IP + browser language
  // Get country from Cloudflare or Vercel headers
  const country = getCountryFromHeaders(request.headers);

  // Get browser language from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  const browserLang = parseBrowserLanguage(acceptLanguage);

  // Detect best locale
  const detectedLocale = detectLocale(country, browserLang);

  // Detect best currency
  const detectedCurrency = detectCurrency(country);

  // Redirect to detected locale
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname}`;

  const response = NextResponse.redirect(url);

  // Set cookies to remember auto-detection (1 year)
  const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds

  response.cookies.set(COOKIES.AUTO_DETECTED_LOCALE, detectedLocale, {
    maxAge,
    path: "/",
    sameSite: "lax",
  });

  response.cookies.set(COOKIES.AUTO_DETECTED_CURRENCY, detectedCurrency, {
    maxAge,
    path: "/",
    sameSite: "lax",
  });

  // Optional: Set a cookie with detected country for analytics/debugging
  response.cookies.set("detected-country", country, {
    maxAge,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

// ═══════════════════════════════════════════════════════════
// Combined Middleware
// ═══════════════════════════════════════════════════════════

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip security headers for static files and Next.js internals
  const isStaticFile = pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|css|js)$/);
  const isInternal = pathname.startsWith("/_next") || pathname.startsWith("/_vercel");

  if (isStaticFile || isInternal) {
    return NextResponse.next();
  }

  // Handle API routes with security headers only
  if (pathname.startsWith("/api")) {
    const response = NextResponse.next();

    // Add security headers
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }

    // Add CORS headers for API routes
    response.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL ?? "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
    response.headers.set("Access-Control-Max-Age", "86400");

    return response;
  }

  // Try geo-detection first (for root path and non-localized paths)
  const geoResponse = handleGeoDetection(request);
  if (geoResponse) {
    // Add security headers to geo-redirect response
    for (const [key, value] of Object.entries(securityHeaders)) {
      geoResponse.headers.set(key, value);
    }
    return geoResponse;
  }

  // Handle internationalized routes with next-intl
  const response = intlMiddleware(request);

  // Add security headers to all responses
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except:
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /images, /fonts, etc. (static files)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
