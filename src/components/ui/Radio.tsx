"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// RADIO TYPES
// ═══════════════════════════════════════════════════════════

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioProps {
  label?: string;
  error?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// RADIO COMPONENT
// ═══════════════════════════════════════════════════════════

const Radio = React.forwardRef<HTMLFieldSetElement, RadioProps>(
  (
    {
      label,
      error,
      options,
      value,
      onChange,
      name,
      orientation = "vertical",
      disabled = false,
      required,
      className,
    },
    ref
  ) => {
    const groupId = React.useId();

    const handleChange = (optionValue: string) => {
      if (!disabled) {
        onChange?.(optionValue);
      }
    };

    const handleKeyDown = (
      e: React.KeyboardEvent,
      optionValue: string,
      index: number
    ) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleChange(optionValue);
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (index + 1) % options.length;
        const nextOption = options[nextIndex];
        if (nextOption && !nextOption.disabled) {
          handleChange(nextOption.value);
        }
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (index - 1 + options.length) % options.length;
        const prevOption = options[prevIndex];
        if (prevOption && !prevOption.disabled) {
          handleChange(prevOption.value);
        }
      }
    };

    return (
      <fieldset ref={ref} className={cn("flex flex-col gap-2", className)}>
        {/* Legend/Label */}
        {label && (
          <legend className="text-sm font-medium text-wood-dark mb-1">
            {label}
            {required && <span className="text-red-500 ms-1">*</span>}
          </legend>
        )}

        {/* Radio Options */}
        <div
          role="radiogroup"
          aria-required={required}
          className={cn(
            "flex gap-2",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap gap-4"
          )}
        >
          {options.map((option, index) => {
            const optionId = `${groupId}-${option.value}`;
            const isSelected = value === option.value;
            const isDisabled = disabled || option.disabled;

            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={cn(
                  "inline-flex items-center gap-2 cursor-pointer select-none",
                  isDisabled && "cursor-not-allowed opacity-50"
                )}
              >
                {/* Hidden native radio */}
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleChange(option.value)}
                  disabled={isDisabled}
                  required={required && index === 0}
                  className="sr-only peer"
                  aria-invalid={!!error}
                />

                {/* Custom radio circle */}
                <span
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isDisabled ? -1 : 0}
                  onKeyDown={(e) => handleKeyDown(e, option.value, index)}
                  className={cn(
                    // Base styles
                    "w-5 h-5 rounded-full shrink-0",
                    "flex items-center justify-center",
                    "border-2 transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary/50",
                    // Unselected state
                    !isSelected &&
                      "border-wood-light bg-white hover:border-wood-primary",
                    // Selected state
                    isSelected && "border-wood-primary bg-white",
                    // Error state
                    error && "border-red-500",
                    // Disabled
                    isDisabled && "pointer-events-none"
                  )}
                >
                  {/* Inner filled circle */}
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full bg-wood-primary",
                      "transition-all duration-200",
                      isSelected ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    )}
                  />
                </span>

                {/* Label text */}
                <span className="text-sm text-wood-dark">{option.label}</span>
              </label>
            );
          })}
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </fieldset>
    );
  }
);

Radio.displayName = "Radio";

export { Radio };
