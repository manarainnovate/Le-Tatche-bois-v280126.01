"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// INPUT PROPS
// ═══════════════════════════════════════════════════════════

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ═══════════════════════════════════════════════════════════
// INPUT COMPONENT
// ═══════════════════════════════════════════════════════════

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-wood-dark"
          >
            {label}
            {props.required && <span className="text-red-500 ms-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400 pointer-events-none">
              {leftIcon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={cn(
              // Base styles
              "h-10 w-full rounded-lg border bg-white px-4",
              "text-wood-dark placeholder:text-gray-400",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-wood-primary/50 focus:border-wood-primary",
              // Default border
              error
                ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                : "border-wood-light",
              // Icon padding
              leftIcon && "ps-10",
              rightIcon && "pe-10",
              // Disabled state
              disabled && "bg-gray-100 cursor-not-allowed opacity-60",
              // Custom classes
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Hint Text (hidden if error) */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
