import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale, getDirection } from "@/i18n/config";

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://letatche.ma";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// ═══════════════════════════════════════════════════════════
// Metadata Configuration
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const descriptions: Record<string, string> = {
    ar: "ورشة نجارة مغربية - أعمال خشبية حسب الطلب",
    es: "Taller de carpintería marroquí - Trabajos en madera a medida",
    en: "Moroccan Woodworking Workshop - Custom Wood Creations",
    fr: "Atelier de menuiserie marocain - Créations bois sur mesure",
  };

  return {
    title: {
      template: "%s | LE TATCHE BOIS",
      default: "LE TATCHE BOIS - Artisan Menuisier Marocain",
    },
    description: descriptions[locale] ?? descriptions.fr,
    metadataBase: new URL(SITE_URL),
    applicationName: "LE TATCHE BOIS",
    authors: [{ name: "LE TATCHE BOIS" }],
    generator: "Next.js",
    keywords: [
      "menuiserie",
      "bois",
      "maroc",
      "artisan",
      "meubles",
      "portes",
      "escaliers",
    ],
    referrer: "origin-when-cross-origin",
    creator: "LE TATCHE BOIS",
    publisher: "LE TATCHE BOIS",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    // Apple-specific meta tags
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "LE TATCHE BOIS",
    },
    // Verification tags (add your IDs)
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    // Category
    category: "shopping",
  };
}

// ═══════════════════════════════════════════════════════════
// Locale Layout Component (NO html/body - those are in root layout)
// ═══════════════════════════════════════════════════════════

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const direction = getDirection(locale as Locale);

  return (
    <div
      lang={locale}
      dir={direction}
      className={`min-h-screen ${direction === "rtl" ? "font-arabic" : "font-body"}`}
    >
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
