"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Download,
  Send,
  ArrowRight,
  Copy,
  FileText,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Printer,
  Receipt,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CreateDepositInvoiceModal } from "@/components/crm/documents/CreateDepositInvoiceModal";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface DocumentItem {
  id: string;
  reference: string | null;
  designation: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent: number | null;
  totalHT: number;
  order: number;
}

interface DepositInvoice {
  id: string;
  number: string;
  totalTTC: number;
  status: string;
  date: Date;
}

interface Document {
  id: string;
  number: string;
  status: string;
  date: Date;
  validUntil: Date | null;
  deliveryTime: string | null;
  clientId: string;
  clientName: string;
  clientAddress: string | null;
  clientCity: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  clientIce: string | null;
  totalHT: number;
  discountAmount: number;
  netHT: number;
  totalTVA: number;
  totalTTC: number;
  depositPercent: number | null;
  depositAmount: number | null;
  publicNotes: string | null;
  internalNotes: string | null;
  conditions: string | null;
  includes: string[] | null;
  excludes: string[] | null;
  client: {
    id: string;
    clientNumber: string;
  };
  project: {
    id: string;
    name: string;
    projectNumber: string;
  } | null;
  children: {
    id: string;
    number: string;
    type: string;
  }[];
  items: DocumentItem[];
  depositInvoices: DepositInvoice[];
}

interface DevisDetailClientProps {
  document: Document;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    back: "Retour",
    edit: "Modifier",
    download: "Télécharger PDF",
    send: "Envoyer par email",
    print: "Imprimer",
    duplicate: "Dupliquer",
    convertToBC: "Convertir en BC",
    createDeposit: "Créer facture d'acompte",
    markAccepted: "Marquer accepté",
    markRejected: "Marquer refusé",
    client: "Client",
    date: "Date",
    validity: "Validité",
    project: "Projet",
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
    deposit: "Acompte",
    conditions: "Conditions",
    notes: "Notes",
    includes: "Ce devis comprend",
    excludes: "Ce devis ne comprend pas",
    footer: "Mentions légales",
    noItems: "Aucun article",
    DRAFT: "Brouillon",
    SENT: "Envoyé",
    ACCEPTED: "Accepté",
    REJECTED: "Refusé",
    CANCELLED: "Annulé",
    convertedTo: "Converti en",
    depositInvoices: "Factures d'acompte",
    noDepositInvoices: "Aucune facture d'acompte",
    viewDeposit: "Voir",
    totalDeposits: "Total acomptes",
    remainingBalance: "Solde restant",
    updating: "Mise à jour...",
  },
  en: {
    back: "Back",
    edit: "Edit",
    download: "Download PDF",
    send: "Send by email",
    print: "Print",
    duplicate: "Duplicate",
    convertToBC: "Convert to PO",
    createDeposit: "Create deposit invoice",
    markAccepted: "Mark accepted",
    markRejected: "Mark rejected",
    client: "Client",
    date: "Date",
    validity: "Valid until",
    project: "Project",
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
    deposit: "Deposit",
    conditions: "Terms",
    notes: "Notes",
    includes: "This quote includes",
    excludes: "This quote excludes",
    footer: "Legal notice",
    noItems: "No items",
    DRAFT: "Draft",
    SENT: "Sent",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    convertedTo: "Converted to",
    depositInvoices: "Deposit invoices",
    noDepositInvoices: "No deposit invoices",
    viewDeposit: "View",
    totalDeposits: "Total deposits",
    remainingBalance: "Remaining balance",
    updating: "Updating...",
  },
  es: {
    back: "Volver",
    edit: "Editar",
    download: "Descargar PDF",
    send: "Enviar por email",
    print: "Imprimir",
    duplicate: "Duplicar",
    convertToBC: "Convertir a OC",
    createDeposit: "Crear factura de anticipo",
    markAccepted: "Marcar aceptado",
    markRejected: "Marcar rechazado",
    client: "Cliente",
    date: "Fecha",
    validity: "Validez",
    project: "Proyecto",
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
    deposit: "Anticipo",
    conditions: "Condiciones",
    notes: "Notas",
    includes: "Este presupuesto incluye",
    excludes: "Este presupuesto no incluye",
    footer: "Aviso legal",
    noItems: "Sin artículos",
    DRAFT: "Borrador",
    SENT: "Enviado",
    ACCEPTED: "Aceptado",
    REJECTED: "Rechazado",
    CANCELLED: "Cancelado",
    convertedTo: "Convertido a",
    depositInvoices: "Facturas de anticipo",
    noDepositInvoices: "Sin facturas de anticipo",
    viewDeposit: "Ver",
    totalDeposits: "Total anticipos",
    remainingBalance: "Saldo restante",
    updating: "Actualizando...",
  },
  ar: {
    back: "رجوع",
    edit: "تعديل",
    download: "تحميل PDF",
    send: "إرسال بالبريد الإلكتروني",
    print: "طباعة",
    duplicate: "نسخ",
    convertToBC: "تحويل إلى طلب شراء",
    createDeposit: "إنشاء فاتورة دفعة مقدمة",
    markAccepted: "علامة كمقبول",
    markRejected: "علامة كمرفوض",
    client: "العميل",
    date: "التاريخ",
    validity: "الصلاحية",
    project: "المشروع",
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
    deposit: "الدفعة الأولى",
    conditions: "الشروط",
    notes: "ملاحظات",
    includes: "يشمل هذا العرض",
    excludes: "لا يشمل هذا العرض",
    footer: "إشعار قانوني",
    noItems: "لا توجد عناصر",
    DRAFT: "مسودة",
    SENT: "مرسل",
    ACCEPTED: "مقبول",
    REJECTED: "مرفوض",
    CANCELLED: "ملغي",
    convertedTo: "تم التحويل إلى",
    depositInvoices: "فواتير الدفعات المقدمة",
    noDepositInvoices: "لا توجد فواتير دفعات مقدمة",
    viewDeposit: "عرض",
    totalDeposits: "إجمالي الدفعات المقدمة",
    remainingBalance: "الرصيد المتبقي",
    updating: "جاري التحديث...",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function DevisDetailClient({ document, locale }: DevisDetailClientProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isRTL = locale === "ar";

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Calculate deposit totals
  const totalDeposits = document.depositInvoices.reduce(
    (sum, inv) => sum + Number(inv.totalTTC),
    0
  );
  const remainingBalance = Number(document.totalTTC) - totalDeposits;

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
    SENT: { bg: "bg-blue-100", text: "text-blue-700", icon: Send },
    ACCEPTED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
    REJECTED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    CANCELLED: { bg: "bg-gray-100", text: "text-gray-500", icon: XCircle },
  };

  const status = statusStyles[document.status] || statusStyles.DRAFT;
  const StatusIcon = status.icon;

  const handleMarkAccepted = async () => {
    setIsUpdatingStatus(true);
    try {
      await fetch(`/api/crm/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMarkRejected = async () => {
    setIsUpdatingStatus(true);
    try {
      await fetch(`/api/crm/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Check if we can create more deposits
  const canCreateDeposit = document.status === "ACCEPTED" && remainingBalance > 0;

  return (
    <div className={cn("space-y-6", isRTL && "rtl")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/facturation/devis`}
            className="inline-flex items-center justify-center rounded-md text-sm h-8 px-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 me-1" />
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
            href={`/${locale}/admin/facturation/devis/${document.id}/edit`}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 border-2 border-wood-primary text-wood-primary bg-transparent hover:bg-wood-primary hover:text-white h-8 px-3 text-sm rounded-md"
          >
            <Pencil className="h-4 w-4 me-1" />
            {t.edit}
          </Link>
          <a
            href={`/api/crm/documents/${document.id}/pdf`}
            download
            className="inline-flex items-center justify-center font-medium transition-all duration-200 border-2 border-wood-primary text-wood-primary bg-transparent hover:bg-wood-primary hover:text-white h-8 px-3 text-sm rounded-md gap-1.5"
          >
            <Download className="h-4 w-4 me-1" />
            {t.download}
          </a>
          <a
            href={`/api/crm/documents/${document.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 border-2 border-wood-primary text-wood-primary bg-transparent hover:bg-wood-primary hover:text-white h-8 px-3 text-sm rounded-md gap-1.5"
          >
            <Printer className="h-4 w-4 me-1" />
            {t.print}
          </a>
          {document.status === "DRAFT" && (
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 me-1" />
              {t.send}
            </Button>
          )}
          {document.status === "SENT" && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleMarkAccepted}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 me-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 me-1" />
                )}
                {isUpdatingStatus ? t.updating : t.markAccepted}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleMarkRejected}
                disabled={isUpdatingStatus}
              >
                <XCircle className="h-4 w-4 me-1" />
                {t.markRejected}
              </Button>
            </>
          )}
          {canCreateDeposit && (
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => setShowDepositModal(true)}
            >
              <Receipt className="h-4 w-4 me-1" />
              {t.createDeposit}
            </Button>
          )}
          {document.status === "ACCEPTED" && document.children.length === 0 && (
            <Button size="sm">
              <ArrowRight className="h-4 w-4 me-1" />
              {t.convertToBC}
            </Button>
          )}
        </div>
      </div>

      {/* Converted To Notice */}
      {document.children.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-400 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {t.convertedTo}:{" "}
            {document.children.map((child, i) => (
              <span key={child.id}>
                {i > 0 && ", "}
                <Link
                  href={`/${locale}/admin/facturation/${child.type.toLowerCase()}/${child.id}`}
                  className="font-medium underline hover:no-underline"
                >
                  {child.number}
                </Link>
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Deposit Invoices Section */}
      {(document.depositInvoices.length > 0 || canCreateDeposit) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t.depositInvoices}
            </h3>
            {canCreateDeposit && (
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30"
                onClick={() => setShowDepositModal(true)}
              >
                <Receipt className="h-4 w-4 me-1" />
                {t.createDeposit}
              </Button>
            )}
          </div>
          {document.depositInvoices.length === 0 ? (
            <p className="text-amber-600 dark:text-amber-400 text-sm">
              {t.noDepositInvoices}
            </p>
          ) : (
            <div className="space-y-2">
              {document.depositInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-100 dark:border-amber-800"
                >
                  <div>
                    <Link
                      href={`/${locale}/admin/facturation/factures/${inv.id}`}
                      className="font-medium text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      {inv.number}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {formatDate(inv.date)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-semibold text-amber-600">
                      {formatCurrency(Number(inv.totalTTC))}
                    </p>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      inv.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-amber-200 dark:border-amber-700">
                <span className="text-sm text-amber-700 dark:text-amber-400">{t.totalDeposits}</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {formatCurrency(totalDeposits)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-amber-700 dark:text-amber-400">{t.remainingBalance}</span>
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
            </div>
          )}
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
                    <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      {t.reference}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                      {t.designation}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {t.quantity}
                    </th>
                    <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">
                      {t.unitPrice}
                    </th>
                    <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">
                      {t.discount}
                    </th>
                    <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">
                      {t.total}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {document.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
                        <td className="px-4 py-3 text-end text-sm">
                          {formatCurrency(Number(item.unitPriceHT))}
                        </td>
                        <td className="px-4 py-3 text-end text-sm text-gray-500">
                          {item.discountPercent ? `${Number(item.discountPercent)}%` : "-"}
                        </td>
                        <td className="px-4 py-3 text-end font-medium">
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
              <div className="space-y-2 max-w-xs ms-auto">
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
                {document.depositPercent && (
                  <div className="flex justify-between text-sm text-blue-600 pt-1">
                    <span>{t.deposit} ({Number(document.depositPercent)}%)</span>
                    <span>{formatCurrency(Number(document.depositAmount))}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conditions */}
          {(document.includes?.length || document.excludes?.length || document.conditions) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t.conditions}
              </h2>

              {document.includes && document.includes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.includes}
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {document.includes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {document.excludes && document.excludes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.excludes}
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {document.excludes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {document.conditions && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.notes}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {document.conditions}
                  </p>
                </div>
              )}
            </div>
          )}
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
              {document.clientPhone && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📞 {document.clientPhone}
                </p>
              )}
              {document.clientEmail && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✉️ {document.clientEmail}
                </p>
              )}
              {document.clientIce && (
                <p className="text-sm text-gray-500">
                  ICE: {document.clientIce}
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
              <div className="flex justify-between">
                <span className="text-gray-500">{t.validity}</span>
                <span className="font-medium">{formatDate(document.validUntil)}</span>
              </div>
              {document.deliveryTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Délai</span>
                  <span className="font-medium">{document.deliveryTime}</span>
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
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Notes client</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {document.publicNotes}
                  </p>
                </div>
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

      {/* Deposit Invoice Modal */}
      <CreateDepositInvoiceModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        devisId={document.id}
        devisNumber={document.number}
        devisTotalTTC={Number(document.totalTTC)}
        existingDeposits={totalDeposits}
        defaultDepositPercent={Number(document.depositPercent) || 30}
        locale={locale}
      />
    </div>
  );
}

export default DevisDetailClient;
