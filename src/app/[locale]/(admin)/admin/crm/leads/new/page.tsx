import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";
import { LeadForm } from "@/components/crm/leads";

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Nouveau Lead | CRM - Le Tatche Bois",
};

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    back: "Retour aux leads",
    newLead: "Nouveau lead",
    subtitle: "Créez un nouveau lead pour suivre vos prospects",
  },
  en: {
    back: "Back to leads",
    newLead: "New lead",
    subtitle: "Create a new lead to track your prospects",
  },
  es: {
    back: "Volver a prospectos",
    newLead: "Nuevo prospecto",
    subtitle: "Crea un nuevo prospecto para seguir tus posibles clientes",
  },
  ar: {
    back: "العودة إلى العملاء المحتملين",
    newLead: "عميل محتمل جديد",
    subtitle: "أنشئ عميلاً محتملاً جديداً لتتبع العملاء المحتملين",
  },
};

// ═══════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function NewLeadPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const t = (translations[locale] || translations.fr);

  // Fetch users for assignment
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MANAGER", "COMMERCIAL"] },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Default status from URL params
  const initialStatus = params.status || "NOUVEAU";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href={`/${locale}/admin/crm/leads`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="h-7 w-7 text-amber-600" />
          {t.newLead}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Form */}
      <LeadForm
        locale={locale}
        users={users.map((u) => ({ id: u.id, name: u.name || "" }))}
        initialData={undefined}
      />
    </div>
  );
}
