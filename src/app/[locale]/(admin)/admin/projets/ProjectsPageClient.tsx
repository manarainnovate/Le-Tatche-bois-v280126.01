"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectKanban, ProjectCard, Project } from "@/components/crm/projects";
import { ProjectStatusBadge } from "@/components/crm/projects/ProjectStatusBadge";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Client {
  id: string;
  clientNumber: string;
  fullName: string;
}

interface ProjectsPageClientProps {
  initialProjects: Project[];
  clients: Client[];
  locale: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filters: {
    view: string;
    status: string;
    clientId: string;
    search: string;
  };
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  title: string;
  subtitle: string;
  addProject: string;
  search: string;
  searchPlaceholder: string;
  kanbanView: string;
  listView: string;
  filters: string;
  clearFilters: string;
  status: string;
  allStatuses: string;
  client: string;
  allClients: string;
  noProjects: string;
  noProjectsDescription: string;
  showing: string;
  of: string;
  projects: string;
  previous: string;
  next: string;
}

const translations: Record<string, Translations> = {
  fr: {
    title: "Projets",
    subtitle: "Gérez vos projets de fabrication et de pose",
    addProject: "Nouveau projet",
    search: "Rechercher",
    searchPlaceholder: "Rechercher par nom, numéro...",
    kanbanView: "Vue Kanban",
    listView: "Vue Liste",
    filters: "Filtres",
    clearFilters: "Effacer",
    status: "Statut",
    allStatuses: "Tous les statuts",
    client: "Client",
    allClients: "Tous les clients",
    noProjects: "Aucun projet",
    noProjectsDescription: "Créez votre premier projet pour commencer",
    showing: "Affichage",
    of: "sur",
    projects: "projets",
    previous: "Précédent",
    next: "Suivant",
  },
  en: {
    title: "Projects",
    subtitle: "Manage your fabrication and installation projects",
    addProject: "New project",
    search: "Search",
    searchPlaceholder: "Search by name, number...",
    kanbanView: "Kanban View",
    listView: "List View",
    filters: "Filters",
    clearFilters: "Clear",
    status: "Status",
    allStatuses: "All statuses",
    client: "Client",
    allClients: "All clients",
    noProjects: "No projects",
    noProjectsDescription: "Create your first project to get started",
    showing: "Showing",
    of: "of",
    projects: "projects",
    previous: "Previous",
    next: "Next",
  },
  es: {
    title: "Proyectos",
    subtitle: "Gestione sus proyectos de fabricación e instalación",
    addProject: "Nuevo proyecto",
    search: "Buscar",
    searchPlaceholder: "Buscar por nombre, número...",
    kanbanView: "Vista Kanban",
    listView: "Vista Lista",
    filters: "Filtros",
    clearFilters: "Limpiar",
    status: "Estado",
    allStatuses: "Todos los estados",
    client: "Cliente",
    allClients: "Todos los clientes",
    noProjects: "Sin proyectos",
    noProjectsDescription: "Cree su primer proyecto para comenzar",
    showing: "Mostrando",
    of: "de",
    projects: "proyectos",
    previous: "Anterior",
    next: "Siguiente",
  },
  ar: {
    title: "المشاريع",
    subtitle: "إدارة مشاريع التصنيع والتركيب",
    addProject: "مشروع جديد",
    search: "بحث",
    searchPlaceholder: "البحث بالاسم، الرقم...",
    kanbanView: "عرض كانبان",
    listView: "عرض القائمة",
    filters: "الفلاتر",
    clearFilters: "مسح",
    status: "الحالة",
    allStatuses: "كل الحالات",
    client: "العميل",
    allClients: "كل العملاء",
    noProjects: "لا مشاريع",
    noProjectsDescription: "أنشئ مشروعك الأول للبدء",
    showing: "عرض",
    of: "من",
    projects: "مشاريع",
    previous: "السابق",
    next: "التالي",
  },
};

// ═══════════════════════════════════════════════════════════
// Status Options
// ═══════════════════════════════════════════════════════════

const statusOptions = [
  "STUDY",
  "MEASURES",
  "QUOTE",
  "PENDING",
  "PRODUCTION",
  "READY",
  "DELIVERY",
  "INSTALLATION",
  "COMPLETED",
  "RECEIVED",
  "CLOSED",
  "CANCELLED",
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectsPageClient({
  initialProjects,
  clients,
  locale,
  currentPage,
  totalPages,
  totalCount,
  filters,
}: ProjectsPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [view, setView] = useState<"kanban" | "list">(
    filters.view as "kanban" | "list" || "kanban"
  );
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [clientFilter, setClientFilter] = useState(filters.clientId);

  const updateUrl = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    if (view !== "kanban") searchParams.set("view", view);
    if (searchQuery) searchParams.set("search", searchQuery);
    if (statusFilter) searchParams.set("status", statusFilter);
    if (clientFilter) searchParams.set("clientId", clientFilter);

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });

    router.push(`/${locale}/admin/projets?${searchParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchQuery, page: "1" });
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    const response = await fetch(`/api/crm/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update project status");
    }

    router.refresh();
  };

  const handleProjectClick = (project: Project) => {
    router.push(`/${locale}/admin/projets/${project.id}`);
  };

  const handleAddProject = () => {
    router.push(`/${locale}/admin/projets/new`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setClientFilter("");
    router.push(`/${locale}/admin/projets`);
  };

  const hasFilters = searchQuery || statusFilter || clientFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="h-7 w-7 text-amber-600" />
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        <button
          onClick={handleAddProject}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.addProject}
        </button>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </form>

        {/* View Toggle & Filters */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => {
                setView("kanban");
                updateUrl({ view: "" });
              }}
              className={cn(
                "p-2 rounded-md transition-colors",
                view === "kanban"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
              title={t.kanbanView}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setView("list");
                updateUrl({ view: "list" });
              }}
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
            {hasFilters && (
              <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex flex-wrap items-center gap-4">
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">{t.allClients}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.clientNumber} - {client.fullName}
                </option>
              ))}
            </select>
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
      {initialProjects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {t.noProjects}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t.noProjectsDescription}
          </p>
          <button
            onClick={handleAddProject}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t.addProject}
          </button>
        </div>
      ) : view === "kanban" ? (
        <ProjectKanban
          initialProjects={initialProjects}
          locale={locale}
          onProjectClick={handleProjectClick}
          onProjectStatusChange={handleStatusChange}
          onAddProject={handleAddProject}
        />
      ) : (
        <div className="space-y-4">
          {/* List View */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                locale={locale}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t.showing} {(currentPage - 1) * 50 + 1}-
                {Math.min(currentPage * 50, totalCount)} {t.of} {totalCount}{" "}
                {t.projects}
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
      )}
    </div>
  );
}
