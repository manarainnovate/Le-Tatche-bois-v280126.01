"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  LayoutGrid,
  List,
  Filter,
  Search,
  Target,
  X,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/stores/currency";
import {
  LeadKanban,
  LeadCardSimple,
  LeadStatusBadge,
  ConvertLeadModal,
  Lead,
} from "@/components/crm/leads";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type LeadStatus =
  | "NOUVEAU"
  | "CONTACTE"
  | "QUALIFIE"
  | "PROPOSITION"
  | "NEGOCIATION"
  | "GAGNE"
  | "PERDU";

interface User {
  id: string;
  name: string | null;
}

interface LeadsPageClientProps {
  initialLeads: Lead[];
  users: User[];
  stats: Record<string, { count: number; budget: number }>;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    leads: "Leads",
    newLead: "Nouveau lead",
    kanbanView: "Vue Kanban",
    listView: "Vue liste",
    filters: "Filtres",
    searchPlaceholder: "Rechercher un lead...",
    allSources: "Toutes les sources",
    allUsers: "Tous les utilisateurs",
    clearFilters: "Effacer les filtres",
    total: "Total",
    refresh: "Actualiser",
    convertLead: "Convertir en client",
    NOUVEAU: "Nouveaux",
    CONTACTE: "Contactés",
    QUALIFIE: "Qualifiés",
    PROPOSITION: "Propositions",
    NEGOCIATION: "Négociations",
    GAGNE: "Gagnés",
    PERDU: "Perdus",
    noLeads: "Aucun lead trouvé",
    WEBSITE: "Site web",
    PHONE: "Téléphone",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    REFERRAL: "Recommandation",
    SOCIAL_MEDIA: "Réseaux sociaux",
    EXHIBITION: "Salon",
    OTHER: "Autre",
  },
  en: {
    leads: "Leads",
    newLead: "New lead",
    kanbanView: "Kanban view",
    listView: "List view",
    filters: "Filters",
    searchPlaceholder: "Search leads...",
    allSources: "All sources",
    allUsers: "All users",
    clearFilters: "Clear filters",
    total: "Total",
    refresh: "Refresh",
    convertLead: "Convert to client",
    NOUVEAU: "New",
    CONTACTE: "Contacted",
    QUALIFIE: "Qualified",
    PROPOSITION: "Proposals",
    NEGOCIATION: "Negotiations",
    GAGNE: "Won",
    PERDU: "Lost",
    noLeads: "No leads found",
    WEBSITE: "Website",
    PHONE: "Phone",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    REFERRAL: "Referral",
    SOCIAL_MEDIA: "Social media",
    EXHIBITION: "Exhibition",
    OTHER: "Other",
  },
  es: {
    leads: "Prospectos",
    newLead: "Nuevo prospecto",
    kanbanView: "Vista Kanban",
    listView: "Vista lista",
    filters: "Filtros",
    searchPlaceholder: "Buscar prospectos...",
    allSources: "Todas las fuentes",
    allUsers: "Todos los usuarios",
    clearFilters: "Borrar filtros",
    total: "Total",
    refresh: "Actualizar",
    convertLead: "Convertir a cliente",
    NOUVEAU: "Nuevos",
    CONTACTE: "Contactados",
    QUALIFIE: "Calificados",
    PROPOSITION: "Propuestas",
    NEGOCIATION: "Negociaciones",
    GAGNE: "Ganados",
    PERDU: "Perdidos",
    noLeads: "No se encontraron prospectos",
    WEBSITE: "Sitio web",
    PHONE: "Teléfono",
    WHATSAPP: "WhatsApp",
    EMAIL: "Correo",
    REFERRAL: "Recomendación",
    SOCIAL_MEDIA: "Redes sociales",
    EXHIBITION: "Exposición",
    OTHER: "Otro",
  },
  ar: {
    leads: "العملاء المحتملون",
    newLead: "عميل محتمل جديد",
    kanbanView: "عرض كانبان",
    listView: "عرض القائمة",
    filters: "الفلاتر",
    searchPlaceholder: "البحث عن عميل محتمل...",
    allSources: "جميع المصادر",
    allUsers: "جميع المستخدمين",
    clearFilters: "مسح الفلاتر",
    total: "الإجمالي",
    refresh: "تحديث",
    convertLead: "تحويل إلى عميل",
    NOUVEAU: "جديد",
    CONTACTE: "تم الاتصال",
    QUALIFIE: "مؤهل",
    PROPOSITION: "عروض",
    NEGOCIATION: "مفاوضات",
    GAGNE: "ناجح",
    PERDU: "خاسر",
    noLeads: "لم يتم العثور على عملاء محتملين",
    WEBSITE: "الموقع",
    PHONE: "الهاتف",
    WHATSAPP: "واتساب",
    EMAIL: "البريد",
    REFERRAL: "توصية",
    SOCIAL_MEDIA: "وسائل التواصل",
    EXHIBITION: "معرض",
    OTHER: "آخر",
  },
};

const SOURCES = [
  "WEBSITE",
  "PHONE",
  "WHATSAPP",
  "EMAIL",
  "REFERRAL",
  "SOCIAL_MEDIA",
  "EXHIBITION",
  "OTHER",
];

const STATUSES: LeadStatus[] = [
  "NOUVEAU",
  "CONTACTE",
  "QUALIFIE",
  "PROPOSITION",
  "NEGOCIATION",
  "GAGNE",
  "PERDU",
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function LeadsPageClient({
  initialLeads,
  users,
  stats,
  locale,
}: LeadsPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);

  // State
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Convert modal
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        lead.contactName.toLowerCase().includes(query) ||
        lead.company?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.includes(query) ||
        lead.leadNumber.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Source
    if (selectedSource && lead.source !== selectedSource) return false;

    // User (would need assignedToId in Lead type)
    // if (selectedUser && lead.assignedToId !== selectedUser) return false;

    // Status
    if (selectedStatus && lead.status !== selectedStatus) return false;

    return true;
  });

  // Calculate totals
  const totalLeads = leads.length;
  const totalBudget = leads.reduce(
    (sum, lead) => sum + (lead.estimatedBudget || 0),
    0
  );

  const { format: formatCurrency } = useCurrency();

  // Handle lead status change (for Kanban drag)
  const handleLeadStatusChange = useCallback(
    async (leadId: string, newStatus: LeadStatus) => {
      try {
        const response = await fetch(`/api/crm/leads/${leadId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error("Failed to update lead status");
        }

        // Update local state
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId ? { ...lead, status: newStatus } : lead
          )
        );
      } catch (error) {
        console.error("Error updating lead status:", error);
        throw error;
      }
    },
    []
  );

  // Handle lead click
  const handleLeadClick = (lead: Lead) => {
    router.push(`/${locale}/admin/crm/leads/${lead.id}`);
  };

  // Handle add lead (with optional status)
  const handleAddLead = (status?: LeadStatus) => {
    const url = status
      ? `/${locale}/admin/crm/leads/new?status=${status}`
      : `/${locale}/admin/crm/leads/new`;
    router.push(url);
  };

  // Handle convert lead
  const handleConvertClick = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertModalOpen(true);
  };

  const handleConvert = async (data: {
    createProject: boolean;
    projectName?: string;
    projectType?: string;
    projectBudget?: number;
  }) => {
    if (!selectedLead) return;

    const response = await fetch(`/api/crm/leads/${selectedLead.id}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to convert lead");
    }

    // Refresh data
    router.refresh();
    setConvertModalOpen(false);
    setSelectedLead(null);
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/crm/leads");
      if (response.ok) {
        const data = await response.json();
        setLeads(data.data || []);
      }
    } catch (error) {
      console.error("Error refreshing leads:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSource("");
    setSelectedUser("");
    setSelectedStatus("");
  };

  const hasActiveFilters =
    searchQuery || selectedSource || selectedUser || selectedStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-7 w-7 text-amber-600" />
            {t.leads}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalLeads} leads • {formatCurrency(totalBudget)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title={t.refresh}
          >
            <RefreshCw
              className={cn("h-5 w-5", isRefreshing && "animate-spin")}
            />
          </button>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "kanban"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
              title={t.kanbanView}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
              title={t.listView}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showFilters || hasActiveFilters
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            )}
          >
            <Filter className="h-5 w-5" />
          </button>

          {/* New Lead Button */}
          <Link
            href={`/${locale}/admin/crm/leads/new`}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t.newLead}</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {STATUSES.map((status) => {
          const stat = stats[status] || { count: 0, budget: 0 };
          return (
            <button
              key={status}
              type="button"
              onClick={() =>
                setSelectedStatus(selectedStatus === status ? "" : status)
              }
              className={cn(
                "p-3 rounded-lg border transition-all text-left",
                selectedStatus === status
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <LeadStatusBadge status={status} size="sm" locale={locale} showDot={false} />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.count}
                </span>
              </div>
              {stat.budget > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {formatCurrency(stat.budget)}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t.filters}
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                {t.clearFilters}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">{t.allSources}</option>
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {t[source] || source}
                </option>
              ))}
            </select>

            {/* User Filter */}
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">{t.allUsers}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Target className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t.noLeads}</p>
          <Link
            href={`/${locale}/admin/crm/leads/new`}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t.newLead}
          </Link>
        </div>
      ) : viewMode === "kanban" ? (
        <LeadKanban
          initialLeads={filteredLeads}
          locale={locale}
          onLeadClick={handleLeadClick}
          onLeadStatusChange={handleLeadStatusChange}
          onAddLead={handleAddLead}
        />
      ) : (
        <div className="grid gap-3">
          {filteredLeads.map((lead) => (
            <LeadCardSimple
              key={lead.id}
              lead={lead}
              locale={locale}
              onClick={() => handleLeadClick(lead)}
            />
          ))}
        </div>
      )}

      {/* Convert Modal */}
      {selectedLead && (
        <ConvertLeadModal
          lead={selectedLead}
          locale={locale}
          isOpen={convertModalOpen}
          onClose={() => {
            setConvertModalOpen(false);
            setSelectedLead(null);
          }}
          onConvert={handleConvert}
        />
      )}
    </div>
  );
}
