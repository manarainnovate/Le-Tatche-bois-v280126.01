import Link from "next/link";
import { Wrench, Plus, Construction } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Services",
    subtitle: "Gérez vos services proposés",
    newService: "Nouveau service",
    comingSoon: "Fonctionnalité en cours de développement",
    comingSoonDesc: "La gestion des services sera bientôt disponible. Veuillez patienter.",
  },
  en: {
    title: "Services",
    subtitle: "Manage your offered services",
    newService: "New Service",
    comingSoon: "Feature under development",
    comingSoonDesc: "Service management will be available soon. Please wait.",
  },
  es: {
    title: "Servicios",
    subtitle: "Gestiona tus servicios ofrecidos",
    newService: "Nuevo Servicio",
    comingSoon: "Función en desarrollo",
    comingSoonDesc: "La gestión de servicios estará disponible pronto. Por favor espere.",
  },
  ar: {
    title: "الخدمات",
    subtitle: "إدارة الخدمات المقدمة",
    newService: "خدمة جديدة",
    comingSoon: "ميزة قيد التطوير",
    comingSoonDesc: "ستكون إدارة الخدمات متاحة قريباً. يرجى الانتظار.",
  },
};

// ═══════════════════════════════════════════════════════════
// Services Page (Placeholder)
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench className="h-6 w-6 text-amber-600" />
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/services/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700 opacity-50 cursor-not-allowed pointer-events-none"
        >
          <Plus className="h-4 w-4" />
          {t.newService}
        </Link>
      </div>

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
  title: "Services",
};
