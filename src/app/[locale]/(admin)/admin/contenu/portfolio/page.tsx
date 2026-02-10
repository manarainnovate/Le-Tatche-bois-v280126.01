"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  MapPin,
  Calendar,
  Loader2,
  FolderOpen,
  CheckSquare,
  Square,
  XCircle,
  ImageIcon,
  Merge,
  Pencil,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Portfolio",
    subtitle: "Gérez vos réalisations",
    newProject: "Nouveau projet",
    manageCategories: "Gérer les catégories",
    search: "Rechercher un projet...",
    all: "Tous",
    allStatus: "Tous statuts",
    activeOnly: "Actifs seulement",
    inactiveOnly: "Inactifs seulement",
    gridView: "Vue grille",
    listView: "Vue liste",
    featured: "Mis en avant",
    pinned: "Épinglé",
    active: "Actif",
    inactive: "Inactif",
    hidden: "Masqué",
    edit: "Modifier",
    delete: "Supprimer",
    view: "Voir",
    show: "Afficher",
    hide: "Masquer",
    pin: "Épingler",
    unpin: "Désépingler",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce projet ?",
    confirmBulkDelete: "Êtes-vous sûr de vouloir supprimer {count} projet(s) ?",
    noProjects: "Aucun projet",
    createFirst: "Créez votre premier projet",
    loading: "Chargement...",
    projectCount: "{count} projet(s)",
    selected: "{count} sélectionné(s)",
    deleteSelected: "Supprimer la sélection",
    clearSelection: "Désélectionner",
    selectAll: "Tout sélectionner",
    mergeSelected: "Fusionner les images",
    confirmMerge: "Fusionner {count} projet(s) ? Le projet avec la plus longue description sera conservé, les images seront combinées, et les doublons supprimés.",
    mergeSuccess: "Projets fusionnés avec succès",
    mergeError: "Erreur lors de la fusion",
    bulkEdit: "Modifier en lot",
    bulkEditTitle: "Modifier {count} projet(s)",
    bulkCategory: "Catégorie",
    bulkLocation: "Ville",
    bulkYear: "Année",
    bulkClient: "Client",
    bulkDuration: "Durée",
    bulkNoChange: "— Ne pas modifier —",
    bulkApply: "Appliquer",
    bulkApplying: "Application...",
    bulkEditSuccess: "Projets modifiés avec succès",
    bulkEditError: "Erreur lors de la modification",
    cancel: "Annuler",
    quickEdit: "Édition rapide",
    previewImages: "Aperçu images",
    avant: "Avant",
    apres: "Après",
    noImages: "Aucune image",
    titleLabel: "Titre",
  },
  en: {
    title: "Portfolio",
    subtitle: "Manage your projects",
    newProject: "New project",
    manageCategories: "Manage categories",
    search: "Search project...",
    all: "All",
    allStatus: "All status",
    activeOnly: "Active only",
    inactiveOnly: "Inactive only",
    gridView: "Grid view",
    listView: "List view",
    featured: "Featured",
    pinned: "Pinned",
    active: "Active",
    inactive: "Inactive",
    hidden: "Hidden",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    show: "Show",
    hide: "Hide",
    pin: "Pin",
    unpin: "Unpin",
    confirmDelete: "Are you sure you want to delete this project?",
    confirmBulkDelete: "Are you sure you want to delete {count} project(s)?",
    noProjects: "No projects",
    createFirst: "Create your first project",
    loading: "Loading...",
    projectCount: "{count} project(s)",
    selected: "{count} selected",
    deleteSelected: "Delete selected",
    clearSelection: "Clear selection",
    selectAll: "Select all",
    mergeSelected: "Merge images",
    confirmMerge: "Merge {count} project(s)? The project with the longest description will be kept, images will be combined, and duplicates removed.",
    mergeSuccess: "Projects merged successfully",
    mergeError: "Failed to merge",
    bulkEdit: "Bulk edit",
    bulkEditTitle: "Edit {count} project(s)",
    bulkCategory: "Category",
    bulkLocation: "City",
    bulkYear: "Year",
    bulkClient: "Client",
    bulkDuration: "Duration",
    bulkNoChange: "— No change —",
    bulkApply: "Apply",
    bulkApplying: "Applying...",
    bulkEditSuccess: "Projects updated successfully",
    bulkEditError: "Failed to update projects",
    cancel: "Cancel",
    quickEdit: "Quick edit",
    previewImages: "Preview images",
    avant: "Before",
    apres: "After",
    noImages: "No images",
    titleLabel: "Title",
  },
  es: {
    title: "Portfolio",
    subtitle: "Gestiona tus proyectos",
    newProject: "Nuevo proyecto",
    manageCategories: "Gestionar categorías",
    search: "Buscar proyecto...",
    all: "Todos",
    allStatus: "Todos los estados",
    activeOnly: "Solo activos",
    inactiveOnly: "Solo inactivos",
    gridView: "Vista cuadrícula",
    listView: "Vista lista",
    featured: "Destacado",
    pinned: "Fijado",
    active: "Activo",
    inactive: "Inactivo",
    hidden: "Oculto",
    edit: "Editar",
    delete: "Eliminar",
    view: "Ver",
    show: "Mostrar",
    hide: "Ocultar",
    pin: "Fijar",
    unpin: "Desfijar",
    confirmDelete: "¿Estás seguro de eliminar este proyecto?",
    confirmBulkDelete: "¿Estás seguro de eliminar {count} proyecto(s)?",
    noProjects: "Sin proyectos",
    createFirst: "Crea tu primer proyecto",
    loading: "Cargando...",
    projectCount: "{count} proyecto(s)",
    selected: "{count} seleccionado(s)",
    deleteSelected: "Eliminar seleccionados",
    clearSelection: "Limpiar selección",
    selectAll: "Seleccionar todo",
    mergeSelected: "Fusionar imágenes",
    confirmMerge: "¿Fusionar {count} proyecto(s)? Se conservará el proyecto con la descripción más larga, se combinarán las imágenes y se eliminarán los duplicados.",
    mergeSuccess: "Proyectos fusionados con éxito",
    mergeError: "Error al fusionar",
    bulkEdit: "Edición masiva",
    bulkEditTitle: "Editar {count} proyecto(s)",
    bulkCategory: "Categoría",
    bulkLocation: "Ciudad",
    bulkYear: "Año",
    bulkClient: "Cliente",
    bulkDuration: "Duración",
    bulkNoChange: "— Sin cambios —",
    bulkApply: "Aplicar",
    bulkApplying: "Aplicando...",
    bulkEditSuccess: "Proyectos actualizados con éxito",
    bulkEditError: "Error al actualizar",
    cancel: "Cancelar",
    quickEdit: "Edición rápida",
    previewImages: "Vista previa",
    avant: "Antes",
    apres: "Después",
    noImages: "Sin imágenes",
    titleLabel: "Título",
  },
  ar: {
    title: "معرض الأعمال",
    subtitle: "إدارة مشاريعك",
    newProject: "مشروع جديد",
    manageCategories: "إدارة الفئات",
    search: "البحث عن مشروع...",
    all: "الكل",
    allStatus: "كل الحالات",
    activeOnly: "النشطة فقط",
    inactiveOnly: "غير النشطة فقط",
    gridView: "عرض شبكي",
    listView: "عرض قائمة",
    featured: "مميز",
    pinned: "مثبت",
    active: "نشط",
    inactive: "غير نشط",
    hidden: "مخفي",
    edit: "تعديل",
    delete: "حذف",
    view: "عرض",
    show: "إظهار",
    hide: "إخفاء",
    pin: "تثبيت",
    unpin: "إلغاء التثبيت",
    confirmDelete: "هل أنت متأكد من حذف هذا المشروع؟",
    confirmBulkDelete: "هل أنت متأكد من حذف {count} مشروع(ات)؟",
    noProjects: "لا توجد مشاريع",
    createFirst: "أنشئ أول مشروع لك",
    loading: "جاري التحميل...",
    projectCount: "{count} مشروع(ات)",
    selected: "{count} محدد",
    deleteSelected: "حذف المحدد",
    clearSelection: "إلغاء التحديد",
    selectAll: "تحديد الكل",
    mergeSelected: "دمج الصور",
    confirmMerge: "دمج {count} مشروع(ات)؟ سيتم الاحتفاظ بالمشروع ذو الوصف الأطول، وستُجمع الصور، وتُحذف التكرارات.",
    mergeSuccess: "تم دمج المشاريع بنجاح",
    mergeError: "فشل في الدمج",
    bulkEdit: "تعديل جماعي",
    bulkEditTitle: "تعديل {count} مشروع(ات)",
    bulkCategory: "الفئة",
    bulkLocation: "المدينة",
    bulkYear: "السنة",
    bulkClient: "العميل",
    bulkDuration: "المدة",
    bulkNoChange: "— بدون تغيير —",
    bulkApply: "تطبيق",
    bulkApplying: "جاري التطبيق...",
    bulkEditSuccess: "تم تحديث المشاريع بنجاح",
    bulkEditError: "فشل في تحديث المشاريع",
    cancel: "إلغاء",
    quickEdit: "تعديل سريع",
    previewImages: "معاينة الصور",
    avant: "قبل",
    apres: "بعد",
    noImages: "لا توجد صور",
    titleLabel: "العنوان",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface PortfolioCategory {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string | null;
  icon: string | null;
  _count?: { projects: number };
}

interface PortfolioProject {
  id: string;
  titleFr: string;
  titleEn: string | null;
  slug: string;
  coverImage: string;
  location: string | null;
  year: number | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  beforeImages: string[];
  afterImages: string[];
  category: PortfolioCategory;
}

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "active" | "inactive";

interface PageProps {
  params: { locale: string };
}

// ═══════════════════════════════════════════════════════════
// Portfolio Manager Page
// ═══════════════════════════════════════════════════════════

export default function PortfolioManagerPage({ params }: PageProps) {
  const locale = params.locale as string;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [merging, setMerging] = useState(false);

  // Bulk edit state
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkApplying, setBulkApplying] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    categoryId: "",
    location: "",
    year: "",
    client: "",
    duration: "",
  });

  // Image preview & quick edit state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickEditForm, setQuickEditForm] = useState({
    titleFr: "",
    location: "",
    year: "",
    categoryId: "",
  });

  // Load data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, categoriesRes] = await Promise.all([
        fetch("/api/cms/portfolio?admin=true"),
        fetch("/api/cms/portfolio-categories"),
      ]);

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        // Normalize order to sequential 0,1,2... so positions are unique
        const sorted = (data.projects || []) as PortfolioProject[];
        const normalized = sorted.map((p, i) => ({ ...p, order: i }));
        setProjects(normalized);

        // If any orders were out of sync, persist the normalized values
        const needsSync = sorted.some((p, i) => p.order !== i);
        if (needsSync) {
          Promise.allSettled(
            normalized.map((p) =>
              fetch(`/api/cms/portfolio/${p.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: p.order }),
              })
            )
          );
        }
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to load portfolio data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.titleFr.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || project.category?.id === activeCategory;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && project.isActive) ||
      (statusFilter === "inactive" && !project.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Delete project
  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const res = await fetch(`/api/cms/portfolio/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(t.confirmBulkDelete.replace("{count}", String(selectedIds.size)))) return;

    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/cms/portfolio/${id}`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);
      setProjects((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Failed to bulk delete projects:", error);
    }
  };

  // Merge selected projects (combine images, keep longest description)
  const handleMerge = async () => {
    if (selectedIds.size < 2) return;
    if (!confirm(t.confirmMerge.replace("{count}", String(selectedIds.size)))) return;

    setMerging(true);
    try {
      const res = await fetch("/api/cms/portfolio/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        void fetchData();
      } else {
        const data = await res.json();
        alert(t.mergeError + ": " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Failed to merge projects:", error);
      alert(t.mergeError);
    }
    setMerging(false);
  };

  // Bulk edit selected projects
  const handleBulkEdit = async () => {
    if (selectedIds.size === 0) return;

    // Build payload with only changed fields
    const payload: Record<string, unknown> = {};
    if (bulkForm.categoryId) payload.categoryId = bulkForm.categoryId;
    if (bulkForm.location) payload.location = bulkForm.location;
    if (bulkForm.year) payload.year = parseInt(bulkForm.year, 10);
    if (bulkForm.client) payload.client = bulkForm.client;
    if (bulkForm.duration) payload.duration = bulkForm.duration;

    if (Object.keys(payload).length === 0) return;

    setBulkApplying(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/cms/portfolio/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        )
      );
      setShowBulkEdit(false);
      setBulkForm({ categoryId: "", location: "", year: "", client: "", duration: "" });
      void fetchData();
    } catch (error) {
      console.error("Bulk edit error:", error);
      alert(t.bulkEditError);
    }
    setBulkApplying(false);
  };

  // Start quick edit for a project
  const startQuickEdit = (project: PortfolioProject) => {
    setQuickEditId(project.id);
    setQuickEditForm({
      titleFr: project.titleFr,
      location: project.location || "",
      year: project.year ? String(project.year) : "",
      categoryId: project.category?.id || "",
    });
  };

  // Save quick edit
  const saveQuickEdit = async (id: string) => {
    const payload: Record<string, unknown> = {
      titleFr: quickEditForm.titleFr,
      location: quickEditForm.location || null,
      year: quickEditForm.year ? parseInt(quickEditForm.year, 10) : null,
    };
    if (quickEditForm.categoryId) payload.categoryId = quickEditForm.categoryId;

    try {
      const res = await fetch(`/api/cms/portfolio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setQuickEditId(null);
        void fetchData();
      }
    } catch (error) {
      console.error("Quick edit error:", error);
    }
  };

  // Toggle visibility (isActive)
  const toggleVisibility = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/cms/portfolio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isActive: !currentState } : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
    }
  };

  // Toggle featured
  const toggleFeatured = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/cms/portfolio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentState }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isFeatured: !currentState } : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  // Move project to a specific position (1-based input)
  const handleSetPosition = async (projectId: string, targetPos: number) => {
    const currentIndex = projects.findIndex((p) => p.id === projectId);
    if (currentIndex === -1) return;
    const newIndex = Math.max(0, Math.min(projects.length - 1, targetPos - 1));
    if (newIndex === currentIndex) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Optimistic update
    setProjects(reordered.map((p, i) => ({ ...p, order: i })));

    try {
      await Promise.all(
        reordered.map((p, i) =>
          fetch(`/api/cms/portfolio/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: i }),
          })
        )
      );
      void fetchData();
    } catch (error) {
      console.error("Failed to reorder projects:", error);
      void fetchData();
    }
  };

  // Get localized name
  const getLocalizedName = (item: { nameFr: string; nameEn?: string | null }) => {
    if (locale === "en" && item.nameEn) return item.nameEn;
    return item.nameFr;
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/admin/contenu/portfolio/categories`}>
            <Button variant="outline">
              <FolderOpen className="me-2 h-4 w-4" />
              {t.manageCategories}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/contenu/portfolio/new`}>
            <Button>
              <Plus className="me-2 h-4 w-4" />
              {t.newProject}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-lg border border-gray-300 py-2 ps-10 pe-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t.allStatus}</option>
              <option value="active">{t.activeOnly}</option>
              <option value="inactive">{t.inactiveOnly}</option>
            </select>
          </div>

          {/* Select All toggle */}
          <button
            type="button"
            onClick={() => {
              if (selectedIds.size === filteredProjects.length && filteredProjects.length > 0) {
                clearSelection();
              } else {
                selectAll();
              }
            }}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5",
              selectedIds.size === filteredProjects.length && filteredProjects.length > 0
                ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
            title={t.selectAll}
          >
            {selectedIds.size === filteredProjects.length && filteredProjects.length > 0 ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {t.selectAll}
          </button>

          {/* View Mode */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-s-lg p-2",
                viewMode === "grid"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
              title={t.gridView}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-e-lg p-2",
                viewMode === "list"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
              title={t.listView}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !activeCategory
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            )}
          >
            {t.all} ({projects.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === cat.id
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              )}
            >
              {cat.icon} {getLocalizedName(cat)} ({cat._count?.projects || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-center gap-4">
            <CheckSquare className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800 dark:text-amber-300">
              {t.selected.replace("{count}", String(selectedIds.size))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="text-gray-600"
            >
              <XCircle className="me-1 h-4 w-4" />
              {t.clearSelection}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="text-gray-600"
            >
              <CheckSquare className="me-1 h-4 w-4" />
              {t.selectAll}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkForm({ categoryId: "", location: "", year: "", client: "", duration: "" });
                setShowBulkEdit(true);
              }}
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              <Pencil className="me-1 h-4 w-4" />
              {t.bulkEdit}
            </Button>
            {selectedIds.size >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMerge}
                disabled={merging}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                {merging ? (
                  <Loader2 className="me-1 h-4 w-4 animate-spin" />
                ) : (
                  <Merge className="me-1 h-4 w-4" />
                )}
                {t.mergeSelected}
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="me-1 h-4 w-4" />
              {t.deleteSelected}
            </Button>
          </div>
        </div>
      )}

      {/* Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t.projectCount.replace("{count}", String(filteredProjects.length))}
      </p>

      {/* Projects */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">{t.noProjects}</p>
          <Link
            href={`/${locale}/admin/contenu/portfolio/new`}
            className="mt-4 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700"
          >
            <Plus className="h-4 w-4" />
            {t.createFirst}
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "group overflow-hidden rounded-xl border bg-white dark:bg-gray-800 transition-all",
                selectedIds.has(project.id)
                  ? "border-amber-500 ring-2 ring-amber-500/50"
                  : "border-gray-200 dark:border-gray-700",
                !project.isActive && "opacity-60"
              )}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.titleFr}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FolderOpen className="h-12 w-12 text-gray-300" />
                  </div>
                )}

                {/* Selection Checkbox — always visible & above overlay */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleSelect(project.id); }}
                  className={cn(
                    "absolute top-2 start-2 z-20 p-1.5 rounded-md transition-all shadow-sm",
                    selectedIds.has(project.id)
                      ? "bg-amber-500 text-white opacity-100"
                      : "bg-white/90 text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-gray-700"
                  )}
                >
                  {selectedIds.has(project.id) ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </button>

                {/* Overlay Actions */}
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    href={`/${locale}/admin/contenu/portfolio/${project.id}`}
                    className="rounded-full bg-white p-2 text-gray-900 hover:bg-gray-100"
                    title={t.edit}
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/${locale}/realisations/${project.slug}`}
                    target="_blank"
                    className="rounded-full bg-white p-2 text-gray-900 hover:bg-gray-100"
                    title={t.view}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(project.id, project.isActive)}
                    className={cn(
                      "rounded-full bg-white p-2 hover:bg-gray-100",
                      project.isActive ? "text-green-600" : "text-gray-400"
                    )}
                    title={project.isActive ? t.hide : t.show}
                  >
                    {project.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project.id)}
                    className="rounded-full bg-white p-2 text-red-600 hover:bg-red-50"
                    title={t.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Status Badges */}
                <div className="absolute top-2 end-2 z-20 flex flex-col gap-1">
                  {project.isFeatured && (
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                      {t.pinned}
                    </span>
                  )}
                  {!project.isActive && (
                    <span className="rounded-full bg-gray-500 px-2 py-0.5 text-xs font-medium text-white">
                      {t.hidden}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                {quickEditId === project.id ? (
                  /* ── Quick Edit Mode ── */
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={quickEditForm.titleFr}
                      onChange={(e) => setQuickEditForm({ ...quickEditForm, titleFr: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm font-medium focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder={t.titleLabel}
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={quickEditForm.location}
                        onChange={(e) => setQuickEditForm({ ...quickEditForm, location: e.target.value })}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder={t.bulkLocation}
                      />
                      <input
                        type="number"
                        value={quickEditForm.year}
                        onChange={(e) => setQuickEditForm({ ...quickEditForm, year: e.target.value })}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder={t.bulkYear}
                      />
                    </div>
                    <select
                      value={quickEditForm.categoryId}
                      onChange={(e) => setQuickEditForm({ ...quickEditForm, categoryId: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{t.bulkCategory}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {getLocalizedName(cat)}</option>
                      ))}
                    </select>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setQuickEditId(null)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void saveQuickEdit(project.id)}
                        className="rounded bg-amber-600 p-1 text-white hover:bg-amber-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Normal Display ── */
                  <>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                        {project.titleFr}
                      </h3>
                      <button
                        type="button"
                        onClick={() => startQuickEdit(project)}
                        className="flex-shrink-0 rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                        title={t.quickEdit}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      {project.location && (
                        <span className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </span>
                      )}
                      {project.year && (
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          {project.year}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {project.category?.icon} {project.category ? getLocalizedName(project.category) : "—"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {/* Image preview toggle */}
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                          className={cn(
                            "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                            expandedId === project.id
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          )}
                        >
                          <ImageIcon className="h-3 w-3" />
                          {(project.beforeImages?.length || 0) + (project.afterImages?.length || 0)}
                          {expandedId === project.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                        {/* Position input */}
                        <div className="flex items-center">
                          <input
                            type="number"
                            min={1}
                            max={projects.length}
                            defaultValue={projects.findIndex((p) => p.id === project.id) + 1}
                            key={`grid-pos-${project.id}-${project.order}`}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const idx = projects.findIndex((p) => p.id === project.id);
                              if (!isNaN(val) && val !== idx + 1) {
                                handleSetPosition(project.id, val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            }}
                            className={cn(
                              "w-9 h-9 text-center rounded-full text-sm font-extrabold border-2 outline-none transition-colors shadow-sm",
                              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                              project.isFeatured
                                ? "bg-amber-100 text-amber-800 border-amber-400"
                                : "bg-white text-gray-700 border-gray-300",
                              "focus:border-amber-500 focus:ring-2 focus:ring-amber-200",
                              "dark:focus:ring-amber-800"
                            )}
                            title="Position"
                          />
                        </div>
                        {/* Pin toggle */}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFeatured(project.id, project.isFeatured); }}
                          className={cn(
                            "rounded-full p-1.5 transition-colors",
                            project.isFeatured
                              ? "bg-amber-100 text-amber-500 hover:bg-amber-200"
                              : "text-gray-400 hover:bg-gray-100 hover:text-amber-500"
                          )}
                          title={project.isFeatured ? t.unpin : t.pin}
                        >
                          {project.isFeatured ? (
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ── Expanded Image Preview ── */}
              {expandedId === project.id && (
                <div className="border-t border-gray-100 px-3 pb-3 pt-2 dark:border-gray-700">
                  {(project.beforeImages?.length > 0 || project.afterImages?.length > 0) ? (
                    <div className="space-y-2">
                      {project.beforeImages?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-orange-600 mb-1">{t.avant} ({project.beforeImages.length})</p>
                          <div className="flex gap-1 overflow-x-auto pb-1">
                            {project.beforeImages.slice(0, 8).map((url, i) => (
                              <img key={i} src={url} alt="" className="h-12 w-12 flex-shrink-0 rounded object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.svg"; }} />
                            ))}
                            {project.beforeImages.length > 8 && (
                              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-500">+{project.beforeImages.length - 8}</div>
                            )}
                          </div>
                        </div>
                      )}
                      {project.afterImages?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-green-600 mb-1">{t.apres} ({project.afterImages.length})</p>
                          <div className="flex gap-1 overflow-x-auto pb-1">
                            {project.afterImages.slice(0, 8).map((url, i) => (
                              <img key={i} src={url} alt="" className="h-12 w-12 flex-shrink-0 rounded object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.svg"; }} />
                            ))}
                            {project.afterImages.length > 8 && (
                              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-500">+{project.afterImages.length - 8}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">{t.noImages}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "flex items-center gap-4 rounded-xl border bg-white p-4 dark:bg-gray-800 transition-all",
                selectedIds.has(project.id)
                  ? "border-amber-500 ring-2 ring-amber-500/50"
                  : "border-gray-200 dark:border-gray-700",
                !project.isActive && "opacity-60"
              )}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => toggleSelect(project.id)}
                className={cn(
                  "flex-shrink-0 p-1 rounded transition-all",
                  selectedIds.has(project.id)
                    ? "text-amber-500"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {selectedIds.has(project.id) ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              {/* Position input */}
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <input
                  type="number"
                  min={1}
                  max={projects.length}
                  defaultValue={projects.findIndex((p) => p.id === project.id) + 1}
                  key={`list-pos-${project.id}-${project.order}`}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const idx = projects.findIndex((p) => p.id === project.id);
                    if (!isNaN(val) && val !== idx + 1) {
                      handleSetPosition(project.id, val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  }}
                  className={cn(
                    "w-10 h-10 text-center rounded-full text-sm font-extrabold border-2 outline-none transition-colors shadow-sm",
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    project.isFeatured
                      ? "bg-amber-100 text-amber-800 border-amber-400"
                      : "bg-white text-gray-700 border-gray-300",
                    "focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800"
                  )}
                  title="Position"
                />
                <span className="text-[10px] text-gray-500 font-medium">/{projects.length}</span>
              </div>

              {/* Thumbnail */}
              <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.titleFr}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {quickEditId === project.id ? (
                  /* ── Quick Edit Mode (list) ── */
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={quickEditForm.titleFr}
                      onChange={(e) => setQuickEditForm({ ...quickEditForm, titleFr: e.target.value })}
                      className="rounded border border-gray-300 px-2 py-1 text-sm font-medium focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder={t.titleLabel}
                    />
                    <input
                      type="text"
                      value={quickEditForm.location}
                      onChange={(e) => setQuickEditForm({ ...quickEditForm, location: e.target.value })}
                      className="w-28 rounded border border-gray-300 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder={t.bulkLocation}
                    />
                    <input
                      type="number"
                      value={quickEditForm.year}
                      onChange={(e) => setQuickEditForm({ ...quickEditForm, year: e.target.value })}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder={t.bulkYear}
                    />
                    <select
                      value={quickEditForm.categoryId}
                      onChange={(e) => setQuickEditForm({ ...quickEditForm, categoryId: e.target.value })}
                      className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{t.bulkCategory}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {getLocalizedName(cat)}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setQuickEditId(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => void saveQuickEdit(project.id)} className="rounded bg-amber-600 p-1 text-white hover:bg-amber-700">
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  /* ── Normal Display (list) ── */
                  <>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {project.titleFr}
                      </h3>
                      <button
                        type="button"
                        onClick={() => startQuickEdit(project)}
                        className="rounded p-0.5 text-gray-300 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                        title={t.quickEdit}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <span>{project.category?.icon} {project.category ? getLocalizedName(project.category) : "—"}</span>
                      {project.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </span>
                      )}
                      {project.year && <span>{project.year}</span>}
                      {/* Image preview toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                        className={cn(
                          "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors",
                          expandedId === project.id
                            ? "bg-amber-100 text-amber-700"
                            : "hover:bg-gray-200"
                        )}
                      >
                        <ImageIcon className="h-3 w-3" />
                        {(project.beforeImages?.length || 0) + (project.afterImages?.length || 0)}
                        <span className="text-[10px] text-gray-400">
                          ({project.beforeImages?.length || 0}/{project.afterImages?.length || 0})
                        </span>
                        {expandedId === project.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>
                    {/* ── Expanded Image Preview (list) ── */}
                    {expandedId === project.id && (
                      <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900">
                        {(project.beforeImages?.length > 0 || project.afterImages?.length > 0) ? (
                          <div className="flex gap-4">
                            {project.beforeImages?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-orange-600 mb-1">{t.avant} ({project.beforeImages.length})</p>
                                <div className="flex gap-1 overflow-x-auto">
                                  {project.beforeImages.slice(0, 6).map((url, i) => (
                                    <img key={i} src={url} alt="" className="h-10 w-10 flex-shrink-0 rounded object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.svg"; }} />
                                  ))}
                                  {project.beforeImages.length > 6 && (
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-200 text-[10px] font-medium text-gray-500">+{project.beforeImages.length - 6}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            {project.afterImages?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-green-600 mb-1">{t.apres} ({project.afterImages.length})</p>
                                <div className="flex gap-1 overflow-x-auto">
                                  {project.afterImages.slice(0, 6).map((url, i) => (
                                    <img key={i} src={url} alt="" className="h-10 w-10 flex-shrink-0 rounded object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.svg"; }} />
                                  ))}
                                  {project.afterImages.length > 6 && (
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-200 text-[10px] font-medium text-gray-500">+{project.afterImages.length - 6}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 text-center">{t.noImages}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {project.isFeatured && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {t.pinned}
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    project.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  )}
                >
                  {project.isActive ? t.active : t.hidden}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFeatured(project.id, project.isFeatured); }}
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    project.isFeatured
                      ? "bg-amber-100 text-amber-500 hover:bg-amber-200"
                      : "text-gray-400 hover:bg-gray-100 hover:text-amber-500 dark:hover:bg-gray-700"
                  )}
                  title={project.isFeatured ? t.unpin : t.pin}
                >
                  {project.isFeatured ? (
                    <Star className="h-4 w-4 fill-amber-500" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleVisibility(project.id, project.isActive)}
                  className={cn(
                    "rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700",
                    project.isActive ? "text-green-500" : "text-gray-400"
                  )}
                  title={project.isActive ? t.hide : t.show}
                >
                  {project.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <Link
                  href={`/${locale}/admin/contenu/portfolio/${project.id}`}
                  className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                  title={t.edit}
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${locale}/realisations/${project.slug}`}
                  target="_blank"
                  className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                  title={t.view}
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(project.id)}
                  className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  title={t.delete}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Bulk Edit Modal                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showBulkEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t.bulkEditTitle.replace("{count}", String(selectedIds.size))}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t.bulkNoChange}
            </p>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.bulkCategory}
                </label>
                <select
                  value={bulkForm.categoryId}
                  onChange={(e) => setBulkForm({ ...bulkForm, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t.bulkNoChange}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {getLocalizedName(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location (City) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.bulkLocation}
                </label>
                <input
                  type="text"
                  value={bulkForm.location}
                  onChange={(e) => setBulkForm({ ...bulkForm, location: e.target.value })}
                  placeholder={t.bulkNoChange}
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.bulkYear}
                </label>
                <input
                  type="number"
                  value={bulkForm.year}
                  onChange={(e) => setBulkForm({ ...bulkForm, year: e.target.value })}
                  placeholder={t.bulkNoChange}
                  min={2000}
                  max={2030}
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.bulkClient}
                </label>
                <input
                  type="text"
                  value={bulkForm.client}
                  onChange={(e) => setBulkForm({ ...bulkForm, client: e.target.value })}
                  placeholder={t.bulkNoChange}
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.bulkDuration}
                </label>
                <input
                  type="text"
                  value={bulkForm.duration}
                  onChange={(e) => setBulkForm({ ...bulkForm, duration: e.target.value })}
                  placeholder={t.bulkNoChange}
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkEdit(false)}
                disabled={bulkApplying}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => void handleBulkEdit()}
                disabled={bulkApplying || (!bulkForm.categoryId && !bulkForm.location && !bulkForm.year && !bulkForm.client && !bulkForm.duration)}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {bulkApplying && <Loader2 className="h-4 w-4 animate-spin" />}
                {bulkApplying ? t.bulkApplying : t.bulkApply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
