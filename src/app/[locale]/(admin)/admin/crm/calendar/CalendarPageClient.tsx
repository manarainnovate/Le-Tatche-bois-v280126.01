"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import {
  AppointmentCalendar,
  AppointmentForm,
  Appointment,
} from "@/components/crm/appointments";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

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

interface CalendarPageClientProps {
  initialAppointments: Appointment[];
  leads: Lead[];
  clients: Client[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  calendar: string;
  subtitle: string;
}

const translations: Record<string, Translations> = {
  fr: {
    calendar: "Calendrier",
    subtitle: "Gérez vos rendez-vous et suivis",
  },
  en: {
    calendar: "Calendar",
    subtitle: "Manage your appointments and follow-ups",
  },
  es: {
    calendar: "Calendario",
    subtitle: "Gestione sus citas y seguimientos",
  },
  ar: {
    calendar: "التقويم",
    subtitle: "إدارة مواعيدك ومتابعاتك",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function CalendarPageClient({
  initialAppointments,
  leads,
  clients,
  locale,
}: CalendarPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    // Navigate to appointment detail or open modal
    router.push(`/${locale}/admin/crm/appointments/${appointment.id}`);
  };

  const handleAddAppointment = async (data: {
    title: string;
    description?: string;
    type: string;
    startDate: string;
    endDate?: string;
    location?: string;
    leadId?: string;
    clientId?: string;
    reminder?: number;
    notes?: string;
  }) => {
    const response = await fetch("/api/crm/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create appointment");
    }

    const result = await response.json();

    // Add to local state
    setAppointments((prev) => [...prev, result.data]);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="h-7 w-7 text-amber-600" />
          {t.calendar}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Calendar */}
      <AppointmentCalendar
        appointments={appointments}
        locale={locale}
        onDateClick={handleDateClick}
        onAppointmentClick={handleAppointmentClick}
        onAddAppointment={() => setShowForm(true)}
      />

      {/* Add Appointment Form */}
      <AppointmentForm
        locale={locale}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedDate(undefined);
        }}
        onSubmit={handleAddAppointment}
        initialDate={selectedDate}
        leads={leads}
        clients={clients}
      />
    </div>
  );
}
