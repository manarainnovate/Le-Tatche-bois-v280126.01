"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Summary {
  totalOutstanding: number;
  totalInvoices: number;
  totalClients: number;
  current: number;
  overdue: number;
  overduePercent: number;
  avgDaysOutstanding: number;
}

interface Aging {
  current: { count: number; total: number };
  days30: { count: number; total: number };
  days60: { count: number; total: number };
  days90: { count: number; total: number };
  over90: { count: number; total: number };
}

interface ClientData {
  clientId: string | null;
  clientName: string;
  clientNumber: string | null;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
  invoicesCount: number;
}

interface Invoice {
  id: string;
  number: string;
  date: Date | string;
  dueDate: Date | string | null;
  clientId: string | null;
  clientName: string;
  clientNumber: string | null;
  totalTTC: number;
  paidAmount: number;
  balance: number;
  daysOverdue: number;
  status: string;
  bucket: string;
}

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
}

interface ReceivablesReportClientProps {
  summary: Summary;
  aging: Aging;
  byClient: ClientData[];
  invoices: Invoice[];
  clients: Client[];
  selectedClientId: string;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Balance âgée",
    subtitle: "Créances clients par ancienneté",
    back: "Retour",
    export: "Exporter",
    allClients: "Tous les clients",
    summary: "Résumé",
    totalOutstanding: "Total créances",
    currentAmount: "Non échu",
    overdueAmount: "En retard",
    overduePercent: "% en retard",
    avgDays: "Jours moyens",
    invoices: "Factures",
    clients: "Clients",
    agingBreakdown: "Répartition par ancienneté",
    current: "Non échu",
    days1to30: "1-30 jours",
    days31to60: "31-60 jours",
    days61to90: "61-90 jours",
    over90: "90+ jours",
    byClient: "Par client",
    client: "Client",
    total: "Total",
    invoicesList: "Détail des factures",
    number: "N°",
    date: "Date",
    dueDate: "Échéance",
    amount: "Montant",
    balance: "Solde",
    daysOverdue: "Jours",
    status: "Statut",
    noData: "Aucune créance",
    view: "Voir",
    statuses: {
      SENT: "Envoyée",
      PARTIAL: "Partiel",
      OVERDUE: "En retard",
    },
  },
  en: {
    title: "Aging Report",
    subtitle: "Customer receivables by age",
    back: "Back",
    export: "Export",
    allClients: "All clients",
    summary: "Summary",
    totalOutstanding: "Total outstanding",
    currentAmount: "Current",
    overdueAmount: "Overdue",
    overduePercent: "% overdue",
    avgDays: "Avg. days",
    invoices: "Invoices",
    clients: "Clients",
    agingBreakdown: "Aging breakdown",
    current: "Current",
    days1to30: "1-30 days",
    days31to60: "31-60 days",
    days61to90: "61-90 days",
    over90: "90+ days",
    byClient: "By client",
    client: "Client",
    total: "Total",
    invoicesList: "Invoice details",
    number: "No.",
    date: "Date",
    dueDate: "Due date",
    amount: "Amount",
    balance: "Balance",
    daysOverdue: "Days",
    status: "Status",
    noData: "No receivables",
    view: "View",
    statuses: {
      SENT: "Sent",
      PARTIAL: "Partial",
      OVERDUE: "Overdue",
    },
  },
  es: {
    title: "Balance de antigüedad",
    subtitle: "Cuentas por cobrar por antigüedad",
    back: "Volver",
    export: "Exportar",
    allClients: "Todos los clientes",
    summary: "Resumen",
    totalOutstanding: "Total pendiente",
    currentAmount: "Corriente",
    overdueAmount: "Vencido",
    overduePercent: "% vencido",
    avgDays: "Días prom.",
    invoices: "Facturas",
    clients: "Clientes",
    agingBreakdown: "Desglose por antigüedad",
    current: "Corriente",
    days1to30: "1-30 días",
    days31to60: "31-60 días",
    days61to90: "61-90 días",
    over90: "90+ días",
    byClient: "Por cliente",
    client: "Cliente",
    total: "Total",
    invoicesList: "Detalle de facturas",
    number: "N°",
    date: "Fecha",
    dueDate: "Vencimiento",
    amount: "Monto",
    balance: "Saldo",
    daysOverdue: "Días",
    status: "Estado",
    noData: "Sin cuentas por cobrar",
    view: "Ver",
    statuses: {
      SENT: "Enviada",
      PARTIAL: "Parcial",
      OVERDUE: "Vencida",
    },
  },
  ar: {
    title: "تقرير الأعمار",
    subtitle: "المستحقات حسب العمر",
    back: "رجوع",
    export: "تصدير",
    allClients: "جميع العملاء",
    summary: "ملخص",
    totalOutstanding: "إجمالي المستحقات",
    currentAmount: "غير مستحق",
    overdueAmount: "متأخر",
    overduePercent: "% متأخر",
    avgDays: "متوسط الأيام",
    invoices: "الفواتير",
    clients: "العملاء",
    agingBreakdown: "التوزيع حسب العمر",
    current: "غير مستحق",
    days1to30: "1-30 يوم",
    days31to60: "31-60 يوم",
    days61to90: "61-90 يوم",
    over90: "+90 يوم",
    byClient: "حسب العميل",
    client: "العميل",
    total: "المجموع",
    invoicesList: "تفاصيل الفواتير",
    number: "رقم",
    date: "التاريخ",
    dueDate: "الاستحقاق",
    amount: "المبلغ",
    balance: "الرصيد",
    daysOverdue: "الأيام",
    status: "الحالة",
    noData: "لا توجد مستحقات",
    view: "عرض",
    statuses: {
      SENT: "مرسلة",
      PARTIAL: "جزئي",
      OVERDUE: "متأخرة",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ReceivablesReportClient({
  summary,
  aging,
  byClient,
  invoices,
  clients,
  selectedClientId,
  locale,
}: ReceivablesReportClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const isRTL = locale === "ar";

  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const handleClientFilter = (clientId: string) => {
    if (clientId) {
      router.push(`/${locale}/admin/rapports/creances?clientId=${clientId}`);
    } else {
      router.push(`/${locale}/admin/rapports/creances`);
    }
  };

  const toggleClient = (clientKey: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientKey)) {
      newExpanded.delete(clientKey);
    } else {
      newExpanded.add(clientKey);
    }
    setExpandedClients(newExpanded);
  };

  const handleExport = () => {
    const headers = [
      t.number,
      t.client,
      t.date,
      t.dueDate,
      t.amount,
      t.balance,
      t.daysOverdue,
    ];
    const rows = invoices.map((inv) => [
      inv.number,
      inv.clientName,
      formatDate(inv.date),
      formatDate(inv.dueDate),
      inv.totalTTC.toFixed(2),
      inv.balance.toFixed(2),
      inv.daysOverdue,
    ]);

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `balance-agee-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAging = summary.totalOutstanding || 1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OVERDUE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "PARTIAL":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case "current":
        return "bg-green-500";
      case "days30":
        return "bg-yellow-500";
      case "days60":
        return "bg-orange-500";
      case "days90":
        return "bg-red-400";
      case "over90":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className={`p-6 ${isRTL ? "rtl" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/rapports`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => handleClientFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t.allClients}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="h-5 w-5" />
            {t.export}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">{t.totalOutstanding}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalOutstanding)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-500">{t.currentAmount}</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(summary.current)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-500">{t.overdueAmount}</span>
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(summary.overdue)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">{t.overduePercent}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.overduePercent.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{t.avgDays}</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.avgDaysOutstanding}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{t.invoices}</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.totalInvoices}
          </p>
        </div>
      </div>

      {/* Aging Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.agingBreakdown}
        </h2>

        {/* Stacked Bar */}
        <div className="h-8 flex rounded-lg overflow-hidden mb-4">
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${(aging.current.total / totalAging) * 100}%` }}
            title={`${t.current}: ${formatCurrency(aging.current.total)}`}
          />
          <div
            className="bg-yellow-500 transition-all"
            style={{ width: `${(aging.days30.total / totalAging) * 100}%` }}
            title={`${t.days1to30}: ${formatCurrency(aging.days30.total)}`}
          />
          <div
            className="bg-orange-500 transition-all"
            style={{ width: `${(aging.days60.total / totalAging) * 100}%` }}
            title={`${t.days31to60}: ${formatCurrency(aging.days60.total)}`}
          />
          <div
            className="bg-red-400 transition-all"
            style={{ width: `${(aging.days90.total / totalAging) * 100}%` }}
            title={`${t.days61to90}: ${formatCurrency(aging.days90.total)}`}
          />
          <div
            className="bg-red-600 transition-all"
            style={{ width: `${(aging.over90.total / totalAging) * 100}%` }}
            title={`${t.over90}: ${formatCurrency(aging.over90.total)}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { key: "current", label: t.current, color: "bg-green-500", data: aging.current },
            { key: "days30", label: t.days1to30, color: "bg-yellow-500", data: aging.days30 },
            { key: "days60", label: t.days31to60, color: "bg-orange-500", data: aging.days60 },
            { key: "days90", label: t.days61to90, color: "bg-red-400", data: aging.days90 },
            { key: "over90", label: t.over90, color: "bg-red-600", data: aging.over90 },
          ].map((item) => (
            <div key={item.key} className="flex items-start gap-2">
              <div className={`w-3 h-3 rounded ${item.color} mt-1`} />
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(item.data.total)}
                </p>
                <p className="text-xs text-gray-400">{item.data.count} fac.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Client Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t.byClient}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t.client}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t.current}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t.days1to30}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t.days31to60}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t.days61to90}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t.over90}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t.total}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {byClient.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                byClient.map((client) => {
                  const clientKey = client.clientId || client.clientName;
                  const isExpanded = expandedClients.has(clientKey);
                  const clientInvoices = invoices.filter(
                    (inv) =>
                      (inv.clientId || inv.clientName) === clientKey
                  );

                  return (
                    <>
                      <tr
                        key={clientKey}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer"
                        onClick={() => toggleClient(clientKey)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {client.clientName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {client.invoicesCount} {t.invoices.toLowerCase()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-green-600">
                          {client.current > 0 ? formatCurrency(client.current) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-yellow-600">
                          {client.days30 > 0 ? formatCurrency(client.days30) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-orange-600">
                          {client.days60 > 0 ? formatCurrency(client.days60) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-red-400">
                          {client.days90 > 0 ? formatCurrency(client.days90) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-red-600">
                          {client.over90 > 0 ? formatCurrency(client.over90) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(client.total)}
                        </td>
                      </tr>
                      {isExpanded &&
                        clientInvoices.map((inv) => (
                          <tr
                            key={inv.id}
                            className="bg-gray-50 dark:bg-gray-900/30"
                          >
                            <td className="px-4 py-2 pl-12">
                              <Link
                                href={`/${locale}/admin/facturation/factures/${inv.id}`}
                                className="text-sm text-amber-600 hover:text-amber-700"
                              >
                                {inv.number}
                              </Link>
                            </td>
                            <td
                              colSpan={5}
                              className="px-4 py-2 text-right text-xs text-gray-500"
                            >
                              {formatDate(inv.dueDate)} ({inv.daysOverdue} jours)
                            </td>
                            <td className="px-4 py-2 text-right text-sm font-medium">
                              <span className={`${getBucketColor(inv.bucket)} text-white px-2 py-0.5 rounded text-xs`}>
                                {formatCurrency(inv.balance)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
