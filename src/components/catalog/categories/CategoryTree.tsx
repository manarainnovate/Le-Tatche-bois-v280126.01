"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  children?: Category[];
  _count?: {
    items: number;
    children?: number;
  };
}

interface CategoryTreeProps {
  categories: Category[];
  locale: string;
  selectedId?: string | null;
  onSelect?: (category: Category) => void;
  onAdd?: (parentId?: string) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  showActions?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  addCategory: string;
  addSubcategory: string;
  edit: string;
  delete: string;
  items: string;
  noCategories: string;
}

const translations: Record<string, Translations> = {
  fr: {
    addCategory: "Ajouter une catégorie",
    addSubcategory: "Ajouter une sous-catégorie",
    edit: "Modifier",
    delete: "Supprimer",
    items: "articles",
    noCategories: "Aucune catégorie",
  },
  en: {
    addCategory: "Add category",
    addSubcategory: "Add subcategory",
    edit: "Edit",
    delete: "Delete",
    items: "items",
    noCategories: "No categories",
  },
  es: {
    addCategory: "Agregar categoría",
    addSubcategory: "Agregar subcategoría",
    edit: "Editar",
    delete: "Eliminar",
    items: "artículos",
    noCategories: "Sin categorías",
  },
  ar: {
    addCategory: "إضافة فئة",
    addSubcategory: "إضافة فئة فرعية",
    edit: "تعديل",
    delete: "حذف",
    items: "عناصر",
    noCategories: "لا فئات",
  },
};

// ═══════════════════════════════════════════════════════════
// Tree Item Component
// ═══════════════════════════════════════════════════════════

interface TreeItemProps {
  category: Category;
  level: number;
  locale: string;
  selectedId?: string | null;
  onSelect?: (category: Category) => void;
  onAdd?: (parentId?: string) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  showActions: boolean;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}

function TreeItem({
  category,
  level,
  locale,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  showActions,
  expandedIds,
  toggleExpand,
}: TreeItemProps) {
  const t = translations[locale] || translations.fr;
  const [showMenu, setShowMenu] = useState(false);

  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isSelected = selectedId === category.id;
  const itemCount = category._count?.items || 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-colors",
          isSelected
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100"
            : "hover:bg-gray-100 dark:hover:bg-gray-800",
          !category.isActive && "opacity-50"
        )}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => onSelect?.(category)}
      >
        {/* Expand Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(category.id);
          }}
          className={cn(
            "p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
            !hasChildren && "invisible"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {/* Folder Icon */}
        {isExpanded && hasChildren ? (
          <FolderOpen className="h-4 w-4 text-amber-500 flex-shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-amber-500 flex-shrink-0" />
        )}

        {/* Name */}
        <span className="flex-1 truncate text-sm font-medium">
          {category.name}
        </span>

        {/* Item Count */}
        {itemCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Package className="h-3 w-3" />
            {itemCount}
          </span>
        )}

        {/* Actions */}
        {showActions && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd?.(category.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Plus className="h-4 w-4" />
                    {t.addSubcategory}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(category);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                    {t.edit}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(category);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t.delete}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {category.children!.map((child) => (
            <TreeItem
              key={child.id}
              category={child}
              level={level + 1}
              locale={locale}
              selectedId={selectedId}
              onSelect={onSelect}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════

export function CategoryTree({
  categories,
  locale,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  showActions = true,
}: CategoryTreeProps) {
  const t = translations[locale] || translations.fr;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Folder className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p>{t.noCategories}</p>
        {onAdd && (
          <button
            onClick={() => onAdd()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t.addCategory}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Add Root Category Button */}
      {showActions && onAdd && (
        <button
          onClick={() => onAdd()}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.addCategory}
        </button>
      )}

      {/* Tree */}
      {categories.map((category) => (
        <TreeItem
          key={category.id}
          category={category}
          level={0}
          locale={locale}
          selectedId={selectedId}
          onSelect={onSelect}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
}

export default CategoryTree;
