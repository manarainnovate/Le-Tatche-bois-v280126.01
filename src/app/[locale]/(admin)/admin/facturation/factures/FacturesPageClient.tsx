"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Printer,
  CreditCard,
  FileText,
  TrendingUp,
  DollarSign,
  Trash2,
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
  dueDate?: Date | null;
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
    payments: number;
  };
}

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
}

interface Stat {
  status: string;
  count: number;
  total: number;
  paid: number;
  balance: number;
}

interface FacturesPageClientProps {
  documents: Document[];
  clients: Client[];
  locale: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filters: {
    status: string;
    clientId: string;
    search: string;
    dateFrom: string;
    dateTo: string;
    overdue: string;
  };
  stats: Stat[];
  overdueStats: {
    count: number;
    balance: number;
  };
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  title: string;
  subtitle: string;
  newInvoice: string;
  search: string;
  searchPlaceholder: string;
  filters: string;
  clearFilters: string;
  status: string;
  allStatuses: string;
  client: string;
  allClients: string;
  dateFrom: string;
  dateTo: string;
  showOverdue: string;
  noInvoices: string;
  noInvoicesDescription: string;
  showing: string;
  of: string;
  documents: string;
  previous: string;
  next: string;
  export: string;
  view: string;
  print: string;
  addPayment: string;
  columns: {
    number: string;
    client: string;
    date: string;
    dueDate: string;
    amount: string;
    paid: string;
    balance: string;
    status: string;
    actions: string;
  };
  stats: {
    draft: string;
    sent: string;
    partial: string;
    paid: string;
    overdue: string;
    totalRevenue: string;
    outstanding: string;
  };
}

const translations: Record<string, Translations> = {
  fr: {
    title: "Factures",
    subtitle: "Gérez vos factures clients",
    newInvoice: "Nouvelle facture",
    search: "Rechercher",
    searchPlaceholder: "Rechercher par numéro, client...",
    filters: "Filtres",
    clearFilters: "Effacer",
    status: "Statut",
    allStatuses: "Tous les statuts",
    client: "Client",
    allClients: "Tous les clients",
    dateFrom: "Du",
    dateTo: "Au",
    showOverdue: "Impayées uniquement",
    noInvoices: "Aucune facture",
    noInvoicesDescription: "Créez votre première facture pour commencer",
    showing: "Affichage",
    of: "sur",
    documents: "documents",
    previous: "Précédent",
    next: "Suivant",
    export: "Exporter",
    view: "Voir",
    print: "Imprimer",
    addPayment: "Ajouter paiement",
    columns: {
      number: "N°",
      client: "Client",
      date: "Date",
      dueDate: "Échéance",
      amount: "Montant TTC",
      paid: "Payé",
      balance: "Solde",
      status: "Statut",
      actions: "Actions",
    },
    stats: {
      draft: "Brouillons",
      sent: "Envoyées",
      partial: "Partiellement payées",
      paid: "Payées",
      overdue: "En retard",
      totalRevenue: "Chiffre d'affaires",
      outstanding: "Créances",
    },
  },
  en: {
    title: "Invoices",
    subtitle: "Manage your client invoices",
    newInvoice: "New invoice",
    search: "Search",
    searchPlaceholder: "Search by number, client...",
    filters: "Filters",
    clearFilters: "Clear",
    status: "Status",
    allStatuses: "All statuses",
    client: "Client",
    allClients: "All clients",
    dateFrom: "From",
    dateTo: "To",
    showOverdue: "Overdue only",
    noInvoices: "No invoices",
    noInvoicesDescription: "Create your first invoice to get started",
    showing: "Showing",
    of: "of",
    documents: "documents",
    previous: "Previous",
    next: "Next",
    export: "Export",
    view: "View",
    print: "Print",
    addPayment: "Add payment",
    columns: {
      number: "No.",
      client: "Client",
      date: "Date",
      dueDate: "Due date",
      amount: "Total",
      paid: "Paid",
      balance: "Balance",
      status: "Status",
      actions: "Actions",
    },
    stats: {
      draft: "Drafts",
      sent: "Sent",
      partial: "Partially paid",
      paid: "Paid",
      overdue: "Overdue",
      totalRevenue: "Revenue",
      outstanding: "Outstanding",
    },
  },
  es: {
    title: "Facturas",
    subtitle: "Gestione sus facturas de clientes",
    newInvoice: "Nueva factura",
    search: "Buscar",
    searchPlaceholder: "Buscar por número, cliente...",
    filters: "Filtros",
    clearFilters: "Limpiar",
    status: "Estado",
    allStatuses: "Todos los estados",
    client: "Cliente",
    allClients: "Todos los clientes",
    dateFrom: "Desde",
    dateTo: "Hasta",
    showOverdue: "Solo vencidas",
    noInvoices: "Sin facturas",
    noInvoicesDescription: "Cree su primera factura para comenzar",
    showing: "Mostrando",
    of: "de",
    documents: "documentos",
    previous: "Anterior",
    next: "Siguiente",
    export: "Exportar",
    view: "Ver",
    print: "Imprimir",
    addPayment: "Añadir pago",
    columns: {
      number: "N°",
      client: "Cliente",
      date: "Fecha",
      dueDate: "Vencimiento",
      amount: "Total",
      paid: "Pagado",
      balance: "Saldo",
      status: "Estado",
      actions: "Acciones",
    },
    stats: {
      draft: "Borradores",
      sent: "Enviadas",
      partial: "Parcialmente pagadas",
      paid: "Pagadas",
      overdue: "Vencidas",
      totalRevenue: "Ingresos",
      outstanding: "Pendiente",
    },
  },
  ar: {
    title: "الفواتير",
    subtitle: "إدارة فواتير العملاء",
    newInvoice: "فاتورة جديدة",
    search: "بحث",
    searchPlaceholder: "البحث بالرقم، العميل...",
    filters: "الفلاتر",
    clearFilters: "مسح",
    status: "الحالة",
    allStatuses: "جميع الحالات",
    client: "العميل",
    allClients: "جميع العملاء",
    dateFrom: "من",
    dateTo: "إلى",
    showOverdue: "المتأخرة فقط",
    noInvoices: "لا فواتير",
    noInvoicesDescription: "أنشئ أول فاتورة للبدء",
    showing: "عرض",
    of: "من",
    documents: "وثائق",
    previous: "السابق",
    next: "التالي",
    export: "تصدير",
    view: "عرض",
    print: "طباعة",
    addPayment: "إضافة دفعة",
    columns: {
      number: "الرقم",
      client: "العميل",
      date: "التاريخ",
      dueDate: "تاريخ الاستحقاق",
      amount: "المبلغ",
      paid: "المدفوع",
      balance: "الرصيد",
      status: "الحالة",
      actions: "الإجراءات",
    },
    stats: {
      draft: "مسودات",
      sent: "مرسلة",
      partial: "مدفوعة جزئياً",
      paid: "مدفوعة",
      overdue: "متأخرة",
      totalRevenue: "الإيرادات",
      outstanding: "المستحقات",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Status Options
// ═══════════════════════════════════════════════════════════

const statusOptions: DocumentStatus[] = [
  "DRAFT",
  "SENT",
  "PARTIAL",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function FacturesPageClient({
  documents,
  clients,
  locale,
  currentPage,
  totalPages,
  totalCount,
  filters,
  stats,
  overdueStats,
}: FacturesPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [clientFilter, setClientFilter] = useState(filters.clientId);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);
  const [showOverdue, setShowOverdue] = useState(filters.overdue === "true");

  // ═══════════════════════════════════════════════════════════
  // Selection State
  // ═══════════════════════════════════════════════════════════
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const basePath = `/${locale}/admin/facturation/factures`;

  // Calculate stats
  const draftCount = stats.find((s) => s.status === "DRAFT")?.count || 0;
  const sentCount = stats.find((s) => s.status === "SENT")?.count || 0;
  const partialCount = stats.find((s) => s.status === "PARTIAL")?.count || 0;
  const paidCount = stats.find((s) => s.status === "PAID")?.count || 0;
  const totalRevenue = stats
    .filter((s) => s.status === "PAID")
    .reduce((sum, s) => sum + s.total, 0);
  const totalOutstanding = stats.reduce((sum, s) => sum + s.balance, 0);

  const updateUrl = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.set("search", searchQuery);
    if (statusFilter) searchParams.set("status", statusFilter);
    if (clientFilter) searchParams.set("clientId", clientFilter);
    if (dateFrom) searchParams.set("dateFrom", dateFrom);
    if (dateTo) searchParams.set("dateTo", dateTo);
    if (showOverdue) searchParams.set("overdue", "true");

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
    setDateFrom("");
    setDateTo("");
    setShowOverdue(false);
    router.push(basePath);
  };

  const hasFilters = searchQuery || statusFilter || clientFilter || dateFrom || dateTo || showOverdue;

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

  const isOverdue = (doc: Document) => {
    return (
      doc.dueDate &&
      new Date(doc.dueDate) < new Date() &&
      doc.status !== "PAID" &&
      doc.balance > 0
    );
  };

  // ═══════════════════════════════════════════════════════════
  // Selection Handlers
  // ═══════════════════════════════════════════════════════════
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === documents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(documents.map((d) => d.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedCount = selectedIds.size;
  const selectedDocs = documents.filter((d) => selectedIds.has(d.id));
  const selectedDrafts = selectedDocs.filter((d) => d.status === "DRAFT");
  const selectedNonDrafts = selectedDocs.filter((d) => d.status !== "DRAFT");

  // ═══════════════════════════════════════════════════════════
  // Bulk Delete Handler
  // ═══════════════════════════════════════════════════════════
  const handleBulkDelete = async () => {
    if (selectedNonDrafts.length > 0) {
      alert(
        `Impossible de supprimer ${selectedNonDrafts.length} document(s) confirmé(s). Seuls les brouillons peuvent être supprimés.`
      );
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/crm/documents/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de suppression");
      }

      setShowBulkDelete(false);
      clearSelection();
      router.refresh();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert(error instanceof Error ? error.message : "Erreur de suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // Export Handler
  // ═══════════════════════════════════════════════════════════
  const handleExport = async (format: "excel" | "pdf") => {
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const body = {
        format,
        type: "FACTURE",
        ...(selectedIds.size > 0 ? { ids: Array.from(selectedIds) } : {}),
      };

      const res = await fetch("/api/crm/documents/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Erreur d'export");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        format === "excel"
          ? `factures-${new Date().toISOString().split("T")[0]}.xlsx`
          : `factures-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      clearSelection();
    } catch (error) {
      console.error("Export error:", error);
      alert("Erreur d'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-7 w-7 text-amber-600" />
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
          {t.newInvoice}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
          <div className="flex items-center gap-2 text-amber-500 text-sm mb-1">
            <CreditCard className="h-4 w-4" />
            {t.stats.partial}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {partialCount}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-green-500 text-sm mb-1">
            <CheckCircle className="h-4 w-4" />
            {t.stats.paid}
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {paidCount}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
            <AlertTriangle className="h-4 w-4" />
            {t.stats.overdue}
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overdueStats.count}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
            <TrendingUp className="h-4 w-4" />
            {t.stats.totalRevenue}
          </div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
            <DollarSign className="h-4 w-4" />
            {t.stats.outstanding}
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(totalOutstanding)}
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

        {/* Filters */}
        <div className="flex items-center gap-2">
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

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Export..." : t.export}
              {selectedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded">
                  {selectedCount}
                </span>
              )}
            </button>

            {/* Export Menu */}
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                      {selectedCount > 0
                        ? `Exporter ${selectedCount} sélectionné${selectedCount > 1 ? "s" : ""}`
                        : "Exporter tous les documents"}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => handleExport("excel")}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <FileText className="h-4 w-4 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium">Excel (.xlsx)</div>
                        <div className="text-xs text-gray-500">Feuilles multiples</div>
                      </div>
                    </button>
                    <button
                      onClick={() => alert("Export PDF sera disponible prochainement")}
                      disabled
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 dark:text-gray-600 rounded cursor-not-allowed opacity-50"
                    >
                      <FileText className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">PDF</div>
                        <div className="text-xs">Bientôt disponible</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {selectedCount} document{selectedCount > 1 ? "s" : ""} sélectionné
              {selectedCount > 1 ? "s" : ""}
            </div>
            {selectedNonDrafts.length > 0 && (
              <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">
                {selectedNonDrafts.length} confirmé{selectedNonDrafts.length > 1 ? "s" : ""} (non
                supprimable{selectedNonDrafts.length > 1 ? "s" : ""})
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedDrafts.length > 0 && (
              <button
                onClick={() => setShowBulkDelete(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer {selectedDrafts.length} brouillon
                {selectedDrafts.length > 1 ? "s" : ""}
              </button>
            )}

            <button
              onClick={clearSelection}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
          </div>
        </div>
      )}

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

          {/* Show Overdue */}
          <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOverdue}
              onChange={(e) => {
                setShowOverdue(e.target.checked);
                updateUrl({ overdue: e.target.checked ? "true" : "", page: "1" });
              }}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t.showOverdue}
            </span>
          </label>

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
          <Receipt className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {t.noInvoices}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t.noInvoicesDescription}
          </p>
          <Link
            href={`${basePath}/new`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t.newInvoice}
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === documents.length && documents.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                </th>
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
                  {t.columns.dueDate}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.amount}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.paid}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.columns.balance}
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
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                    isOverdue(doc) && "bg-red-50 dark:bg-red-900/10",
                    selectedIds.has(doc.id) && "bg-amber-50 dark:bg-amber-900/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-amber-600 dark:text-amber-400">
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
                  <td
                    className={cn(
                      "px-4 py-3 text-sm",
                      isOverdue(doc)
                        ? "text-red-600 dark:text-red-400 font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {doc.dueDate ? formatDate(doc.dueDate) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(doc.totalTTC)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400">
                    {formatCurrency(doc.paidAmount)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right text-sm font-semibold",
                      doc.balance > 0
                        ? isOverdue(doc)
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                        : "text-green-600 dark:text-green-400"
                    )}
                  >
                    {formatCurrency(doc.balance)}
                  </td>
                  <td className="px-4 py-3">
                    <DocumentStatusBadge
                      status={isOverdue(doc) ? "OVERDUE" : (doc.status as any)}
                      locale={locale}
                      size="sm"
                    />
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
                      {doc.balance > 0 && (
                        <button
                          onClick={() => router.push(`${basePath}/${doc.id}?payment=true`)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title={t.addPayment}
                        >
                          <CreditCard className="h-4 w-4" />
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

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.showing} {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalCount)} {t.of} {totalCount} {t.documents}
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Par page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* First Page */}
            <button
              onClick={() => updateUrl({ page: "1" })}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Première page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Previous */}
            <button
              onClick={() => updateUrl({ page: String(currentPage - 1) })}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
              {t.previous}
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => updateUrl({ page: String(page) })}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-lg transition-colors",
                        page === currentPage
                          ? "bg-amber-600 text-white font-medium"
                          : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            {/* Next */}
            <button
              onClick={() => updateUrl({ page: String(currentPage + 1) })}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t.next}
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => updateUrl({ page: String(totalPages) })}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Dernière page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Confirmer la suppression
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cette action est irréversible
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Vous êtes sur le point de supprimer définitivement :
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="font-medium">
                      {selectedDrafts.length} brouillon{selectedDrafts.length > 1 ? "s" : ""}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowBulkDelete(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Supprimer définitivement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
