"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, es, ar } from "date-fns/locale";
import { FileText, User, Calendar, DollarSign, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface QuoteData {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  serviceType: string | null;
  serviceName: string | null;
  budget: string | null;
  status: string;
  createdAt: Date;
}

interface QuoteCardProps {
  quote: QuoteData;
  locale: string;
  isDragging?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Date Locales
// ═══════════════════════════════════════════════════════════

const dateLocales = { fr, en: enUS, es, ar };

// ═══════════════════════════════════════════════════════════
// Quote Card Component
// ═══════════════════════════════════════════════════════════

export function QuoteCard({ quote, locale, isDragging, className }: QuoteCardProps) {
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? fr;

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
  };

  return (
    <Link
      href={`/${locale}/admin/devis/${quote.id}`}
      className={cn(
        "block rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800",
        isDragging ? "border-amber-500 shadow-lg" : "border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-600" />
          <span className="font-semibold text-gray-900 dark:text-white">
            {quote.reference}
          </span>
        </div>
      </div>

      {/* Customer */}
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <User className="h-3.5 w-3.5" />
        <span className="truncate">{quote.customerName}</span>
      </div>

      {/* Service */}
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Wrench className="h-3.5 w-3.5" />
        <span className="truncate">{quote.serviceName ?? quote.serviceType ?? "Service"}</span>
      </div>

      {/* Budget */}
      {quote.budget && (
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <DollarSign className="h-3.5 w-3.5" />
          <span>{quote.budget}</span>
        </div>
      )}

      {/* Date */}
      <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-700">
        <Calendar className="h-3 w-3" />
        <span>{formatTime(quote.createdAt)}</span>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════
// Quote Status Badge
// ═══════════════════════════════════════════════════════════

export type QuoteStatus = "NEW" | "CONTACTED" | "IN_PROGRESS" | "SENT" | "WON" | "LOST" | "CANCELLED";

const statusStyles: Record<QuoteStatus, { bg: string; text: string; dot: string }> = {
  NEW: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  CONTACTED: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  IN_PROGRESS: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  SENT: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  WON: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  LOST: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  CANCELLED: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-700 dark:text-gray-400",
    dot: "bg-gray-500",
  },
};

const statusTranslations = {
  fr: {
    NEW: "Nouveau",
    CONTACTED: "Contacte",
    IN_PROGRESS: "En cours",
    SENT: "Envoye",
    WON: "Accepte",
    LOST: "Refuse",
    CANCELLED: "Annule",
  },
  en: {
    NEW: "New",
    CONTACTED: "Contacted",
    IN_PROGRESS: "In Progress",
    SENT: "Sent",
    WON: "Won",
    LOST: "Lost",
    CANCELLED: "Cancelled",
  },
  es: {
    NEW: "Nuevo",
    CONTACTED: "Contactado",
    IN_PROGRESS: "En progreso",
    SENT: "Enviado",
    WON: "Ganado",
    LOST: "Perdido",
    CANCELLED: "Cancelado",
  },
  ar: {
    NEW: "جديد",
    CONTACTED: "تم الاتصال",
    IN_PROGRESS: "قيد التنفيذ",
    SENT: "مرسل",
    WON: "مقبول",
    LOST: "مرفوض",
    CANCELLED: "ملغى",
  },
};

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  locale?: string;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function QuoteStatusBadge({
  status,
  locale = "fr",
  showDot = true,
  size = "md",
  className,
}: QuoteStatusBadgeProps) {
  const style = statusStyles[status] ?? statusStyles.NEW;
  const translations = statusTranslations[locale as keyof typeof statusTranslations] ?? statusTranslations.fr;
  const label = translations[status] ?? status;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        style.bg,
        style.text,
        sizeClasses[size],
        className
      )}
    >
      {showDot && <span className={cn("rounded-full", style.dot, dotSizes[size])} />}
      {label}
    </span>
  );
}

export const QUOTE_STATUSES: QuoteStatus[] = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "SENT",
  "WON",
  "LOST",
  "CANCELLED",
];

export function getQuoteStatusLabel(status: QuoteStatus, locale: string = "fr"): string {
  const translations = statusTranslations[locale as keyof typeof statusTranslations] ?? statusTranslations.fr;
  return translations[status] ?? status;
}

export function getQuoteStatusColor(status: QuoteStatus): string {
  const colors: Record<QuoteStatus, string> = {
    NEW: "#eab308",
    CONTACTED: "#3b82f6",
    IN_PROGRESS: "#f97316",
    SENT: "#a855f7",
    WON: "#22c55e",
    LOST: "#ef4444",
    CANCELLED: "#6b7280",
  };
  return colors[status] ?? "#6b7280";
}
