"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// CONTEXT TYPES
// ═══════════════════════════════════════════════════════════

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}

// ═══════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a Dropdown");
  }
  return context;
}

// ═══════════════════════════════════════════════════════════
// DROPDOWN ROOT
// ═══════════════════════════════════════════════════════════

export interface DropdownProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function DropdownRoot({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange]
  );

  const contextValue: DropdownContextValue = {
    open,
    setOpen,
    triggerRef,
    contentRef,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

DropdownRoot.displayName = "Dropdown";

// ═══════════════════════════════════════════════════════════
// DROPDOWN TRIGGER
// ═══════════════════════════════════════════════════════════

export interface DropdownTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

function DropdownTrigger({
  children,
  asChild = false,
  className,
}: DropdownTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownContext();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      ref: triggerRef,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      "aria-expanded": open,
      "aria-haspopup": "menu",
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={open}
      aria-haspopup="menu"
      className={className}
    >
      {children}
    </button>
  );
}

DropdownTrigger.displayName = "Dropdown.Trigger";

// ═══════════════════════════════════════════════════════════
// DROPDOWN CONTENT
// ═══════════════════════════════════════════════════════════

export interface DropdownContentProps {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

function DropdownContent({
  children,
  align = "start",
  sideOffset = 4,
  className,
}: DropdownContentProps) {
  const { open, setOpen, triggerRef, contentRef } = useDropdownContext();
  const [isMounted, setIsMounted] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [isRtl, setIsRtl] = React.useState(false);

  // Handle client-side mounting
  React.useEffect(() => {
    setIsMounted(true);
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  // Calculate position
  React.useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const content = contentRef.current;
      const contentWidth = content?.offsetWidth || 160;

      let left = rect.left;

      // Adjust alignment
      const effectiveAlign = isRtl
        ? align === "start"
          ? "end"
          : align === "end"
            ? "start"
            : "center"
        : align;

      if (effectiveAlign === "center") {
        left = rect.left + rect.width / 2 - contentWidth / 2;
      } else if (effectiveAlign === "end") {
        left = rect.right - contentWidth;
      }

      // Keep within viewport
      const viewportWidth = window.innerWidth;
      if (left + contentWidth > viewportWidth - 8) {
        left = viewportWidth - contentWidth - 8;
      }
      if (left < 8) {
        left = 8;
      }

      setPosition({
        top: rect.bottom + sideOffset + window.scrollY,
        left: left + window.scrollX,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align, sideOffset, triggerRef, contentRef, isRtl]);

  // Close on click outside
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const trigger = triggerRef.current;
      const content = contentRef.current;

      if (
        trigger &&
        !trigger.contains(target) &&
        content &&
        !content.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen, triggerRef, contentRef]);

  // Close on ESC and handle keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }

      if (e.key === "Tab") {
        setOpen(false);
      }

      const content = contentRef.current;
      if (!content) return;

      const items = content.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled])'
      );
      const currentIndex = Array.from(items).findIndex(
        (item) => item === document.activeElement
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen, triggerRef, contentRef]);

  // Focus first item on open
  React.useEffect(() => {
    if (!open || !contentRef.current) return;

    const timer = setTimeout(() => {
      const firstItem = contentRef.current?.querySelector<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled])'
      );
      firstItem?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [open, contentRef]);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={contentRef}
          role="menu"
          aria-orientation="vertical"
          initial={{ opacity: 0, y: -5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
          }}
          className={cn(
            "z-50 min-w-[160px] overflow-hidden",
            "bg-white rounded-lg shadow-lg border border-wood-light",
            "py-1",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

DropdownContent.displayName = "Dropdown.Content";

// ═══════════════════════════════════════════════════════════
// DROPDOWN ITEM
// ═══════════════════════════════════════════════════════════

export interface DropdownItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
}

function DropdownItem({
  children,
  onSelect,
  disabled = false,
  destructive = false,
  className,
}: DropdownItemProps) {
  const { setOpen } = useDropdownContext();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;

    onSelect?.();

    // Close unless prevented
    if (!e.defaultPrevented) {
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.();

      if (!e.defaultPrevented) {
        setOpen(false);
      }
    }
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full px-4 py-2 text-sm text-start",
        "flex items-center",
        "transition-colors duration-150",
        "focus:outline-none focus:bg-wood-light/50",
        // Default state
        !destructive && !disabled && "text-gray-700 hover:bg-wood-light/50",
        // Destructive state
        destructive && !disabled && "text-red-600 hover:bg-red-50 focus:bg-red-50",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

DropdownItem.displayName = "Dropdown.Item";

// ═══════════════════════════════════════════════════════════
// DROPDOWN SEPARATOR
// ═══════════════════════════════════════════════════════════

function DropdownSeparator() {
  return <hr className="my-1 border-t border-wood-light" role="separator" />;
}

DropdownSeparator.displayName = "Dropdown.Separator";

// ═══════════════════════════════════════════════════════════
// DROPDOWN LABEL
// ═══════════════════════════════════════════════════════════

export interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownLabel({ children, className }: DropdownLabelProps) {
  return (
    <div
      className={cn(
        "px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide",
        className
      )}
    >
      {children}
    </div>
  );
}

DropdownLabel.displayName = "Dropdown.Label";

// ═══════════════════════════════════════════════════════════
// COMPOUND COMPONENT EXPORT
// ═══════════════════════════════════════════════════════════

const Dropdown = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  Separator: DropdownSeparator,
  Label: DropdownLabel,
});

export { Dropdown };
