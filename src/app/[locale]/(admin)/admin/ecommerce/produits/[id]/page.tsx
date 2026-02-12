"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, X, Trash2, ExternalLink, Sparkles, GripVertical, Star } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";
import MultilingualInput from "@/components/admin/MultilingualInput";
import TranslateAllButton from "@/components/admin/TranslateAllButton";
import { useCurrency } from "@/stores/currency";

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
    thumbnail: "Miniature (première image)",
    productImages: "Images du produit",
    uploadedImages: "images",
    pricePerUnit: "Prix unitaire",
    comparePriceDesc: "Prix original avant réduction",
    costPriceDesc: "Coût pour vous",
    quantity: "Quantité disponible",
    lowStockAlert: "Alerte si stock inférieur à",
    units: "unités",
    dimensions: "Dimensions du produit",
    metaTitle: "Titre SEO",
    metaDescription: "Description SEO",
    metaDescriptionHint: "Idéalement 155-160 caractères",
    characterCount: "{count} / {max}",
    deleteProduct: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.",
    deleting: "Suppression...",
    requiredField: "Champ requis",
    validationError: "Veuillez vérifier les champs requis",
    viewOnline: "Voir en ligne",
    sectionProductInfo: "Informations produit",
    sectionImages: "Images",
    sectionPricing: "Prix & Stock",
    sectionDimensions: "Dimensions & Poids",
    sectionTranslations: "Traductions",
    sectionSEO: "SEO",
    addImages: "Ajouter des images",
    primaryImage: "Image principale",
    clickToSetPrimary: "Cliquer pour définir comme principale",
    deleteImage: "Supprimer l'image",
    autoGenerateSEO: "Générer automatiquement",
    seoPreview: "Aperçu Google",
    stockManagement: "Gestion du stock",
    productType: "Type de produit",
    languageTabs: "Langues",
  },
  en: {
    newProduct: "New Product",
    viewOnline: "View Online",
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
    thumbnail: "Thumbnail (First Image)",
    productImages: "Product Images",
    uploadedImages: "images",
    pricePerUnit: "Unit Price",
    comparePriceDesc: "Original price before discount",
    costPriceDesc: "Cost to you",
    quantity: "Available Quantity",
    lowStockAlert: "Alert if stock below",
    units: "units",
    dimensions: "Product Dimensions",
    metaTitle: "SEO Title",
    metaDescription: "SEO Description",
    metaDescriptionHint: "Ideally 155-160 characters",
    characterCount: "{count} / {max}",
    deleteProduct: "Delete",
    confirmDelete: "Are you sure you want to delete this product? This action cannot be undone.",
    deleting: "Deleting...",
    requiredField: "Required field",
    validationError: "Please check required fields",
    sectionProductInfo: "Product Information",
    sectionImages: "Images",
    sectionPricing: "Pricing & Stock",
    sectionDimensions: "Dimensions & Weight",
    sectionTranslations: "Translations",
    sectionSEO: "SEO",
    addImages: "Add images",
    primaryImage: "Primary image",
    clickToSetPrimary: "Click to set as primary",
    deleteImage: "Delete image",
    autoGenerateSEO: "Auto-generate",
    seoPreview: "Google Preview",
    stockManagement: "Stock Management",
    productType: "Product Type",
    languageTabs: "Languages",
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
    thumbnail: "Miniatura (Primera Imagen)",
    productImages: "Imágenes del Producto",
    uploadedImages: "imágenes",
    pricePerUnit: "Precio Unitario",
    comparePriceDesc: "Precio original antes del descuento",
    costPriceDesc: "Costo para ti",
    quantity: "Cantidad Disponible",
    lowStockAlert: "Alerta si el stock es inferior a",
    units: "unidades",
    dimensions: "Dimensiones del Producto",
    metaTitle: "Título SEO",
    metaDescription: "Descripción SEO",
    metaDescriptionHint: "Idealmente 155-160 caracteres",
    characterCount: "{count} / {max}",
    deleteProduct: "Eliminar",
    confirmDelete: "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.",
    deleting: "Eliminando...",
    requiredField: "Campo requerido",
    validationError: "Por favor verifica los campos requeridos",
    viewOnline: "Ver en línea",
    sectionProductInfo: "Información del Producto",
    sectionImages: "Imágenes",
    sectionPricing: "Precios e Inventario",
    sectionDimensions: "Dimensiones y Peso",
    sectionTranslations: "Traducciones",
    sectionSEO: "SEO",
    addImages: "Agregar imágenes",
    primaryImage: "Imagen principal",
    clickToSetPrimary: "Clic para establecer como principal",
    deleteImage: "Eliminar imagen",
    autoGenerateSEO: "Generar automáticamente",
    seoPreview: "Vista previa de Google",
    stockManagement: "Gestión de Inventario",
    productType: "Tipo de Producto",
    languageTabs: "Idiomas",
  },
  ar: {
    viewOnline: "عرض أونلاين",
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
    thumbnail: "الصورة المصغرة",
    productImages: "صور المنتج",
    uploadedImages: "صور",
    pricePerUnit: "السعر الفردي",
    comparePriceDesc: "السعر الأصلي قبل الخصم",
    costPriceDesc: "التكلفة لك",
    quantity: "الكمية المتاحة",
    lowStockAlert: "تنبيه إذا كان المخزون أقل من",
    units: "وحدات",
    dimensions: "أبعاد المنتج",
    metaTitle: "عنوان SEO",
    metaDescription: "وصف SEO",
    metaDescriptionHint: "من الناحية المثالية 155-160 حرف",
    characterCount: "{count} / {max}",
    deleteProduct: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.",
    deleting: "جاري الحذف...",
    requiredField: "حقل مطلوب",
    validationError: "يرجى التحقق من الحقول المطلوبة",
    sectionProductInfo: "معلومات المنتج",
    sectionImages: "الصور",
    sectionPricing: "الأسعار والمخزون",
    sectionDimensions: "الأبعاد والوزن",
    sectionTranslations: "الترجمات",
    sectionSEO: "تحسين محرك البحث",
    addImages: "إضافة صور",
    primaryImage: "الصورة الرئيسية",
    clickToSetPrimary: "انقر لتعيين كصورة رئيسية",
    deleteImage: "حذف الصورة",
    autoGenerateSEO: "توليد تلقائي",
    seoPreview: "معاينة جوجل",
    stockManagement: "إدارة المخزون",
    productType: "نوع المنتج",
    languageTabs: "اللغات",
  },
};

export default function ProductEditPage({ params }: PageProps) {
  const locale = params.locale as string;
  const id = params.id;
  const isNew = id === "nouveau";
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";
  const { currencyInfo } = useCurrency();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeLanguageTab, setActiveLanguageTab] = useState<"fr" | "en" | "es" | "ar">("fr");

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
      const res = await fetch("/api/categories?isActive=true&limit=100&allTranslations=true");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data && Array.isArray(result.data.data)) {
          setCategories(result.data.data);
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
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
          { locale: "fr", name: nameValues.fr, description: descriptionValues.fr, shortDescription: shortDescriptionValues.fr, features: featuresValues.fr },
          { locale: "en", name: nameValues.en, description: descriptionValues.en, shortDescription: shortDescriptionValues.en, features: featuresValues.en },
          { locale: "es", name: nameValues.es, description: descriptionValues.es, shortDescription: shortDescriptionValues.es, features: featuresValues.es },
          { locale: "ar", name: nameValues.ar, description: descriptionValues.ar, shortDescription: shortDescriptionValues.ar, features: featuresValues.ar },
        ].filter((t) => t.name.trim() !== ""),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (res.ok) {
        router.push(`/${locale}/admin/ecommerce/produits`);
      } else {
        alert(responseData.error || responseData.details || t.error);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(t.error);
    } finally {
      setSaving(false);
    }
  };

  // Shopify-style image management functions
  const handleAddImages = (newUrl: string) => {
    const updatedImages = [...form.images, newUrl];
    setForm(prev => ({
      ...prev,
      images: updatedImages,
      thumbnail: updatedImages[0] || prev.thumbnail, // First image is auto-primary
    }));
  };

  const handleSetPrimaryImage = (index: number) => {
    const newImages = [...form.images];
    const [primaryImage] = newImages.splice(index, 1);
    newImages.unshift(primaryImage);
    setForm(prev => ({
      ...prev,
      images: newImages,
      thumbnail: primaryImage,
    }));
  };

  const handleDeleteImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm(prev => ({
      ...prev,
      images: newImages,
      thumbnail: newImages[0] || "",
    }));
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...form.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setForm(prev => ({
      ...prev,
      images: newImages,
      thumbnail: newImages[0] || prev.thumbnail,
    }));
  };

  // SEO auto-generation functions
  const generateSeoTitle = () => {
    const productName = nameValues.fr || nameValues.en || nameValues.es || nameValues.ar;
    const categoryName = categories.find(c => c.id === form.categoryId)?.translations?.[0]?.name || "";
    const title = categoryName
      ? `${productName} | ${categoryName}`
      : productName;
    setForm(prev => ({ ...prev, metaTitle: title.substring(0, 60) }));
  };

  const generateSeoDescription = () => {
    const shortDesc = shortDescriptionValues.fr || shortDescriptionValues.en || shortDescriptionValues.es || shortDescriptionValues.ar;
    const features = featuresValues.fr.slice(0, 3).join(", ") || featuresValues.en.slice(0, 3).join(", ");
    const description = shortDesc || `${nameValues.fr}. ${features}`;
    setForm(prev => ({ ...prev, metaDescription: description.substring(0, 160) }));
  };

  if (loading) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/admin/ecommerce/produits`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isNew ? t.newProduct : t.editProduct}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {!isNew && form.slug && (
                <Link
                  href={`/${locale}/boutique/${form.slug}`}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.viewOnline}
                </Link>
              )}
              {!isNew && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? t.deleting : t.deleteProduct}
                </button>
              )}
              <button
                onClick={() => handleSubmit()}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="font-semibold text-red-900 dark:text-red-100 mb-2">{t.validationError}</p>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content - Single Scrollable Page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* SECTION 1: Product Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t.sectionProductInfo}</h2>

            <div className="space-y-6">
              {/* Product Name (French only in this section) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.productName} (FR) *
                </label>
                <input
                  type="text"
                  value={nameValues.fr}
                  onChange={(e) => handleNameChange({ ...nameValues, fr: e.target.value })}
                  placeholder={t.productNamePlaceholder}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* SKU & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.sku} *
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="PROD-001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.category}
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{loadingCategories ? t.loadingCategories : t.selectCategory}</option>
                    {categories.map((cat) => {
                      const translation = cat.translations?.find((t) => t.locale === locale) || cat.translations?.[0];
                      return (
                        <option key={cat.id} value={cat.id}>
                          {translation?.name || cat.slug}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.slug}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">/boutique/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Short Description (French) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.shortDescription} (FR)
                </label>
                <textarea
                  value={shortDescriptionValues.fr}
                  onChange={(e) => setShortDescriptionValues({ ...shortDescriptionValues, fr: e.target.value })}
                  placeholder={t.shortDescriptionPlaceholder}
                  rows={2}
                  maxLength={160}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {shortDescriptionValues.fr.length} / 160
                </p>
              </div>

              {/* Full Description (French) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.description} (FR)
                </label>
                <textarea
                  value={descriptionValues.fr}
                  onChange={(e) => setDescriptionValues({ ...descriptionValues, fr: e.target.value })}
                  placeholder={t.descriptionPlaceholder}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Features (French) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.features} (FR)
                </label>
                <div className="space-y-2">
                  {featuresValues.fr.map((feature, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...featuresValues.fr];
                          newFeatures[idx] = e.target.value;
                          setFeaturesValues({ ...featuresValues, fr: newFeatures });
                        }}
                        placeholder={t.featurePlaceholder}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFeatures = featuresValues.fr.filter((_, i) => i !== idx);
                          setFeaturesValues({ ...featuresValues, fr: newFeatures });
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFeaturesValues({ ...featuresValues, fr: [...featuresValues.fr, ""] })}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addFeature}
                  </button>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t.isActive}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t.isFeatured}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t.isNew}</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: Images (Shopify-style) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t.sectionImages}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {form.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-amber-500 transition-colors cursor-pointer"
                  onClick={() => handleSetPrimaryImage(index)}
                >
                  <img
                    src={imageUrl}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {t.primaryImage}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(index);
                      }}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {index !== 0 && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white dark:bg-gray-800 text-xs px-2 py-1 rounded shadow">
                        {t.clickToSetPrimary}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Image Button */}
              <div className="aspect-square">
                <ImageUpload
                  value=""
                  onChange={handleAddImages}
                  folder="products"
                  locale={locale}
                  aspectRatio="square"
                />
              </div>
            </div>

            {form.images.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                {form.images.length} {t.uploadedImages}. {t.clickToSetPrimary}
              </p>
            )}
          </div>

          {/* SECTION 3: Pricing & Stock */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t.sectionPricing}</h2>

            <div className="space-y-6">
              {/* Pricing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.pricePerUnit} * ({currencyInfo.code})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white pr-12"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      {currencyInfo.symbol}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.comparePrice}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.comparePrice || ""}
                      onChange={(e) => setForm({ ...form, comparePrice: e.target.value ? parseFloat(e.target.value) : null })}
                      step="0.01"
                      min="0"
                      placeholder={t.comparePriceDesc}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      {currencyInfo.symbol}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.costPrice}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.costPrice || ""}
                      onChange={(e) => setForm({ ...form, costPrice: e.target.value ? parseFloat(e.target.value) : null })}
                      step="0.01"
                      min="0"
                      placeholder={t.costPriceDesc}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      {currencyInfo.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Management */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t.stockManagement}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.quantity}
                    </label>
                    <input
                      type="number"
                      value={form.stockQty}
                      onChange={(e) => setForm({ ...form, stockQty: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
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
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                      <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 whitespace-nowrap text-sm">
                        {t.units}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock Options */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.trackStock}
                      onChange={(e) => setForm({ ...form, trackStock: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.trackStock}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allowBackorder}
                      onChange={(e) => setForm({ ...form, allowBackorder: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.allowBackorder}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Dimensions & Weight */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t.sectionDimensions}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
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
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
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
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
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
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Translations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.sectionTranslations}</h2>
              <TranslateAllButton
                fields={[
                  { fieldName: "name", values: nameValues, onChange: setNameValues },
                  { fieldName: "description", values: descriptionValues, onChange: setDescriptionValues },
                  { fieldName: "shortDescription", values: shortDescriptionValues, onChange: setShortDescriptionValues },
                ]}
              />
            </div>

            {/* Language Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              {(["fr", "en", "es", "ar"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguageTab(lang)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeLanguageTab === lang
                      ? "text-amber-600 border-amber-600"
                      : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Translation Content */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.productName}
                </label>
                <input
                  type="text"
                  value={nameValues[activeLanguageTab]}
                  onChange={(e) => setNameValues({ ...nameValues, [activeLanguageTab]: e.target.value })}
                  placeholder={t.productNamePlaceholder}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.shortDescription}
                </label>
                <textarea
                  value={shortDescriptionValues[activeLanguageTab]}
                  onChange={(e) => setShortDescriptionValues({ ...shortDescriptionValues, [activeLanguageTab]: e.target.value })}
                  placeholder={t.shortDescriptionPlaceholder}
                  rows={2}
                  maxLength={160}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {shortDescriptionValues[activeLanguageTab].length} / 160
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.description}
                </label>
                <textarea
                  value={descriptionValues[activeLanguageTab]}
                  onChange={(e) => setDescriptionValues({ ...descriptionValues, [activeLanguageTab]: e.target.value })}
                  placeholder={t.descriptionPlaceholder}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.features}
                </label>
                <div className="space-y-2">
                  {featuresValues[activeLanguageTab].map((feature, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...featuresValues[activeLanguageTab]];
                          newFeatures[idx] = e.target.value;
                          setFeaturesValues({ ...featuresValues, [activeLanguageTab]: newFeatures });
                        }}
                        placeholder={t.featurePlaceholder}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFeatures = featuresValues[activeLanguageTab].filter((_, i) => i !== idx);
                          setFeaturesValues({ ...featuresValues, [activeLanguageTab]: newFeatures });
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newFeatures = [...featuresValues[activeLanguageTab], ""];
                      setFeaturesValues({ ...featuresValues, [activeLanguageTab]: newFeatures });
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addFeature}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: SEO */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.sectionSEO}</h2>
              <button
                type="button"
                onClick={() => {
                  generateSeoTitle();
                  generateSeoDescription();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {t.autoGenerateSEO}
              </button>
            </div>

            <div className="space-y-6">
              {/* SEO Title */}
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {form.metaTitle.length} / 60 {t.characterCount.replace("{count}", "").replace("{max}", "").replace(" / ", "")}
                </p>
              </div>

              {/* SEO Description */}
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.metaDescriptionHint}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {form.metaDescription.length} / 160
                  </p>
                </div>
              </div>

              {/* Google Preview */}
              {(form.metaTitle || form.metaDescription) && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">{t.seoPreview}</p>
                  <div className="space-y-1">
                    <p className="text-blue-600 dark:text-blue-400 text-lg font-normal">
                      {form.metaTitle || nameValues.fr || "Product Title"}
                    </p>
                    <p className="text-green-700 dark:text-green-500 text-sm">
                      {typeof window !== "undefined" && window.location.origin}/boutique/{form.slug || "product-slug"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {form.metaDescription || shortDescriptionValues.fr || "Product description will appear here..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-24"></div>
    </div>
  );
}
