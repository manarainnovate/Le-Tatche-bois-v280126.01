// ═══════════════════════════════════════════════════════════
// JSON-LD Structured Data for SEO
// ═══════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://letatche.ma";
const SITE_NAME = "LE TATCHE BOIS";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Organization {
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    "@type": "ContactPoint";
    telephone: string;
    contactType: string;
    areaServed: string;
    availableLanguage: string[];
  };
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
}

export interface WebSite {
  "@type": "WebSite";
  "@id": string;
  url: string;
  name: string;
  description: string;
  publisher: { "@id": string };
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
  inLanguage: string[];
}

export interface LocalBusiness {
  "@type": "LocalBusiness";
  "@id": string;
  name: string;
  image: string;
  telephone: string;
  email: string;
  url: string;
  priceRange: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }[];
  sameAs: string[];
}

export interface Product {
  "@type": "Product";
  "@id": string;
  name: string;
  description: string;
  image: string[];
  brand: { "@type": "Brand"; name: string };
  sku: string;
  offers: {
    "@type": "Offer";
    url: string;
    priceCurrency: string;
    price: number;
    availability: string;
    seller: { "@id": string };
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

export interface BreadcrumbList {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }[];
}

export interface FAQPage {
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }[];
}

// ═══════════════════════════════════════════════════════════
// Schema Generators
// ═══════════════════════════════════════════════════════════

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): Organization {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    sameAs: [
      "https://www.facebook.com/letatchebois",
      "https://www.instagram.com/letatchebois",
      "https://www.youtube.com/@letatchebois",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+212-5XX-XXXXXX",
      contactType: "customer service",
      areaServed: "MA",
      availableLanguage: ["French", "Arabic", "English", "Spanish"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Zone Industrielle",
      addressLocality: "Casablanca",
      postalCode: "20000",
      addressCountry: "MA",
    },
  };
}

/**
 * Generate WebSite schema
 */
export function generateWebSiteSchema(locale: string): WebSite {
  const descriptions = {
    fr: "Atelier de menuiserie artisanale au Maroc. Fabrication sur mesure de meubles, portes, escaliers et fenêtres en bois.",
    en: "Artisan woodworking workshop in Morocco. Custom-made furniture, doors, stairs and windows.",
    es: "Taller de carpintería artesanal en Marruecos. Fabricación a medida de muebles, puertas, escaleras y ventanas de madera.",
    ar: "ورشة نجارة حرفية في المغرب. تصنيع حسب الطلب للأثاث والأبواب والسلالم والنوافذ الخشبية.",
  } as const;

  const desc = descriptions[locale as keyof typeof descriptions] ?? descriptions.fr;

  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: desc,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/boutique?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["fr-MA", "en-US", "es-ES", "ar-MA"],
  };
}

/**
 * Generate LocalBusiness schema for the workshop
 */
export function generateLocalBusinessSchema(): LocalBusiness {
  return {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    image: `${SITE_URL}/images/workshop/workshop-1.jpg`,
    telephone: "+212-5XX-XXXXXX",
    email: "contact@letatche.ma",
    url: SITE_URL,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Zone Industrielle",
      addressLocality: "Casablanca",
      postalCode: "20000",
      addressCountry: "MA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.5731,
      longitude: -7.5898,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "13:00",
      },
    ],
    sameAs: [
      "https://www.facebook.com/letatchebois",
      "https://www.instagram.com/letatchebois",
    ],
  };
}

/**
 * Generate Product schema
 */
export function generateProductSchema(product: {
  id: string;
  name: string;
  description: string;
  slug: string;
  price: number;
  images: string[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}): Product {
  const schema: Product = {
    "@type": "Product",
    "@id": `${SITE_URL}/boutique/${product.slug}/#product`,
    name: product.name,
    description: product.description,
    image: product.images.map((img) =>
      img.startsWith("http") ? img : `${SITE_URL}${img}`
    ),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/fr/boutique/${product.slug}`,
      priceCurrency: "MAD",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };

  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: { name: string; url?: string }[]
): BreadcrumbList {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && index < items.length - 1 ? { item: item.url } : {}),
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
): FAQPage {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ═══════════════════════════════════════════════════════════
// Full Page Schema Generator
// ═══════════════════════════════════════════════════════════

interface SchemaOptions {
  locale: string;
  pageType: "home" | "about" | "services" | "shop" | "product" | "project" | "contact" | "faq";
  product?: Parameters<typeof generateProductSchema>[0];
  breadcrumbs?: { name: string; url?: string }[];
  faqs?: { question: string; answer: string }[];
}

/**
 * Generate full JSON-LD script content for a page
 */
export function generatePageSchema(options: SchemaOptions): object {
  const schemas: object[] = [];

  // Always include organization schema
  schemas.push(generateOrganizationSchema());

  // Always include website schema
  schemas.push(generateWebSiteSchema(options.locale));

  // Add page-specific schemas
  switch (options.pageType) {
    case "home":
    case "about":
    case "contact":
      schemas.push(generateLocalBusinessSchema());
      break;
    case "product":
      if (options.product) {
        schemas.push(generateProductSchema(options.product));
      }
      break;
    case "faq":
    case "services":
      if (options.faqs) {
        schemas.push(generateFAQSchema(options.faqs));
      }
      break;
  }

  // Add breadcrumbs if provided
  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(options.breadcrumbs));
  }

  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}

/**
 * Render JSON-LD as a script tag string
 */
export function renderJsonLd(schema: object): string {
  return JSON.stringify(schema);
}
