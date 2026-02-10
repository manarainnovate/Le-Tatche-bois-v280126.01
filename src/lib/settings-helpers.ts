import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// SETTING GROUPS CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const SETTING_GROUPS = [
  "general",
  "contact",
  "social",
  "shipping",
  "payment",
  "seo",
  "tracking",
  "boutique",
  "notifications",
  "devises",
  "legal",
  "emails",
  "theme",
] as const;

export type SettingGroup = (typeof SETTING_GROUPS)[number];

// Default settings for each group
export const DEFAULT_SETTINGS: Record<SettingGroup, Record<string, unknown>> = {
  general: {
    siteName: "LE TATCHE BOIS",
    siteNameAr: "التاتش بوا",
    tagline: "Artisanat du bois marocain",
    taglineAr: "حرفة الخشب المغربية",
    description: "Artisan menuisier marocain - Fabrication sur mesure",
    descriptionAr: "حرفي نجارة مغربي - تصنيع حسب الطلب",
    logoHeader: "/images/logo.png",
    logoFooter: "/images/logo-light.png",
    favicon: "/favicon.ico",
    businessHours: "Lun-Sam: 9h-18h",
    yearFounded: "2020",
    defaultLocale: "fr",
    defaultCurrency: "MAD",
  },
  contact: {
    phone: "+212 5XX-XXXXXX",
    whatsapp: "+212 6XX-XXXXXX",
    email: "contact@letatche-bois.ma",
    address: "Casablanca, Maroc",
    addressAr: "الدار البيضاء، المغرب",
    city: "Casablanca",
    country: "Morocco",
    postalCode: "20000",
    latitude: 33.5731,
    longitude: -7.5898,
    hoursWeekdays: "08:00 - 18:00",
    hoursSaturday: "09:00 - 14:00",
    hoursSunday: "Ferme",
    hoursSundayAr: "مغلق",
    googleMapsUrl: "",
  },
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    linkedin: "",
    pinterest: "",
    tiktok: "",
  },
  shipping: {
    enabled: true,
    freeShippingEnabled: true,
    defaultFreeThreshold: 1000,
    internationalShipping: false,
  },
  payment: {
    stripeEnabled: true,
    codEnabled: true,
    codFee: 0,
    minOrderAmount: 100,
    maxCodAmount: 5000,
  },
  seo: {
    defaultMetaTitle: "LE TATCHE BOIS - Artisanat du bois marocain",
    defaultMetaDescription:
      "Decouvrez notre collection de meubles et objets en bois faits a la main au Maroc.",
    googleSiteVerification: "",
    bingSiteVerification: "",
    yandexVerification: "",
    defaultOgImage: "/images/og-image.jpg",
    twitterCardType: "summary_large_image",
    sitemapLastGenerated: null,
    robotsTxt:
      "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /checkout/\nDisallow: /panier/\n\nSitemap: https://letatche-bois.ma/sitemap.xml",
  },
  tracking: {
    googleAnalyticsId: "",
    googleAnalyticsEnabled: false,
    googleTagManagerId: "",
    googleTagManagerEnabled: false,
    facebookPixelId: "",
    facebookPixelEnabled: false,
    facebookTestEvents: false,
    tiktokPixelId: "",
    tiktokPixelEnabled: false,
    pinterestTagId: "",
    pinterestTagEnabled: false,
  },
  boutique: {
    productsPerPage: 12,
    defaultSort: "newest",
    showOutOfStock: true,
    showProductSku: false,
    taxRate: 20,
    showPricesWithTax: true,
    currencyPosition: "after",
    enableReviews: true,
    reviewsRequireApproval: true,
    minRatingToDisplay: 1,
    lowStockThreshold: 5,
    showStockQuantity: false,
    allowBackorders: false,
  },
  notifications: {
    // Admin notifications
    notifyNewOrder: true,
    notifyNewQuote: true,
    notifyNewMessage: true,
    notifyLowStock: true,
    adminEmails: "",
    // Customer notifications
    sendOrderConfirmation: true,
    sendOrderShipped: true,
    sendQuoteConfirmation: true,
    // WhatsApp
    whatsappEnabled: false,
    whatsappNumber: "",
    whatsappOrderAlerts: false,
  },
  devises: {
    defaultCurrency: "MAD",
    showCurrencySwitcher: true,
    autoDetectByLocation: false,
    eurRate: 0.091,
    usdRate: 0.099,
    gbpRate: 0.078,
    ratesLastUpdated: null,
  },
  legal: {
    companyLegalName: "LE TATCHE BOIS SARL",
    ice: "",
    taxId: "",
    rc: "",
    legalAddress: "",
    returnPolicyDays: 14,
    warrantyDays: 365,
    cookieConsentMessage:
      "Ce site utilise des cookies pour ameliorer votre experience.",
    cookieConsentMessageAr:
      "يستخدم هذا الموقع ملفات تعريف الارتباط لتحسين تجربتك.",
  },
  emails: {
    adminEmail: "admin@letatche-bois.ma",
    fromEmail: "noreply@letatche-bois.ma",
    fromName: "Le Tatche Bois",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    smtpSecure: true,
    orderConfirmationEnabled: true,
    orderStatusUpdateEnabled: true,
    quoteNotificationEnabled: true,
    contactFormNotificationEnabled: true,
  },
  theme: {
    woodTexture: "",
    footerEnabled: true,
    footerOpacity: 60,
    statsBackground: {
      type: "color",
      color: "#8B4513",
      image: "",
      overlayOpacity: 65,
      overlayColor: "#000000",
      overlayEnabled: true,
      cardEnabled: false,
      cardColor: "#FFFFFF",
      cardOpacity: 80,
      cardBlur: true,
      titleColor: "#FFFFFF",
      bodyColor: "#CCCCCC",
      paginationColor: "#FFFFFF",
      paginationActiveColor: "#FFFFFF",
      paginationActiveBg: "#5D3A1A",
    },
    testimonialsBackground: {
      type: "color",
      color: "#FDF6EC",
      image: "",
      overlayOpacity: 0,
      overlayColor: "#FFFFFF",
      overlayEnabled: false,
      cardEnabled: false,
      cardColor: "#FFFFFF",
      cardOpacity: 80,
      cardBlur: true,
      titleColor: "#5D3A1A",
      bodyColor: "#A0826D",
      paginationColor: "#6B7280",
      paginationActiveColor: "#FFFFFF",
      paginationActiveBg: "#5D3A1A",
    },
    ctaBackground: {
      type: "image",
      color: "#5D3A1A",
      image: "/images/cta/workshop-bg.jpg",
      overlayOpacity: 85,
      overlayColor: "#3B1E0A",
      overlayEnabled: true,
      cardEnabled: false,
      cardColor: "#FFFFFF",
      cardOpacity: 80,
      cardBlur: true,
      titleColor: "#FFFFFF",
      bodyColor: "#CCCCCC",
      paginationColor: "#FFFFFF",
      paginationActiveColor: "#FFFFFF",
      paginationActiveBg: "#5D3A1A",
    },
    projectsBackground: {
      type: "color",
      color: "#FFFFFF",
      image: "",
      overlayOpacity: 0,
      overlayColor: "#FFFFFF",
      overlayEnabled: false,
      cardEnabled: false,
      cardColor: "#FFFFFF",
      cardOpacity: 80,
      cardBlur: true,
      titleColor: "#5D3A1A",
      bodyColor: "#A0826D",
      paginationColor: "#6B7280",
      paginationActiveColor: "#FFFFFF",
      paginationActiveBg: "#5D3A1A",
    },
    productsBackground: {
      type: "color",
      color: "#FAFAF5",
      image: "",
      overlayOpacity: 0,
      overlayColor: "#FFFFFF",
      overlayEnabled: false,
      cardEnabled: false,
      cardColor: "#FFFFFF",
      cardOpacity: 80,
      cardBlur: true,
      titleColor: "#5D3A1A",
      bodyColor: "#A0826D",
      paginationColor: "#6B7280",
      paginationActiveColor: "#FFFFFF",
      paginationActiveBg: "#5D3A1A",
    },
    aboutBackground: {
      type: "color",
      color: "#FFFFFF",
      image: "",
      overlayOpacity: 0,
      overlayColor: "#FFFFFF",
      overlayEnabled: false,
      cardEnabled: true,
      cardColor: "#FFFFFF",
      cardOpacity: 85,
      cardBlur: true,
      titleColor: "#5D3A1A",
      bodyColor: "#A0826D",
      paginationColor: "#6B7280",
      paginationActiveColor: "#FFFFFF",
      paginationActiveBg: "#5D3A1A",
    },
    aboutImage: "/uploads/projects/plafonds-murs/04-projet-plafond-decoratif-bois-sculpte/avant-IMG_20200226_160352.jpg",
    aboutTextCard: true,
    aboutTextCardOpacity: 85,
    // Services page
    servicesHero: { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 50, overlayColor: "#000000", overlayEnabled: true, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    servicesGrid: { type: "color", color: "#FDF6EC", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    servicesCta: { type: "color", color: "#3B1E0A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    // Realisations page
    realisationsHero: { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    realisationsGrid: { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    realisationsDetail: { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    realisationsCta: { type: "color", color: "#FDF6EC", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#6B7280", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    // Atelier page
    atelierStats: { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#FFFFFF26" },
    atelierStory: { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" },
    atelierGallery: { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" },
    atelierProcess: { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" },
    atelierMachines: { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#FFFFFF26" },
    atelierValues: { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" },
    atelierTeam: { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" },
    atelierCta: { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#FFFFFF26" },
    // Boutique page
    boutiqueHero: { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    boutiqueProduct: { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    boutiqueTabs: { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    boutiqueRelated: { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    boutiqueCart: { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    boutiqueCheckout: { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    boutiqueSuccess: { type: "color", color: "#F0FDF4", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    boutiqueConfirmation: { type: "color", color: "#F0FDF4", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    // Contact page
    contactHero: { type: "color", color: "#3B1E0A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    contactForm: { type: "color", color: "#F5F0EB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" },
    pages: {
      home: { enabled: true, image: "", opacity: 20 },
      atelier: { enabled: true, image: "", opacity: 25 },
      services: { enabled: true, image: "", opacity: 20 },
      realisations: { enabled: false, image: "", opacity: 30 },
      boutique: { enabled: true, image: "", opacity: 15 },
      contact: { enabled: true, image: "", opacity: 20 },
    },
  },
};

// ═══════════════════════════════════════════════════════════
// HELPER: Get settings from database
// ═══════════════════════════════════════════════════════════

export async function getSettings(
  groups?: SettingGroup[]
): Promise<Record<string, Record<string, unknown>>> {
  const targetGroups = groups ?? SETTING_GROUPS;
  const result: Record<string, Record<string, unknown>> = {};

  // Get all settings from database
  const dbSettings = await prisma.setting.findMany({
    where: groups ? { group: { in: groups } } : undefined,
  });

  // Build settings object with defaults
  for (const group of targetGroups) {
    result[group] = { ...DEFAULT_SETTINGS[group] };
  }

  // Override with database values
  for (const setting of dbSettings) {
    const groupSettings = result[setting.group];
    if (groupSettings) {
      groupSettings[setting.key] = setting.value;
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════
// HELPER: Update settings in database
// ═══════════════════════════════════════════════════════════

export async function updateSettings(
  group: string,
  settings: Record<string, unknown>
): Promise<void> {
  const operations = Object.entries(settings).map(([key, value]) => {
    return prisma.setting.upsert({
      where: {
        group_key: {
          group,
          key,
        },
      },
      update: {
        value: value as string | number | boolean | object,
      },
      create: {
        group,
        key,
        value: value as string | number | boolean | object,
      },
    });
  });

  await prisma.$transaction(operations);
}
