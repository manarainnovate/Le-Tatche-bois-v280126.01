export const dynamic = 'force-dynamic';


import Link from "next/link";
import { Briefcase, Plus, Construction } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Réalisations",
    subtitle: "Gérez vos projets réalisés",
    newProject: "Nouvelle réalisation",
    comingSoon: "Fonctionnalité en cours de développement",
    comingSoonDesc: "La gestion des réalisations sera bientôt disponible. Veuillez patienter.",
  },
  en: {
    title: "Projects",
    subtitle: "Manage your completed projects",
    newProject: "New Project",
    comingSoon: "Feature under development",
    comingSoonDesc: "Project management will be available soon. Please wait.",
  },
  es: {
    title: "Proyectos",
    subtitle: "Gestiona tus proyectos completados",
    newProject: "Nuevo Proyecto",
    comingSoon: "Función en desarrollo",
    comingSoonDesc: "La gestión de proyectos estará disponible pronto. Por favor espere.",
  },
  ar: {
    title: "المشاريع",
    subtitle: "إدارة المشاريع المنجزة",
    newProject: "مشروع جديد",
    comingSoon: "ميزة قيد التطوير",
    comingSoonDesc: "ستكون إدارة المشاريع متاحة قريباً. يرجى الانتظار.",
  },
};

// ═══════════════════════════════════════════════════════════
// Projects Page (Placeholder)
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/realisations/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700 opacity-50 cursor-not-allowed pointer-events-none"
        >
          <Plus className="h-4 w-4" />
          {t.newProject}
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
  title: "Projects",
};
