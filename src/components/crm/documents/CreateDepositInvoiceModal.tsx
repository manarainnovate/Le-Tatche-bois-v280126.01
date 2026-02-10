"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Receipt, Percent, DollarSign, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface CreateDepositInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  devisId: string;
  devisNumber: string;
  devisTotalTTC: number;
  existingDeposits: number;
  defaultDepositPercent?: number;
  locale: string;
}

type DepositMode = "percent" | "amount";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Créer une facture d'acompte",
    subtitle: "Créer une facture d'acompte pour le devis",
    mode: "Mode de calcul",
    percent: "Pourcentage",
    amount: "Montant fixe",
    depositPercent: "Pourcentage de l'acompte",
    depositAmount: "Montant de l'acompte",
    dueDate: "Date d'échéance",
    notes: "Notes (optionnel)",
    notesPlaceholder: "Notes qui apparaîtront sur la facture d'acompte...",
    summary: "Récapitulatif",
    devisTotal: "Total devis TTC",
    existingDeposits: "Acomptes existants",
    remaining: "Restant à facturer",
    newDeposit: "Nouvel acompte",
    afterDeposit: "Après cet acompte",
    cancel: "Annuler",
    create: "Créer la facture d'acompte",
    creating: "Création en cours...",
    error: "Erreur",
    percentPlaceholder: "Ex: 30",
    amountPlaceholder: "Ex: 5000",
    exceedsRemaining: "Le montant dépasse le solde restant",
    minPercent: "Le pourcentage doit être entre 1% et 100%",
    minAmount: "Le montant doit être supérieur à 0",
    currency: "DH",
  },
  en: {
    title: "Create Deposit Invoice",
    subtitle: "Create a deposit invoice for quote",
    mode: "Calculation mode",
    percent: "Percentage",
    amount: "Fixed amount",
    depositPercent: "Deposit percentage",
    depositAmount: "Deposit amount",
    dueDate: "Due date",
    notes: "Notes (optional)",
    notesPlaceholder: "Notes that will appear on the deposit invoice...",
    summary: "Summary",
    devisTotal: "Quote total incl. VAT",
    existingDeposits: "Existing deposits",
    remaining: "Remaining to invoice",
    newDeposit: "New deposit",
    afterDeposit: "After this deposit",
    cancel: "Cancel",
    create: "Create deposit invoice",
    creating: "Creating...",
    error: "Error",
    percentPlaceholder: "E.g., 30",
    amountPlaceholder: "E.g., 5000",
    exceedsRemaining: "Amount exceeds remaining balance",
    minPercent: "Percentage must be between 1% and 100%",
    minAmount: "Amount must be greater than 0",
    currency: "DH",
  },
  es: {
    title: "Crear factura de anticipo",
    subtitle: "Crear una factura de anticipo para el presupuesto",
    mode: "Modo de cálculo",
    percent: "Porcentaje",
    amount: "Monto fijo",
    depositPercent: "Porcentaje de anticipo",
    depositAmount: "Monto de anticipo",
    dueDate: "Fecha de vencimiento",
    notes: "Notas (opcional)",
    notesPlaceholder: "Notas que aparecerán en la factura de anticipo...",
    summary: "Resumen",
    devisTotal: "Total presupuesto con IVA",
    existingDeposits: "Anticipos existentes",
    remaining: "Pendiente de facturar",
    newDeposit: "Nuevo anticipo",
    afterDeposit: "Después de este anticipo",
    cancel: "Cancelar",
    create: "Crear factura de anticipo",
    creating: "Creando...",
    error: "Error",
    percentPlaceholder: "Ej: 30",
    amountPlaceholder: "Ej: 5000",
    exceedsRemaining: "El monto supera el saldo restante",
    minPercent: "El porcentaje debe estar entre 1% y 100%",
    minAmount: "El monto debe ser mayor a 0",
    currency: "DH",
  },
  ar: {
    title: "إنشاء فاتورة دفعة مقدمة",
    subtitle: "إنشاء فاتورة دفعة مقدمة للعرض",
    mode: "طريقة الحساب",
    percent: "نسبة مئوية",
    amount: "مبلغ ثابت",
    depositPercent: "نسبة الدفعة المقدمة",
    depositAmount: "مبلغ الدفعة المقدمة",
    dueDate: "تاريخ الاستحقاق",
    notes: "ملاحظات (اختياري)",
    notesPlaceholder: "ملاحظات ستظهر على فاتورة الدفعة المقدمة...",
    summary: "الملخص",
    devisTotal: "إجمالي العرض شامل الضريبة",
    existingDeposits: "الدفعات المقدمة الحالية",
    remaining: "المتبقي للفوترة",
    newDeposit: "دفعة مقدمة جديدة",
    afterDeposit: "بعد هذه الدفعة",
    cancel: "إلغاء",
    create: "إنشاء فاتورة الدفعة المقدمة",
    creating: "جاري الإنشاء...",
    error: "خطأ",
    percentPlaceholder: "مثال: 30",
    amountPlaceholder: "مثال: 5000",
    exceedsRemaining: "المبلغ يتجاوز الرصيد المتبقي",
    minPercent: "يجب أن تكون النسبة بين 1% و 100%",
    minAmount: "يجب أن يكون المبلغ أكبر من 0",
    currency: "درهم",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function CreateDepositInvoiceModal({
  isOpen,
  onClose,
  devisId,
  devisNumber,
  devisTotalTTC,
  existingDeposits,
  defaultDepositPercent = 30,
  locale,
}: CreateDepositInvoiceModalProps) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] || translations.fr;
  const isRTL = locale === "ar";

  // Form state
  const [mode, setMode] = useState<DepositMode>("percent");
  const [depositPercent, setDepositPercent] = useState(String(defaultDepositPercent));
  const [depositAmount, setDepositAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculations
  const remainingToInvoice = devisTotalTTC - existingDeposits;

  const calculatedDepositAmount = mode === "percent"
    ? (devisTotalTTC * (parseFloat(depositPercent) || 0)) / 100
    : parseFloat(depositAmount) || 0;

  const afterDeposit = remainingToInvoice - calculatedDepositAmount;

  // Validation
  const isValid = () => {
    if (mode === "percent") {
      const percent = parseFloat(depositPercent);
      return percent >= 1 && percent <= 100 && calculatedDepositAmount <= remainingToInvoice;
    } else {
      const amount = parseFloat(depositAmount);
      return amount > 0 && amount <= remainingToInvoice;
    }
  };

  const getValidationError = () => {
    if (mode === "percent") {
      const percent = parseFloat(depositPercent);
      if (isNaN(percent) || percent < 1 || percent > 100) {
        return t.minPercent;
      }
    } else {
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        return t.minAmount;
      }
    }
    if (calculatedDepositAmount > remainingToInvoice) {
      return t.exceedsRemaining;
    }
    return null;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ` ${t.currency}`;
  };

  // Handle submit
  const handleSubmit = async () => {
    const validationError = getValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {};

      if (mode === "percent") {
        body.depositPercent = parseFloat(depositPercent);
      } else {
        body.depositAmount = parseFloat(depositAmount);
      }

      if (dueDate) {
        body.dueDate = new Date(dueDate).toISOString();
      }

      if (notes) {
        body.notes = notes;
      }

      const response = await fetch(`/api/crm/documents/${devisId}/deposit-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create deposit invoice");
      }

      const data = await response.json();

      // Navigate to the new deposit invoice
      router.push(`/${locale}/admin/facturation/factures/${data.data.id}`);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg",
          isRTL && "rtl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Receipt className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.title}
              </h3>
              <p className="text-sm text-gray-500">
                {t.subtitle} {devisNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.mode}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("percent")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                  mode === "percent"
                    ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-500 dark:text-amber-400"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <Percent className="h-4 w-4" />
                {t.percent}
              </button>
              <button
                type="button"
                onClick={() => setMode("amount")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                  mode === "amount"
                    ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-500 dark:text-amber-400"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <DollarSign className="h-4 w-4" />
                {t.amount}
              </button>
            </div>
          </div>

          {/* Deposit Input */}
          {mode === "percent" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.depositPercent} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(e.target.value)}
                  min={1}
                  max={100}
                  placeholder={t.percentPlaceholder}
                  className="w-full px-3 py-2 pe-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
                <span className="absolute inset-y-0 end-3 flex items-center text-gray-400">
                  %
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.depositAmount} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min={0.01}
                  max={remainingToInvoice}
                  step="0.01"
                  placeholder={t.amountPlaceholder}
                  className="w-full px-3 py-2 pe-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
                <span className="absolute inset-y-0 end-3 flex items-center text-gray-400">
                  {t.currency}
                </span>
              </div>
            </div>
          )}

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.dueDate}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
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
              placeholder={t.notesPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {t.summary}
            </h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t.devisTotal}</span>
              <span className="font-medium">{formatCurrency(devisTotalTTC)}</span>
            </div>
            {existingDeposits > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.existingDeposits}</span>
                <span className="text-amber-600">-{formatCurrency(existingDeposits)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t.remaining}</span>
              <span className="font-medium">{formatCurrency(remainingToInvoice)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{t.newDeposit}</span>
              <span className={cn(
                "font-bold",
                calculatedDepositAmount > remainingToInvoice ? "text-red-600" : "text-green-600"
              )}>
                {formatCurrency(calculatedDepositAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t.afterDeposit}</span>
              <span className={cn(
                "font-medium",
                afterDeposit < 0 ? "text-red-600" : ""
              )}>
                {formatCurrency(Math.max(0, afterDeposit))}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Receipt className="h-4 w-4" />
            )}
            {isSubmitting ? t.creating : t.create}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateDepositInvoiceModal;
