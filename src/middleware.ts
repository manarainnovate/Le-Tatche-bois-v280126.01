import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/config";

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

  // Handle internationalized routes
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
