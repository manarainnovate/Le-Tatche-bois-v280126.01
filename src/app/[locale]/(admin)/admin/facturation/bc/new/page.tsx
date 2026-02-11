export const dynamic = 'force-dynamic';


import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

// ═══════════════════════════════════════════════════════════
// Server Component - New BC Page
// This page guides user to create BC from existing Devis
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ devisId?: string }>;
}

const translations: Record<string, Record<string, string>> = {
  fr: {
    title: "Nouveau Bon de Commande",
    back: "Retour",
    selectDevis: "Sélectionner un devis accepté à convertir",
    noDevis: "Aucun devis accepté disponible",
    createFromDevis: "Créer BC depuis ce devis",
    devisNumber: "N° Devis",
    client: "Client",
    amount: "Montant TTC",
    date: "Date",
  },
  en: {
    title: "New Purchase Order",
    back: "Back",
    selectDevis: "Select an accepted quote to convert",
    noDevis: "No accepted quotes available",
    createFromDevis: "Create PO from this quote",
    devisNumber: "Quote #",
    client: "Client",
    amount: "Total Amount",
    date: "Date",
  },
  es: {
    title: "Nueva Orden de Compra",
    back: "Volver",
    selectDevis: "Seleccionar un presupuesto aceptado para convertir",
    noDevis: "No hay presupuestos aceptados disponibles",
    createFromDevis: "Crear OC desde este presupuesto",
    devisNumber: "N° Presupuesto",
    client: "Cliente",
    amount: "Total",
    date: "Fecha",
  },
  ar: {
    title: "طلب شراء جديد",
    back: "رجوع",
    selectDevis: "اختر عرض سعر مقبول للتحويل",
    noDevis: "لا توجد عروض أسعار مقبولة",
    createFromDevis: "إنشاء طلب شراء من هذا العرض",
    devisNumber: "رقم العرض",
    client: "العميل",
    amount: "المبلغ الإجمالي",
    date: "التاريخ",
  },
};

export default async function NewBCPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const search = await searchParams;
  const t = translations[locale] || translations.fr;

  // Fetch accepted devis that haven't been converted to BC yet
  const acceptedDevis = await prisma.cRMDocument.findMany({
    where: {
      type: "DEVIS",
      status: "ACCEPTED",
      children: {
        none: {
          type: "BON_COMMANDE",
        },
      },
    },
    include: {
      client: {
        select: { id: true, fullName: true, clientNumber: true },
      },
    },
    orderBy: { date: "desc" },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " DH";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/facturation/bc`}
          className="inline-flex items-center justify-center rounded-md text-sm h-8 px-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t.back}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h1>
      </div>

      {/* Select Devis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.selectDevis}
        </h2>

        {acceptedDevis.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>{t.noDevis}</p>
            <Link
              href={`/${locale}/admin/facturation/devis`}
              className="inline-flex items-center justify-center font-medium transition-all duration-200 border-2 border-wood-primary text-wood-primary bg-transparent hover:bg-wood-primary hover:text-white h-10 px-4 rounded-md mt-4"
            >
              Voir tous les devis
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {acceptedDevis.map((devis) => (
              <div
                key={devis.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {devis.number}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(devis.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {devis.clientName}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold text-amber-600">
                    {formatCurrency(Number(devis.totalTTC))}
                  </p>
                </div>
                <form action={`/api/crm/documents/${devis.id}/convert`} method="POST">
                  <input type="hidden" name="targetType" value="BON_COMMANDE" />
                  <input type="hidden" name="locale" value={locale} />
                  <Button type="submit" size="sm">
                    {t.createFromDevis}
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
