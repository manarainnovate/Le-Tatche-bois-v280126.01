export const dynamic = 'force-dynamic';

import { Search } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Recherche",
    subtitle: "Rechercher dans toutes les sections",
    comingSoon: "Fonctionnalité en cours de développement",
    description: "La recherche globale sera bientôt disponible. Pour le moment, vous pouvez utiliser les filtres disponibles dans chaque section.",
  },
  en: {
    title: "Search",
    subtitle: "Search across all sections",
    comingSoon: "Feature under development",
    description: "Global search will be available soon. For now, you can use the filters available in each section.",
  },
  es: {
    title: "Buscar",
    subtitle: "Buscar en todas las secciones",
    comingSoon: "Función en desarrollo",
    description: "La búsqueda global estará disponible pronto. Por ahora, puede usar los filtros disponibles en cada sección.",
  },
  ar: {
    title: "بحث",
    subtitle: "البحث في جميع الأقسام",
    comingSoon: "الميزة قيد التطوير",
    description: "سيكون البحث الشامل متاحًا قريبًا. في الوقت الحالي، يمكنك استخدام الفلاتر المتاحة في كل قسم.",
  },
};

// ═══════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale } = await params;
  const t = translations[locale as keyof typeof translations] || translations.fr;
  const isRTL = locale === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Search className="h-8 w-8 text-amber-600" />
            {t.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <Search className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t.comingSoon}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t.description}
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href={`/${locale}/admin/facturation`}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {locale === 'fr' ? 'Facturation' : locale === 'en' ? 'Invoicing' : locale === 'es' ? 'Facturación' : 'الفواتير'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'fr' ? 'Devis, factures, BL' : locale === 'en' ? 'Quotes, invoices, DN' : locale === 'es' ? 'Cotizaciones, facturas' : 'العروض، الفواتير'}
            </p>
          </a>

          <a
            href={`/${locale}/admin/crm`}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {locale === 'fr' ? 'Clients' : locale === 'en' ? 'Clients' : locale === 'es' ? 'Clientes' : 'العملاء'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'fr' ? 'Gestion clients & projets' : locale === 'en' ? 'Client & project management' : locale === 'es' ? 'Gestión de clientes' : 'إدارة العملاء'}
            </p>
          </a>

          <a
            href={`/${locale}/admin/catalogue`}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {locale === 'fr' ? 'Catalogue' : locale === 'en' ? 'Catalog' : locale === 'es' ? 'Catálogo' : 'الكتالوج'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'fr' ? 'Produits & services' : locale === 'en' ? 'Products & services' : locale === 'es' ? 'Productos y servicios' : 'المنتجات والخدمات'}
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Recherche",
  description: "Rechercher dans toutes les sections",
};
