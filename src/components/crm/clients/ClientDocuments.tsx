"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Eye,
  MoreHorizontal,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface CRMDocument {
  id: string;
  documentNumber: string;
  type: "DEVIS" | "BON_COMMANDE" | "BON_LIVRAISON" | "PV_RECEPTION" | "FACTURE" | "AVOIR";
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "PAID" | "CANCELLED";
  date: Date | string;
  validUntil?: Date | string | null;
  totalHT: number;
  totalTTC: number;
  paidAmount: number;
  balance: number;
  project?: {
    id: string;
    projectNumber: string;
    name: string;
  } | null;
  _count?: {
    items: number;
    payments: number;
  };
}

interface ClientDocumentsProps {
  documents: CRMDocument[];
  locale: string;
  clientId: string;
  onCreateDocument?: (type: string) => void;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    documents: "Documents",
    noDocuments: "Aucun document",
    createDocument: "Créer un document",
    filter: "Filtrer",
    allTypes: "Tous les types",
    allStatuses: "Tous les statuts",
    view: "Voir",
    download: "Télécharger",
    totalHT: "Total HT",
    totalTTC: "Total TTC",
    paid: "Payé",
    balance: "Solde",
    project: "Projet",
    date: "Date",
    validUntil: "Valide jusqu'au",
    DEVIS: "Devis",
    BON_COMMANDE: "Bon de commande",
    BON_LIVRAISON: "Bon de livraison",
    PV_RECEPTION: "PV réception",
    FACTURE: "Facture",
    AVOIR: "Avoir",
    DRAFT: "Brouillon",
    SENT: "Envoyé",
    ACCEPTED: "Accepté",
    REJECTED: "Refusé",
    PAID: "Payé",
    CANCELLED: "Annulé",
  },
  en: {
    documents: "Documents",
    noDocuments: "No documents",
    createDocument: "Create document",
    filter: "Filter",
    allTypes: "All types",
    allStatuses: "All statuses",
    view: "View",
    download: "Download",
    totalHT: "Subtotal",
    totalTTC: "Total",
    paid: "Paid",
    balance: "Balance",
    project: "Project",
    date: "Date",
    validUntil: "Valid until",
    DEVIS: "Quote",
    BON_COMMANDE: "Purchase order",
    BON_LIVRAISON: "Delivery note",
    PV_RECEPTION: "Receipt",
    FACTURE: "Invoice",
    AVOIR: "Credit note",
    DRAFT: "Draft",
    SENT: "Sent",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    PAID: "Paid",
    CANCELLED: "Cancelled",
  },
  es: {
    documents: "Documentos",
    noDocuments: "Sin documentos",
    createDocument: "Crear documento",
    filter: "Filtrar",
    allTypes: "Todos los tipos",
    allStatuses: "Todos los estados",
    view: "Ver",
    download: "Descargar",
    totalHT: "Subtotal",
    totalTTC: "Total",
    paid: "Pagado",
    balance: "Saldo",
    project: "Proyecto",
    date: "Fecha",
    validUntil: "Válido hasta",
    DEVIS: "Presupuesto",
    BON_COMMANDE: "Orden de compra",
    BON_LIVRAISON: "Nota de entrega",
    PV_RECEPTION: "Recibo",
    FACTURE: "Factura",
    AVOIR: "Nota de crédito",
    DRAFT: "Borrador",
    SENT: "Enviado",
    ACCEPTED: "Aceptado",
    REJECTED: "Rechazado",
    PAID: "Pagado",
    CANCELLED: "Cancelado",
  },
  ar: {
    documents: "المستندات",
    noDocuments: "لا توجد مستندات",
    createDocument: "إنشاء مستند",
    filter: "تصفية",
    allTypes: "جميع الأنواع",
    allStatuses: "جميع الحالات",
    view: "عرض",
    download: "تحميل",
    totalHT: "المجموع الفرعي",
    totalTTC: "الإجمالي",
    paid: "مدفوع",
    balance: "الرصيد",
    project: "المشروع",
    date: "التاريخ",
    validUntil: "صالح حتى",
    DEVIS: "عرض سعر",
    BON_COMMANDE: "طلب شراء",
    BON_LIVRAISON: "إشعار تسليم",
    PV_RECEPTION: "إيصال",
    FACTURE: "فاتورة",
    AVOIR: "إشعار دائن",
    DRAFT: "مسودة",
    SENT: "مرسل",
    ACCEPTED: "مقبول",
    REJECTED: "مرفوض",
    PAID: "مدفوع",
    CANCELLED: "ملغى",
  },
};

// ═══════════════════════════════════════════════════════════
// Status Configuration
// ═══════════════════════════════════════════════════════════

const statusConfig: Record<
  CRMDocument["status"],
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  DRAFT: { icon: Clock, color: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
  SENT: { icon: Clock, color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30" },
  ACCEPTED: { icon: CheckCircle, color: "text-green-500 bg-green-100 dark:bg-green-900/30" },
  REJECTED: { icon: XCircle, color: "text-red-500 bg-red-100 dark:bg-red-900/30" },
  PAID: { icon: CheckCircle, color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30" },
  CANCELLED: { icon: AlertCircle, color: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
};

const typeColors: Record<CRMDocument["type"], string> = {
  DEVIS: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  BON_COMMANDE: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
  BON_LIVRAISON: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  PV_RECEPTION: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20",
  FACTURE: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  AVOIR: "text-red-600 bg-red-50 dark:bg-red-900/20",
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ClientDocuments({
  documents,
  locale,
  clientId,
  onCreateDocument,
}: ClientDocumentsProps) {
  const t = translations[locale] || translations.fr;

  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const filteredDocuments = documents.filter((doc) => {
    if (filterType && doc.type !== filterType) return false;
    if (filterStatus && doc.status !== filterStatus) return false;
    return true;
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate totals
  const totals = filteredDocuments.reduce(
    (acc, doc) => {
      acc.totalHT += doc.totalHT;
      acc.totalTTC += doc.totalTTC;
      acc.paidAmount += doc.paidAmount;
      acc.balance += doc.balance;
      return acc;
    },
    { totalHT: 0, totalTTC: 0, paidAmount: 0, balance: 0 }
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t.allTypes}</option>
            {(["DEVIS", "BON_COMMANDE", "BON_LIVRAISON", "PV_RECEPTION", "FACTURE", "AVOIR"] as const).map(
              (type) => (
                <option key={type} value={type}>
                  {t[type]}
                </option>
              )
            )}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t.allStatuses}</option>
            {(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "PAID", "CANCELLED"] as const).map(
              (status) => (
                <option key={status} value={status}>
                  {t[status]}
                </option>
              )
            )}
          </select>
        </div>

        {/* Create Button */}
        {onCreateDocument && (
          <button
            type="button"
            onClick={() => onCreateDocument("DEVIS")}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t.createDocument}
          </button>
        )}
      </div>

      {/* Totals Summary */}
      {filteredDocuments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.totalHT}</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totals.totalHT)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.totalTTC}</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totals.totalTTC)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.paid}</p>
            <p className="font-semibold text-green-600">{formatCurrency(totals.paidAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.balance}</p>
            <p
              className={cn(
                "font-semibold",
                totals.balance > 0 ? "text-red-600" : "text-gray-900 dark:text-white"
              )}
            >
              {formatCurrency(totals.balance)}
            </p>
          </div>
        </div>
      )}

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t.noDocuments}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map((doc) => {
            const status = statusConfig[doc.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
              >
                {/* Type Badge */}
                <div
                  className={cn(
                    "flex-shrink-0 px-2 py-1 rounded text-xs font-medium",
                    typeColors[doc.type]
                  )}
                >
                  {t[doc.type]}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {doc.documentNumber}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                        status.color
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {t[doc.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(doc.date)}</span>
                    {doc.project && (
                      <span>
                        {t.project}: {doc.project.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(doc.totalTTC)}
                  </p>
                  {doc.balance > 0 && (
                    <p className="text-xs text-red-600">
                      {t.balance}: {formatCurrency(doc.balance)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/${locale}/admin/crm/documents/${doc.id}`}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t.view}
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </Link>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t.download}
                  >
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ClientDocuments;
