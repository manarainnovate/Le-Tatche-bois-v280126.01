"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  location: string | null;
  leadId: string | null;
  lead: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
  assignedToId: string | null;
}

interface User {
  id: string;
  name: string | null;
  role: string;
}

interface Lead {
  id: string;
  fullName: string;
  phone: string;
  city: string | null;
}

interface CalendarPageClientProps {
  appointments: Appointment[];
  users: User[];
  leads: Lead[];
  locale: string;
  currentYear: number;
  currentMonth: number;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    title: "Rendez-vous",
    newAppointment: "Nouveau RDV",
    today: "Aujourd'hui",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    // Days
    sunday: "Dim",
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mer",
    thursday: "Jeu",
    friday: "Ven",
    saturday: "Sam",
    // Months
    january: "Janvier",
    february: "Février",
    march: "Mars",
    april: "Avril",
    may: "Mai",
    june: "Juin",
    july: "Juillet",
    august: "Août",
    september: "Septembre",
    october: "Octobre",
    november: "Novembre",
    december: "Décembre",
    // Types
    VISIT: "Visite client",
    MEASURE: "Prise de mesures",
    DELIVERY: "Livraison",
    INSTALLATION: "Pose",
    MEETING: "Réunion",
    FOLLOW_UP: "Suivi",
    // Statuses
    SCHEDULED: "Planifié",
    CONFIRMED: "Confirmé",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
    NO_SHOW: "Absent",
    // Form
    titleLabel: "Titre",
    typeLabel: "Type",
    dateLabel: "Date",
    timeLabel: "Heure",
    durationLabel: "Durée",
    locationLabel: "Lieu",
    leadLabel: "Lead associé",
    noLead: "Aucun",
    assignedLabel: "Assigné à",
    notesLabel: "Notes",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    hours: "heures",
    minutes: "minutes",
  },
  en: {
    title: "Appointments",
    newAppointment: "New Appointment",
    today: "Today",
    month: "Month",
    week: "Week",
    day: "Day",
    sunday: "Sun",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
    VISIT: "Client Visit",
    MEASURE: "Measurements",
    DELIVERY: "Delivery",
    INSTALLATION: "Installation",
    MEETING: "Meeting",
    FOLLOW_UP: "Follow-up",
    SCHEDULED: "Scheduled",
    CONFIRMED: "Confirmed",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    NO_SHOW: "No Show",
    titleLabel: "Title",
    typeLabel: "Type",
    dateLabel: "Date",
    timeLabel: "Time",
    durationLabel: "Duration",
    locationLabel: "Location",
    leadLabel: "Associated Lead",
    noLead: "None",
    assignedLabel: "Assigned to",
    notesLabel: "Notes",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    hours: "hours",
    minutes: "minutes",
  },
  es: {
    title: "Citas",
    newAppointment: "Nueva Cita",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    sunday: "Dom",
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    january: "Enero",
    february: "Febrero",
    march: "Marzo",
    april: "Abril",
    may: "Mayo",
    june: "Junio",
    july: "Julio",
    august: "Agosto",
    september: "Septiembre",
    october: "Octubre",
    november: "Noviembre",
    december: "Diciembre",
    VISIT: "Visita cliente",
    MEASURE: "Medidas",
    DELIVERY: "Entrega",
    INSTALLATION: "Instalación",
    MEETING: "Reunión",
    FOLLOW_UP: "Seguimiento",
    SCHEDULED: "Programada",
    CONFIRMED: "Confirmada",
    IN_PROGRESS: "En progreso",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    NO_SHOW: "No asistió",
    titleLabel: "Título",
    typeLabel: "Tipo",
    dateLabel: "Fecha",
    timeLabel: "Hora",
    durationLabel: "Duración",
    locationLabel: "Ubicación",
    leadLabel: "Lead asociado",
    noLead: "Ninguno",
    assignedLabel: "Asignado a",
    notesLabel: "Notas",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    hours: "horas",
    minutes: "minutos",
  },
  ar: {
    title: "المواعيد",
    newAppointment: "موعد جديد",
    today: "اليوم",
    month: "شهر",
    week: "أسبوع",
    day: "يوم",
    sunday: "أحد",
    monday: "إثنين",
    tuesday: "ثلاثاء",
    wednesday: "أربعاء",
    thursday: "خميس",
    friday: "جمعة",
    saturday: "سبت",
    january: "يناير",
    february: "فبراير",
    march: "مارس",
    april: "أبريل",
    may: "مايو",
    june: "يونيو",
    july: "يوليو",
    august: "أغسطس",
    september: "سبتمبر",
    october: "أكتوبر",
    november: "نوفمبر",
    december: "ديسمبر",
    VISIT: "زيارة عميل",
    MEASURE: "أخذ القياسات",
    DELIVERY: "تسليم",
    INSTALLATION: "تركيب",
    MEETING: "اجتماع",
    FOLLOW_UP: "متابعة",
    SCHEDULED: "مجدول",
    CONFIRMED: "مؤكد",
    IN_PROGRESS: "جاري",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
    NO_SHOW: "غائب",
    titleLabel: "العنوان",
    typeLabel: "النوع",
    dateLabel: "التاريخ",
    timeLabel: "الوقت",
    durationLabel: "المدة",
    locationLabel: "المكان",
    leadLabel: "العميل المحتمل",
    noLead: "لا يوجد",
    assignedLabel: "مسند إلى",
    notesLabel: "ملاحظات",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    hours: "ساعات",
    minutes: "دقائق",
  },
};

const monthNames = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const appointmentTypes = ["VISIT", "MEASURE", "DELIVERY", "INSTALLATION", "MEETING", "FOLLOW_UP"];

const typeColors: Record<string, string> = {
  VISIT: "bg-blue-500",
  MEASURE: "bg-green-500",
  DELIVERY: "bg-orange-500",
  INSTALLATION: "bg-red-500",
  MEETING: "bg-purple-500",
  FOLLOW_UP: "bg-gray-500",
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════

export function CalendarPageClient({
  appointments,
  users,
  leads,
  locale,
  currentYear,
  currentMonth,
}: CalendarPageClientProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isRTL = locale === "ar";

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "VISIT",
    date: "",
    time: "09:00",
    duration: 60,
    location: "",
    leadId: "",
    assignedToId: "",
    description: "",
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 2, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startDate).toISOString().split("T")[0];
      return aptDate === dateStr;
    });
  };

  // Navigation
  const goToPrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    router.push(`/${locale}/admin/crm/rendez-vous?year=${newYear}&month=${newMonth}`);
  };

  const goToNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    router.push(`/${locale}/admin/crm/rendez-vous?year=${newYear}&month=${newMonth}`);
  };

  const goToToday = () => {
    const now = new Date();
    router.push(`/${locale}/admin/crm/rendez-vous?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
  };

  // Open modal for new appointment
  const openNewModal = (date: Date) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
    setFormData({
      title: "",
      type: "VISIT",
      date: date.toISOString().split("T")[0],
      time: "09:00",
      duration: 60,
      location: "",
      leadId: "",
      assignedToId: "",
      description: "",
    });
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    const startDate = new Date(apt.startDate);
    setFormData({
      title: apt.title,
      type: apt.type,
      date: startDate.toISOString().split("T")[0],
      time: startDate.toTimeString().slice(0, 5),
      duration: apt.endDate
        ? Math.round((new Date(apt.endDate).getTime() - startDate.getTime()) / 60000)
        : 60,
      location: apt.location || "",
      leadId: apt.leadId || "",
      assignedToId: apt.assignedToId || "",
      description: apt.description || "",
    });
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const startDate = new Date(`${formData.date}T${formData.time}`);
    const endDate = new Date(startDate.getTime() + formData.duration * 60000);

    try {
      const url = selectedAppointment
        ? `/api/crm/appointments/${selectedAppointment.id}`
        : "/api/crm/appointments";
      const method = selectedAppointment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          location: formData.location || null,
          leadId: formData.leadId || null,
          assignedToId: formData.assignedToId || null,
          description: formData.description || null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(locale === "ar" ? "ar-MA" : "fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className={cn("space-y-6", isRTL && "rtl")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Calendar className="h-8 w-8 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
        </div>
        <Button onClick={() => openNewModal(new Date())}>
          <Plus className="h-4 w-4 mr-2" />
          {t.newAppointment}
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            {t.today}
          </Button>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t[monthNames[currentMonth - 1]]} {currentYear}
        </h2>
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            {appointmentTypes.slice(0, 4).map((type) => (
              <div key={type} className="flex items-center gap-1">
                <span className={cn("w-3 h-3 rounded-full", typeColors[type])} />
                <span className="text-gray-500">{t[type]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          {dayNames.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase"
            >
              {t[day]}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day.date);
            const dateIsToday = isToday(day.date);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] border-b border-r border-gray-200 dark:border-gray-700 p-1",
                  !day.isCurrentMonth && "bg-gray-50 dark:bg-gray-800/30",
                  index % 7 === 6 && "border-r-0"
                )}
              >
                <button
                  type="button"
                  onClick={() => openNewModal(day.date)}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center text-sm rounded-full mb-1 transition-colors",
                    dateIsToday
                      ? "bg-amber-600 text-white font-bold"
                      : day.isCurrentMonth
                        ? "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        : "text-gray-400"
                  )}
                >
                  {day.date.getDate()}
                </button>

                {/* Appointments */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(apt);
                      }}
                      className={cn(
                        "w-full text-left px-1.5 py-0.5 rounded text-xs text-white truncate",
                        typeColors[apt.type] || "bg-gray-500"
                      )}
                    >
                      {formatTime(apt.startDate)} {apt.title}
                    </button>
                  ))}
                  {dayAppointments.length > 3 && (
                    <p className="text-xs text-gray-500 px-1">
                      +{dayAppointments.length - 3} plus
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedAppointment ? "Modifier RDV" : t.newAppointment}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.titleLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.typeLabel}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                >
                  {appointmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {t[type]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.dateLabel} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.timeLabel} *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.durationLabel}
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value={30}>30 {t.minutes}</option>
                  <option value={60}>1 {t.hours}</option>
                  <option value={90}>1.5 {t.hours}</option>
                  <option value={120}>2 {t.hours}</option>
                  <option value={180}>3 {t.hours}</option>
                  <option value={240}>4 {t.hours}</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.locationLabel}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              {/* Lead */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.leadLabel}
                </label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="">{t.noLead}</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.fullName} - {lead.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.assignedLabel}
                </label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="">-</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.notesLabel}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t.cancel}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-1" />
                  {t.save}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
