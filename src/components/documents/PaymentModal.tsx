"use client";

import { useState, useEffect } from "react";
import {
  X,
  DollarSign,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientId: string;
  total: number;
  paidAmount: number;
  balance: number;
  date: string;
  dueDate?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
  locale?: string;
}

type PaymentMethod = "ESPECES" | "VIREMENT" | "CHEQUE" | "CARTE" | "MOBILE";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Ajouter un paiement",
    invoice: "Facture",
    amount: "Montant",
    paid: "Payé",
    remaining: "Reste à payer",
    date: "Date",
    paymentAmount: "Montant du paiement",
    payInFull: "Solder la facture",
    method: "Mode de paiement",
    reference: "Référence",
    notes: "Notes",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    success: "Paiement enregistré",
    error: "Erreur lors de l'enregistrement",
    // Payment methods
    cash: "Espèces",
    transfer: "Virement",
    check: "Chèque",
    card: "Carte",
    mobile: "Mobile",
    // Check fields
    checkNumber: "N° Chèque",
    bank: "Banque",
    checkDate: "Date du chèque",
    holder: "Titulaire",
    // Transfer fields
    transferRef: "Référence virement",
    issuingBank: "Banque émettrice",
    valueDate: "Date valeur",
  },
  en: {
    title: "Add Payment",
    invoice: "Invoice",
    amount: "Amount",
    paid: "Paid",
    remaining: "Remaining",
    date: "Date",
    paymentAmount: "Payment amount",
    payInFull: "Pay in full",
    method: "Payment method",
    reference: "Reference",
    notes: "Notes",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    success: "Payment saved",
    error: "Error saving payment",
    cash: "Cash",
    transfer: "Transfer",
    check: "Check",
    card: "Card",
    mobile: "Mobile",
    checkNumber: "Check #",
    bank: "Bank",
    checkDate: "Check date",
    holder: "Holder",
    transferRef: "Transfer reference",
    issuingBank: "Issuing bank",
    valueDate: "Value date",
  },
  es: {
    title: "Agregar pago",
    invoice: "Factura",
    amount: "Monto",
    paid: "Pagado",
    remaining: "Restante",
    date: "Fecha",
    paymentAmount: "Monto del pago",
    payInFull: "Pagar total",
    method: "Método de pago",
    reference: "Referencia",
    notes: "Notas",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    success: "Pago guardado",
    error: "Error al guardar",
    cash: "Efectivo",
    transfer: "Transferencia",
    check: "Cheque",
    card: "Tarjeta",
    mobile: "Móvil",
    checkNumber: "N° Cheque",
    bank: "Banco",
    checkDate: "Fecha cheque",
    holder: "Titular",
    transferRef: "Ref. transferencia",
    issuingBank: "Banco emisor",
    valueDate: "Fecha valor",
  },
  ar: {
    title: "إضافة دفعة",
    invoice: "فاتورة",
    amount: "المبلغ",
    paid: "مدفوع",
    remaining: "المتبقي",
    date: "التاريخ",
    paymentAmount: "مبلغ الدفع",
    payInFull: "دفع كامل",
    method: "طريقة الدفع",
    reference: "المرجع",
    notes: "ملاحظات",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    success: "تم حفظ الدفعة",
    error: "خطأ في الحفظ",
    cash: "نقدا",
    transfer: "تحويل",
    check: "شيك",
    card: "بطاقة",
    mobile: "موبايل",
    checkNumber: "رقم الشيك",
    bank: "البنك",
    checkDate: "تاريخ الشيك",
    holder: "الحامل",
    transferRef: "مرجع التحويل",
    issuingBank: "البنك المصدر",
    valueDate: "تاريخ القيمة",
  },
};

// ═══════════════════════════════════════════════════════════
// Payment Method Icons
// ═══════════════════════════════════════════════════════════

const paymentMethods: { value: PaymentMethod; icon: typeof Banknote; labelKey: keyof typeof translations.fr }[] = [
  { value: "ESPECES", icon: Banknote, labelKey: "cash" },
  { value: "VIREMENT", icon: Building2, labelKey: "transfer" },
  { value: "CHEQUE", icon: FileText, labelKey: "check" },
  { value: "CARTE", icon: CreditCard, labelKey: "card" },
  { value: "MOBILE", icon: Smartphone, labelKey: "mobile" },
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function PaymentModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
  locale = "fr",
}: PaymentModalProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("ESPECES");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  // Check-specific fields
  const [checkNumber, setCheckNumber] = useState("");
  const [bank, setBank] = useState("");
  const [checkDate, setCheckDate] = useState("");
  const [holder, setHolder] = useState("");

  // Transfer-specific fields
  const [transferRef, setTransferRef] = useState("");
  const [issuingBank, setIssuingBank] = useState("");
  const [valueDate, setValueDate] = useState("");

  // Reset form when invoice changes
  useEffect(() => {
    if (invoice) {
      setAmount(invoice.balance.toFixed(2));
      setDate(new Date().toISOString().split("T")[0]);
      setMethod("ESPECES");
      setReference("");
      setNotes("");
      setCheckNumber("");
      setBank("");
      setCheckDate("");
      setHolder("");
      setTransferRef("");
      setIssuingBank("");
      setValueDate("");
      setError(null);
      setShowSuccess(false);
    }
  }, [invoice]);

  const handlePayInFull = () => {
    if (invoice) {
      setAmount(invoice.balance.toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build reference based on method
      let finalReference = reference;
      if (method === "CHEQUE" && checkNumber) {
        finalReference = `CHQ-${checkNumber}${bank ? ` (${bank})` : ""}`;
      } else if (method === "VIREMENT" && transferRef) {
        finalReference = `VIR-${transferRef}`;
      }

      const response = await fetch("/api/crm/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: invoice.id,
          amount: parseFloat(amount),
          date,
          method,
          reference: finalReference,
          notes,
          // Additional metadata
          metadata: {
            checkNumber,
            bank,
            checkDate,
            holder,
            transferRef,
            issuingBank,
            valueDate,
          },
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? t.error);
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !invoice) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Success State */}
        {showSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {t.success}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Invoice Info */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{t.invoice}:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">
                  {invoice.number}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {invoice.clientName}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">{t.amount}:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(invoice.total)} DH
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{t.paid}:</span>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(invoice.paidAmount)} DH
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{t.remaining}:</span>
                  <p className="font-semibold text-amber-600">
                    {formatCurrency(invoice.balance)} DH
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.date}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.paymentAmount}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={invoice.balance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      DH
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePayInFull}
                    className="px-3 py-2 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors whitespace-nowrap"
                  >
                    {t.payInFull}
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.method}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {paymentMethods.map(({ value, icon: Icon, labelKey }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMethod(value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                        method === value
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          method === value
                            ? "text-amber-600"
                            : "text-gray-500"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs",
                          method === value
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {t[labelKey]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Check-specific fields */}
              {method === "CHEQUE" && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.checkNumber}
                    </label>
                    <input
                      type="text"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.bank}
                    </label>
                    <input
                      type="text"
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.checkDate}
                    </label>
                    <input
                      type="date"
                      value={checkDate}
                      onChange={(e) => setCheckDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.holder}
                    </label>
                    <input
                      type="text"
                      value={holder}
                      onChange={(e) => setHolder(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Transfer-specific fields */}
              {method === "VIREMENT" && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.transferRef}
                    </label>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.issuingBank}
                    </label>
                    <input
                      type="text"
                      value={issuingBank}
                      onChange={(e) => setIssuingBank(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.valueDate}
                    </label>
                    <input
                      type="date"
                      value={valueDate}
                      onChange={(e) => setValueDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Reference (for other methods) */}
              {method !== "CHEQUE" && method !== "VIREMENT" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.reference}
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Optionnel"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.notes}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4" />
                    {t.save}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
