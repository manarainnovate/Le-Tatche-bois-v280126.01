"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Package,
  TrendingUp,
  CreditCard,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { OrderStatusBadge, ORDER_STATUSES, getOrderStatusLabel } from "@/components/admin/OrderStatusBadge";
import { PaymentStatusBadge, PaymentMethodBadge } from "@/components/admin/PaymentStatusBadge";
import { StatsCard } from "@/components/admin/StatsCard";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemsCount: number;
  total: number;
  paymentMethod: "CARD" | "COD" | "BANK_TRANSFER" | "PAYPAL";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  status: "PENDING" | "PROCESSING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  createdAt: string;
  trackingNumber?: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayOrders: number;
}

interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Commandes E-Commerce",
    subtitle: "Gerez les commandes de votre boutique en ligne",
    searchPlaceholder: "Rechercher par numero, client ou email...",
    all: "Toutes",
    export: "Exporter CSV",
    refresh: "Actualiser",
    orderNumber: "N° Commande",
    customer: "Client",
    items: "Articles",
    total: "Total",
    payment: "Paiement",
    paymentStatus: "Statut paiement",
    status: "Statut",
    date: "Date",
    actions: "Actions",
    view: "Voir",
    noOrders: "Aucune commande trouvee",
    dateRange: "Periode",
    today: "Aujourd'hui",
    thisWeek: "Cette semaine",
    thisMonth: "Ce mois",
    allTime: "Tout",
    totalOrders: "Total commandes",
    pendingOrders: "En attente",
    totalRevenue: "Chiffre d'affaires",
    todayOrders: "Aujourd'hui",
    tracking: "Suivi",
  },
  en: {
    title: "E-Commerce Orders",
    subtitle: "Manage your online store orders",
    searchPlaceholder: "Search by number, customer or email...",
    all: "All",
    export: "Export CSV",
    refresh: "Refresh",
    orderNumber: "Order #",
    customer: "Customer",
    items: "Items",
    total: "Total",
    payment: "Payment",
    paymentStatus: "Payment Status",
    status: "Status",
    date: "Date",
    actions: "Actions",
    view: "View",
    noOrders: "No orders found",
    dateRange: "Date Range",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    allTime: "All Time",
    totalOrders: "Total Orders",
    pendingOrders: "Pending",
    totalRevenue: "Total Revenue",
    todayOrders: "Today",
    tracking: "Tracking",
  },
  es: {
    title: "Pedidos E-Commerce",
    subtitle: "Gestiona los pedidos de tu tienda online",
    searchPlaceholder: "Buscar por numero, cliente o email...",
    all: "Todos",
    export: "Exportar CSV",
    refresh: "Actualizar",
    orderNumber: "N° Pedido",
    customer: "Cliente",
    items: "Articulos",
    total: "Total",
    payment: "Pago",
    paymentStatus: "Estado de pago",
    status: "Estado",
    date: "Fecha",
    actions: "Acciones",
    view: "Ver",
    noOrders: "No se encontraron pedidos",
    dateRange: "Rango de fechas",
    today: "Hoy",
    thisWeek: "Esta semana",
    thisMonth: "Este mes",
    allTime: "Todo",
    totalOrders: "Total pedidos",
    pendingOrders: "Pendientes",
    totalRevenue: "Ingresos",
    todayOrders: "Hoy",
    tracking: "Seguimiento",
  },
  ar: {
    title: "طلبات المتجر الإلكتروني",
    subtitle: "إدارة طلبات متجرك الإلكتروني",
    searchPlaceholder: "البحث بالرقم أو العميل أو البريد الإلكتروني...",
    all: "الكل",
    export: "تصدير CSV",
    refresh: "تحديث",
    orderNumber: "رقم الطلب",
    customer: "العميل",
    items: "المنتجات",
    total: "الإجمالي",
    payment: "الدفع",
    paymentStatus: "حالة الدفع",
    status: "الحالة",
    date: "التاريخ",
    actions: "الإجراءات",
    view: "عرض",
    noOrders: "لا توجد طلبات",
    dateRange: "نطاق التاريخ",
    today: "اليوم",
    thisWeek: "هذا الأسبوع",
    thisMonth: "هذا الشهر",
    allTime: "الكل",
    totalOrders: "إجمالي الطلبات",
    pendingOrders: "قيد الانتظار",
    totalRevenue: "الإيرادات",
    todayOrders: "اليوم",
    tracking: "التتبع",
  },
};

// ═══════════════════════════════════════════════════════════
// Ecommerce Orders Page Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string };
}

export default function EcommerceOrdersPage({ params }: PageProps) {
  const locale = params?.locale || "fr";
  const searchParams = useSearchParams();

  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") ?? "");
  const [dateRange, setDateRange] = useState<string>(searchParams.get("range") ?? "");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(page));
      queryParams.set("limit", String(pageSize));
      if (statusFilter) queryParams.set("status", statusFilter);
      if (dateRange) queryParams.set("range", dateRange);
      if (searchQuery) queryParams.set("search", searchQuery);

      const response = await fetch(`/api/ecommerce/orders?${queryParams.toString()}`);
      if (response.ok) {
        const data = (await response.json()) as { success: boolean; data: OrdersResponse; stats?: OrderStats };
        if (data.success && data.data) {
          setOrders(data.data.data ?? []);
          setTotal(data.data.pagination?.total ?? 0);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, dateRange, searchQuery]);

  // Format currency
  const { format: formatCurrency } = useCurrency();

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ["Order #", "Customer", "Email", "Items", "Total", "Payment", "Status", "Date"];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      o.itemsCount,
      o.total,
      o.paymentMethod,
      o.status,
      o.createdAt,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecommerce-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Table columns
  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      header: t.orderNumber,
      sortable: true,
      render: (order) => (
        <Link
          href={`/${locale}/admin/ecommerce/commandes/${order.id}`}
          className="font-medium text-amber-600 hover:text-amber-700 hover:underline"
        >
          {order.orderNumber}
        </Link>
      ),
    },
    {
      key: "customer",
      header: t.customer,
      render: (order) => (
        <div>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm text-gray-500">{order.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "itemsCount",
      header: t.items,
      align: "center",
      render: (order) => (
        <span className="inline-flex items-center gap-1 text-gray-600">
          <Package className="h-4 w-4" />
          {order.itemsCount}
        </span>
      ),
    },
    {
      key: "total",
      header: t.total,
      sortable: true,
      align: "right",
      render: (order) => (
        <span className="font-medium">{formatCurrency(order.total)}</span>
      ),
    },
    {
      key: "paymentMethod",
      header: t.payment,
      render: (order) => (
        <PaymentMethodBadge method={order.paymentMethod === "CARD" ? "STRIPE" : "COD"} locale={locale} size="sm" />
      ),
    },
    {
      key: "paymentStatus",
      header: t.paymentStatus,
      render: (order) => {
        // Map PARTIALLY_REFUNDED to REFUNDED for the badge
        const mappedStatus = order.paymentStatus === "PARTIALLY_REFUNDED" ? "REFUNDED" : order.paymentStatus;
        return <PaymentStatusBadge status={mappedStatus as "PENDING" | "PAID" | "FAILED" | "REFUNDED"} locale={locale} size="sm" />;
      },
    },
    {
      key: "status",
      header: t.status,
      render: (order) => {
        // Map statuses not supported by badge: COMPLETED→DELIVERED, PREPARING→PROCESSING, REFUNDED→CANCELLED
        type BadgeStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
        const statusMap: Record<string, BadgeStatus> = {
          PENDING: "PENDING",
          CONFIRMED: "CONFIRMED",
          PROCESSING: "PROCESSING",
          PREPARING: "PROCESSING",
          SHIPPED: "SHIPPED",
          DELIVERED: "DELIVERED",
          COMPLETED: "DELIVERED",
          CANCELLED: "CANCELLED",
          REFUNDED: "CANCELLED",
        };
        const mappedStatus = statusMap[order.status] || "PENDING";
        return <OrderStatusBadge status={mappedStatus} locale={locale} size="sm" />;
      },
    },
    {
      key: "tracking",
      header: t.tracking,
      render: (order) =>
        order.trackingNumber ? (
          <span className="text-xs font-mono text-gray-500">{order.trackingNumber}</span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    {
      key: "createdAt",
      header: t.date,
      sortable: true,
      render: (order) => (
        <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: t.actions,
      align: "center",
      render: (order) => (
        <Link
          href={`/${locale}/admin/ecommerce/commandes/${order.id}`}
          className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void fetchOrders()}>
            <RefreshCw className="me-2 h-4 w-4" />
            {t.refresh}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="me-2 h-4 w-4" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t.totalOrders}
          value={stats.totalOrders}
          icon="ShoppingCart"
          variant="info"
        />
        <StatsCard
          title={t.pendingOrders}
          value={stats.pendingOrders}
          icon="Package"
          variant="warning"
        />
        <StatsCard
          title={t.totalRevenue}
          value={formatCurrency(stats.totalRevenue)}
          icon="TrendingUp"
          variant="success"
        />
        <StatsCard
          title={t.todayOrders}
          value={stats.todayOrders}
          icon="DollarSign"
          variant="default"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setStatusFilter("")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            statusFilter === ""
              ? "bg-amber-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          )}
        >
          {t.all}
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              statusFilter === status
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            )}
          >
            {getOrderStatusLabel(status, locale)}
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5 text-gray-400" />
        <div className="flex gap-2">
          {[
            { value: "", label: t.allTime },
            { value: "today", label: t.today },
            { value: "week", label: t.thisWeek },
            { value: "month", label: t.thisMonth },
          ].map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setDateRange(range.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                dateRange === range.value
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <AdminDataTable
        data={orders}
        columns={columns}
        keyField="id"
        searchPlaceholder={t.searchPlaceholder}
        onSearch={setSearchQuery}
        loading={loading}
        emptyMessage={t.noOrders}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
        }}
        selectable
        bulkActions={[
          { value: "confirm", label: "Confirmer" },
          { value: "ship", label: "Marquer comme expediee" },
          { value: "cancel", label: "Annuler" },
        ]}
        onBulkAction={(action, ids) => {
          console.log("Bulk action:", action, ids);
        }}
      />
    </div>
  );
}
