"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Clock,
  Send,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Printer,
  ArrowRight,
  PenTool,
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
  signedDate?: Date | null;
  clientName: string;
  totalHT: number;
  totalTTC: number;
  paidAmount: number;
  balance: number;
  client?: {
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
    children: number;
  };
}

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
}

interface BonLivraison {
  id: string;
  number: string;
  clientName: string;
}

interface Stat {
  status: string;
  count: number;
  total: number;
}

interface PVPageClientProps {
  documents: Document[];
  clients: Client[];
  bonsLivraison: BonLivraison[];
  locale: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filters: {
    status: string;
    clientId: string;
    blId: string;
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
  newPV: string;
  search: string;
  searchPlaceholder: string;
  filters: string;
  clearFilters: string;
  status: string;
  allStatuses: string;
  client: string;
  allClients: string;
  bonLivraison: string;
  allBL: string;
  dateFrom: string;
  dateTo: string;
  gridView: string;
  listView: string;
  noPV: string;
  noPVDescription: string;
  showing: string;
  of: string;
  documents: string;
  previous: string;
  next: string;
  export: string;
  view: string;
  print: string;
  createInvoice: string;
  columns: {
    number: string;
    client: string;
    date: string;
    blRef: string;
    signedDate: string;
    status: string;
    actions: string;
  };
  stats: {
    draft: string;
    sent: string;
    signed: string;
    total: string;
  };
}

const translations: Record<string, Translations> = {
  fr: {
    title: "PV de Réception",
    subtitle: "Gérez vos procès-verbaux de réception",
    newPV: "Nouveau PV",
    search: "Rechercher",
    searchPlaceholder: "Rechercher par numéro, client...",
    filters: "Filtres",
    clearFilters: "Effacer",
    status: "Statut",
    allStatuses: "Tous les statuts",
    client: "Client",
    allClients: "Tous les clients",
    bonLivraison: "Bon de livraison",
    allBL: "Tous les BL",
    dateFrom: "Du",
    dateTo: "Au",
    gridView: "Vue grille",
    listView: "Vue liste",
    noPV: "Aucun PV de réception",
    noPVDescription: "Créez votre premier PV pour commencer",
    showing: "Affichage",
    of: "sur",
    documents: "documents",
    previous: "Précédent",
    next: "Suivant",
    export: "Exporter",
    view: "Voir",
    print: "Imprimer",
    createInvoice: "Créer facture",
    columns: {
      number: "N°",
      client: "Client",
      date: "Date",
      blRef: "Réf. BL",
      signedDate: "Date signature",
      status: "Statut",
      actions: "Actions",
    },
    stats: {
      draft: "Brouillons",
      sent: "Envoyés",
      signed: "Signés",
      total: "Total",
    },
  },
  en: {
    title: "Reception Reports",
    subtitle: "Manage your reception reports",
    newPV: "New report",
    search: "Search",
    searchPlaceholder: "Search by number, client...",
    filters: "Filters",
    clearFilters: "Clear",
    status: "Status",
    allStatuses: "All statuses",
    client: "Client",
    allClients: "All clients",
    bonLivraison: "Delivery note",
    allBL: "All delivery notes",
    dateFrom: "From",
    dateTo: "To",
    gridView: "Grid view",
    listView: "List view",
    noPV: "No reception reports",
    noPVDescription: "Create your first reception report to get started",
    showing: "Showing",
    of: "of",
    documents: "documents",
    previous: "Previous",
    next: "Next",
    export: "Export",
    view: "View",
    print: "Print",
    createInvoice: "Create invoice",
    columns: {
      number: "No.",
      client: "Client",
      date: "Date",
      blRef: "DN Ref.",
      signedDate: "Signed date",
      status: "Status",
      actions: "Actions",
    },
    stats: {
      draft: "Drafts",
      sent: "Sent",
      signed: "Signed",
      total: "Total",
    },
  },
  es: {
    title: "Actas de Recepción",
    subtitle: "Gestione sus actas de recepción",
    newPV: "Nueva acta",
    search: "Buscar",
    searchPlaceholder: "Buscar por número, cliente...",
    filters: "Filtros",
    clearFilters: "Limpiar",
    status: "Estado",
    allStatuses: "Todos los estados",
    client: "Cliente",
    allClients: "Todos los clientes",
    bonLivraison: "Albarán",
    allBL: "Todos los albaranes",
    dateFrom: "Desde",
    dateTo: "Hasta",
    gridView: "Vista cuadrícula",
    listView: "Vista lista",
    noPV: "Sin actas de recepción",
    noPVDescription: "Cree su primera acta para comenzar",
    showing: "Mostrando",
    of: "de",
    documents: "documentos",
    previous: "Anterior",
    next: "Siguiente",
    export: "Exportar",
    view: "Ver",
    print: "Imprimir",
    createInvoice: "Crear factura",
    columns: {
      number: "N°",
      client: "Cliente",
      date: "Fecha",
      blRef: "Ref. Albarán",
      signedDate: "Fecha firma",
      status: "Estado",
      actions: "Acciones",
    },
    stats: {
      draft: "Borradores",
      sent: "Enviados",
      signed: "Firmados",
      total: "Total",
    },
  },
  ar: {
    title: "محاضر الاستلام",
    subtitle: "إدارة محاضر الاستلام",
    newPV: "محضر جديد",
    search: "بحث",
    searchPlaceholder: "البحث بالرقم، العميل...",
    filters: "الفلاتر",
    clearFilters: "مسح",
    status: "الحالة",
    allStatuses: "جميع الحالات",
    client: "العميل",
    allClients: "جميع العملاء",
    bonLivraison: "سند التسليم",
    allBL: "جميع السندات",
    dateFrom: "من",
    dateTo: "إلى",
    gridView: "عرض الشبكة",
    listView: "عرض القائمة",
    noPV: "لا محاضر استلام",
    noPVDescription: "أنشئ أول محضر للبدء",
    showing: "عرض",
    of: "من",
    documents: "وثائق",
    previous: "السابق",
    next: "التالي",
    export: "تصدير",
    view: "عرض",
    print: "طباعة",
    createInvoice: "إنشاء فاتورة",
    columns: {
      number: "الرقم",
      client: "العميل",
      date: "التاريخ",
      blRef: "مرجع السند",
      signedDate: "تاريخ التوقيع",
      status: "الحالة",
      actions: "الإجراءات",
    },
    stats: {
      draft: "مسودات",
      sent: "مرسلة",
      signed: "موقعة",
      total: "الإجمالي",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Status Options
// ═══════════════════════════════════════════════════════════

const statusOptions: DocumentStatus[] = ["DRAFT", "SENT", "SIGNED", "CANCELLED"];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function PVPageClient({
  documents,
  clients,
  bonsLivraison,
  locale,
  currentPage,
  totalPages,
  totalCount,
  filters,
  stats,
}: PVPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [view, setView] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [clientFilter, setClientFilter] = useState(filters.clientId);
  const [blFilter, setBlFilter] = useState(filters.blId);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);

  const basePath = `/${locale}/admin/facturation/pv`;

  // Calculate stats
  const draftCount = stats.find((s) => s.status === "DRAFT")?.count || 0;
  const sentCount = stats.find((s) => s.status === "SENT")?.count || 0;
  const signedCount = stats.find((s) => s.status === "SIGNED")?.count || 0;
  const totalValue = stats.reduce((sum, s) => sum + s.total, 0);

  const updateUrl = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.set("search", searchQuery);
    if (statusFilter) searchParams.set("status", statusFilter);
    if (clientFilter) searchParams.set("clientId", clientFilter);
    if (blFilter) searchParams.set("blId", blFilter);
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
    setBlFilter("");
    setDateFrom("");
    setDateTo("");
    router.push(basePath);
  };

  const hasFilters = searchQuery || statusFilter || clientFilter || blFilter || dateFrom || dateTo;

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

  const handleCreateInvoice = async (docId: string) => {
    router.push(`/${locale}/admin/facturation/factures/new?pvId=${docId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-amber-600" />
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        <Link
          href={`${basePath}/new`}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.newPV}
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
            <Send className="h-4 w-4" />
            {t.stats.sent}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {sentCount}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-green-500 text-sm mb-1">
            <PenTool className="h-4 w-4" />
            {t.stats.signed}
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {signedCount}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-amber-500 text-sm mb-1">
            <FileText className="h-4 w-4" />
            {t.stats.total}
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(totalValue)}
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
            />
          </div>
        </form>

        {/* View & Filters */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "p-2 rounded-md transition-colors",
                view === "grid"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
              title={t.gridView}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-2 rounded-md transition-colors",
                view === "list"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
              title={t.listView}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors",
              showFilters || hasFilters
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
            >
              <option value="">{t.allClients}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* BL Filter */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t.bonLivraison}
            </label>
            <select
              value={blFilter}
              onChange={(e) => {
                setBlFilter(e.target.value);
                updateUrl({ blId: e.target.value, page: "1" });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
            >
              <option value="">{t.allBL}</option>
              {bonsLivraison.map((bl) => (
                <option key={bl.id} value={bl.id}>
                  {bl.number} - {bl.clientName}
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
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
          <ClipboardCheck className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {t.noPV}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t.noPVDescription}
          </p>
          <Link
            href={`${basePath}/new`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t.newPV}
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
                  {t.columns.blRef}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.signedDate}
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
                  <td className="px-4 py-3 font-mono text-sm text-amber-600 dark:text-amber-400">
                    <Link href={`${basePath}/${doc.id}`} className="hover:underline">
                      {doc.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {doc.clientName}
                    </div>
                    {doc.client && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.client.clientNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(doc.date)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {doc.parent ? (
                      <Link
                        href={`/${locale}/admin/facturation/bl/${doc.parent.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
                      >
                        {doc.parent.number}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {doc.signedDate ? formatDate(doc.signedDate) : "-"}
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
                      {doc.status === "SIGNED" && (
                        <button
                          onClick={() => handleCreateInvoice(doc.id)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title={t.createInvoice}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
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
