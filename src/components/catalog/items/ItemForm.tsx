"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Package,
  Wrench,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Category {
  id: string;
  name: string;
  slug: string;
  level?: number;
  children?: Category[];
}

interface Supplier {
  id: string;
  name: string;
  code?: string | null;
}

interface ItemFormData {
  id?: string;
  sku?: string;
  type: "PRODUCT" | "SERVICE";
  categoryId?: string;
  name: string;
  description?: string;
  unit: string;
  purchasePrice?: number;
  sellingPriceHT: number;
  tvaRate: number;
  maxDiscount?: number;
  trackStock: boolean;
  stockQty: number;
  stockMin?: number;
  stockMax?: number;
  stockLocation?: string;
  supplierId?: string;
  images?: string[];
  isActive: boolean;
}

interface ItemFormProps {
  type: "PRODUCT" | "SERVICE";
  locale: string;
  categories: Category[];
  suppliers: Supplier[];
  initialData?: ItemFormData;
  isEdit?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  newProduct: string;
  newService: string;
  editProduct: string;
  editService: string;
  back: string;
  save: string;
  saving: string;
  generalInfo: string;
  pricing: string;
  stockManagement: string;
  images: string;
  name: string;
  namePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  category: string;
  selectCategory: string;
  supplier: string;
  selectSupplier: string;
  sku: string;
  skuPlaceholder: string;
  skuHint: string;
  unit: string;
  purchasePrice: string;
  sellingPriceHT: string;
  sellingPriceTTC: string;
  tvaRate: string;
  maxDiscount: string;
  trackStock: string;
  trackStockHint: string;
  stockQty: string;
  stockMin: string;
  stockMax: string;
  stockLocation: string;
  stockLocationPlaceholder: string;
  active: string;
  activeHint: string;
  addImage: string;
  imageUrl: string;
  errors: {
    name: string;
    sellingPrice: string;
    generic: string;
  };
  units: Record<string, string>;
}

const translations: Record<string, Translations> = {
  fr: {
    newProduct: "Nouveau produit",
    newService: "Nouveau service",
    editProduct: "Modifier le produit",
    editService: "Modifier le service",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement...",
    generalInfo: "Informations générales",
    pricing: "Tarification",
    stockManagement: "Gestion du stock",
    images: "Images",
    name: "Nom",
    namePlaceholder: "Nom de l'article",
    description: "Description",
    descriptionPlaceholder: "Description détaillée de l'article...",
    category: "Catégorie",
    selectCategory: "Sélectionner une catégorie",
    supplier: "Fournisseur",
    selectSupplier: "Sélectionner un fournisseur",
    sku: "Référence (SKU)",
    skuPlaceholder: "Référence unique",
    skuHint: "Laissez vide pour générer automatiquement",
    unit: "Unité",
    purchasePrice: "Prix d'achat (HT)",
    sellingPriceHT: "Prix de vente (HT)",
    sellingPriceTTC: "Prix TTC",
    tvaRate: "Taux TVA (%)",
    maxDiscount: "Remise max (%)",
    trackStock: "Suivre le stock",
    trackStockHint: "Activer la gestion des quantités en stock",
    stockQty: "Quantité en stock",
    stockMin: "Seuil d'alerte (min)",
    stockMax: "Stock maximum",
    stockLocation: "Emplacement",
    stockLocationPlaceholder: "Ex: Entrepôt A, Rayon 3",
    active: "Actif",
    activeHint: "Article visible dans le catalogue",
    addImage: "Ajouter une image",
    imageUrl: "URL de l'image",
    errors: {
      name: "Le nom est requis",
      sellingPrice: "Le prix de vente est requis",
      generic: "Une erreur est survenue",
    },
    units: {
      PCS: "Pièce",
      M2: "Mètre carré (m²)",
      ML: "Mètre linéaire",
      M3: "Mètre cube (m³)",
      KG: "Kilogramme",
      L: "Litre",
      H: "Heure",
      FORFAIT: "Forfait",
      DAY: "Jour",
    },
  },
  en: {
    newProduct: "New product",
    newService: "New service",
    editProduct: "Edit product",
    editService: "Edit service",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    generalInfo: "General information",
    pricing: "Pricing",
    stockManagement: "Stock management",
    images: "Images",
    name: "Name",
    namePlaceholder: "Item name",
    description: "Description",
    descriptionPlaceholder: "Detailed item description...",
    category: "Category",
    selectCategory: "Select a category",
    supplier: "Supplier",
    selectSupplier: "Select a supplier",
    sku: "SKU",
    skuPlaceholder: "Unique reference",
    skuHint: "Leave empty to auto-generate",
    unit: "Unit",
    purchasePrice: "Purchase price (excl. VAT)",
    sellingPriceHT: "Selling price (excl. VAT)",
    sellingPriceTTC: "Price incl. VAT",
    tvaRate: "VAT rate (%)",
    maxDiscount: "Max discount (%)",
    trackStock: "Track stock",
    trackStockHint: "Enable stock quantity management",
    stockQty: "Stock quantity",
    stockMin: "Alert threshold (min)",
    stockMax: "Maximum stock",
    stockLocation: "Location",
    stockLocationPlaceholder: "E.g., Warehouse A, Shelf 3",
    active: "Active",
    activeHint: "Item visible in catalog",
    addImage: "Add image",
    imageUrl: "Image URL",
    errors: {
      name: "Name is required",
      sellingPrice: "Selling price is required",
      generic: "An error occurred",
    },
    units: {
      PCS: "Piece",
      M2: "Square meter (m²)",
      ML: "Linear meter",
      M3: "Cubic meter (m³)",
      KG: "Kilogram",
      L: "Liter",
      H: "Hour",
      FORFAIT: "Flat rate",
      DAY: "Day",
    },
  },
  es: {
    newProduct: "Nuevo producto",
    newService: "Nuevo servicio",
    editProduct: "Editar producto",
    editService: "Editar servicio",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    generalInfo: "Información general",
    pricing: "Precios",
    stockManagement: "Gestión de stock",
    images: "Imágenes",
    name: "Nombre",
    namePlaceholder: "Nombre del artículo",
    description: "Descripción",
    descriptionPlaceholder: "Descripción detallada del artículo...",
    category: "Categoría",
    selectCategory: "Seleccionar categoría",
    supplier: "Proveedor",
    selectSupplier: "Seleccionar proveedor",
    sku: "SKU",
    skuPlaceholder: "Referencia única",
    skuHint: "Dejar vacío para generar automáticamente",
    unit: "Unidad",
    purchasePrice: "Precio de compra (sin IVA)",
    sellingPriceHT: "Precio de venta (sin IVA)",
    sellingPriceTTC: "Precio con IVA",
    tvaRate: "Tasa IVA (%)",
    maxDiscount: "Descuento máx (%)",
    trackStock: "Seguir stock",
    trackStockHint: "Activar gestión de cantidades en stock",
    stockQty: "Cantidad en stock",
    stockMin: "Umbral de alerta (mín)",
    stockMax: "Stock máximo",
    stockLocation: "Ubicación",
    stockLocationPlaceholder: "Ej: Almacén A, Estante 3",
    active: "Activo",
    activeHint: "Artículo visible en el catálogo",
    addImage: "Añadir imagen",
    imageUrl: "URL de la imagen",
    errors: {
      name: "El nombre es obligatorio",
      sellingPrice: "El precio de venta es obligatorio",
      generic: "Se produjo un error",
    },
    units: {
      PCS: "Pieza",
      M2: "Metro cuadrado (m²)",
      ML: "Metro lineal",
      M3: "Metro cúbico (m³)",
      KG: "Kilogramo",
      L: "Litro",
      H: "Hora",
      FORFAIT: "Tarifa fija",
      DAY: "Día",
    },
  },
  ar: {
    newProduct: "منتج جديد",
    newService: "خدمة جديدة",
    editProduct: "تعديل المنتج",
    editService: "تعديل الخدمة",
    back: "رجوع",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    generalInfo: "معلومات عامة",
    pricing: "التسعير",
    stockManagement: "إدارة المخزون",
    images: "الصور",
    name: "الاسم",
    namePlaceholder: "اسم العنصر",
    description: "الوصف",
    descriptionPlaceholder: "وصف تفصيلي للعنصر...",
    category: "الفئة",
    selectCategory: "اختر فئة",
    supplier: "المورد",
    selectSupplier: "اختر مورداً",
    sku: "الرمز (SKU)",
    skuPlaceholder: "مرجع فريد",
    skuHint: "اتركه فارغاً للتوليد التلقائي",
    unit: "الوحدة",
    purchasePrice: "سعر الشراء (بدون ضريبة)",
    sellingPriceHT: "سعر البيع (بدون ضريبة)",
    sellingPriceTTC: "السعر شامل الضريبة",
    tvaRate: "معدل الضريبة (%)",
    maxDiscount: "الخصم الأقصى (%)",
    trackStock: "تتبع المخزون",
    trackStockHint: "تفعيل إدارة كميات المخزون",
    stockQty: "الكمية في المخزون",
    stockMin: "حد التنبيه (الأدنى)",
    stockMax: "المخزون الأقصى",
    stockLocation: "الموقع",
    stockLocationPlaceholder: "مثال: المستودع أ، الرف 3",
    active: "نشط",
    activeHint: "العنصر مرئي في الكتالوج",
    addImage: "إضافة صورة",
    imageUrl: "رابط الصورة",
    errors: {
      name: "الاسم مطلوب",
      sellingPrice: "سعر البيع مطلوب",
      generic: "حدث خطأ",
    },
    units: {
      PCS: "قطعة",
      M2: "متر مربع (م²)",
      ML: "متر طولي",
      M3: "متر مكعب (م³)",
      KG: "كيلوغرام",
      L: "لتر",
      H: "ساعة",
      FORFAIT: "سعر ثابت",
      DAY: "يوم",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Helper: Flatten categories for select
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

export function ItemForm({
  type,
  locale,
  categories,
  suppliers,
  initialData,
  isEdit = false,
}: ItemFormProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isProduct = type === "PRODUCT";

  const [formData, setFormData] = useState<ItemFormData>(() => ({
    type,
    name: "",
    description: "",
    unit: isProduct ? "PCS" : "H",
    purchasePrice: undefined,
    sellingPriceHT: 0,
    tvaRate: 20,
    maxDiscount: undefined,
    trackStock: isProduct,
    stockQty: 0,
    stockMin: undefined,
    stockMax: undefined,
    stockLocation: "",
    images: [],
    isActive: true,
    ...initialData,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const flatCategories = flattenCategories(categories);
  const basePath = `/${locale}/admin/catalogue/${isProduct ? "produits" : "services"}`;

  // Calculate TTC price
  const priceTTC = formData.sellingPriceHT * (1 + formData.tvaRate / 100);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type: inputType } = e.target;

    if (inputType === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (inputType === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImageUrl.trim()],
      }));
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.errors.name;
    }

    if (formData.sellingPriceHT <= 0) {
      newErrors.sellingPriceHT = t.errors.sellingPrice;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const url = isEdit
        ? `/api/catalog/items/${formData.id}`
        : "/api/catalog/items";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId || null,
          supplierId: formData.supplierId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.errors.generic);
      }

      router.push(basePath);
      router.refresh();
    } catch (error) {
      console.error("Error saving item:", error);
      setErrors({
        submit: error instanceof Error ? error.message : t.errors.generic,
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {isProduct ? (
                <Package className="h-7 w-7 text-amber-600" />
              ) : (
                <Wrench className="h-7 w-7 text-blue-600" />
              )}
              {isEdit
                ? isProduct
                  ? t.editProduct
                  : t.editService
                : isProduct
                ? t.newProduct
                : t.newService}
            </h1>
            {formData.sku && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                {formData.sku}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.saving}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t.save}
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {errors.submit && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.generalInfo}
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.name} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t.namePlaceholder}
                    className={cn(
                      "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
                      errors.name
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.description}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    placeholder={t.descriptionPlaceholder}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Category & Supplier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.category}
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">{t.selectCategory}</option>
                      {flatCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {"—".repeat(cat.level)} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isProduct && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.supplier}
                      </label>
                      <select
                        name="supplierId"
                        value={formData.supplierId || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">{t.selectSupplier}</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.code ? `${supplier.code} - ` : ""}
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* SKU & Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.sku}
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku || ""}
                      onChange={handleChange}
                      placeholder={t.skuPlaceholder}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t.skuHint}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.unit}
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {Object.entries(t.units).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.pricing}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Purchase Price */}
                {isProduct && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.purchasePrice}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="purchasePrice"
                        value={formData.purchasePrice ?? ""}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        MAD
                      </span>
                    </div>
                  </div>
                )}

                {/* Selling Price HT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.sellingPriceHT} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="sellingPriceHT"
                      value={formData.sellingPriceHT || ""}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={cn(
                        "w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
                        errors.sellingPriceHT
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      MAD
                    </span>
                  </div>
                  {errors.sellingPriceHT && (
                    <p className="text-sm text-red-500 mt-1">{errors.sellingPriceHT}</p>
                  )}
                </div>

                {/* TVA Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.tvaRate}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="tvaRate"
                      value={formData.tvaRate}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      %
                    </span>
                  </div>
                </div>

                {/* Selling Price TTC (calculated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.sellingPriceTTC}
                  </label>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-lg font-semibold text-amber-600 dark:text-amber-400">
                    {new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
                      style: "currency",
                      currency: "MAD",
                    }).format(priceTTC)}
                  </div>
                </div>

                {/* Max Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.maxDiscount}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="maxDiscount"
                      value={formData.maxDiscount ?? ""}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Management (Products only) */}
            {isProduct && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t.stockManagement}
                  </h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="trackStock"
                      checked={formData.trackStock}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t.trackStock}
                    </span>
                  </label>
                </div>

                {formData.trackStock && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stock Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.stockQty}
                      </label>
                      <input
                        type="number"
                        name="stockQty"
                        value={formData.stockQty}
                        onChange={handleChange}
                        step="1"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                    {/* Stock Min */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.stockMin}
                      </label>
                      <input
                        type="number"
                        name="stockMin"
                        value={formData.stockMin ?? ""}
                        onChange={handleChange}
                        step="1"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                    {/* Stock Max */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.stockMax}
                      </label>
                      <input
                        type="number"
                        name="stockMax"
                        value={formData.stockMax ?? ""}
                        onChange={handleChange}
                        step="1"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                    {/* Stock Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.stockLocation}
                      </label>
                      <input
                        type="text"
                        name="stockLocation"
                        value={formData.stockLocation || ""}
                        onChange={handleChange}
                        placeholder={t.stockLocationPlaceholder}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Images */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.images}
              </h2>

              {/* Image List */}
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((url, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/200?text=Error";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Image */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder={t.imageUrl}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={!newImageUrl.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t.addImage}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status
              </h2>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t.active}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.activeHint}
                  </p>
                </div>
              </label>
            </div>

            {/* Summary */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3">
                {t.pricing}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-400">
                    {t.sellingPriceHT}
                  </span>
                  <span className="font-medium text-amber-900 dark:text-amber-200">
                    {new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
                      style: "currency",
                      currency: "MAD",
                    }).format(formData.sellingPriceHT)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-400">
                    TVA ({formData.tvaRate}%)
                  </span>
                  <span className="font-medium text-amber-900 dark:text-amber-200">
                    {new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
                      style: "currency",
                      currency: "MAD",
                    }).format(priceTTC - formData.sellingPriceHT)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-amber-300 dark:border-amber-700">
                  <span className="font-semibold text-amber-800 dark:text-amber-300">
                    {t.sellingPriceTTC}
                  </span>
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    {new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
                      style: "currency",
                      currency: "MAD",
                    }).format(priceTTC)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ItemForm;
