"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// CONTEXT TYPES
// ═══════════════════════════════════════════════════════════

interface AccordionContextValue {
  type: "single" | "multiple";
  value: string[];
  onValueChange: (itemValue: string) => void;
  collapsible: boolean;
}

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
}

// ═══════════════════════════════════════════════════════════
// CONTEXTS
// ═══════════════════════════════════════════════════════════

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
}

function useAccordionItemContext() {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("Accordion.Trigger/Content must be used within an Accordion.Item");
  }
  return context;
}

// ═══════════════════════════════════════════════════════════
// ACCORDION ROOT
// ═══════════════════════════════════════════════════════════

export interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  children: React.ReactNode;
  className?: string;
}

function AccordionRoot({
  type = "single",
  defaultValue,
  value: controlledValue,
  onValueChange,
  collapsible = true,
  children,
  className,
}: AccordionProps) {
  // Normalize defaultValue to array
  const normalizeValue = (val: string | string[] | undefined): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const [internalValue, setInternalValue] = React.useState<string[]>(
    normalizeValue(defaultValue)
  );

  // Use controlled value if provided
  const value = controlledValue !== undefined
    ? normalizeValue(controlledValue)
    : internalValue;

  const handleValueChange = React.useCallback(
    (itemValue: string) => {
      let newValue: string[];

      if (type === "single") {
        // Single mode: toggle or set
        if (value.includes(itemValue)) {
          newValue = collapsible ? [] : value;
        } else {
          newValue = [itemValue];
        }
      } else {
        // Multiple mode: toggle in array
        if (value.includes(itemValue)) {
          newValue = value.filter((v) => v !== itemValue);
        } else {
          newValue = [...value, itemValue];
        }
      }

      // Update internal state if uncontrolled
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      // Call onChange with appropriate format
      if (onValueChange) {
        if (type === "single") {
          onValueChange(newValue[0] || "");
        } else {
          onValueChange(newValue);
        }
      }
    },
    [type, value, collapsible, controlledValue, onValueChange]
  );

  const contextValue: AccordionContextValue = {
    type,
    value,
    onValueChange: handleValueChange,
    collapsible,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        className={cn(
          "divide-y divide-wood-light border border-wood-light rounded-lg overflow-hidden",
          className
        )}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

AccordionRoot.displayName = "Accordion";

// ═══════════════════════════════════════════════════════════
// ACCORDION ITEM
// ═══════════════════════════════════════════════════════════

export interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

function AccordionItem({
  value,
  disabled = false,
  children,
  className,
}: AccordionItemProps) {
  const { value: openValues } = useAccordionContext();
  const triggerId = React.useId();
  const contentId = React.useId();

  const isOpen = openValues.includes(value);

  const contextValue: AccordionItemContextValue = {
    value,
    isOpen,
    disabled,
    triggerId: `accordion-trigger-${triggerId}`,
    contentId: `accordion-content-${contentId}`,
  };

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <div
        className={cn("bg-white", className)}
        data-state={isOpen ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

AccordionItem.displayName = "Accordion.Item";

// ═══════════════════════════════════════════════════════════
// ACCORDION TRIGGER
// ═══════════════════════════════════════════════════════════

export interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { onValueChange } = useAccordionContext();
  const { value, isOpen, disabled, triggerId, contentId } = useAccordionItemContext();

  const handleClick = () => {
    if (!disabled) {
      onValueChange(value);
    }
  };

  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={isOpen}
      aria-controls={contentId}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "flex w-full items-center justify-between",
        "px-4 py-4 text-start",
        "font-medium text-wood-dark",
        "transition-colors duration-200",
        "hover:bg-wood-light/30",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary focus-visible:ring-inset",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        className
      )}
    >
      <span className="flex-1">{children}</span>
      <ChevronDown
        className={cn(
          "w-5 h-5 shrink-0 text-wood-muted ms-2",
          "transition-transform duration-200",
          isOpen && "rotate-180"
        )}
        aria-hidden="true"
      />
    </button>
  );
}

AccordionTrigger.displayName = "Accordion.Trigger";

// ═══════════════════════════════════════════════════════════
// ACCORDION CONTENT
// ═══════════════════════════════════════════════════════════

export interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

function AccordionContent({ children, className }: AccordionContentProps) {
  const { isOpen, triggerId, contentId } = useAccordionItemContext();

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className={cn("px-4 pb-4 text-wood-muted", className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

AccordionContent.displayName = "Accordion.Content";

// ═══════════════════════════════════════════════════════════
// COMPOUND COMPONENT EXPORT
// ═══════════════════════════════════════════════════════════

const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

export { Accordion };
