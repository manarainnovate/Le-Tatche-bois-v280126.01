import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// ═══════════════════════════════════════════════════════════
// Content Security Policy
// ═══════════════════════════════════════════════════════════

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://res.cloudinary.com https://images.unsplash.com https://*.stripe.com http://localhost:3000;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com https://www.google-analytics.com https://cloudflareinsights.com;
  frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com https://maps.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`.replace(/\n/g, "").replace(/\s{2,}/g, " ").trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Remote image domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache for optimized images
  },
  // Compression
  compress: true,
  // Strict mode for better development experience
  reactStrictMode: true,
  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security

  // ESLint configuration - ignore warnings during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Experimental features for PDFKit support
  experimental: {
    // Include PDFKit font data in server bundle
    outputFileTracingIncludes: {
      '/api/crm/documents/[id]/pdf': [
        './node_modules/pdfkit/js/data/**/*',
      ],
    },
  },

  // Webpack configuration for PDFKit
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle .afm font files used by PDFKit
      config.module.rules.push({
        test: /\.afm$/,
        type: 'asset/source',
      });
    }

    return config;
  },

  // ═══════════════════════════════════════════════════════════
  // Security Headers
  // ═══════════════════════════════════════════════════════════
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
