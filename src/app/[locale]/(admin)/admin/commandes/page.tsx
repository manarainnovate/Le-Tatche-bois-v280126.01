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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { OrderStatusBadge, ORDER_STATUSES, getOrderStatusLabel } from "@/components/admin/OrderStatusBadge";
import { PaymentStatusBadge, PaymentMethodBadge } from "@/components/admin/PaymentStatusBadge";
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
  paymentMethod: "STRIPE" | "COD";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Commandes",
    subtitle: "Gerez les commandes de votre boutique",
    searchPlaceholder: "Rechercher par numero ou email...",
    all: "Toutes",
    export: "Exporter",
    refresh: "Actualiser",
    orderNumber: "Numero",
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
  },
  en: {
    title: "Orders",
    subtitle: "Manage your store orders",
    searchPlaceholder: "Search by number or email...",
    all: "All",
    export: "Export",
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
  },
  es: {
    title: "Pedidos",
    subtitle: "Gestiona los pedidos de tu tienda",
    searchPlaceholder: "Buscar por numero o email...",
    all: "Todos",
    export: "Exportar",
    refresh: "Actualizar",
    orderNumber: "Numero",
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
  },
  ar: {
    title: "الطلبات",
    subtitle: "إدارة طلبات متجرك",
    searchPlaceholder: "البحث بالرقم أو البريد الإلكتروني...",
    all: "الكل",
    export: "تصدير",
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
  },
};

// ═══════════════════════════════════════════════════════════
// Orders Page Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string };
}

export default function OrdersPage({ params }: PageProps) {
  const { locale } = params;
  const searchParams = useSearchParams();

  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  // State
  const [orders, setOrders] = useState<Order[]>([]);
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
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (statusFilter) params.set("status", statusFilter);
      if (dateRange) params.set("range", dateRange);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/orders?${params.toString()}`);
      if (response.ok) {
        const data = (await response.json()) as OrdersResponse;
        setOrders(data.orders ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
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
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
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
          href={`/${locale}/admin/commandes/${order.id}`}
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
        <PaymentMethodBadge method={order.paymentMethod} locale={locale} size="sm" />
      ),
    },
    {
      key: "paymentStatus",
      header: t.paymentStatus,
      render: (order) => (
        <PaymentStatusBadge status={order.paymentStatus} locale={locale} size="sm" />
      ),
    },
    {
      key: "status",
      header: t.status,
      render: (order) => (
        <OrderStatusBadge status={order.status} locale={locale} size="sm" />
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
          href={`/${locale}/admin/commandes/${order.id}`}
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
          { value: "confirm", label: "Confirm Selected" },
          { value: "ship", label: "Mark as Shipped" },
          { value: "cancel", label: "Cancel Selected" },
        ]}
        onBulkAction={(action, ids) => {
          console.log("Bulk action:", action, ids);
        }}
      />
    </div>
  );
}
