"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Home } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

// Translations for thank you page
const translations = {
  fr: {
    title: "Demande envoyée !",
    subtitle: "Nous vous répondrons sous 24h ouvrées.",
    backHome: "Retour à l'accueil",
  },
  en: {
    title: "Request sent!",
    subtitle: "We will respond within 24 business hours.",
    backHome: "Back to home",
  },
  es: {
    title: "¡Solicitud enviada!",
    subtitle: "Responderemos en 24 horas hábiles.",
    backHome: "Volver al inicio",
  },
  ar: {
    title: "تم إرسال الطلب!",
    subtitle: "سنرد عليك خلال 24 ساعة عمل.",
    backHome: "العودة إلى الصفحة الرئيسية",
  },
};

export default function DevisMerciPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "fr";
  const isRTL = locale === "ar";

  const t = translations[locale as keyof typeof translations] || translations.fr;

  // Fire Google Ads conversion tracking
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-16623923567",
        value: 500.0,
        currency: "MAD",
      });
    }
  }, []);

  return (
    <main className="min-h-screen py-12 md:py-16 bg-gradient-to-b from-green-50/50 to-white">
      <div className="max-w-lg mx-auto px-4">
        <Card className="p-8 md:p-10 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1
            className={cn(
              "font-heading text-2xl md:text-3xl font-bold text-wood-dark mb-2",
              isRTL && "font-arabic"
            )}
          >
            {t.title}
          </h1>
          <p className={cn("text-wood-muted mb-6", isRTL && "font-arabic")}>{t.subtitle}</p>

          {/* Back Home Button */}
          <Link
            href={`/${locale}`}
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "px-6 py-3 rounded-lg font-medium",
              "bg-gradient-to-r from-wood-primary to-wood-secondary",
              "text-white shadow-md hover:brightness-110 transition-all",
              isRTL && "flex-row-reverse font-arabic"
            )}
          >
            <Home className="w-5 h-5" />
            {t.backHome}
          </Link>
        </Card>
      </div>
    </main>
  );
}
