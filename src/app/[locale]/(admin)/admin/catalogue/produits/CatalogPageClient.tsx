"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Wrench,
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Folder,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemCard, ItemTable } from "@/components/catalog";
import type { Category } from "@/components/catalog";
import type { CatalogItem } from "@/components/catalog";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Supplier {
  id: string;
  name: string;
  code?: string | null;
}

interface CatalogPageClientProps {
  type: "PRODUCT" | "SERVICE";
  items: CatalogItem[];
  categories: Category[];
  suppliers: Supplier[];
  locale: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filters: {
    categoryId: string;
    supplierId: string;
    search: string;
    lowStock: boolean;
  };
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  products: string;
  services: string;
  productsSubtitle: string;
  servicesSubtitle: string;
  addProduct: string;
  addService: string;
  search: string;
  searchPlaceholder: string;
  gridView: string;
  listView: string;
  filters: string;
  clearFilters: string;
  category: string;
  allCategories: string;
  supplier: string;
  allSuppliers: string;
  lowStock: string;
  noItems: string;
  noItemsDescription: string;
  showing: string;
  of: string;
  items: string;
  previous: string;
  next: string;
  confirmDelete: string;
  categories: string;
  stock: string;
  suppliers: string;
}

const translations: Record<string, Translations> = {
  fr: {
    products: "Produits",
    services: "Services",
    productsSubtitle: "Gérez votre catalogue de produits",
    servicesSubtitle: "Gérez votre catalogue de services",
    addProduct: "Nouveau produit",
    addService: "Nouveau service",
    search: "Rechercher",
    searchPlaceholder: "Rechercher par nom, SKU...",
    gridView: "Vue grille",
    listView: "Vue liste",
    filters: "Filtres",
    clearFilters: "Effacer",
    category: "Catégorie",
    allCategories: "Toutes les catégories",
    supplier: "Fournisseur",
    allSuppliers: "Tous les fournisseurs",
    lowStock: "Stock bas",
    noItems: "Aucun article",
    noItemsDescription: "Créez votre premier article pour commencer",
    showing: "Affichage",
    of: "sur",
    items: "articles",
    previous: "Précédent",
    next: "Suivant",
    confirmDelete: "Confirmer la suppression ?",
    categories: "Catégories",
    stock: "Stock",
    suppliers: "Fournisseurs",
  },
  en: {
    products: "Products",
    services: "Services",
    productsSubtitle: "Manage your product catalog",
    servicesSubtitle: "Manage your service catalog",
    addProduct: "New product",
    addService: "New service",
    search: "Search",
    searchPlaceholder: "Search by name, SKU...",
    gridView: "Grid view",
    listView: "List view",
    filters: "Filters",
    clearFilters: "Clear",
    category: "Category",
    allCategories: "All categories",
    supplier: "Supplier",
    allSuppliers: "All suppliers",
    lowStock: "Low stock",
    noItems: "No items",
    noItemsDescription: "Create your first item to get started",
    showing: "Showing",
    of: "of",
    items: "items",
    previous: "Previous",
    next: "Next",
    confirmDelete: "Confirm deletion?",
    categories: "Categories",
    stock: "Stock",
    suppliers: "Suppliers",
  },
  es: {
    products: "Productos",
    services: "Servicios",
    productsSubtitle: "Gestione su catálogo de productos",
    servicesSubtitle: "Gestione su catálogo de servicios",
    addProduct: "Nuevo producto",
    addService: "Nuevo servicio",
    search: "Buscar",
    searchPlaceholder: "Buscar por nombre, SKU...",
    gridView: "Vista cuadrícula",
    listView: "Vista lista",
    filters: "Filtros",
    clearFilters: "Limpiar",
    category: "Categoría",
    allCategories: "Todas las categorías",
    supplier: "Proveedor",
    allSuppliers: "Todos los proveedores",
    lowStock: "Stock bajo",
    noItems: "Sin artículos",
    noItemsDescription: "Cree su primer artículo para comenzar",
    showing: "Mostrando",
    of: "de",
    items: "artículos",
    previous: "Anterior",
    next: "Siguiente",
    confirmDelete: "¿Confirmar eliminación?",
    categories: "Categorías",
    stock: "Stock",
    suppliers: "Proveedores",
  },
  ar: {
    products: "المنتجات",
    services: "الخدمات",
    productsSubtitle: "إدارة كتالوج المنتجات",
    servicesSubtitle: "إدارة كتالوج الخدمات",
    addProduct: "منتج جديد",
    addService: "خدمة جديدة",
    search: "بحث",
    searchPlaceholder: "البحث بالاسم، SKU...",
    gridView: "عرض الشبكة",
    listView: "عرض القائمة",
    filters: "الفلاتر",
    clearFilters: "مسح",
    category: "الفئة",
    allCategories: "جميع الفئات",
    supplier: "المورد",
    allSuppliers: "جميع الموردين",
    lowStock: "مخزون منخفض",
    noItems: "لا عناصر",
    noItemsDescription: "أنشئ أول عنصر للبدء",
    showing: "عرض",
    of: "من",
    items: "عناصر",
    previous: "السابق",
    next: "التالي",
    confirmDelete: "تأكيد الحذف؟",
    categories: "الفئات",
    stock: "المخزون",
    suppliers: "الموردون",
  },
};

// ═══════════════════════════════════════════════════════════
// Navigation Tabs
// ═══════════════════════════════════════════════════════════

const catalogTabs = [
  { id: "produits", icon: Package, labelKey: "products" as const },
  { id: "services", icon: Wrench, labelKey: "services" as const },
  { id: "categories", icon: Folder, labelKey: "categories" as const },
  { id: "stock", icon: AlertTriangle, labelKey: "stock" as const },
  { id: "fournisseurs", icon: Truck, labelKey: "suppliers" as const },
];

// ═══════════════════════════════════════════════════════════
// Helper: Flatten categories
// ═══════════════════════════════════════════════════════════

function flattenCategories(
  categories: Category[],
  level = 0
): Array<Category & { level: number }> {
  const result: Array<Category & { level: number }> = [];
  for (const cat of categories) {
    result.push({ ...cat, level });
    if (cat.children) {
      result.push(...flattenCategories(cat.children, level + 1));
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function CatalogPageClient({
  type,
  items,
  categories,
  suppliers,
  locale,
  currentPage,
  totalPages,
  totalCount,
  filters,
}: CatalogPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const isProduct = type === "PRODUCT";
  const activeTab = isProduct ? "produits" : "services";

  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(filters.categoryId);
  const [supplierFilter, setSupplierFilter] = useState(filters.supplierId);
  const [lowStockFilter, setLowStockFilter] = useState(filters.lowStock);

  const basePath = `/${locale}/admin/catalogue/${activeTab}`;

  const updateUrl = (params: Record<string, string | boolean>) => {
    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.set("search", searchQuery);
    if (categoryFilter) searchParams.set("categoryId", categoryFilter);
    if (supplierFilter) searchParams.set("supplierId", supplierFilter);
    if (lowStockFilter) searchParams.set("lowStock", "true");

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, String(value));
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

  const handleItemClick = (item: CatalogItem) => {
    router.push(`${basePath}/${item.id}`);
  };

  const handleDelete = async (item: CatalogItem) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      await fetch(`/api/catalog/items/${item.id}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setSupplierFilter("");
    setLowStockFilter(false);
    router.push(basePath);
  };

  const hasFilters = searchQuery || categoryFilter || supplierFilter || lowStockFilter;
  const flatCategories = flattenCategories(categories);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {isProduct ? (
              <Package className="h-7 w-7 text-amber-600" />
            ) : (
              <Wrench className="h-7 w-7 text-blue-600" />
            )}
            {isProduct ? t.products : t.services}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isProduct ? t.productsSubtitle : t.servicesSubtitle}
          </p>
        </div>

        <button
          onClick={() => router.push(`${basePath}/new`)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {isProduct ? t.addProduct : t.addService}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 -mb-px">
          {catalogTabs.map(({ id, icon: Icon, labelKey }) => (
            <Link
              key={id}
              href={`/${locale}/admin/catalogue/${id}`}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === id
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {t[labelKey]}
            </Link>
          ))}
        </nav>
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
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t.category}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                updateUrl({ categoryId: e.target.value, page: "1" });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">{t.allCategories}</option>
              {flatCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {"—".repeat(cat.level)} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          {isProduct && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t.supplier}
              </label>
              <select
                value={supplierFilter}
                onChange={(e) => {
                  setSupplierFilter(e.target.value);
                  updateUrl({ supplierId: e.target.value, page: "1" });
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">{t.allSuppliers}</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.code ? `${supplier.code} - ` : ""}{supplier.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Low Stock */}
          {isProduct && (
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockFilter}
                  onChange={(e) => {
                    setLowStockFilter(e.target.checked);
                    updateUrl({ lowStock: e.target.checked, page: "1" });
                  }}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  {t.lowStock}
                </span>
              </label>
            </div>
          )}

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
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {t.noItems}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t.noItemsDescription}
          </p>
          <button
            onClick={() => router.push(`${basePath}/new`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            {isProduct ? t.addProduct : t.addService}
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              locale={locale}
              onClick={() => handleItemClick(item)}
              onEdit={() => router.push(`${basePath}/${item.id}/edit`)}
              onDelete={() => handleDelete(item)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ItemTable
            items={items}
            locale={locale}
            onItemClick={handleItemClick}
            onEdit={(item) => router.push(`${basePath}/${item.id}/edit`)}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t.showing} {(currentPage - 1) * 24 + 1}-
            {Math.min(currentPage * 24, totalCount)} {t.of} {totalCount} {t.items}
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
