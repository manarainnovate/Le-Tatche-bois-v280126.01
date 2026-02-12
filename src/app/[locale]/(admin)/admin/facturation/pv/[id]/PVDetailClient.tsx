"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardCheck,
  User,
  Calendar,
  FileText,
  Printer,
  Send,
  CheckCircle,
  ArrowRight,
  XCircle,
  AlertTriangle,
  PenTool,
  Package,
  Edit,
  Receipt,
  Eye,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentStatusBadge } from "@/components/crm/documents";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type DocumentStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "CONFIRMED" | "PARTIAL" | "DELIVERED" | "SIGNED" | "PAID" | "OVERDUE" | "CANCELLED";

interface DocumentItem {
  id: string;
  catalogItemId: string | null;
  reference: string | null;
  designation: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent: number | null;
  discountAmount?: number;
  totalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTVA?: number;
  totalTTC: number;
  metadata?: Record<string, unknown> | null;
  catalogItem?: {
    id: string;
    sku: string;
    name: string;
  } | null;
}

interface Document {
  id: string;
  type: string;
  number: string;
  status: DocumentStatus;
  date: Date;
  signedDate?: Date | null;
  signedBy?: string | null;
  clientName: string;
  publicNotes?: string | null;
  internalNotes?: string | null;
  totalHT: number;
  totalTTC: number;
  client: {
    id: string;
    fullName: string;
    clientNumber: string;
    email: string | null;
    phone: string | null;
    billingAddress: string | null;
    billingCity: string | null;
    billingPostalCode: string | null;
    billingCountry: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    projectNumber: string;
  } | null;
  parent: {
    id: string;
    number: string;
    type: string;
  } | null;
  children: {
    id: string;
    number: string;
    type: string;
    status: string;
    totalTTC: number;
  }[];
  items: DocumentItem[];
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PVDetailClientProps {
  document: Document;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  back: string;
  receptionReport: string;
  print: string;
  send: string;
  edit: string;
  markSigned: string;
  createInvoice: string;
  cancel: string;
  details: string;
  client: string;
  date: string;
  signedDate: string;
  signedBy: string;
  sourceBL: string;
  project: string;
  items: string;
  reference: string;
  designation: string;
  delivered: string;
  accepted: string;
  unit: string;
  status: string;
  remarks: string;
  notes: string;
  internalNotes: string;
  relatedDocuments: string;
  invoices: string;
  createdBy: string;
  createdAt: string;
  receptionStatus: {
    conforme: string;
    nonConforme: string;
    reserve: string;
  };
  units: Record<string, string>;
  confirmSign: string;
  confirmSignMessage: string;
  confirm: string;
}

const translations: Record<string, Translations> = {
  fr: {
    back: "Retour",
    receptionReport: "PV de Réception",
    print: "Imprimer",
    send: "Envoyer",
    edit: "Modifier",
    markSigned: "Marquer signé",
    createInvoice: "Créer facture",
    cancel: "Annuler",
    details: "Détails",
    client: "Client",
    date: "Date du PV",
    signedDate: "Date de signature",
    signedBy: "Signé par",
    sourceBL: "Bon de livraison source",
    project: "Projet",
    items: "Articles réceptionnés",
    reference: "Référence",
    designation: "Désignation",
    delivered: "Livré",
    accepted: "Accepté",
    unit: "Unité",
    status: "État",
    remarks: "Remarques",
    notes: "Observations",
    internalNotes: "Notes internes",
    relatedDocuments: "Documents liés",
    invoices: "Factures",
    createdBy: "Créé par",
    createdAt: "Créé le",
    receptionStatus: {
      conforme: "Conforme",
      nonConforme: "Non conforme",
      reserve: "Avec réserves",
    },
    units: {
      PCS: "pcs",
      M2: "m²",
      ML: "ml",
      M3: "m³",
      KG: "kg",
      L: "L",
      H: "h",
      FORFAIT: "forfait",
      DAY: "jour",
    },
    confirmSign: "Confirmer la signature",
    confirmSignMessage: "Voulez-vous marquer ce PV comme signé ?",
    confirm: "Confirmer",
  },
  en: {
    back: "Back",
    receptionReport: "Reception Report",
    print: "Print",
    send: "Send",
    edit: "Edit",
    markSigned: "Mark signed",
    createInvoice: "Create invoice",
    cancel: "Cancel",
    details: "Details",
    client: "Client",
    date: "Report date",
    signedDate: "Signed date",
    signedBy: "Signed by",
    sourceBL: "Source delivery note",
    project: "Project",
    items: "Received items",
    reference: "Reference",
    designation: "Description",
    delivered: "Delivered",
    accepted: "Accepted",
    unit: "Unit",
    status: "Status",
    remarks: "Remarks",
    notes: "Observations",
    internalNotes: "Internal notes",
    relatedDocuments: "Related documents",
    invoices: "Invoices",
    createdBy: "Created by",
    createdAt: "Created at",
    receptionStatus: {
      conforme: "Conforming",
      nonConforme: "Non-conforming",
      reserve: "With reservations",
    },
    units: {
      PCS: "pcs",
      M2: "m²",
      ML: "lm",
      M3: "m³",
      KG: "kg",
      L: "L",
      H: "h",
      FORFAIT: "flat",
      DAY: "day",
    },
    confirmSign: "Confirm signature",
    confirmSignMessage: "Do you want to mark this report as signed?",
    confirm: "Confirm",
  },
  es: {
    back: "Volver",
    receptionReport: "Acta de Recepción",
    print: "Imprimir",
    send: "Enviar",
    edit: "Editar",
    markSigned: "Marcar firmado",
    createInvoice: "Crear factura",
    cancel: "Cancelar",
    details: "Detalles",
    client: "Cliente",
    date: "Fecha del acta",
    signedDate: "Fecha de firma",
    signedBy: "Firmado por",
    sourceBL: "Albarán de origen",
    project: "Proyecto",
    items: "Artículos recibidos",
    reference: "Referencia",
    designation: "Descripción",
    delivered: "Entregado",
    accepted: "Aceptado",
    unit: "Unidad",
    status: "Estado",
    remarks: "Observaciones",
    notes: "Observaciones",
    internalNotes: "Notas internas",
    relatedDocuments: "Documentos relacionados",
    invoices: "Facturas",
    createdBy: "Creado por",
    createdAt: "Creado el",
    receptionStatus: {
      conforme: "Conforme",
      nonConforme: "No conforme",
      reserve: "Con reservas",
    },
    units: {
      PCS: "pzs",
      M2: "m²",
      ML: "ml",
      M3: "m³",
      KG: "kg",
      L: "L",
      H: "h",
      FORFAIT: "tarifa",
      DAY: "día",
    },
    confirmSign: "Confirmar firma",
    confirmSignMessage: "¿Desea marcar este acta como firmada?",
    confirm: "Confirmar",
  },
  ar: {
    back: "رجوع",
    receptionReport: "محضر الاستلام",
    print: "طباعة",
    send: "إرسال",
    edit: "تعديل",
    markSigned: "تحديد كموقع",
    createInvoice: "إنشاء فاتورة",
    cancel: "إلغاء",
    details: "التفاصيل",
    client: "العميل",
    date: "تاريخ المحضر",
    signedDate: "تاريخ التوقيع",
    signedBy: "موقع من طرف",
    sourceBL: "سند التسليم المصدر",
    project: "المشروع",
    items: "العناصر المستلمة",
    reference: "المرجع",
    designation: "الوصف",
    delivered: "المُسلَّم",
    accepted: "المقبول",
    unit: "الوحدة",
    status: "الحالة",
    remarks: "ملاحظات",
    notes: "ملاحظات",
    internalNotes: "ملاحظات داخلية",
    relatedDocuments: "المستندات المرتبطة",
    invoices: "الفواتير",
    createdBy: "أنشئ بواسطة",
    createdAt: "تاريخ الإنشاء",
    receptionStatus: {
      conforme: "مطابق",
      nonConforme: "غير مطابق",
      reserve: "مع تحفظات",
    },
    units: {
      PCS: "قطعة",
      M2: "م²",
      ML: "م.ط",
      M3: "م³",
      KG: "كغ",
      L: "ل",
      H: "س",
      FORFAIT: "جزافي",
      DAY: "يوم",
    },
    confirmSign: "تأكيد التوقيع",
    confirmSignMessage: "هل تريد تحديد هذا المحضر كموقع؟",
    confirm: "تأكيد",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function PVDetailClient({ document, locale }: PVDetailClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [showConfirmSign, setShowConfirmSign] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const basePath = `/${locale}/admin/facturation/pv`;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' DH';
  };

  // ═══════════════════════════════════════════════════════════════
  // PDF HANDLERS — Use PDFKit API endpoint (NOT HTML generation)
  // ═══════════════════════════════════════════════════════════════

  // VIEW — Opens real PDF in new browser tab
  const handleView = async () => {
    setPdfLoading(true);
    try {
      const response = await fetch(`/api/crm/documents/${document.id}/pdf`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('PDF preview error:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de générer le PDF'}`);
    } finally {
      setPdfLoading(false);
    }
  };

  // DOWNLOAD — Downloads PDF file to disk
  const handleDownload = async () => {
    setPdfLoading(true);
    try {
      const response = await fetch(`/api/crm/documents/${document.id}/pdf`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `PV-${document.number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download error:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de télécharger le PDF'}`);
    } finally {
      setPdfLoading(false);
    }
  };

  // PRINT — Opens PDF then triggers print dialog
  const handlePrint = async () => {
    setPdfLoading(true);
    try {
      const response = await fetch(`/api/crm/documents/${document.id}/pdf`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Open PDF in hidden iframe and trigger print
      const iframe = window.document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      window.document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
        // Clean up after print dialog closes
        setTimeout(() => {
          window.document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 1000);
      };
    } catch (error) {
      console.error('PDF print error:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible d\'imprimer le PDF'}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleMarkSigned = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/crm/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SIGNED",
          signedDate: new Date(),
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
      setShowConfirmSign(false);
    }
  };

  const handleCreateInvoice = () => {
    router.push(`/${locale}/admin/facturation/factures/new?pvId=${document.id}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFORME":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "NON_CONFORME":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "RESERVE":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFORME":
        return t.receptionStatus.conforme;
      case "NON_CONFORME":
        return t.receptionStatus.nonConforme;
      case "RESERVE":
        return t.receptionStatus.reserve;
      default:
        return status;
    }
  };

  const canEdit = document.status === "DRAFT";
  const canSign = document.status === "SENT" || document.status === "DRAFT";
  const canCreateInvoice = document.status === "SIGNED";

  // Get related invoices
  const relatedInvoices = document.children.filter((c) => c.type === "FACTURE");

  // Count items by status
  const itemStats = {
    conforme: 0,
    nonConforme: 0,
    reserve: 0,
  };
  document.items.forEach((item) => {
    const status = (item.metadata as { status?: string })?.status;
    if (status === "CONFORME") itemStats.conforme++;
    else if (status === "NON_CONFORME") itemStats.nonConforme++;
    else if (status === "RESERVE") itemStats.reserve++;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={basePath}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-7 w-7 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.receptionReport} {document.number}
              </h1>
              <DocumentStatusBadge status={document.status as any} locale={locale} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {document.clientName} • {formatDate(document.date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* VIEW */}
          <button
            onClick={handleView}
            disabled={pdfLoading}
            className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            {pdfLoading ? 'Chargement...' : 'Aperçu'}
          </button>

          {/* DOWNLOAD */}
          <button
            onClick={handleDownload}
            disabled={pdfLoading}
            className="px-4 py-2 text-sm font-medium border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? 'Chargement...' : 'Télécharger PDF'}
          </button>

          {/* PRINT */}
          <button
            onClick={handlePrint}
            disabled={pdfLoading}
            className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            {pdfLoading ? 'Chargement...' : 'Imprimer'}
          </button>

          {canEdit && (
            <Link
              href={`${basePath}/${document.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Edit className="h-4 w-4" />
              {t.edit}
            </Link>
          )}

          {canSign && (
            <button
              onClick={() => setShowConfirmSign(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <PenTool className="h-4 w-4" />
              {t.markSigned}
            </button>
          )}

          {canCreateInvoice && (
            <button
              onClick={handleCreateInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              <Receipt className="h-4 w-4" />
              {t.createInvoice}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-600" />
                {t.items}
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {document.items.map((item) => {
                const metadata = item.metadata as {
                  quantityDelivered?: number;
                  status?: string;
                  remarks?: string;
                } | null;
                return (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-500">
                            {item.reference}
                          </span>
                          {metadata?.status && getStatusIcon(metadata.status)}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.designation}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                      </div>
                      {metadata?.status && (
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            metadata.status === "CONFORME" &&
                              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            metadata.status === "NON_CONFORME" &&
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            metadata.status === "RESERVE" &&
                              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          )}
                        >
                          {getStatusLabel(metadata.status)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">{t.delivered}:</span>{" "}
                        <span className="font-medium">
                          {metadata?.quantityDelivered || item.quantity}{" "}
                          {t.units[item.unit] || item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t.accepted}:</span>{" "}
                        <span className="font-medium">
                          {item.quantity} {t.units[item.unit] || item.unit}
                        </span>
                      </div>
                    </div>
                    {metadata?.remarks && (
                      <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 italic">
                        {t.remarks}: {metadata.remarks}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {(document.publicNotes || document.internalNotes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {document.publicNotes && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t.notes}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {document.publicNotes}
                  </p>
                </div>
              )}
              {document.internalNotes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    {t.internalNotes}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-wrap">
                    {document.internalNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              {t.details}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t.client}</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <Link
                    href={`/${locale}/admin/crm/clients/${document.client?.id}`}
                    className="text-sm font-medium text-amber-600 hover:underline"
                  >
                    {document.clientName}
                  </Link>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t.date}</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(document.date)}</span>
                </div>
              </div>

              {document.signedDate && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.signedDate}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <PenTool className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(document.signedDate)}</span>
                  </div>
                </div>
              )}

              {document.signedBy && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.signedBy}
                  </label>
                  <p className="text-sm mt-1">{document.signedBy}</p>
                </div>
              )}

              {document.parent && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.sourceBL}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <Link
                      href={`/${locale}/admin/facturation/bl/${document.parent.id}`}
                      className="text-sm font-mono text-blue-600 hover:underline"
                    >
                      {document.parent.number}
                    </Link>
                  </div>
                </div>
              )}

              {document.createdBy && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.createdBy}
                  </label>
                  <p className="text-sm mt-1">
                    {document.createdBy.name || document.createdBy.email}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  {t.createdAt}
                </label>
                <p className="text-sm mt-1">{formatDate(document.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Résumé
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Articles</span>
                <span className="font-medium">{document.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {t.receptionStatus.conforme}
                </span>
                <span className="font-medium">{itemStats.conforme}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  {t.receptionStatus.reserve}
                </span>
                <span className="font-medium">{itemStats.reserve}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  {t.receptionStatus.nonConforme}
                </span>
                <span className="font-medium">{itemStats.nonConforme}</span>
              </div>
            </div>
          </div>

          {/* Related Documents */}
          {relatedInvoices.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                {t.relatedDocuments}
              </h3>
              <div className="space-y-2">
                {relatedInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/${locale}/admin/facturation/factures/${invoice.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-blue-500" />
                      <span className="font-mono text-sm">{invoice.number}</span>
                    </div>
                    <DocumentStatusBadge status={invoice.status as any} locale={locale} size="sm" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Sign Modal */}
      {showConfirmSign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t.confirmSign}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.confirmSignMessage}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmSign(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleMarkSigned}
                disabled={updating}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
