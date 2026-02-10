import { Metadata } from "next";

// ═══════════════════════════════════════════════════════════
// SEO Configuration
// ═══════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://letatche.ma";
const SITE_NAME = "LE TATCHE BOIS";
const DEFAULT_IMAGE = "/images/og-default.jpg";

export const LOCALES = ["fr", "en", "es", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

// Locale-specific metadata
export const localeMetadata: Record<Locale, { locale: string; dir: "ltr" | "rtl" }> = {
  fr: { locale: "fr_MA", dir: "ltr" },
  en: { locale: "en_US", dir: "ltr" },
  es: { locale: "es_ES", dir: "ltr" },
  ar: { locale: "ar_MA", dir: "rtl" },
};

// ═══════════════════════════════════════════════════════════
// SEO Translations
// ═══════════════════════════════════════════════════════════

export const seoTranslations = {
  fr: {
    home: {
      title: "Artisan Menuisier au Maroc - Meubles & Portes sur Mesure",
      description: "LE TATCHE BOIS - Atelier de menuiserie artisanale au Maroc. Fabrication sur mesure de meubles, portes, escaliers et fenetres en bois. Qualite traditionnelle, design moderne.",
    },
    about: {
      title: "Notre Atelier - L'Art du Bois depuis 1995",
      description: "Decouvrez l'histoire de LE TATCHE BOIS, atelier de menuiserie familial au Maroc. Notre savoir-faire artisanal au service de vos projets bois.",
    },
    services: {
      title: "Nos Services de Menuiserie",
      description: "Services de menuiserie sur mesure : portes, fenetres, escaliers, meubles, plafonds en bois. Devis gratuit au Maroc.",
    },
    projects: {
      title: "Nos Realisations",
      description: "Galerie de nos projets de menuiserie : maisons, restaurants, hotels. Inspiration et qualite artisanale.",
    },
    shop: {
      title: "Boutique - Meubles Artisanaux en Bois",
      description: "Achetez des meubles et objets en bois fabriques a la main au Maroc. Livraison dans tout le Maroc.",
    },
    contact: {
      title: "Contactez-nous",
      description: "Contactez LE TATCHE BOIS pour vos projets de menuiserie. Devis gratuit, conseil personnalise.",
    },
    quote: {
      title: "Demander un Devis Gratuit",
      description: "Obtenez un devis gratuit pour votre projet de menuiserie sur mesure. Reponse sous 48h.",
    },
    privacy: {
      title: "Politique de Confidentialite",
      description: "Politique de confidentialite et protection des donnees de LE TATCHE BOIS.",
    },
    terms: {
      title: "Conditions Generales de Vente",
      description: "Conditions generales de vente de LE TATCHE BOIS. Informations sur les commandes, livraisons et retours.",
    },
    cookies: {
      title: "Politique des Cookies",
      description: "Information sur l'utilisation des cookies sur le site LE TATCHE BOIS.",
    },
    shipping: {
      title: "Livraison",
      description: "Informations sur la livraison de vos commandes LE TATCHE BOIS dans tout le Maroc.",
    },
    cart: {
      title: "Panier",
      description: "Votre panier d'achat LE TATCHE BOIS.",
    },
    checkout: {
      title: "Paiement",
      description: "Finaliser votre commande LE TATCHE BOIS.",
    },
  },
  en: {
    home: {
      title: "Artisan Woodworker in Morocco - Custom Furniture & Doors",
      description: "LE TATCHE BOIS - Artisan woodworking workshop in Morocco. Custom-made furniture, doors, stairs and windows. Traditional quality, modern design.",
    },
    about: {
      title: "Our Workshop - The Art of Wood since 1995",
      description: "Discover the history of LE TATCHE BOIS, a family woodworking workshop in Morocco. Our craftsmanship at your service.",
    },
    services: {
      title: "Our Woodworking Services",
      description: "Custom woodworking services: doors, windows, stairs, furniture, wooden ceilings. Free quote in Morocco.",
    },
    projects: {
      title: "Our Projects",
      description: "Gallery of our woodworking projects: homes, restaurants, hotels. Inspiration and artisan quality.",
    },
    shop: {
      title: "Shop - Handcrafted Wooden Furniture",
      description: "Buy handmade wooden furniture and objects in Morocco. Delivery throughout Morocco.",
    },
    contact: {
      title: "Contact Us",
      description: "Contact LE TATCHE BOIS for your woodworking projects. Free quote, personalized advice.",
    },
    quote: {
      title: "Request a Free Quote",
      description: "Get a free quote for your custom woodworking project. Response within 48h.",
    },
    privacy: {
      title: "Privacy Policy",
      description: "Privacy policy and data protection of LE TATCHE BOIS.",
    },
    terms: {
      title: "Terms and Conditions",
      description: "Terms and conditions of LE TATCHE BOIS. Information about orders, deliveries and returns.",
    },
    cookies: {
      title: "Cookie Policy",
      description: "Information about the use of cookies on LE TATCHE BOIS website.",
    },
    shipping: {
      title: "Shipping",
      description: "Information about shipping your LE TATCHE BOIS orders throughout Morocco.",
    },
    cart: {
      title: "Cart",
      description: "Your LE TATCHE BOIS shopping cart.",
    },
    checkout: {
      title: "Checkout",
      description: "Complete your LE TATCHE BOIS order.",
    },
  },
  es: {
    home: {
      title: "Artesano Carpintero en Marruecos - Muebles y Puertas a Medida",
      description: "LE TATCHE BOIS - Taller de carpinteria artesanal en Marruecos. Fabricacion a medida de muebles, puertas, escaleras y ventanas de madera.",
    },
    about: {
      title: "Nuestro Taller - El Arte de la Madera desde 1995",
      description: "Descubre la historia de LE TATCHE BOIS, taller de carpinteria familiar en Marruecos.",
    },
    services: {
      title: "Nuestros Servicios de Carpinteria",
      description: "Servicios de carpinteria a medida: puertas, ventanas, escaleras, muebles. Presupuesto gratis.",
    },
    projects: {
      title: "Nuestras Realizaciones",
      description: "Galeria de nuestros proyectos de carpinteria: casas, restaurantes, hoteles.",
    },
    shop: {
      title: "Tienda - Muebles Artesanales de Madera",
      description: "Compre muebles y objetos de madera hechos a mano en Marruecos.",
    },
    contact: {
      title: "Contactenos",
      description: "Contacte LE TATCHE BOIS para sus proyectos de carpinteria. Presupuesto gratis.",
    },
    quote: {
      title: "Solicitar Presupuesto Gratis",
      description: "Obtenga un presupuesto gratis para su proyecto de carpinteria a medida.",
    },
    privacy: {
      title: "Politica de Privacidad",
      description: "Politica de privacidad y proteccion de datos de LE TATCHE BOIS.",
    },
    terms: {
      title: "Terminos y Condiciones",
      description: "Terminos y condiciones de LE TATCHE BOIS.",
    },
    cookies: {
      title: "Politica de Cookies",
      description: "Informacion sobre el uso de cookies en LE TATCHE BOIS.",
    },
    shipping: {
      title: "Envio",
      description: "Informacion sobre el envio de sus pedidos LE TATCHE BOIS.",
    },
    cart: {
      title: "Carrito",
      description: "Su carrito de compras LE TATCHE BOIS.",
    },
    checkout: {
      title: "Pago",
      description: "Finalizar su pedido LE TATCHE BOIS.",
    },
  },
  ar: {
    home: {
      title: "حرفي نجارة في المغرب - أثاث وأبواب حسب الطلب",
      description: "LE TATCHE BOIS - ورشة نجارة حرفية في المغرب. تصنيع حسب الطلب للأثاث والأبواب والسلالم والنوافذ الخشبية.",
    },
    about: {
      title: "ورشتنا - فن الخشب منذ 1995",
      description: "اكتشف تاريخ LE TATCHE BOIS، ورشة نجارة عائلية في المغرب.",
    },
    services: {
      title: "خدمات النجارة لدينا",
      description: "خدمات نجارة حسب الطلب: أبواب، نوافذ، سلالم، أثاث. تقدير مجاني.",
    },
    projects: {
      title: "إنجازاتنا",
      description: "معرض مشاريع النجارة لدينا: منازل، مطاعم، فنادق.",
    },
    shop: {
      title: "المتجر - أثاث خشبي حرفي",
      description: "اشترِ الأثاث والأشياء الخشبية المصنوعة يدويًا في المغرب.",
    },
    contact: {
      title: "اتصل بنا",
      description: "اتصل بـ LE TATCHE BOIS لمشاريع النجارة الخاصة بك. تقدير مجاني.",
    },
    quote: {
      title: "طلب تقدير مجاني",
      description: "احصل على تقدير مجاني لمشروع النجارة الخاص بك.",
    },
    privacy: {
      title: "سياسة الخصوصية",
      description: "سياسة الخصوصية وحماية البيانات لـ LE TATCHE BOIS.",
    },
    terms: {
      title: "الشروط والأحكام",
      description: "شروط وأحكام LE TATCHE BOIS.",
    },
    cookies: {
      title: "سياسة ملفات تعريف الارتباط",
      description: "معلومات حول استخدام ملفات تعريف الارتباط على LE TATCHE BOIS.",
    },
    shipping: {
      title: "التوصيل",
      description: "معلومات حول توصيل طلباتك من LE TATCHE BOIS.",
    },
    cart: {
      title: "سلة التسوق",
      description: "سلة التسوق الخاصة بك في LE TATCHE BOIS.",
    },
    checkout: {
      title: "الدفع",
      description: "إتمام طلبك في LE TATCHE BOIS.",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Metadata Generator
// ═══════════════════════════════════════════════════════════

interface GenerateMetadataOptions {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  keywords?: string[];
}

export function generateSEOMetadata({
  title,
  description,
  locale,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
  keywords = [],
}: GenerateMetadataOptions): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  // Don't add SITE_NAME here - the layout template already adds it via "%s | LE TATCHE BOIS"
  const fullTitle = title;
  const ogTitle = `${title} | ${SITE_NAME}`; // OpenGraph/Twitter need full title (no template applied)
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  // Generate alternate language URLs
  const languages: Record<string, string> = {};
  LOCALES.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}${path}`;
  });
  languages["x-default"] = `${SITE_URL}/fr${path}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,

    // Canonical & Alternate
    alternates: {
      canonical: url,
      languages,
    },

    // Open Graph
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: localeMetadata[locale].locale,
      type,
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [imageUrl],
    },

    // Robots
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },

    // Other
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
  };
}

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

export function getPageSEO(locale: Locale, page: keyof typeof seoTranslations.fr) {
  const translations = seoTranslations[locale] ?? seoTranslations.fr;
  return translations[page] ?? seoTranslations.fr[page];
}

// Helper for product pages
export function generateProductMetadata(
  product: {
    name: string;
    description: string;
    slug: string;
    images: string[];
    price: number;
  },
  locale: Locale
): Metadata {
  return generateSEOMetadata({
    title: product.name,
    description: product.description.slice(0, 160),
    locale,
    path: `/boutique/${product.slug}`,
    image: product.images[0],
    type: "article",
    keywords: ["bois", "artisanat", "maroc", product.name.toLowerCase()],
  });
}

// Helper for project pages
export function generateProjectMetadata(
  project: {
    title: string;
    description: string;
    slug: string;
    images: string[];
  },
  locale: Locale
): Metadata {
  return generateSEOMetadata({
    title: project.title,
    description: project.description.slice(0, 160),
    locale,
    path: `/realisations/${project.slug}`,
    image: project.images[0],
    type: "article",
    keywords: ["menuiserie", "bois", "projet", project.title.toLowerCase()],
  });
}
