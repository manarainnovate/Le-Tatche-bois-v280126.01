import { MetadataRoute } from "next";

// ═══════════════════════════════════════════════════════════
// Dynamic Robots.txt Generator
// ═══════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://letatche.ma";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Admin pages
          "/admin",
          "/*/admin",
          "/*/admin/*",
          // Auth pages
          "/api/",
          "/*/connexion",
          "/*/inscription",
          // Cart and checkout (private user pages)
          "/*/panier",
          "/*/cart",
          "/*/checkout",
          // Order tracking (private)
          "/*/commande/",
          // Search queries with parameters
          "/*/boutique?*",
          "/*/realisations?*",
          // Private files
          "/*.json$",
          "/*.xml$",
        ],
      },
      {
        // Specific rules for Googlebot
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/*/admin",
          "/api/",
          "/*/panier",
          "/*/cart",
          "/*/checkout",
          "/*/commande/",
          "/*/connexion",
          "/*/inscription",
        ],
      },
      {
        // Specific rules for Google Image crawler
        userAgent: "Googlebot-Image",
        allow: [
          "/images/",
          "/public/",
        ],
        disallow: [
          "/admin",
          "/api/",
        ],
      },
      {
        // Block bad bots and scrapers
        userAgent: [
          "AhrefsBot",
          "MJ12bot",
          "DotBot",
          "SemrushBot",
          "BLEXBot",
          "DataForSeoBot",
          "MegaIndex",
          "Bytespider",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
