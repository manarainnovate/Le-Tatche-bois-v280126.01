"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Loader2,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ChecklistItem {
  id: string;
  item: string;
  checked: boolean;
  checkedAt?: string | null;
  notes?: string | null;
  order: number;
}

interface ProjectChecklistProps {
  projectId: string;
  items: ChecklistItem[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  addItem: string;
  noItems: string;
  noItemsDescription: string;
  itemPlaceholder: string;
  save: string;
  cancel: string;
  delete: string;
  confirmDelete: string;
  notes: string;
  notesPlaceholder: string;
  completed: string;
  pending: string;
  progress: string;
}

const translations: Record<string, Translations> = {
  fr: {
    addItem: "Ajouter un élément",
    noItems: "Aucun élément",
    noItemsDescription: "Ajoutez des éléments à vérifier pour le contrôle qualité",
    itemPlaceholder: "Ex: Portes alignées, Charnières OK...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    confirmDelete: "Confirmer la suppression ?",
    notes: "Notes",
    notesPlaceholder: "Ajouter une note...",
    completed: "Terminé",
    pending: "En attente",
    progress: "Progression",
  },
  en: {
    addItem: "Add item",
    noItems: "No items",
    noItemsDescription: "Add items to check for quality control",
    itemPlaceholder: "Ex: Doors aligned, Hinges OK...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Confirm deletion?",
    notes: "Notes",
    notesPlaceholder: "Add a note...",
    completed: "Completed",
    pending: "Pending",
    progress: "Progress",
  },
  es: {
    addItem: "Agregar elemento",
    noItems: "Sin elementos",
    noItemsDescription: "Agregue elementos para verificar el control de calidad",
    itemPlaceholder: "Ej: Puertas alineadas, Bisagras OK...",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    confirmDelete: "¿Confirmar eliminación?",
    notes: "Notas",
    notesPlaceholder: "Agregar una nota...",
    completed: "Completado",
    pending: "Pendiente",
    progress: "Progreso",
  },
  ar: {
    addItem: "إضافة عنصر",
    noItems: "لا عناصر",
    noItemsDescription: "أضف عناصر للتحقق من مراقبة الجودة",
    itemPlaceholder: "مثال: الأبواب مستقيمة، المفصلات سليمة...",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    confirmDelete: "تأكيد الحذف؟",
    notes: "ملاحظات",
    notesPlaceholder: "إضافة ملاحظة...",
    completed: "مكتمل",
    pending: "قيد الانتظار",
    progress: "التقدم",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectChecklist({
  projectId,
  items: initialItems,
  locale,
}: ProjectChecklistProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;

  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  // Calculate progress
  const total = items.length;
  const completed = items.filter((i) => i.checked).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/crm/projects/${projectId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: newItem }),
      });

      if (!response.ok) throw new Error("Failed to add item");

      const result = await response.json();
      setItems((prev) => [...prev, result.data]);
      setNewItem("");
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding checklist item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (itemId: string, checked: boolean) => {
    setUpdatingItemId(itemId);
    try {
      const response = await fetch(`/api/crm/projects/${projectId}/checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, checked }),
      });

      if (!response.ok) throw new Error("Failed to update item");

      const result = await response.json();
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? result.data : item))
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating checklist item:", error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleUpdateNotes = async (itemId: string) => {
    try {
      const response = await fetch(`/api/crm/projects/${projectId}/checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, notes: notesValue }),
      });

      if (!response.ok) throw new Error("Failed to update notes");

      const result = await response.json();
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? result.data : item))
      );
      setEditingNotesId(null);
      setNotesValue("");
      router.refresh();
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const response = await fetch(
        `/api/crm/projects/${projectId}/checklist?itemId=${itemId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete item");

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting checklist item:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.progress}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completed}/{total} ({progress}%)
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress === 100
                  ? "bg-green-500"
                  : progress >= 50
                  ? "bg-amber-500"
                  : "bg-blue-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Item Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.addItem}
        </button>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex gap-3"
        >
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={t.itemPlaceholder}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.save}
          </button>
        </form>
      )}

      {/* Checklist Items */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {t.noItems}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.noItemsDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg border p-4 group transition-colors",
                item.checked
                  ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(item.id, !item.checked)}
                  disabled={updatingItemId === item.id}
                  className="flex-shrink-0 mt-0.5"
                >
                  {updatingItemId === item.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : item.checked ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-medium",
                      item.checked
                        ? "text-gray-500 line-through"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {item.item}
                  </div>

                  {/* Notes */}
                  {editingNotesId === item.id ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        placeholder={t.notesPlaceholder}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateNotes(item.id)}
                        className="px-2 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700"
                      >
                        {t.save}
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotesId(null);
                          setNotesValue("");
                        }}
                        className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : item.notes ? (
                    <div
                      className="text-sm text-gray-500 dark:text-gray-400 mt-1 cursor-pointer hover:text-gray-700"
                      onClick={() => {
                        setEditingNotesId(item.id);
                        setNotesValue(item.notes || "");
                      }}
                    >
                      <MessageSquare className="h-3 w-3 inline mr-1" />
                      {item.notes}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNotesId(item.id);
                        setNotesValue("");
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      + {t.notes}
                    </button>
                  )}

                  {/* Checked timestamp */}
                  {item.checked && item.checkedAt && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {t.completed}: {formatDate(item.checkedAt)}
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectChecklist;
