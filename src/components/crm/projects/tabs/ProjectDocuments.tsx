"use client";

import { useRouter } from "next/navigation";
import { FileText, ExternalLink, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Document {
  id: string;
  documentNumber: string;
  type: string;
  status: string;
  totalHT: number;
  totalTTC: number;
  createdAt: string;
}

interface ProjectDocumentsProps {
  projectId: string;
  documents: Document[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  noDocuments: string;
  noDocumentsDescription: string;
  createQuote: string;
  viewDocument: string;
  ht: string;
  ttc: string;
  quote: string;
  purchaseOrder: string;
  deliveryNote: string;
  completionCertificate: string;
  invoice: string;
  creditNote: string;
  draft: string;
  sent: string;
  validated: string;
  paid: string;
  cancelled: string;
}

const translations: Record<string, Translations> = {
  fr: {
    noDocuments: "Aucun document",
    noDocumentsDescription: "Créez un devis pour commencer",
    createQuote: "Créer un devis",
    viewDocument: "Voir le document",
    ht: "HT",
    ttc: "TTC",
    quote: "Devis",
    purchaseOrder: "Bon de commande",
    deliveryNote: "Bon de livraison",
    completionCertificate: "PV de réception",
    invoice: "Facture",
    creditNote: "Avoir",
    draft: "Brouillon",
    sent: "Envoyé",
    validated: "Validé",
    paid: "Payé",
    cancelled: "Annulé",
  },
  en: {
    noDocuments: "No documents",
    noDocumentsDescription: "Create a quote to get started",
    createQuote: "Create quote",
    viewDocument: "View document",
    ht: "excl. VAT",
    ttc: "incl. VAT",
    quote: "Quote",
    purchaseOrder: "Purchase Order",
    deliveryNote: "Delivery Note",
    completionCertificate: "Completion Certificate",
    invoice: "Invoice",
    creditNote: "Credit Note",
    draft: "Draft",
    sent: "Sent",
    validated: "Validated",
    paid: "Paid",
    cancelled: "Cancelled",
  },
  es: {
    noDocuments: "Sin documentos",
    noDocumentsDescription: "Cree un presupuesto para comenzar",
    createQuote: "Crear presupuesto",
    viewDocument: "Ver documento",
    ht: "sin IVA",
    ttc: "con IVA",
    quote: "Presupuesto",
    purchaseOrder: "Orden de compra",
    deliveryNote: "Nota de entrega",
    completionCertificate: "Acta de recepción",
    invoice: "Factura",
    creditNote: "Nota de crédito",
    draft: "Borrador",
    sent: "Enviado",
    validated: "Validado",
    paid: "Pagado",
    cancelled: "Cancelado",
  },
  ar: {
    noDocuments: "لا وثائق",
    noDocumentsDescription: "أنشئ عرض سعر للبدء",
    createQuote: "إنشاء عرض سعر",
    viewDocument: "عرض الوثيقة",
    ht: "بدون ضريبة",
    ttc: "شامل الضريبة",
    quote: "عرض سعر",
    purchaseOrder: "أمر شراء",
    deliveryNote: "إشعار تسليم",
    completionCertificate: "محضر استلام",
    invoice: "فاتورة",
    creditNote: "إشعار دائن",
    draft: "مسودة",
    sent: "مرسل",
    validated: "مصادق عليه",
    paid: "مدفوع",
    cancelled: "ملغي",
  },
};

// ═══════════════════════════════════════════════════════════
// Document Type & Status Config
// ═══════════════════════════════════════════════════════════

const documentTypeConfig: Record<
  string,
  { icon: string; color: string; bgColor: string }
> = {
  QUOTE: {
    icon: "📋",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  PURCHASE_ORDER: {
    icon: "📦",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  DELIVERY_NOTE: {
    icon: "🚚",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  COMPLETION_CERTIFICATE: {
    icon: "✅",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  INVOICE: {
    icon: "💰",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  CREDIT_NOTE: {
    icon: "↩️",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
};

const statusConfig: Record<string, { color: string; bgColor: string }> = {
  DRAFT: {
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  SENT: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  VALIDATED: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  PAID: {
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  CANCELLED: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectDocuments({
  projectId,
  documents,
  locale,
}: ProjectDocumentsProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeMap: Record<string, keyof Translations> = {
      QUOTE: "quote",
      PURCHASE_ORDER: "purchaseOrder",
      DELIVERY_NOTE: "deliveryNote",
      COMPLETION_CERTIFICATE: "completionCertificate",
      INVOICE: "invoice",
      CREDIT_NOTE: "creditNote",
    };
    return t[typeMap[type] || "quote"];
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, keyof Translations> = {
      DRAFT: "draft",
      SENT: "sent",
      VALIDATED: "validated",
      PAID: "paid",
      CANCELLED: "cancelled",
    };
    return t[statusMap[status] || "draft"];
  };

  const getDocumentUrl = (doc: Document) => {
    const typeUrlMap: Record<string, string> = {
      QUOTE: "devis",
      PURCHASE_ORDER: "bons-commande",
      DELIVERY_NOTE: "bons-livraison",
      COMPLETION_CERTIFICATE: "pv-reception",
      INVOICE: "factures",
      CREDIT_NOTE: "avoirs",
    };
    return `/${locale}/admin/documents/${typeUrlMap[doc.type] || "devis"}/${doc.id}`;
  };

  // Group documents by type
  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="space-y-6">
      {/* Create Quote Button */}
      <div className="flex justify-end">
        <button
          onClick={() =>
            router.push(`/${locale}/admin/documents/devis/new?projectId=${projectId}`)
          }
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.createQuote}
        </button>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {t.noDocuments}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.noDocumentsDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([type, docs]) => (
            <div key={type}>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <span>{documentTypeConfig[type]?.icon || "📄"}</span>
                {getDocumentTypeLabel(type)} ({docs.length})
              </h4>

              <div className="grid gap-3">
                {docs.map((doc) => {
                  const typeConf = documentTypeConfig[doc.type] || documentTypeConfig.QUOTE;
                  const statusConf = statusConfig[doc.status] || statusConfig.DRAFT;

                  return (
                    <div
                      key={doc.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(getDocumentUrl(doc))}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                              typeConf.bgColor
                            )}
                          >
                            {documentTypeConfig[doc.type]?.icon || "📄"}
                          </div>

                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {doc.documentNumber}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(doc.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(doc.totalTTC)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatCurrency(doc.totalHT)} {t.ht}
                            </div>
                          </div>

                          <span
                            className={cn(
                              "px-2 py-1 text-xs rounded-full font-medium",
                              statusConf.bgColor,
                              statusConf.color
                            )}
                          >
                            {getStatusLabel(doc.status)}
                          </span>

                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectDocuments;
