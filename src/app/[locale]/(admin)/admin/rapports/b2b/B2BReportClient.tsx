"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Briefcase,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  RefreshCw,
  Loader2,
  Calendar,
  BarChart3,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  Receipt,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface B2BReportData {
  kpis: {
    revenue: {
      current: number;
      previous: number;
      growth: number;
    };
    payments: {
      current: number;
      previous: number;
      growth: number;
      count: number;
    };
    devis: {
      count: number;
      previousCount: number;
      totalHT: number;
      conversionRate: number;
    };
    factures: {
      count: number;
      previousCount: number;
      totalHT: number;
      totalTVA: number;
      totalTTC: number;
      paidAmount: number;
      balance: number;
      collectionRate: number;
    };
    bonsLivraison: number;
    avoirs: {
      count: number;
      total: number;
    };
    clients: {
      total: number;
      new: number;
    };
  };
  documents: {
    devisByStatus: Array<{ status: string; count: number; total: number }>;
    facturesByStatus: Array<{ status: string; count: number; total: number }>;
  };
  clients: {
    top: Array<{
      clientId: string | null;
      clientName: string;
      invoicesCount: number;
      totalTTC: number;
      paidAmount: number;
      balance: number;
    }>;
  };
  receivables: {
    aging: {
      current: number;
      days30: number;
      days60: number;
      days90: number;
      over90: number;
      total: number;
    };
    unpaidInvoices: number;
  };
  charts: {
    monthlyTrend: Array<{
      month: string;
      revenue: number;
      invoices: number;
      devis: number;
      payments: number;
    }>;
  };
  period: {
    type: string;
    year: number;
    startDate: string;
  };
}

interface B2BReportClientProps {
  locale: string;
  initialPeriod: string;
  initialYear: number;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  title: string;
  back: string;
  refresh: string;
  export: string;
  loading: string;
  error: string;
  retry: string;
  period: string;
  month: string;
  quarter: string;
  year: string;
  revenue: string;
  payments: string;
  devis: string;
  factures: string;
  bonsLivraison: string;
  avoirs: string;
  clients: string;
  newClients: string;
  conversionRate: string;
  collectionRate: string;
  receivables: string;
  aging: string;
  current: string;
  days30: string;
  days60: string;
  days90: string;
  over90: string;
  topClients: string;
  client: string;
  invoices: string;
  paid: string;
  balance: string;
  monthlyTrend: string;
  byStatus: string;
  noData: string;
  selectYear: string;
  totalHT: string;
  totalTVA: string;
  totalTTC: string;
}

const translations: Record<string, Translations> = {
  fr: {
    title: "Rapport CRM (B2B)",
    back: "Retour",
    refresh: "Actualiser",
    export: "Exporter",
    loading: "Chargement des données...",
    error: "Erreur lors du chargement",
    retry: "Réessayer",
    period: "Période",
    month: "Ce mois",
    quarter: "Ce trimestre",
    year: "Cette année",
    revenue: "Chiffre d&apos;affaires",
    payments: "Encaissements",
    devis: "Devis",
    factures: "Factures",
    bonsLivraison: "Bons de livraison",
    avoirs: "Avoirs",
    clients: "Clients actifs",
    newClients: "Nouveaux clients",
    conversionRate: "Taux de conversion",
    collectionRate: "Taux de recouvrement",
    receivables: "Créances clients",
    aging: "Échéancier",
    current: "Non échu",
    days30: "1-30 jours",
    days60: "31-60 jours",
    days90: "61-90 jours",
    over90: "+90 jours",
    topClients: "Meilleurs clients",
    client: "Client",
    invoices: "Factures",
    paid: "Payé",
    balance: "Solde",
    monthlyTrend: "Tendance mensuelle",
    byStatus: "Par statut",
    noData: "Aucune donnée",
    selectYear: "Année",
    totalHT: "Total HT",
    totalTVA: "Total TVA",
    totalTTC: "Total TTC",
  },
  en: {
    title: "CRM Report (B2B)",
    back: "Back",
    refresh: "Refresh",
    export: "Export",
    loading: "Loading data...",
    error: "Error loading data",
    retry: "Retry",
    period: "Period",
    month: "This month",
    quarter: "This quarter",
    year: "This year",
    revenue: "Revenue",
    payments: "Payments",
    devis: "Quotes",
    factures: "Invoices",
    bonsLivraison: "Delivery notes",
    avoirs: "Credit notes",
    clients: "Active clients",
    newClients: "New clients",
    conversionRate: "Conversion rate",
    collectionRate: "Collection rate",
    receivables: "Receivables",
    aging: "Aging",
    current: "Current",
    days30: "1-30 days",
    days60: "31-60 days",
    days90: "61-90 days",
    over90: "90+ days",
    topClients: "Top clients",
    client: "Client",
    invoices: "Invoices",
    paid: "Paid",
    balance: "Balance",
    monthlyTrend: "Monthly trend",
    byStatus: "By status",
    noData: "No data",
    selectYear: "Year",
    totalHT: "Total excl. tax",
    totalTVA: "Total VAT",
    totalTTC: "Total incl. tax",
  },
  es: {
    title: "Informe CRM (B2B)",
    back: "Volver",
    refresh: "Actualizar",
    export: "Exportar",
    loading: "Cargando datos...",
    error: "Error al cargar",
    retry: "Reintentar",
    period: "Período",
    month: "Este mes",
    quarter: "Este trimestre",
    year: "Este año",
    revenue: "Ingresos",
    payments: "Cobros",
    devis: "Presupuestos",
    factures: "Facturas",
    bonsLivraison: "Albaranes",
    avoirs: "Notas de crédito",
    clients: "Clientes activos",
    newClients: "Nuevos clientes",
    conversionRate: "Tasa de conversión",
    collectionRate: "Tasa de cobro",
    receivables: "Cuentas por cobrar",
    aging: "Vencimiento",
    current: "No vencido",
    days30: "1-30 días",
    days60: "31-60 días",
    days90: "61-90 días",
    over90: "+90 días",
    topClients: "Mejores clientes",
    client: "Cliente",
    invoices: "Facturas",
    paid: "Pagado",
    balance: "Saldo",
    monthlyTrend: "Tendencia mensual",
    byStatus: "Por estado",
    noData: "Sin datos",
    selectYear: "Año",
    totalHT: "Total sin IVA",
    totalTVA: "Total IVA",
    totalTTC: "Total con IVA",
  },
  ar: {
    title: "تقرير CRM (B2B)",
    back: "رجوع",
    refresh: "تحديث",
    export: "تصدير",
    loading: "جارٍ تحميل البيانات...",
    error: "خطأ في التحميل",
    retry: "إعادة المحاولة",
    period: "الفترة",
    month: "هذا الشهر",
    quarter: "هذا الربع",
    year: "هذه السنة",
    revenue: "الإيرادات",
    payments: "المدفوعات",
    devis: "عروض الأسعار",
    factures: "الفواتير",
    bonsLivraison: "سندات التسليم",
    avoirs: "إشعارات الائتمان",
    clients: "العملاء النشطون",
    newClients: "عملاء جدد",
    conversionRate: "معدل التحويل",
    collectionRate: "معدل التحصيل",
    receivables: "المستحقات",
    aging: "تقادم الديون",
    current: "غير مستحق",
    days30: "1-30 يوم",
    days60: "31-60 يوم",
    days90: "61-90 يوم",
    over90: "+90 يوم",
    topClients: "أفضل العملاء",
    client: "العميل",
    invoices: "الفواتير",
    paid: "مدفوع",
    balance: "الرصيد",
    monthlyTrend: "الاتجاه الشهري",
    byStatus: "حسب الحالة",
    noData: "لا توجد بيانات",
    selectYear: "السنة",
    totalHT: "المجموع بدون ضريبة",
    totalTVA: "مجموع الضريبة",
    totalTTC: "المجموع شامل الضريبة",
  },
};

// ═══════════════════════════════════════════════════════════
// Status Label Maps
// ═══════════════════════════════════════════════════════════

const documentStatusLabels: Record<string, Record<string, string>> = {
  fr: {
    DRAFT: "Brouillon",
    SENT: "Envoyé",
    VALIDATED: "Validé",
    PARTIAL: "Partiel",
    PAID: "Payé",
    CANCELLED: "Annulé",
    EXPIRED: "Expiré",
    REFUSED: "Refusé",
  },
  en: {
    DRAFT: "Draft",
    SENT: "Sent",
    VALIDATED: "Validated",
    PARTIAL: "Partial",
    PAID: "Paid",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
    REFUSED: "Refused",
  },
  es: {
    DRAFT: "Borrador",
    SENT: "Enviado",
    VALIDATED: "Validado",
    PARTIAL: "Parcial",
    PAID: "Pagado",
    CANCELLED: "Cancelado",
    EXPIRED: "Expirado",
    REFUSED: "Rechazado",
  },
  ar: {
    DRAFT: "مسودة",
    SENT: "مرسل",
    VALIDATED: "معتمد",
    PARTIAL: "جزئي",
    PAID: "مدفوع",
    CANCELLED: "ملغي",
    EXPIRED: "منتهي",
    REFUSED: "مرفوض",
  },
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  VALIDATED: "bg-green-100 text-green-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-orange-100 text-orange-700",
  REFUSED: "bg-pink-100 text-pink-700",
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function B2BReportClient({
  locale,
  initialPeriod,
  initialYear,
}: B2BReportClientProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isRTL = locale === "ar";

  const [period, setPeriod] = useState(initialPeriod);
  const [year, setYear] = useState(initialYear);
  const [data, setData] = useState<B2BReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const { format: formatCurrency } = useCurrency();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/reports/b2b?period=${period}&year=${year}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const result = (await response.json()) as { success: boolean; data: B2BReportData };
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("Error fetching B2B report:", err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [period, year]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    router.push(`/${locale}/admin/rapports/b2b?period=${newPeriod}&year=${year}`);
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    router.push(`/${locale}/admin/rapports/b2b?period=${period}&year=${newYear}`);
  };

  const handleExport = () => {
    if (!data) return;

    const headers = [t.client, t.invoices, t.totalTTC, t.paid, t.balance];
    const rows = data.clients.top.map((c) => [
      c.clientName,
      c.invoicesCount.toString(),
      c.totalTTC.toFixed(2),
      c.paidAmount.toFixed(2),
      c.balance.toFixed(2),
    ]);

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-b2b-${period}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxTrendValue = data
    ? Math.max(...data.charts.monthlyTrend.map((m) => m.revenue))
    : 0;

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-amber-600" />
              {t.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void fetchData()}
            disabled={isLoading}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExport}
            disabled={!data}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            {t.export}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.period}:
            </span>
          </div>

          <div className="flex gap-2">
            {["month", "quarter", "year"].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  period === p
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {t[p as keyof Translations] as string}
              </button>
            ))}
          </div>

          <select
            value={year}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="ml-2 text-gray-500">{t.loading}</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => void fetchData()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t.retry}
          </button>
        </div>
      )}

      {/* Data Content */}
      {data && !isLoading && (
        <>
          {/* KPI Cards - Row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Revenue */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-500">{t.revenue}</span>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(data.kpis.revenue.current)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {data.kpis.revenue.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs ${
                    data.kpis.revenue.growth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {data.kpis.revenue.growth >= 0 ? "+" : ""}
                  {data.kpis.revenue.growth.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Payments */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-500">{t.payments}</span>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(data.kpis.payments.current)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {data.kpis.payments.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs ${
                    data.kpis.payments.growth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {data.kpis.payments.growth >= 0 ? "+" : ""}
                  {data.kpis.payments.growth.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Collection Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-500">{t.collectionRate}</span>
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {data.kpis.factures.collectionRate.toFixed(1)}%
              </p>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(data.kpis.factures.collectionRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Clients */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-gray-500">{t.clients}</span>
              </div>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {data.kpis.clients.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                +{data.kpis.clients.new} {t.newClients.toLowerCase()}
              </p>
            </div>
          </div>

          {/* KPI Cards - Row 2 (Documents) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Devis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-500">{t.devis}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.kpis.devis.count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t.conversionRate}: {data.kpis.devis.conversionRate.toFixed(0)}%
              </p>
            </div>

            {/* Factures */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-500">{t.factures}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.kpis.factures.count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(data.kpis.factures.totalTTC)}
              </p>
            </div>

            {/* Bons de Livraison */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-indigo-500" />
                <span className="text-sm text-gray-500">{t.bonsLivraison}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.kpis.bonsLivraison}
              </p>
            </div>

            {/* Avoirs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-500">{t.avoirs}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.kpis.avoirs.count}
              </p>
              <p className="text-xs text-red-500 mt-1">
                -{formatCurrency(data.kpis.avoirs.total)}
              </p>
            </div>
          </div>

          {/* Receivables Aging */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                {t.receivables} - {t.aging}
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">{t.current}</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(data.receivables.aging.current)}
                  </p>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">{t.days30}</p>
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                    {formatCurrency(data.receivables.aging.days30)}
                  </p>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">{t.days60}</p>
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                    {formatCurrency(data.receivables.aging.days60)}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-1">{t.days90}</p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(data.receivables.aging.days90)}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                  <p className="text-xs text-red-700 dark:text-red-300 mb-1 flex items-center justify-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {t.over90}
                  </p>
                  <p className="text-lg font-bold text-red-800 dark:text-red-200">
                    {formatCurrency(data.receivables.aging.over90)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(data.receivables.aging.total)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  {t.monthlyTrend}
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {data.charts.monthlyTrend.slice(-6).map((month, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-16 truncate">
                        {month.month}
                      </span>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all flex items-center justify-end px-2"
                            style={{
                              width: `${
                                maxTrendValue > 0
                                  ? (month.revenue / maxTrendValue) * 100
                                  : 0
                              }%`,
                              minWidth: month.revenue > 0 ? "40px" : "0",
                            }}
                          >
                            {month.revenue > 0 && (
                              <span className="text-xs text-white font-medium truncate">
                                {formatCurrency(month.revenue)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">
                        {month.invoices}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Factures by Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {t.factures} - {t.byStatus}
                </h2>
              </div>
              <div className="p-4">
                {data.documents.facturesByStatus.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">{t.noData}</p>
                ) : (
                  <div className="space-y-2">
                    {data.documents.facturesByStatus.map((status, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30"
                      >
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            statusColors[status.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {documentStatusLabels[locale]?.[status.status] || status.status}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {status.count}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(status.total)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                {t.topClients}
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
                      {t.paid}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {t.balance}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.clients.top.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        {t.noData}
                      </td>
                    </tr>
                  ) : (
                    data.clients.top.map((client, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
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
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`text-sm font-medium ${
                              client.balance > 0
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-500"
                            }`}
                          >
                            {formatCurrency(client.balance)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
