"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Payment {
  id: string;
  documentId: string | null;
  amount: number;
  date: Date | string;
  method: string;
  reference: string | null;
  notes: string | null;
  document: {
    id: string;
    number: string;
    type: string;
    clientId: string | null;
    clientName: string;
    totalTTC: number;
  };
  createdBy: {
    id: string;
    name: string | null;
  } | null;
}

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
}

interface Stats {
  monthTotal: number;
  monthCount: number;
  quarterTotal: number;
  quarterCount: number;
  allTimeTotal: number;
  allTimeCount: number;
  averagePayment: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  search?: string;
  method?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
}

interface PaiementsPageClientProps {
  payments: Payment[];
  stats: Stats;
  clients: Client[];
  pagination: Pagination;
  filters: Filters;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Paiements",
    newPayment: "Nouveau paiement",
    search: "Rechercher...",
    filters: "Filtres",
    export: "Exporter",
    allMethods: "Tous les modes",
    allClients: "Tous les clients",
    startDate: "Date début",
    endDate: "Date fin",
    clearFilters: "Effacer",
    monthTotal: "Total ce mois",
    quarterTotal: "Total ce trimestre",
    totalPayments: "Nombre de paiements",
    averagePayment: "Moyenne par paiement",
    date: "Date",
    number: "N°",
    client: "Client",
    invoice: "Facture",
    amount: "Montant",
    method: "Mode",
    reference: "Référence",
    actions: "Actions",
    noPayments: "Aucun paiement trouvé",
    view: "Voir",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce paiement ?",
    methods: {
      CASH: "Espèces",
      CHECK: "Chèque",
      BANK_TRANSFER: "Virement",
      CARD: "Carte",
      OTHER: "Autre",
    },
    previous: "Précédent",
    next: "Suivant",
    page: "Page",
    of: "sur",
  },
  en: {
    title: "Payments",
    newPayment: "New payment",
    search: "Search...",
    filters: "Filters",
    export: "Export",
    allMethods: "All methods",
    allClients: "All clients",
    startDate: "Start date",
    endDate: "End date",
    clearFilters: "Clear",
    monthTotal: "This month",
    quarterTotal: "This quarter",
    totalPayments: "Total payments",
    averagePayment: "Average payment",
    date: "Date",
    number: "No.",
    client: "Client",
    invoice: "Invoice",
    amount: "Amount",
    method: "Method",
    reference: "Reference",
    actions: "Actions",
    noPayments: "No payments found",
    view: "View",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this payment?",
    methods: {
      CASH: "Cash",
      CHECK: "Check",
      BANK_TRANSFER: "Bank transfer",
      CARD: "Card",
      OTHER: "Other",
    },
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
  },
  es: {
    title: "Pagos",
    newPayment: "Nuevo pago",
    search: "Buscar...",
    filters: "Filtros",
    export: "Exportar",
    allMethods: "Todos los métodos",
    allClients: "Todos los clientes",
    startDate: "Fecha inicio",
    endDate: "Fecha fin",
    clearFilters: "Limpiar",
    monthTotal: "Este mes",
    quarterTotal: "Este trimestre",
    totalPayments: "Total de pagos",
    averagePayment: "Pago promedio",
    date: "Fecha",
    number: "N°",
    client: "Cliente",
    invoice: "Factura",
    amount: "Monto",
    method: "Método",
    reference: "Referencia",
    actions: "Acciones",
    noPayments: "No se encontraron pagos",
    view: "Ver",
    delete: "Eliminar",
    confirmDelete: "¿Está seguro de que desea eliminar este pago?",
    methods: {
      CASH: "Efectivo",
      CHECK: "Cheque",
      BANK_TRANSFER: "Transferencia",
      CARD: "Tarjeta",
      OTHER: "Otro",
    },
    previous: "Anterior",
    next: "Siguiente",
    page: "Página",
    of: "de",
  },
  ar: {
    title: "المدفوعات",
    newPayment: "دفعة جديدة",
    search: "بحث...",
    filters: "تصفية",
    export: "تصدير",
    allMethods: "جميع الطرق",
    allClients: "جميع العملاء",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    clearFilters: "مسح",
    monthTotal: "هذا الشهر",
    quarterTotal: "هذا الربع",
    totalPayments: "إجمالي المدفوعات",
    averagePayment: "متوسط الدفعة",
    date: "التاريخ",
    number: "رقم",
    client: "العميل",
    invoice: "الفاتورة",
    amount: "المبلغ",
    method: "الطريقة",
    reference: "المرجع",
    actions: "الإجراءات",
    noPayments: "لا توجد مدفوعات",
    view: "عرض",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذه الدفعة؟",
    methods: {
      CASH: "نقدي",
      CHECK: "شيك",
      BANK_TRANSFER: "تحويل",
      CARD: "بطاقة",
      OTHER: "أخرى",
    },
    previous: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function PaiementsPageClient({
  payments,
  stats,
  clients,
  pagination,
  filters,
  locale,
}: PaiementsPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const isRTL = locale === "ar";

  const [search, setSearch] = useState(filters.search || "");
  const [method, setMethod] = useState(filters.method || "");
  const [clientId, setClientId] = useState(filters.clientId || "");
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");
  const [showFilters, setShowFilters] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (method) params.set("method", method);
    if (clientId) params.set("clientId", clientId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/${locale}/admin/facturation/paiements?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setMethod("");
    setClientId("");
    setStartDate("");
    setEndDate("");
    router.push(`/${locale}/admin/facturation/paiements`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/crm/payments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (method) params.set("method", method);
    if (clientId) params.set("clientId", clientId);
    window.location.href = `/api/crm/payments/export?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (method) params.set("method", method);
    if (clientId) params.set("clientId", clientId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("page", page.toString());
    router.push(`/${locale}/admin/facturation/paiements?${params.toString()}`);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <Banknote className="h-4 w-4" />;
      case "CHECK":
        return <Receipt className="h-4 w-4" />;
      case "BANK_TRANSFER":
        return <Building2 className="h-4 w-4" />;
      case "CARD":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className={`p-6 ${isRTL ? "rtl" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h1>
        <Link
          href={`/${locale}/admin/facturation/paiements/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          {t.newPayment}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.monthTotal}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.monthTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.quarterTotal}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.quarterTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.totalPayments}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.allTimeCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Banknote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.averagePayment}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.averagePayment)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="h-5 w-5" />
            {t.filters}
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="h-5 w-5" />
            {t.export}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t.allMethods}</option>
                <option value="CASH">{t.methods.CASH}</option>
                <option value="CHECK">{t.methods.CHECK}</option>
                <option value="BANK_TRANSFER">{t.methods.BANK_TRANSFER}</option>
                <option value="CARD">{t.methods.CARD}</option>
                <option value="OTHER">{t.methods.OTHER}</option>
              </select>

              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t.allClients}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder={t.startDate}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder={t.endDate}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  {t.filters}
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.date}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.client}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.invoice}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.amount}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.method}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.reference}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t.noPayments}
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.document.clientName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/${locale}/admin/facturation/factures/${payment.document.id}`}
                        className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
                      >
                        {payment.document.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                        {getMethodIcon(payment.method)}
                        {t.methods[payment.method as keyof typeof t.methods]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {payment.reference || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/facturation/paiements/${payment.id}`}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          title={t.view}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          disabled={deleting === payment.id}
                          className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                          title={t.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.page} {pagination.page} {t.of} {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.previous}
              </button>
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t.next}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
