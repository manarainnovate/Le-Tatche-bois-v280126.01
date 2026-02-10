"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Invoice {
  id: string;
  number: string;
  date: Date | string;
  totalTTC: number;
  paidAmount: number;
  balance: number;
  status: string;
}

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
  documents: Invoice[];
}

interface PreselectedInvoice {
  id: string;
  number: string;
  clientId: string | null;
  clientName: string;
  totalTTC: number;
  paidAmount: number;
  balance: number;
}

interface NewPaymentFormClientProps {
  clients: Client[];
  preselectedInvoice: PreselectedInvoice | null;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Nouveau paiement",
    back: "Retour",
    selectClient: "Sélectionner un client",
    selectInvoice: "Sélectionner une facture",
    paymentDetails: "Détails du paiement",
    amount: "Montant",
    date: "Date",
    method: "Mode de paiement",
    reference: "Référence (optionnel)",
    notes: "Notes (optionnel)",
    invoiceInfo: "Informations facture",
    invoiceNumber: "N° Facture",
    invoiceTotal: "Total TTC",
    alreadyPaid: "Déjà payé",
    remaining: "Reste à payer",
    save: "Enregistrer le paiement",
    saving: "Enregistrement...",
    noClients: "Aucun client avec factures impayées",
    noInvoices: "Aucune facture impayée",
    methods: {
      CASH: "Espèces",
      CHECK: "Chèque",
      BANK_TRANSFER: "Virement bancaire",
      CARD: "Carte bancaire",
      OTHER: "Autre",
    },
    errors: {
      clientRequired: "Veuillez sélectionner un client",
      invoiceRequired: "Veuillez sélectionner une facture",
      amountRequired: "Veuillez saisir un montant",
      amountExceedsBalance: "Le montant dépasse le solde restant",
    },
  },
  en: {
    title: "New payment",
    back: "Back",
    selectClient: "Select a client",
    selectInvoice: "Select an invoice",
    paymentDetails: "Payment details",
    amount: "Amount",
    date: "Date",
    method: "Payment method",
    reference: "Reference (optional)",
    notes: "Notes (optional)",
    invoiceInfo: "Invoice information",
    invoiceNumber: "Invoice No.",
    invoiceTotal: "Total incl. tax",
    alreadyPaid: "Already paid",
    remaining: "Remaining",
    save: "Save payment",
    saving: "Saving...",
    noClients: "No clients with unpaid invoices",
    noInvoices: "No unpaid invoices",
    methods: {
      CASH: "Cash",
      CHECK: "Check",
      BANK_TRANSFER: "Bank transfer",
      CARD: "Credit card",
      OTHER: "Other",
    },
    errors: {
      clientRequired: "Please select a client",
      invoiceRequired: "Please select an invoice",
      amountRequired: "Please enter an amount",
      amountExceedsBalance: "Amount exceeds remaining balance",
    },
  },
  es: {
    title: "Nuevo pago",
    back: "Volver",
    selectClient: "Seleccionar cliente",
    selectInvoice: "Seleccionar factura",
    paymentDetails: "Detalles del pago",
    amount: "Monto",
    date: "Fecha",
    method: "Método de pago",
    reference: "Referencia (opcional)",
    notes: "Notas (opcional)",
    invoiceInfo: "Información de factura",
    invoiceNumber: "N° Factura",
    invoiceTotal: "Total con IVA",
    alreadyPaid: "Ya pagado",
    remaining: "Restante",
    save: "Guardar pago",
    saving: "Guardando...",
    noClients: "No hay clientes con facturas pendientes",
    noInvoices: "No hay facturas pendientes",
    methods: {
      CASH: "Efectivo",
      CHECK: "Cheque",
      BANK_TRANSFER: "Transferencia",
      CARD: "Tarjeta de crédito",
      OTHER: "Otro",
    },
    errors: {
      clientRequired: "Por favor seleccione un cliente",
      invoiceRequired: "Por favor seleccione una factura",
      amountRequired: "Por favor ingrese un monto",
      amountExceedsBalance: "El monto excede el saldo restante",
    },
  },
  ar: {
    title: "دفعة جديدة",
    back: "رجوع",
    selectClient: "اختر العميل",
    selectInvoice: "اختر الفاتورة",
    paymentDetails: "تفاصيل الدفع",
    amount: "المبلغ",
    date: "التاريخ",
    method: "طريقة الدفع",
    reference: "المرجع (اختياري)",
    notes: "ملاحظات (اختياري)",
    invoiceInfo: "معلومات الفاتورة",
    invoiceNumber: "رقم الفاتورة",
    invoiceTotal: "المجموع شامل الضريبة",
    alreadyPaid: "المدفوع",
    remaining: "المتبقي",
    save: "حفظ الدفعة",
    saving: "جاري الحفظ...",
    noClients: "لا يوجد عملاء بفواتير غير مدفوعة",
    noInvoices: "لا توجد فواتير غير مدفوعة",
    methods: {
      CASH: "نقدي",
      CHECK: "شيك",
      BANK_TRANSFER: "تحويل بنكي",
      CARD: "بطاقة ائتمان",
      OTHER: "أخرى",
    },
    errors: {
      clientRequired: "يرجى اختيار العميل",
      invoiceRequired: "يرجى اختيار الفاتورة",
      amountRequired: "يرجى إدخال المبلغ",
      amountExceedsBalance: "المبلغ يتجاوز الرصيد المتبقي",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function NewPaymentFormClient({
  clients,
  preselectedInvoice,
  locale,
}: NewPaymentFormClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const isRTL = locale === "ar";

  const [selectedClientId, setSelectedClientId] = useState(
    preselectedInvoice?.clientId || ""
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(
    preselectedInvoice?.id || ""
  );
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Get selected client's invoices
  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const invoices = selectedClient?.documents || [];

  // Get selected invoice details
  const selectedInvoice = preselectedInvoice?.id === selectedInvoiceId
    ? preselectedInvoice
    : invoices.find((i) => i.id === selectedInvoiceId);

  // Auto-fill amount when invoice is selected
  useEffect(() => {
    if (selectedInvoice && !amount) {
      setAmount(selectedInvoice.balance.toString());
    }
  }, [selectedInvoice]);

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const getMethodIcon = (methodType: string) => {
    switch (methodType) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!selectedInvoiceId) {
      setError(t.errors.invoiceRequired);
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError(t.errors.amountRequired);
      return;
    }

    if (selectedInvoice && amountNum > selectedInvoice.balance) {
      setError(t.errors.amountExceedsBalance);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/crm/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedInvoiceId,
          amount: amountNum,
          date: new Date(date),
          method,
          reference: reference || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/${locale}/admin/facturation/paiements`);
        router.refresh();
      } else {
        setError(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-6 ${isRTL ? "rtl" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/${locale}/admin/facturation/paiements`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Client & Invoice Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.selectInvoice}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Selection */}
              {!preselectedInvoice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.selectClient}
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      setSelectedInvoiceId("");
                      setAmount("");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.selectClient}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.clientNumber} - {client.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Invoice Selection */}
              {!preselectedInvoice && selectedClientId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.selectInvoice}
                  </label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => {
                      setSelectedInvoiceId(e.target.value);
                      const inv = invoices.find((i) => i.id === e.target.value);
                      if (inv) setAmount(inv.balance.toString());
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.selectInvoice}</option>
                    {invoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.number} - {formatCurrency(invoice.balance)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preselected Invoice Info */}
              {preselectedInvoice && (
                <div className="md:col-span-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <span className="font-medium">{t.invoiceNumber}:</span>{" "}
                    {preselectedInvoice.number}
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <span className="font-medium">Client:</span>{" "}
                    {preselectedInvoice.clientName}
                  </p>
                </div>
              )}
            </div>

            {/* Selected Invoice Details */}
            {selectedInvoice && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t.invoiceInfo}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.invoiceTotal}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(selectedInvoice.totalTTC)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.alreadyPaid}
                    </p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(selectedInvoice.paidAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.remaining}
                    </p>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {formatCurrency(selectedInvoice.balance)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.paymentDetails}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.amount} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedInvoice?.balance || undefined}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    MAD
                  </span>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.date} *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Method */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.method} *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {(["CASH", "CHECK", "BANK_TRANSFER", "CARD", "OTHER"] as const).map(
                    (m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                          method === m
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        {getMethodIcon(m)}
                        <span className="text-sm font-medium">
                          {t.methods[m]}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.reference}
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={
                    method === "CHECK"
                      ? "N° Chèque"
                      : method === "BANK_TRANSFER"
                      ? "N° Virement"
                      : ""
                  }
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.notes}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/${locale}/admin/facturation/paiements`}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t.back}
            </Link>
            <button
              type="submit"
              disabled={saving || !selectedInvoiceId || !amount}
              className="inline-flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
