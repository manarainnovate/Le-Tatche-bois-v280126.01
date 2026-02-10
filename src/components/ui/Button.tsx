"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// BUTTON VARIANTS
// ═══════════════════════════════════════════════════════════

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center",
    "font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-wood-primary to-wood-secondary",
          "text-white shadow-md",
          "hover:brightness-110",
          "active:brightness-95",
        ],
        secondary: [
          "bg-wood-light text-wood-dark",
          "hover:bg-wood-accent hover:text-white",
        ],
        outline: [
          "border-2 border-wood-primary text-wood-primary bg-transparent",
          "hover:bg-wood-primary hover:text-white",
        ],
        ghost: [
          "text-wood-primary bg-transparent",
          "hover:bg-wood-light/50",
        ],
        danger: [
          "bg-red-600 text-white shadow-md",
          "hover:bg-red-700",
        ],
        gold: [
          "bg-gradient-to-r from-yellow-500 to-yellow-600",
          "text-white shadow-md",
          "hover:from-yellow-600 hover:to-yellow-700",
        ],
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md gap-1.5",
        md: "h-10 px-4 text-base rounded-lg gap-2",
        lg: "h-12 px-6 text-lg rounded-lg gap-2.5",
        icon: "h-10 w-10 p-0 rounded-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

// ═══════════════════════════════════════════════════════════
// BUTTON PROPS
// ═══════════════════════════════════════════════════════════

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ═══════════════════════════════════════════════════════════
// ICON SIZE MAPPING
// ═══════════════════════════════════════════════════════════

const iconSizeClasses = {
  sm: "w-4 h-4",
  md: "w-4 h-4",
  lg: "w-5 h-5",
  icon: "w-5 h-5",
};

// ═══════════════════════════════════════════════════════════
// BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const iconSize = iconSizeClasses[size || "md"];

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <Loader2 className={cn("animate-spin", iconSize, "shrink-0")} />
        )}

        {/* Left Icon (hidden when loading) */}
        {!isLoading && leftIcon && (
          <span className={cn(iconSize, "shrink-0")}>{leftIcon}</span>
        )}

        {/* Children */}
        {children && <span className="truncate">{children}</span>}

        {/* Right Icon */}
        {rightIcon && (
          <span className={cn(iconSize, "shrink-0")}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export { Button, buttonVariants };
