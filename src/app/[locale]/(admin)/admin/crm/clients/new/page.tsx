export const dynamic = 'force-dynamic';


import { getLocale } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { ClientForm } from "@/components/crm/clients";

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Nouveau Client | CRM - Le Tatche Bois",
};

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    back: "Retour aux clients",
    newClient: "Nouveau client",
    subtitle: "Créez un nouveau client pour gérer ses projets et documents",
  },
  en: {
    back: "Back to clients",
    newClient: "New client",
    subtitle: "Create a new client to manage their projects and documents",
  },
  es: {
    back: "Volver a clientes",
    newClient: "Nuevo cliente",
    subtitle: "Crea un nuevo cliente para gestionar sus proyectos y documentos",
  },
  ar: {
    back: "العودة إلى العملاء",
    newClient: "عميل جديد",
    subtitle: "أنشئ عميلاً جديداً لإدارة مشاريعه ومستنداته",
  },
};

// ═══════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════

export default async function NewClientPage() {
  const locale = await getLocale();
  const t = (translations[locale] || translations.fr);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href={`/${locale}/admin/crm/clients`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="h-7 w-7 text-amber-600" />
          {t.newClient}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Form */}
      <ClientForm locale={locale} />
    </div>
  );
}
