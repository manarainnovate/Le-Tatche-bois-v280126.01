"use client";

import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Phone,
  Users,
  MapPin,
  Clock,
  Truck,
  Calendar,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type AppointmentType = "CALL" | "MEETING" | "VISIT" | "FOLLOW_UP" | "DELIVERY" | "OTHER";

interface AppointmentFormData {
  title: string;
  description?: string;
  type: AppointmentType;
  startDate: string;
  endDate?: string;
  location?: string;
  leadId?: string;
  clientId?: string;
  projectId?: string;
  reminder?: number;
  notes?: string;
}

interface Lead {
  id: string;
  leadNumber: string;
  contactName: string;
}

interface Client {
  id: string;
  clientNumber: string;
  name: string;
}

interface AppointmentFormProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  initialDate?: Date;
  leads?: Lead[];
  clients?: Client[];
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    newAppointment: "Nouveau rendez-vous",
    title: "Titre",
    titlePlaceholder: "Ex: Réunion de suivi",
    description: "Description",
    descriptionPlaceholder: "Détails du rendez-vous...",
    type: "Type",
    startDate: "Date et heure de début",
    endDate: "Date et heure de fin",
    location: "Lieu",
    locationPlaceholder: "Adresse ou lieu de rendez-vous",
    link: "Lier à",
    selectLead: "Sélectionner un lead",
    selectClient: "Sélectionner un client",
    reminder: "Rappel",
    noReminder: "Pas de rappel",
    min15: "15 minutes avant",
    min30: "30 minutes avant",
    hour1: "1 heure avant",
    day1: "1 jour avant",
    notes: "Notes",
    notesPlaceholder: "Notes internes...",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    CALL: "Appel",
    MEETING: "Réunion",
    VISIT: "Visite",
    FOLLOW_UP: "Suivi",
    DELIVERY: "Livraison",
    OTHER: "Autre",
    lead: "Lead",
    client: "Client",
  },
  en: {
    newAppointment: "New Appointment",
    title: "Title",
    titlePlaceholder: "E.g., Follow-up meeting",
    description: "Description",
    descriptionPlaceholder: "Appointment details...",
    type: "Type",
    startDate: "Start date and time",
    endDate: "End date and time",
    location: "Location",
    locationPlaceholder: "Address or meeting place",
    link: "Link to",
    selectLead: "Select a lead",
    selectClient: "Select a client",
    reminder: "Reminder",
    noReminder: "No reminder",
    min15: "15 minutes before",
    min30: "30 minutes before",
    hour1: "1 hour before",
    day1: "1 day before",
    notes: "Notes",
    notesPlaceholder: "Internal notes...",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    CALL: "Call",
    MEETING: "Meeting",
    VISIT: "Visit",
    FOLLOW_UP: "Follow-up",
    DELIVERY: "Delivery",
    OTHER: "Other",
    lead: "Lead",
    client: "Client",
  },
  es: {
    newAppointment: "Nueva Cita",
    title: "Título",
    titlePlaceholder: "Ej: Reunión de seguimiento",
    description: "Descripción",
    descriptionPlaceholder: "Detalles de la cita...",
    type: "Tipo",
    startDate: "Fecha y hora de inicio",
    endDate: "Fecha y hora de fin",
    location: "Ubicación",
    locationPlaceholder: "Dirección o lugar de encuentro",
    link: "Vincular a",
    selectLead: "Seleccionar prospecto",
    selectClient: "Seleccionar cliente",
    reminder: "Recordatorio",
    noReminder: "Sin recordatorio",
    min15: "15 minutos antes",
    min30: "30 minutos antes",
    hour1: "1 hora antes",
    day1: "1 día antes",
    notes: "Notas",
    notesPlaceholder: "Notas internas...",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    CALL: "Llamada",
    MEETING: "Reunión",
    VISIT: "Visita",
    FOLLOW_UP: "Seguimiento",
    DELIVERY: "Entrega",
    OTHER: "Otro",
    lead: "Prospecto",
    client: "Cliente",
  },
  ar: {
    newAppointment: "موعد جديد",
    title: "العنوان",
    titlePlaceholder: "مثال: اجتماع متابعة",
    description: "الوصف",
    descriptionPlaceholder: "تفاصيل الموعد...",
    type: "النوع",
    startDate: "تاريخ ووقت البداية",
    endDate: "تاريخ ووقت النهاية",
    location: "الموقع",
    locationPlaceholder: "العنوان أو مكان اللقاء",
    link: "ربط بـ",
    selectLead: "اختر عميل محتمل",
    selectClient: "اختر عميل",
    reminder: "تذكير",
    noReminder: "بدون تذكير",
    min15: "قبل 15 دقيقة",
    min30: "قبل 30 دقيقة",
    hour1: "قبل ساعة",
    day1: "قبل يوم",
    notes: "ملاحظات",
    notesPlaceholder: "ملاحظات داخلية...",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    CALL: "مكالمة",
    MEETING: "اجتماع",
    VISIT: "زيارة",
    FOLLOW_UP: "متابعة",
    DELIVERY: "توصيل",
    OTHER: "آخر",
    lead: "عميل محتمل",
    client: "عميل",
  },
};

// ═══════════════════════════════════════════════════════════
// Type Configuration
// ═══════════════════════════════════════════════════════════

const appointmentTypes: {
  id: AppointmentType;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { id: "CALL", icon: Phone, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  { id: "MEETING", icon: Users, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
  { id: "VISIT", icon: MapPin, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  { id: "FOLLOW_UP", icon: Clock, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
  { id: "DELIVERY", icon: Truck, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  { id: "OTHER", icon: Calendar, color: "text-gray-600 bg-gray-100 dark:bg-gray-800" },
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function AppointmentForm({
  locale,
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  leads = [],
  clients = [],
}: AppointmentFormProps) {
  const t = translations[locale] || translations.fr;

  const getInitialDate = () => {
    const date = initialDate || new Date();
    // Round to next hour
    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() + 1);
    return date.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<AppointmentFormData>({
    title: "",
    description: "",
    type: "MEETING",
    startDate: getInitialDate(),
    endDate: "",
    location: "",
    leadId: "",
    clientId: "",
    reminder: 30,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<"lead" | "client">("client");

  useEffect(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      date.setMinutes(0, 0, 0);
      date.setHours(date.getHours() + 1);
      setFormData((prev) => ({
        ...prev,
        startDate: date.toISOString().slice(0, 16),
      }));
    }
  }, [initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.leadId && !formData.clientId) {
      setError("Please select a lead or client");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        title: "",
        description: "",
        type: "MEETING",
        startDate: getInitialDate(),
        endDate: "",
        location: "",
        leadId: "",
        clientId: "",
        reminder: 30,
        notes: "",
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
      <div className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-500 to-amber-600">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t.newAppointment}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.type}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {appointmentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: type.id }))
                      }
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all",
                        formData.type === type.id
                          ? cn(type.color, "ring-2 ring-offset-2 ring-amber-500")
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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

            {/* Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t.startDate} *
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t.endDate}
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.location}
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder={t.locationPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Link to Lead/Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.link}
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setLinkType("lead");
                    setFormData((prev) => ({ ...prev, clientId: "" }));
                  }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    linkType === "lead"
                      ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {t.lead}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkType("client");
                    setFormData((prev) => ({ ...prev, leadId: "" }));
                  }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    linkType === "client"
                      ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {t.client}
                </button>
              </div>

              {linkType === "lead" ? (
                <select
                  value={formData.leadId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, leadId: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">{t.selectLead}</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.leadNumber} - {lead.contactName}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientId: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">{t.selectClient}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.clientNumber} - {client.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Reminder */}
            <div>
              <label
                htmlFor="reminder"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.reminder}
              </label>
              <select
                id="reminder"
                value={formData.reminder || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reminder: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">{t.noReminder}</option>
                <option value="15">{t.min15}</option>
                <option value="30">{t.min30}</option>
                <option value="60">{t.hour1}</option>
                <option value="1440">{t.day1}</option>
              </select>
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
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder={t.descriptionPlaceholder}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
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

export default AppointmentForm;
