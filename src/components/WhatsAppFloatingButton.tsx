"use client";

import { MessageCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

// Translations for WhatsApp button
const translations = {
  fr: "Discuter sur WhatsApp",
  en: "Chat on WhatsApp",
  es: "Chatear en WhatsApp",
  ar: "الدردشة على واتساب",
};

// Helper function to track WhatsApp conversion
const trackWhatsAppConversion = () => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: "AW-16623923567/ApMwCPyK9f4bEO_i8_Y9",
      value: 150.0,
      currency: "MAD",
    });
  }
};

export function WhatsAppFloatingButton() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const buttonText = translations[locale as keyof typeof translations] || translations.fr;

  return (
    <a
      href="https://wa.me/212698013468?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20vos%20services."
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackWhatsAppConversion}
      className={cn(
        "fixed bottom-6 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-full shadow-lg transition-all hover:scale-105",
        isRTL ? "left-6" : "right-6"
      )}
      aria-label={buttonText}
    >
      <MessageCircle className="w-6 h-6" />
      <span className={cn("font-medium hidden sm:block", isRTL && "font-arabic")}>
        {buttonText}
      </span>
    </a>
  );
}
