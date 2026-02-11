export const dynamic = 'force-dynamic';


import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// Dynamic Sitemap Generator
// ═══════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://letatche.ma";
const LOCALES = ["fr", "en", "es", "ar"] as const;

// Static pages with their change frequencies and priorities
const staticPages = [
  { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/atelier", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/services", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/services/menuiserie", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/services/ebennisterie", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/services/amenagements", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/services/restauration", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/boutique", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/realisations", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/devis", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/confidentialite", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/conditions", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/livraison", changeFrequency: "monthly" as const, priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // ═══════════════════════════════════════════════════════════
  // 1. Static Pages (for all locales)
  // ═══════════════════════════════════════════════════════════
  for (const page of staticPages) {
    for (const locale of LOCALES) {
      sitemapEntries.push({
        url: `${SITE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((loc) => [loc, `${SITE_URL}/${loc}${page.path}`])
          ),
        },
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 2. Dynamic Product Pages
  // ═══════════════════════════════════════════════════════════
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    for (const product of products) {
      for (const locale of LOCALES) {
        sitemapEntries.push({
          url: `${SITE_URL}/${locale}/boutique/${product.slug}`,
          lastModified: product.updatedAt,
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: {
            languages: Object.fromEntries(
              LOCALES.map((loc) => [
                loc,
                `${SITE_URL}/${loc}/boutique/${product.slug}`,
              ])
            ),
          },
        });
      }
    }
  } catch {
    // Database not available or products table doesn't exist yet
    console.warn("Could not fetch products for sitemap");
  }

  // ═══════════════════════════════════════════════════════════
  // 3. Dynamic Project Pages (Portfolio/Showcase - not implemented yet)
  // ═══════════════════════════════════════════════════════════
  // Note: Portfolio/Project model not yet implemented in schema

  // ═══════════════════════════════════════════════════════════
  // 4. Category Pages (if they exist)
  // ═══════════════════════════════════════════════════════════
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });

    for (const category of categories) {
      for (const locale of LOCALES) {
        sitemapEntries.push({
          url: `${SITE_URL}/${locale}/boutique?category=${category.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // Database not available or categories table doesn't exist yet
    console.warn("Could not fetch categories for sitemap");
  }

  return sitemapEntries;
}
