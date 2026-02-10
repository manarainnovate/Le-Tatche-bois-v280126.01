"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Banknote } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Payment Status Types
// ═══════════════════════════════════════════════════════════

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "STRIPE" | "COD";

// ═══════════════════════════════════════════════════════════
// Payment Status Styles
// ═══════════════════════════════════════════════════════════

const paymentStatusStyles: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  PENDING: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  PAID: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  FAILED: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  REFUNDED: {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-700 dark:text-gray-300",
    dot: "bg-gray-500",
  },
};

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const paymentStatusTranslations = {
  fr: {
    PENDING: "En attente",
    PAID: "Paye",
    FAILED: "Echoue",
    REFUNDED: "Rembourse",
  },
  en: {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
  },
  es: {
    PENDING: "Pendiente",
    PAID: "Pagado",
    FAILED: "Fallido",
    REFUNDED: "Reembolsado",
  },
  ar: {
    PENDING: "قيد الانتظار",
    PAID: "مدفوع",
    FAILED: "فشل",
    REFUNDED: "مسترد",
  },
};

const paymentMethodTranslations = {
  fr: {
    STRIPE: "Carte bancaire",
    COD: "A la livraison",
  },
  en: {
    STRIPE: "Credit Card",
    COD: "Cash on Delivery",
  },
  es: {
    STRIPE: "Tarjeta de credito",
    COD: "Contra reembolso",
  },
  ar: {
    STRIPE: "بطاقة ائتمان",
    COD: "الدفع عند الاستلام",
  },
};

// ═══════════════════════════════════════════════════════════
// Payment Status Badge Component
// ═══════════════════════════════════════════════════════════

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  locale?: string;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PaymentStatusBadge({
  status,
  locale = "fr",
  showDot = true,
  size = "md",
  className,
}: PaymentStatusBadgeProps) {
  const style = paymentStatusStyles[status] ?? paymentStatusStyles.PENDING;
  const translations = paymentStatusTranslations[locale as keyof typeof paymentStatusTranslations] ?? paymentStatusTranslations.fr;
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
// Payment Method Badge Component
// ═══════════════════════════════════════════════════════════

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  locale?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PaymentMethodBadge({
  method,
  locale = "fr",
  showIcon = true,
  size = "md",
  className,
}: PaymentMethodBadgeProps) {
  const translations = paymentMethodTranslations[locale as keyof typeof paymentMethodTranslations] ?? paymentMethodTranslations.fr;
  const label = translations[method] ?? method;

  const isStripe = method === "STRIPE";
  const Icon = isStripe ? CreditCard : Banknote;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        isStripe
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// Get Status Color
// ═══════════════════════════════════════════════════════════

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    PENDING: "#eab308",
    PAID: "#22c55e",
    FAILED: "#ef4444",
    REFUNDED: "#6b7280",
  };
  return colors[status] ?? "#6b7280";
}

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

export const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED"];
export const PAYMENT_METHODS: PaymentMethod[] = ["STRIPE", "COD"];

export function getPaymentStatusLabel(status: PaymentStatus, locale: string = "fr"): string {
  const translations = paymentStatusTranslations[locale as keyof typeof paymentStatusTranslations] ?? paymentStatusTranslations.fr;
  return translations[status] ?? status;
}

export function getPaymentMethodLabel(method: PaymentMethod, locale: string = "fr"): string {
  const translations = paymentMethodTranslations[locale as keyof typeof paymentMethodTranslations] ?? paymentMethodTranslations.fr;
  return translations[method] ?? method;
}
