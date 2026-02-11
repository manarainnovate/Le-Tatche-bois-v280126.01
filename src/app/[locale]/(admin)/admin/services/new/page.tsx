export const dynamic = 'force-dynamic';


import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    back: "Retour aux services",
    comingSoon: "Fonctionnalité en cours de développement",
    comingSoonDesc: "La création de services sera bientôt disponible.",
  },
  en: {
    back: "Back to services",
    comingSoon: "Feature under development",
    comingSoonDesc: "Service creation will be available soon.",
  },
  es: {
    back: "Volver a servicios",
    comingSoon: "Función en desarrollo",
    comingSoonDesc: "La creación de servicios estará disponible pronto.",
  },
  ar: {
    back: "العودة إلى الخدمات",
    comingSoon: "ميزة قيد التطوير",
    comingSoonDesc: "ستكون إنشاء الخدمات متاحة قريباً.",
  },
};

// ═══════════════════════════════════════════════════════════
// New Service Page (Placeholder)
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewServicePage({ params }: PageProps) {
  const { locale } = await params;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Back Link */}
      <Link
        href={`/${locale}/admin/services`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </Link>

      {/* Coming Soon Message */}
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
        <Construction className="mx-auto h-16 w-16 text-amber-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {t.comingSoon}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t.comingSoonDesc}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "New Service",
};
