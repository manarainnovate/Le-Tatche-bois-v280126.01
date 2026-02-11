export const dynamic = 'force-dynamic';


import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Pencil,
  Download,
  Truck,
  FileText,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Factory,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    back: "Retour",
    edit: "Modifier",
    download: "Télécharger PDF",
    print: "Imprimer",
    createBL: "Créer bon de livraison",
    startProduction: "Démarrer production",
    client: "Client",
    date: "Date",
    project: "Projet",
    devisRef: "Réf. Devis",
    reference: "Référence",
    designation: "Désignation",
    quantity: "Qté",
    unit: "Unité",
    unitPrice: "P.U. HT",
    discount: "Remise",
    total: "Total HT",
    items: "Articles",
    subtotal: "Sous-total HT",
    globalDiscount: "Remise globale",
    netHT: "Total HT net",
    tva: "TVA",
    totalTTC: "Total TTC",
    notes: "Notes",
    noItems: "Aucun article",
    DRAFT: "Brouillon",
    CONFIRMED: "Confirmé",
    PARTIAL: "En production",
    DELIVERED: "Terminé",
    CANCELLED: "Annulé",
    fromDevis: "Issu du devis",
    deliveries: "Bons de livraison",
  },
  en: {
    back: "Back",
    edit: "Edit",
    download: "Download PDF",
    print: "Print",
    createBL: "Create delivery note",
    startProduction: "Start production",
    client: "Client",
    date: "Date",
    project: "Project",
    devisRef: "Quote Ref.",
    reference: "Reference",
    designation: "Description",
    quantity: "Qty",
    unit: "Unit",
    unitPrice: "Unit Price",
    discount: "Discount",
    total: "Total",
    items: "Items",
    subtotal: "Subtotal",
    globalDiscount: "Global discount",
    netHT: "Net total",
    tva: "Tax",
    totalTTC: "Grand total",
    notes: "Notes",
    noItems: "No items",
    DRAFT: "Draft",
    CONFIRMED: "Confirmed",
    PARTIAL: "In Production",
    DELIVERED: "Completed",
    CANCELLED: "Cancelled",
    fromDevis: "From quote",
    deliveries: "Delivery notes",
  },
  es: {
    back: "Volver",
    edit: "Editar",
    download: "Descargar PDF",
    print: "Imprimir",
    createBL: "Crear nota de entrega",
    startProduction: "Iniciar producción",
    client: "Cliente",
    date: "Fecha",
    project: "Proyecto",
    devisRef: "Ref. Presupuesto",
    reference: "Referencia",
    designation: "Descripción",
    quantity: "Cant.",
    unit: "Unidad",
    unitPrice: "P.U.",
    discount: "Desc.",
    total: "Total",
    items: "Artículos",
    subtotal: "Subtotal",
    globalDiscount: "Descuento global",
    netHT: "Total neto",
    tva: "IVA",
    totalTTC: "Total con IVA",
    notes: "Notas",
    noItems: "Sin artículos",
    DRAFT: "Borrador",
    CONFIRMED: "Confirmada",
    PARTIAL: "En producción",
    DELIVERED: "Completada",
    CANCELLED: "Cancelada",
    fromDevis: "Del presupuesto",
    deliveries: "Notas de entrega",
  },
  ar: {
    back: "رجوع",
    edit: "تعديل",
    download: "تحميل PDF",
    print: "طباعة",
    createBL: "إنشاء إشعار تسليم",
    startProduction: "بدء الإنتاج",
    client: "العميل",
    date: "التاريخ",
    project: "المشروع",
    devisRef: "مرجع العرض",
    reference: "المرجع",
    designation: "الوصف",
    quantity: "الكمية",
    unit: "الوحدة",
    unitPrice: "سعر الوحدة",
    discount: "الخصم",
    total: "المجموع",
    items: "العناصر",
    subtotal: "المجموع الفرعي",
    globalDiscount: "الخصم الكلي",
    netHT: "صافي المجموع",
    tva: "الضريبة",
    totalTTC: "المجموع الكلي",
    notes: "ملاحظات",
    noItems: "لا توجد عناصر",
    DRAFT: "مسودة",
    CONFIRMED: "مؤكد",
    PARTIAL: "قيد التنفيذ",
    DELIVERED: "مكتمل",
    CANCELLED: "ملغي",
    fromDevis: "من العرض",
    deliveries: "إشعارات التسليم",
  },
};

// ═══════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function BCDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const t = translations[locale] || translations.fr;
  const isRTL = locale === "ar";

  // Fetch document with items
  const document = await prisma.cRMDocument.findUnique({
    where: { id },
    include: {
      client: true,
      project: {
        select: { id: true, name: true, projectNumber: true },
      },
      parent: {
        select: { id: true, number: true, type: true },
      },
      children: {
        select: { id: true, number: true, type: true, status: true, date: true },
      },
      items: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!document || document.type !== "BON_COMMANDE") {
    notFound();
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "0.00 DH";
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount)) + " DH";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const statusStyles: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
    DRAFT: { bg: "bg-gray-100", text: "text-gray-700", icon: FileText },
    CONFIRMED: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
    PARTIAL: { bg: "bg-amber-100", text: "text-amber-700", icon: Factory },
    DELIVERED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
    CANCELLED: { bg: "bg-gray-100", text: "text-gray-500", icon: FileText },
  };

  const status = statusStyles[document.status] || statusStyles.DRAFT;
  const StatusIcon = status.icon;

  // Get BL children
  const deliveries = document.children.filter((c) => c.type === "BON_LIVRAISON");

  return (
    <div className={cn("space-y-6", isRTL && "rtl")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/facturation/bc`}
            className="inline-flex items-center justify-center rounded-md text-sm h-8 px-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {document.number}
              </h1>
              <span className={cn("flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium", status.bg, status.text)}>
                <StatusIcon className="h-4 w-4" />
                {t[document.status] || document.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(document.date)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/admin/facturation/bc/${id}/edit`}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 border-2 border-wood-primary text-wood-primary bg-transparent hover:bg-wood-primary hover:text-white h-8 px-3 text-sm rounded-md"
          >
            <Pencil className="h-4 w-4 mr-1" />
            {t.edit}
          </Link>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            {t.download}
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1" />
            {t.print}
          </Button>
          {document.status === "DRAFT" && (
            <Button size="sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirmer
            </Button>
          )}
          {document.status === "CONFIRMED" && (
            <>
              <Button variant="outline" size="sm">
                <Factory className="h-4 w-4 mr-1" />
                {t.startProduction}
              </Button>
              <Button size="sm">
                <Truck className="h-4 w-4 mr-1" />
                {t.createBL}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Source Devis */}
      {document.parent && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t.fromDevis}:{" "}
            <Link
              href={`/${locale}/admin/facturation/devis/${document.parent.id}`}
              className="font-medium underline hover:no-underline"
            >
              {document.parent.number}
            </Link>
          </p>
        </div>
      )}

      {/* Deliveries */}
      {deliveries.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {t.deliveries}
          </h3>
          <ul className="space-y-1">
            {deliveries.map((delivery) => (
              <li key={delivery.id}>
                <Link
                  href={`/${locale}/admin/facturation/bl/${delivery.id}`}
                  className="text-green-700 dark:text-green-400 hover:underline"
                >
                  {delivery.number} - {formatDate(delivery.date)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t.items}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t.reference}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t.designation}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {t.quantity}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {t.unitPrice}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {t.total}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {document.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        {t.noItems}
                      </td>
                    </tr>
                  ) : (
                    document.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.reference || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.designation}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {Number(item.quantity)} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {formatCurrency(Number(item.unitPriceHT))}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(Number(item.totalHT))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.subtotal}</span>
                  <span>{formatCurrency(Number(document.totalHT))}</span>
                </div>
                {Number(document.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>{t.globalDiscount}</span>
                    <span>-{formatCurrency(Number(document.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.netHT}</span>
                  <span>{formatCurrency(Number(document.netHT))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.tva}</span>
                  <span>{formatCurrency(Number(document.totalTVA))}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
                  <span>{t.totalTTC}</span>
                  <span className="text-amber-600">{formatCurrency(Number(document.totalTTC))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t.client}
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {document.clientName}
                </p>
                <p className="text-sm text-gray-500">
                  {document.client.clientNumber}
                </p>
              </div>
              {document.clientAddress && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {document.clientAddress}
                  {document.clientCity && `, ${document.clientCity}`}
                </p>
              )}
              <Link
                href={`/${locale}/admin/crm/clients/${document.clientId}`}
                className="inline-flex items-center justify-center w-full mt-2 font-medium transition-all duration-200 border-2 border-wood-primary text-wood-primary bg-transparent hover:bg-wood-primary hover:text-white h-8 px-3 text-sm rounded-md"
              >
                Voir fiche client
              </Link>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Dates
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t.date}</span>
                <span className="font-medium">{formatDate(document.date)}</span>
              </div>
              {document.deliveryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Livraison prévue</span>
                  <span className="font-medium">{formatDate(document.deliveryDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Project */}
          {document.project && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {t.project}
                </h2>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {document.project.name}
                </p>
                <p className="text-sm text-gray-500">
                  {document.project.projectNumber}
                </p>
                <Link
                  href={`/${locale}/admin/projets/${document.project.id}`}
                  className="inline-flex items-center justify-center w-full mt-3 font-medium transition-all duration-200 border-2 border-wood-primary text-wood-primary bg-transparent hover:bg-wood-primary hover:text-white h-8 px-3 text-sm rounded-md"
                >
                  Voir projet
                </Link>
              </div>
            </div>
          )}

          {/* Notes */}
          {(document.publicNotes || document.internalNotes) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t.notes}
              </h2>
              {document.publicNotes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {document.publicNotes}
                </p>
              )}
              {document.internalNotes && (
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">
                    Notes internes
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    {document.internalNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
