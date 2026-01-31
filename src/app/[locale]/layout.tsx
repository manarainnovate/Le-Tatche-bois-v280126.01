import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale, getDirection } from "@/i18n/config";
import "@/app/globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export function generateMetadata({
  params: { locale },
}: Props): Metadata {
  return {
    title: {
      template: "%s | LE TATCHE BOIS",
      default: "LE TATCHE BOIS - Artisan Menuisier Marocain",
    },
    description:
      locale === "ar"
        ? "ورشة نجارة مغربية - أعمال خشبية حسب الطلب"
        : locale === "es"
          ? "Taller de carpintería marroquí - Trabajos en madera a medida"
          : locale === "en"
            ? "Moroccan Woodworking Workshop - Custom Wood Creations"
            : "Atelier de menuiserie marocain - Créations bois sur mesure",
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const direction = getDirection(locale as Locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={direction === "rtl" ? "font-arabic" : "font-body"}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
