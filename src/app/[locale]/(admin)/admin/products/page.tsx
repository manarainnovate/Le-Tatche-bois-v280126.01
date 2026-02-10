import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import {
  Package,
  Plus,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Produits",
    subtitle: "Gérez votre catalogue de produits",
    newProduct: "Nouveau produit",
    search: "Rechercher un produit...",
    all: "Tous",
    published: "Publiés",
    draft: "Brouillons",
    lowStock: "Stock bas",
    outOfStock: "Rupture",
    product: "Produit",
    sku: "SKU",
    category: "Catégorie",
    price: "Prix",
    stock: "Stock",
    status: "Statut",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    view: "Voir",
    noProducts: "Aucun produit",
    noProductsDesc: "Créez votre premier produit pour commencer",
    inStock: "En stock",
    featured: "Vedette",
  },
  en: {
    title: "Products",
    subtitle: "Manage your product catalog",
    newProduct: "New Product",
    search: "Search products...",
    all: "All",
    published: "Published",
    draft: "Drafts",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    product: "Product",
    sku: "SKU",
    category: "Category",
    price: "Price",
    stock: "Stock",
    status: "Status",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    noProducts: "No products",
    noProductsDesc: "Create your first product to get started",
    inStock: "In Stock",
    featured: "Featured",
  },
  es: {
    title: "Productos",
    subtitle: "Gestiona tu catálogo de productos",
    newProduct: "Nuevo Producto",
    search: "Buscar productos...",
    all: "Todos",
    published: "Publicados",
    draft: "Borradores",
    lowStock: "Stock Bajo",
    outOfStock: "Agotado",
    product: "Producto",
    sku: "SKU",
    category: "Categoría",
    price: "Precio",
    stock: "Stock",
    status: "Estado",
    actions: "Acciones",
    edit: "Editar",
    delete: "Eliminar",
    view: "Ver",
    noProducts: "Sin productos",
    noProductsDesc: "Crea tu primer producto para empezar",
    inStock: "En Stock",
    featured: "Destacado",
  },
  ar: {
    title: "المنتجات",
    subtitle: "إدارة كتالوج المنتجات",
    newProduct: "منتج جديد",
    search: "البحث عن منتج...",
    all: "الكل",
    published: "منشور",
    draft: "مسودة",
    lowStock: "مخزون منخفض",
    outOfStock: "نفد المخزون",
    product: "المنتج",
    sku: "رمز المنتج",
    category: "الفئة",
    price: "السعر",
    stock: "المخزون",
    status: "الحالة",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    view: "عرض",
    noProducts: "لا توجد منتجات",
    noProductsDesc: "أنشئ أول منتج للبدء",
    inStock: "متوفر",
    featured: "مميز",
  },
};

// ═══════════════════════════════════════════════════════════
// Get Products
// ═══════════════════════════════════════════════════════════

interface ProductWithRelations {
  id: string;
  sku: string | null;
  price: number;
  stock: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  translations: { name: string; locale: string }[];
  category: { translations: { name: string; locale: string }[] } | null;
  images: unknown;
}

interface ImageData {
  url?: string;
  isMain?: boolean;
}

async function getProducts(_locale: string): Promise<ProductWithRelations[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      translations: {
        select: { name: true, locale: true },
      },
      category: {
        select: {
          translations: {
            select: { name: true, locale: true },
          },
        },
      },
    },
  });

  // Transform to expected format
  return products.map((p) => ({
    id: p.id,
    sku: p.sku,
    price: Number(p.price),
    stock: p.stockQty,
    isPublished: p.isActive,
    isFeatured: p.isFeatured,
    createdAt: p.createdAt,
    translations: p.translations,
    category: p.category,
    images: p.images,
  }));
}

// ═══════════════════════════════════════════════════════════
// Products Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { filter } = await searchParams;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const products = await getProducts(locale);

  // Filter products
  let filteredProducts = products;
  switch (filter) {
    case "published":
      filteredProducts = products.filter((p) => p.isPublished);
      break;
    case "draft":
      filteredProducts = products.filter((p) => !p.isPublished);
      break;
    case "low-stock":
      filteredProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
      break;
    case "out-of-stock":
      filteredProducts = products.filter((p) => p.stock === 0);
      break;
  }

  // Stats
  const stats = {
    all: products.length,
    published: products.filter((p) => p.isPublished).length,
    draft: products.filter((p) => !p.isPublished).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  // Get product name
  const getProductName = (product: ProductWithRelations) => {
    const trans = product.translations.find((t) => t.locale === locale) ?? product.translations[0];
    return trans?.name ?? product.sku ?? "Product";
  };

  // Get category name
  const getCategoryName = (product: ProductWithRelations) => {
    if (!product.category) return "-";
    const trans = product.category.translations.find((t) => t.locale === locale) ?? product.category.translations[0];
    return trans?.name ?? "-";
  };

  // Get main image
  const getMainImage = (product: ProductWithRelations) => {
    try {
      if (Array.isArray(product.images) && product.images.length > 0) {
        const images = product.images as ImageData[];
        const mainImage = images.find((img) => img.isMain) ?? images[0];
        return mainImage?.url ?? null;
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Table columns
  const columns: Column<ProductWithRelations>[] = [
    {
      key: "product",
      header: t.product,
      sortable: false,
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
            {getMainImage(product) ? (
              <Image
                src={getMainImage(product)!}
                alt={getProductName(product)}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {getProductName(product)}
            </p>
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                <Star className="h-3 w-3 fill-current" />
                {t.featured}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      header: t.sku,
      sortable: true,
      render: (product) => (
        <span className="font-mono text-sm text-gray-500">{product.sku}</span>
      ),
    },
    {
      key: "category",
      header: t.category,
      sortable: false,
      render: (product) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getCategoryName(product)}
        </span>
      ),
    },
    {
      key: "price",
      header: t.price,
      sortable: true,
      render: (product) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatPrice(product.price)}
        </span>
      ),
    },
    {
      key: "stock",
      header: t.stock,
      sortable: true,
      render: (product) => {
        const isLow = product.stock > 0 && product.stock <= 5;
        const isOut = product.stock === 0;

        return (
          <div className="flex items-center gap-2">
            {isOut ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                {t.outOfStock}
              </span>
            ) : isLow ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertTriangle className="h-3 w-3" />
                {product.stock}
              </span>
            ) : (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.stock}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "isPublished",
      header: t.status,
      sortable: true,
      render: (product) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            product.isPublished
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
          )}
        >
          {product.isPublished ? (
            <>
              <Eye className="h-3 w-3" />
              {t.published}
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3" />
              {t.draft}
            </>
          )}
        </span>
      ),
    },
    {
      key: "actions",
      header: t.actions,
      sortable: false,
      render: (product) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/products/${product.id}`}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-700"
            title={t.edit}
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20"
            title={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

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
        </div>
        <Link
          href={`/${locale}/admin/products/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" />
          {t.newProduct}
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: undefined, label: t.all, count: stats.all },
          { key: "published", label: t.published, count: stats.published },
          { key: "draft", label: t.draft, count: stats.draft },
          { key: "low-stock", label: t.lowStock, count: stats.lowStock },
          { key: "out-of-stock", label: t.outOfStock, count: stats.outOfStock },
        ].map((tab) => (
          <Link
            key={tab.key ?? "all"}
            href={tab.key ? `/${locale}/admin/products?filter=${tab.key}` : `/${locale}/admin/products`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === tab.key || (!filter && !tab.key)
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                filter === tab.key || (!filter && !tab.key)
                  ? "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              )}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Products Table */}
      {filteredProducts.length > 0 ? (
        <AdminDataTable<ProductWithRelations>
          columns={columns}
          data={filteredProducts}
          keyField="id"
          searchPlaceholder={t.search}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {t.noProducts}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t.noProductsDesc}
          </p>
          <Link
            href={`/${locale}/admin/products/new`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            {t.newProduct}
          </Link>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Products",
};
