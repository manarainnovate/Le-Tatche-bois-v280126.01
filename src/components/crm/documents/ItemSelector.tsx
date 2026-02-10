"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Package,
  Wrench,
  Plus,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface CatalogItem {
  id: string;
  sku: string;
  type: string;
  name: string;
  description?: string | null;
  unit: string;
  sellingPriceHT: number;
  tvaRate: number;
  category?: {
    id: string;
    name: string;
  } | null;
}

interface SelectedItem {
  catalogItemId: string;
  reference: string;
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent?: number;
  tvaRate: number;
}

interface ItemSelectorProps {
  locale: string;
  onSelect: (item: SelectedItem) => void;
  onClose: () => void;
  excludeIds?: string[];
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  title: string;
  searchPlaceholder: string;
  products: string;
  services: string;
  all: string;
  noResults: string;
  searching: string;
  select: string;
  add: string;
  cancel: string;
  ht: string;
  unit: string;
  units: Record<string, string>;
}

const translations: Record<string, Translations> = {
  fr: {
    title: "Ajouter un article",
    searchPlaceholder: "Rechercher par nom ou SKU...",
    products: "Produits",
    services: "Services",
    all: "Tous",
    noResults: "Aucun résultat",
    searching: "Recherche...",
    select: "Sélectionner",
    add: "Ajouter",
    cancel: "Annuler",
    ht: "HT",
    unit: "Unité",
    units: {
      PCS: "pcs",
      M2: "m²",
      ML: "ml",
      M3: "m³",
      KG: "kg",
      L: "L",
      H: "h",
      FORFAIT: "forfait",
      DAY: "jour",
    },
  },
  en: {
    title: "Add item",
    searchPlaceholder: "Search by name or SKU...",
    products: "Products",
    services: "Services",
    all: "All",
    noResults: "No results",
    searching: "Searching...",
    select: "Select",
    add: "Add",
    cancel: "Cancel",
    ht: "excl. VAT",
    unit: "Unit",
    units: {
      PCS: "pcs",
      M2: "m²",
      ML: "lm",
      M3: "m³",
      KG: "kg",
      L: "L",
      H: "h",
      FORFAIT: "flat",
      DAY: "day",
    },
  },
  es: {
    title: "Añadir artículo",
    searchPlaceholder: "Buscar por nombre o SKU...",
    products: "Productos",
    services: "Servicios",
    all: "Todos",
    noResults: "Sin resultados",
    searching: "Buscando...",
    select: "Seleccionar",
    add: "Añadir",
    cancel: "Cancelar",
    ht: "sin IVA",
    unit: "Unidad",
    units: {
      PCS: "pzs",
      M2: "m²",
      ML: "ml",
      M3: "m³",
      KG: "kg",
      L: "L",
      H: "h",
      FORFAIT: "tarifa",
      DAY: "día",
    },
  },
  ar: {
    title: "إضافة عنصر",
    searchPlaceholder: "البحث بالاسم أو SKU...",
    products: "المنتجات",
    services: "الخدمات",
    all: "الكل",
    noResults: "لا نتائج",
    searching: "جارٍ البحث...",
    select: "تحديد",
    add: "إضافة",
    cancel: "إلغاء",
    ht: "بدون ضريبة",
    unit: "الوحدة",
    units: {
      PCS: "قطعة",
      M2: "م²",
      ML: "م.ط",
      M3: "م³",
      KG: "كغ",
      L: "ل",
      H: "س",
      FORFAIT: "جزافي",
      DAY: "يوم",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ItemSelector({
  locale,
  onSelect,
  onClose,
  excludeIds = [],
}: ItemSelectorProps) {
  const t = translations[locale] || translations.fr;

  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | "PRODUCT" | "SERVICE">("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      params.set("active", "true");
      params.set("limit", "50");

      const response = await fetch(`/api/catalog/items?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        // Filter out excluded items
        const filtered = data.data.items.filter(
          (item: CatalogItem) => !excludeIds.includes(item.id)
        );
        setItems(filtered);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }, [search, type, excludeIds]);

  useEffect(() => {
    const timer = setTimeout(fetchItems, 300);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleSelect = () => {
    if (!selectedItem) return;

    onSelect({
      catalogItemId: selectedItem.id,
      reference: selectedItem.sku,
      designation: selectedItem.name,
      description: selectedItem.description || undefined,
      quantity,
      unit: selectedItem.unit,
      unitPriceHT: selectedItem.sellingPriceHT,
      tvaRate: selectedItem.tvaRate,
    });

    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              autoFocus
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setType("")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                !type
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {t.all}
            </button>
            <button
              onClick={() => setType("PRODUCT")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1",
                type === "PRODUCT"
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <Package className="h-4 w-4" />
              {t.products}
            </button>
            <button
              onClick={() => setType("SERVICE")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1",
                type === "SERVICE"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <Wrench className="h-4 w-4" />
              {t.services}
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              {t.searching}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t.noResults}</div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setQuantity(1);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                    selectedItem?.id === item.id
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      item.type === "PRODUCT"
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    )}
                  >
                    {item.type === "PRODUCT" ? (
                      <Package
                        className={cn(
                          "h-5 w-5",
                          "text-amber-600 dark:text-amber-400"
                        )}
                      />
                    ) : (
                      <Wrench
                        className={cn(
                          "h-5 w-5",
                          "text-blue-600 dark:text-blue-400"
                        )}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {item.sku}
                      </span>
                      {item.category && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          • {item.category.name}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-amber-600 dark:text-amber-400">
                      {formatCurrency(item.sellingPriceHT)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t.ht} / {t.units[item.unit]}
                    </div>
                  </div>

                  {/* Selected Check */}
                  {selectedItem?.id === item.id && (
                    <Check className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity & Actions */}
        {selectedItem && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t.unit}: {t.units[selectedItem.unit]}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(0.001, parseFloat(e.target.value) || 0))
                  }
                  step="0.001"
                  min="0.001"
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Total {t.ht}
                </div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(selectedItem.sellingPriceHT * quantity)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedItem}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t.add}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemSelector;
