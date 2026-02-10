"use client";

import {
  FileText,
  ShoppingCart,
  Truck,
  ClipboardCheck,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type DocumentType =
  | "DEVIS"
  | "BON_COMMANDE"
  | "BON_LIVRAISON"
  | "PV_RECEPTION"
  | "FACTURE"
  | "AVOIR";

interface DocumentTypeBadgeProps {
  type: DocumentType;
  locale: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "badge" | "pill" | "text";
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const typeTranslations: Record<string, Record<DocumentType, string>> = {
  fr: {
    DEVIS: "Devis",
    BON_COMMANDE: "Bon de Commande",
    BON_LIVRAISON: "Bon de Livraison",
    PV_RECEPTION: "PV Réception",
    FACTURE: "Facture",
    AVOIR: "Avoir",
  },
  en: {
    DEVIS: "Quote",
    BON_COMMANDE: "Purchase Order",
    BON_LIVRAISON: "Delivery Note",
    PV_RECEPTION: "Acceptance Report",
    FACTURE: "Invoice",
    AVOIR: "Credit Note",
  },
  es: {
    DEVIS: "Presupuesto",
    BON_COMMANDE: "Orden de Compra",
    BON_LIVRAISON: "Nota de Entrega",
    PV_RECEPTION: "Acta de Recepción",
    FACTURE: "Factura",
    AVOIR: "Nota de Crédito",
  },
  ar: {
    DEVIS: "عرض سعر",
    BON_COMMANDE: "أمر شراء",
    BON_LIVRAISON: "إشعار تسليم",
    PV_RECEPTION: "محضر استلام",
    FACTURE: "فاتورة",
    AVOIR: "إشعار دائن",
  },
};

const typeShortTranslations: Record<string, Record<DocumentType, string>> = {
  fr: {
    DEVIS: "D",
    BON_COMMANDE: "BC",
    BON_LIVRAISON: "BL",
    PV_RECEPTION: "PV",
    FACTURE: "F",
    AVOIR: "A",
  },
  en: {
    DEVIS: "Q",
    BON_COMMANDE: "PO",
    BON_LIVRAISON: "DN",
    PV_RECEPTION: "AR",
    FACTURE: "INV",
    AVOIR: "CN",
  },
  es: {
    DEVIS: "P",
    BON_COMMANDE: "OC",
    BON_LIVRAISON: "NE",
    PV_RECEPTION: "AR",
    FACTURE: "F",
    AVOIR: "NC",
  },
  ar: {
    DEVIS: "ع",
    BON_COMMANDE: "ش",
    BON_LIVRAISON: "ت",
    PV_RECEPTION: "م",
    FACTURE: "ف",
    AVOIR: "د",
  },
};

// ═══════════════════════════════════════════════════════════
// Type Styles & Icons
// ═══════════════════════════════════════════════════════════

const typeConfig: Record<
  DocumentType,
  {
    icon: typeof FileText;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  DEVIS: {
    icon: FileText,
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-300 dark:border-amber-600",
  },
  BON_COMMANDE: {
    icon: ShoppingCart,
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
    textClass: "text-blue-700 dark:text-blue-400",
    borderClass: "border-blue-300 dark:border-blue-600",
  },
  BON_LIVRAISON: {
    icon: Truck,
    bgClass: "bg-cyan-100 dark:bg-cyan-900/30",
    textClass: "text-cyan-700 dark:text-cyan-400",
    borderClass: "border-cyan-300 dark:border-cyan-600",
  },
  PV_RECEPTION: {
    icon: ClipboardCheck,
    bgClass: "bg-purple-100 dark:bg-purple-900/30",
    textClass: "text-purple-700 dark:text-purple-400",
    borderClass: "border-purple-300 dark:border-purple-600",
  },
  FACTURE: {
    icon: Receipt,
    bgClass: "bg-green-100 dark:bg-green-900/30",
    textClass: "text-green-700 dark:text-green-400",
    borderClass: "border-green-300 dark:border-green-600",
  },
  AVOIR: {
    icon: RotateCcw,
    bgClass: "bg-rose-100 dark:bg-rose-900/30",
    textClass: "text-rose-700 dark:text-rose-400",
    borderClass: "border-rose-300 dark:border-rose-600",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function DocumentTypeBadge({
  type,
  locale,
  size = "md",
  showIcon = true,
  variant = "badge",
}: DocumentTypeBadgeProps) {
  const config = typeConfig[type];
  const translations = typeTranslations[locale] || typeTranslations.fr;
  const shortTranslations = typeShortTranslations[locale] || typeShortTranslations.fr;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  if (variant === "text") {
    return (
      <span className={cn("inline-flex items-center gap-1 font-medium", config.textClass)}>
        {showIcon && <Icon className={iconSizes[size]} />}
        {translations[type]}
      </span>
    );
  }

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center font-bold rounded-full",
          config.bgClass,
          config.textClass,
          size === "sm" ? "w-6 h-6 text-xs" : size === "md" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"
        )}
        title={translations[type]}
      >
        {shortTranslations[type]}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border",
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {translations[type]}
    </span>
  );
}

export default DocumentTypeBadge;
