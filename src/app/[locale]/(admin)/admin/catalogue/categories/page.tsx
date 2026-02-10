"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Folder,
  Package,
  Wrench,
  AlertTriangle,
  Truck,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryTree, CategoryForm } from "@/components/catalog";
import type { Category } from "@/components/catalog";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface CategoriesPageProps {
  params: { locale: string };
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  categories: string;
  subtitle: string;
  addCategory: string;
  products: string;
  services: string;
  stock: string;
  suppliers: string;
  loading: string;
  confirmDelete: string;
  deleteError: string;
}

const translations: Record<string, Translations> = {
  fr: {
    categories: "Catégories",
    subtitle: "Organisez votre catalogue par catégories",
    addCategory: "Nouvelle catégorie",
    products: "Produits",
    services: "Services",
    stock: "Stock",
    suppliers: "Fournisseurs",
    loading: "Chargement...",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette catégorie ?",
    deleteError: "Impossible de supprimer cette catégorie",
  },
  en: {
    categories: "Categories",
    subtitle: "Organize your catalog by categories",
    addCategory: "New category",
    products: "Products",
    services: "Services",
    stock: "Stock",
    suppliers: "Suppliers",
    loading: "Loading...",
    confirmDelete: "Are you sure you want to delete this category?",
    deleteError: "Unable to delete this category",
  },
  es: {
    categories: "Categorías",
    subtitle: "Organice su catálogo por categorías",
    addCategory: "Nueva categoría",
    products: "Productos",
    services: "Servicios",
    stock: "Stock",
    suppliers: "Proveedores",
    loading: "Cargando...",
    confirmDelete: "¿Está seguro de que desea eliminar esta categoría?",
    deleteError: "No se puede eliminar esta categoría",
  },
  ar: {
    categories: "الفئات",
    subtitle: "نظم كتالوجك حسب الفئات",
    addCategory: "فئة جديدة",
    products: "المنتجات",
    services: "الخدمات",
    stock: "المخزون",
    suppliers: "الموردون",
    loading: "جارٍ التحميل...",
    confirmDelete: "هل أنت متأكد من حذف هذه الفئة؟",
    deleteError: "تعذر حذف هذه الفئة",
  },
};

// ═══════════════════════════════════════════════════════════
// Navigation Tabs
// ═══════════════════════════════════════════════════════════

const catalogTabs = [
  { id: "produits", icon: Package, labelKey: "products" as const },
  { id: "services", icon: Wrench, labelKey: "services" as const },
  { id: "categories", icon: Folder, labelKey: "categories" as const },
  { id: "stock", icon: AlertTriangle, labelKey: "stock" as const },
  { id: "fournisseurs", icon: Truck, labelKey: "suppliers" as const },
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export default function CategoriesPage({ params }: CategoriesPageProps) {
  const locale = params.locale ?? "fr";
  const t = translations[locale] ?? translations.fr;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch categories
  useEffect(() => {
    void fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/catalog/categories?active=false");
      if (response.ok) {
        const data = (await response.json()) as { data: Category[] };
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (parentCategoryId?: string) => {
    setEditCategory(null);
    setParentId(parentCategoryId ?? null);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setParentId(null);
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const response = await fetch(`/api/catalog/categories?id=${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        alert(error.error ?? t.deleteError);
        return;
      }

      void fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(t.deleteError);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditCategory(null);
    setParentId(null);
    void fetchCategories();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Folder className="h-7 w-7 text-amber-600" />
            {t.categories}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        <button
          onClick={() => handleAdd()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.addCategory}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 -mb-px">
          {catalogTabs.map(({ id, icon: Icon, labelKey }) => (
            <Link
              key={id}
              href={`/${locale}/admin/catalogue/${id}`}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                id === "categories"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {t[labelKey]}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Tree */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                <span className="ml-2 text-gray-500">{t.loading}</span>
              </div>
            ) : (
              <CategoryTree
                categories={categories}
                locale={locale}
                selectedId={selectedCategory?.id}
                onSelect={setSelectedCategory}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={(category) => void handleDelete(category)}
              />
            )}
          </div>
        </div>

        {/* Selected Category Details */}
        <div>
          {selectedCategory ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {selectedCategory.name}
              </h3>

              {selectedCategory.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {selectedCategory.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Slug:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {selectedCategory.slug}
                  </span>
                </div>
                {selectedCategory._count && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Articles:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedCategory._count.items}
                    </span>
                  </div>
                )}
                {selectedCategory._count?.children !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sous-catégories:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedCategory._count.children}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut:</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      selectedCategory.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {selectedCategory.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(selectedCategory)}
                  className="flex-1 px-3 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleAdd(selectedCategory.id)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  + Sous-catégorie
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
              <Folder className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sélectionnez une catégorie pour voir ses détails
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      <CategoryForm
        locale={locale}
        categories={categories}
        initialData={
          editCategory
            ? {
                id: editCategory.id,
                name: editCategory.name,
                slug: editCategory.slug,
                description: editCategory.description ?? undefined,
                icon: editCategory.icon ?? undefined,
                parentId: editCategory.parentId,
                order: editCategory.order,
                isActive: editCategory.isActive,
              }
            : undefined
        }
        parentId={parentId}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditCategory(null);
          setParentId(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
