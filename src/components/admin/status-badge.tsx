"use client";

import {
  FileEdit,
  CheckCircle,
  Send,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  BadgeCheck,
  XCircle,
  Package,
  Truck,
  PackageCheck,
  FileSignature,
  AlertTriangle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Status Configuration
// ═══════════════════════════════════════════════════════════

interface StatusConfig {
  label: string;
  labelEn: string;
  labelEs: string;
  labelAr: string;
  bg: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  DRAFT: {
    label: "Brouillon",
    labelEn: "Draft",
    labelEs: "Borrador",
    labelAr: "مسودة",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-300",
    icon: FileEdit,
  },
  CONFIRMED: {
    label: "Validé",
    labelEn: "Confirmed",
    labelEs: "Confirmado",
    labelAr: "مؤكد",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    icon: CheckCircle,
  },
  SENT: {
    label: "Envoyé",
    labelEn: "Sent",
    labelEs: "Enviado",
    labelAr: "مُرسل",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
    icon: Send,
  },
  VIEWED: {
    label: "Vu",
    labelEn: "Viewed",
    labelEs: "Visto",
    labelAr: "مشاهد",
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-300",
    icon: Eye,
  },
  ACCEPTED: {
    label: "Accepté",
    labelEn: "Accepted",
    labelEs: "Aceptado",
    labelAr: "مقبول",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: ThumbsUp,
  },
  REJECTED: {
    label: "Refusé",
    labelEn: "Rejected",
    labelEs: "Rechazado",
    labelAr: "مرفوض",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    icon: ThumbsDown,
  },
  PARTIAL: {
    label: "Partiel",
    labelEn: "Partial",
    labelEs: "Parcial",
    labelAr: "جزئي",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    icon: Clock,
  },
  DELIVERED: {
    label: "Livré",
    labelEn: "Delivered",
    labelEs: "Entregado",
    labelAr: "تم التسليم",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-300",
    icon: Truck,
  },
  SIGNED: {
    label: "Signé",
    labelEn: "Signed",
    labelEs: "Firmado",
    labelAr: "موقع",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    icon: FileSignature,
  },
  PAID: {
    label: "Payé",
    labelEn: "Paid",
    labelEs: "Pagado",
    labelAr: "مدفوع",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: BadgeCheck,
  },
  OVERDUE: {
    label: "En retard",
    labelEn: "Overdue",
    labelEs: "Vencido",
    labelAr: "متأخر",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    icon: AlertTriangle,
  },
  CANCELLED: {
    label: "Annulé",
    labelEn: "Cancelled",
    labelEs: "Cancelado",
    labelAr: "ملغى",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    icon: XCircle,
  },
};

// ═══════════════════════════════════════════════════════════
// StatusBadge Component
// ═══════════════════════════════════════════════════════════

interface StatusBadgeProps {
  status: string;
  locale?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  locale = "fr",
  size = "md",
  showIcon = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const Icon = config.icon;

  // Get label based on locale
  let label = config.label;
  if (locale === "en") label = config.labelEn;
  else if (locale === "es") label = config.labelEs;
  else if (locale === "ar") label = config.labelAr;

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
    lg: "px-4 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// Get Status Label (Helper)
// ═══════════════════════════════════════════════════════════

export function getStatusLabel(status: string, locale: string = "fr"): string {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  if (locale === "en") return config.labelEn;
  if (locale === "es") return config.labelEs;
  if (locale === "ar") return config.labelAr;
  return config.label;
}
