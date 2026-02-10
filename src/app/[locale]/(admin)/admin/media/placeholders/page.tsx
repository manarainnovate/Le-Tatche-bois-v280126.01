"use client";

import { useState, useEffect, use } from "react";
import {
  Image as ImageIcon,
  Download,
  Trash2,
  FolderOpen,
  ExternalLink,
  Check,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Images de Remplacement",
    subtitle: "Gerez les images placeholder du site web",
    heroSlides: "Slides Hero",
    products: "Produits",
    projects: "Projets",
    services: "Services",
    menuiserie: "Menuiserie",
    agencement: "Agencement",
    restauration: "Restauration",
    surMesure: "Sur Mesure",
    loading: "Chargement...",
    noImages: "Aucune image",
    downloadAll: "Telecharger tout",
    refresh: "Actualiser",
    delete: "Supprimer",
    confirmDelete: "Etes-vous sur de vouloir supprimer cette image ?",
    path: "Chemin",
    size: "Taille",
    dimensions: "Dimensions",
    openInNew: "Ouvrir dans un nouvel onglet",
    copyPath: "Copier le chemin",
    copied: "Copie !",
    totalImages: "Total: {count} images",
    category: "Categorie",
    source: "Source: Unsplash (Libre de droits)",
  },
  en: {
    title: "Placeholder Images",
    subtitle: "Manage website placeholder images",
    heroSlides: "Hero Slides",
    products: "Products",
    projects: "Projects",
    services: "Services",
    menuiserie: "Carpentry",
    agencement: "Interior Design",
    restauration: "Restoration",
    surMesure: "Custom Made",
    loading: "Loading...",
    noImages: "No images",
    downloadAll: "Download all",
    refresh: "Refresh",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this image?",
    path: "Path",
    size: "Size",
    dimensions: "Dimensions",
    openInNew: "Open in new tab",
    copyPath: "Copy path",
    copied: "Copied!",
    totalImages: "Total: {count} images",
    category: "Category",
    source: "Source: Unsplash (Royalty-free)",
  },
  es: {
    title: "Imagenes de Relleno",
    subtitle: "Gestiona las imagenes placeholder del sitio web",
    heroSlides: "Slides Hero",
    products: "Productos",
    projects: "Proyectos",
    services: "Servicios",
    menuiserie: "Carpinteria",
    agencement: "Diseno de Interiores",
    restauration: "Restauracion",
    surMesure: "A Medida",
    loading: "Cargando...",
    noImages: "Sin imagenes",
    downloadAll: "Descargar todo",
    refresh: "Actualizar",
    delete: "Eliminar",
    confirmDelete: "Esta seguro de eliminar esta imagen?",
    path: "Ruta",
    size: "Tamano",
    dimensions: "Dimensiones",
    openInNew: "Abrir en nueva pestana",
    copyPath: "Copiar ruta",
    copied: "Copiado!",
    totalImages: "Total: {count} imagenes",
    category: "Categoria",
    source: "Fuente: Unsplash (Sin derechos)",
  },
  ar: {
    title: "صور العناصر النائبة",
    subtitle: "إدارة صور العناصر النائبة للموقع",
    heroSlides: "شرائح البطل",
    products: "المنتجات",
    projects: "المشاريع",
    services: "الخدمات",
    menuiserie: "النجارة",
    agencement: "التصميم الداخلي",
    restauration: "الترميم",
    surMesure: "حسب الطلب",
    loading: "جاري التحميل...",
    noImages: "لا توجد صور",
    downloadAll: "تحميل الكل",
    refresh: "تحديث",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذه الصورة؟",
    path: "المسار",
    size: "الحجم",
    dimensions: "الأبعاد",
    openInNew: "فتح في علامة تبويب جديدة",
    copyPath: "نسخ المسار",
    copied: "تم النسخ!",
    totalImages: "المجموع: {count} صورة",
    category: "الفئة",
    source: "المصدر: Unsplash (بدون حقوق ملكية)",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface PlaceholderImage {
  path: string;
  category: string;
  filename: string;
  exists: boolean;
}

interface ImageCategory {
  id: string;
  label: string;
  path: string;
  images: PlaceholderImage[];
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

// ═══════════════════════════════════════════════════════════
// Placeholder Image Categories
// ═══════════════════════════════════════════════════════════

const getCategories = (t: typeof translations.fr): Omit<ImageCategory, "images">[] => [
  { id: "hero", label: t.heroSlides, path: "/images/hero" },
  { id: "products", label: t.products, path: "/images/products" },
  { id: "projects", label: t.projects, path: "/images/projects" },
  { id: "menuiserie", label: t.menuiserie, path: "/images/services/menuiserie" },
  { id: "agencement", label: t.agencement, path: "/images/services/agencement" },
  { id: "restauration", label: t.restauration, path: "/images/services/restauration" },
  { id: "surMesure", label: t.surMesure, path: "/images/services/sur-mesure" },
];

// Known placeholder images
const knownImages: Record<string, string[]> = {
  hero: ["slide-1.jpg", "slide-2.jpg", "slide-3.jpg"],
  products: [
    "product-1.jpg", "product-2.jpg", "product-3.jpg", "product-4.jpg",
    "product-5.jpg", "product-6.jpg", "product-7.jpg", "product-8.jpg",
    "product-9.jpg", "product-10.jpg", "product-11.jpg", "product-12.jpg",
  ],
  projects: [
    "project-1.jpg", "project-2.jpg", "project-3.jpg",
    "project-4.jpg", "project-5.jpg", "project-6.jpg",
  ],
  menuiserie: ["menuiserie-1.jpg", "menuiserie-2.jpg", "menuiserie-3.jpg"],
  agencement: ["agencement-1.jpg", "agencement-2.jpg", "agencement-3.jpg"],
  restauration: [
    "restauration-1.jpg", "restauration-2.jpg", "restauration-3.jpg",
    "restauration-4.jpg", "restauration-5.jpg", "restauration-6.jpg",
  ],
  surMesure: ["sur-mesure-1.jpg", "sur-mesure-2.jpg", "sur-mesure-3.jpg"],
};

// ═══════════════════════════════════════════════════════════
// Placeholder Images Page
// ═══════════════════════════════════════════════════════════

export default function PlaceholdersPage({ params }: PageProps) {
  const { locale } = use(params);
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("hero");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Load categories with image check
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);

      const cats = getCategories(t);
      const loadedCategories: ImageCategory[] = [];

      for (const cat of cats) {
        const images: PlaceholderImage[] = [];
        const categoryImages = knownImages[cat.id] || [];

        for (const filename of categoryImages) {
          const fullPath = `${cat.path}/${filename}`;

          // Check if image exists
          try {
            const response = await fetch(fullPath, { method: "HEAD" });
            images.push({
              path: fullPath,
              category: cat.id,
              filename,
              exists: response.ok,
            });
          } catch {
            images.push({
              path: fullPath,
              category: cat.id,
              filename,
              exists: false,
            });
          }
        }

        loadedCategories.push({
          ...cat,
          images,
        });
      }

      setCategories(loadedCategories);
      setLoading(false);
    };

    void loadCategories();
  }, [t]);

  // Copy path to clipboard
  const handleCopyPath = async (path: string) => {
    await navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Get total image count
  const totalImages = categories.reduce(
    (sum, cat) => sum + cat.images.filter((img) => img.exists).length,
    0
  );

  // Get active category data
  const activeCategoryData = categories.find((c) => c.id === activeCategory);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            {t.source}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t.totalImages.replace("{count}", String(totalImages))}
          </span>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t.refresh}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                {t.category}
              </h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      activeCategory === cat.id
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      {cat.label}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        activeCategory === cat.id
                          ? "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                      )}
                    >
                      {cat.images.filter((img) => img.exists).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Image Grid */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {activeCategoryData?.label} ({activeCategoryData?.images.filter((img) => img.exists).length})
                </h3>
                <code className="text-xs text-gray-500 dark:text-gray-400">
                  {activeCategoryData?.path}
                </code>
              </div>

              {activeCategoryData?.images.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <ImageIcon className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-2">{t.noImages}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeCategoryData?.images.map((image) => (
                    <div
                      key={image.path}
                      className={cn(
                        "group relative overflow-hidden rounded-lg border",
                        image.exists
                          ? "border-gray-200 dark:border-gray-700"
                          : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      )}
                    >
                      {/* Image Preview */}
                      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                        {image.exists ? (
                          <img
                            src={image.path}
                            alt={image.filename}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <X className="h-8 w-8 text-red-400" />
                          </div>
                        )}
                      </div>

                      {/* Overlay Actions */}
                      {image.exists && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => window.open(image.path, "_blank")}
                            className="rounded-full bg-white p-2 text-gray-900 hover:bg-gray-100"
                            title={t.openInNew}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPath(image.path)}
                            className="rounded-full bg-white p-2 text-gray-900 hover:bg-gray-100"
                            title={t.copyPath}
                          >
                            {copiedPath === image.path ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Image Info */}
                      <div className="p-3">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            image.exists
                              ? "text-gray-900 dark:text-white"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {image.filename}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t.path}: {image.path}
                        </p>
                        {!image.exists && (
                          <p className="mt-1 text-xs text-red-500">
                            Image manquante
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
