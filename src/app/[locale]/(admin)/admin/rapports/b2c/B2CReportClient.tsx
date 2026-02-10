"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Package,
  CreditCard,
  RefreshCw,
  Loader2,
  Calendar,
  BarChart3,
  DollarSign,
  FileText,
  Layers,
} from "lucide-react";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface B2CReportData {
  kpis: {
    revenue: {
      current: number;
      previous: number;
      growth: number;
    };
    orders: {
      current: number;
      previous: number;
      growth: number;
    };
    averageOrderValue: number;
    shipping: number;
    discounts: number;
    conversionRate: number;
  };
  orders: {
    byStatus: Array<{ status: string; count: number; total: number }>;
    byPaymentMethod: Array<{ method: string; count: number; total: number }>;
  };
  products: {
    topSelling: Array<{
      productId: string;
      name: string;
      sku: string;
      quantity: number;
      revenue: number;
      orders: number;
    }>;
    byCategory: Array<{ name: string; total: number; count: number }>;
  };
  quotes: {
    total: number;
    byStatus: Record<string, number>;
  };
  charts: {
    monthlyTrend: Array<{
      month: string;
      revenue: number;
      orders: number;
      avgOrderValue: number;
    }>;
  };
  period: {
    type: string;
    year: number;
    startDate: string;
  };
}

interface B2CReportClientProps {
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
  orders: string;
  averageOrder: string;
  conversionRate: string;
  shipping: string;
  discounts: string;
  vsLastPeriod: string;
  topProducts: string;
  product: string;
  quantity: string;
  ordersByStatus: string;
  ordersByPayment: string;
  byCategory: string;
  monthlyTrend: string;
  quoteRequests: string;
  noData: string;
  selectYear: string;
}

const translations: Record<string, Translations> = {
  fr: {
    title: "Rapport E-Commerce (B2C)",
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
    orders: "Commandes",
    averageOrder: "Panier moyen",
    conversionRate: "Taux de conversion",
    shipping: "Livraison",
    discounts: "Remises",
    vsLastPeriod: "vs période précédente",
    topProducts: "Produits les plus vendus",
    product: "Produit",
    quantity: "Qté",
    ordersByStatus: "Commandes par statut",
    ordersByPayment: "Par mode de paiement",
    byCategory: "Par catégorie",
    monthlyTrend: "Tendance mensuelle",
    quoteRequests: "Demandes de devis",
    noData: "Aucune donnée",
    selectYear: "Année",
  },
  en: {
    title: "E-Commerce Report (B2C)",
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
    orders: "Orders",
    averageOrder: "Average order",
    conversionRate: "Conversion rate",
    shipping: "Shipping",
    discounts: "Discounts",
    vsLastPeriod: "vs previous period",
    topProducts: "Top selling products",
    product: "Product",
    quantity: "Qty",
    ordersByStatus: "Orders by status",
    ordersByPayment: "By payment method",
    byCategory: "By category",
    monthlyTrend: "Monthly trend",
    quoteRequests: "Quote requests",
    noData: "No data",
    selectYear: "Year",
  },
  es: {
    title: "Informe E-Commerce (B2C)",
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
    orders: "Pedidos",
    averageOrder: "Pedido promedio",
    conversionRate: "Tasa de conversión",
    shipping: "Envío",
    discounts: "Descuentos",
    vsLastPeriod: "vs período anterior",
    topProducts: "Productos más vendidos",
    product: "Producto",
    quantity: "Cant.",
    ordersByStatus: "Pedidos por estado",
    ordersByPayment: "Por método de pago",
    byCategory: "Por categoría",
    monthlyTrend: "Tendencia mensual",
    quoteRequests: "Solicitudes de cotización",
    noData: "Sin datos",
    selectYear: "Año",
  },
  ar: {
    title: "تقرير التجارة الإلكترونية (B2C)",
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
    orders: "الطلبات",
    averageOrder: "متوسط الطلب",
    conversionRate: "معدل التحويل",
    shipping: "الشحن",
    discounts: "الخصومات",
    vsLastPeriod: "مقابل الفترة السابقة",
    topProducts: "المنتجات الأكثر مبيعاً",
    product: "المنتج",
    quantity: "الكمية",
    ordersByStatus: "الطلبات حسب الحالة",
    ordersByPayment: "حسب طريقة الدفع",
    byCategory: "حسب الفئة",
    monthlyTrend: "الاتجاه الشهري",
    quoteRequests: "طلبات الأسعار",
    noData: "لا توجد بيانات",
    selectYear: "السنة",
  },
};

// ═══════════════════════════════════════════════════════════
// Status Label Maps
// ═══════════════════════════════════════════════════════════

const orderStatusLabels: Record<string, Record<string, string>> = {
  fr: {
    PENDING: "En attente",
    CONFIRMED: "Confirmé",
    PROCESSING: "En cours",
    SHIPPED: "Expédié",
    DELIVERED: "Livré",
    CANCELLED: "Annulé",
    REFUNDED: "Remboursé",
  },
  en: {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  },
  es: {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PROCESSING: "En proceso",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  },
  ar: {
    PENDING: "قيد الانتظار",
    CONFIRMED: "مؤكد",
    PROCESSING: "قيد المعالجة",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التسليم",
    CANCELLED: "ملغي",
    REFUNDED: "مسترد",
  },
};

const paymentMethodLabels: Record<string, Record<string, string>> = {
  fr: {
    CARD: "Carte bancaire",
    CASH: "Espèces",
    TRANSFER: "Virement",
    CHECK: "Chèque",
    STRIPE: "Stripe",
    UNKNOWN: "Autre",
  },
  en: {
    CARD: "Credit card",
    CASH: "Cash",
    TRANSFER: "Transfer",
    CHECK: "Check",
    STRIPE: "Stripe",
    UNKNOWN: "Other",
  },
  es: {
    CARD: "Tarjeta",
    CASH: "Efectivo",
    TRANSFER: "Transferencia",
    CHECK: "Cheque",
    STRIPE: "Stripe",
    UNKNOWN: "Otro",
  },
  ar: {
    CARD: "بطاقة",
    CASH: "نقداً",
    TRANSFER: "تحويل",
    CHECK: "شيك",
    STRIPE: "سترايب",
    UNKNOWN: "آخر",
  },
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function B2CReportClient({
  locale,
  initialPeriod,
  initialYear,
}: B2CReportClientProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isRTL = locale === "ar";

  const [period, setPeriod] = useState(initialPeriod);
  const [year, setYear] = useState(initialYear);
  const [data, setData] = useState<B2CReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const { format: formatCurrency } = useCurrency();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/reports/b2c?period=${period}&year=${year}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const result = (await response.json()) as { success: boolean; data: B2CReportData };
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("Error fetching B2C report:", err);
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
    router.push(`/${locale}/admin/rapports/b2c?period=${newPeriod}&year=${year}`);
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    router.push(`/${locale}/admin/rapports/b2c?period=${period}&year=${newYear}`);
  };

  const handleExport = () => {
    if (!data) return;

    const headers = [t.product, t.quantity, t.revenue];
    const rows = data.products.topSelling.map((p) => [
      p.name,
      p.quantity.toString(),
      p.revenue.toFixed(2),
    ]);

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-b2c-${period}-${year}.csv`;
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
              <ShoppingCart className="h-7 w-7 text-blue-600" />
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
                    ? "bg-blue-600 text-white"
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {/* Revenue */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 col-span-2 lg:col-span-1">
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

            {/* Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-500">{t.orders}</span>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {data.kpis.orders.current}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {data.kpis.orders.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs ${
                    data.kpis.orders.growth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {data.kpis.orders.growth >= 0 ? "+" : ""}
                  {data.kpis.orders.growth.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-gray-500">{t.averageOrder}</span>
              </div>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(data.kpis.averageOrderValue)}
              </p>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-500">{t.conversionRate}</span>
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {data.kpis.conversionRate.toFixed(1)}%
              </p>
            </div>

            {/* Shipping */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-2">{t.shipping}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.kpis.shipping)}
              </p>
            </div>

            {/* Discounts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-2">{t.discounts}</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                -{formatCurrency(data.kpis.discounts)}
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
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
                            className="h-full bg-blue-500 rounded-full transition-all flex items-center justify-end px-2"
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
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {month.orders} cmd
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {t.ordersByStatus}
                </h2>
              </div>
              <div className="p-4">
                {data.orders.byStatus.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">{t.noData}</p>
                ) : (
                  <div className="space-y-2">
                    {data.orders.byStatus.map((status, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30"
                      >
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            statusColors[status.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {orderStatusLabels[locale]?.[status.status] || status.status}
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

          {/* Products and Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-500" />
                  {t.topProducts}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t.product}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t.quantity}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t.revenue}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.products.topSelling.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                          {t.noData}
                        </td>
                      </tr>
                    ) : (
                      data.products.topSelling.slice(0, 8).map((product, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">{product.sku}</p>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">
                            {product.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Category */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-500" />
                  {t.byCategory}
                </h2>
              </div>
              <div className="p-4">
                {data.products.byCategory.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">{t.noData}</p>
                ) : (
                  <div className="space-y-3">
                    {data.products.byCategory.map((cat, idx) => {
                      const maxCatValue = Math.max(
                        ...data.products.byCategory.map((c) => c.total)
                      );
                      const percentage =
                        maxCatValue > 0 ? (cat.total / maxCatValue) * 100 : 0;

                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                              {cat.name}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(cat.total)}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  {t.ordersByPayment}
                </h2>
              </div>
              <div className="p-4">
                {data.orders.byPaymentMethod.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">{t.noData}</p>
                ) : (
                  <div className="space-y-2">
                    {data.orders.byPaymentMethod.map((pm, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {paymentMethodLabels[locale]?.[pm.method] || pm.method}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(pm.total)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pm.count} {t.orders.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quote Requests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  {t.quoteRequests}
                </h2>
              </div>
              <div className="p-4">
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {data.quotes.total}
                  </p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
                {Object.keys(data.quotes.byStatus).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(data.quotes.byStatus).map(([status, count], idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {status}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
