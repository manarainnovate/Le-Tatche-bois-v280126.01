"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Folder,
  Plus,
  Loader2,
  Briefcase,
  Package,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CategoryItem, type CategoryData } from "@/components/admin/CategoryItem";
import { CategoryForm, type CategoryTranslations } from "@/components/admin/CategoryForm";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Categories",
    subtitle: "Gerez vos categories par type",
    projects: "Projets",
    products: "Produits",
    services: "Services",
    addCategory: "Ajouter une categorie",
    editCategory: "Modifier la categorie",
    name: "Nom",
    slug: "Slug",
    slugPlaceholder: "ma-categorie",
    parentCategory: "Categorie parente",
    noParent: "Aucune (categorie principale)",
    description: "Description",
    save: "Enregistrer",
    saving: "Enregistrement...",
    cancel: "Annuler",
    translations: "Traductions",
    edit: "Modifier les traductions",
    delete: "Supprimer",
    items: "elements",
    confirmDelete: "Etes-vous sur de vouloir supprimer cette categorie ?",
    cannotDelete: "Impossible de supprimer: cette categorie contient des elements.",
    noCategories: "Aucune categorie",
    noCategoriesDesc: "Creez votre premiere categorie pour commencer",
    dragToReorder: "Glissez pour reordonner les categories",
  },
  en: {
    title: "Categories",
    subtitle: "Manage your categories by type",
    projects: "Projects",
    products: "Products",
    services: "Services",
    addCategory: "Add Category",
    editCategory: "Edit Category",
    name: "Name",
    slug: "Slug",
    slugPlaceholder: "my-category",
    parentCategory: "Parent Category",
    noParent: "None (root category)",
    description: "Description",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    translations: "Translations",
    edit: "Edit Translations",
    delete: "Delete",
    items: "items",
    confirmDelete: "Are you sure you want to delete this category?",
    cannotDelete: "Cannot delete: this category contains items.",
    noCategories: "No categories",
    noCategoriesDesc: "Create your first category to get started",
    dragToReorder: "Drag to reorder categories",
  },
  es: {
    title: "Categorias",
    subtitle: "Gestiona tus categorias por tipo",
    projects: "Proyectos",
    products: "Productos",
    services: "Servicios",
    addCategory: "Agregar Categoria",
    editCategory: "Editar Categoria",
    name: "Nombre",
    slug: "Slug",
    slugPlaceholder: "mi-categoria",
    parentCategory: "Categoria Padre",
    noParent: "Ninguna (categoria raiz)",
    description: "Descripcion",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    translations: "Traducciones",
    edit: "Editar Traducciones",
    delete: "Eliminar",
    items: "elementos",
    confirmDelete: "Esta seguro de eliminar esta categoria?",
    cannotDelete: "No se puede eliminar: esta categoria contiene elementos.",
    noCategories: "Sin categorias",
    noCategoriesDesc: "Crea tu primera categoria para empezar",
    dragToReorder: "Arrastra para reordenar las categorias",
  },
  ar: {
    title: "الفئات",
    subtitle: "إدارة الفئات حسب النوع",
    projects: "المشاريع",
    products: "المنتجات",
    services: "الخدمات",
    addCategory: "إضافة فئة",
    editCategory: "تعديل الفئة",
    name: "الاسم",
    slug: "الرابط",
    slugPlaceholder: "الفئة-الخاصة-بي",
    parentCategory: "الفئة الأم",
    noParent: "لا شيء (فئة رئيسية)",
    description: "الوصف",
    save: "حفظ",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    translations: "الترجمات",
    edit: "تعديل الترجمات",
    delete: "حذف",
    items: "عناصر",
    confirmDelete: "هل أنت متأكد من حذف هذه الفئة؟",
    cannotDelete: "لا يمكن الحذف: هذه الفئة تحتوي على عناصر.",
    noCategories: "لا توجد فئات",
    noCategoriesDesc: "أنشئ أول فئة للبدء",
    dragToReorder: "اسحب لإعادة ترتيب الفئات",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type CategoryType = "PROJECT" | "PRODUCT" | "SERVICE";

interface CategoriesResponse {
  categories: CategoryData[];
}

interface CategoryFormData {
  slug: string;
  parentId: string | null;
  translations: CategoryTranslations;
}

// ═══════════════════════════════════════════════════════════
// Categories Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string };
}

export default function CategoriesPage({ params }: PageProps) {
  const { locale } = params;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [activeType, setActiveType] = useState<CategoryType>("PROJECT");
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/categories?type=${activeType}`);
      if (response.ok) {
        const data = (await response.json()) as CategoriesResponse;
        setCategories(data.categories ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Build tree structure
  const buildTree = (items: CategoryData[], parentId: string | null = null): CategoryData[] => {
    return items
      .filter(() => {
        // For now, treat all as root level since parentId might not be in the data
        return !parentId;
      })
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const categoryTree = buildTree(categories);

  // Handle edit
  const handleEdit = (category: CategoryData) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        void fetchCategories();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  // Handle inline name change
  const handleNameChange = async (categoryId: string, name: string) => {
    try {
      await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          translations: { [locale]: { name } },
        }),
      });
      void fetchCategories();
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  // Handle save
  const handleSave = async (data: CategoryFormData) => {
    const url = editingCategory
      ? `/api/categories/${editingCategory.id}`
      : "/api/categories";
    const method = editingCategory ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        type: activeType,
      }),
    });

    setShowForm(false);
    setEditingCategory(null);
    void fetchCategories();
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  // Drag handlers
  const handleDragStart = (categoryId: string, _index: number) => {
    setDraggedId(categoryId);
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (draggedId !== categoryId) {
      setDragOverId(categoryId);
    }
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Find indices
    const draggedIndex = categories.findIndex((c) => c.id === draggedId);
    const targetIndex = categories.findIndex((c) => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder locally
    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedIndex];
    if (!draggedCategory) return;

    newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, draggedCategory);

    // Update sortOrder
    const updatedCategories = newCategories.map((c, i) => ({ ...c, sortOrder: i }));
    setCategories(updatedCategories);

    setDraggedId(null);
    setDragOverId(null);

    // Save to server
    try {
      await fetch("/api/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeType,
          order: updatedCategories.map((c) => ({ id: c.id, sortOrder: c.sortOrder })),
        }),
      });
    } catch (error) {
      console.error("Failed to save order:", error);
      void fetchCategories(); // Revert on error
    }
  };

  const tabs = [
    { type: "PROJECT" as const, label: t.projects, icon: Briefcase },
    { type: "PRODUCT" as const, label: t.products, icon: Package },
    { type: "SERVICE" as const, label: t.services, icon: Wrench },
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
        <Button onClick={() => setShowForm(true)}>
          <Plus className="me-2 h-4 w-4" />
          {t.addCategory}
        </Button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.type;

          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => setActiveType(tab.type)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-b-2 border-amber-500 text-amber-600 dark:text-amber-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t.dragToReorder}
      </p>

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : categoryTree.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {categoryTree.map((category, index) => (
            <CategoryItem
              key={category.id}
              category={category}
              locale={locale}
              onEdit={handleEdit}
              onDelete={(id) => void handleDelete(id)}
              onNameChange={handleNameChange}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={(id) => void handleDrop(id)}
              isDragging={draggedId === category.id}
              isDragOver={dragOverId === category.id}
              index={index}
              translations={{
                edit: t.edit,
                delete: t.delete,
                items: t.items,
                confirmDelete: t.confirmDelete,
                cannotDelete: t.cannotDelete,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <Folder className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {t.noCategories}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t.noCategoriesDesc}
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            <Plus className="me-2 h-4 w-4" />
            {t.addCategory}
          </Button>
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={
            editingCategory
              ? {
                  id: editingCategory.id,
                  slug: editingCategory.slug,
                  parentId: null,
                  translations: editingCategory.translations.map((t) => ({
                    name: t.name,
                    description: null,
                    locale: t.locale,
                  })),
                }
              : undefined
          }
          parentCategories={categories.map((c) => ({
            id: c.id,
            translations: c.translations,
          }))}
          categoryType={activeType}
          locale={locale}
          onSave={handleSave}
          onClose={handleCloseForm}
          translations={{
            addCategory: t.addCategory,
            editCategory: t.editCategory,
            name: t.name,
            slug: t.slug,
            slugPlaceholder: t.slugPlaceholder,
            parentCategory: t.parentCategory,
            noParent: t.noParent,
            description: t.description,
            save: t.save,
            saving: t.saving,
            cancel: t.cancel,
            translations: t.translations,
          }}
        />
      )}
    </div>
  );
}
