"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  MoreHorizontal,
  Building2,
  User,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadStatusBadge } from "./LeadStatusBadge";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Lead {
  id: string;
  leadNumber: string;
  contactName: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  status: string;
  source: string;
  urgency: string;
  estimatedBudget?: number | null;
  projectType?: string | null;
  nextFollowUp?: Date | string | null;
  createdAt: Date | string;
  _count?: {
    activities: number;
    appointments: number;
  };
}

interface LeadCardProps {
  lead: Lead;
  locale: string;
  onClick?: () => void;
  onMenuClick?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Urgency Configuration
// ═══════════════════════════════════════════════════════════

const urgencyConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  HAUTE: {
    color: "text-red-500",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  MOYENNE: {
    color: "text-amber-500",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  BASSE: {
    color: "text-gray-400",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    budget: "Budget estimé",
    nextFollowUp: "Prochain suivi",
    activities: "activités",
    appointments: "RDV",
  },
  en: {
    budget: "Estimated budget",
    nextFollowUp: "Next follow-up",
    activities: "activities",
    appointments: "appointments",
  },
  es: {
    budget: "Presupuesto estimado",
    nextFollowUp: "Próximo seguimiento",
    activities: "actividades",
    appointments: "citas",
  },
  ar: {
    budget: "الميزانية المقدرة",
    nextFollowUp: "المتابعة القادمة",
    activities: "أنشطة",
    appointments: "مواعيد",
  },
};

// ═══════════════════════════════════════════════════════════
// Lead Card Component (Draggable)
// ═══════════════════════════════════════════════════════════

export function LeadCard({
  lead,
  locale,
  onClick,
  onMenuClick,
  isDragging: externalDragging,
}: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const t = translations[locale] || translations.fr;
  const urgency = urgencyConfig[lead.urgency] || urgencyConfig.BASSE;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isOverdue =
    lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
        "p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all",
        (isDragging || externalDragging) && "opacity-50 shadow-lg rotate-2",
        "hover:border-amber-300 dark:hover:border-amber-600"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {lead.leadNumber}
            </span>
            <span className={cn("flex items-center", urgency.color)}>
              {urgency.icon}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white truncate mt-0.5">
            {lead.contactName}
          </h4>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick?.(e);
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Company */}
      {lead.company && (
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-2">
          <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{lead.company}</span>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Phone className="h-3 w-3" />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Mail className="h-3 w-3" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.city && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="h-3 w-3" />
            <span>{lead.city}</span>
          </div>
        )}
      </div>

      {/* Budget */}
      {lead.estimatedBudget && (
        <div className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-3">
          {formatCurrency(lead.estimatedBudget)}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        {/* Next Follow-up */}
        {lead.nextFollowUp && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue
                ? "text-red-500"
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            <Calendar className="h-3 w-3" />
            <span>{formatDate(lead.nextFollowUp)}</span>
          </div>
        )}

        {/* Activity Count */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {lead._count?.activities !== undefined && lead._count.activities > 0 && (
            <span className="flex items-center gap-0.5">
              <User className="h-3 w-3" />
              {lead._count.activities}
            </span>
          )}
          {lead._count?.appointments !== undefined && lead._count.appointments > 0 && (
            <span className="flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />
              {lead._count.appointments}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Simple Lead Card (Non-draggable for list view)
// ═══════════════════════════════════════════════════════════

export function LeadCardSimple({
  lead,
  locale,
  onClick,
}: Omit<LeadCardProps, "isDragging" | "onMenuClick">) {
  const t = translations[locale] || translations.fr;
  const urgency = urgencyConfig[lead.urgency] || urgencyConfig.BASSE;

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
        "p-4 cursor-pointer hover:shadow-md transition-all",
        "hover:border-amber-300 dark:hover:border-amber-600"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-mono">
              {lead.leadNumber}
            </span>
            <LeadStatusBadge
              status={lead.status as Parameters<typeof LeadStatusBadge>[0]["status"]}
              size="sm"
              locale={locale}
            />
            <span className={cn("flex items-center", urgency.color)}>
              {urgency.icon}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            {lead.contactName}
          </h4>
          {lead.company && (
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-0.5">
              <Building2 className="h-3.5 w-3.5" />
              {lead.company}
            </p>
          )}
        </div>

        {/* Right */}
        <div className="text-right">
          {lead.estimatedBudget && (
            <div className="text-sm font-medium text-amber-600">
              {formatCurrency(lead.estimatedBudget)}
            </div>
          )}
          {lead.nextFollowUp && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
              <Calendar className="h-3 w-3" />
              {formatDate(lead.nextFollowUp)}
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        {lead.phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {lead.phone}
          </span>
        )}
        {lead.email && (
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {lead.email}
          </span>
        )}
        {lead.city && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {lead.city}
          </span>
        )}
      </div>
    </div>
  );
}

export default LeadCard;
