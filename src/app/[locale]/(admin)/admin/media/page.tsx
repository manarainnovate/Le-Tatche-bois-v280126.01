"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Grid3X3,
  List,
  Search,
  Trash2,
  CheckSquare,
  X,
  Loader2,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UploadZone } from "@/components/admin/UploadZone";
import { MediaGrid } from "@/components/admin/MediaGrid";
import { MediaModal } from "@/components/admin/MediaModal";
import type { MediaFile } from "@/components/admin/MediaItem";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Mediatheque",
    subtitle: "Gerez vos images et fichiers",
    search: "Rechercher par nom...",
    gridView: "Vue grille",
    listView: "Vue liste",
    selectMode: "Mode selection",
    cancelSelection: "Annuler",
    deleteSelected: "Supprimer ({count})",
    confirmDeleteSelected: "Etes-vous sur de vouloir supprimer {count} fichier(s) ?",
    selectAll: "Tout selectionner",
    deselectAll: "Tout deselectionner",
    sortBy: "Trier par",
    sortDate: "Date",
    sortName: "Nom",
    sortSize: "Taille",
    ascending: "Croissant",
    descending: "Decroissant",
    filterByDate: "Filtrer par date",
    allDates: "Toutes les dates",
    today: "Aujourd'hui",
    lastWeek: "Semaine derniere",
    lastMonth: "Mois dernier",
    loading: "Chargement...",
    noMedia: "Aucun media",
    uploadFirst: "Telechargez votre premiere image",
    filesCount: "{count} fichier(s)",
    selectedCount: "{count} selectionne(s)",
  },
  en: {
    title: "Media Library",
    subtitle: "Manage your images and files",
    search: "Search by name...",
    gridView: "Grid View",
    listView: "List View",
    selectMode: "Select Mode",
    cancelSelection: "Cancel",
    deleteSelected: "Delete ({count})",
    confirmDeleteSelected: "Are you sure you want to delete {count} file(s)?",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    sortBy: "Sort by",
    sortDate: "Date",
    sortName: "Name",
    sortSize: "Size",
    ascending: "Ascending",
    descending: "Descending",
    filterByDate: "Filter by date",
    allDates: "All dates",
    today: "Today",
    lastWeek: "Last week",
    lastMonth: "Last month",
    loading: "Loading...",
    noMedia: "No media",
    uploadFirst: "Upload your first image",
    filesCount: "{count} file(s)",
    selectedCount: "{count} selected",
  },
  es: {
    title: "Mediateca",
    subtitle: "Gestiona tus imagenes y archivos",
    search: "Buscar por nombre...",
    gridView: "Vista de cuadricula",
    listView: "Vista de lista",
    selectMode: "Modo seleccion",
    cancelSelection: "Cancelar",
    deleteSelected: "Eliminar ({count})",
    confirmDeleteSelected: "Esta seguro de eliminar {count} archivo(s)?",
    selectAll: "Seleccionar todo",
    deselectAll: "Deseleccionar todo",
    sortBy: "Ordenar por",
    sortDate: "Fecha",
    sortName: "Nombre",
    sortSize: "Tamano",
    ascending: "Ascendente",
    descending: "Descendente",
    filterByDate: "Filtrar por fecha",
    allDates: "Todas las fechas",
    today: "Hoy",
    lastWeek: "Semana pasada",
    lastMonth: "Mes pasado",
    loading: "Cargando...",
    noMedia: "Sin medios",
    uploadFirst: "Sube tu primera imagen",
    filesCount: "{count} archivo(s)",
    selectedCount: "{count} seleccionado(s)",
  },
  ar: {
    title: "مكتبة الوسائط",
    subtitle: "إدارة الصور والملفات",
    search: "البحث بالاسم...",
    gridView: "عرض شبكي",
    listView: "عرض قائمة",
    selectMode: "وضع التحديد",
    cancelSelection: "إلغاء",
    deleteSelected: "حذف ({count})",
    confirmDeleteSelected: "هل أنت متأكد من حذف {count} ملف(ات)؟",
    selectAll: "تحديد الكل",
    deselectAll: "إلغاء تحديد الكل",
    sortBy: "ترتيب حسب",
    sortDate: "التاريخ",
    sortName: "الاسم",
    sortSize: "الحجم",
    ascending: "تصاعدي",
    descending: "تنازلي",
    filterByDate: "تصفية حسب التاريخ",
    allDates: "جميع التواريخ",
    today: "اليوم",
    lastWeek: "الأسبوع الماضي",
    lastMonth: "الشهر الماضي",
    loading: "جاري التحميل...",
    noMedia: "لا توجد وسائط",
    uploadFirst: "ارفع أول صورة",
    filesCount: "{count} ملف(ات)",
    selectedCount: "{count} محدد",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type ViewMode = "grid" | "list";
type SortField = "date" | "name" | "size";
type SortOrder = "asc" | "desc";
type DateFilter = "all" | "today" | "week" | "month";

interface PageProps {
  params: { locale: string };
}

// ═══════════════════════════════════════════════════════════
// Mock Data (replace with API)
// ═══════════════════════════════════════════════════════════

const mockFiles: MediaFile[] = [
  {
    id: "1",
    url: "/images/hero-bg.jpg",
    filename: "hero-background.jpg",
    alt: "Hero background",
    width: 1920,
    height: 1080,
    size: 245000,
    mimeType: "image/jpeg",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    url: "/images/about-workshop.jpg",
    filename: "workshop-interior.jpg",
    alt: "Workshop interior",
    width: 1200,
    height: 800,
    size: 180000,
    mimeType: "image/jpeg",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    url: "/images/product-table.jpg",
    filename: "wooden-table.jpg",
    alt: "Wooden table",
    width: 800,
    height: 600,
    size: 95000,
    mimeType: "image/jpeg",
    createdAt: new Date("2024-01-05"),
  },
];

// ═══════════════════════════════════════════════════════════
// Media Library Page
// ═══════════════════════════════════════════════════════════

export default function MediaPage({ params }: PageProps) {
  const { locale } = params;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  // State
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);

  // Load files
  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFiles(mockFiles);
      setLoading(false);
    };
    void loadFiles();
  }, []);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter((f) =>
        f.filename.toLowerCase().includes(query) ||
        f.alt.toLowerCase().includes(query)
      );
    }

    // Date filter
    const now = new Date();
    switch (dateFilter) {
      case "today":
        result = result.filter(
          (f) => f.createdAt.toDateString() === now.toDateString()
        );
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter((f) => f.createdAt >= weekAgo);
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter((f) => f.createdAt >= monthAgo);
        break;
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "name":
          comparison = a.filename.localeCompare(b.filename);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [files, search, dateFilter, sortField, sortOrder]);

  // Handle upload
  const handleUpload = (uploadedFiles: File[]) => {
    const newFiles: MediaFile[] = uploadedFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      filename: file.name,
      alt: "",
      width: 800,
      height: 600,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date(),
    }));

    setFiles((prev) => [...newFiles, ...prev]);
    return Promise.resolve();
  };

  // Handle select
  const handleSelect = (id: string) => {
    if (!selectMode) {
      setSelectMode(true);
      setSelectedIds([id]);
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map((f) => f.id));
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (confirm(t.confirmDeleteSelected.replace("{count}", String(selectedIds.length)))) {
      setFiles((prev) => prev.filter((f) => !selectedIds.includes(f.id)));
      setSelectedIds([]);
      setSelectMode(false);
    }
  };

  // Handle cancel selection
  const handleCancelSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  // Handle edit file
  const handleEdit = (file: MediaFile) => {
    setEditingFile(file);
  };

  // Handle save file
  const handleSaveFile = (file: MediaFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? file : f))
    );
    setEditingFile(null);
    return Promise.resolve();
  };

  // Handle copy URL
  const handleCopyUrl = (_url: string) => {
    // Toast notification would go here
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

        {/* Selection Mode Actions */}
        {selectMode && selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {t.selectedCount.replace("{count}", String(selectedIds.length))}
            </span>
            <Button variant="outline" onClick={handleCancelSelection}>
              <X className="me-2 h-4 w-4" />
              {t.cancelSelection}
            </Button>
            <Button
              variant="outline"
              onClick={handleBulkDelete}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="me-2 h-4 w-4" />
              {t.deleteSelected.replace("{count}", String(selectedIds.length))}
            </Button>
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <UploadZone
        onUpload={handleUpload}
        maxSizeMB={5}
        locale={locale}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t.allDates}</option>
            <option value="today">{t.today}</option>
            <option value="week">{t.lastWeek}</option>
            <option value="month">{t.lastMonth}</option>
          </select>

          {/* Sort */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="date">{t.sortDate}</option>
            <option value="name">{t.sortName}</option>
            <option value="size">{t.sortSize}</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            title={sortOrder === "asc" ? t.ascending : t.descending}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Select Mode */}
          <button
            type="button"
            onClick={() => {
              if (selectMode) {
                handleCancelSelection();
              } else {
                setSelectMode(true);
              }
            }}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              selectMode
                ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
          >
            <CheckSquare className="h-4 w-4" />
            {t.selectMode}
          </button>

          {/* Select All */}
          {selectMode && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              {selectedIds.length === filteredFiles.length ? t.deselectAll : t.selectAll}
            </button>
          )}

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
      </div>

      {/* Files Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t.filesCount.replace("{count}", String(filteredFiles.length))}
      </p>

      {/* Media Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <MediaGrid
          files={filteredFiles}
          selectedIds={selectMode ? selectedIds : []}
          onSelect={selectMode ? handleSelect : undefined}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCopyUrl={handleCopyUrl}
          viewMode={viewMode}
          isSearching={!!search}
          locale={locale}
        />
      )}

      {/* Edit Modal */}
      {editingFile && (
        <MediaModal
          file={editingFile}
          onClose={() => setEditingFile(null)}
          onSave={handleSaveFile}
          onDelete={handleDelete}
          locale={locale}
        />
      )}
    </div>
  );
}
