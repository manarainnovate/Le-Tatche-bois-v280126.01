"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// BADGE VARIANTS
// ═══════════════════════════════════════════════════════════

const badgeVariants = cva(
  // Base styles
  "inline-flex items-center font-medium rounded-full transition-colors",
  {
    variants: {
      variant: {
        default: "bg-wood-light text-wood-dark",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        gold: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-sm",
        outline: "border border-wood-primary text-wood-primary bg-transparent",
        secondary: "bg-gray-100 text-gray-700",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// ═══════════════════════════════════════════════════════════
// DOT COLOR MAPPING
// ═══════════════════════════════════════════════════════════

const dotColors: Record<string, string> = {
  default: "bg-wood-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  gold: "bg-yellow-300",
  outline: "bg-wood-primary",
  secondary: "bg-gray-500",
};

// ═══════════════════════════════════════════════════════════
// BADGE PROPS
// ═══════════════════════════════════════════════════════════

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// BADGE COMPONENT
// ═══════════════════════════════════════════════════════════

function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  removable = false,
  onRemove,
  className,
}: BadgeProps) {
  const variantKey = variant || "default";

  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {/* Dot indicator */}
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full me-1.5 shrink-0",
            dotColors[variantKey]
          )}
          aria-hidden="true"
        />
      )}

      {/* Badge content */}
      {children}

      {/* Remove button */}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "ms-1 -me-0.5 p-0.5 rounded-full shrink-0",
            "hover:bg-black/10 transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            variant === "gold" && "focus-visible:ring-yellow-300",
            variant === "success" && "focus-visible:ring-green-500",
            variant === "warning" && "focus-visible:ring-yellow-500",
            variant === "error" && "focus-visible:ring-red-500",
            variant === "info" && "focus-visible:ring-blue-500",
            (variant === "default" || variant === "outline") &&
              "focus-visible:ring-wood-primary",
            variant === "secondary" && "focus-visible:ring-gray-500"
          )}
          aria-label="Remove"
        >
          <X
            className={cn(
              "shrink-0",
              size === "sm" && "w-3 h-3",
              size === "md" && "w-3.5 h-3.5",
              size === "lg" && "w-4 h-4"
            )}
          />
        </button>
      )}
    </span>
  );
}

Badge.displayName = "Badge";

export { Badge, badgeVariants };
