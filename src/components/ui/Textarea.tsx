"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TEXTAREA PROPS
// ═══════════════════════════════════════════════════════════

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  autoResize?: boolean;
  maxRows?: number;
}

// ═══════════════════════════════════════════════════════════
// TEXTAREA COMPONENT
// ═══════════════════════════════════════════════════════════

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      autoResize = false,
      maxRows = 10,
      rows = 4,
      disabled,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Auto-resize logic
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      // Reset height to calculate scrollHeight correctly
      textarea.style.height = "auto";

      // Calculate max height based on maxRows
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
      const maxHeight = lineHeight * maxRows + 24; // +24 for padding

      // Set new height
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [autoResize, maxRows, textareaRef]);

    // Adjust height on mount and when value changes
    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight, props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      adjustHeight();
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-wood-dark"
          >
            {label}
            {props.required && <span className="text-red-500 ms-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            // Base styles
            "min-h-[100px] w-full rounded-lg border bg-white px-4 py-3",
            "text-wood-dark placeholder:text-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-wood-primary/50 focus:border-wood-primary",
            // Default border
            error
              ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
              : "border-wood-light",
            // Resize behavior
            autoResize ? "resize-none overflow-hidden" : "resize-y",
            // Disabled state
            disabled && "bg-gray-100 cursor-not-allowed opacity-60",
            // Custom classes
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
                ? `${textareaId}-hint`
                : undefined
          }
          {...props}
        />

        {/* Error Message */}
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Hint Text (hidden if error) */}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
