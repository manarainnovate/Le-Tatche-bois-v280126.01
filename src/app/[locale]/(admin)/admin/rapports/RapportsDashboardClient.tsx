"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  FileText,
  Users,
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface KPIs {
  revenue: { current: number; previous: number; growth: number };
  payments: { current: number; previous: number; growth: number; count: number };
  invoices: { count: number; total: number };
  quotes: { count: number; total: number; conversionRate: number };
  outstanding: { total: number; count: number };
  overdue: { total: number; count: number };
  clients: { active: number };
  projects: { inProgress: number; completed: number; total: number };
}

interface Charts {
  monthlyRevenue: { month: string; invoiced: number; collected: number }[];
  topClients: { clientId: string | null; clientName: string; total: number }[];
}

interface RapportsDashboardClientProps {
  kpis: KPIs;
  charts: Charts;
  period: string;
  year: number;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Tableau de bord",
    subtitle: "Vue d'ensemble de votre activité",
    period: "Période",
    month: "Ce mois",
    quarter: "Ce trimestre",
    year: "Cette année",
    revenue: "Chiffre d'affaires",
    payments: "Encaissements",
    invoices: "Factures",
    quotes: "Devis",
    outstanding: "Créances",
    overdue: "En retard",
    clients: "Clients actifs",
    projects: "Projets",
    conversionRate: "Taux de conversion",
    revenueChart: "Évolution du CA",
    invoiced: "Facturé",
    collected: "Encaissé",
    topClients: "Top clients",
    viewAll: "Voir tout",
    salesReport: "Rapport des ventes",
    receivablesReport: "Balance âgée",
    inProgress: "en cours",
    completed: "terminés",
    vsLastPeriod: "vs période précédente",
    noData: "Pas de données",
  },
  en: {
    title: "Dashboard",
    subtitle: "Overview of your business",
    period: "Period",
    month: "This month",
    quarter: "This quarter",
    year: "This year",
    revenue: "Revenue",
    payments: "Collections",
    invoices: "Invoices",
    quotes: "Quotes",
    outstanding: "Receivables",
    overdue: "Overdue",
    clients: "Active clients",
    projects: "Projects",
    conversionRate: "Conversion rate",
    revenueChart: "Revenue trend",
    invoiced: "Invoiced",
    collected: "Collected",
    topClients: "Top clients",
    viewAll: "View all",
    salesReport: "Sales report",
    receivablesReport: "Aging report",
    inProgress: "in progress",
    completed: "completed",
    vsLastPeriod: "vs previous period",
    noData: "No data",
  },
  es: {
    title: "Panel de control",
    subtitle: "Resumen de su negocio",
    period: "Período",
    month: "Este mes",
    quarter: "Este trimestre",
    year: "Este año",
    revenue: "Ingresos",
    payments: "Cobros",
    invoices: "Facturas",
    quotes: "Cotizaciones",
    outstanding: "Cuentas por cobrar",
    overdue: "Vencidas",
    clients: "Clientes activos",
    projects: "Proyectos",
    conversionRate: "Tasa de conversión",
    revenueChart: "Tendencia de ingresos",
    invoiced: "Facturado",
    collected: "Cobrado",
    topClients: "Mejores clientes",
    viewAll: "Ver todo",
    salesReport: "Informe de ventas",
    receivablesReport: "Balance por antigüedad",
    inProgress: "en progreso",
    completed: "completados",
    vsLastPeriod: "vs período anterior",
    noData: "Sin datos",
  },
  ar: {
    title: "لوحة التحكم",
    subtitle: "نظرة عامة على نشاطك",
    period: "الفترة",
    month: "هذا الشهر",
    quarter: "هذا الربع",
    year: "هذا العام",
    revenue: "الإيرادات",
    payments: "التحصيلات",
    invoices: "الفواتير",
    quotes: "عروض الأسعار",
    outstanding: "المستحقات",
    overdue: "متأخرة",
    clients: "العملاء النشطون",
    projects: "المشاريع",
    conversionRate: "معدل التحويل",
    revenueChart: "تطور الإيرادات",
    invoiced: "مفوتر",
    collected: "محصل",
    topClients: "أفضل العملاء",
    viewAll: "عرض الكل",
    salesReport: "تقرير المبيعات",
    receivablesReport: "تقرير الأعمار",
    inProgress: "قيد التنفيذ",
    completed: "مكتملة",
    vsLastPeriod: "مقابل الفترة السابقة",
    noData: "لا توجد بيانات",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function RapportsDashboardClient({
  kpis,
  charts,
  period,
  year,
  locale,
}: RapportsDashboardClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const isRTL = locale === "ar";

  const { format: formatCurrency } = useCurrency();

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const handlePeriodChange = (newPeriod: string) => {
    router.push(`/${locale}/admin/rapports?period=${newPeriod}&year=${year}`);
  };

  // Calculate max value for chart
  const maxChartValue = Math.max(
    ...charts.monthlyRevenue.flatMap((m) => [m.invoiced, m.collected])
  );

  return (
    <div className={`p-6 ${isRTL ? "rtl" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="month">{t.month}</option>
            <option value="quarter">{t.quarter}</option>
            <option value="year">{t.year}</option>
          </select>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            {kpis.revenue.growth !== 0 && (
              <span
                className={`flex items-center text-sm font-medium ${
                  kpis.revenue.growth >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {kpis.revenue.growth >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {formatPercent(kpis.revenue.growth)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.revenue}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(kpis.revenue.current)}
          </p>
        </div>

        {/* Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            {kpis.payments.growth !== 0 && (
              <span
                className={`flex items-center text-sm font-medium ${
                  kpis.payments.growth >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {kpis.payments.growth >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {formatPercent(kpis.payments.growth)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.payments}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(kpis.payments.current)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {kpis.payments.count} {t.payments.toLowerCase()}
          </p>
        </div>

        {/* Outstanding */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm text-gray-500">
              {kpis.outstanding.count} {t.invoices.toLowerCase()}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.outstanding}</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(kpis.outstanding.total)}
          </p>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm text-gray-500">
              {kpis.overdue.count} {t.invoices.toLowerCase()}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.overdue}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(kpis.overdue.total)}
          </p>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.invoices}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {kpis.invoices.count}
              </p>
            </div>
          </div>
        </div>

        {/* Quotes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.quotes}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {kpis.quotes.count}
              </p>
              <p className="text-xs text-gray-500">
                {kpis.quotes.conversionRate.toFixed(0)}% {t.conversionRate.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Clients */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.clients}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {kpis.clients.active}
              </p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.projects}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {kpis.projects.inProgress} {t.inProgress}
              </p>
              <p className="text-xs text-gray-500">
                {kpis.projects.completed} {t.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.revenueChart}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-500">{t.invoiced}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-500">{t.collected}</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-3">
            {charts.monthlyRevenue.slice(-6).map((month, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{month.month}</span>
                  <span>
                    {formatCurrency(month.invoiced)} / {formatCurrency(month.collected)}
                  </span>
                </div>
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div
                    className="absolute h-full bg-amber-500/50 rounded-full"
                    style={{
                      width: `${
                        maxChartValue > 0 ? (month.invoiced / maxChartValue) * 100 : 0
                      }%`,
                    }}
                  />
                  <div
                    className="absolute h-full bg-green-500 rounded-full"
                    style={{
                      width: `${
                        maxChartValue > 0 ? (month.collected / maxChartValue) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.topClients}
            </h2>
            <Link
              href={`/${locale}/admin/crm/clients`}
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              {t.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {charts.topClients.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">{t.noData}</p>
          ) : (
            <div className="space-y-4">
              {charts.topClients.map((client, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                        {client.clientName}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(client.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/${locale}/admin/rapports/ventes`}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {t.salesReport}
              </p>
              <p className="text-sm text-gray-500">
                {t.invoiced}, {t.collected}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </Link>

        <Link
          href={`/${locale}/admin/rapports/creances`}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <PieChart className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {t.receivablesReport}
              </p>
              <p className="text-sm text-gray-500">
                {t.outstanding}, {t.overdue}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
