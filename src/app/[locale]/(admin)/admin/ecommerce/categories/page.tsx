"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  FolderTree,
  Edit,
  Trash2,
  ChevronRight,
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatsCard } from "@/components/admin/StatsCard";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: { id: string; name: string };
  children?: Category[];
  productCount: number;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface CategoryStats {
  total: number;
  active: number;
  featured: number;
  withProducts: number;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Categories E-Commerce",
    subtitle: "Gerez les categories de votre boutique",
    addCategory: "Ajouter une categorie",
    searchPlaceholder: "Rechercher une categorie...",
    refresh: "Actualiser",
    name: "Nom",
    slug: "Slug",
    products: "Produits",
    status: "Statut",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    noCategories: "Aucune categorie trouvee",
    totalCategories: "Total categories",
    activeCategories: "Categories actives",
    featuredCategories: "En vedette",
    withProducts: "Avec produits",
    active: "Active",
    inactive: "Inactive",
    featured: "En vedette",
    deleteConfirm: "Etes-vous sur de vouloir supprimer cette categorie?",
    root: "Racine",
    subCategories: "Sous-categories",
  },
  en: {
    title: "E-Commerce Categories",
    subtitle: "Manage your store categories",
    addCategory: "Add Category",
    searchPlaceholder: "Search category...",
    refresh: "Refresh",
    name: "Name",
    slug: "Slug",
    products: "Products",
    status: "Status",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    noCategories: "No categories found",
    totalCategories: "Total Categories",
    activeCategories: "Active Categories",
    featuredCategories: "Featured",
    withProducts: "With Products",
    active: "Active",
    inactive: "Inactive",
    featured: "Featured",
    deleteConfirm: "Are you sure you want to delete this category?",
    root: "Root",
    subCategories: "Sub-categories",
  },
  es: {
    title: "Categorias E-Commerce",
    subtitle: "Gestiona las categorias de tu tienda",
    addCategory: "Agregar Categoria",
    searchPlaceholder: "Buscar categoria...",
    refresh: "Actualizar",
    name: "Nombre",
    slug: "Slug",
    products: "Productos",
    status: "Estado",
    actions: "Acciones",
    edit: "Editar",
    delete: "Eliminar",
    noCategories: "No se encontraron categorias",
    totalCategories: "Total Categorias",
    activeCategories: "Categorias Activas",
    featuredCategories: "Destacadas",
    withProducts: "Con Productos",
    active: "Activa",
    inactive: "Inactiva",
    featured: "Destacada",
    deleteConfirm: "Esta seguro de eliminar esta categoria?",
    root: "Raiz",
    subCategories: "Sub-categorias",
  },
  ar: {
    title: "فئات المتجر الإلكتروني",
    subtitle: "إدارة فئات متجرك",
    addCategory: "إضافة فئة",
    searchPlaceholder: "البحث عن فئة...",
    refresh: "تحديث",
    name: "الاسم",
    slug: "Slug",
    products: "المنتجات",
    status: "الحالة",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    noCategories: "لا توجد فئات",
    totalCategories: "إجمالي الفئات",
    activeCategories: "الفئات النشطة",
    featuredCategories: "المميزة",
    withProducts: "مع منتجات",
    active: "نشطة",
    inactive: "غير نشطة",
    featured: "مميزة",
    deleteConfirm: "هل أنت متأكد من حذف هذه الفئة؟",
    root: "الجذر",
    subCategories: "الفئات الفرعية",
  },
};

// ═══════════════════════════════════════════════════════════
// Category Tree Item Component
// ═══════════════════════════════════════════════════════════

interface CategoryItemProps {
  category: Category;
  locale: string;
  level: number;
  t: (typeof translations)["fr"];
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

function CategoryItem({ category, locale, level, t, onDelete, onToggle }: CategoryItemProps) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="border-b border-gray-100 last:border-b-0 dark:border-gray-700">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50",
          level > 0 && "bg-gray-50/50 dark:bg-gray-800/50"
        )}
        style={{ paddingLeft: `${16 + level * 24}px` }}
      >
        {/* Drag Handle */}
        <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />

        {/* Expand Toggle */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 text-gray-500 transition-transform",
                expanded && "rotate-90"
              )}
            />
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Image */}
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FolderTree className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Name & Slug */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
            {category.isFeatured && (
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            )}
          </div>
          <span className="text-sm text-gray-500">/{category.slug}</span>
        </div>

        {/* Products Count */}
        <div className="text-center">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {category.productCount} {t.products.toLowerCase()}
          </span>
        </div>

        {/* Status */}
        <div>
          <button
            onClick={() => onToggle(category.id, !category.isActive)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
              category.isActive
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
            )}
          >
            {category.isActive ? (
              <>
                <Eye className="h-3 w-3" />
                {t.active}
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3" />
                {t.inactive}
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            href={`/${locale}/admin/ecommerce/categories/${category.id}`}
            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
            title={t.edit}
          >
            <Edit className="h-4 w-4" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category.id)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            title={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              locale={locale}
              level={level + 1}
              t={t}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string };
}

export default function EcommerceCategoriesPage({ params }: PageProps) {
  const locale = params?.locale || "fr";

  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats>({ total: 0, active: 0, featured: 0, withProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Build tree from flat list
  const buildTree = (flatCategories: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    // Create a map of all categories
    flatCategories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Build the tree
    flatCategories.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        const parent = map.get(cat.parentId)!;
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort by order
    const sortByOrder = (a: Category, b: Category) => a.order - b.order;
    roots.sort(sortByOrder);
    roots.forEach((root) => root.children?.sort(sortByOrder));

    return roots;
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("locale", locale);
      queryParams.set("flat", "true");
      if (searchQuery) queryParams.set("search", searchQuery);

      const response = await fetch(`/api/categories?${queryParams.toString()}`);
      if (response.ok) {
        const result = (await response.json()) as { success: boolean; data: Category[]; stats?: CategoryStats };
        if (result.success && result.data) {
          setCategories(buildTree(result.data));
          if (result.stats) setStats(result.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, searchQuery]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (response.ok) {
        void fetchCategories();
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  // Handle toggle active
  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (response.ok) {
        void fetchCategories();
      }
    } catch (err) {
      console.error("Failed to toggle category:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void fetchCategories()}>
            <RefreshCw className="me-2 h-4 w-4" />
            {t.refresh}
          </Button>
          <Link
            href={`/${locale}/admin/ecommerce/categories/nouveau`}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 bg-wood-primary text-white hover:bg-wood-dark h-8 px-3 text-sm rounded-md"
          >
            <Plus className="me-2 h-4 w-4" />
            {t.addCategory}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t.totalCategories}
          value={stats.total}
          icon="Package"
          variant="info"
        />
        <StatsCard
          title={t.activeCategories}
          value={stats.active}
          icon="Package"
          variant="success"
        />
        <StatsCard
          title={t.featuredCategories}
          value={stats.featured}
          icon="Package"
          variant="warning"
        />
        <StatsCard
          title={t.withProducts}
          value={stats.withProducts}
          icon="Package"
          variant="default"
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <FolderTree className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Categories Tree */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center text-sm font-medium text-gray-500">
            <span className="flex-1">{t.name}</span>
            <span className="w-24 text-center">{t.products}</span>
            <span className="w-24 text-center">{t.status}</span>
            <span className="w-24 text-center">{t.actions}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-gray-500">{t.noCategories}</div>
        ) : (
          <div>
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                locale={locale}
                level={0}
                t={t}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
