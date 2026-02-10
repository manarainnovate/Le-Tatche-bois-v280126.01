"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Users,
  MessageSquare,
  StickyNote,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Activity {
  id: string;
  type: "CALL" | "WHATSAPP" | "EMAIL" | "VISIT" | "MEETING" | "NOTE";
  title: string;
  description?: string | null;
  outcome?: string | null;
  date: Date | string;
  duration?: number | null;
  nextAction?: string | null;
  createdAt: Date | string;
}

interface ActivityLogProps {
  activities: Activity[];
  locale: string;
  onAddActivity?: () => void;
  showAddButton?: boolean;
  maxItems?: number;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Activity Type Configuration
// ═══════════════════════════════════════════════════════════

const activityTypeConfig: Record<
  Activity["type"],
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  CALL: {
    icon: Phone,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  WHATSAPP: {
    icon: MessageSquare,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
  EMAIL: {
    icon: Mail,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  VISIT: {
    icon: MapPin,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  MEETING: {
    icon: Users,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
  },
  NOTE: {
    icon: StickyNote,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-200 dark:border-gray-700",
  },
};

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    activities: "Activités",
    noActivities: "Aucune activité",
    addActivity: "Ajouter une activité",
    showMore: "Voir plus",
    showLess: "Voir moins",
    outcome: "Résultat",
    nextAction: "Prochaine action",
    duration: "Durée",
    minutes: "min",
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
    today: "Aujourd'hui",
    yesterday: "Hier",
  },
  en: {
    activities: "Activities",
    noActivities: "No activities",
    addActivity: "Add activity",
    showMore: "Show more",
    showLess: "Show less",
    outcome: "Outcome",
    nextAction: "Next action",
    duration: "Duration",
    minutes: "min",
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
    today: "Today",
    yesterday: "Yesterday",
  },
  es: {
    activities: "Actividades",
    noActivities: "Sin actividades",
    addActivity: "Agregar actividad",
    showMore: "Ver más",
    showLess: "Ver menos",
    outcome: "Resultado",
    nextAction: "Próxima acción",
    duration: "Duración",
    minutes: "min",
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
    today: "Hoy",
    yesterday: "Ayer",
  },
  ar: {
    activities: "الأنشطة",
    noActivities: "لا توجد أنشطة",
    addActivity: "إضافة نشاط",
    showMore: "عرض المزيد",
    showLess: "عرض أقل",
    outcome: "النتيجة",
    nextAction: "الإجراء التالي",
    duration: "المدة",
    minutes: "دقيقة",
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
    today: "اليوم",
    yesterday: "أمس",
  },
};

// ═══════════════════════════════════════════════════════════
// Outcome Badge
// ═══════════════════════════════════════════════════════════

const outcomeColors: Record<string, string> = {
  POSITIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  NEGATIVE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  NEUTRAL: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ActivityLog({
  activities,
  locale,
  onAddActivity,
  showAddButton = true,
  maxItems = 5,
  className,
}: ActivityLogProps) {
  const [expanded, setExpanded] = useState(false);
  const t = translations[locale] || translations.fr;

  const displayedActivities = expanded
    ? activities
    : activities.slice(0, maxItems);
  const hasMore = activities.length > maxItems;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === now.toDateString()) {
      return t.today;
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return t.yesterday;
    }

    return d.toLocaleDateString(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString(locale === "ar" ? "ar-MA" : locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          {t.activities}
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
            {activities.length}
          </span>
        </h3>
        {showAddButton && onAddActivity && (
          <button
            type="button"
            onClick={onAddActivity}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.addActivity}
          </button>
        )}
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
          {t.noActivities}
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Activities */}
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => {
              const config = activityTypeConfig[activity.type];
              const Icon = config.icon;

              return (
                <div key={activity.id} className="relative flex gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      config.bgColor,
                      "border-2",
                      config.borderColor
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t[activity.type] || activity.type}
                          </span>
                          {activity.outcome && (
                            <span
                              className={cn(
                                "text-xs px-1.5 py-0.5 rounded-full",
                                outcomeColors[activity.outcome] || outcomeColors.NEUTRAL
                              )}
                            >
                              {t[activity.outcome] || activity.outcome}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mt-0.5">
                          {activity.title}
                        </h4>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.date)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {formatTime(activity.date)}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {activity.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {activity.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {activity.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.duration} {t.minutes}
                        </span>
                      )}
                      {activity.nextAction && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {activity.nextAction}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show More/Less */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1 w-full py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {t.showLess}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {t.showMore} ({activities.length - maxItems})
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default ActivityLog;
