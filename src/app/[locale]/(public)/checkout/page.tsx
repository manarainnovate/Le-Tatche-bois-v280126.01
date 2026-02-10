import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { CheckoutContent } from "./CheckoutContent";
import { generateSEOMetadata, getPageSEO, Locale } from "@/lib/seo";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

// ═══════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSEO(locale as Locale, "checkout");

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    locale: locale as Locale,
    path: "/checkout",
    noIndex: true,
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function CheckoutPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  const tCart = await getTranslations({ locale, namespace: "cart" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tValidation = await getTranslations({ locale, namespace: "validation" });

  return (
    <CheckoutContent
      locale={locale}
      translations={{
        title: t("title"),
        backToCart: tCart("title"),
        // Contact section
        contact: {
          title: t("contact.title"),
          email: t("contact.email"),
          phone: t("contact.phone"),
        },
        // Shipping section
        shipping: {
          title: t("shipping.title"),
          firstName: t("shipping.firstName"),
          lastName: t("shipping.lastName"),
          address: t("shipping.address"),
          city: t("shipping.city"),
          postalCode: t("shipping.postalCode"),
          country: t("shipping.country"),
        },
        // Payment section
        payment: {
          title: t("payment.title"),
          card: t("payment.card"),
          cardSecure: t("payment.cardSecure"),
          cod: t("payment.cod"),
          codDesc: t("payment.codDesc"),
          cardDisabled: "Paiement par carte temporairement indisponible",
        },
        // Summary section
        summary: {
          title: t("summary.title"),
          subtotal: tCart("subtotal"),
          shipping: tCart("shipping"),
          total: tCart("total"),
          free: tCommon("free"),
        },
        // Buttons and messages
        placeOrder: t("placeOrder"),
        processing: t("processing"),
        // Validation messages
        validation: {
          required: tValidation("required"),
          emailInvalid: tValidation("email"),
          phoneInvalid: tValidation("phone"),
          minLength: tValidation("minLength"),
        },
        // Error messages
        error: tCommon("error"),
        // Empty cart
        emptyCart: tCart("empty"),
      }}
    />
  );
}
