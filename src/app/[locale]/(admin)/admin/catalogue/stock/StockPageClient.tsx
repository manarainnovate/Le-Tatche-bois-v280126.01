"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Wrench,
  Folder,
  AlertTriangle,
  Truck,
  Search,
  X,
  TrendingDown,
  TrendingUp,
  PackageX,
  PackageCheck,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface StockItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  stockQty: number;
  stockMin: number | null;
  stockMax: number | null;
  stockLocation: string | null;
  category: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  isLowStock: boolean;
  isOverStock: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface StockPageClientProps {
  items: StockItem[];
  categories: Category[];
  stats: {
    totalItems: number;
    lowStockItems: number;
    overStockItems: number;
    outOfStockItems: number;
  };
  locale: string;
  filters: {
    lowStock: boolean;
    categoryId: string;
    search: string;
  };
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  stock: string;
  subtitle: string;
  products: string;
  services: string;
  categories: string;
  suppliers: string;
  totalItems: string;
  lowStock: string;
  overStock: string;
  outOfStock: string;
  searchPlaceholder: string;
  category: string;
  allCategories: string;
  clearFilters: string;
  noItems: string;
  adjustStock: string;
  add: string;
  remove: string;
  quantity: string;
  save: string;
  cancel: string;
  location: string;
}

const translations: Record<string, Translations> = {
  fr: {
    stock: "Gestion des stocks",
    subtitle: "Suivez et gérez les niveaux de stock",
    products: "Produits",
    services: "Services",
    categories: "Catégories",
    suppliers: "Fournisseurs",
    totalItems: "Articles suivis",
    lowStock: "Stock bas",
    overStock: "Surstock",
    outOfStock: "En rupture",
    searchPlaceholder: "Rechercher...",
    category: "Catégorie",
    allCategories: "Toutes",
    clearFilters: "Effacer",
    noItems: "Aucun article avec suivi de stock",
    adjustStock: "Ajuster le stock",
    add: "Ajouter",
    remove: "Retirer",
    quantity: "Quantité",
    save: "Enregistrer",
    cancel: "Annuler",
    location: "Emplacement",
  },
  en: {
    stock: "Stock Management",
    subtitle: "Track and manage stock levels",
    products: "Products",
    services: "Services",
    categories: "Categories",
    suppliers: "Suppliers",
    totalItems: "Tracked items",
    lowStock: "Low stock",
    overStock: "Overstock",
    outOfStock: "Out of stock",
    searchPlaceholder: "Search...",
    category: "Category",
    allCategories: "All",
    clearFilters: "Clear",
    noItems: "No items with stock tracking",
    adjustStock: "Adjust stock",
    add: "Add",
    remove: "Remove",
    quantity: "Quantity",
    save: "Save",
    cancel: "Cancel",
    location: "Location",
  },
  es: {
    stock: "Gestión de stock",
    subtitle: "Rastree y gestione los niveles de stock",
    products: "Productos",
    services: "Servicios",
    categories: "Categorías",
    suppliers: "Proveedores",
    totalItems: "Artículos rastreados",
    lowStock: "Stock bajo",
    overStock: "Exceso de stock",
    outOfStock: "Agotado",
    searchPlaceholder: "Buscar...",
    category: "Categoría",
    allCategories: "Todas",
    clearFilters: "Limpiar",
    noItems: "Sin artículos con seguimiento de stock",
    adjustStock: "Ajustar stock",
    add: "Agregar",
    remove: "Quitar",
    quantity: "Cantidad",
    save: "Guardar",
    cancel: "Cancelar",
    location: "Ubicación",
  },
  ar: {
    stock: "إدارة المخزون",
    subtitle: "تتبع وإدارة مستويات المخزون",
    products: "المنتجات",
    services: "الخدمات",
    categories: "الفئات",
    suppliers: "الموردون",
    totalItems: "العناصر المتتبعة",
    lowStock: "مخزون منخفض",
    overStock: "فائض مخزون",
    outOfStock: "نفذ المخزون",
    searchPlaceholder: "بحث...",
    category: "الفئة",
    allCategories: "الكل",
    clearFilters: "مسح",
    noItems: "لا عناصر مع تتبع المخزون",
    adjustStock: "ضبط المخزون",
    add: "إضافة",
    remove: "إزالة",
    quantity: "الكمية",
    save: "حفظ",
    cancel: "إلغاء",
    location: "الموقع",
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
// Unit Labels
// ═══════════════════════════════════════════════════════════

const unitLabels: Record<string, string> = {
  PCS: "pcs",
  M2: "m²",
  ML: "ml",
  M3: "m³",
  KG: "kg",
  L: "L",
  H: "h",
  FORFAIT: "forfait",
  DAY: "jour",
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function StockPageClient({
  items,
  categories,
  stats,
  locale,
  filters,
}: StockPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [categoryFilter, setCategoryFilter] = useState(filters.categoryId);
  const [lowStockFilter, setLowStockFilter] = useState(filters.lowStock);

  const [adjustingItem, setAdjustingItem] = useState<StockItem | null>(null);
  const [adjustType, setAdjustType] = useState<"in" | "out">("in");
  const [adjustQty, setAdjustQty] = useState(1);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const basePath = `/${locale}/admin/catalogue/stock`;

  const updateUrl = (params: Record<string, string | boolean>) => {
    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.set("search", searchQuery);
    if (categoryFilter) searchParams.set("categoryId", categoryFilter);
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
    updateUrl({ search: searchQuery });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setLowStockFilter(false);
    router.push(basePath);
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem || adjustQty <= 0) return;

    setIsAdjusting(true);
    try {
      await fetch("/api/catalog/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: adjustingItem.id,
          type: adjustType,
          quantity: adjustQty,
        }),
      });

      setAdjustingItem(null);
      setAdjustQty(1);
      router.refresh();
    } catch (error) {
      console.error("Error adjusting stock:", error);
    } finally {
      setIsAdjusting(false);
    }
  };

  const hasFilters = searchQuery || categoryFilter || lowStockFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="h-7 w-7 text-orange-500" />
          {t.stock}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.subtitle}
        </p>
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
                id === "stock"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PackageCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalItems}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t.totalItems}
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl border p-4 cursor-pointer transition-colors",
            lowStockFilter
              ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300"
          )}
          onClick={() => {
            setLowStockFilter(!lowStockFilter);
            updateUrl({ lowStock: !lowStockFilter });
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.lowStockItems}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t.lowStock}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.overStockItems}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t.overStock}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <PackageX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.outOfStockItems}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t.outOfStock}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-xs">
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

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            updateUrl({ categoryId: e.target.value });
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">{t.allCategories}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

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

      {/* Stock Table */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t.noItems}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Article</th>
                <th className="px-4 py-3 text-left">{t.category}</th>
                <th className="px-4 py-3 text-left">{t.location}</th>
                <th className="px-4 py-3 text-right">Min</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Max</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    item.stockQty === 0 && "bg-red-50 dark:bg-red-900/10",
                    item.isLowStock && !item.stockQty && "bg-orange-50 dark:bg-orange-900/10"
                  )}
                >
                  <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {item.category?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {item.stockLocation || "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                    {item.stockMin !== null ? item.stockMin : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.isLowStock && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      <span
                        className={cn(
                          "font-bold",
                          item.stockQty === 0
                            ? "text-red-600"
                            : item.isLowStock
                            ? "text-orange-600"
                            : item.isOverStock
                            ? "text-purple-600"
                            : "text-gray-900 dark:text-white"
                        )}
                      >
                        {item.stockQty}
                      </span>
                      <span className="text-xs text-gray-500">
                        {unitLabels[item.unit]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                    {item.stockMax !== null ? item.stockMax : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          setAdjustingItem(item);
                          setAdjustType("in");
                        }}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title={t.add}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAdjustingItem(item);
                          setAdjustType("out");
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title={t.remove}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t.adjustStock}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {adjustingItem.sku} - {adjustingItem.name}
              </p>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustType("in")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors",
                    adjustType === "in"
                      ? "bg-green-50 border-green-500 text-green-600"
                      : "border-gray-300 text-gray-600 hover:border-green-300"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  {t.add}
                </button>
                <button
                  onClick={() => setAdjustType("out")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors",
                    adjustType === "out"
                      ? "bg-red-50 border-red-500 text-red-600"
                      : "border-gray-300 text-gray-600 hover:border-red-300"
                  )}
                >
                  <Minus className="h-4 w-4" />
                  {t.remove}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.quantity}
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Stock actuel: <strong>{adjustingItem.stockQty}</strong> → Nouveau:{" "}
                <strong>
                  {adjustType === "in"
                    ? adjustingItem.stockQty + adjustQty
                    : Math.max(0, adjustingItem.stockQty - adjustQty)}
                </strong>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setAdjustingItem(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={isAdjusting || adjustQty <= 0}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50"
              >
                {isAdjusting && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
