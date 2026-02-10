"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// SIZE CONFIGURATION
// ═══════════════════════════════════════════════════════════

const sizeClasses = {
  sm: {
    container: "h-8",
    button: "w-8 h-8",
    input: "w-12 text-sm",
    icon: "w-3 h-3",
  },
  md: {
    container: "h-10",
    button: "w-10 h-10",
    input: "w-14 text-base",
    icon: "w-4 h-4",
  },
};

// ═══════════════════════════════════════════════════════════
// QUANTITY SELECTOR COMPONENT
// ═══════════════════════════════════════════════════════════

function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = React.useState(String(value));
  const inputRef = React.useRef<HTMLInputElement>(null);

  const sizes = sizeClasses[size];

  // Check if out of stock
  const isOutOfStock = max === 0;
  const isDisabled = disabled || isOutOfStock;

  // Check button disabled states
  const canDecrement = !isDisabled && value > min;
  const canIncrement = !isDisabled && (max === undefined || value < max);

  // Sync input value with prop value
  React.useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  // Clamp value to valid range
  const clampValue = (val: number): number => {
    let clamped = Math.max(min, val);
    if (max !== undefined) {
      clamped = Math.min(max, clamped);
    }
    return clamped;
  };

  // Handle decrement
  const handleDecrement = () => {
    if (canDecrement) {
      onChange(value - 1);
    }
  };

  // Handle increment
  const handleIncrement = () => {
    if (canIncrement) {
      onChange(value + 1);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty input for typing
    if (rawValue === "") {
      setInputValue("");
      return;
    }

    // Only allow positive integers
    const parsed = parseInt(rawValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setInputValue(String(parsed));
    }
  };

  // Handle input blur - validate and clamp
  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);

    if (isNaN(parsed) || inputValue === "") {
      // Reset to current value if invalid
      setInputValue(String(value));
    } else {
      // Clamp and update
      const clamped = clampValue(parsed);
      setInputValue(String(clamped));
      if (clamped !== value) {
        onChange(clamped);
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    } else if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center",
        "border border-wood-light rounded-lg overflow-hidden",
        "bg-white",
        sizes.container,
        isDisabled && "opacity-50",
        className
      )}
    >
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className={cn(
          "flex items-center justify-center shrink-0",
          "bg-wood-light/30 hover:bg-wood-light",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary focus-visible:ring-inset",
          sizes.button,
          !canDecrement && "opacity-50 cursor-not-allowed hover:bg-wood-light/30"
        )}
      >
        <Minus className={cn("text-wood-dark", sizes.icon)} />
      </button>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        min={min}
        max={max}
        aria-label="Quantity"
        className={cn(
          "text-center bg-transparent",
          "border-x border-wood-light",
          "text-wood-dark font-medium",
          "focus:outline-none",
          // Hide native number input arrows
          "[&::-webkit-outer-spin-button]:appearance-none",
          "[&::-webkit-inner-spin-button]:appearance-none",
          "[appearance:textfield]",
          sizes.input,
          isDisabled && "cursor-not-allowed"
        )}
      />

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center shrink-0",
          "bg-wood-light/30 hover:bg-wood-light",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary focus-visible:ring-inset",
          sizes.button,
          !canIncrement && "opacity-50 cursor-not-allowed hover:bg-wood-light/30"
        )}
      >
        <Plus className={cn("text-wood-dark", sizes.icon)} />
      </button>
    </div>
  );
}

QuantitySelector.displayName = "QuantitySelector";

export { QuantitySelector };
