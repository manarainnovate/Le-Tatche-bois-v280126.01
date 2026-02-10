"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Percent,
  Download,
  RefreshCw,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DateRangePicker,
  type DateRange,
  type DatePreset,
} from "@/components/admin/DateRangePicker";
import {
  SimpleBarChart,
  SimpleLineChart,
  SimplePieChart,
  StatCard,
} from "@/components/admin/ReportChart";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Rapports des ventes",
    subtitle: "Analysez vos performances commerciales",
    refresh: "Actualiser",
    exportCSV: "Exporter CSV",
    exportPDF: "Exporter PDF",
    loading: "Chargement...",
    // Stats
    totalRevenue: "Chiffre d'affaires",
    totalOrders: "Commandes",
    averageOrder: "Panier moyen",
    conversionRate: "Taux de conversion",
    // Charts
    revenueOverTime: "Evolution du chiffre d'affaires",
    compareToPrevious: "Comparer a la periode precedente",
    topProducts: "Produits les plus vendus",
    productName: "Produit",
    unitsSold: "Unites vendues",
    revenue: "CA",
    ordersByStatus: "Commandes par statut",
    ordersByRegion: "Commandes par region",
    paymentMethods: "Moyens de paiement",
    stripe: "Carte bancaire",
    cod: "Paiement a la livraison",
    // Status
    pending: "En attente",
    processing: "En cours",
    shipped: "Expediee",
    delivered: "Livree",
    cancelled: "Annulee",
    // Regions
    casablanca: "Casablanca-Settat",
    rabat: "Rabat-Sale-Kenitra",
    marrakech: "Marrakech-Safi",
    fes: "Fes-Meknes",
    other: "Autres",
  },
  en: {
    title: "Sales Reports",
    subtitle: "Analyze your business performance",
    refresh: "Refresh",
    exportCSV: "Export CSV",
    exportPDF: "Export PDF",
    loading: "Loading...",
    // Stats
    totalRevenue: "Total Revenue",
    totalOrders: "Total Orders",
    averageOrder: "Average Order",
    conversionRate: "Conversion Rate",
    // Charts
    revenueOverTime: "Revenue Over Time",
    compareToPrevious: "Compare to previous period",
    topProducts: "Top Products",
    productName: "Product",
    unitsSold: "Units Sold",
    revenue: "Revenue",
    ordersByStatus: "Orders by Status",
    ordersByRegion: "Orders by Region",
    paymentMethods: "Payment Methods",
    stripe: "Credit Card",
    cod: "Cash on Delivery",
    // Status
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    // Regions
    casablanca: "Casablanca-Settat",
    rabat: "Rabat-Sale-Kenitra",
    marrakech: "Marrakech-Safi",
    fes: "Fes-Meknes",
    other: "Other",
  },
  es: {
    title: "Informes de Ventas",
    subtitle: "Analiza tu rendimiento comercial",
    refresh: "Actualizar",
    exportCSV: "Exportar CSV",
    exportPDF: "Exportar PDF",
    loading: "Cargando...",
    // Stats
    totalRevenue: "Ingresos Totales",
    totalOrders: "Pedidos Totales",
    averageOrder: "Pedido Promedio",
    conversionRate: "Tasa de Conversion",
    // Charts
    revenueOverTime: "Evolucion de Ingresos",
    compareToPrevious: "Comparar con periodo anterior",
    topProducts: "Productos Mas Vendidos",
    productName: "Producto",
    unitsSold: "Unidades Vendidas",
    revenue: "Ingresos",
    ordersByStatus: "Pedidos por Estado",
    ordersByRegion: "Pedidos por Region",
    paymentMethods: "Metodos de Pago",
    stripe: "Tarjeta de Credito",
    cod: "Pago Contra Entrega",
    // Status
    pending: "Pendiente",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
    // Regions
    casablanca: "Casablanca-Settat",
    rabat: "Rabat-Sale-Kenitra",
    marrakech: "Marrakech-Safi",
    fes: "Fes-Meknes",
    other: "Otros",
  },
  ar: {
    title: "تقارير المبيعات",
    subtitle: "حلل أداء عملك التجاري",
    refresh: "تحديث",
    exportCSV: "تصدير CSV",
    exportPDF: "تصدير PDF",
    loading: "جاري التحميل...",
    // Stats
    totalRevenue: "إجمالي الإيرادات",
    totalOrders: "إجمالي الطلبات",
    averageOrder: "متوسط الطلب",
    conversionRate: "معدل التحويل",
    // Charts
    revenueOverTime: "تطور الإيرادات",
    compareToPrevious: "مقارنة بالفترة السابقة",
    topProducts: "المنتجات الأكثر مبيعاً",
    productName: "المنتج",
    unitsSold: "الوحدات المباعة",
    revenue: "الإيرادات",
    ordersByStatus: "الطلبات حسب الحالة",
    ordersByRegion: "الطلبات حسب المنطقة",
    paymentMethods: "طرق الدفع",
    stripe: "بطاقة الائتمان",
    cod: "الدفع عند الاستلام",
    // Status
    pending: "معلق",
    processing: "قيد المعالجة",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغى",
    // Regions
    casablanca: "الدار البيضاء-سطات",
    rabat: "الرباط-سلا-القنيطرة",
    marrakech: "مراكش-آسفي",
    fes: "فاس-مكناس",
    other: "أخرى",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string };
}

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  revenueByDay: { label: string; value: number }[];
  previousRevenueByDay: { label: string; value: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  ordersByRegion: { region: string; count: number }[];
  paymentMethods: { method: string; count: number }[];
}

// ═══════════════════════════════════════════════════════════
// Mock Data Generator
// ═══════════════════════════════════════════════════════════

function generateMockData(dateRange: DateRange): ReportData {
  const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Generate daily revenue
  const revenueByDay: { label: string; value: number }[] = [];
  const previousRevenueByDay: { label: string; value: number }[] = [];

  for (let i = 0; i < Math.min(days, 30); i++) {
    const date = new Date(dateRange.from);
    date.setDate(date.getDate() + i);
    const dayLabel = date.getDate().toString();

    revenueByDay.push({
      label: dayLabel,
      value: Math.floor(Math.random() * 5000) + 1000,
    });

    previousRevenueByDay.push({
      label: dayLabel,
      value: Math.floor(Math.random() * 4500) + 800,
    });
  }

  const totalRevenue = revenueByDay.reduce((sum, d) => sum + d.value, 0);
  const totalOrders = Math.floor(totalRevenue / 350);

  return {
    totalRevenue,
    totalOrders,
    averageOrder: totalRevenue / totalOrders,
    conversionRate: 3.2 + Math.random() * 2,
    revenueChange: (Math.random() - 0.3) * 30,
    ordersChange: (Math.random() - 0.3) * 25,
    revenueByDay,
    previousRevenueByDay,
    topProducts: [
      { name: "Table en chene massif", units: 12, revenue: 48000 },
      { name: "Bibliotheque murale", units: 8, revenue: 32000 },
      { name: "Chaise artisanale", units: 24, revenue: 28800 },
      { name: "Commode en noyer", units: 6, revenue: 21000 },
      { name: "Bureau minimaliste", units: 5, revenue: 17500 },
      { name: "Etagere flottante", units: 15, revenue: 12000 },
      { name: "Tabouret de bar", units: 10, revenue: 9000 },
      { name: "Plateau decoratif", units: 20, revenue: 6000 },
      { name: "Cadre photo bois", units: 35, revenue: 5250 },
      { name: "Porte-manteau", units: 8, revenue: 4800 },
    ],
    ordersByStatus: [
      { status: "pending", count: 8 },
      { status: "processing", count: 12 },
      { status: "shipped", count: 15 },
      { status: "delivered", count: totalOrders - 40 },
      { status: "cancelled", count: 5 },
    ],
    ordersByRegion: [
      { region: "casablanca", count: Math.floor(totalOrders * 0.35) },
      { region: "rabat", count: Math.floor(totalOrders * 0.25) },
      { region: "marrakech", count: Math.floor(totalOrders * 0.15) },
      { region: "fes", count: Math.floor(totalOrders * 0.12) },
      { region: "other", count: Math.floor(totalOrders * 0.13) },
    ],
    paymentMethods: [
      { method: "stripe", count: Math.floor(totalOrders * 0.65) },
      { method: "cod", count: Math.floor(totalOrders * 0.35) },
    ],
  };
}

// ═══════════════════════════════════════════════════════════
// Reports Page
// ═══════════════════════════════════════════════════════════

export default function ReportsPage({ params }: PageProps) {
  const { locale } = params;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  // State
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    return { from: thirtyDaysAgo, to: now, preset: "last30Days" as DatePreset };
  });
  const [showComparison, setShowComparison] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setData(generateMockData(dateRange));
      setLoading(false);
    };
    void loadData();
  }, [dateRange]);

  // Format currency
  const { format: formatCurrency } = useCurrency();

  // Export CSV
  const handleExportCSV = () => {
    if (!data) return;

    const headers = [t.productName, t.unitsSold, t.revenue];
    const rows = data.topProducts.map((p) => [p.name, p.units, p.revenue]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-ventes-${dateRange.from.toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Status colors
  const statusColors: Record<string, string> = {
    pending: "#fbbf24",
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#22c55e",
    cancelled: "#ef4444",
  };

  // Payment colors
  const paymentColors: Record<string, string> = {
    stripe: "#6366f1",
    cod: "#f59e0b",
  };

  if (loading || !data) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            locale={locale}
          />

          <Button
            variant="outline"
            onClick={() => setData(generateMockData(dateRange))}
          >
            <RefreshCw className="me-2 h-4 w-4" />
            {t.refresh}
          </Button>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="me-2 h-4 w-4" />
            {t.exportCSV}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t.totalRevenue}
          value={formatCurrency(data.totalRevenue)}
          change={data.revenueChange}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard
          label={t.totalOrders}
          value={data.totalOrders}
          change={data.ordersChange}
          icon={<ShoppingBag className="h-6 w-6" />}
        />
        <StatCard
          label={t.averageOrder}
          value={formatCurrency(data.averageOrder)}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          label={t.conversionRate}
          value={`${data.conversionRate.toFixed(1)}%`}
          icon={<Percent className="h-6 w-6" />}
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.revenueOverTime}
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            {t.compareToPrevious}
          </label>
        </div>
        <SimpleLineChart
          data={data.revenueByDay}
          compareData={showComparison ? data.previousRevenueByDay : undefined}
          height={250}
          formatValue={formatCurrency}
        />
      </div>

      {/* Three Column Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders by Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {t.ordersByStatus}
          </h2>
          <SimplePieChart
            data={data.ordersByStatus.map((s) => ({
              label: String(t[s.status as keyof typeof t] ?? s.status),
              value: s.count,
              color: statusColors[s.status] ?? "#9ca3af",
            }))}
            size={140}
          />
        </div>

        {/* Orders by Region */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {t.ordersByRegion}
          </h2>
          <SimpleBarChart
            data={data.ordersByRegion.map((r) => ({
              label: String(t[r.region as keyof typeof t] ?? r.region).split("-")[0] ?? r.region,
              value: r.count,
              color: "bg-amber-500",
            }))}
            height={180}
          />
        </div>

        {/* Payment Methods */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {t.paymentMethods}
          </h2>
          <SimplePieChart
            data={data.paymentMethods.map((p) => ({
              label: String(t[p.method as keyof typeof t] ?? p.method),
              value: p.count,
              color: paymentColors[p.method] ?? "#9ca3af",
            }))}
            size={140}
          />
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.topProducts}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                  #
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.productName}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.unitsSold}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.revenue}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <Package className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {product.units}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
