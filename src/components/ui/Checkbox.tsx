"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// CHECKBOX PROPS
// ═══════════════════════════════════════════════════════════

export interface CheckboxProps {
  label?: string;
  error?: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// CHECKBOX COMPONENT
// ═══════════════════════════════════════════════════════════

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      checked = false,
      indeterminate = false,
      onChange,
      disabled = false,
      name,
      id,
      required,
      className,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;
    const internalRef = React.useRef<HTMLInputElement>(null);

    // Set indeterminate property on the native input
    React.useEffect(() => {
      const input = internalRef.current;
      if (input) {
        input.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // Combine refs
    React.useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!disabled) {
          onChange?.(!checked);
        }
      }
    };

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <label
          htmlFor={checkboxId}
          className={cn(
            "inline-flex items-center gap-2 cursor-pointer select-none",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {/* Hidden native checkbox */}
          <input
            ref={internalRef}
            type="checkbox"
            id={checkboxId}
            name={name}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className="sr-only peer"
            aria-invalid={!!error}
          />

          {/* Custom checkbox */}
          <span
            role="checkbox"
            aria-checked={indeterminate ? "mixed" : checked}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={handleKeyDown}
            className={cn(
              // Base styles
              "w-5 h-5 rounded shrink-0",
              "flex items-center justify-center",
              "border-2 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary/50",
              // Unchecked state
              !checked && !indeterminate && "border-wood-light bg-white hover:border-wood-primary",
              // Checked or indeterminate state
              (checked || indeterminate) && "bg-wood-primary border-wood-primary",
              // Error state
              error && "border-red-500",
              // Disabled
              disabled && "pointer-events-none"
            )}
          >
            {/* Check icon or minus for indeterminate */}
            {indeterminate ? (
              <span className="w-2.5 h-0.5 bg-white rounded-full" />
            ) : (
              <Check
                className={cn(
                  "w-3.5 h-3.5 text-white",
                  "transition-all duration-200",
                  checked ? "opacity-100 scale-100" : "opacity-0 scale-75"
                )}
                strokeWidth={3}
              />
            )}
          </span>

          {/* Label text */}
          {label && (
            <span className="text-sm text-wood-dark">
              {label}
              {required && <span className="text-red-500 ms-1">*</span>}
            </span>
          )}
        </label>

        {/* Error Message */}
        {error && <p className="text-sm text-red-500 ms-7">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
