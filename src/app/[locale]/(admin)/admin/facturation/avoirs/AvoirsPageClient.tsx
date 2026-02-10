"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RefreshCcw,
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Download,
  Eye,
  Printer,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentStatusBadge } from "@/components/crm/documents";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type DocumentStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "CONFIRMED" | "PARTIAL" | "DELIVERED" | "SIGNED" | "PAID" | "OVERDUE" | "CANCELLED";

interface Document {
  id: string;
  type: string;
  number: string;
  status: DocumentStatus;
  date: Date;
  clientName: string;
  totalHT: number;
  totalTTC: number;
  paidAmount: number;
  balance: number;
  client: {
    id: string;
    fullName: string;
    clientNumber: string;
  };
  project?: {
    id: string;
    name: string;
    projectNumber: string;
  } | null;
  parent?: {
    id: string;
    number: string;
    type: string;
  } | null;
  _count?: {
    items: number;
  };
}

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
}

interface Facture {
  id: string;
  number: string;
  clientName: string;
}

interface Stat {
  status: string;
  count: number;
  total: number;
}

interface AvoirsPageClientProps {
  documents: Document[];
  clients: Client[];
  factures: Facture[];
  locale: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filters: {
    status: string;
    clientId: string;
    factureId: string;
    search: string;
    dateFrom: string;
    dateTo: string;
  };
  stats: Stat[];
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  title: string;
  subtitle: string;
  newAvoir: string;
  search: string;
  searchPlaceholder: string;
  filters: string;
  clearFilters: string;
  status: string;
  allStatuses: string;
  client: string;
  allClients: string;
  facture: string;
  allFactures: string;
  dateFrom: string;
  dateTo: string;
  noAvoirs: string;
  noAvoirsDescription: string;
  showing: string;
  of: string;
  documents: string;
  previous: string;
  next: string;
  export: string;
  view: string;
  print: string;
  columns: {
    number: string;
    client: string;
    date: string;
    factureRef: string;
    amount: string;
    status: string;
    actions: string;
  };
  stats: {
    draft: string;
    sent: string;
    refunded: string;
    total: string;
  };
}

const translations: Record<string, Translations> = {
  fr: {
    title: "Avoirs",
    subtitle: "Gérez vos avoirs et remboursements",
    newAvoir: "Nouvel avoir",
    search: "Rechercher",
    searchPlaceholder: "Rechercher par numéro, client...",
    filters: "Filtres",
    clearFilters: "Effacer",
    status: "Statut",
    allStatuses: "Tous les statuts",
    client: "Client",
    allClients: "Tous les clients",
    facture: "Facture d'origine",
    allFactures: "Toutes les factures",
    dateFrom: "Du",
    dateTo: "Au",
    noAvoirs: "Aucun avoir",
    noAvoirsDescription: "Créez votre premier avoir pour commencer",
    showing: "Affichage",
    of: "sur",
    documents: "documents",
    previous: "Précédent",
    next: "Suivant",
    export: "Exporter",
    view: "Voir",
    print: "Imprimer",
    columns: {
      number: "N°",
      client: "Client",
      date: "Date",
      factureRef: "Réf. Facture",
      amount: "Montant",
      status: "Statut",
      actions: "Actions",
    },
    stats: {
      draft: "Brouillons",
      sent: "Émis",
      refunded: "Remboursés",
      total: "Total avoirs",
    },
  },
  en: {
    title: "Credit Notes",
    subtitle: "Manage your credit notes and refunds",
    newAvoir: "New credit note",
    search: "Search",
    searchPlaceholder: "Search by number, client...",
    filters: "Filters",
    clearFilters: "Clear",
    status: "Status",
    allStatuses: "All statuses",
    client: "Client",
    allClients: "All clients",
    facture: "Original invoice",
    allFactures: "All invoices",
    dateFrom: "From",
    dateTo: "To",
    noAvoirs: "No credit notes",
    noAvoirsDescription: "Create your first credit note to get started",
    showing: "Showing",
    of: "of",
    documents: "documents",
    previous: "Previous",
    next: "Next",
    export: "Export",
    view: "View",
    print: "Print",
    columns: {
      number: "No.",
      client: "Client",
      date: "Date",
      factureRef: "Invoice Ref.",
      amount: "Amount",
      status: "Status",
      actions: "Actions",
    },
    stats: {
      draft: "Drafts",
      sent: "Issued",
      refunded: "Refunded",
      total: "Total credit",
    },
  },
  es: {
    title: "Abonos",
    subtitle: "Gestione sus abonos y devoluciones",
    newAvoir: "Nuevo abono",
    search: "Buscar",
    searchPlaceholder: "Buscar por número, cliente...",
    filters: "Filtros",
    clearFilters: "Limpiar",
    status: "Estado",
    allStatuses: "Todos los estados",
    client: "Cliente",
    allClients: "Todos los clientes",
    facture: "Factura original",
    allFactures: "Todas las facturas",
    dateFrom: "Desde",
    dateTo: "Hasta",
    noAvoirs: "Sin abonos",
    noAvoirsDescription: "Cree su primer abono para comenzar",
    showing: "Mostrando",
    of: "de",
    documents: "documentos",
    previous: "Anterior",
    next: "Siguiente",
    export: "Exportar",
    view: "Ver",
    print: "Imprimir",
    columns: {
      number: "N°",
      client: "Cliente",
      date: "Fecha",
      factureRef: "Ref. Factura",
      amount: "Importe",
      status: "Estado",
      actions: "Acciones",
    },
    stats: {
      draft: "Borradores",
      sent: "Emitidos",
      refunded: "Reembolsados",
      total: "Total abonos",
    },
  },
  ar: {
    title: "إشعارات دائنة",
    subtitle: "إدارة الإشعارات الدائنة والمبالغ المستردة",
    newAvoir: "إشعار دائن جديد",
    search: "بحث",
    searchPlaceholder: "البحث بالرقم، العميل...",
    filters: "الفلاتر",
    clearFilters: "مسح",
    status: "الحالة",
    allStatuses: "جميع الحالات",
    client: "العميل",
    allClients: "جميع العملاء",
    facture: "الفاتورة الأصلية",
    allFactures: "جميع الفواتير",
    dateFrom: "من",
    dateTo: "إلى",
    noAvoirs: "لا إشعارات دائنة",
    noAvoirsDescription: "أنشئ أول إشعار دائن للبدء",
    showing: "عرض",
    of: "من",
    documents: "وثائق",
    previous: "السابق",
    next: "التالي",
    export: "تصدير",
    view: "عرض",
    print: "طباعة",
    columns: {
      number: "الرقم",
      client: "العميل",
      date: "التاريخ",
      factureRef: "مرجع الفاتورة",
      amount: "المبلغ",
      status: "الحالة",
      actions: "الإجراءات",
    },
    stats: {
      draft: "مسودات",
      sent: "صادرة",
      refunded: "مستردة",
      total: "إجمالي الإشعارات",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Status Options
// ═══════════════════════════════════════════════════════════

const statusOptions: DocumentStatus[] = ["DRAFT", "SENT", "PAID", "CANCELLED"];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function AvoirsPageClient({
  documents,
  clients,
  factures,
  locale,
  currentPage,
  totalPages,
  totalCount,
  filters,
  stats,
}: AvoirsPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [clientFilter, setClientFilter] = useState(filters.clientId);
  const [factureFilter, setFactureFilter] = useState(filters.factureId);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);

  const basePath = `/${locale}/admin/facturation/avoirs`;

  // Calculate stats
  const draftCount = stats.find((s) => s.status === "DRAFT")?.count || 0;
  const sentCount = stats.find((s) => s.status === "SENT")?.count || 0;
  const refundedCount = stats.find((s) => s.status === "REFUNDED")?.count || 0;
  const totalAmount = stats.reduce((sum, s) => sum + s.total, 0);

  const updateUrl = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.set("search", searchQuery);
    if (statusFilter) searchParams.set("status", statusFilter);
    if (clientFilter) searchParams.set("clientId", clientFilter);
    if (factureFilter) searchParams.set("factureId", factureFilter);
    if (dateFrom) searchParams.set("dateFrom", dateFrom);
    if (dateTo) searchParams.set("dateTo", dateTo);

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });

    router.push(`${basePath}?${searchParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchQuery, page: "1" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setClientFilter("");
    setFactureFilter("");
    setDateFrom("");
    setDateTo("");
    router.push(basePath);
  };

  const hasFilters = searchQuery || statusFilter || clientFilter || factureFilter || dateFrom || dateTo;

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const handlePrint = async (docId: string) => {
    window.open(`/api/crm/documents/${docId}/pdf`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RefreshCcw className="h-7 w-7 text-red-600" />
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        <Link
          href={`${basePath}/new`}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.newAvoir}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
            <Clock className="h-4 w-4" />
            {t.stats.draft}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {draftCount}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-blue-500 text-sm mb-1">
            <FileText className="h-4 w-4" />
            {t.stats.sent}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {sentCount}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-green-500 text-sm mb-1">
            <CheckCircle className="h-4 w-4" />
            {t.stats.refunded}
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {refundedCount}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
            <RefreshCcw className="h-4 w-4" />
            {t.stats.total}
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            -{formatCurrency(totalAmount)}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800"
            />
          </div>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors",
              showFilters || hasFilters
                ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600"
                : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            <Filter className="h-4 w-4" />
            {t.filters}
          </button>

          {/* Export */}
          <button
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            {t.export}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex flex-wrap items-end gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t.status}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                updateUrl({ status: e.target.value, page: "1" });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800"
            >
              <option value="">{t.allStatuses}</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Client Filter */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t.client}
            </label>
            <select
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                updateUrl({ clientId: e.target.value, page: "1" });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800"
            >
              <option value="">{t.allClients}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Facture Filter */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t.facture}
            </label>
            <select
              value={factureFilter}
              onChange={(e) => {
                setFactureFilter(e.target.value);
                updateUrl({ factureId: e.target.value, page: "1" });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800"
            >
              <option value="">{t.allFactures}</option>
              {factures.map((facture) => (
                <option key={facture.id} value={facture.id}>
                  {facture.number} - {facture.clientName}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t.dateFrom}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                updateUrl({ dateFrom: e.target.value, page: "1" });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t.dateTo}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                updateUrl({ dateTo: e.target.value, page: "1" });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800"
            />
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
              {t.clearFilters}
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {documents.length === 0 ? (
        <div className="text-center py-16">
          <RefreshCcw className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {t.noAvoirs}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t.noAvoirsDescription}
          </p>
          <Link
            href={`${basePath}/new`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t.newAvoir}
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.number}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.client}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.date}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.factureRef}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.amount}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.status}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 font-mono text-sm text-red-600 dark:text-red-400">
                    <Link href={`${basePath}/${doc.id}`} className="hover:underline">
                      {doc.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {doc.clientName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(doc.date)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {doc.parent ? (
                      <Link
                        href={`/${locale}/admin/facturation/factures/${doc.parent.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
                      >
                        {doc.parent.number}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(doc.totalTTC)}
                  </td>
                  <td className="px-4 py-3">
                    <DocumentStatusBadge status={doc.status as any} locale={locale} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`${basePath}/${doc.id}`)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title={t.view}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePrint(doc.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title={t.print}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t.showing} {(currentPage - 1) * 20 + 1}-
            {Math.min(currentPage * 20, totalCount)} {t.of} {totalCount} {t.documents}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateUrl({ page: String(currentPage - 1) })}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
              {t.previous}
            </button>
            <button
              onClick={() => updateUrl({ page: String(currentPage + 1) })}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t.next}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
