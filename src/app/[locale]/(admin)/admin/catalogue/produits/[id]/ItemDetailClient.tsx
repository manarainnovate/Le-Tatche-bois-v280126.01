"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Wrench,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Tag,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Box,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  previousQty: number;
  newQty: number;
  unitCost: number | null;
  reason: string | null;
  reference: string | null;
  createdAt: Date;
}

interface PriceHistory {
  id: string;
  oldPrice: number;
  newPrice: number;
  changedAt: Date;
}

interface Item {
  id: string;
  sku: string;
  type: string;
  name: string;
  description: string | null;
  unit: string;
  purchasePrice: number | null;
  sellingPriceHT: number;
  tvaRate: number;
  sellingPriceTTC: number;
  maxDiscount: number | null;
  trackStock: boolean;
  stockQty: number;
  stockMin: number | null;
  stockMax: number | null;
  stockLocation: string | null;
  images: string[];
  isActive: boolean;
  isLowStock: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  supplier: {
    id: string;
    name: string;
    code: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  stockMovements: StockMovement[];
  priceHistory: PriceHistory[];
  _count: {
    documentItems: number;
  };
}

interface ItemDetailClientProps {
  item: Item;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  back: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  cannotDelete: string;
  product: string;
  service: string;
  active: string;
  inactive: string;
  lowStock: string;
  outOfStock: string;
  details: string;
  pricing: string;
  stock: string;
  stockMovements: string;
  priceHistory: string;
  supplier: string;
  category: string;
  sku: string;
  unit: string;
  purchasePrice: string;
  sellingPriceHT: string;
  sellingPriceTTC: string;
  tvaRate: string;
  maxDiscount: string;
  margin: string;
  stockQty: string;
  stockMin: string;
  stockMax: string;
  stockLocation: string;
  usedInDocuments: string;
  noMovements: string;
  noPriceChanges: string;
  copiedSku: string;
  images: string;
  noImages: string;
  date: string;
  type: string;
  quantity: string;
  before: string;
  after: string;
  reason: string;
  oldPrice: string;
  newPrice: string;
  change: string;
  movementTypes: Record<string, string>;
  units: Record<string, string>;
}

const translations: Record<string, Translations> = {
  fr: {
    back: "Retour",
    edit: "Modifier",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet article ?",
    cannotDelete: "Cet article est utilisé dans des documents et ne peut pas être supprimé.",
    product: "Produit",
    service: "Service",
    active: "Actif",
    inactive: "Inactif",
    lowStock: "Stock bas",
    outOfStock: "Rupture",
    details: "Détails",
    pricing: "Tarification",
    stock: "Stock",
    stockMovements: "Mouvements de stock",
    priceHistory: "Historique des prix",
    supplier: "Fournisseur",
    category: "Catégorie",
    sku: "Référence",
    unit: "Unité",
    purchasePrice: "Prix d'achat HT",
    sellingPriceHT: "Prix de vente HT",
    sellingPriceTTC: "Prix TTC",
    tvaRate: "Taux TVA",
    maxDiscount: "Remise max",
    margin: "Marge",
    stockQty: "Quantité en stock",
    stockMin: "Seuil d'alerte",
    stockMax: "Stock maximum",
    stockLocation: "Emplacement",
    usedInDocuments: "Utilisé dans {{count}} document(s)",
    noMovements: "Aucun mouvement de stock",
    noPriceChanges: "Aucun changement de prix",
    copiedSku: "Référence copiée !",
    images: "Images",
    noImages: "Aucune image",
    date: "Date",
    type: "Type",
    quantity: "Quantité",
    before: "Avant",
    after: "Après",
    reason: "Raison",
    oldPrice: "Ancien prix",
    newPrice: "Nouveau prix",
    change: "Variation",
    movementTypes: {
      IN: "Entrée",
      OUT: "Sortie",
      ADJUSTMENT: "Ajustement",
      TRANSFER: "Transfert",
      RETURN: "Retour",
      INVENTORY: "Inventaire",
    },
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
    back: "Back",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this item?",
    cannotDelete: "This item is used in documents and cannot be deleted.",
    product: "Product",
    service: "Service",
    active: "Active",
    inactive: "Inactive",
    lowStock: "Low stock",
    outOfStock: "Out of stock",
    details: "Details",
    pricing: "Pricing",
    stock: "Stock",
    stockMovements: "Stock movements",
    priceHistory: "Price history",
    supplier: "Supplier",
    category: "Category",
    sku: "SKU",
    unit: "Unit",
    purchasePrice: "Purchase price",
    sellingPriceHT: "Selling price excl. VAT",
    sellingPriceTTC: "Price incl. VAT",
    tvaRate: "VAT rate",
    maxDiscount: "Max discount",
    margin: "Margin",
    stockQty: "Stock quantity",
    stockMin: "Alert threshold",
    stockMax: "Maximum stock",
    stockLocation: "Location",
    usedInDocuments: "Used in {{count}} document(s)",
    noMovements: "No stock movements",
    noPriceChanges: "No price changes",
    copiedSku: "SKU copied!",
    images: "Images",
    noImages: "No images",
    date: "Date",
    type: "Type",
    quantity: "Quantity",
    before: "Before",
    after: "After",
    reason: "Reason",
    oldPrice: "Old price",
    newPrice: "New price",
    change: "Change",
    movementTypes: {
      IN: "In",
      OUT: "Out",
      ADJUSTMENT: "Adjustment",
      TRANSFER: "Transfer",
      RETURN: "Return",
      INVENTORY: "Inventory",
    },
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
    back: "Volver",
    edit: "Editar",
    delete: "Eliminar",
    confirmDelete: "¿Está seguro de eliminar este artículo?",
    cannotDelete: "Este artículo se usa en documentos y no puede eliminarse.",
    product: "Producto",
    service: "Servicio",
    active: "Activo",
    inactive: "Inactivo",
    lowStock: "Stock bajo",
    outOfStock: "Agotado",
    details: "Detalles",
    pricing: "Precios",
    stock: "Stock",
    stockMovements: "Movimientos de stock",
    priceHistory: "Historial de precios",
    supplier: "Proveedor",
    category: "Categoría",
    sku: "SKU",
    unit: "Unidad",
    purchasePrice: "Precio de compra",
    sellingPriceHT: "Precio sin IVA",
    sellingPriceTTC: "Precio con IVA",
    tvaRate: "Tasa IVA",
    maxDiscount: "Descuento máx",
    margin: "Margen",
    stockQty: "Cantidad en stock",
    stockMin: "Umbral de alerta",
    stockMax: "Stock máximo",
    stockLocation: "Ubicación",
    usedInDocuments: "Usado en {{count}} documento(s)",
    noMovements: "Sin movimientos de stock",
    noPriceChanges: "Sin cambios de precio",
    copiedSku: "¡SKU copiado!",
    images: "Imágenes",
    noImages: "Sin imágenes",
    date: "Fecha",
    type: "Tipo",
    quantity: "Cantidad",
    before: "Antes",
    after: "Después",
    reason: "Razón",
    oldPrice: "Precio anterior",
    newPrice: "Precio nuevo",
    change: "Cambio",
    movementTypes: {
      IN: "Entrada",
      OUT: "Salida",
      ADJUSTMENT: "Ajuste",
      TRANSFER: "Transferencia",
      RETURN: "Devolución",
      INVENTORY: "Inventario",
    },
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
    back: "رجوع",
    edit: "تعديل",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا العنصر؟",
    cannotDelete: "هذا العنصر مستخدم في المستندات ولا يمكن حذفه.",
    product: "منتج",
    service: "خدمة",
    active: "نشط",
    inactive: "غير نشط",
    lowStock: "مخزون منخفض",
    outOfStock: "نفذ المخزون",
    details: "التفاصيل",
    pricing: "التسعير",
    stock: "المخزون",
    stockMovements: "حركات المخزون",
    priceHistory: "تاريخ الأسعار",
    supplier: "المورد",
    category: "الفئة",
    sku: "الرمز",
    unit: "الوحدة",
    purchasePrice: "سعر الشراء",
    sellingPriceHT: "سعر البيع بدون ضريبة",
    sellingPriceTTC: "السعر شامل الضريبة",
    tvaRate: "معدل الضريبة",
    maxDiscount: "الخصم الأقصى",
    margin: "الهامش",
    stockQty: "الكمية في المخزون",
    stockMin: "حد التنبيه",
    stockMax: "المخزون الأقصى",
    stockLocation: "الموقع",
    usedInDocuments: "مستخدم في {{count}} مستند(ات)",
    noMovements: "لا حركات للمخزون",
    noPriceChanges: "لا تغييرات في الأسعار",
    copiedSku: "تم نسخ الرمز!",
    images: "الصور",
    noImages: "لا صور",
    date: "التاريخ",
    type: "النوع",
    quantity: "الكمية",
    before: "قبل",
    after: "بعد",
    reason: "السبب",
    oldPrice: "السعر القديم",
    newPrice: "السعر الجديد",
    change: "التغيير",
    movementTypes: {
      IN: "دخول",
      OUT: "خروج",
      ADJUSTMENT: "تعديل",
      TRANSFER: "تحويل",
      RETURN: "إرجاع",
      INVENTORY: "جرد",
    },
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

export function ItemDetailClient({ item, locale }: ItemDetailClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;
  const isProduct = item.type === "PRODUCT";

  const [selectedImage, setSelectedImage] = useState(0);
  const [copiedSku, setCopiedSku] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const basePath = `/${locale}/admin/catalogue/${isProduct ? "produits" : "services"}`;

  const { format: formatCurrency } = useCurrency();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(item.sku);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = async () => {
    if (item._count.documentItems > 0) {
      alert(t.cannotDelete);
      return;
    }

    if (!confirm(t.confirmDelete)) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/catalog/items/${item.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push(basePath);
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Calculate margin
  const margin =
    item.purchasePrice && item.purchasePrice > 0
      ? ((item.sellingPriceHT - item.purchasePrice) / item.purchasePrice) * 100
      : null;

  const isOutOfStock = item.trackStock && item.stockQty <= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={basePath}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              {isProduct ? (
                <Package className="h-7 w-7 text-amber-600" />
              ) : (
                <Wrench className="h-7 w-7 text-blue-600" />
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 font-mono hover:text-amber-600 transition-colors"
              >
                {item.sku}
                {copiedSku ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              {/* Status Badges */}
              <span
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full",
                  item.isActive
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}
              >
                {item.isActive ? t.active : t.inactive}
              </span>
              {item.isLowStock && (
                <span className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t.lowStock}
                </span>
              )}
              {isOutOfStock && (
                <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                  {t.outOfStock}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`${basePath}/${item.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            {t.edit}
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {t.delete}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {item.images && item.images.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.images}
              </h2>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={item.images[selectedImage]}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Thumbnails */}
                {item.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {item.images.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                          selectedImage === index
                            ? "border-amber-500"
                            : "border-transparent hover:border-gray-300"
                        )}
                      >
                        <img
                          src={url}
                          alt={`${item.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.details}
            </h2>

            {item.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-wrap">
                {item.description}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Category */}
              {item.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.category}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.category.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Supplier */}
              {item.supplier && (
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.supplier}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.supplier.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Unit */}
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.unit}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {t.units[item.unit] || item.unit}
                  </p>
                </div>
              </div>

              {/* Documents usage */}
              {item._count.documentItems > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.usedInDocuments.replace("{{count}}", String(item._count.documentItems))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stock Movements */}
          {isProduct && item.trackStock && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.stockMovements}
              </h2>

              {item.stockMovements.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t.noMovements}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                          {t.date}
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                          {t.type}
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                          {t.quantity}
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                          {t.before}
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                          {t.after}
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                          {t.reason}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.stockMovements.map((movement) => (
                        <tr
                          key={movement.id}
                          className="border-b border-gray-100 dark:border-gray-700/50"
                        >
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                            {formatDate(movement.createdAt)}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
                                movement.type === "IN" &&
                                  "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                                movement.type === "OUT" &&
                                  "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
                                movement.type === "ADJUSTMENT" &&
                                  "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                                !["IN", "OUT", "ADJUSTMENT"].includes(movement.type) &&
                                  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                              )}
                            >
                              {movement.type === "IN" ? (
                                <ArrowDownRight className="h-3 w-3" />
                              ) : movement.type === "OUT" ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : null}
                              {t.movementTypes[movement.type] || movement.type}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "py-2 px-3 text-right font-medium",
                              movement.quantity > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            )}
                          >
                            {movement.quantity > 0 ? "+" : ""}
                            {movement.quantity}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                            {movement.previousQty}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-white">
                            {movement.newQty}
                          </td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                            {movement.reason || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Price History */}
          {item.priceHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.priceHistory}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                        {t.date}
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                        {t.oldPrice}
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                        {t.newPrice}
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                        {t.change}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.priceHistory.map((history) => {
                      const change = ((history.newPrice - history.oldPrice) / history.oldPrice) * 100;
                      return (
                        <tr
                          key={history.id}
                          className="border-b border-gray-100 dark:border-gray-700/50"
                        >
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                            {formatDate(history.changedAt)}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                            {formatCurrency(history.oldPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(history.newPrice)}
                          </td>
                          <td
                            className={cn(
                              "py-2 px-3 text-right font-medium flex items-center justify-end gap-1",
                              change > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            )}
                          >
                            {change > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {change > 0 ? "+" : ""}
                            {change.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-4">
              {t.pricing}
            </h3>

            <div className="space-y-3">
              {item.purchasePrice && (
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-400">{t.purchasePrice}</span>
                  <span className="font-medium text-amber-900 dark:text-amber-200">
                    {formatCurrency(item.purchasePrice)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-amber-700 dark:text-amber-400">{t.sellingPriceHT}</span>
                <span className="font-medium text-amber-900 dark:text-amber-200">
                  {formatCurrency(item.sellingPriceHT)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-amber-700 dark:text-amber-400">{t.tvaRate}</span>
                <span className="font-medium text-amber-900 dark:text-amber-200">
                  {item.tvaRate}%
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-amber-300 dark:border-amber-700">
                <span className="font-semibold text-amber-800 dark:text-amber-300">
                  {t.sellingPriceTTC}
                </span>
                <span className="text-xl font-bold text-amber-900 dark:text-amber-200">
                  {formatCurrency(item.sellingPriceTTC)}
                </span>
              </div>

              {margin !== null && (
                <div className="flex justify-between pt-2">
                  <span className="text-amber-700 dark:text-amber-400">{t.margin}</span>
                  <span
                    className={cn(
                      "font-medium",
                      margin >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {margin >= 0 ? "+" : ""}
                    {margin.toFixed(1)}%
                  </span>
                </div>
              )}

              {item.maxDiscount && (
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-400">{t.maxDiscount}</span>
                  <span className="font-medium text-amber-900 dark:text-amber-200">
                    {item.maxDiscount}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stock Card */}
          {isProduct && item.trackStock && (
            <div
              className={cn(
                "rounded-lg border p-6",
                isOutOfStock
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : item.isLowStock
                  ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              )}
            >
              <h3
                className={cn(
                  "text-lg font-semibold mb-4",
                  isOutOfStock
                    ? "text-red-900 dark:text-red-200"
                    : item.isLowStock
                    ? "text-orange-900 dark:text-orange-200"
                    : "text-gray-900 dark:text-white"
                )}
              >
                {t.stock}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span
                    className={cn(
                      isOutOfStock
                        ? "text-red-700 dark:text-red-400"
                        : item.isLowStock
                        ? "text-orange-700 dark:text-orange-400"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {t.stockQty}
                  </span>
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      isOutOfStock
                        ? "text-red-600 dark:text-red-400"
                        : item.isLowStock
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {item.stockQty} {t.units[item.unit]}
                  </span>
                </div>

                {item.stockMin && (
                  <div className="flex justify-between">
                    <span
                      className={cn(
                        isOutOfStock
                          ? "text-red-700 dark:text-red-400"
                          : item.isLowStock
                          ? "text-orange-700 dark:text-orange-400"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {t.stockMin}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        isOutOfStock
                          ? "text-red-900 dark:text-red-200"
                          : item.isLowStock
                          ? "text-orange-900 dark:text-orange-200"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {item.stockMin}
                    </span>
                  </div>
                )}

                {item.stockMax && (
                  <div className="flex justify-between">
                    <span
                      className={cn(
                        isOutOfStock
                          ? "text-red-700 dark:text-red-400"
                          : item.isLowStock
                          ? "text-orange-700 dark:text-orange-400"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {t.stockMax}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        isOutOfStock
                          ? "text-red-900 dark:text-red-200"
                          : item.isLowStock
                          ? "text-orange-900 dark:text-orange-200"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {item.stockMax}
                    </span>
                  </div>
                )}

                {item.stockLocation && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.stockLocation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supplier Card */}
          {item.supplier && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.supplier}
              </h3>

              <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.supplier.name}
                </p>
                {item.supplier.code && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {item.supplier.code}
                  </p>
                )}
                {item.supplier.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.supplier.phone}
                  </p>
                )}
                {item.supplier.email && (
                  <a
                    href={`mailto:${item.supplier.email}`}
                    className="text-sm text-amber-600 hover:underline"
                  >
                    {item.supplier.email}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
