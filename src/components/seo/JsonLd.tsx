"use client";

import { generatePageSchema, renderJsonLd } from "@/lib/jsonld";

// ═══════════════════════════════════════════════════════════
// JSON-LD Component
// ═══════════════════════════════════════════════════════════

interface JsonLdProps {
  locale: string;
  pageType: "home" | "about" | "services" | "shop" | "product" | "project" | "contact" | "faq";
  product?: {
    id: string;
    name: string;
    description: string;
    slug: string;
    price: number;
    images: string[];
    inStock: boolean;
    rating?: number;
    reviewCount?: number;
  };
  breadcrumbs?: { name: string; url?: string }[];
  faqs?: { question: string; answer: string }[];
}

export function JsonLd({ locale, pageType, product, breadcrumbs, faqs }: JsonLdProps) {
  const schema = generatePageSchema({
    locale,
    pageType,
    product,
    breadcrumbs,
    faqs,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: renderJsonLd(schema) }}
    />
  );
}
