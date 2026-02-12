"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Plus,
  Download,
  RefreshCw,
  Package,
  Edit,
  Trash2,
  Star,
  StarOff,
  AlertTriangle,
  Image as ImageIcon,
  CheckSquare,
  Square,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { AdminButton } from "@/components/ui/admin-button";
import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { StatsCard } from "@/components/admin/StatsCard";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category?: string;
  categoryId?: string;
  thumbnail?: string;
  price: number;
  comparePrice?: number;
  stockQty: number;
  lowStockQty: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  viewCount: number;
  soldCount: number;
  createdAt: string;
}

interface ProductStats {
  total: number;
  active: number;
  featured: number;
  lowStock: number;
}

interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Produits E-Commerce",
    subtitle: "Gerez les produits de votre boutique en ligne",
    addProduct: "Ajouter un produit",
    searchPlaceholder: "Rechercher par nom, SKU...",
    all: "Tous",
    active: "Actifs",
    inactive: "Inactifs",
    featured: "En vedette",
    lowStock: "Stock faible",
    export: "Exporter CSV",
    refresh: "Actualiser",
    sku: "SKU",
    product: "Produit",
    category: "Categorie",
    price: "Prix",
    stock: "Stock",
    status: "Statut",
    actions: "Actions",
    view: "Voir",
    viewOnline: "Voir en ligne",
    edit: "Modifier",
    delete: "Supprimer",
    noProducts: "Aucun produit trouve",
    totalProducts: "Total produits",
    activeProducts: "Produits actifs",
    featuredProducts: "En vedette",
    lowStockProducts: "Stock faible",
    outOfStock: "Rupture",
    inStock: "En stock",
    published: "Publie",
    draft: "Brouillon",
    new: "Nouveau",
    show: "Afficher",
    hide: "Masquer",
    pin: "Epingler",
    unpin: "Desepingler",
    pinned: "Epingle",
    hidden: "Masque",
    selected: "{count} selectionne(s)",
    deleteSelected: "Supprimer la selection",
    clearSelection: "Deselectionner",
    selectAll: "Tout selectionner",
    confirmBulkDelete: "Etes-vous sur de vouloir supprimer {count} produit(s) ?",
  },
  en: {
    title: "E-Commerce Products",
    subtitle: "Manage your online store products",
    addProduct: "Add Product",
    searchPlaceholder: "Search by name, SKU...",
    all: "All",
    active: "Active",
    inactive: "Inactive",
    featured: "Featured",
    lowStock: "Low Stock",
    export: "Export CSV",
    refresh: "Refresh",
    sku: "SKU",
    product: "Product",
    category: "Category",
    price: "Price",
    stock: "Stock",
    status: "Status",
    actions: "Actions",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    noProducts: "No products found",
    totalProducts: "Total Products",
    activeProducts: "Active Products",
    featuredProducts: "Featured",
    lowStockProducts: "Low Stock",
    outOfStock: "Out of Stock",
    inStock: "In Stock",
    published: "Published",
    draft: "Draft",
    new: "New",
    show: "Show",
    hide: "Hide",
    pin: "Pin",
    unpin: "Unpin",
    pinned: "Pinned",
    hidden: "Hidden",
    selected: "{count} selected",
    deleteSelected: "Delete selected",
    clearSelection: "Clear selection",
    selectAll: "Select all",
    confirmBulkDelete: "Are you sure you want to delete {count} product(s)?",
  },
  es: {
    title: "Productos E-Commerce",
    subtitle: "Gestiona los productos de tu tienda online",
    addProduct: "Agregar Producto",
    searchPlaceholder: "Buscar por nombre, SKU...",
    all: "Todos",
    active: "Activos",
    inactive: "Inactivos",
    featured: "Destacados",
    lowStock: "Stock Bajo",
    export: "Exportar CSV",
    refresh: "Actualizar",
    sku: "SKU",
    product: "Producto",
    category: "Categoria",
    price: "Precio",
    stock: "Stock",
    status: "Estado",
    actions: "Acciones",
    view: "Ver",
    edit: "Editar",
    delete: "Eliminar",
    noProducts: "No se encontraron productos",
    totalProducts: "Total Productos",
    activeProducts: "Productos Activos",
    featuredProducts: "Destacados",
    lowStockProducts: "Stock Bajo",
    outOfStock: "Agotado",
    inStock: "En Stock",
    published: "Publicado",
    draft: "Borrador",
    new: "Nuevo",
    show: "Mostrar",
    hide: "Ocultar",
    pin: "Fijar",
    unpin: "Desfijar",
    pinned: "Fijado",
    hidden: "Oculto",
    selected: "{count} seleccionado(s)",
    deleteSelected: "Eliminar seleccionados",
    clearSelection: "Limpiar seleccion",
    selectAll: "Seleccionar todo",
    confirmBulkDelete: "Esta seguro de eliminar {count} producto(s)?",
  },
  ar: {
    title: "منتجات المتجر الإلكتروني",
    subtitle: "إدارة منتجات متجرك الإلكتروني",
    addProduct: "إضافة منتج",
    searchPlaceholder: "البحث بالاسم أو SKU...",
    all: "الكل",
    active: "نشط",
    inactive: "غير نشط",
    featured: "مميز",
    lowStock: "مخزون منخفض",
    export: "تصدير CSV",
    refresh: "تحديث",
    sku: "SKU",
    product: "المنتج",
    category: "الفئة",
    price: "السعر",
    stock: "المخزون",
    status: "الحالة",
    actions: "الإجراءات",
    view: "عرض",
    edit: "تعديل",
    delete: "حذف",
    noProducts: "لا توجد منتجات",
    totalProducts: "إجمالي المنتجات",
    activeProducts: "المنتجات النشطة",
    featuredProducts: "المميزة",
    lowStockProducts: "مخزون منخفض",
    outOfStock: "نفذ المخزون",
    inStock: "متوفر",
    published: "منشور",
    draft: "مسودة",
    new: "جديد",
    show: "إظهار",
    hide: "إخفاء",
    pin: "تثبيت",
    unpin: "إلغاء التثبيت",
    pinned: "مثبت",
    hidden: "مخفي",
    selected: "{count} محدد",
    deleteSelected: "حذف المحدد",
    clearSelection: "إلغاء التحديد",
    selectAll: "تحديد الكل",
    confirmBulkDelete: "هل أنت متأكد من حذف {count} منتج(ات)؟",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string };
}

export default function EcommerceProductsPage({ params }: PageProps) {
  const locale = params?.locale || "fr";
  const searchParams = useSearchParams();

  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({ total: 0, active: 0, featured: 0, lowStock: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(page));
      queryParams.set("limit", String(pageSize));
      queryParams.set("locale", locale);
      if (statusFilter === "active") queryParams.set("isActive", "true");
      if (statusFilter === "inactive") queryParams.set("isActive", "false");
      if (statusFilter === "featured") queryParams.set("isFeatured", "true");
      if (statusFilter === "lowStock") queryParams.set("lowStock", "true");
      if (searchQuery) queryParams.set("search", searchQuery);

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (response.ok) {
        const result = (await response.json()) as { success: boolean; data: ProductsResponse; stats?: ProductStats };
        if (result.success && result.data) {
          setProducts(result.data.data ?? []);
          setTotal(result.data.pagination?.total ?? 0);
          if (result.stats) setStats(result.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, searchQuery, locale]);

  // Format currency
  const { format: formatCurrency } = useCurrency();

  // Export to CSV
  const handleExport = () => {
    const headers = ["SKU", "Name", "Category", "Price", "Stock", "Status"];
    const rows = products.map((p) => [
      p.sku,
      p.name,
      p.category ?? "",
      p.price,
      p.stockQty,
      p.isActive ? "Active" : "Inactive",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(products.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Etes-vous sur de vouloir supprimer ce produit?")) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (response.ok) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        void fetchProducts();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(t.confirmBulkDelete.replace("{count}", String(selectedIds.size)))) return;

    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/products/${id}`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);
      setSelectedIds(new Set());
      void fetchProducts();
    } catch (err) {
      console.error("Failed to bulk delete products:", err);
    }
  };

  // Toggle visibility (isActive)
  const toggleVisibility = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isActive: !currentState } : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    }
  };

  // Toggle featured (pin)
  const toggleFeatured = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentState }),
      });
      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isFeatured: !currentState } : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  // Table columns
  const columns: Column<Product>[] = [
    {
      key: "select",
      header: "",
      width: "40px",
      render: (product) => (
        <button
          type="button"
          onClick={() => toggleSelect(product.id)}
          className={cn(
            "p-1 rounded transition-all",
            selectedIds.has(product.id)
              ? "text-amber-500"
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          {selectedIds.has(product.id) ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>
      ),
    },
    {
      key: "product",
      header: t.product,
      render: (product) => (
        <div className={cn(
          "flex items-center gap-3",
          !product.isActive && "opacity-60"
        )}>
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <Link
              href={`/${locale}/admin/ecommerce/produits/${product.id}`}
              className="font-medium text-gray-900 hover:text-amber-600 dark:text-white dark:hover:text-amber-400"
            >
              {product.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              {product.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <Star className="h-3 w-3 fill-current" />
                  {t.pinned}
                </span>
              )}
              {!product.isActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  <EyeOff className="h-3 w-3" />
                  {t.hidden}
                </span>
              )}
              {product.isNew && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {t.new}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      header: t.sku,
      render: (product) => (
        <span className="font-mono text-sm text-gray-500">{product.sku}</span>
      ),
    },
    {
      key: "category",
      header: t.category,
      render: (product) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {typeof product.category === 'object' && product.category !== null
            ? (product.category as any).name ?? "-"
            : product.category ?? "-"}
        </span>
      ),
    },
    {
      key: "price",
      header: t.price,
      align: "right",
      render: (product) => (
        <div className="text-right">
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="ml-2 text-sm text-gray-400 line-through">
              {formatCurrency(product.comparePrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: t.stock,
      align: "center",
      render: (product) => {
        const isLowStock = product.stockQty > 0 && product.stockQty <= product.lowStockQty;
        const isOutOfStock = product.stockQty === 0;

        return (
          <div className="text-center">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                isOutOfStock
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : isLowStock
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}
            >
              {isLowStock && <AlertTriangle className="h-3 w-3" />}
              {product.stockQty}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: t.status,
      render: (product) => (
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            product.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
          )}
        >
          {product.isActive ? t.published : t.draft}
        </span>
      ),
    },
    {
      key: "actions",
      header: t.actions,
      align: "center",
      render: (product) => (
        <div className="flex items-center justify-center gap-1">
          {/* Pin/Unpin */}
          <button
            type="button"
            onClick={() => toggleFeatured(product.id, product.isFeatured)}
            className={cn(
              "inline-flex items-center justify-center rounded-md h-8 w-8 transition-colors",
              product.isFeatured
                ? "text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            )}
            title={product.isFeatured ? t.unpin : t.pin}
          >
            {product.isFeatured ? (
              <Star className="h-4 w-4 fill-current" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </button>
          {/* Visibility */}
          <button
            type="button"
            onClick={() => toggleVisibility(product.id, product.isActive)}
            className={cn(
              "inline-flex items-center justify-center rounded-md h-8 w-8 transition-colors",
              product.isActive
                ? "text-green-500 hover:bg-green-50 hover:text-green-600"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            )}
            title={product.isActive ? t.hide : t.show}
          >
            {product.isActive ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
          {/* View Online */}
          <Link
            href={`/${locale}/boutique/${product.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
            title="View online"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          {/* Edit */}
          <Link
            href={`/${locale}/admin/ecommerce/produits/${product.id}`}
            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
            title={t.edit}
          >
            <Edit className="h-4 w-4" />
          </Link>
          {/* Delete */}
          <button
            type="button"
            onClick={() => handleDelete(product.id)}
            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <AdminButton variant="outline" size="sm" onClick={() => void fetchProducts()} icon={<RefreshCw className="w-4 h-4" />}>
            {t.refresh}
          </AdminButton>
          <AdminButton variant="export" size="sm" onClick={handleExport} icon={<Download className="w-4 h-4" />}>
            {t.export}
          </AdminButton>
          <Link href={`/${locale}/admin/ecommerce/produits/nouveau`}>
            <AdminButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              {t.addProduct}
            </AdminButton>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t.totalProducts}
          value={stats.total}
          icon="Package"
          variant="info"
        />
        <StatsCard
          title={t.activeProducts}
          value={stats.active}
          icon="Package"
          variant="success"
        />
        <StatsCard
          title={t.featuredProducts}
          value={stats.featured}
          icon="Package"
          variant="warning"
        />
        <StatsCard
          title={t.lowStockProducts}
          value={stats.lowStock}
          icon="Package"
          variant="danger"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 dark:border-gray-700">
        {[
          { value: "", label: t.all },
          { value: "active", label: t.active },
          { value: "inactive", label: t.inactive },
          { value: "featured", label: t.featured },
          { value: "lowStock", label: t.lowStock },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-center gap-4">
            <CheckSquare className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800 dark:text-amber-300">
              {t.selected.replace("{count}", String(selectedIds.size))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="outline"
              size="sm"
              onClick={clearSelection}
              icon={<XCircle className="w-4 h-4" />}
            >
              {t.clearSelection}
            </AdminButton>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={selectAll}
              icon={<CheckSquare className="w-4 h-4" />}
            >
              {t.selectAll}
            </AdminButton>
            <AdminButton
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              icon={<Trash2 className="w-4 h-4" />}
            >
              {t.deleteSelected}
            </AdminButton>
          </div>
        </div>
      )}

      {/* Data Table */}
      <AdminDataTable
        data={products}
        columns={columns}
        keyField="id"
        searchPlaceholder={t.searchPlaceholder}
        onSearch={setSearchQuery}
        loading={loading}
        emptyMessage={t.noProducts}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
        }}
        selectable
        bulkActions={[
          { value: "activate", label: "Activer" },
          { value: "deactivate", label: "Desactiver" },
          { value: "feature", label: "Mettre en vedette" },
          { value: "delete", label: "Supprimer" },
        ]}
        onBulkAction={(action, ids) => {
          console.log("Bulk action:", action, ids);
        }}
      />
    </div>
  );
}
