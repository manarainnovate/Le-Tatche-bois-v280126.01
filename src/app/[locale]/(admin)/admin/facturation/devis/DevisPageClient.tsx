"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Copy,
  Eye,
  Pencil,
  ArrowRight,
  Calendar,
  TrendingUp,
  Clock,
  Send,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/admin/StatsCard";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Document {
  id: string;
  number: string;
  date: Date;
  validUntil: Date | null;
  status: string;
  clientName: string;
  totalHT: number;
  totalTTC: number;
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
  _count: {
    items: number;
    children: number;
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
}

interface Filters {
  status: string;
  clientId: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

interface DevisPageClientProps {
  documents: Document[];
  clients: Client[];
  locale: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filters: Filters;
  stats: Stat[];
  conversionRate: number;
  expiringCount: number;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    title: "Devis B2B",
    subtitle: "Gestion des devis clients",
    newDevis: "Nouveau devis",
    search: "Rechercher...",
    filters: "Filtres",
    clearFilters: "Effacer",
    client: "Client",
    allClients: "Tous les clients",
    status: "Statut",
    allStatuses: "Tous les statuts",
    dateFrom: "Du",
    dateTo: "Au",
    number: "N° Devis",
    date: "Date",
    validity: "Validité",
    amount: "Montant TTC",
    actions: "Actions",
    view: "Voir",
    edit: "Modifier",
    duplicate: "Dupliquer",
    download: "Télécharger",
    convertToBC: "Convertir en BC",
    noResults: "Aucun devis trouvé",
    // Stats
    totalDevis: "Total Devis",
    pending: "En attente",
    accepted: "Acceptés",
    conversionRate: "Taux de conversion",
    expiringSoon: "Expire bientôt",
    thisMonth: "ce mois",
    // Statuses
    DRAFT: "Brouillon",
    SENT: "Envoyé",
    ACCEPTED: "Accepté",
    REJECTED: "Refusé",
    CANCELLED: "Annulé",
    items: "lignes",
    page: "Page",
    of: "sur",
    expired: "Expiré",
    daysLeft: "jours restants",
  },
  en: {
    title: "B2B Quotes",
    subtitle: "Manage customer quotes",
    newDevis: "New Quote",
    search: "Search...",
    filters: "Filters",
    clearFilters: "Clear",
    client: "Client",
    allClients: "All clients",
    status: "Status",
    allStatuses: "All statuses",
    dateFrom: "From",
    dateTo: "To",
    number: "Quote #",
    date: "Date",
    validity: "Valid until",
    amount: "Total Amount",
    actions: "Actions",
    view: "View",
    edit: "Edit",
    duplicate: "Duplicate",
    download: "Download",
    convertToBC: "Convert to PO",
    noResults: "No quotes found",
    totalDevis: "Total Quotes",
    pending: "Pending",
    accepted: "Accepted",
    conversionRate: "Conversion Rate",
    expiringSoon: "Expiring Soon",
    thisMonth: "this month",
    DRAFT: "Draft",
    SENT: "Sent",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    items: "items",
    page: "Page",
    of: "of",
    expired: "Expired",
    daysLeft: "days left",
  },
  es: {
    title: "Presupuestos B2B",
    subtitle: "Gestión de presupuestos de clientes",
    newDevis: "Nuevo presupuesto",
    search: "Buscar...",
    filters: "Filtros",
    clearFilters: "Borrar",
    client: "Cliente",
    allClients: "Todos los clientes",
    status: "Estado",
    allStatuses: "Todos los estados",
    dateFrom: "Desde",
    dateTo: "Hasta",
    number: "N° Presupuesto",
    date: "Fecha",
    validity: "Validez",
    amount: "Total",
    actions: "Acciones",
    view: "Ver",
    edit: "Editar",
    duplicate: "Duplicar",
    download: "Descargar",
    convertToBC: "Convertir a OC",
    noResults: "No se encontraron presupuestos",
    totalDevis: "Total Presupuestos",
    pending: "Pendientes",
    accepted: "Aceptados",
    conversionRate: "Tasa de conversión",
    expiringSoon: "Vence pronto",
    thisMonth: "este mes",
    DRAFT: "Borrador",
    SENT: "Enviado",
    ACCEPTED: "Aceptado",
    REJECTED: "Rechazado",
    CANCELLED: "Cancelado",
    items: "líneas",
    page: "Página",
    of: "de",
    expired: "Expirado",
    daysLeft: "días restantes",
  },
  ar: {
    title: "عروض الأسعار B2B",
    subtitle: "إدارة عروض أسعار العملاء",
    newDevis: "عرض سعر جديد",
    search: "بحث...",
    filters: "فلاتر",
    clearFilters: "مسح",
    client: "العميل",
    allClients: "جميع العملاء",
    status: "الحالة",
    allStatuses: "جميع الحالات",
    dateFrom: "من",
    dateTo: "إلى",
    number: "رقم عرض السعر",
    date: "التاريخ",
    validity: "الصلاحية",
    amount: "المبلغ الإجمالي",
    actions: "إجراءات",
    view: "عرض",
    edit: "تعديل",
    duplicate: "نسخ",
    download: "تحميل",
    convertToBC: "تحويل إلى طلب شراء",
    noResults: "لم يتم العثور على عروض أسعار",
    totalDevis: "إجمالي عروض الأسعار",
    pending: "قيد الانتظار",
    accepted: "مقبولة",
    conversionRate: "معدل التحويل",
    expiringSoon: "تنتهي قريباً",
    thisMonth: "هذا الشهر",
    DRAFT: "مسودة",
    SENT: "مرسل",
    ACCEPTED: "مقبول",
    REJECTED: "مرفوض",
    CANCELLED: "ملغي",
    items: "عناصر",
    page: "صفحة",
    of: "من",
    expired: "منتهي",
    daysLeft: "أيام متبقية",
  },
};

// ═══════════════════════════════════════════════════════════
// Status Badge Component
// ═══════════════════════════════════════════════════════════

function StatusBadge({ status, locale }: { status: string; locale: string }) {
  const t = translations[locale] || translations.fr;

  const statusStyles: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
  };

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusStyles[status] || statusStyles.DRAFT)}>
      {t[status] || status}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════

export function DevisPageClient({
  documents,
  clients,
  locale,
  currentPage,
  totalPages,
  totalCount,
  filters,
  stats,
  conversionRate,
  expiringCount,
}: DevisPageClientProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isRTL = locale === "ar";

  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Calculate stats
  const totalThisMonth = stats.reduce((acc, s) => acc + s.total, 0);
  const pendingCount = stats.filter((s) => s.status === "SENT" || s.status === "DRAFT").reduce((acc, s) => acc + s.count, 0);
  const acceptedThisMonth = stats.find((s) => s.status === "ACCEPTED")?.total || 0;

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.status) params.set("status", localFilters.status);
    if (localFilters.clientId) params.set("clientId", localFilters.clientId);
    if (localFilters.search) params.set("search", localFilters.search);
    if (localFilters.dateFrom) params.set("dateFrom", localFilters.dateFrom);
    if (localFilters.dateTo) params.set("dateTo", localFilters.dateTo);
    router.push(`/${locale}/admin/facturation/devis?${params.toString()}`);
  };

  const clearFilters = () => {
    setLocalFilters({
      status: "",
      clientId: "",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
    router.push(`/${locale}/admin/facturation/devis`);
  };

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getValidityStatus = (validUntil: Date | null) => {
    if (!validUntil) return null;
    const now = new Date();
    const validity = new Date(validUntil);
    const daysLeft = Math.ceil((validity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { text: t.expired, class: "text-red-600 dark:text-red-400" };
    } else if (daysLeft <= 7) {
      return { text: `${daysLeft} ${t.daysLeft}`, class: "text-amber-600 dark:text-amber-400" };
    }
    return { text: formatDate(validUntil), class: "text-gray-500" };
  };

  return (
    <div className={cn("space-y-6", isRTL && "rtl")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/facturation/devis/new`}
          className="inline-flex items-center justify-center font-medium transition-all duration-200 bg-wood-primary text-white hover:bg-wood-dark h-10 px-4 rounded-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.newDevis}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t.totalDevis}
          value={totalCount}
          subtitle={`${formatCurrency(totalThisMonth)} ${t.thisMonth}`}
          icon="FileText"
          variant="info"
        />
        <StatsCard
          title={t.pending}
          value={pendingCount}
          icon="Clock"
          variant="warning"
        />
        <StatsCard
          title={t.accepted}
          value={formatCurrency(acceptedThisMonth)}
          icon="TrendingUp"
          variant="success"
        />
        <StatsCard
          title={t.conversionRate}
          value={`${conversionRate}%`}
          subtitle={expiringCount > 0 ? `${expiringCount} ${t.expiringSoon}` : undefined}
          icon="TrendingUp"
          variant={conversionRate >= 50 ? "success" : "warning"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t.search}
            value={localFilters.search}
            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && "bg-amber-50 border-amber-300")}
        >
          <Filter className="h-4 w-4 mr-2" />
          {t.filters}
        </Button>

        {Object.values(localFilters).some(Boolean) && (
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <X className="h-4 w-4 mr-1" />
            {t.clearFilters}
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.status}
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">{t.allStatuses}</option>
                <option value="DRAFT">{t.DRAFT}</option>
                <option value="SENT">{t.SENT}</option>
                <option value="ACCEPTED">{t.ACCEPTED}</option>
                <option value="REJECTED">{t.REJECTED}</option>
              </select>
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.client}
              </label>
              <select
                value={localFilters.clientId}
                onChange={(e) => setLocalFilters({ ...localFilters, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">{t.allClients}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName} ({client.clientNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.dateFrom}
              </label>
              <input
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.dateTo}
              </label>
              <input
                type="date"
                value={localFilters.dateTo}
                onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={applyFilters}>
              {t.filters}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.number}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.client}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.date}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.validity}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.amount}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t.noResults}</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const validityStatus = getValidityStatus(doc.validUntil);
                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/${locale}/admin/facturation/devis/${doc.id}`)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-amber-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {doc.number}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {doc._count.items} {t.items}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {doc.clientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doc.client.clientNumber}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(doc.date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {validityStatus && (
                          <span className={validityStatus.class}>
                            {validityStatus.text}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(doc.totalTTC)}
                        </p>
                        <p className="text-xs text-gray-500">
                          HT: {formatCurrency(doc.totalHT)}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={doc.status} locale={locale} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/${locale}/admin/facturation/devis/${doc.id}`}
                            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/${locale}/admin/facturation/devis/${doc.id}/edit`}
                            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <Button variant="ghost" size="sm" title={t.download}>
                            <Download className="h-4 w-4" />
                          </Button>
                          {doc.status === "ACCEPTED" && doc._count.children === 0 && (
                            <Button variant="ghost" size="sm" title={t.convertToBC}>
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {t.page} {currentPage} {t.of} {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.set("page", String(currentPage - 1));
                  router.push(`/${locale}/admin/facturation/devis?${params.toString()}`);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.set("page", String(currentPage + 1));
                  router.push(`/${locale}/admin/facturation/devis?${params.toString()}`);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
