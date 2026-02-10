"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  totalTTC: number;
  paidAmount: number;
  balance: number;
  locale: string;
  onSuccess?: () => void;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Enregistrer un paiement",
    invoice: "Facture",
    totalAmount: "Montant total",
    alreadyPaid: "Déjà payé",
    remaining: "Reste à payer",
    paymentAmount: "Montant du paiement",
    date: "Date",
    method: "Mode de paiement",
    reference: "Référence (optionnel)",
    notes: "Notes (optionnel)",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    payFull: "Payer le solde complet",
    methods: {
      CASH: "Espèces",
      CHECK: "Chèque",
      BANK_TRANSFER: "Virement",
      CARD: "Carte",
      OTHER: "Autre",
    },
    errors: {
      amountRequired: "Le montant est requis",
      amountExceedsBalance: "Le montant dépasse le solde restant",
      saveFailed: "Erreur lors de l'enregistrement",
    },
    success: "Paiement enregistré avec succès",
  },
  en: {
    title: "Record a payment",
    invoice: "Invoice",
    totalAmount: "Total amount",
    alreadyPaid: "Already paid",
    remaining: "Remaining",
    paymentAmount: "Payment amount",
    date: "Date",
    method: "Payment method",
    reference: "Reference (optional)",
    notes: "Notes (optional)",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    payFull: "Pay full balance",
    methods: {
      CASH: "Cash",
      CHECK: "Check",
      BANK_TRANSFER: "Transfer",
      CARD: "Card",
      OTHER: "Other",
    },
    errors: {
      amountRequired: "Amount is required",
      amountExceedsBalance: "Amount exceeds remaining balance",
      saveFailed: "Error saving payment",
    },
    success: "Payment recorded successfully",
  },
  es: {
    title: "Registrar un pago",
    invoice: "Factura",
    totalAmount: "Monto total",
    alreadyPaid: "Ya pagado",
    remaining: "Restante",
    paymentAmount: "Monto del pago",
    date: "Fecha",
    method: "Método de pago",
    reference: "Referencia (opcional)",
    notes: "Notas (opcional)",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    payFull: "Pagar saldo completo",
    methods: {
      CASH: "Efectivo",
      CHECK: "Cheque",
      BANK_TRANSFER: "Transferencia",
      CARD: "Tarjeta",
      OTHER: "Otro",
    },
    errors: {
      amountRequired: "El monto es requerido",
      amountExceedsBalance: "El monto excede el saldo restante",
      saveFailed: "Error al guardar el pago",
    },
    success: "Pago registrado con éxito",
  },
  ar: {
    title: "تسجيل دفعة",
    invoice: "فاتورة",
    totalAmount: "المبلغ الإجمالي",
    alreadyPaid: "المدفوع",
    remaining: "المتبقي",
    paymentAmount: "مبلغ الدفعة",
    date: "التاريخ",
    method: "طريقة الدفع",
    reference: "المرجع (اختياري)",
    notes: "ملاحظات (اختياري)",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    payFull: "دفع الرصيد كاملاً",
    methods: {
      CASH: "نقدي",
      CHECK: "شيك",
      BANK_TRANSFER: "تحويل",
      CARD: "بطاقة",
      OTHER: "أخرى",
    },
    errors: {
      amountRequired: "المبلغ مطلوب",
      amountExceedsBalance: "المبلغ يتجاوز الرصيد المتبقي",
      saveFailed: "خطأ في حفظ الدفعة",
    },
    success: "تم تسجيل الدفعة بنجاح",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function PaymentModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  totalTTC,
  paidAmount,
  balance,
  locale,
  onSuccess,
}: PaymentModalProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isRTL = locale === "ar";

  const [amount, setAmount] = useState(balance.toString());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(balance.toString());
      setDate(new Date().toISOString().split("T")[0]);
      setMethod("BANK_TRANSFER");
      setReference("");
      setNotes("");
      setError("");
    }
  }, [isOpen, balance]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getMethodIcon = (methodType: string) => {
    switch (methodType) {
      case "CASH":
        return <Banknote className="h-4 w-4" />;
      case "CHECK":
        return <Receipt className="h-4 w-4" />;
      case "BANK_TRANSFER":
        return <Building2 className="h-4 w-4" />;
      case "CARD":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError(t.errors.amountRequired);
      return;
    }

    if (amountNum > balance) {
      setError(t.errors.amountExceedsBalance);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/crm/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: invoiceId,
          amount: amountNum,
          date: new Date(date),
          method,
          reference: reference || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onClose();
        onSuccess?.();
        router.refresh();
      } else {
        setError(data.error || t.errors.saveFailed);
      }
    } catch (err) {
      setError(t.errors.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto ${
          isRTL ? "rtl" : ""
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Invoice Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t.invoice}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {invoiceNumber}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t.totalAmount}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {formatCurrency(totalTTC)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t.alreadyPaid}:
                </span>
                <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(paidAmount)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t.remaining}:
                </span>
                <span className="ml-2 font-medium text-amber-600 dark:text-amber-400">
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.paymentAmount} *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  MAD
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAmount(balance.toString())}
                className="px-3 py-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 whitespace-nowrap"
              >
                {t.payFull}
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.date} *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.method} *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(["CASH", "CHECK", "BANK_TRANSFER", "CARD", "OTHER"] as const).map(
                (m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors ${
                      method === m
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {getMethodIcon(m)}
                    <span className="text-xs">{t.methods[m]}</span>
                  </button>
                )
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
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={method === "CHECK" ? "N° Chèque" : method === "BANK_TRANSFER" ? "N° Virement" : ""}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
