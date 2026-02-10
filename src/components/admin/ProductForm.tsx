"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import MultilingualInput from "./MultilingualInput";
import TranslateAllButton from "./TranslateAllButton";
import {
  Save,
  Loader2,
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  Layers,
  Settings,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    backToProducts: "Retour aux produits",
    newProduct: "Nouveau produit",
    editProduct: "Modifier le produit",
    basicInfo: "Informations de base",
    sku: "Référence (SKU)",
    skuPlaceholder: "ex: CHAISE-BOIS-001",
    category: "Catégorie",
    selectCategory: "Sélectionner une catégorie",
    pricing: "Tarification",
    price: "Prix (MAD)",
    comparePrice: "Prix barré (MAD)",
    comparePriceHelp: "Optionnel - affiché comme ancien prix",
    inventory: "Inventaire",
    stock: "Stock disponible",
    lowStockAlert: "Alerte stock bas",
    trackInventory: "Suivre l'inventaire",
    translations: "Traductions",
    images: "Images du produit",
    settings: "Paramètres",
    visibility: "Visibilité",
    published: "Publié",
    draft: "Brouillon",
    featured: "Produit vedette",
    featuredHelp: "Afficher sur la page d'accueil",
    save: "Enregistrer",
    saving: "Enregistrement...",
    cancel: "Annuler",
    name: "Nom",
    description: "Description",
    namePlaceholder: "Nom du produit",
    descriptionPlaceholder: "Description détaillée du produit...",
  },
  en: {
    backToProducts: "Back to products",
    newProduct: "New Product",
    editProduct: "Edit Product",
    basicInfo: "Basic Information",
    sku: "SKU",
    skuPlaceholder: "e.g: WOOD-CHAIR-001",
    category: "Category",
    selectCategory: "Select a category",
    pricing: "Pricing",
    price: "Price (MAD)",
    comparePrice: "Compare Price (MAD)",
    comparePriceHelp: "Optional - shown as original price",
    inventory: "Inventory",
    stock: "Stock Available",
    lowStockAlert: "Low Stock Alert",
    trackInventory: "Track Inventory",
    translations: "Translations",
    images: "Product Images",
    settings: "Settings",
    visibility: "Visibility",
    published: "Published",
    draft: "Draft",
    featured: "Featured Product",
    featuredHelp: "Show on homepage",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    name: "Name",
    description: "Description",
    namePlaceholder: "Product name",
    descriptionPlaceholder: "Detailed product description...",
  },
  es: {
    backToProducts: "Volver a productos",
    newProduct: "Nuevo Producto",
    editProduct: "Editar Producto",
    basicInfo: "Información Básica",
    sku: "SKU",
    skuPlaceholder: "ej: SILLA-MADERA-001",
    category: "Categoría",
    selectCategory: "Seleccionar categoría",
    pricing: "Precios",
    price: "Precio (MAD)",
    comparePrice: "Precio Comparativo (MAD)",
    comparePriceHelp: "Opcional - mostrado como precio original",
    inventory: "Inventario",
    stock: "Stock Disponible",
    lowStockAlert: "Alerta de Stock Bajo",
    trackInventory: "Seguir Inventario",
    translations: "Traducciones",
    images: "Imágenes del Producto",
    settings: "Configuración",
    visibility: "Visibilidad",
    published: "Publicado",
    draft: "Borrador",
    featured: "Producto Destacado",
    featuredHelp: "Mostrar en página principal",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    name: "Nombre",
    description: "Descripción",
    namePlaceholder: "Nombre del producto",
    descriptionPlaceholder: "Descripción detallada del producto...",
  },
  ar: {
    backToProducts: "العودة للمنتجات",
    newProduct: "منتج جديد",
    editProduct: "تعديل المنتج",
    basicInfo: "المعلومات الأساسية",
    sku: "رمز المنتج",
    skuPlaceholder: "مثال: كرسي-خشب-001",
    category: "الفئة",
    selectCategory: "اختر فئة",
    pricing: "التسعير",
    price: "السعر (درهم)",
    comparePrice: "السعر القديم (درهم)",
    comparePriceHelp: "اختياري - يظهر كسعر قديم",
    inventory: "المخزون",
    stock: "الكمية المتوفرة",
    lowStockAlert: "تنبيه نفاد المخزون",
    trackInventory: "تتبع المخزون",
    translations: "الترجمات",
    images: "صور المنتج",
    settings: "الإعدادات",
    visibility: "الظهور",
    published: "منشور",
    draft: "مسودة",
    featured: "منتج مميز",
    featuredHelp: "عرض في الصفحة الرئيسية",
    save: "حفظ",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    name: "الاسم",
    description: "الوصف",
    namePlaceholder: "اسم المنتج",
    descriptionPlaceholder: "وصف تفصيلي للمنتج...",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface MultilingualValues {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

interface Category {
  id: string;
  translations: { name: string; locale: string }[];
}

interface ProductFormData {
  sku: string;
  categoryId: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  images: UploadedImage[];
}

interface ProductWithTranslations extends ProductFormData {
  id: string;
  translations: Record<string, { name: string; description: string }>;
}

interface ProductFormProps {
  product?: ProductWithTranslations;
  categories: Category[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Product Form Component
// ═══════════════════════════════════════════════════════════

export function ProductForm({ product, categories, locale }: ProductFormProps) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";
  const isEdit = !!product;

  // Multilingual values state
  const [nameValues, setNameValues] = useState<MultilingualValues>({
    fr: product?.translations?.fr?.name ?? "",
    en: product?.translations?.en?.name ?? "",
    es: product?.translations?.es?.name ?? "",
    ar: product?.translations?.ar?.name ?? "",
  });

  const [descriptionValues, setDescriptionValues] = useState<MultilingualValues>({
    fr: product?.translations?.fr?.description ?? "",
    en: product?.translations?.en?.description ?? "",
    es: product?.translations?.es?.description ?? "",
    ar: product?.translations?.ar?.description ?? "",
  });

  // Form state (non-multilingual fields)
  const [formData, setFormData] = useState<ProductFormData>({
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? "",
    price: product?.price ?? 0,
    comparePrice: product?.comparePrice ?? null,
    stock: product?.stock ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    trackInventory: product?.trackInventory ?? true,
    isPublished: product?.isPublished ?? false,
    isFeatured: product?.isFeatured ?? false,
    images: product?.images ?? [],
  });

  const [isSaving, setIsSaving] = useState(false);

  // Handle image change
  const handleImageChange = (images: UploadedImage[]) => {
    setFormData((prev) => ({ ...prev, images }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      // Build the payload with multilingual translations
      const payload = {
        ...formData,
        translations: {
          fr: { name: nameValues.fr, description: descriptionValues.fr },
          en: { name: nameValues.en || null, description: descriptionValues.en || null },
          es: { name: nameValues.es || null, description: descriptionValues.es || null },
          ar: { name: nameValues.ar || null, description: descriptionValues.ar || null },
        },
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(`/${locale}/admin/products`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get category name for display
  const getCategoryName = (cat: Category) => {
    const trans = cat.translations.find((t) => t.locale === locale) ?? cat.translations[0];
    return trans?.name ?? "";
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToProducts}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? t.editProduct : t.newProduct}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {t.cancel}
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" />
                {t.save}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Package className="h-5 w-5 text-amber-600" />
              {t.basicInfo}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.sku} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder={t.skuPlaceholder}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.category}
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getCategoryName(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Translations */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Tag className="h-5 w-5 text-amber-600" />
              {t.translations}
            </h2>

            {/* Info Banner */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800">
              <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {locale === "fr" ? "Contenu multilingue - 4 langues" : "Multilingual Content - 4 Languages"}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  {locale === "fr"
                    ? "Entrez le texte en français, puis utilisez la traduction automatique"
                    : "Enter text in French, then use auto-translation"}
                </p>
              </div>
            </div>

            {/* Auto-Translate All */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800">
              <TranslateAllButton
                fields={[
                  { fieldName: "name", values: nameValues, onChange: setNameValues },
                  { fieldName: "description", values: descriptionValues, onChange: setDescriptionValues },
                ]}
              />
            </div>

            {/* Product Name - 4 Languages */}
            <MultilingualInput
              label={t.name}
              required
              values={nameValues}
              onChange={setNameValues}
              placeholder={t.namePlaceholder}
            />

            {/* Product Description - 4 Languages */}
            <MultilingualInput
              label={t.description}
              values={descriptionValues}
              onChange={setDescriptionValues}
              type="textarea"
              rows={4}
              placeholder={t.descriptionPlaceholder}
            />
          </div>

          {/* Images */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Layers className="h-5 w-5 text-amber-600" />
              {t.images}
            </h2>
            <ImageUploader
              images={formData.images}
              onChange={handleImageChange}
              maxImages={10}
              locale={locale}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <DollarSign className="h-5 w-5 text-amber-600" />
              {t.pricing}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.price} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.comparePrice}
                </label>
                <input
                  type="number"
                  value={formData.comparePrice ?? ""}
                  onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value ? Number(e.target.value) : null })}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">{t.comparePriceHelp}</p>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Package className="h-5 w-5 text-amber-600" />
              {t.inventory}
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.trackInventory}
                  onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.trackInventory}</span>
              </label>

              {formData.trackInventory && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.stock}
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      min="0"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.lowStockAlert}
                    </label>
                    <input
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                      min="0"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Settings className="h-5 w-5 text-amber-600" />
              {t.settings}
            </h2>
            <div className="space-y-4">
              {/* Visibility */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.visibility}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.isPublished}
                      onChange={() => setFormData({ ...formData, isPublished: true })}
                      className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.published}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!formData.isPublished}
                      onChange={() => setFormData({ ...formData, isPublished: false })}
                      className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <EyeOff className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.draft}</span>
                  </label>
                </div>
              </div>

              {/* Featured */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.featured}</span>
              </label>
              <p className="text-xs text-gray-500">{t.featuredHelp}</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
