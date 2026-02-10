"use client";

import { useState } from "react";
import {
  GripVertical,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface CategoryData {
  id: string;
  slug: string;
  sortOrder: number;
  translations: { name: string; locale: string }[];
  children?: CategoryData[];
  _count?: { projects?: number; products?: number; services?: number };
}

interface CategoryItemProps {
  category: CategoryData;
  locale: string;
  level?: number;
  onEdit: (category: CategoryData) => void;
  onDelete: (categoryId: string) => void;
  onNameChange: (categoryId: string, name: string) => Promise<void>;
  onDragStart: (categoryId: string, index: number) => void;
  onDragOver: (e: React.DragEvent, categoryId: string) => void;
  onDrop: (categoryId: string) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  index: number;
  translations: {
    edit: string;
    delete: string;
    items: string;
    confirmDelete: string;
    cannotDelete: string;
  };
}

// ═══════════════════════════════════════════════════════════
// Category Item Component
// ═══════════════════════════════════════════════════════════

export function CategoryItem({
  category,
  locale,
  level = 0,
  onEdit,
  onDelete,
  onNameChange,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
  index,
  translations: t,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasChildren = category.children && category.children.length > 0;

  // Get category name for current locale
  const getName = () => {
    const trans = category.translations.find((t) => t.locale === locale) ?? category.translations[0];
    return trans?.name ?? category.slug;
  };

  // Get item count
  const getItemCount = () => {
    if (!category._count) return 0;
    return (category._count.projects ?? 0) + (category._count.products ?? 0) + (category._count.services ?? 0);
  };

  // Handle inline edit start
  const handleEditStart = () => {
    setEditValue(getName());
    setIsEditing(true);
  };

  // Handle inline edit save
  const handleEditSave = async () => {
    if (!editValue.trim() || editValue === getName()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onNameChange(category.id, editValue.trim());
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    const itemCount = getItemCount();
    if (itemCount > 0) {
      alert(t.cannotDelete);
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(category.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div>
      {/* Category Row */}
      <div
        draggable
        onDragStart={() => onDragStart(category.id, index)}
        onDragOver={(e) => onDragOver(e, category.id)}
        onDrop={() => onDrop(category.id)}
        className={cn(
          "flex items-center gap-2 border-b border-gray-100 px-4 py-3 transition-colors dark:border-gray-700",
          isDragging && "opacity-50",
          isDragOver && "bg-amber-50 dark:bg-amber-900/20"
        )}
        style={{ paddingInlineStart: `${level * 24 + 16}px` }}
      >
        {/* Drag Handle */}
        <button
          type="button"
          className="cursor-move rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Icon */}
        {hasChildren && isExpanded ? (
          <FolderOpen className="h-4 w-4 text-amber-600" />
        ) : (
          <Folder className="h-4 w-4 text-gray-400" />
        )}

        {/* Name */}
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                className="w-full max-w-xs rounded border border-amber-500 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 dark:bg-gray-800"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleEditSave();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <button
                type="button"
                onClick={() => void handleEditSave()}
                disabled={isSaving}
                className="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span
              className="cursor-text text-sm font-medium text-gray-900 dark:text-white"
              onDoubleClick={handleEditStart}
            >
              {getName()}
            </span>
          )}
        </div>

        {/* Slug */}
        <span className="font-mono text-xs text-gray-400">{category.slug}</span>

        {/* Item Count */}
        <span className="min-w-[80px] text-end text-sm text-gray-500">
          {getItemCount()} {t.items}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-700"
            title={t.edit}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20"
            title={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && category.children && (
        <div>
          {category.children.map((child, childIndex) => (
            <CategoryItem
              key={child.id}
              category={child}
              locale={locale}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onNameChange={onNameChange}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              index={childIndex}
              translations={t}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t.delete}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{t.confirmDelete}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
