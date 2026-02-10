"use client";

import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Order Status Types
// ═══════════════════════════════════════════════════════════

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// ═══════════════════════════════════════════════════════════
// Status Styles
// ═══════════════════════════════════════════════════════════

const statusStyles: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  PENDING: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  CONFIRMED: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  PROCESSING: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  SHIPPED: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  DELIVERED: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  CANCELLED: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
};

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const statusTranslations = {
  fr: {
    PENDING: "En attente",
    CONFIRMED: "Confirme",
    PROCESSING: "En cours",
    SHIPPED: "Expedie",
    DELIVERED: "Livre",
    CANCELLED: "Annule",
  },
  en: {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  },
  es: {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PROCESSING: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  },
  ar: {
    PENDING: "قيد الانتظار",
    CONFIRMED: "مؤكد",
    PROCESSING: "قيد المعالجة",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغى",
  },
};

// ═══════════════════════════════════════════════════════════
// Order Status Badge Component
// ═══════════════════════════════════════════════════════════

interface OrderStatusBadgeProps {
  status: OrderStatus;
  locale?: string;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function OrderStatusBadge({
  status,
  locale = "fr",
  showDot = true,
  size = "md",
  className,
}: OrderStatusBadgeProps) {
  const style = statusStyles[status] ?? statusStyles.PENDING;
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

// ═══════════════════════════════════════════════════════════
// Get Status Color (for charts, etc.)
// ═══════════════════════════════════════════════════════════

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    PENDING: "#eab308",
    CONFIRMED: "#3b82f6",
    PROCESSING: "#f97316",
    SHIPPED: "#a855f7",
    DELIVERED: "#22c55e",
    CANCELLED: "#ef4444",
  };
  return colors[status] ?? "#6b7280";
}

// ═══════════════════════════════════════════════════════════
// Get All Statuses
// ═══════════════════════════════════════════════════════════

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function getOrderStatusLabel(status: OrderStatus, locale: string = "fr"): string {
  const translations = statusTranslations[locale as keyof typeof statusTranslations] ?? statusTranslations.fr;
  return translations[status] ?? status;
}
