"use client";

import Link from "next/link";
import {
  Calendar,
  User,
  FolderOpen,
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  Send,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { DocumentTypeBadge } from "./DocumentTypeBadge";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type DocumentType =
  | "DEVIS"
  | "BON_COMMANDE"
  | "BON_LIVRAISON"
  | "PV_RECEPTION"
  | "FACTURE"
  | "AVOIR";

type DocumentStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "CONFIRMED"
  | "PARTIAL"
  | "DELIVERED"
  | "SIGNED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

interface Document {
  id: string;
  type: DocumentType;
  number: string;
  status: DocumentStatus;
  date: string;
  validUntil?: string | null;
  dueDate?: string | null;
  clientName: string;
  totalTTC: number;
  paidAmount: number;
  balance: number;
  client?: {
    id: string;
    name: string;
    clientNumber: string;
  };
  project?: {
    id: string;
    name: string;
    projectNumber: string;
  } | null;
  _count?: {
    items: number;
    payments: number;
  };
}

interface DocumentCardProps {
  document: Document;
  locale: string;
  onClick?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onPrint?: () => void;
  onSend?: () => void;
  onConvert?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  view: string;
  edit: string;
  print: string;
  send: string;
  convert: string;
  delete: string;
  items: string;
  paid: string;
  remaining: string;
  overdue: string;
  validUntil: string;
  dueDate: string;
}

const translations: Record<string, Translations> = {
  fr: {
    view: "Voir",
    edit: "Modifier",
    print: "Imprimer",
    send: "Envoyer",
    convert: "Convertir",
    delete: "Supprimer",
    items: "articles",
    paid: "Payé",
    remaining: "Reste à payer",
    overdue: "En retard",
    validUntil: "Valide jusqu'au",
    dueDate: "Échéance",
  },
  en: {
    view: "View",
    edit: "Edit",
    print: "Print",
    send: "Send",
    convert: "Convert",
    delete: "Delete",
    items: "items",
    paid: "Paid",
    remaining: "Balance due",
    overdue: "Overdue",
    validUntil: "Valid until",
    dueDate: "Due date",
  },
  es: {
    view: "Ver",
    edit: "Editar",
    print: "Imprimir",
    send: "Enviar",
    convert: "Convertir",
    delete: "Eliminar",
    items: "artículos",
    paid: "Pagado",
    remaining: "Pendiente",
    overdue: "Vencido",
    validUntil: "Válido hasta",
    dueDate: "Vencimiento",
  },
  ar: {
    view: "عرض",
    edit: "تعديل",
    print: "طباعة",
    send: "إرسال",
    convert: "تحويل",
    delete: "حذف",
    items: "عناصر",
    paid: "مدفوع",
    remaining: "المتبقي",
    overdue: "متأخر",
    validUntil: "صالح حتى",
    dueDate: "تاريخ الاستحقاق",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function DocumentCard({
  document,
  locale,
  onClick,
  onView,
  onEdit,
  onPrint,
  onSend,
  onConvert,
  onDelete,
  compact = false,
}: DocumentCardProps) {
  const t = translations[locale] || translations.fr;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const isOverdue =
    document.dueDate &&
    new Date(document.dueDate) < new Date() &&
    document.status !== "PAID" &&
    document.type === "FACTURE";

  const showPaymentInfo = ["FACTURE"].includes(document.type);
  const canConvert =
    (document.type === "DEVIS" && document.status === "ACCEPTED") ||
    (document.type === "BON_COMMANDE" && ["CONFIRMED", "PARTIAL"].includes(document.status)) ||
    (document.type === "BON_LIVRAISON" && ["DELIVERED", "PARTIAL"].includes(document.status)) ||
    (document.type === "PV_RECEPTION" && document.status === "SIGNED") ||
    (document.type === "FACTURE" && ["PAID", "PARTIAL", "OVERDUE"].includes(document.status));

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all cursor-pointer group",
        "hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600",
        isOverdue && "border-red-300 dark:border-red-600"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <DocumentTypeBadge type={document.type} locale={locale} variant="pill" size="sm" />
          <div>
            <h4 className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
              {document.number}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(document.date)}
            </p>
          </div>
        </div>
        <DocumentStatusBadge status={document.status} locale={locale} size="sm" />
      </div>

      {/* Client */}
      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <User className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{document.clientName}</span>
      </div>

      {/* Project */}
      {document.project && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{document.project.name}</span>
        </div>
      )}

      {!compact && (
        <>
          {/* Validity / Due Date */}
          {(document.validUntil || document.dueDate) && (
            <div
              className={cn(
                "text-xs mb-2",
                isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
              )}
            >
              {document.type === "DEVIS" && document.validUntil && (
                <span>
                  {t.validUntil}: {formatDate(document.validUntil)}
                </span>
              )}
              {document.type === "FACTURE" && document.dueDate && (
                <span>
                  {t.dueDate}: {formatDate(document.dueDate)}
                </span>
              )}
            </div>
          )}

          {/* Totals */}
          <div className="flex items-baseline justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {document._count?.items || 0} {t.items}
            </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(document.totalTTC)}
            </span>
          </div>

          {/* Payment Info for Invoices */}
          {showPaymentInfo && document.paidAmount > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-600 dark:text-green-400">{t.paid}</span>
                <span className="text-green-600 dark:text-green-400">
                  {formatCurrency(document.paidAmount)}
                </span>
              </div>
              {document.balance > 0 && (
                <div className="flex justify-between text-xs">
                  <span
                    className={cn(
                      isOverdue
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {t.remaining}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      isOverdue
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {formatCurrency(document.balance)}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
        {onView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title={t.view}
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        {onEdit && document.status === "DRAFT" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
            title={t.edit}
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        {onPrint && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrint();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={t.print}
          >
            <Printer className="h-4 w-4" />
          </button>
        )}
        {onSend && ["DRAFT", "SENT"].includes(document.status) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSend();
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title={t.send}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
        {onConvert && canConvert && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConvert();
            }}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
            title={t.convert}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
        {onDelete && document.status === "DRAFT" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default DocumentCard;
