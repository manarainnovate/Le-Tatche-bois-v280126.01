"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Mail,
  Phone,
  FileText,
  Download,
  Send,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/documents/PaymentModal";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  total: number;
  paidAmount: number;
  balance: number;
  daysOverdue: number;
  status: string;
}

interface AgingBucket {
  count: number;
  amount: number;
}

interface ImpayesPageClientProps {
  locale: string;
  invoices: Invoice[];
  agingData: {
    current: AgingBucket;
    days1to30: AgingBucket;
    days31to60: AgingBucket;
    days61to90: AgingBucket;
    over90: AgingBucket;
  };
  totalUnpaid: number;
  totalOverdue: number;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Factures impayées",
    subtitle: "Suivi des créances clients",
    totalUnpaid: "Total impayé",
    totalOverdue: "Total en retard",
    current: "Courant",
    days1to30: "1-30 jours",
    days31to60: "31-60 jours",
    days61to90: "61-90 jours",
    over90: ">90 jours",
    invoices: "factures",
    sendReminders: "Envoyer rappels",
    export: "Exporter",
    overdueInvoices: "Factures en retard",
    allUnpaid: "Toutes les impayées",
    number: "N°",
    client: "Client",
    date: "Date",
    dueDate: "Échéance",
    amount: "Montant",
    balance: "Solde",
    delay: "Retard",
    actions: "Actions",
    days: "jours",
    view: "Voir",
    addPayment: "Paiement",
    sendReminder: "Rappel",
    noInvoices: "Aucune facture impayée",
    filterByAge: "Filtrer par ancienneté",
    all: "Toutes",
  },
  en: {
    title: "Unpaid Invoices",
    subtitle: "Customer receivables tracking",
    totalUnpaid: "Total unpaid",
    totalOverdue: "Total overdue",
    current: "Current",
    days1to30: "1-30 days",
    days31to60: "31-60 days",
    days61to90: "61-90 days",
    over90: ">90 days",
    invoices: "invoices",
    sendReminders: "Send reminders",
    export: "Export",
    overdueInvoices: "Overdue invoices",
    allUnpaid: "All unpaid",
    number: "#",
    client: "Client",
    date: "Date",
    dueDate: "Due date",
    amount: "Amount",
    balance: "Balance",
    delay: "Overdue",
    actions: "Actions",
    days: "days",
    view: "View",
    addPayment: "Payment",
    sendReminder: "Reminder",
    noInvoices: "No unpaid invoices",
    filterByAge: "Filter by age",
    all: "All",
  },
  es: {
    title: "Facturas impagadas",
    subtitle: "Seguimiento de cuentas por cobrar",
    totalUnpaid: "Total impago",
    totalOverdue: "Total vencido",
    current: "Corriente",
    days1to30: "1-30 días",
    days31to60: "31-60 días",
    days61to90: "61-90 días",
    over90: ">90 días",
    invoices: "facturas",
    sendReminders: "Enviar recordatorios",
    export: "Exportar",
    overdueInvoices: "Facturas vencidas",
    allUnpaid: "Todas las impagadas",
    number: "N°",
    client: "Cliente",
    date: "Fecha",
    dueDate: "Vencimiento",
    amount: "Monto",
    balance: "Saldo",
    delay: "Retraso",
    actions: "Acciones",
    days: "días",
    view: "Ver",
    addPayment: "Pago",
    sendReminder: "Recordatorio",
    noInvoices: "Sin facturas impagadas",
    filterByAge: "Filtrar por antigüedad",
    all: "Todas",
  },
  ar: {
    title: "الفواتير غير المدفوعة",
    subtitle: "تتبع الذمم المدينة",
    totalUnpaid: "إجمالي غير مدفوع",
    totalOverdue: "إجمالي متأخر",
    current: "جاري",
    days1to30: "1-30 يوم",
    days31to60: "31-60 يوم",
    days61to90: "61-90 يوم",
    over90: ">90 يوم",
    invoices: "فواتير",
    sendReminders: "إرسال تذكيرات",
    export: "تصدير",
    overdueInvoices: "الفواتير المتأخرة",
    allUnpaid: "كل غير المدفوعة",
    number: "رقم",
    client: "العميل",
    date: "التاريخ",
    dueDate: "تاريخ الاستحقاق",
    amount: "المبلغ",
    balance: "الرصيد",
    delay: "التأخير",
    actions: "الإجراءات",
    days: "أيام",
    view: "عرض",
    addPayment: "دفع",
    sendReminder: "تذكير",
    noInvoices: "لا توجد فواتير غير مدفوعة",
    filterByAge: "تصفية حسب العمر",
    all: "الكل",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ImpayesPageClient({
  locale,
  invoices,
  agingData,
  totalUnpaid,
  totalOverdue,
}: ImpayesPageClientProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { format: formatCurrency } = useCurrency();

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  // Filter invoices based on selected aging bucket
  const filteredInvoices = invoices.filter((inv) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "current") return inv.daysOverdue <= 0;
    if (selectedFilter === "1-30") return inv.daysOverdue > 0 && inv.daysOverdue <= 30;
    if (selectedFilter === "31-60") return inv.daysOverdue > 30 && inv.daysOverdue <= 60;
    if (selectedFilter === "61-90") return inv.daysOverdue > 60 && inv.daysOverdue <= 90;
    if (selectedFilter === "90+") return inv.daysOverdue > 90;
    return true;
  });

  // Group invoices by client
  const groupedByClient = filteredInvoices.reduce((acc, inv) => {
    if (!acc[inv.clientId]) {
      acc[inv.clientId] = {
        clientId: inv.clientId,
        clientName: inv.clientName,
        clientEmail: inv.clientEmail,
        clientPhone: inv.clientPhone,
        invoices: [],
        totalBalance: 0,
      };
    }
    acc[inv.clientId].invoices.push(inv);
    acc[inv.clientId].totalBalance += inv.balance;
    return acc;
  }, {} as Record<string, { clientId: string; clientName: string; clientEmail: string | null; clientPhone: string | null; invoices: Invoice[]; totalBalance: number }>);

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const handleAddPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  const agingBuckets = [
    { key: "current", label: t.current, data: agingData.current, color: "bg-green-500" },
    { key: "1-30", label: t.days1to30, data: agingData.days1to30, color: "bg-yellow-500" },
    { key: "31-60", label: t.days31to60, data: agingData.days31to60, color: "bg-orange-500" },
    { key: "61-90", label: t.days61to90, data: agingData.days61to90, color: "bg-red-500" },
    { key: "90+", label: t.over90, data: agingData.over90, color: "bg-red-700" },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="h-4 w-4" />
            {t.export}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
            <Send className="h-4 w-4" />
            {t.sendReminders}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.totalUnpaid}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalUnpaid)} DH
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.totalOverdue}</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(totalOverdue)} DH
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.allUnpaid}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {invoices.length} {t.invoices}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.overdueInvoices}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {invoices.filter((i) => i.daysOverdue > 0).length} {t.invoices}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aging Buckets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          {t.filterByAge}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <button
            onClick={() => setSelectedFilter("all")}
            className={cn(
              "p-3 rounded-lg border-2 transition-all text-center",
              selectedFilter === "all"
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
            )}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.all}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalUnpaid)}
            </p>
            <p className="text-xs text-gray-500">{invoices.length} {t.invoices}</p>
          </button>

          {agingBuckets.map((bucket) => (
            <button
              key={bucket.key}
              onClick={() => setSelectedFilter(bucket.key)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-center",
                selectedFilter === bucket.key
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className={cn("w-2 h-2 rounded-full", bucket.color)} />
                <p className="text-xs text-gray-500 dark:text-gray-400">{bucket.label}</p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(bucket.data.amount)}
              </p>
              <p className="text-xs text-gray-500">{bucket.data.count} {t.invoices}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table - Grouped by Client */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {Object.keys(groupedByClient).length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t.noInvoices}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.values(groupedByClient).map((client) => (
              <div key={client.clientId}>
                {/* Client Header */}
                <button
                  onClick={() => toggleClient(client.clientId)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">
                        {client.clientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {client.clientName}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {client.clientEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.clientEmail}
                          </span>
                        )}
                        {client.clientPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.clientPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{client.invoices.length} {t.invoices}</p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(client.totalBalance)} DH
                      </p>
                    </div>
                    {expandedClients.has(client.clientId) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Client Invoices */}
                {expandedClients.has(client.clientId) && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          <th className="px-4 py-2 text-left">{t.number}</th>
                          <th className="px-4 py-2 text-left">{t.date}</th>
                          <th className="px-4 py-2 text-left">{t.dueDate}</th>
                          <th className="px-4 py-2 text-right">{t.amount}</th>
                          <th className="px-4 py-2 text-right">{t.balance}</th>
                          <th className="px-4 py-2 text-center">{t.delay}</th>
                          <th className="px-4 py-2 text-right">{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {client.invoices.map((invoice) => (
                          <tr key={invoice.id} className="text-sm">
                            <td className="px-4 py-2">
                              <span className="font-mono text-amber-600">
                                {invoice.number}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                              {formatDate(invoice.date)}
                            </td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                              {formatDate(invoice.dueDate)}
                            </td>
                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                              {formatCurrency(invoice.total)} DH
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-red-600">
                              {formatCurrency(invoice.balance)} DH
                            </td>
                            <td className="px-4 py-2 text-center">
                              {invoice.daysOverdue > 0 ? (
                                <span className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                  invoice.daysOverdue <= 30
                                    ? "bg-yellow-100 text-yellow-700"
                                    : invoice.daysOverdue <= 60
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-red-100 text-red-700"
                                )}>
                                  {invoice.daysOverdue} {t.days}
                                </span>
                              ) : (
                                <span className="text-green-600 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  href={`/${locale}/admin/facturation/factures/${invoice.id}`}
                                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                  title={t.view}
                                >
                                  <Eye className="h-4 w-4 text-gray-500" />
                                </Link>
                                <button
                                  onClick={() => handleAddPayment(invoice)}
                                  className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                                  title={t.addPayment}
                                >
                                  <CreditCard className="h-4 w-4 text-green-600" />
                                </button>
                                <button
                                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                  title={t.sendReminder}
                                >
                                  <Mail className="h-4 w-4 text-blue-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onSuccess={() => {
          // Refresh the page to get updated data
          window.location.reload();
        }}
        locale={locale}
      />
    </div>
  );
}

export default ImpayesPageClient;
