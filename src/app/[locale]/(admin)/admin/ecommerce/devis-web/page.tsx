"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  Download,
  RefreshCw,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  MessageSquare,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { StatsCard } from "@/components/admin/StatsCard";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface QuoteRequest {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  city?: string;
  projectType?: string;
  description: string;
  budget?: string;
  timeline?: string;
  status: "PENDING" | "REVIEWING" | "QUOTED" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED";
  quotedPrice?: number;
  createdAt: string;
  respondedAt?: string;
  itemsCount: number;
  notesCount: number;
}

interface QuoteStats {
  total: number;
  pending: number;
  quoted: number;
  converted: number;
}

interface QuotesResponse {
  data: QuoteRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ═══════════════════════════════════════════════════════════
// Status Badge Component
// ═══════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<string, { label: Record<string, string>; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: {
    label: { fr: "En attente", en: "Pending", es: "Pendiente", ar: "قيد الانتظار" },
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
  },
  REVIEWING: {
    label: { fr: "En cours", en: "Reviewing", es: "Revisando", ar: "قيد المراجعة" },
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Eye,
  },
  QUOTED: {
    label: { fr: "Devis envoye", en: "Quoted", es: "Cotizado", ar: "تم التسعير" },
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Send,
  },
  ACCEPTED: {
    label: { fr: "Accepte", en: "Accepted", es: "Aceptado", ar: "مقبول" },
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle,
  },
  REJECTED: {
    label: { fr: "Refuse", en: "Rejected", es: "Rechazado", ar: "مرفوض" },
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
  EXPIRED: {
    label: { fr: "Expire", en: "Expired", es: "Expirado", ar: "منتهي الصلاحية" },
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    icon: Clock,
  },
  CONVERTED: {
    label: { fr: "Converti", en: "Converted", es: "Convertido", ar: "تم التحويل" },
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    icon: CheckCircle,
  },
};

function QuoteStatusBadge({ status, locale }: { status: string; locale: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  const label = config.label[locale] ?? config.label.fr;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", config.color)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Demandes de Devis Web",
    subtitle: "Gerez les demandes de devis recues depuis le site",
    searchPlaceholder: "Rechercher par nom, email ou numero...",
    all: "Toutes",
    export: "Exporter CSV",
    refresh: "Actualiser",
    quoteNumber: "N° Devis",
    customer: "Client",
    contact: "Contact",
    project: "Projet",
    budget: "Budget",
    status: "Statut",
    quotedPrice: "Prix propose",
    date: "Date",
    actions: "Actions",
    view: "Voir",
    noQuotes: "Aucune demande de devis trouvee",
    dateRange: "Periode",
    today: "Aujourd'hui",
    thisWeek: "Cette semaine",
    thisMonth: "Ce mois",
    allTime: "Tout",
    totalQuotes: "Total demandes",
    pendingQuotes: "En attente",
    quotedQuotes: "Devis envoyes",
    convertedQuotes: "Convertis",
    notes: "Notes",
  },
  en: {
    title: "Web Quote Requests",
    subtitle: "Manage quote requests from the website",
    searchPlaceholder: "Search by name, email or number...",
    all: "All",
    export: "Export CSV",
    refresh: "Refresh",
    quoteNumber: "Quote #",
    customer: "Customer",
    contact: "Contact",
    project: "Project",
    budget: "Budget",
    status: "Status",
    quotedPrice: "Quoted Price",
    date: "Date",
    actions: "Actions",
    view: "View",
    noQuotes: "No quote requests found",
    dateRange: "Date Range",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    allTime: "All Time",
    totalQuotes: "Total Requests",
    pendingQuotes: "Pending",
    quotedQuotes: "Quoted",
    convertedQuotes: "Converted",
    notes: "Notes",
  },
  es: {
    title: "Solicitudes de Cotizacion Web",
    subtitle: "Gestiona las solicitudes de cotizacion del sitio",
    searchPlaceholder: "Buscar por nombre, email o numero...",
    all: "Todas",
    export: "Exportar CSV",
    refresh: "Actualizar",
    quoteNumber: "N° Cotizacion",
    customer: "Cliente",
    contact: "Contacto",
    project: "Proyecto",
    budget: "Presupuesto",
    status: "Estado",
    quotedPrice: "Precio Cotizado",
    date: "Fecha",
    actions: "Acciones",
    view: "Ver",
    noQuotes: "No se encontraron solicitudes",
    dateRange: "Rango de fechas",
    today: "Hoy",
    thisWeek: "Esta semana",
    thisMonth: "Este mes",
    allTime: "Todo",
    totalQuotes: "Total Solicitudes",
    pendingQuotes: "Pendientes",
    quotedQuotes: "Cotizadas",
    convertedQuotes: "Convertidas",
    notes: "Notas",
  },
  ar: {
    title: "طلبات عروض الأسعار",
    subtitle: "إدارة طلبات عروض الأسعار من الموقع",
    searchPlaceholder: "البحث بالاسم أو البريد الإلكتروني أو الرقم...",
    all: "الكل",
    export: "تصدير CSV",
    refresh: "تحديث",
    quoteNumber: "رقم العرض",
    customer: "العميل",
    contact: "الاتصال",
    project: "المشروع",
    budget: "الميزانية",
    status: "الحالة",
    quotedPrice: "السعر المقترح",
    date: "التاريخ",
    actions: "الإجراءات",
    view: "عرض",
    noQuotes: "لا توجد طلبات عروض أسعار",
    dateRange: "نطاق التاريخ",
    today: "اليوم",
    thisWeek: "هذا الأسبوع",
    thisMonth: "هذا الشهر",
    allTime: "الكل",
    totalQuotes: "إجمالي الطلبات",
    pendingQuotes: "قيد الانتظار",
    quotedQuotes: "تم التسعير",
    convertedQuotes: "تم التحويل",
    notes: "الملاحظات",
  },
};

const QUOTE_STATUSES = ["PENDING", "REVIEWING", "QUOTED", "ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED"];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string };
}

export default function QuoteRequestsPage({ params }: PageProps) {
  const locale = params?.locale || "fr";
  const searchParams = useSearchParams();

  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  // State
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [stats, setStats] = useState<QuoteStats>({ total: 0, pending: 0, quoted: 0, converted: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") ?? "");
  const [dateRange, setDateRange] = useState<string>(searchParams.get("range") ?? "");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch quotes
  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(page));
      queryParams.set("limit", String(pageSize));
      if (statusFilter) queryParams.set("status", statusFilter);
      if (dateRange) queryParams.set("range", dateRange);
      if (searchQuery) queryParams.set("search", searchQuery);

      const response = await fetch(`/api/quotes?${queryParams.toString()}`);
      if (response.ok) {
        const result = (await response.json()) as { success: boolean; data: QuotesResponse };
        if (result.success && result.data) {
          setQuotes(result.data.data ?? []);
          setTotal(result.data.pagination?.total ?? 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/ecommerce/quotes/stats");
      if (response.ok) {
        const result = (await response.json()) as { success: boolean; data: QuoteStats };
        if (result.success && result.data) {
          setStats(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    void fetchQuotes();
    void fetchStats();
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
    });
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ["Quote #", "Customer", "Email", "Phone", "Project", "Budget", "Status", "Date"];
    const rows = quotes.map((q) => [
      q.quoteNumber,
      q.customerName,
      q.customerEmail,
      q.customerPhone,
      q.projectType ?? "",
      q.budget ?? "",
      q.status,
      q.createdAt,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quote-requests-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Table columns
  const columns: Column<QuoteRequest>[] = [
    {
      key: "quoteNumber",
      header: t.quoteNumber,
      sortable: true,
      render: (quote) => (
        <Link
          href={`/${locale}/admin/ecommerce/devis-web/${quote.id}`}
          className="font-medium text-amber-600 hover:text-amber-700 hover:underline"
        >
          {quote.quoteNumber}
        </Link>
      ),
    },
    {
      key: "customer",
      header: t.customer,
      render: (quote) => (
        <div>
          <p className="font-medium flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-gray-400" />
            {quote.customerName}
          </p>
          {quote.company && <p className="text-sm text-gray-500">{quote.company}</p>}
        </div>
      ),
    },
    {
      key: "contact",
      header: t.contact,
      render: (quote) => (
        <div className="text-sm">
          <p className="text-gray-600 dark:text-gray-400">{quote.customerEmail}</p>
          <p className="text-gray-500">{quote.customerPhone}</p>
        </div>
      ),
    },
    {
      key: "project",
      header: t.project,
      render: (quote) => (
        <div>
          <p className="font-medium">{quote.projectType ?? "-"}</p>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">{quote.description}</p>
        </div>
      ),
    },
    {
      key: "budget",
      header: t.budget,
      render: (quote) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{quote.budget ?? "-"}</span>
      ),
    },
    {
      key: "status",
      header: t.status,
      render: (quote) => <QuoteStatusBadge status={quote.status} locale={locale} />,
    },
    {
      key: "quotedPrice",
      header: t.quotedPrice,
      align: "right",
      render: (quote) => (
        <span className={cn("font-medium", quote.quotedPrice ? "text-green-600" : "text-gray-400")}>
          {quote.quotedPrice ? formatCurrency(quote.quotedPrice) : "-"}
        </span>
      ),
    },
    {
      key: "notes",
      header: t.notes,
      align: "center",
      render: (quote) =>
        quote.notesCount > 0 ? (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <MessageSquare className="h-4 w-4" />
            {quote.notesCount}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "createdAt",
      header: t.date,
      sortable: true,
      render: (quote) => (
        <span className="text-sm text-gray-500">{formatDate(quote.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: t.actions,
      align: "center",
      render: (quote) => (
        <Link
          href={`/${locale}/admin/ecommerce/devis-web/${quote.id}`}
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
          <Button variant="outline" size="sm" onClick={() => { void fetchQuotes(); void fetchStats(); }}>
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
          title={t.totalQuotes}
          value={stats.total}
          icon="FileText"
          variant="info"
        />
        <StatsCard
          title={t.pendingQuotes}
          value={stats.pending}
          icon="Calendar"
          variant="warning"
        />
        <StatsCard
          title={t.quotedQuotes}
          value={stats.quoted}
          icon="FileText"
          variant="default"
        />
        <StatsCard
          title={t.convertedQuotes}
          value={stats.converted}
          icon="FileText"
          variant="success"
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
        {QUOTE_STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          const label = config?.label[locale] ?? config?.label.fr ?? status;
          return (
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
              {label}
            </button>
          );
        })}
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
        data={quotes}
        columns={columns}
        keyField="id"
        searchPlaceholder={t.searchPlaceholder}
        onSearch={setSearchQuery}
        loading={loading}
        emptyMessage={t.noQuotes}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
        }}
        selectable
        bulkActions={[
          { value: "reviewing", label: "Marquer en cours" },
          { value: "quoted", label: "Marquer devis envoye" },
          { value: "reject", label: "Refuser" },
        ]}
        onBulkAction={(action, ids) => {
          console.log("Bulk action:", action, ids);
        }}
      />
    </div>
  );
}
