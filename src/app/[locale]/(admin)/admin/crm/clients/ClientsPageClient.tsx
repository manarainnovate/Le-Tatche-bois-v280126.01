"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  DollarSign,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Client {
  id: string;
  clientNumber: string;
  fullName: string;
  company: string | null;
  clientType: "INDIVIDUAL" | "COMPANY";
  email?: string | null;
  phone?: string | null;
  billingCity?: string | null;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  createdAt: Date | string;
  _count: {
    projects: number;
    documents: number;
    activities: number;
  };
}

interface ClientsPageClientProps {
  initialClients: Client[];
  stats: {
    total: number;
    totalRevenue: number;
    totalPaid: number;
    balance: number;
    byType: Record<string, number>;
  };
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    clients: "Clients",
    newClient: "Nouveau client",
    searchPlaceholder: "Rechercher un client...",
    filters: "Filtres",
    allTypes: "Tous les types",
    allCities: "Toutes les villes",
    withBalance: "Avec solde",
    clearFilters: "Effacer les filtres",
    total: "Total clients",
    totalRevenue: "CA Total",
    totalPaid: "Total payé",
    balance: "Solde à recevoir",
    noClients: "Aucun client trouvé",
    refresh: "Actualiser",
    view: "Voir",
    edit: "Modifier",
    projects: "projets",
    documents: "documents",
    INDIVIDUAL: "Particulier",
    COMPANY: "Entreprise",
    dateCreated: "Date de création",
    code: "Code",
  },
  en: {
    clients: "Clients",
    newClient: "New client",
    searchPlaceholder: "Search clients...",
    filters: "Filters",
    allTypes: "All types",
    allCities: "All cities",
    withBalance: "With balance",
    clearFilters: "Clear filters",
    total: "Total clients",
    totalRevenue: "Total Revenue",
    totalPaid: "Total Paid",
    balance: "Balance Due",
    noClients: "No clients found",
    refresh: "Refresh",
    view: "View",
    edit: "Edit",
    projects: "projects",
    documents: "documents",
    INDIVIDUAL: "Individual",
    COMPANY: "Company",
    dateCreated: "Created",
    code: "Code",
  },
  es: {
    clients: "Clientes",
    newClient: "Nuevo cliente",
    searchPlaceholder: "Buscar clientes...",
    filters: "Filtros",
    allTypes: "Todos los tipos",
    allCities: "Todas las ciudades",
    withBalance: "Con saldo",
    clearFilters: "Borrar filtros",
    total: "Total clientes",
    totalRevenue: "Ingresos Totales",
    totalPaid: "Total Pagado",
    balance: "Saldo Pendiente",
    noClients: "No se encontraron clientes",
    refresh: "Actualizar",
    view: "Ver",
    edit: "Editar",
    projects: "proyectos",
    documents: "documentos",
    INDIVIDUAL: "Particular",
    COMPANY: "Empresa",
    dateCreated: "Fecha de creación",
    code: "Código",
  },
  ar: {
    clients: "العملاء",
    newClient: "عميل جديد",
    searchPlaceholder: "البحث عن عميل...",
    filters: "الفلاتر",
    allTypes: "جميع الأنواع",
    allCities: "جميع المدن",
    withBalance: "مع رصيد",
    clearFilters: "مسح الفلاتر",
    total: "إجمالي العملاء",
    totalRevenue: "إجمالي الإيرادات",
    totalPaid: "إجمالي المدفوع",
    balance: "الرصيد المستحق",
    noClients: "لم يتم العثور على عملاء",
    refresh: "تحديث",
    view: "عرض",
    edit: "تعديل",
    projects: "مشاريع",
    documents: "مستندات",
    INDIVIDUAL: "فرد",
    COMPANY: "شركة",
    dateCreated: "تاريخ الإنشاء",
    code: "الرمز",
  },
};

const CITIES = [
  "Marrakech",
  "Casablanca",
  "Rabat",
  "Fes",
  "Tanger",
  "Agadir",
  "Meknes",
  "Oujda",
  "Kenitra",
  "Tetouan",
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ClientsPageClient({
  initialClients,
  stats,
  locale,
}: ClientsPageClientProps) {
  const t = translations[locale] || translations.fr;

  // State
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [withBalanceOnly, setWithBalanceOnly] = useState(false);

  // Filter clients
  const filteredClients = clients.filter((client) => {
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        client.fullName.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone?.includes(query) ||
        client.clientNumber.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Type
    if (selectedType && client.clientType !== selectedType) return false;

    // City
    if (selectedCity && client.billingCity !== selectedCity) return false;

    // Balance
    if (withBalanceOnly && client.balance <= 0) return false;

    return true;
  });

  const { format: formatCurrency } = useCurrency();

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/crm/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.data?.clients || []);
      }
    } catch (error) {
      console.error("Error refreshing clients:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedCity("");
    setWithBalanceOnly(false);
  };

  const hasActiveFilters =
    searchQuery || selectedType || selectedCity || withBalanceOnly;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-7 w-7 text-amber-600" />
            {t.clients}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.total} {t.clients.toLowerCase()}
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

          {/* New Client Button */}
          <Link
            href={`/${locale}/admin/crm/clients/new`}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t.newClient}</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.total}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.totalRevenue}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.totalPaid}
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.totalPaid)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.balance}
              </p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(stats.balance)}
              </p>
            </div>
          </div>
        </div>
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

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">{t.allTypes}</option>
              <option value="INDIVIDUAL">{t.INDIVIDUAL}</option>
              <option value="COMPANY">{t.COMPANY}</option>
            </select>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">{t.allCities}</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Balance Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={withBalanceOnly}
                onChange={(e) => setWithBalanceOnly(e.target.checked)}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t.withBalance}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t.noClients}</p>
          <Link
            href={`/${locale}/admin/crm/clients/new`}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t.newClient}
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.code}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.totalRevenue}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.balance}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.dateCreated}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/${locale}/admin/crm/clients/${client.id}`}
                  >
                    {/* Code */}
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                        {client.clientNumber}
                      </span>
                    </td>

                    {/* Client */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            client.clientType === "COMPANY"
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : "bg-blue-100 dark:bg-blue-900/30"
                          )}
                        >
                          {client.clientType === "COMPANY" ? (
                            <Building2 className="h-5 w-5 text-purple-600" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {client.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t[client.clientType]}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-sm">
                        {client.phone && client.phone !== "+212" && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <Phone className="h-3.5 w-3.5" />
                            {client.phone}
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            <Mail className="h-3.5 w-3.5" />
                            {client.email}
                          </div>
                        )}
                        {client.billingCity && (
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5" />
                            {client.billingCity}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(client.totalInvoiced) || 0)}
                      </p>
                      <p className="text-xs text-green-600">
                        Payé: {formatCurrency(Number(client.totalPaid) || 0)}
                      </p>
                    </td>

                    {/* Balance */}
                    <td className="px-4 py-4">
                      <p
                        className={cn(
                          "font-medium",
                          Number(client.balance) > 0
                            ? "text-red-600"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {formatCurrency(Number(client.balance) || 0)}
                      </p>
                    </td>

                    {/* Date Created */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(client.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/${locale}/admin/crm/clients/${client.id}`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={t.view}
                        >
                          <Eye className="h-4 w-4 text-gray-400" />
                        </Link>
                        <Link
                          href={`/${locale}/admin/crm/clients/${client.id}?edit=true`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={t.edit}
                        >
                          <Edit className="h-4 w-4 text-gray-400" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
