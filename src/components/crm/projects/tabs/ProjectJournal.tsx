"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface JournalEntry {
  id: string;
  date: string;
  title?: string | null;
  content: string;
}

interface ProjectJournalProps {
  projectId: string;
  entries: JournalEntry[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  addEntry: string;
  noEntries: string;
  noEntriesDescription: string;
  title: string;
  titlePlaceholder: string;
  content: string;
  contentPlaceholder: string;
  date: string;
  save: string;
  cancel: string;
  delete: string;
  confirmDelete: string;
}

const translations: Record<string, Translations> = {
  fr: {
    addEntry: "Ajouter une entrée",
    noEntries: "Aucune entrée",
    noEntriesDescription: "Ajoutez des entrées au journal pour documenter l'avancement",
    title: "Titre (optionnel)",
    titlePlaceholder: "Titre de l'entrée",
    content: "Contenu",
    contentPlaceholder: "Décrivez l'avancement, les observations...",
    date: "Date",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    confirmDelete: "Confirmer la suppression ?",
  },
  en: {
    addEntry: "Add entry",
    noEntries: "No entries",
    noEntriesDescription: "Add journal entries to document progress",
    title: "Title (optional)",
    titlePlaceholder: "Entry title",
    content: "Content",
    contentPlaceholder: "Describe progress, observations...",
    date: "Date",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Confirm deletion?",
  },
  es: {
    addEntry: "Agregar entrada",
    noEntries: "Sin entradas",
    noEntriesDescription: "Agregue entradas al diario para documentar el progreso",
    title: "Título (opcional)",
    titlePlaceholder: "Título de la entrada",
    content: "Contenido",
    contentPlaceholder: "Describa el progreso, observaciones...",
    date: "Fecha",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    confirmDelete: "¿Confirmar eliminación?",
  },
  ar: {
    addEntry: "إضافة إدخال",
    noEntries: "لا إدخالات",
    noEntriesDescription: "أضف إدخالات للتوثيق التقدم",
    title: "العنوان (اختياري)",
    titlePlaceholder: "عنوان الإدخال",
    content: "المحتوى",
    contentPlaceholder: "صف التقدم، الملاحظات...",
    date: "التاريخ",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    confirmDelete: "تأكيد الحذف؟",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectJournal({
  projectId,
  entries: initialEntries,
  locale,
}: ProjectJournalProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;

  const [entries, setEntries] = useState(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/crm/projects/${projectId}/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create entry");

      const result = await response.json();
      setEntries((prev) => [result.data, ...prev]);
      setFormData({
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating journal entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const response = await fetch(
        `/api/crm/projects/${projectId}/journal?entryId=${entryId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete entry");

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const dateKey = new Date(entry.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <div className="space-y-6">
      {/* Add Entry Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.addEntry}
        </button>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.title}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={t.titlePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.date}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.content} *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder={t.contentPlaceholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3">
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
          </div>
        </form>
      )}

      {/* Journal Entries */}
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {t.noEntries}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.noEntriesDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([dateKey, dayEntries]) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {formatDate(dayEntries[0].date)}
                </h4>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Day Entries */}
              <div className="space-y-4 ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-6">
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {entry.title && (
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            {entry.title}
                          </h5>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {entry.content}
                        </p>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                          {formatTime(entry.date)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectJournal;
