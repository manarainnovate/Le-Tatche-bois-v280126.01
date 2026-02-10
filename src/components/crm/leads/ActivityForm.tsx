"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Users,
  MessageSquare,
  StickyNote,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type ActivityType = "CALL" | "WHATSAPP" | "EMAIL" | "VISIT" | "MEETING" | "NOTE";
type ActivityOutcome = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "PENDING";

interface ActivityFormData {
  type: ActivityType;
  title: string;
  description?: string;
  outcome?: ActivityOutcome;
  duration?: number;
  nextAction?: string;
  date?: string;
}

interface ActivityFormProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  leadId?: string;
  clientId?: string;
}

// ═══════════════════════════════════════════════════════════
// Activity Type Configuration
// ═══════════════════════════════════════════════════════════

const activityTypes: {
  id: ActivityType;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { id: "CALL", icon: Phone, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  { id: "WHATSAPP", icon: MessageSquare, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  { id: "EMAIL", icon: Mail, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
  { id: "VISIT", icon: MapPin, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  { id: "MEETING", icon: Users, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
  { id: "NOTE", icon: StickyNote, color: "text-gray-600 bg-gray-100 dark:bg-gray-800" },
];

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    addActivity: "Ajouter une activité",
    type: "Type d'activité",
    title: "Titre",
    titlePlaceholder: "Ex: Appel de suivi",
    description: "Description",
    descriptionPlaceholder: "Notes sur l'activité...",
    outcome: "Résultat",
    duration: "Durée (minutes)",
    nextAction: "Prochaine action",
    nextActionPlaceholder: "Ex: Envoyer le devis",
    date: "Date",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    CALL: "Appel",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    VISIT: "Visite",
    MEETING: "Réunion",
    NOTE: "Note",
    POSITIVE: "Positif",
    NEGATIVE: "Négatif",
    NEUTRAL: "Neutre",
    PENDING: "En attente",
  },
  en: {
    addActivity: "Add activity",
    type: "Activity type",
    title: "Title",
    titlePlaceholder: "E.g., Follow-up call",
    description: "Description",
    descriptionPlaceholder: "Notes about the activity...",
    outcome: "Outcome",
    duration: "Duration (minutes)",
    nextAction: "Next action",
    nextActionPlaceholder: "E.g., Send quote",
    date: "Date",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    CALL: "Call",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    VISIT: "Visit",
    MEETING: "Meeting",
    NOTE: "Note",
    POSITIVE: "Positive",
    NEGATIVE: "Negative",
    NEUTRAL: "Neutral",
    PENDING: "Pending",
  },
  es: {
    addActivity: "Agregar actividad",
    type: "Tipo de actividad",
    title: "Título",
    titlePlaceholder: "Ej: Llamada de seguimiento",
    description: "Descripción",
    descriptionPlaceholder: "Notas sobre la actividad...",
    outcome: "Resultado",
    duration: "Duración (minutos)",
    nextAction: "Próxima acción",
    nextActionPlaceholder: "Ej: Enviar presupuesto",
    date: "Fecha",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    CALL: "Llamada",
    WHATSAPP: "WhatsApp",
    EMAIL: "Correo",
    VISIT: "Visita",
    MEETING: "Reunión",
    NOTE: "Nota",
    POSITIVE: "Positivo",
    NEGATIVE: "Negativo",
    NEUTRAL: "Neutral",
    PENDING: "Pendiente",
  },
  ar: {
    addActivity: "إضافة نشاط",
    type: "نوع النشاط",
    title: "العنوان",
    titlePlaceholder: "مثال: مكالمة متابعة",
    description: "الوصف",
    descriptionPlaceholder: "ملاحظات حول النشاط...",
    outcome: "النتيجة",
    duration: "المدة (دقائق)",
    nextAction: "الإجراء التالي",
    nextActionPlaceholder: "مثال: إرسال عرض السعر",
    date: "التاريخ",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    CALL: "مكالمة",
    WHATSAPP: "واتساب",
    EMAIL: "بريد إلكتروني",
    VISIT: "زيارة",
    MEETING: "اجتماع",
    NOTE: "ملاحظة",
    POSITIVE: "إيجابي",
    NEGATIVE: "سلبي",
    NEUTRAL: "محايد",
    PENDING: "قيد الانتظار",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ActivityForm({
  locale,
  isOpen,
  onClose,
  onSubmit,
}: ActivityFormProps) {
  const t = translations[locale] || translations.fr;

  const [formData, setFormData] = useState<ActivityFormData>({
    type: "CALL",
    title: "",
    description: "",
    outcome: undefined,
    duration: undefined,
    nextAction: "",
    date: new Date().toISOString().slice(0, 16),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        type: "CALL",
        title: "",
        description: "",
        outcome: undefined,
        duration: undefined,
        nextAction: "",
        date: new Date().toISOString().slice(0, 16),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.addActivity}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Activity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.type}
              </label>
              <div className="flex flex-wrap gap-2">
                {activityTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: type.id }))
                      }
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        formData.type === type.id
                          ? cn(type.color, "ring-2 ring-offset-2 ring-amber-500")
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t[type.id]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.title} *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={t.titlePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.description}
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t.descriptionPlaceholder}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.outcome}
              </label>
              <div className="flex gap-2">
                {(["POSITIVE", "NEGATIVE", "NEUTRAL", "PENDING"] as const).map(
                  (outcome) => (
                    <button
                      key={outcome}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          outcome: prev.outcome === outcome ? undefined : outcome,
                        }))
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        formData.outcome === outcome
                          ? outcome === "POSITIVE"
                            ? "bg-green-100 text-green-700 ring-2 ring-green-500"
                            : outcome === "NEGATIVE"
                              ? "bg-red-100 text-red-700 ring-2 ring-red-500"
                              : outcome === "NEUTRAL"
                                ? "bg-gray-100 text-gray-700 ring-2 ring-gray-500"
                                : "bg-amber-100 text-amber-700 ring-2 ring-amber-500"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      )}
                    >
                      {t[outcome]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Duration & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t.duration}
                </label>
                <input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t.date}
                </label>
                <input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Next Action */}
            <div>
              <label
                htmlFor="nextAction"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.nextAction}
              </label>
              <input
                id="nextAction"
                type="text"
                value={formData.nextAction}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nextAction: e.target.value }))
                }
                placeholder={t.nextActionPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  t.save
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ActivityForm;
