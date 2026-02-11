"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  User,
  Calendar,
  FileText,
  Printer,
  Send,
  CheckCircle,
  ArrowRight,
  MoreHorizontal,
  MapPin,
  Package,
  Download,
  Edit,
  X,
  ClipboardCheck,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentStatusBadge } from "@/components/crm/documents";
import { useCurrency } from "@/stores/currency";

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
  deliveryDate: Date | null;
  deliveryAddress: string | null;
  clientName: string;
  publicNotes: string | null;
  internalNotes: string | null;
  totalHT: number;
  discountAmount: number;
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

interface BLDetailClientProps {
  document: Document;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  back: string;
  deliveryNote: string;
  print: string;
  download: string;
  send: string;
  edit: string;
  markDelivered: string;
  createPV: string;
  moreActions: string;
  cancel: string;
  details: string;
  client: string;
  date: string;
  deliveryDate: string;
  deliveryAddress: string;
  sourceBC: string;
  project: string;
  status: string;
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
  relatedDocuments: string;
  pvReception: string;
  createdBy: string;
  createdAt: string;
  units: Record<string, string>;
  confirmDelivery: string;
  confirmDeliveryMessage: string;
  confirm: string;
}

const translations: Record<string, Translations> = {
  fr: {
    back: "Retour",
    deliveryNote: "Bon de Livraison",
    print: "Imprimer",
    download: "Télécharger PDF",
    send: "Envoyer",
    edit: "Modifier",
    markDelivered: "Marquer livré",
    createPV: "Créer PV de réception",
    moreActions: "Plus d'actions",
    cancel: "Annuler",
    details: "Détails",
    client: "Client",
    date: "Date du BL",
    deliveryDate: "Date de livraison",
    deliveryAddress: "Adresse de livraison",
    sourceBC: "Bon de commande source",
    project: "Projet",
    status: "Statut",
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
    notes: "Notes",
    internalNotes: "Notes internes",
    relatedDocuments: "Documents liés",
    pvReception: "PV de réception",
    createdBy: "Créé par",
    createdAt: "Créé le",
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
    confirmDelivery: "Confirmer la livraison",
    confirmDeliveryMessage: "Voulez-vous marquer ce bon de livraison comme livré ?",
    confirm: "Confirmer",
  },
  en: {
    back: "Back",
    deliveryNote: "Delivery Note",
    print: "Print",
    download: "Download PDF",
    send: "Send",
    edit: "Edit",
    markDelivered: "Mark delivered",
    createPV: "Create receipt",
    moreActions: "More actions",
    cancel: "Cancel",
    details: "Details",
    client: "Client",
    date: "Delivery note date",
    deliveryDate: "Delivery date",
    deliveryAddress: "Delivery address",
    sourceBC: "Source purchase order",
    project: "Project",
    status: "Status",
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
    notes: "Notes",
    internalNotes: "Internal notes",
    relatedDocuments: "Related documents",
    pvReception: "Reception report",
    createdBy: "Created by",
    createdAt: "Created at",
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
    confirmDelivery: "Confirm delivery",
    confirmDeliveryMessage: "Do you want to mark this delivery note as delivered?",
    confirm: "Confirm",
  },
  es: {
    back: "Volver",
    deliveryNote: "Albarán",
    print: "Imprimir",
    download: "Descargar PDF",
    send: "Enviar",
    edit: "Editar",
    markDelivered: "Marcar entregado",
    createPV: "Crear recepción",
    moreActions: "Más acciones",
    cancel: "Cancelar",
    details: "Detalles",
    client: "Cliente",
    date: "Fecha del albarán",
    deliveryDate: "Fecha de entrega",
    deliveryAddress: "Dirección de entrega",
    sourceBC: "Pedido de origen",
    project: "Proyecto",
    status: "Estado",
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
    notes: "Notas",
    internalNotes: "Notas internas",
    relatedDocuments: "Documentos relacionados",
    pvReception: "Acta de recepción",
    createdBy: "Creado por",
    createdAt: "Creado el",
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
    confirmDelivery: "Confirmar entrega",
    confirmDeliveryMessage: "¿Desea marcar este albarán como entregado?",
    confirm: "Confirmar",
  },
  ar: {
    back: "رجوع",
    deliveryNote: "سند التسليم",
    print: "طباعة",
    download: "تحميل PDF",
    send: "إرسال",
    edit: "تعديل",
    markDelivered: "تحديد كمُسلَّم",
    createPV: "إنشاء محضر استلام",
    moreActions: "المزيد",
    cancel: "إلغاء",
    details: "التفاصيل",
    client: "العميل",
    date: "تاريخ السند",
    deliveryDate: "تاريخ التسليم",
    deliveryAddress: "عنوان التسليم",
    sourceBC: "أمر الشراء المصدر",
    project: "المشروع",
    status: "الحالة",
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
    notes: "ملاحظات",
    internalNotes: "ملاحظات داخلية",
    relatedDocuments: "المستندات المرتبطة",
    pvReception: "محضر الاستلام",
    createdBy: "أنشئ بواسطة",
    createdAt: "تاريخ الإنشاء",
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
    confirmDelivery: "تأكيد التسليم",
    confirmDeliveryMessage: "هل تريد تحديد سند التسليم هذا كمُسلَّم؟",
    confirm: "تأكيد",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function BLDetailClient({ document, locale }: BLDetailClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [showActions, setShowActions] = useState(false);
  const [showConfirmDelivery, setShowConfirmDelivery] = useState(false);
  const [updating, setUpdating] = useState(false);

  const basePath = `/${locale}/admin/facturation/bl`;

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

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
        <title>BON DE LIVRAISON ${document.number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Georgia, serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #6B3A1F; }
          .logo { font-size: 24px; font-weight: bold; color: #6B3A1F; }
          .company-info { font-size: 12px; color: #666; margin-top: 8px; }
          .doc-info { text-align: right; }
          .doc-title { font-size: 22px; color: #6B3A1F; margin-bottom: 8px; font-weight: bold; }
          .doc-number { font-size: 16px; color: #333; }
          .client-section { margin: 30px 0; padding: 20px; background: #f9f6f3; border-left: 4px solid #6B3A1F; }
          .section-title { font-size: 14px; font-weight: bold; color: #6B3A1F; margin-bottom: 10px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          thead { background: #6B3A1F; color: white; }
          th { padding: 12px; text-align: left; font-size: 12px; font-weight: 600; }
          td { padding: 10px; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
          tbody tr:hover { background: #f9f6f3; }
          .totals { margin: 30px 0; padding: 20px; background: #f9f6f3; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row.grand { font-size: 18px; font-weight: bold; color: #6B3A1F; border-top: 2px solid #6B3A1F; padding-top: 12px; margin-top: 12px; }
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
            <div class="doc-title">BON DE LIVRAISON</div>
            <div class="doc-number">N° ${document.number}</div>
            <p style="margin-top: 10px; font-size: 12px;">Date: ${new Date(document.date).toLocaleDateString('fr-FR')}</p>
            ${document.deliveryDate ? `<p style="font-size: 12px;">Livraison: ${new Date(document.deliveryDate).toLocaleDateString('fr-FR')}</p>` : ''}
          </div>
        </div>

        <div class="client-section">
          <div class="section-title">Client</div>
          <p><strong>${document.client.fullName}</strong></p>
          <p style="font-size: 12px; color: #666;">N° Client: ${document.client.clientNumber}</p>
          ${document.deliveryAddress ? `<p style="font-size: 12px; margin-top: 5px;">Adresse de livraison: ${document.deliveryAddress}</p>` : ''}
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
            <span>${formatCurrency(document.totalHT)}</span>
          </div>
          ${document.discountAmount > 0 ? `
          <div class="total-row" style="color: #dc2626;">
            <span>Remise:</span>
            <span>-${formatCurrency(document.discountAmount)}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>Net HT:</span>
            <span>${formatCurrency(document.netHT)}</span>
          </div>
          <div class="total-row">
            <span>Total TVA:</span>
            <span>${formatCurrency(document.totalTVA)}</span>
          </div>
          <div class="total-row grand">
            <span>TOTAL TTC:</span>
            <span>${formatCurrency(document.totalTTC)}</span>
          </div>
          ${document.totalTTC > 0 ? `
          <div class="amount-words">
            Montant en lettres: ${numberToFrenchWords(document.totalTTC)}
          </div>
          ` : ''}
        </div>

        ${document.publicNotes ? `
        <div class="notes">
          <div class="section-title">Notes</div>
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

  const handleMarkDelivered = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/crm/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELIVERED" }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
      setShowConfirmDelivery(false);
    }
  };

  const handleCreatePV = () => {
    router.push(`/${locale}/admin/facturation/pv/new?blId=${document.id}`);
  };

  const canEdit = document.status === "DRAFT";
  const canMarkDelivered = document.status === "SENT" || document.status === "PARTIAL";
  const canCreatePV = document.status === "DELIVERED" || document.status === "PARTIAL";

  // Get related PVs
  const relatedPVs = document.children.filter((c) => c.type === "PV_RECEPTION");

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
              <Truck className="h-7 w-7 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.deliveryNote} {document.number}
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

          {canMarkDelivered && (
            <button
              onClick={() => setShowConfirmDelivery(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              {t.markDelivered}
            </button>
          )}

          {canCreatePV && (
            <button
              onClick={handleCreatePV}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              <ClipboardCheck className="h-4 w-4" />
              {t.createPV}
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
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      {t.unit}
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
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-500">
                        {t.units[item.unit] || item.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {formatCurrency(item.unitPriceHT)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold">
                        {formatCurrency(item.totalHT)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.totals.totalHT}</span>
                    <span>{formatCurrency(document.totalHT)}</span>
                  </div>
                  {document.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>{t.totals.discount}</span>
                      <span>-{formatCurrency(document.discountAmount)}</span>
                    </div>
                  )}
                  {document.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t.totals.netHT}</span>
                      <span>{formatCurrency(document.netHT)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.totals.tva}</span>
                    <span>{formatCurrency(document.totalTVA)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold">{t.totals.totalTTC}</span>
                    <span className="text-lg font-bold text-amber-600">
                      {formatCurrency(document.totalTTC)}
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
                {document.client && (
                  <div className="text-xs text-gray-500 mt-1">
                    {document.client.clientNumber}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t.date}</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(document.date)}</span>
                </div>
              </div>

              {document.deliveryDate && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.deliveryDate}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(document.deliveryDate)}</span>
                  </div>
                </div>
              )}

              {document.deliveryAddress && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.deliveryAddress}
                  </label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{document.deliveryAddress}</span>
                  </div>
                </div>
              )}

              {document.parent && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.sourceBC}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <Link
                      href={`/${locale}/admin/bons-commande/${document.parent.id}`}
                      className="text-sm font-mono text-blue-600 hover:underline"
                    >
                      {document.parent.number}
                    </Link>
                  </div>
                </div>
              )}

              {document.project && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.project}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <Link
                      href={`/${locale}/admin/crm/projets/${document.project.id}`}
                      className="text-sm text-amber-600 hover:underline"
                    >
                      {document.project.name}
                    </Link>
                  </div>
                </div>
              )}

              {document.createdBy && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.createdBy}
                  </label>
                  <p className="text-sm mt-1">{document.createdBy.name || document.createdBy.email}</p>
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

          {/* Related Documents */}
          {relatedPVs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                {t.relatedDocuments}
              </h3>
              <div className="space-y-2">
                {relatedPVs.map((pv) => (
                  <Link
                    key={pv.id}
                    href={`/${locale}/admin/facturation/pv/${pv.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-blue-500" />
                      <span className="font-mono text-sm">{pv.number}</span>
                    </div>
                    <DocumentStatusBadge status={pv.status as any} locale={locale} size="sm" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delivery Modal */}
      {showConfirmDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t.confirmDelivery}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.confirmDeliveryMessage}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelivery(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleMarkDelivered}
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
