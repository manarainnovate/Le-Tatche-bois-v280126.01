"use client";

import { cn } from "@/lib/utils";
import { Hammer, Truck, Settings } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type ProjectType = "FABRICATION" | "INSTALLATION" | "BOTH";

interface ProjectTypeBadgeProps {
  type: ProjectType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  locale?: string;
}

// ═══════════════════════════════════════════════════════════
// Type Configuration
// ═══════════════════════════════════════════════════════════

const typeConfig: Record<
  ProjectType,
  { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }
> = {
  FABRICATION: {
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: Hammer,
  },
  INSTALLATION: {
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: Truck,
  },
  BOTH: {
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    icon: Settings,
  },
};

const typeLabels: Record<string, Record<ProjectType, string>> = {
  fr: {
    FABRICATION: "Fabrication",
    INSTALLATION: "Pose",
    BOTH: "Fab + Pose",
  },
  en: {
    FABRICATION: "Fabrication",
    INSTALLATION: "Installation",
    BOTH: "Fab + Install",
  },
  es: {
    FABRICATION: "Fabricación",
    INSTALLATION: "Instalación",
    BOTH: "Fab + Inst",
  },
  ar: {
    FABRICATION: "تصنيع",
    INSTALLATION: "تركيب",
    BOTH: "تصنيع + تركيب",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectTypeBadge({
  type,
  size = "md",
  showIcon = true,
  locale = "fr",
}: ProjectTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.BOTH;
  const labels = typeLabels[locale] || typeLabels.fr;
  const label = labels[type] || type;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.bgColor,
        config.color,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
}

export default ProjectTypeBadge;
