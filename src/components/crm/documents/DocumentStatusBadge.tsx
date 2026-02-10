"use client";

import {
  FileText,
  Send,
  Eye,
  Check,
  X,
  Clock,
  Truck,
  CreditCard,
  AlertTriangle,
  Ban,
  ClipboardCheck,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_STATUS_CONFIG,
  type DocumentStatus,
  type SupportedLocale,
} from "@/lib/status-config";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface DocumentStatusBadgeProps {
  status: DocumentStatus | string;
  locale?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Status Icons
// ═══════════════════════════════════════════════════════════

const statusIcons: Record<DocumentStatus, typeof FileText> = {
  DRAFT: FileText,
  SENT: Send,
  VIEWED: Eye,
  ACCEPTED: Check,
  REJECTED: X,
  CONFIRMED: CheckCircle,
  PARTIAL: Clock,
  DELIVERED: Truck,
  SIGNED: ClipboardCheck,
  PAID: CreditCard,
  OVERDUE: AlertTriangle,
  CANCELLED: Ban,
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function DocumentStatusBadge({
  status,
  locale = "fr",
  size = "md",
  showIcon = true,
}: DocumentStatusBadgeProps) {
  const config = DOCUMENT_STATUS_CONFIG[status as DocumentStatus];
  const Icon = statusIcons[status as DocumentStatus] || FileText;

  // Fallback if status not found
  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium rounded-full border",
          "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600",
          size === "sm" && "text-xs px-1.5 py-0.5",
          size === "md" && "text-xs px-2 py-1",
          size === "lg" && "text-sm px-3 py-1.5"
        )}
      >
        {showIcon && <FileText className={size === "sm" ? "h-3 w-3" : size === "md" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
        {status}
      </span>
    );
  }

  const label = config.labels[locale as SupportedLocale] || config.labels.fr;

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

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
}

export default DocumentStatusBadge;
