"use client";

import { cn } from "@/lib/utils";
import {
  LEAD_STATUS_CONFIG,
  type LeadStatus,
  type SupportedLocale,
} from "@/lib/status-config";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface LeadStatusBadgeProps {
  status: LeadStatus | string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  locale?: string;
}

// ═══════════════════════════════════════════════════════════
// Backward Compatibility Mapping
// Maps old French status names to new English status names
// ═══════════════════════════════════════════════════════════

const statusMapping: Record<string, LeadStatus> = {
  // Old French status names
  NOUVEAU: "NEW",
  CONTACTE: "CONTACTED",
  QUALIFIE: "VISIT_SCHEDULED",
  PROPOSITION: "QUOTE_SENT",
  NEGOCIATION: "NEGOTIATION",
  GAGNE: "WON",
  PERDU: "LOST",
  // New English status names (pass through)
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  VISIT_SCHEDULED: "VISIT_SCHEDULED",
  MEASURES_TAKEN: "MEASURES_TAKEN",
  QUOTE_SENT: "QUOTE_SENT",
  NEGOTIATION: "NEGOTIATION",
  WON: "WON",
  LOST: "LOST",
};

// ═══════════════════════════════════════════════════════════
// Dot Colors
// ═══════════════════════════════════════════════════════════

const dotColors: Record<string, string> = {
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  purple: "bg-purple-500",
  indigo: "bg-indigo-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
  red: "bg-red-500",
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function LeadStatusBadge({
  status,
  size = "md",
  showDot = true,
  locale = "fr",
}: LeadStatusBadgeProps) {
  // Map to canonical status
  const canonicalStatus = statusMapping[status] || (status as LeadStatus);
  const config = LEAD_STATUS_CONFIG[canonicalStatus];

  // Fallback if status not found
  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium",
          "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300",
          size === "sm" && "px-2 py-0.5 text-xs",
          size === "md" && "px-2.5 py-1 text-xs",
          size === "lg" && "px-3 py-1.5 text-sm"
        )}
      >
        {showDot && <span className="rounded-full bg-gray-500 h-2 w-2" />}
        {status}
      </span>
    );
  }

  const label = config.labels[locale as SupportedLocale] || config.labels.fr;
  const dotColor = dotColors[config.color] || "bg-gray-500";

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
        config.bgColor,
        config.textColor,
        sizeClasses[size]
      )}
    >
      {showDot && <span className={cn("rounded-full", dotColor, dotSizes[size])} />}
      {label}
    </span>
  );
}

export default LeadStatusBadge;
