"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  FileText,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  User,
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Payment {
  id: string;
  documentId: string | null;
  amount: number;
  date: Date | string;
  method: string;
  reference: string | null;
  notes: string | null;
  createdAt: Date | string;
  document: {
    id: string;
    number: string;
    type: string;
    date: Date | string;
    clientId: string | null;
    clientName: string;
    clientAddress: string | null;
    clientCity: string | null;
    clientPhone: string | null;
    clientEmail: string | null;
    totalTTC: number;
    paidAmount: number;
    balance: number;
    status: string;
    client: {
      id: string;
      fullName: string;
      clientNumber: string;
    } | null;
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

interface SimplePayment {
  id: string;
  amount: number;
  date: Date | string;
  method: string;
  reference: string | null;
}

interface PaymentDetailClientProps {
  payment: Payment;
  allPayments: SimplePayment[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Détail du paiement",
    back: "Retour",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce paiement ?",
    paymentInfo: "Informations du paiement",
    amount: "Montant",
    date: "Date",
    method: "Mode de paiement",
    reference: "Référence",
    notes: "Notes",
    createdAt: "Créé le",
    createdBy: "Créé par",
    invoiceInfo: "Informations facture",
    invoiceNumber: "N° Facture",
    invoiceDate: "Date facture",
    invoiceTotal: "Total TTC",
    totalPaid: "Total payé",
    remaining: "Reste à payer",
    status: "Statut",
    clientInfo: "Informations client",
    clientName: "Nom",
    clientNumber: "N° Client",
    clientAddress: "Adresse",
    clientPhone: "Téléphone",
    clientEmail: "Email",
    paymentHistory: "Historique des paiements",
    viewInvoice: "Voir la facture",
    methods: {
      CASH: "Espèces",
      CHECK: "Chèque",
      BANK_TRANSFER: "Virement bancaire",
      CARD: "Carte bancaire",
      OTHER: "Autre",
    },
    statuses: {
      DRAFT: "Brouillon",
      SENT: "Envoyée",
      PARTIAL: "Paiement partiel",
      PAID: "Payée",
      OVERDUE: "En retard",
      CANCELLED: "Annulée",
    },
  },
  en: {
    title: "Payment details",
    back: "Back",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this payment?",
    paymentInfo: "Payment information",
    amount: "Amount",
    date: "Date",
    method: "Payment method",
    reference: "Reference",
    notes: "Notes",
    createdAt: "Created at",
    createdBy: "Created by",
    invoiceInfo: "Invoice information",
    invoiceNumber: "Invoice No.",
    invoiceDate: "Invoice date",
    invoiceTotal: "Total incl. tax",
    totalPaid: "Total paid",
    remaining: "Remaining",
    status: "Status",
    clientInfo: "Client information",
    clientName: "Name",
    clientNumber: "Client No.",
    clientAddress: "Address",
    clientPhone: "Phone",
    clientEmail: "Email",
    paymentHistory: "Payment history",
    viewInvoice: "View invoice",
    methods: {
      CASH: "Cash",
      CHECK: "Check",
      BANK_TRANSFER: "Bank transfer",
      CARD: "Credit card",
      OTHER: "Other",
    },
    statuses: {
      DRAFT: "Draft",
      SENT: "Sent",
      PARTIAL: "Partial payment",
      PAID: "Paid",
      OVERDUE: "Overdue",
      CANCELLED: "Cancelled",
    },
  },
  es: {
    title: "Detalles del pago",
    back: "Volver",
    delete: "Eliminar",
    confirmDelete: "¿Está seguro de que desea eliminar este pago?",
    paymentInfo: "Información del pago",
    amount: "Monto",
    date: "Fecha",
    method: "Método de pago",
    reference: "Referencia",
    notes: "Notas",
    createdAt: "Creado el",
    createdBy: "Creado por",
    invoiceInfo: "Información de factura",
    invoiceNumber: "N° Factura",
    invoiceDate: "Fecha factura",
    invoiceTotal: "Total con IVA",
    totalPaid: "Total pagado",
    remaining: "Restante",
    status: "Estado",
    clientInfo: "Información del cliente",
    clientName: "Nombre",
    clientNumber: "N° Cliente",
    clientAddress: "Dirección",
    clientPhone: "Teléfono",
    clientEmail: "Email",
    paymentHistory: "Historial de pagos",
    viewInvoice: "Ver factura",
    methods: {
      CASH: "Efectivo",
      CHECK: "Cheque",
      BANK_TRANSFER: "Transferencia",
      CARD: "Tarjeta de crédito",
      OTHER: "Otro",
    },
    statuses: {
      DRAFT: "Borrador",
      SENT: "Enviada",
      PARTIAL: "Pago parcial",
      PAID: "Pagada",
      OVERDUE: "Vencida",
      CANCELLED: "Cancelada",
    },
  },
  ar: {
    title: "تفاصيل الدفعة",
    back: "رجوع",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذه الدفعة؟",
    paymentInfo: "معلومات الدفعة",
    amount: "المبلغ",
    date: "التاريخ",
    method: "طريقة الدفع",
    reference: "المرجع",
    notes: "ملاحظات",
    createdAt: "تاريخ الإنشاء",
    createdBy: "أنشأه",
    invoiceInfo: "معلومات الفاتورة",
    invoiceNumber: "رقم الفاتورة",
    invoiceDate: "تاريخ الفاتورة",
    invoiceTotal: "المجموع شامل الضريبة",
    totalPaid: "المدفوع",
    remaining: "المتبقي",
    status: "الحالة",
    clientInfo: "معلومات العميل",
    clientName: "الاسم",
    clientNumber: "رقم العميل",
    clientAddress: "العنوان",
    clientPhone: "الهاتف",
    clientEmail: "البريد الإلكتروني",
    paymentHistory: "سجل المدفوعات",
    viewInvoice: "عرض الفاتورة",
    methods: {
      CASH: "نقدي",
      CHECK: "شيك",
      BANK_TRANSFER: "تحويل بنكي",
      CARD: "بطاقة ائتمان",
      OTHER: "أخرى",
    },
    statuses: {
      DRAFT: "مسودة",
      SENT: "مرسلة",
      PARTIAL: "دفع جزئي",
      PAID: "مدفوعة",
      OVERDUE: "متأخرة",
      CANCELLED: "ملغاة",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function PaymentDetailClient({
  payment,
  allPayments,
  locale,
}: PaymentDetailClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const isRTL = locale === "ar";

  const [deleting, setDeleting] = useState(false);

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatDateTime = (date: Date | string) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <Banknote className="h-5 w-5" />;
      case "CHECK":
        return <Receipt className="h-5 w-5" />;
      case "BANK_TRANSFER":
        return <Building2 className="h-5 w-5" />;
      case "CARD":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PARTIAL":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "OVERDUE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "SENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const handleDelete = async () => {
    if (!confirm(t.confirmDelete)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/crm/payments/${payment.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push(`/${locale}/admin/facturation/paiements`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`p-6 ${isRTL ? "rtl" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/facturation/paiements`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatCurrency(payment.amount)} - {formatDate(payment.date)}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
        >
          <Trash2 className="h-5 w-5" />
          {t.delete}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.paymentInfo}
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.amount}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.date}
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  {formatDate(payment.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.method}
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  {getMethodIcon(payment.method)}
                  {t.methods[payment.method as keyof typeof t.methods]}
                </p>
              </div>
              {payment.reference && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.reference}
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Hash className="h-5 w-5 text-gray-400" />
                    {payment.reference}
                  </p>
                </div>
              )}
              {payment.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.notes}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {payment.notes}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.createdAt}
                </p>
                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {formatDateTime(payment.createdAt)}
                </p>
              </div>
              {payment.createdBy && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.createdBy}
                  </p>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {payment.createdBy.name || payment.createdBy.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.invoiceInfo}
              </h2>
              <Link
                href={`/${locale}/admin/facturation/factures/${payment.document.id}`}
                className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                {t.viewInvoice}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.invoiceNumber}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {payment.document.number}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.invoiceDate}
                </p>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(payment.document.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.status}
                </p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    payment.document.status
                  )}`}
                >
                  {t.statuses[payment.document.status as keyof typeof t.statuses]}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.invoiceTotal}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(payment.document.totalTTC)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.totalPaid}
                </p>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(payment.document.paidAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.remaining}
                </p>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  {formatCurrency(payment.document.balance)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (payment.document.paidAmount / payment.document.totalTTC) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {((payment.document.paidAmount / payment.document.totalTTC) * 100).toFixed(
                  1
                )}
                %
              </p>
            </div>
          </div>

          {/* Payment History */}
          {allPayments.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.paymentHistory}
              </h2>
              <div className="space-y-3">
                {allPayments.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      p.id === payment.id
                        ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                        : "bg-gray-50 dark:bg-gray-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getMethodIcon(p.method)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(p.amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t.methods[p.method as keyof typeof t.methods]}
                          {p.reference && ` - ${p.reference}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(p.date)}
                      </span>
                      {p.id === payment.id && (
                        <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Client Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.clientInfo}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.clientName}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {payment.document.clientName}
                </p>
              </div>
              {payment.document.client && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.clientNumber}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {payment.document.client.clientNumber}
                  </p>
                </div>
              )}
              {payment.document.clientAddress && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.clientAddress}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {payment.document.clientAddress}
                    {payment.document.clientCity &&
                      `, ${payment.document.clientCity}`}
                  </p>
                </div>
              )}
              {payment.document.clientPhone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.clientPhone}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {payment.document.clientPhone}
                  </p>
                </div>
              )}
              {payment.document.clientEmail && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.clientEmail}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {payment.document.clientEmail}
                  </p>
                </div>
              )}
            </div>
            {payment.document.client && (
              <Link
                href={`/${locale}/admin/crm/clients/${payment.document.client.id}`}
                className="mt-4 block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Voir le client
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
