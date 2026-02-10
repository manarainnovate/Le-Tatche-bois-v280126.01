"use client";

import { useState } from "react";
import {
  CreditCard,
  Plus,
  Filter,
  Banknote,
  Landmark,
  CheckSquare,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  method: "CASH" | "CHECK" | "TRANSFER" | "CARD" | "EFFET";
  reference?: string | null;
  notes?: string | null;
  status: string;
  date: Date | string;
  document: {
    id: string;
    documentNumber: string;
    type: string;
    totalTTC: number;
  };
}

interface Document {
  id: string;
  documentNumber: string;
  type: string;
  totalTTC: number;
  balance: number;
}

interface ClientPaymentsProps {
  payments: Payment[];
  documents: Document[];
  locale: string;
  clientId: string;
  onAddPayment?: (data: PaymentFormData) => Promise<void>;
}

interface PaymentFormData {
  documentId: string;
  amount: number;
  method: Payment["method"];
  reference?: string;
  notes?: string;
  date?: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    payments: "Paiements",
    noPayments: "Aucun paiement",
    addPayment: "Ajouter un paiement",
    filter: "Filtrer",
    allMethods: "Toutes les méthodes",
    document: "Document",
    amount: "Montant",
    method: "Méthode",
    reference: "Référence",
    notes: "Notes",
    date: "Date",
    totalPaid: "Total payé",
    byMethod: "Par méthode",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    selectDocument: "Sélectionner un document",
    documentBalance: "Solde",
    amountExceedsBalance: "Le montant dépasse le solde",
    CASH: "Espèces",
    CHECK: "Chèque",
    TRANSFER: "Virement",
    CARD: "Carte",
    EFFET: "Effet",
    VALIDATED: "Validé",
    PENDING: "En attente",
    REJECTED: "Rejeté",
  },
  en: {
    payments: "Payments",
    noPayments: "No payments",
    addPayment: "Add payment",
    filter: "Filter",
    allMethods: "All methods",
    document: "Document",
    amount: "Amount",
    method: "Method",
    reference: "Reference",
    notes: "Notes",
    date: "Date",
    totalPaid: "Total paid",
    byMethod: "By method",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    selectDocument: "Select a document",
    documentBalance: "Balance",
    amountExceedsBalance: "Amount exceeds balance",
    CASH: "Cash",
    CHECK: "Check",
    TRANSFER: "Transfer",
    CARD: "Card",
    EFFET: "Bill of exchange",
    VALIDATED: "Validated",
    PENDING: "Pending",
    REJECTED: "Rejected",
  },
  es: {
    payments: "Pagos",
    noPayments: "Sin pagos",
    addPayment: "Agregar pago",
    filter: "Filtrar",
    allMethods: "Todos los métodos",
    document: "Documento",
    amount: "Monto",
    method: "Método",
    reference: "Referencia",
    notes: "Notas",
    date: "Fecha",
    totalPaid: "Total pagado",
    byMethod: "Por método",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    selectDocument: "Seleccionar documento",
    documentBalance: "Saldo",
    amountExceedsBalance: "El monto supera el saldo",
    CASH: "Efectivo",
    CHECK: "Cheque",
    TRANSFER: "Transferencia",
    CARD: "Tarjeta",
    EFFET: "Letra de cambio",
    VALIDATED: "Validado",
    PENDING: "Pendiente",
    REJECTED: "Rechazado",
  },
  ar: {
    payments: "المدفوعات",
    noPayments: "لا توجد مدفوعات",
    addPayment: "إضافة دفعة",
    filter: "تصفية",
    allMethods: "جميع الطرق",
    document: "المستند",
    amount: "المبلغ",
    method: "الطريقة",
    reference: "المرجع",
    notes: "ملاحظات",
    date: "التاريخ",
    totalPaid: "إجمالي المدفوع",
    byMethod: "حسب الطريقة",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    selectDocument: "اختر مستند",
    documentBalance: "الرصيد",
    amountExceedsBalance: "المبلغ يتجاوز الرصيد",
    CASH: "نقداً",
    CHECK: "شيك",
    TRANSFER: "تحويل",
    CARD: "بطاقة",
    EFFET: "كمبيالة",
    VALIDATED: "مؤكد",
    PENDING: "قيد الانتظار",
    REJECTED: "مرفوض",
  },
};

// ═══════════════════════════════════════════════════════════
// Method Configuration
// ═══════════════════════════════════════════════════════════

const methodConfig: Record<
  Payment["method"],
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  CASH: { icon: Banknote, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  CHECK: { icon: CheckSquare, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  TRANSFER: { icon: Landmark, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
  CARD: { icon: CreditCard, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  EFFET: { icon: Clock, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ClientPayments({
  payments,
  documents,
  locale,
  clientId,
  onAddPayment,
}: ClientPaymentsProps) {
  const t = translations[locale] || translations.fr;

  const [filterMethod, setFilterMethod] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    documentId: "",
    amount: 0,
    method: "CASH",
    reference: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState<string | null>(null);

  const filteredPayments = payments.filter((payment) => {
    if (filterMethod && payment.method !== filterMethod) return false;
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

  // Calculate totals by method
  const totalsByMethod = payments.reduce(
    (acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
      acc.total += payment.amount;
      return acc;
    },
    { total: 0 } as Record<string, number>
  );

  // Get documents with balance
  const documentsWithBalance = documents.filter((doc) => doc.balance > 0);

  // Get selected document balance
  const selectedDocument = documents.find((d) => d.id === formData.documentId);
  const maxAmount = selectedDocument?.balance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.documentId) {
      setError(t.selectDocument);
      return;
    }

    if (formData.amount > maxAmount) {
      setError(t.amountExceedsBalance);
      return;
    }

    if (!onAddPayment) return;

    setIsSubmitting(true);
    try {
      await onAddPayment(formData);
      setShowForm(false);
      setFormData({
        documentId: "",
        amount: 0,
        method: "CASH",
        reference: "",
        notes: "",
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t.allMethods}</option>
            {(["CASH", "CHECK", "TRANSFER", "CARD", "EFFET"] as const).map(
              (method) => (
                <option key={method} value={method}>
                  {t[method]}
                </option>
              )
            )}
          </select>
        </div>

        {/* Add Button */}
        {onAddPayment && documentsWithBalance.length > 0 && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t.addPayment}
          </button>
        )}
      </div>

      {/* Totals Summary */}
      {payments.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.totalPaid}
            </span>
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(totalsByMethod.total)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["CASH", "CHECK", "TRANSFER", "CARD", "EFFET"] as const).map(
              (method) => {
                if (!totalsByMethod[method]) return null;
                const config = methodConfig[method];
                const Icon = config.icon;
                return (
                  <div
                    key={method}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs",
                      config.color
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t[method]}:</span>
                    <span className="font-medium">
                      {formatCurrency(totalsByMethod[method])}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t.noPayments}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPayments.map((payment) => {
            const config = methodConfig[payment.method];
            const Icon = config.icon;

            return (
              <div
                key={payment.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Method Icon */}
                <div className={cn("p-2 rounded-lg", config.color)}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Payment Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {payment.paymentNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                      {t[payment.method]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(payment.date)}</span>
                    <span>{payment.document.documentNumber}</span>
                    {payment.reference && <span>Réf: {payment.reference}</span>}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Payment Modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                  {t.addPayment}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Document Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.document} *
                  </label>
                  <select
                    value={formData.documentId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        documentId: e.target.value,
                        amount: 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">{t.selectDocument}</option>
                    {documentsWithBalance.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.documentNumber} - {t.documentBalance}:{" "}
                        {formatCurrency(doc.balance)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.amount} * (max: {formatCurrency(maxAmount)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={maxAmount}
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.method}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["CASH", "CHECK", "TRANSFER", "CARD", "EFFET"] as const).map(
                      (method) => {
                        const config = methodConfig[method];
                        const Icon = config.icon;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, method }))
                            }
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all",
                              formData.method === method
                                ? cn(config.color, "ring-2 ring-amber-500")
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{t[method]}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.reference}
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reference: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.date}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      t.save
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ClientPayments;
