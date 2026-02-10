"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, X, Camera, Tag, Box, Ruler, Search, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import MultilingualInput from "@/components/admin/MultilingualInput";
import TranslateAllButton from "@/components/admin/TranslateAllButton";

interface PageProps {
  params: { locale: string; id: string };
}

interface Category {
  id: string;
  slug: string;
  translations: Array<{
    locale: string;
    name: string;
  }>;
}

interface ProductTranslation {
  locale: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  features: string[];
}

interface Product {
  id: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  stockQty: number;
  lowStockQty: number;
  trackStock: boolean;
  allowBackorder: boolean;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  images: string[];
  thumbnail: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  categoryId: string | null;
  translations: ProductTranslation[];
}

// Multilingual form state interface
interface MultilingualValues {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

interface FeatureValues {
  fr: string[];
  en: string[];
  es: string[];
  ar: string[];
}

const translations = {
  fr: {
    newProduct: "Nouveau Produit",
    editProduct: "Modifier le Produit",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement...",
    category: "Catégorie",
    selectCategory: "Sélectionner une catégorie",
    sku: "SKU (Code produit)",
    price: "Prix de vente",
    comparePrice: "Prix barré",
    costPrice: "Prix de revient",
    stockQty: "Quantité en stock",
    lowStockQty: "Seuil alerte stock",
    trackStock: "Suivi du stock activé",
    allowBackorder: "Autoriser les commandes antérieures",
    weight: "Poids (kg)",
    length: "Longueur (cm)",
    width: "Largeur (cm)",
    height: "Hauteur (cm)",
    slug: "Slug (URL)",
    isActive: "Actif",
    isFeatured: "En vedette",
    isNew: "Nouveau produit",
    error: "Une erreur est survenue",
    cancel: "Annuler",
    autoTranslate: "Traduction automatique",
    autoTranslateDesc: "Traduire FR → EN/ES/AR",
    loadingCategories: "Chargement...",
    // Tabs
    tabInfo: "Informations",
    tabContent: "Contenu & Traductions",
    tabImages: "Images",
    tabPricing: "Prix & Stock",
    tabDimensions: "Dimensions",
    tabSEO: "SEO",
    // Content section
    productName: "Nom du produit",
    productNamePlaceholder: "Ex: Meuble en chêne massif",
    description: "Description complète",
    descriptionPlaceholder: "Décrivez le produit en détail...",
    shortDescription: "Courte description",
    shortDescriptionPlaceholder: "Résumé rapide du produit (max 160 caractères)",
    features: "Caractéristiques",
    featurePlaceholder: "Ex: Bois massif, Finition naturelle",
    addFeature: "Ajouter une caractéristique",
    removeFeature: "Supprimer",
    // Images section
    thumbnail: "Miniature (première image)",
    productImages: "Images du produit",
    uploadedImages: "images",
    // Pricing & Stock section
    pricePerUnit: "Prix unitaire (EUR)",
    comparePriceDesc: "Prix original avant réduction",
    costPriceDesc: "Coût pour vous",
    quantity: "Quantité disponible",
    lowStockAlert: "Alerte si stock inférieur à",
    units: "unités",
    // Dimensions section
    dimensions: "Dimensions du produit",
    // SEO section
    metaTitle: "Titre SEO",
    metaDescription: "Description SEO",
    metaDescriptionHint: "Idéalement 155-160 caractères",
    characterCount: "{count} / {max}",
    // Validation & Status
    deleteProduct: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.",
    deleting: "Suppression...",
    requiredField: "Champ requis",
    validationError: "Veuillez vérifier les champs requis",
  },
  en: {
    newProduct: "New Product",
    editProduct: "Edit Product",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    category: "Category",
    selectCategory: "Select a category",
    sku: "SKU (Product Code)",
    price: "Sale Price",
    comparePrice: "Original Price",
    costPrice: "Cost Price",
    stockQty: "Stock Quantity",
    lowStockQty: "Low Stock Alert",
    trackStock: "Track Stock Enabled",
    allowBackorder: "Allow Backorders",
    weight: "Weight (kg)",
    length: "Length (cm)",
    width: "Width (cm)",
    height: "Height (cm)",
    slug: "Slug (URL)",
    isActive: "Active",
    isFeatured: "Featured",
    isNew: "New Product",
    error: "An error occurred",
    cancel: "Cancel",
    autoTranslate: "Auto translation",
    autoTranslateDesc: "Translate FR → EN/ES/AR",
    loadingCategories: "Loading...",
    // Tabs
    tabInfo: "Information",
    tabContent: "Content & Translations",
    tabImages: "Images",
    tabPricing: "Pricing & Stock",
    tabDimensions: "Dimensions",
    tabSEO: "SEO",
    // Content section
    productName: "Product Name",
    productNamePlaceholder: "Ex: Solid Oak Furniture",
    description: "Full Description",
    descriptionPlaceholder: "Describe the product in detail...",
    shortDescription: "Short Description",
    shortDescriptionPlaceholder: "Quick product summary (max 160 characters)",
    features: "Features",
    featurePlaceholder: "Ex: Solid wood, Natural finish",
    addFeature: "Add Feature",
    removeFeature: "Remove",
    // Images section
    thumbnail: "Thumbnail (First Image)",
    productImages: "Product Images",
    uploadedImages: "images",
    // Pricing & Stock section
    pricePerUnit: "Unit Price (EUR)",
    comparePriceDesc: "Original price before discount",
    costPriceDesc: "Cost to you",
    quantity: "Available Quantity",
    lowStockAlert: "Alert if stock below",
    units: "units",
    // Dimensions section
    dimensions: "Product Dimensions",
    // SEO section
    metaTitle: "SEO Title",
    metaDescription: "SEO Description",
    metaDescriptionHint: "Ideally 155-160 characters",
    characterCount: "{count} / {max}",
    // Validation & Status
    deleteProduct: "Delete",
    confirmDelete: "Are you sure you want to delete this product? This action cannot be undone.",
    deleting: "Deleting...",
    requiredField: "Required field",
    validationError: "Please check required fields",
  },
  es: {
    newProduct: "Nuevo Producto",
    editProduct: "Editar Producto",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    category: "Categoría",
    selectCategory: "Seleccionar categoría",
    sku: "SKU (Código de producto)",
    price: "Precio de venta",
    comparePrice: "Precio original",
    costPrice: "Precio de costo",
    stockQty: "Cantidad en stock",
    lowStockQty: "Alerta de bajo stock",
    trackStock: "Seguimiento de inventario",
    allowBackorder: "Permitir pedidos atrasados",
    weight: "Peso (kg)",
    length: "Largo (cm)",
    width: "Ancho (cm)",
    height: "Alto (cm)",
    slug: "Slug (URL)",
    isActive: "Activo",
    isFeatured: "Destacado",
    isNew: "Producto nuevo",
    error: "Ocurrió un error",
    cancel: "Cancelar",
    autoTranslate: "Traducción automática",
    autoTranslateDesc: "Traducir FR → EN/ES/AR",
    loadingCategories: "Cargando...",
    // Tabs
    tabInfo: "Información",
    tabContent: "Contenido y Traducciones",
    tabImages: "Imágenes",
    tabPricing: "Precios e Inventario",
    tabDimensions: "Dimensiones",
    tabSEO: "SEO",
    // Content section
    productName: "Nombre del Producto",
    productNamePlaceholder: "Ex: Mueble de Roble Macizo",
    description: "Descripción Completa",
    descriptionPlaceholder: "Describe el producto en detalle...",
    shortDescription: "Descripción Corta",
    shortDescriptionPlaceholder: "Resumen rápido del producto (máx 160 caracteres)",
    features: "Características",
    featurePlaceholder: "Ex: Madera maciza, Acabado natural",
    addFeature: "Agregar Característica",
    removeFeature: "Eliminar",
    // Images section
    thumbnail: "Miniatura (Primera Imagen)",
    productImages: "Imágenes del Producto",
    uploadedImages: "imágenes",
    // Pricing & Stock section
    pricePerUnit: "Precio Unitario (EUR)",
    comparePriceDesc: "Precio original antes del descuento",
    costPriceDesc: "Costo para ti",
    quantity: "Cantidad Disponible",
    lowStockAlert: "Alerta si el stock es inferior a",
    units: "unidades",
    // Dimensions section
    dimensions: "Dimensiones del Producto",
    // SEO section
    metaTitle: "Título SEO",
    metaDescription: "Descripción SEO",
    metaDescriptionHint: "Idealmente 155-160 caracteres",
    characterCount: "{count} / {max}",
    // Validation & Status
    deleteProduct: "Eliminar",
    confirmDelete: "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.",
    deleting: "Eliminando...",
    requiredField: "Campo requerido",
    validationError: "Por favor verifica los campos requeridos",
  },
  ar: {
    newProduct: "منتج جديد",
    editProduct: "تعديل المنتج",
    back: "رجوع",
    save: "حفظ",
    saving: "جاري الحفظ...",
    category: "الفئة",
    selectCategory: "اختر فئة",
    sku: "كود المنتج",
    price: "سعر البيع",
    comparePrice: "السعر الأصلي",
    costPrice: "سعر التكلفة",
    stockQty: "الكمية في المخزون",
    lowStockQty: "تنبيه المخزون المنخفض",
    trackStock: "تتبع المخزون",
    allowBackorder: "السماح بالطلبات المؤجلة",
    weight: "الوزن (كجم)",
    length: "الطول (سم)",
    width: "العرض (سم)",
    height: "الارتفاع (سم)",
    slug: "الرابط المختصر",
    isActive: "نشط",
    isFeatured: "مميز",
    isNew: "منتج جديد",
    error: "حدث خطأ",
    cancel: "إلغاء",
    autoTranslate: "ترجمة تلقائية",
    autoTranslateDesc: "ترجمة FR → EN/ES/AR",
    loadingCategories: "جاري التحميل...",
    // Tabs
    tabInfo: "المعلومات",
    tabContent: "المحتوى والترجمات",
    tabImages: "الصور",
    tabPricing: "الأسعار والمخزون",
    tabDimensions: "الأبعاد",
    tabSEO: "تحسين محرك البحث",
    // Content section
    productName: "اسم المنتج",
    productNamePlaceholder: "مثال: أثاث خشب البلوط الصلب",
    description: "الوصف الكامل",
    descriptionPlaceholder: "صف المنتج بالتفصيل...",
    shortDescription: "الوصف المختصر",
    shortDescriptionPlaceholder: "ملخص سريع للمنتج (أقصى 160 حرف)",
    features: "الميزات",
    featurePlaceholder: "مثال: خشب صلب، تشطيب طبيعي",
    addFeature: "إضافة ميزة",
    removeFeature: "حذف",
    // Images section
    thumbnail: "الصورة المصغرة",
    productImages: "صور المنتج",
    uploadedImages: "صور",
    // Pricing & Stock section
    pricePerUnit: "السعر الفردي (يورو)",
    comparePriceDesc: "السعر الأصلي قبل الخصم",
    costPriceDesc: "التكلفة لك",
    quantity: "الكمية المتاحة",
    lowStockAlert: "تنبيه إذا كان المخزون أقل من",
    units: "وحدات",
    // Dimensions section
    dimensions: "أبعاد المنتج",
    // SEO section
    metaTitle: "عنوان SEO",
    metaDescription: "وصف SEO",
    metaDescriptionHint: "من الناحية المثالية 155-160 حرف",
    characterCount: "{count} / {max}",
    // Validation & Status
    deleteProduct: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.",
    deleting: "جاري الحذف...",
    requiredField: "حقل مطلوب",
    validationError: "يرجى التحقق من الحقول المطلوبة",
  },
};

export default function ProductEditPage({ params }: PageProps) {
  const locale = params.locale as string;
  const id = params.id;
  const isNew = id === "nouveau";
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "content" | "images" | "pricing" | "dimensions" | "seo">("info");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Multilingual form state
  const [nameValues, setNameValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [descriptionValues, setDescriptionValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [shortDescriptionValues, setShortDescriptionValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [featuresValues, setFeaturesValues] = useState<FeatureValues>({ fr: [], en: [], es: [], ar: [] });

  // Form state
  const [form, setForm] = useState({
    categoryId: "",
    sku: "",
    slug: "",
    price: 0,
    comparePrice: null as number | null,
    costPrice: null as number | null,
    stockQty: 0,
    lowStockQty: 5,
    trackStock: true,
    allowBackorder: false,
    weight: null as number | null,
    length: null as number | null,
    width: null as number | null,
    height: null as number | null,
    images: [] as string[],
    thumbnail: "" as string,
    metaTitle: "",
    metaDescription: "",
    isActive: true,
    isFeatured: false,
    isNew: false,
  });

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchProduct();
    }
  }, [id, isNew]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch("/api/categories?isActive=true");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        const product = data.data || data;

        // Set multilingual fields
        const namesByLocale = { fr: "", en: "", es: "", ar: "" };
        const descriptionsByLocale = { fr: "", en: "", es: "", ar: "" };
        const shortDescriptionsByLocale = { fr: "", en: "", es: "", ar: "" };
        const featuresByLocale = { fr: [] as string[], en: [] as string[], es: [] as string[], ar: [] as string[] };

        (product.translations || []).forEach((t: ProductTranslation) => {
          namesByLocale[t.locale as keyof MultilingualValues] = t.name;
          descriptionsByLocale[t.locale as keyof MultilingualValues] = t.description || "";
          shortDescriptionsByLocale[t.locale as keyof MultilingualValues] = t.shortDescription || "";
          featuresByLocale[t.locale as keyof typeof featuresByLocale] = t.features || [];
        });

        setNameValues(namesByLocale);
        setDescriptionValues(descriptionsByLocale);
        setShortDescriptionValues(shortDescriptionsByLocale);
        setFeaturesValues(featuresByLocale);

        setForm({
          categoryId: product.categoryId || "",
          sku: product.sku || "",
          slug: product.slug || "",
          price: product.price || 0,
          comparePrice: product.comparePrice || null,
          costPrice: product.costPrice || null,
          stockQty: product.stockQty || 0,
          lowStockQty: product.lowStockQty || 5,
          trackStock: product.trackStock ?? true,
          allowBackorder: product.allowBackorder ?? false,
          weight: product.weight || null,
          length: product.length || null,
          width: product.width || null,
          height: product.height || null,
          images: product.images || [],
          thumbnail: product.thumbnail || "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          isNew: product.isNew ?? false,
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (values: MultilingualValues) => {
    setNameValues(values);
    // Auto-generate slug from French name if empty
    if (values.fr && !form.slug) {
      setForm(prev => ({ ...prev, slug: generateSlug(values.fr) }));
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!nameValues.fr.trim()) errors.push("Product name in French is required");
    if (!form.sku.trim()) errors.push("SKU is required");
    if (form.price <= 0) errors.push("Price must be greater than 0");

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleDelete = async () => {
    if (!confirm(t.confirmDelete)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/${locale}/admin/ecommerce/produits`);
      } else {
        const data = await res.json();
        alert(data.error || t.error);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(t.error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      alert(t.validationError);
      return;
    }

    setSaving(true);

    try {
      const url = isNew ? "/api/products" : `/api/products/${id}`;
      const method = isNew ? "POST" : "PUT";

      const payload = {
        slug: form.slug,
        sku: form.sku,
        categoryId: form.categoryId || null,
        price: form.price,
        comparePrice: form.comparePrice,
        costPrice: form.costPrice,
        stockQty: form.stockQty,
        lowStockQty: form.lowStockQty,
        trackStock: form.trackStock,
        allowBackorder: form.allowBackorder,
        weight: form.weight,
        length: form.length,
        width: form.width,
        height: form.height,
        images: form.images,
        thumbnail: form.thumbnail,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        translations: [
          {
            locale: "fr",
            name: nameValues.fr,
            description: descriptionValues.fr,
            shortDescription: shortDescriptionValues.fr,
            features: featuresValues.fr,
          },
          {
            locale: "en",
            name: nameValues.en,
            description: descriptionValues.en,
            shortDescription: shortDescriptionValues.en,
            features: featuresValues.en,
          },
          {
            locale: "es",
            name: nameValues.es,
            description: descriptionValues.es,
            shortDescription: shortDescriptionValues.es,
            features: featuresValues.es,
          },
          {
            locale: "ar",
            name: nameValues.ar,
            description: descriptionValues.ar,
            shortDescription: shortDescriptionValues.ar,
            features: featuresValues.ar,
          },
        ],
      };

      console.log("📤 Sending payload:", payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (res.ok) {
        console.log("✅ Product saved:", responseData);
        router.push(`/${locale}/admin/ecommerce/produits`);
      } else {
        console.error("❌ Error response:", responseData);
        alert(responseData.error || responseData.details || t.error);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(t.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/ecommerce/produits`}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNew ? t.newProduct : t.editProduct}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">E-Commerce / Produits</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors dark:border-red-700 dark:hover:bg-red-900/20"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {deleting ? t.deleting : t.deleteProduct}
            </button>
          )}
          <button
            onClick={() => handleSubmit()}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="font-semibold text-red-900 dark:text-red-100 mb-2">{t.validationError}</p>
          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-1 mb-6 border-b dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "info"
              ? "text-amber-600 border-amber-600"
              : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <FileText className="w-4 h-4" />
          {t.tabInfo}
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "content"
              ? "text-amber-600 border-amber-600"
              : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Search className="w-4 h-4" />
          {t.tabContent}
        </button>
        <button
          onClick={() => setActiveTab("images")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "images"
              ? "text-amber-600 border-amber-600"
              : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Camera className="w-4 h-4" />
          {t.tabImages}
          {form.images.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
              {form.images.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "pricing"
              ? "text-amber-600 border-amber-600"
              : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Tag className="w-4 h-4" />
          {t.tabPricing}
        </button>
        <button
          onClick={() => setActiveTab("dimensions")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "dimensions"
              ? "text-amber-600 border-amber-600"
              : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Ruler className="w-4 h-4" />
          {t.tabDimensions}
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "seo"
              ? "text-amber-600 border-amber-600"
              : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Search className="w-4 h-4" />
          {t.tabSEO}
        </button>
      </div>

      {/* Auto-Translate Section (visible for content-heavy tabs) */}
      {(activeTab === "content" || activeTab === "info") && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">{t.autoTranslate}</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">{t.autoTranslateDesc}</p>
          </div>
          <TranslateAllButton
            fields={[
              { fieldName: "name", values: nameValues, onChange: setNameValues },
              { fieldName: "description", values: descriptionValues, onChange: setDescriptionValues },
              { fieldName: "shortDescription", values: shortDescriptionValues, onChange: setShortDescriptionValues },
            ]}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: INFORMATION */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "info" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.category}
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">
                {loadingCategories ? t.loadingCategories : t.selectCategory}
              </option>
              {categories.map((cat) => {
                const translation = cat.translations.find((t) => t.locale === locale) || cat.translations[0];
                return (
                  <option key={cat.id} value={cat.id}>
                    {translation?.name || cat.slug}
                  </option>
                );
              })}
            </select>
          </div>

          {/* SKU & Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sku} *
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="PROD-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.slug}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">/shop/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">{t.isActive}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">{t.isFeatured}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">{t.isNew}</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t.saving : t.save}
            </button>
            <Link
              href={`/${locale}/admin/ecommerce/produits`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </Link>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: CONTENT & TRANSLATIONS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* Product Name */}
          <MultilingualInput
            label={t.productName}
            required
            placeholder={t.productNamePlaceholder}
            values={nameValues}
            onChange={handleNameChange}
          />

          {/* Short Description */}
          <MultilingualInput
            label={t.shortDescription}
            type="textarea"
            rows={2}
            placeholder={t.shortDescriptionPlaceholder}
            values={shortDescriptionValues}
            onChange={setShortDescriptionValues}
          />

          {/* Full Description */}
          <MultilingualInput
            label={t.description}
            type="textarea"
            rows={6}
            placeholder={t.descriptionPlaceholder}
            values={descriptionValues}
            onChange={setDescriptionValues}
          />

          {/* Features */}
          <div className="space-y-3">
            {["fr", "en", "es", "ar"].map((lang) => (
              <div key={lang}>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t.features} ({lang.toUpperCase()})
                </label>
                <div className="space-y-2">
                  {(featuresValues[lang as keyof FeatureValues] || []).map((feature, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...(featuresValues[lang as keyof FeatureValues] || [])];
                          newFeatures[idx] = e.target.value;
                          setFeaturesValues({
                            ...featuresValues,
                            [lang]: newFeatures,
                          });
                        }}
                        placeholder={t.featurePlaceholder}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFeatures = (featuresValues[lang as keyof FeatureValues] || []).filter((_, i) => i !== idx);
                          setFeaturesValues({
                            ...featuresValues,
                            [lang]: newFeatures,
                          });
                        }}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newFeatures = [...(featuresValues[lang as keyof FeatureValues] || []), ""];
                      setFeaturesValues({
                        ...featuresValues,
                        [lang]: newFeatures,
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/20 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addFeature}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: IMAGES */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "images" && (
        <div className="space-y-6">
          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.thumbnail}
            </label>
            <ImageUpload
              value={form.thumbnail}
              onChange={(url) => setForm({ ...form, thumbnail: url })}
              folder="products"
              locale={locale}
              aspectRatio="square"
            />
          </div>

          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.productImages} ({form.images.length} {t.uploadedImages})
            </label>
            <MultiImageUpload
              value={form.images}
              onChange={(urls) => setForm({ ...form, images: urls })}
              folder="products"
              maxImages={30}
              locale={locale}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: PRICING & STOCK */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "pricing" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.pricePerUnit} *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.comparePrice}
              </label>
              <input
                type="number"
                value={form.comparePrice || ""}
                onChange={(e) => setForm({ ...form, comparePrice: e.target.value ? parseFloat(e.target.value) : null })}
                step="0.01"
                min="0"
                placeholder={t.comparePriceDesc}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.costPrice}
              </label>
              <input
                type="number"
                value={form.costPrice || ""}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value ? parseFloat(e.target.value) : null })}
                step="0.01"
                min="0"
                placeholder={t.costPriceDesc}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Stock Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Management</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.quantity}
                </label>
                <input
                  type="number"
                  value={form.stockQty}
                  onChange={(e) => setForm({ ...form, stockQty: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.lowStockAlert}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.lowStockQty}
                    onChange={(e) => setForm({ ...form, lowStockQty: parseInt(e.target.value) || 5 })}
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {t.units}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Tracking Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.trackStock}
                onChange={(e) => setForm({ ...form, trackStock: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">{t.trackStock}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowBackorder}
                onChange={(e) => setForm({ ...form, allowBackorder: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">{t.allowBackorder}</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t.saving : t.save}
            </button>
            <Link
              href={`/${locale}/admin/ecommerce/produits`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </Link>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: DIMENSIONS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "dimensions" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Box className="w-5 h-5" />
              {t.dimensions}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.weight}
              </label>
              <input
                type="number"
                value={form.weight || ""}
                onChange={(e) => setForm({ ...form, weight: e.target.value ? parseFloat(e.target.value) : null })}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.length}
              </label>
              <input
                type="number"
                value={form.length || ""}
                onChange={(e) => setForm({ ...form, length: e.target.value ? parseFloat(e.target.value) : null })}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.width}
              </label>
              <input
                type="number"
                value={form.width || ""}
                onChange={(e) => setForm({ ...form, width: e.target.value ? parseFloat(e.target.value) : null })}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.height}
              </label>
              <input
                type="number"
                value={form.height || ""}
                onChange={(e) => setForm({ ...form, height: e.target.value ? parseFloat(e.target.value) : null })}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t.saving : t.save}
            </button>
            <Link
              href={`/${locale}/admin/ecommerce/produits`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </Link>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: SEO */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "seo" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h3 className="font-bold text-purple-900 dark:text-purple-100">SEO - Search Engine Optimization</h3>
          </div>

          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.metaTitle}
            </label>
            <input
              type="text"
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              placeholder="Ex: Best Solid Oak Furniture | Your Store"
              maxLength={60}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t.characterCount.replace("{count}", form.metaTitle.length.toString()).replace("{max}", "60")}
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.metaDescription}
            </label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              placeholder="Describe your product for search engines. Include key features and benefits."
              maxLength={160}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.metaDescriptionHint}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.characterCount.replace("{count}", form.metaDescription.length.toString()).replace("{max}", "160")}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t.saving : t.save}
            </button>
            <Link
              href={`/${locale}/admin/ecommerce/produits`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
