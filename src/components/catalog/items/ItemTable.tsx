"use client";

import { useState } from "react";
import {
  Package,
  Wrench,
  AlertTriangle,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogItem } from "./ItemCard";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ItemTableProps {
  items: CatalogItem[];
  locale: string;
  onItemClick?: (item: CatalogItem) => void;
  onEdit?: (item: CatalogItem) => void;
  onDelete?: (item: CatalogItem) => void;
  selectedIds?: string[];
  onSelectChange?: (ids: string[]) => void;
}

type SortField = "sku" | "name" | "category" | "sellingPriceHT" | "stockQty";
type SortDirection = "asc" | "desc";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  sku: string;
  name: string;
  category: string;
  priceHT: string;
  stock: string;
  actions: string;
  noItems: string;
  product: string;
  service: string;
}

const translations: Record<string, Translations> = {
  fr: {
    sku: "SKU",
    name: "Désignation",
    category: "Catégorie",
    priceHT: "Prix HT",
    stock: "Stock",
    actions: "Actions",
    noItems: "Aucun article",
    product: "Produit",
    service: "Service",
  },
  en: {
    sku: "SKU",
    name: "Name",
    category: "Category",
    priceHT: "Price excl.",
    stock: "Stock",
    actions: "Actions",
    noItems: "No items",
    product: "Product",
    service: "Service",
  },
  es: {
    sku: "SKU",
    name: "Nombre",
    category: "Categoría",
    priceHT: "Precio sin IVA",
    stock: "Stock",
    actions: "Acciones",
    noItems: "Sin artículos",
    product: "Producto",
    service: "Servicio",
  },
  ar: {
    sku: "SKU",
    name: "الاسم",
    category: "الفئة",
    priceHT: "السعر بدون ضريبة",
    stock: "المخزون",
    actions: "الإجراءات",
    noItems: "لا عناصر",
    product: "منتج",
    service: "خدمة",
  },
};

// ═══════════════════════════════════════════════════════════
// Unit Labels
// ═══════════════════════════════════════════════════════════

const unitLabels: Record<string, Record<string, string>> = {
  fr: { PCS: "pcs", M2: "m²", ML: "ml", M3: "m³", KG: "kg", L: "L", H: "h", FORFAIT: "forfait", DAY: "jour" },
  en: { PCS: "pcs", M2: "m²", ML: "lm", M3: "m³", KG: "kg", L: "L", H: "h", FORFAIT: "flat", DAY: "day" },
  es: { PCS: "pzs", M2: "m²", ML: "ml", M3: "m³", KG: "kg", L: "L", H: "h", FORFAIT: "tarifa", DAY: "día" },
  ar: { PCS: "قطعة", M2: "م²", ML: "م.ط", M3: "م³", KG: "كغ", L: "ل", H: "س", FORFAIT: "جزافي", DAY: "يوم" },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ItemTable({
  items,
  locale,
  onItemClick,
  onEdit,
  onDelete,
  selectedIds = [],
  onSelectChange,
}: ItemTableProps) {
  const t = translations[locale] || translations.fr;
  const units = unitLabels[locale] || unitLabels.fr;

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "sku":
        comparison = a.sku.localeCompare(b.sku);
        break;
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "category":
        comparison = (a.category?.name || "").localeCompare(b.category?.name || "");
        break;
      case "sellingPriceHT":
        comparison = a.sellingPriceHT - b.sellingPriceHT;
        break;
      case "stockQty":
        comparison = a.stockQty - b.stockQty;
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const toggleSelectAll = () => {
    if (onSelectChange) {
      if (selectedIds.length === items.length) {
        onSelectChange([]);
      } else {
        onSelectChange(items.map((i) => i.id));
      }
    }
  };

  const toggleSelect = (id: string) => {
    if (onSelectChange) {
      if (selectedIds.includes(id)) {
        onSelectChange(selectedIds.filter((i) => i !== id));
      } else {
        onSelectChange([...selectedIds, id]);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Package className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p>{t.noItems}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
          <tr>
            {onSelectChange && (
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
              </th>
            )}
            <th
              className="px-4 py-3 text-left cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("sku")}
            >
              <span className="flex items-center gap-1">
                {t.sku}
                <SortIcon field="sku" />
              </span>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("name")}
            >
              <span className="flex items-center gap-1">
                {t.name}
                <SortIcon field="name" />
              </span>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("category")}
            >
              <span className="flex items-center gap-1">
                {t.category}
                <SortIcon field="category" />
              </span>
            </th>
            <th
              className="px-4 py-3 text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("sellingPriceHT")}
            >
              <span className="flex items-center justify-end gap-1">
                {t.priceHT}
                <SortIcon field="sellingPriceHT" />
              </span>
            </th>
            <th
              className="px-4 py-3 text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("stockQty")}
            >
              <span className="flex items-center justify-end gap-1">
                {t.stock}
                <SortIcon field="stockQty" />
              </span>
            </th>
            <th className="px-4 py-3 text-right">{t.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedItems.map((item) => {
            const isOutOfStock = item.trackStock && item.stockQty <= 0;

            return (
              <tr
                key={item.id}
                className={cn(
                  "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                  !item.isActive && "opacity-60",
                  onItemClick && "cursor-pointer"
                )}
                onClick={() => onItemClick?.(item)}
              >
                {onSelectChange && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {item.type === "PRODUCT" ? (
                      <Package className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Wrench className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {item.sku}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {item.category?.name || "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.sellingPriceHT)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    / {units[item.unit]}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {item.trackStock ? (
                    <div className="flex items-center justify-end gap-2">
                      {item.isLowStock && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          isOutOfStock
                            ? "text-red-600 dark:text-red-400"
                            : item.isLowStock
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-900 dark:text-white"
                        )}
                      >
                        {item.stockQty}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {units[item.unit]}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onItemClick && (
                      <button
                        onClick={() => onItemClick(item)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ItemTable;
