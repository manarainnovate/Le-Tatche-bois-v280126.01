"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Receipt,
  User,
  Calendar,
  FileText,
  Printer,
  Send,
  Edit,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  Building,
  FileDown,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentStatusBadge } from "@/components/crm/documents";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type DocumentStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "CONFIRMED" | "PARTIAL" | "DELIVERED" | "SIGNED" | "PAID" | "OVERDUE" | "CANCELLED";
type PaymentMethod = "CASH" | "CHECK" | "BANK_TRANSFER" | "CARD" | "MOBILE" | "OTHER";

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
  totalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  catalogItem?: {
    id: string;
    sku: string;
    name: string;
  } | null;
}

interface Payment {
  id: string;
  date: Date;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
}

interface AppliedDeposit {
  id: string;
  number: string;
  totalTTC: number;
  paidAmount: number;
  status: string;
}

interface Document {
  id: string;
  type: string;
  number: string;
  status: DocumentStatus;
  date: Date;
  dueDate: Date | null;
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
  depositPercent: number | null;
  depositAmount: number | null;
  totalDepositsApplied?: number;
  appliedDeposits?: AppliedDeposit[];
  linkedDevis?: {
    id: string;
    number: string;
    totalTTC: number;
  } | null;
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
  } | null;
  children: {
    id: string;
    number: string;
    type: string;
    status: string;
    totalTTC: number;
  }[];
  items: DocumentItem[];
  payments: Payment[];
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FactureDetailClientProps {
  document: Document;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  back: string;
  invoice: string;
  print: string;
  download: string;
  send: string;
  edit: string;
  addPayment: string;
  createAvoir: string;
  details: string;
  client: string;
  date: string;
  dueDate: string;
  sourceDocument: string;
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
    deposit: string;
    depositsApplied: string;
    netAfterDeposits: string;
    paid: string;
    balance: string;
  };
  depositInvoices: string;
  linkedQuote: string;
  notes: string;
  internalNotes: string;
  payments: string;
  paymentHistory: string;
  noPayments: string;
  relatedDocuments: string;
  avoirs: string;
  createdBy: string;
  createdAt: string;
  overdue: string;
  daysOverdue: string;
  paymentMethods: {
    CASH: string;
    CHECK: string;
    BANK_TRANSFER: string;
    CARD: string;
    MOBILE: string;
    OTHER: string;
  };
  addPaymentModal: {
    title: string;
    amount: string;
    date: string;
    method: string;
    reference: string;
    referencePlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    cancel: string;
    save: string;
    saving: string;
    fullPayment: string;
  };
  units: Record<string, string>;
}

const translations: Record<string, Translations> = {
  fr: {
    back: "Retour",
    invoice: "Facture",
    print: "Imprimer",
    download: "Télécharger PDF",
    send: "Envoyer",
    edit: "Modifier",
    addPayment: "Ajouter paiement",
    createAvoir: "Créer avoir",
    details: "Détails",
    client: "Client",
    date: "Date de facture",
    dueDate: "Date d'échéance",
    sourceDocument: "Document source",
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
      deposit: "Acompte",
      depositsApplied: "Acomptes déduits",
      netAfterDeposits: "Net après acomptes",
      paid: "Payé",
      balance: "Solde à payer",
    },
    depositInvoices: "Factures d'acompte",
    linkedQuote: "Devis lié",
    notes: "Notes",
    internalNotes: "Notes internes",
    payments: "Paiements",
    paymentHistory: "Historique des paiements",
    noPayments: "Aucun paiement enregistré",
    relatedDocuments: "Documents liés",
    avoirs: "Avoirs",
    createdBy: "Créé par",
    createdAt: "Créé le",
    overdue: "En retard",
    daysOverdue: "jours de retard",
    paymentMethods: {
      CASH: "Espèces",
      CHECK: "Chèque",
      BANK_TRANSFER: "Virement",
      CARD: "Carte bancaire",
      MOBILE: "Mobile",
      OTHER: "Autre",
    },
    addPaymentModal: {
      title: "Ajouter un paiement",
      amount: "Montant",
      date: "Date",
      method: "Mode de paiement",
      reference: "Référence",
      referencePlaceholder: "N° chèque, référence virement...",
      notes: "Notes",
      notesPlaceholder: "Notes sur ce paiement...",
      cancel: "Annuler",
      save: "Enregistrer",
      saving: "Enregistrement...",
      fullPayment: "Paiement total",
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
  },
  en: {
    back: "Back",
    invoice: "Invoice",
    print: "Print",
    download: "Download PDF",
    send: "Send",
    edit: "Edit",
    addPayment: "Add payment",
    createAvoir: "Create credit note",
    details: "Details",
    client: "Client",
    date: "Invoice date",
    dueDate: "Due date",
    sourceDocument: "Source document",
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
      deposit: "Deposit",
      depositsApplied: "Deposits applied",
      netAfterDeposits: "Net after deposits",
      paid: "Paid",
      balance: "Balance due",
    },
    depositInvoices: "Deposit invoices",
    linkedQuote: "Linked quote",
    notes: "Notes",
    internalNotes: "Internal notes",
    payments: "Payments",
    paymentHistory: "Payment history",
    noPayments: "No payments recorded",
    relatedDocuments: "Related documents",
    avoirs: "Credit notes",
    createdBy: "Created by",
    createdAt: "Created at",
    overdue: "Overdue",
    daysOverdue: "days overdue",
    paymentMethods: {
      CASH: "Cash",
      CHECK: "Check",
      BANK_TRANSFER: "Bank transfer",
      CARD: "Card",
      MOBILE: "Mobile",
      OTHER: "Other",
    },
    addPaymentModal: {
      title: "Add payment",
      amount: "Amount",
      date: "Date",
      method: "Payment method",
      reference: "Reference",
      referencePlaceholder: "Check number, transfer ref...",
      notes: "Notes",
      notesPlaceholder: "Notes about this payment...",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      fullPayment: "Full payment",
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
  },
  es: {
    back: "Volver",
    invoice: "Factura",
    print: "Imprimir",
    download: "Descargar PDF",
    send: "Enviar",
    edit: "Editar",
    addPayment: "Añadir pago",
    createAvoir: "Crear abono",
    details: "Detalles",
    client: "Cliente",
    date: "Fecha de factura",
    dueDate: "Fecha de vencimiento",
    sourceDocument: "Documento origen",
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
      deposit: "Anticipo",
      depositsApplied: "Anticipos aplicados",
      netAfterDeposits: "Neto después de anticipos",
      paid: "Pagado",
      balance: "Pendiente",
    },
    depositInvoices: "Facturas de anticipo",
    linkedQuote: "Presupuesto vinculado",
    notes: "Notas",
    internalNotes: "Notas internas",
    payments: "Pagos",
    paymentHistory: "Historial de pagos",
    noPayments: "Sin pagos registrados",
    relatedDocuments: "Documentos relacionados",
    avoirs: "Abonos",
    createdBy: "Creado por",
    createdAt: "Creado el",
    overdue: "Vencido",
    daysOverdue: "días de retraso",
    paymentMethods: {
      CASH: "Efectivo",
      CHECK: "Cheque",
      BANK_TRANSFER: "Transferencia",
      CARD: "Tarjeta",
      MOBILE: "Móvil",
      OTHER: "Otro",
    },
    addPaymentModal: {
      title: "Añadir pago",
      amount: "Importe",
      date: "Fecha",
      method: "Método de pago",
      reference: "Referencia",
      referencePlaceholder: "N° cheque, ref. transferencia...",
      notes: "Notas",
      notesPlaceholder: "Notas sobre este pago...",
      cancel: "Cancelar",
      save: "Guardar",
      saving: "Guardando...",
      fullPayment: "Pago total",
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
  },
  ar: {
    back: "رجوع",
    invoice: "فاتورة",
    print: "طباعة",
    download: "تحميل PDF",
    send: "إرسال",
    edit: "تعديل",
    addPayment: "إضافة دفعة",
    createAvoir: "إنشاء إشعار دائن",
    details: "التفاصيل",
    client: "العميل",
    date: "تاريخ الفاتورة",
    dueDate: "تاريخ الاستحقاق",
    sourceDocument: "المستند المصدر",
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
      deposit: "العربون",
      depositsApplied: "الدفعات المخصومة",
      netAfterDeposits: "الصافي بعد الدفعات",
      paid: "المدفوع",
      balance: "المتبقي",
    },
    depositInvoices: "فواتير الدفعات المقدمة",
    linkedQuote: "العرض المرتبط",
    notes: "ملاحظات",
    internalNotes: "ملاحظات داخلية",
    payments: "المدفوعات",
    paymentHistory: "سجل المدفوعات",
    noPayments: "لا مدفوعات مسجلة",
    relatedDocuments: "المستندات المرتبطة",
    avoirs: "إشعارات دائنة",
    createdBy: "أنشئ بواسطة",
    createdAt: "تاريخ الإنشاء",
    overdue: "متأخر",
    daysOverdue: "أيام تأخير",
    paymentMethods: {
      CASH: "نقداً",
      CHECK: "شيك",
      BANK_TRANSFER: "تحويل بنكي",
      CARD: "بطاقة",
      MOBILE: "موبايل",
      OTHER: "آخر",
    },
    addPaymentModal: {
      title: "إضافة دفعة",
      amount: "المبلغ",
      date: "التاريخ",
      method: "طريقة الدفع",
      reference: "المرجع",
      referencePlaceholder: "رقم الشيك، مرجع التحويل...",
      notes: "ملاحظات",
      notesPlaceholder: "ملاحظات حول هذه الدفعة...",
      cancel: "إلغاء",
      save: "حفظ",
      saving: "جارٍ الحفظ...",
      fullPayment: "الدفع الكامل",
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
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function FactureDetailClient({ document, locale }: FactureDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = (translations[locale] || translations.fr) as Translations;

  const [showPaymentModal, setShowPaymentModal] = useState(
    searchParams.get("payment") === "true"
  );
  const [paymentAmount, setPaymentAmount] = useState(String(document.balance));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  const basePath = `/${locale}/admin/facturation/factures`;

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const isOverdue =
    document.dueDate &&
    new Date(document.dueDate) < new Date() &&
    document.status !== "PAID" &&
    document.balance > 0;

  const daysOverdue = isOverdue
    ? Math.floor(
        (new Date().getTime() - new Date(document.dueDate!).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const canEdit = document.status === "DRAFT";
  const canAddPayment = document.balance > 0 && document.status !== "CANCELLED";
  const canCreateAvoir = document.status === "PAID" || document.paidAmount > 0;

  const handlePrint = () => {
    window.open(`/api/crm/documents/${document.id}/pdf`, "_blank");
  };

  const handleSavePayment = async () => {
    setSavingPayment(true);
    try {
      const response = await fetch(`/api/crm/documents/${document.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          date: new Date(paymentDate),
          method: paymentMethod,
          reference: paymentReference || null,
          notes: paymentNotes || null,
        }),
      });

      if (response.ok) {
        setShowPaymentModal(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving payment:", error);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleCreateAvoir = () => {
    router.push(`/${locale}/admin/facturation/avoirs/new?factureId=${document.id}`);
  };

  // Get related avoirs
  const relatedAvoirs = document.children.filter((c) => c.type === "AVOIR");

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
              <Receipt className="h-7 w-7 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.invoice} {document.number}
              </h1>
              <DocumentStatusBadge
                status={isOverdue ? "OVERDUE" : (document.status as any)}
                locale={locale}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {document.clientName} • {formatDate(document.date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Printer className="h-4 w-4" />
            {t.print}
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

          {canAddPayment && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              {t.addPayment}
            </button>
          )}

          {canCreateAvoir && (
            <button
              onClick={handleCreateAvoir}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              {t.createAvoir}
            </button>
          )}
        </div>
      </div>

      {/* Overdue Alert */}
      {isOverdue && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">
              {t.overdue} - {daysOverdue} {t.daysOverdue}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {t.totals.balance}: {formatCurrency(document.balance)}
            </p>
          </div>
        </div>
      )}

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
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      {t.unitPrice}
                    </th>
                    {document.items.some((i) => i.discountPercent) && (
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                        {t.discount}
                      </th>
                    )}
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
                      {document.items.some((i) => i.discountPercent) && (
                        <td className="py-3 px-4 text-right text-sm text-red-600">
                          {item.discountPercent ? `-${item.discountPercent}%` : "-"}
                        </td>
                      )}
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
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.totals.totalHT}</span>
                    <span>{formatCurrency(document.totalHT)}</span>
                  </div>
                  {document.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>
                        {t.totals.discount}
                        {document.discountValue && ` (${document.discountValue}%)`}
                      </span>
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
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(document.totalTTC)}
                    </span>
                  </div>
                  {/* Show deposit deductions if any */}
                  {document.totalDepositsApplied && document.totalDepositsApplied > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-amber-600">
                        <span>{t.totals.depositsApplied}</span>
                        <span>-{formatCurrency(document.totalDepositsApplied)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-700 dark:text-gray-300">{t.totals.netAfterDeposits}</span>
                        <span>{formatCurrency(document.totalTTC - document.totalDepositsApplied)}</span>
                      </div>
                    </>
                  )}
                  {document.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t.totals.paid}</span>
                        <span>-{formatCurrency(document.paidAmount)}</span>
                      </div>
                      <div
                        className={cn(
                          "flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700",
                          document.balance > 0
                            ? isOverdue
                              ? "text-red-600"
                              : "text-amber-600"
                            : "text-green-600"
                        )}
                      >
                        <span className="font-semibold">{t.totals.balance}</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(document.balance)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                {t.paymentHistory}
              </h2>
            </div>
            {document.payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t.noPayments}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {document.payments.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.date)} •{" "}
                          {t.paymentMethods[payment.method]}
                          {payment.reference && ` • ${payment.reference}`}
                        </div>
                        {payment.notes && (
                          <div className="text-sm text-gray-400 italic mt-1">
                            {payment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

              {document.dueDate && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.dueDate}
                  </label>
                  <div
                    className={cn(
                      "flex items-center gap-2 mt-1",
                      isOverdue && "text-red-600"
                    )}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatDate(document.dueDate)}</span>
                  </div>
                </div>
              )}

              {document.parent && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t.sourceDocument}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <Link
                      href={`/${locale}/admin/facturation/${
                        document.parent.type === "PV_RECEPTION" ? "pv" : "bl"
                      }/${document.parent.id}`}
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

          {/* Applied Deposits */}
          {document.appliedDeposits && document.appliedDeposits.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                {t.depositInvoices}
              </h3>
              <div className="space-y-2">
                {document.appliedDeposits.map((deposit) => (
                  <Link
                    key={deposit.id}
                    href={`/${locale}/admin/facturation/factures/${deposit.id}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
                  >
                    <div>
                      <span className="font-mono text-sm text-amber-700 dark:text-amber-400">
                        {deposit.number}
                      </span>
                      <span className={cn(
                        "ms-2 text-xs px-1.5 py-0.5 rounded-full",
                        deposit.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      )}>
                        {deposit.status}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-amber-600">
                      -{formatCurrency(deposit.paidAmount)}
                    </span>
                  </Link>
                ))}
                {document.totalDepositsApplied && document.totalDepositsApplied > 0 && (
                  <div className="flex justify-between pt-2 mt-2 border-t border-amber-200 dark:border-amber-700">
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      {t.totals.depositsApplied}
                    </span>
                    <span className="font-bold text-amber-800 dark:text-amber-300">
                      -{formatCurrency(document.totalDepositsApplied)}
                    </span>
                  </div>
                )}
              </div>
              {document.linkedDevis && (
                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                  <span className="text-xs text-amber-600 dark:text-amber-400">{t.linkedQuote}:</span>
                  <Link
                    href={`/${locale}/admin/facturation/devis/${document.linkedDevis.id}`}
                    className="ms-2 font-mono text-sm text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    {document.linkedDevis.number}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Client Legal Info */}
          {document.client && (document.client.ice || document.client.rc) && (
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

          {/* Related Documents */}
          {relatedAvoirs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                {t.relatedDocuments}
              </h3>
              <div className="space-y-2">
                {relatedAvoirs.map((avoir) => (
                  <Link
                    key={avoir.id}
                    href={`/${locale}/admin/facturation/avoirs/${avoir.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4 text-red-500" />
                      <span className="font-mono text-sm">{avoir.number}</span>
                    </div>
                    <span className="text-sm text-red-600">
                      -{formatCurrency(avoir.totalTTC)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.addPaymentModal.title}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.addPaymentModal.amount} *
                  </label>
                  <button
                    onClick={() => setPaymentAmount(String(document.balance))}
                    className="text-xs text-amber-600 hover:text-amber-700"
                  >
                    {t.addPaymentModal.fullPayment}
                  </button>
                </div>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={document.balance}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.totals.balance}: {formatCurrency(document.balance)}
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.addPaymentModal.date} *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.addPaymentModal.method} *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                >
                  {Object.entries(t.paymentMethods).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.addPaymentModal.reference}
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={t.addPaymentModal.referencePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.addPaymentModal.notes}
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={2}
                  placeholder={t.addPaymentModal.notesPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.addPaymentModal.cancel}
              </button>
              <button
                onClick={handleSavePayment}
                disabled={savingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                {savingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {savingPayment ? t.addPaymentModal.saving : t.addPaymentModal.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
