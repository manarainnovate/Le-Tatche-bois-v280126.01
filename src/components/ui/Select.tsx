"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// SELECT TYPES
// ═══════════════════════════════════════════════════════════

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  name?: string;
  required?: boolean;
  id?: string;
}

// ═══════════════════════════════════════════════════════════
// SELECT COMPONENT
// ═══════════════════════════════════════════════════════════

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      value,
      onChange,
      placeholder = "Select an option",
      disabled = false,
      fullWidth = true,
      name,
      required,
      id,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const [isOpen, setIsOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const option = options[highlightedIndex];
            if (option && !option.disabled) {
              onChange?.(option.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < options.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : options.length - 1
            );
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    };

    // Reset highlighted index when opening
    React.useEffect(() => {
      if (isOpen) {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
    }, [isOpen, options, value]);

    // Scroll highlighted option into view
    React.useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listRef.current) {
        const item = listRef.current.children[highlightedIndex] as HTMLElement;
        item?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex, isOpen]);

    return (
      <div
        ref={containerRef}
        className={cn("flex flex-col gap-1.5 relative", fullWidth && "w-full")}
      >
        {/* Hidden native select for form submission */}
        <select
          name={name}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          required={required}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-wood-dark"
          >
            {label}
            {required && <span className="text-red-500 ms-1">*</span>}
          </label>
        )}

        {/* Custom Select Button */}
        <button
          ref={ref}
          id={selectId}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            // Base styles
            "h-10 w-full rounded-lg border bg-white px-4",
            "flex items-center justify-between gap-2",
            "text-start transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-wood-primary/50 focus:border-wood-primary",
            // Border color
            error
              ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
              : "border-wood-light",
            // Open state
            isOpen && "ring-2 ring-wood-primary/50 border-wood-primary",
            // Disabled state
            disabled && "bg-gray-100 cursor-not-allowed opacity-60"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? selectId : undefined}
        >
          <span
            className={cn(
              "truncate",
              selectedOption ? "text-wood-dark" : "text-gray-400"
            )}
          >
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <ul
            ref={listRef}
            role="listbox"
            className={cn(
              "absolute z-50 top-full mt-1 w-full",
              "max-h-60 overflow-auto",
              "rounded-lg border border-wood-light bg-white shadow-lg",
              "py-1",
              "animate-in fade-in-0 zoom-in-95 duration-150"
            )}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "flex items-center justify-between px-4 py-2 cursor-pointer",
                  "transition-colors duration-100",
                  // Highlighted
                  highlightedIndex === index && "bg-wood-light/50",
                  // Selected
                  option.value === value && "text-wood-primary font-medium",
                  // Disabled
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && (
                  <Check className="w-4 h-4 text-wood-primary shrink-0" />
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Error Message */}
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Hint Text (hidden if error) */}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
