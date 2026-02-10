"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Receipt,
  CreditCard,
  Clock,
} from "lucide-react";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Summary {
  count: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  paidAmount: number;
  balance: number;
}

interface PeriodData {
  period: string;
  invoicesCount: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  paidAmount: number;
  balance: number;
}

interface ClientData {
  clientId: string | null;
  clientName: string;
  invoicesCount: number;
  totalTTC: number;
  paidAmount: number;
}

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
}

interface Filters {
  startDate: string;
  endDate: string;
  groupBy: string;
  clientId: string;
}

interface SalesReportClientProps {
  summary: Summary;
  byPeriod: PeriodData[];
  byClient: ClientData[];
  clients: Client[];
  filters: Filters;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Rapport des ventes",
    back: "Retour",
    export: "Exporter",
    filters: "Filtres",
    startDate: "Date début",
    endDate: "Date fin",
    groupBy: "Grouper par",
    day: "Jour",
    week: "Semaine",
    month: "Mois",
    allClients: "Tous les clients",
    apply: "Appliquer",
    summary: "Résumé",
    invoices: "Factures",
    totalHT: "Total HT",
    totalTVA: "Total TVA",
    totalTTC: "Total TTC",
    collected: "Encaissé",
    outstanding: "Reste à percevoir",
    byPeriod: "Par période",
    period: "Période",
    count: "Nb.",
    byClient: "Par client",
    client: "Client",
    collectionRate: "Taux d'encaissement",
    noData: "Aucune donnée pour cette période",
  },
  en: {
    title: "Sales Report",
    back: "Back",
    export: "Export",
    filters: "Filters",
    startDate: "Start date",
    endDate: "End date",
    groupBy: "Group by",
    day: "Day",
    week: "Week",
    month: "Month",
    allClients: "All clients",
    apply: "Apply",
    summary: "Summary",
    invoices: "Invoices",
    totalHT: "Total excl. tax",
    totalTVA: "Total VAT",
    totalTTC: "Total incl. tax",
    collected: "Collected",
    outstanding: "Outstanding",
    byPeriod: "By period",
    period: "Period",
    count: "No.",
    byClient: "By client",
    client: "Client",
    collectionRate: "Collection rate",
    noData: "No data for this period",
  },
  es: {
    title: "Informe de ventas",
    back: "Volver",
    export: "Exportar",
    filters: "Filtros",
    startDate: "Fecha inicio",
    endDate: "Fecha fin",
    groupBy: "Agrupar por",
    day: "Día",
    week: "Semana",
    month: "Mes",
    allClients: "Todos los clientes",
    apply: "Aplicar",
    summary: "Resumen",
    invoices: "Facturas",
    totalHT: "Total sin IVA",
    totalTVA: "Total IVA",
    totalTTC: "Total con IVA",
    collected: "Cobrado",
    outstanding: "Pendiente",
    byPeriod: "Por período",
    period: "Período",
    count: "Nro.",
    byClient: "Por cliente",
    client: "Cliente",
    collectionRate: "Tasa de cobro",
    noData: "Sin datos para este período",
  },
  ar: {
    title: "تقرير المبيعات",
    back: "رجوع",
    export: "تصدير",
    filters: "تصفية",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    groupBy: "تجميع حسب",
    day: "يوم",
    week: "أسبوع",
    month: "شهر",
    allClients: "جميع العملاء",
    apply: "تطبيق",
    summary: "ملخص",
    invoices: "الفواتير",
    totalHT: "المجموع بدون ضريبة",
    totalTVA: "مجموع الضريبة",
    totalTTC: "المجموع شامل الضريبة",
    collected: "محصل",
    outstanding: "متبقي",
    byPeriod: "حسب الفترة",
    period: "الفترة",
    count: "عدد",
    byClient: "حسب العميل",
    client: "العميل",
    collectionRate: "معدل التحصيل",
    noData: "لا توجد بيانات لهذه الفترة",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function SalesReportClient({
  summary,
  byPeriod,
  byClient,
  clients,
  filters,
  locale,
}: SalesReportClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const isRTL = locale === "ar";

  const [startDate, setStartDate] = useState(filters.startDate);
  const [endDate, setEndDate] = useState(filters.endDate);
  const [groupBy, setGroupBy] = useState(filters.groupBy);
  const [clientId, setClientId] = useState(filters.clientId);

  const { format: formatCurrency } = useCurrency();

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    params.set("groupBy", groupBy);
    if (clientId) params.set("clientId", clientId);
    router.push(`/${locale}/admin/rapports/ventes?${params.toString()}`);
  };

  const handleExport = () => {
    // Export to CSV
    const headers = [t.period, t.count, t.totalHT, t.totalTVA, t.totalTTC, t.collected, t.outstanding];
    const rows = byPeriod.map((p) => [
      p.period,
      p.invoicesCount,
      p.totalHT.toFixed(2),
      p.totalTVA.toFixed(2),
      p.totalTTC.toFixed(2),
      p.paidAmount.toFixed(2),
      p.balance.toFixed(2),
    ]);

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-ventes-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const collectionRate = summary.totalTTC > 0 ? (summary.paidAmount / summary.totalTTC) * 100 : 0;
  const maxPeriodValue = Math.max(...byPeriod.map((p) => p.totalTTC));

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download className="h-5 w-5" />
          {t.export}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {t.filters}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">{t.startDate}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">{t.endDate}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">{t.groupBy}</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="day">{t.day}</option>
              <option value="week">{t.week}</option>
              <option value="month">{t.month}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">{t.client}</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t.allClients}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              {t.apply}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{t.invoices}</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.count}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-2">{t.totalHT}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalHT)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-2">{t.totalTVA}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalTVA)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-500">{t.totalTTC}</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(summary.totalTTC)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-500">{t.collected}</span>
          </div>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(summary.paidAmount)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-gray-500">{t.outstanding}</span>
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Collection Rate Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.collectionRate}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {collectionRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Period Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t.byPeriod}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.period}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t.count}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t.totalTTC}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t.collected}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {byPeriod.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      {t.noData}
                    </td>
                  </tr>
                ) : (
                  byPeriod.map((period, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {period.period}
                          </p>
                          <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{
                                width: `${
                                  maxPeriodValue > 0
                                    ? (period.totalTTC / maxPeriodValue) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {period.invoicesCount}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(period.totalTTC)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400">
                        {formatCurrency(period.paidAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Client Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t.byClient}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.client}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t.invoices}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t.totalTTC}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t.collected}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {byClient.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      {t.noData}
                    </td>
                  </tr>
                ) : (
                  byClient.map((client, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                          {client.clientName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {client.invoicesCount}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(client.totalTTC)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400">
                        {formatCurrency(client.paidAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
