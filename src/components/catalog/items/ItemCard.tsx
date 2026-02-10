"use client";

import {
  Package,
  Wrench,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface CatalogItem {
  id: string;
  sku: string;
  type: string;
  name: string;
  description?: string | null;
  unit: string;
  purchasePrice?: number | null;
  sellingPriceHT: number;
  tvaRate: number;
  sellingPriceTTC?: number;
  maxDiscount?: number | null;
  trackStock: boolean;
  stockQty: number;
  stockMin?: number | null;
  stockMax?: number | null;
  stockLocation?: string | null;
  images?: string[];
  isActive: boolean;
  isLowStock?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  supplier?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
}

interface ItemCardProps {
  item: CatalogItem;
  locale: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  product: string;
  service: string;
  ht: string;
  ttc: string;
  stock: string;
  lowStock: string;
  outOfStock: string;
  view: string;
  edit: string;
  delete: string;
  copy: string;
  inactive: string;
}

const translations: Record<string, Translations> = {
  fr: {
    product: "Produit",
    service: "Service",
    ht: "HT",
    ttc: "TTC",
    stock: "Stock",
    lowStock: "Stock bas",
    outOfStock: "Rupture",
    view: "Voir",
    edit: "Modifier",
    delete: "Supprimer",
    copy: "Copier SKU",
    inactive: "Inactif",
  },
  en: {
    product: "Product",
    service: "Service",
    ht: "excl. VAT",
    ttc: "incl. VAT",
    stock: "Stock",
    lowStock: "Low stock",
    outOfStock: "Out of stock",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    copy: "Copy SKU",
    inactive: "Inactive",
  },
  es: {
    product: "Producto",
    service: "Servicio",
    ht: "sin IVA",
    ttc: "con IVA",
    stock: "Stock",
    lowStock: "Stock bajo",
    outOfStock: "Agotado",
    view: "Ver",
    edit: "Editar",
    delete: "Eliminar",
    copy: "Copiar SKU",
    inactive: "Inactivo",
  },
  ar: {
    product: "منتج",
    service: "خدمة",
    ht: "بدون ضريبة",
    ttc: "شامل الضريبة",
    stock: "المخزون",
    lowStock: "مخزون منخفض",
    outOfStock: "نفذ المخزون",
    view: "عرض",
    edit: "تعديل",
    delete: "حذف",
    copy: "نسخ SKU",
    inactive: "غير نشط",
  },
};

// ═══════════════════════════════════════════════════════════
// Unit Labels
// ═══════════════════════════════════════════════════════════

const unitLabels: Record<string, Record<string, string>> = {
  fr: {
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
  en: {
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
  es: {
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
  ar: {
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
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ItemCard({
  item,
  locale,
  onClick,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
}: ItemCardProps) {
  const t = translations[locale] || translations.fr;
  const units = unitLabels[locale] || unitLabels.fr;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isOutOfStock = item.trackStock && item.stockQty <= 0;
  const priceTTC = item.sellingPriceTTC || item.sellingPriceHT * (1 + item.tvaRate / 100);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all cursor-pointer group",
        "hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600",
        !item.isActive && "opacity-60"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {item.type === "PRODUCT" ? (
            <Package className="h-4 w-4 text-amber-500 flex-shrink-0" />
          ) : (
            <Wrench className="h-4 w-4 text-blue-500 flex-shrink-0" />
          )}
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {item.sku}
          </span>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1">
          {!item.isActive && (
            <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
              {t.inactive}
            </span>
          )}
          {item.isLowStock && (
            <span className="px-1.5 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {t.lowStock}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
              {t.outOfStock}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {item.name}
      </h4>

      {!compact && (
        <>
          {/* Category */}
          {item.category && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {item.category.name}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(item.sellingPriceHT)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t.ht} / {units[item.unit]}
            </span>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(priceTTC)} {t.ttc}
          </div>

          {/* Stock */}
          {item.trackStock && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t.stock}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isOutOfStock
                    ? "text-red-600 dark:text-red-400"
                    : item.isLowStock
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-gray-900 dark:text-white"
                )}
              >
                {item.stockQty} {units[item.unit]}
              </span>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      {showActions && (onEdit || onDelete) && (
        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ItemCard;
