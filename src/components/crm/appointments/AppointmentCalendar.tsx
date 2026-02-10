"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  Users,
  MapPin,
  Clock,
  Truck,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Appointment {
  id: string;
  title: string;
  description?: string | null;
  type: "CALL" | "MEETING" | "VISIT" | "FOLLOW_UP" | "DELIVERY" | "OTHER";
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  startDate: Date | string;
  endDate?: Date | string | null;
  location?: string | null;
  lead?: {
    id: string;
    leadNumber: string;
    contactName: string;
  } | null;
  client?: {
    id: string;
    clientNumber: string;
    name: string;
  } | null;
  project?: {
    id: string;
    projectNumber: string;
    name: string;
  } | null;
  assignedTo?: {
    id: string;
    name: string;
  } | null;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  locale: string;
  onDateClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onAddAppointment?: () => void;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    today: "Aujourd'hui",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    addAppointment: "Nouveau RDV",
    noAppointments: "Aucun rendez-vous",
    CALL: "Appel",
    MEETING: "Réunion",
    VISIT: "Visite",
    FOLLOW_UP: "Suivi",
    DELIVERY: "Livraison",
    OTHER: "Autre",
    SCHEDULED: "Planifié",
    CONFIRMED: "Confirmé",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
    NO_SHOW: "Absent",
  },
  en: {
    today: "Today",
    month: "Month",
    week: "Week",
    day: "Day",
    addAppointment: "New Appointment",
    noAppointments: "No appointments",
    CALL: "Call",
    MEETING: "Meeting",
    VISIT: "Visit",
    FOLLOW_UP: "Follow-up",
    DELIVERY: "Delivery",
    OTHER: "Other",
    SCHEDULED: "Scheduled",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    NO_SHOW: "No Show",
  },
  es: {
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    addAppointment: "Nueva Cita",
    noAppointments: "Sin citas",
    CALL: "Llamada",
    MEETING: "Reunión",
    VISIT: "Visita",
    FOLLOW_UP: "Seguimiento",
    DELIVERY: "Entrega",
    OTHER: "Otro",
    SCHEDULED: "Programado",
    CONFIRMED: "Confirmado",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
    NO_SHOW: "No Presentado",
  },
  ar: {
    today: "اليوم",
    month: "شهر",
    week: "أسبوع",
    day: "يوم",
    addAppointment: "موعد جديد",
    noAppointments: "لا توجد مواعيد",
    CALL: "مكالمة",
    MEETING: "اجتماع",
    VISIT: "زيارة",
    FOLLOW_UP: "متابعة",
    DELIVERY: "توصيل",
    OTHER: "آخر",
    SCHEDULED: "مجدول",
    CONFIRMED: "مؤكد",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغى",
    NO_SHOW: "لم يحضر",
  },
};

const WEEKDAYS = {
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  ar: ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
};

const MONTHS = {
  fr: [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  es: [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ],
  ar: [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ],
};

// ═══════════════════════════════════════════════════════════
// Type Configuration
// ═══════════════════════════════════════════════════════════

const typeConfig: Record<
  Appointment["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  CALL: { icon: Phone, color: "bg-blue-500" },
  MEETING: { icon: Users, color: "bg-purple-500" },
  VISIT: { icon: MapPin, color: "bg-amber-500" },
  FOLLOW_UP: { icon: Clock, color: "bg-cyan-500" },
  DELIVERY: { icon: Truck, color: "bg-green-500" },
  OTHER: { icon: Calendar, color: "bg-gray-500" },
};

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the day of week of the first day (0 = Sunday, 1 = Monday, etc.)
  let startDayOfWeek = firstDay.getDay();
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Add days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(year, month, -i);
    days.push(day);
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function AppointmentCalendar({
  appointments,
  locale,
  onDateClick,
  onAppointmentClick,
  onAddAppointment,
}: AppointmentCalendarProps) {
  const t = translations[locale] || translations.fr;
  const weekdays = WEEKDAYS[locale as keyof typeof WEEKDAYS] || WEEKDAYS.fr;
  const months = MONTHS[locale as keyof typeof MONTHS] || MONTHS.fr;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();

  const days = useMemo(() => {
    return getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach((apt) => {
      const dateKey = new Date(apt.startDate).toISOString().split("T")[0];
      if (dateKey) {
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(apt);
      }
    });
    return grouped;
  }, [appointments]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString(locale === "ar" ? "ar-MA" : locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate
    ? appointmentsByDate[selectedDate.toISOString().split("T")[0] || ""] || []
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar */}
      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
              >
                {t.today}
              </button>
              {onAddAppointment && (
                <button
                  type="button"
                  onClick={onAddAppointment}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t.addAppointment}
                </button>
              )}
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {weekdays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dateKey = day.toISOString().split("T")[0] || "";
              const dayAppointments = appointmentsByDate[dateKey] || [];
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "relative min-h-[100px] p-1 border-b border-r border-gray-200 dark:border-gray-700 text-left transition-colors",
                    !isCurrentMonth && "bg-gray-50 dark:bg-gray-900/30",
                    isSelected && "bg-amber-50 dark:bg-amber-900/20",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  )}
                >
                  {/* Date Number */}
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                      isToday
                        ? "bg-amber-600 text-white font-bold"
                        : isCurrentMonth
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {day.getDate()}
                  </span>

                  {/* Appointments */}
                  <div className="mt-1 space-y-0.5">
                    {dayAppointments.slice(0, 3).map((apt) => {
                      const config = typeConfig[apt.type];
                      return (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(apt);
                          }}
                          className={cn(
                            "text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80",
                            config.color
                          )}
                        >
                          {formatTime(apt.startDate)} {apt.title}
                        </div>
                      );
                    })}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                        +{dayAppointments.length - 3}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      <div className="lg:w-80">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {selectedDate
              ? selectedDate.toLocaleDateString(locale === "ar" ? "ar-MA" : locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : t.today}
          </h3>

          {selectedDateAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-sm">{t.noAppointments}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments.map((apt) => {
                const config = typeConfig[apt.type];
                const Icon = config.icon;

                return (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => onAppointmentClick?.(apt)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-1.5 rounded", config.color)}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {apt.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(apt.startDate)}
                          {apt.endDate && ` - ${formatTime(apt.endDate)}`}
                        </p>
                        {(apt.client || apt.lead) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {apt.client?.name || apt.lead?.contactName}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentCalendar;
