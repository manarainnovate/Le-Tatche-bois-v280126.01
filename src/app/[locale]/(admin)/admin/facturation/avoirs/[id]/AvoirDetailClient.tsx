"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCcw,
  User,
  Calendar,
  FileText,
  Printer,
  Send,
  Edit,
  Package,
  CheckCircle,
  Building,
  Loader2,
  Eye,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentStatusBadge } from "@/components/crm/documents";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

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
  discountAmount: number;
  totalHT: number;
  tvaRate: number;
  totalTVA: number;
  totalTTC: number;
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
  clientName: string;
  publicNotes: string | null;
  internalNotes: string | null;
  totalHT: number;
  discountAmount: number;
  discountValue: number | null;
  netHT: number;
  totalTVA: number;
  totalTTC: number;
  paidAmount: number;
  balance: number;
  client: {
    id: string;
    fullName: string;
    clientNumber: string;
    email: string | null;
    phone: string;
    billingAddress: string | null;
    billingCity: string | null;
    billingPostalCode: string | null;
    billingCountry: string;
    ice: string | null;
    rc: string | null;
    taxId: string | null;
  };
  project: {
    id: string;
    name: string;
    projectNumber: string;
  } | null;
  parent: {
    id: string;
    number: string;
    type: string;
    totalTTC: number;
  } | null;
  items: DocumentItem[];
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AvoirDetailClientProps {
  document: Document;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  back: string;
  creditNote: string;
  print: string;
  send: string;
  edit: string;
  markRefunded: string;
  details: string;
  client: string;
  date: string;
  sourceInvoice: string;
  project: string;
  legalInfo: string;
  ice: string;
  rc: string;
  if: string;
  patente: string;
  items: string;
  reference: string;
  designation: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  discount: string;
  total: string;
  totals: {
    totalHT: string;
    discount: string;
    netHT: string;
    tva: string;
    totalTTC: string;
  };
  notes: string;
  internalNotes: string;
  createdBy: string;
  createdAt: string;
  refundReason: string;
  cancel: string;
  confirm: string;
  confirmRefund: string;
  confirmRefundMessage: string;
  units: Record<string, string>;
}

const translations: Record<string, Translations> = {
  fr: {
    back: "Retour",
    creditNote: "Avoir",
    print: "Imprimer",
    send: "Envoyer",
    edit: "Modifier",
    markRefunded: "Marquer remboursé",
    details: "Détails",
    client: "Client",
    date: "Date de l'avoir",
    sourceInvoice: "Facture d'origine",
    project: "Projet",
    legalInfo: "Informations légales",
    ice: "ICE",
    rc: "RC",
    if: "IF",
    patente: "Patente",
    items: "Articles",
    reference: "Référence",
    designation: "Désignation",
    quantity: "Quantité",
    unit: "Unité",
    unitPrice: "PU HT",
    discount: "Remise",
    total: "Total HT",
    totals: {
      totalHT: "Total HT",
      discount: "Remise",
      netHT: "Net HT",
      tva: "TVA",
      totalTTC: "Total TTC",
    },
    notes: "Motif de l'avoir",
    internalNotes: "Notes internes",
    createdBy: "Créé par",
    createdAt: "Créé le",
    refundReason: "Motif",
    cancel: "Annuler",
    confirm: "Confirmer",
    confirmRefund: "Confirmer le remboursement",
    confirmRefundMessage: "Voulez-vous marquer cet avoir comme remboursé ?",
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
  },
  en: {
    back: "Back",
    creditNote: "Credit Note",
    print: "Print",
    send: "Send",
    edit: "Edit",
    markRefunded: "Mark refunded",
    details: "Details",
    client: "Client",
    date: "Credit note date",
    sourceInvoice: "Original invoice",
    project: "Project",
    legalInfo: "Legal information",
    ice: "Tax ID",
    rc: "Business Reg.",
    if: "Tax No.",
    patente: "Trade License",
    items: "Items",
    reference: "Reference",
    designation: "Description",
    quantity: "Quantity",
    unit: "Unit",
    unitPrice: "Unit price",
    discount: "Discount",
    total: "Total",
    totals: {
      totalHT: "Subtotal",
      discount: "Discount",
      netHT: "Net",
      tva: "VAT",
      totalTTC: "Total incl. VAT",
    },
    notes: "Credit note reason",
    internalNotes: "Internal notes",
    createdBy: "Created by",
    createdAt: "Created at",
    refundReason: "Reason",
    cancel: "Cancel",
    confirm: "Confirm",
    confirmRefund: "Confirm refund",
    confirmRefundMessage: "Do you want to mark this credit note as refunded?",
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
  },
  es: {
    back: "Volver",
    creditNote: "Abono",
    print: "Imprimir",
    send: "Enviar",
    edit: "Editar",
    markRefunded: "Marcar reembolsado",
    details: "Detalles",
    client: "Cliente",
    date: "Fecha del abono",
    sourceInvoice: "Factura original",
    project: "Proyecto",
    legalInfo: "Información legal",
    ice: "NIF",
    rc: "Reg. Mercantil",
    if: "CIF",
    patente: "Licencia",
    items: "Artículos",
    reference: "Referencia",
    designation: "Descripción",
    quantity: "Cantidad",
    unit: "Unidad",
    unitPrice: "Precio unit.",
    discount: "Descuento",
    total: "Total",
    totals: {
      totalHT: "Subtotal",
      discount: "Descuento",
      netHT: "Neto",
      tva: "IVA",
      totalTTC: "Total con IVA",
    },
    notes: "Motivo del abono",
    internalNotes: "Notas internas",
    createdBy: "Creado por",
    createdAt: "Creado el",
    refundReason: "Motivo",
    cancel: "Cancelar",
    confirm: "Confirmar",
    confirmRefund: "Confirmar reembolso",
    confirmRefundMessage: "¿Desea marcar este abono como reembolsado?",
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
  },
  ar: {
    back: "رجوع",
    creditNote: "إشعار دائن",
    print: "طباعة",
    send: "إرسال",
    edit: "تعديل",
    markRefunded: "تحديد كمسترد",
    details: "التفاصيل",
    client: "العميل",
    date: "تاريخ الإشعار",
    sourceInvoice: "الفاتورة الأصلية",
    project: "المشروع",
    legalInfo: "المعلومات القانونية",
    ice: "ICE",
    rc: "RC",
    if: "IF",
    patente: "الضريبة المهنية",
    items: "العناصر",
    reference: "المرجع",
    designation: "الوصف",
    quantity: "الكمية",
    unit: "الوحدة",
    unitPrice: "سعر الوحدة",
    discount: "الخصم",
    total: "الإجمالي",
    totals: {
      totalHT: "المجموع بدون ضريبة",
      discount: "الخصم",
      netHT: "الصافي",
      tva: "الضريبة",
      totalTTC: "المجموع مع الضريبة",
    },
    notes: "سبب الإشعار الدائن",
    internalNotes: "ملاحظات داخلية",
    createdBy: "أنشئ بواسطة",
    createdAt: "تاريخ الإنشاء",
    refundReason: "السبب",
    cancel: "إلغاء",
    confirm: "تأكيد",
    confirmRefund: "تأكيد الاسترداد",
    confirmRefundMessage: "هل تريد تحديد هذا الإشعار الدائن كمسترد؟",
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
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function AvoirDetailClient({ document, locale }: AvoirDetailClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [showConfirmRefund, setShowConfirmRefund] = useState(false);
  const [updating, setUpdating] = useState(false);

  const basePath = `/${locale}/admin/facturation/avoirs`;

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const canEdit = document.status === "DRAFT";
  const canMarkRefunded = document.status === "SENT";

  // Helper function to convert number to French words
  function numberToFrenchWords(n: number): string {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
      'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

    if (n === 0) return 'zéro';

    function convert(num: number): string {
      if (num < 20) return units[num];
      if (num < 100) {
        const t = Math.floor(num / 10);
        const u = num % 10;
        if (t === 7 || t === 9) return tens[t] + '-' + units[10 + u];
        if (u === 0) return tens[t] + (t === 8 ? 's' : '');
        if (u === 1 && t !== 8) return tens[t] + ' et un';
        return tens[t] + '-' + units[u];
      }
      if (num < 1000) {
        const h = Math.floor(num / 100);
        const rest = num % 100;
        let str = h === 1 ? 'cent' : units[h] + ' cent';
        if (rest === 0 && h > 1) str += 's';
        if (rest > 0) str += ' ' + convert(rest);
        return str;
      }
      if (num < 1000000) {
        const t = Math.floor(num / 1000);
        const rest = num % 1000;
        let str = t === 1 ? 'mille' : convert(t) + ' mille';
        if (rest > 0) str += ' ' + convert(rest);
        return str;
      }
      const m = Math.floor(num / 1000000);
      const rest = num % 1000000;
      let str = convert(m) + (m === 1 ? ' million' : ' millions');
      if (rest > 0) str += ' ' + convert(rest);
      return str;
    }

    const intPart = Math.floor(n);
    const decPart = Math.round((n - intPart) * 100);

    let result = convert(intPart) + ' dirhams';
    if (decPart > 0) result += ' et ' + convert(decPart) + ' centimes';

    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  // Generate document HTML for printing/viewing
  const generateDocumentHTML = () => {
    const lineItemsHTML = document.items.map(item => `
      <tr>
        <td>${item.designation}</td>
        <td style="text-align:right;">${item.quantity}</td>
        <td style="text-align:right;">${formatCurrency(item.unitPriceHT)}</td>
        <td style="text-align:right;">${formatCurrency(item.totalHT)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>AVOIR ${document.number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Georgia, serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #dc2626; }
          .logo { font-size: 24px; font-weight: bold; color: #dc2626; }
          .company-info { font-size: 12px; color: #666; margin-top: 8px; }
          .doc-info { text-align: right; }
          .doc-title { font-size: 22px; color: #dc2626; margin-bottom: 8px; font-weight: bold; }
          .doc-number { font-size: 16px; color: #333; }
          .client-section { margin: 30px 0; padding: 20px; background: #fef2f2; border-left: 4px solid #dc2626; }
          .section-title { font-size: 14px; font-weight: bold; color: #dc2626; margin-bottom: 10px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          thead { background: #dc2626; color: white; }
          th { padding: 12px; text-align: left; font-size: 12px; font-weight: 600; }
          td { padding: 10px; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
          tbody tr:hover { background: #fef2f2; }
          .totals { margin: 30px 0; padding: 20px; background: #fef2f2; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; color: #dc2626; }
          .total-row.grand { font-size: 18px; font-weight: bold; color: #dc2626; border-top: 2px solid #dc2626; padding-top: 12px; margin-top: 12px; }
          .amount-words { margin-top: 12px; padding: 12px; background: white; border: 1px solid #ddd; border-radius: 4px; font-style: italic; font-size: 13px; color: #666; }
          .notes { margin: 30px 0; padding: 15px; background: #fffbf5; border-left: 4px solid #f59e0b; font-size: 13px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 11px; }
          @media print {
            body { padding: 20px; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">LE TATCHE BOIS</div>
            <div class="company-info">
              <p>Artisan Menuisier au Maroc</p>
              <p>Email: contact@letatchebois.com</p>
              <p>Tél: +212 XXX XXX XXX</p>
            </div>
          </div>
          <div class="doc-info">
            <div class="doc-title">AVOIR</div>
            <div class="doc-number">N° ${document.number}</div>
            <p style="margin-top: 10px; font-size: 12px;">Date: ${new Date(document.date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div class="client-section">
          <div class="section-title">Client</div>
          <p><strong>${document.client.fullName}</strong></p>
          <p style="font-size: 12px; color: #666;">N° Client: ${document.client.clientNumber}</p>
          ${document.client.billingAddress ? `<p style="font-size: 12px; margin-top: 5px;">${document.client.billingAddress}</p>` : ''}
          ${document.client.billingCity ? `<p style="font-size: 12px;">${document.client.billingPostalCode || ''} ${document.client.billingCity}</p>` : ''}
          ${document.client.ice ? `<p style="font-size: 12px; margin-top: 5px;">ICE: ${document.client.ice}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Désignation</th>
              <th style="text-align:right; width:80px;">Qté</th>
              <th style="text-align:right; width:100px;">P.U. HT</th>
              <th style="text-align:right; width:120px;">Total HT</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Sous-total HT:</span>
            <span>-${formatCurrency(document.totalHT)}</span>
          </div>
          ${document.discountAmount > 0 ? `
          <div class="total-row">
            <span>Remise:</span>
            <span>${formatCurrency(document.discountAmount)}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>Net HT:</span>
            <span>-${formatCurrency(document.netHT)}</span>
          </div>
          <div class="total-row">
            <span>Total TVA:</span>
            <span>-${formatCurrency(document.totalTVA)}</span>
          </div>
          <div class="total-row grand">
            <span>TOTAL TTC:</span>
            <span>-${formatCurrency(document.totalTTC)}</span>
          </div>
          ${document.totalTTC > 0 ? `
          <div class="amount-words">
            Montant en lettres: ${numberToFrenchWords(document.totalTTC)}
          </div>
          ` : ''}
        </div>

        ${document.publicNotes ? `
        <div class="notes">
          <div class="section-title">Motif de l'avoir</div>
          <p>${document.publicNotes.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p><strong>LE TATCHE BOIS</strong> - Artisanat du bois marocain</p>
          <p>letatchebois.com | contact@letatchebois.com</p>
        </div>
      </body>
      </html>
    `;
  };

  // VIEW - Open in new tab as clean printable HTML
  const handleView = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateDocumentHTML());
      printWindow.document.close();
    }
  };

  // DOWNLOAD - Trigger print with PDF option
  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateDocumentHTML());
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // PRINT - Direct print using iframe
  const handlePrint = () => {
    const iframe = window.document.createElement('iframe');
    iframe.style.display = 'none';
    window.document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.write(generateDocumentHTML());
      iframeDoc.close();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => window.document.body.removeChild(iframe), 1000);
    }
  };

  const handleMarkRefunded = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/crm/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REFUNDED" }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
      setShowConfirmRefund(false);
    }
  };

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
              <RefreshCcw className="h-7 w-7 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.creditNote} {document.number}
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
            className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <Eye className="w-4 h-4" />
            Aperçu
          </button>

          {/* DOWNLOAD */}
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-medium border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </button>

          {/* PRINT */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimer
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

          {canMarkRefunded && (
            <button
              onClick={() => setShowConfirmRefund(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              {t.markRefunded}
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
                <Package className="h-5 w-5 text-red-600" />
                {t.items}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      {t.reference}
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      {t.designation}
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      {t.quantity}
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      {t.unitPrice}
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      {t.total}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {document.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                        {item.reference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.designation}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        {item.quantity} {t.units[item.unit] || item.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {formatCurrency(item.unitPriceHT)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-red-600">
                        -{formatCurrency(item.totalHT)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-red-50 dark:bg-red-900/10 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.totals.totalHT}</span>
                    <span className="text-red-600">-{formatCurrency(document.totalHT)}</span>
                  </div>
                  {document.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.totals.discount}</span>
                      <span>{formatCurrency(document.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.totals.tva}</span>
                    <span className="text-red-600">-{formatCurrency(document.totalTVA)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-red-200 dark:border-red-800">
                    <span className="font-semibold">{t.totals.totalTTC}</span>
                    <span className="text-xl font-bold text-red-600">
                      -{formatCurrency(document.totalTTC)}
                    </span>
                  </div>
                </div>
              </div>
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

              {document.parent && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.sourceInvoice}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <Link
                      href={`/${locale}/admin/facturation/factures/${document.parent.id}`}
                      className="text-sm font-mono text-blue-600 hover:underline"
                    >
                      {document.parent.number}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Montant: {formatCurrency(document.parent.totalTTC)}
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

          {/* Client Legal Info */}
          {(document.client.ice || document.client.rc || document.client.taxId) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building className="h-4 w-4 text-amber-600" />
                {t.legalInfo}
              </h3>
              <div className="space-y-2 text-sm">
                {document.client.ice && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.ice}</span>
                    <span className="font-mono">{document.client.ice}</span>
                  </div>
                )}
                {document.client.rc && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.rc}</span>
                    <span className="font-mono">{document.client.rc}</span>
                  </div>
                )}
                {document.client.taxId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.if}</span>
                    <span className="font-mono">{document.client.taxId}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Refund Modal */}
      {showConfirmRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t.confirmRefund}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.confirmRefundMessage}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmRefund(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleMarkRefunded}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
