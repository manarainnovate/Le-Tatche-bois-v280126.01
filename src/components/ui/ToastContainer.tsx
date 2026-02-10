"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { Toast } from "./Toast";
import { useToastStore } from "@/stores/toast";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TOAST CONTAINER PROPS
// ═══════════════════════════════════════════════════════════

export interface ToastContainerProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// POSITION CONFIGURATION
// ═══════════════════════════════════════════════════════════

const positionClasses = {
  "top-right": "top-4 end-4",
  "top-left": "top-4 start-4",
  "bottom-right": "bottom-4 end-4",
  "bottom-left": "bottom-4 start-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

// ═══════════════════════════════════════════════════════════
// TOAST CONTAINER COMPONENT
// ═══════════════════════════════════════════════════════════

function ToastContainer({ position = "top-right", className }: ToastContainerProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const { toasts, removeToast } = useToastStore();

  // Handle client-side mounting for portal
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render on server
  if (!isMounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-2",
        positionClasses[position],
        className
      )}
      aria-label="Notifications"
      role="region"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

ToastContainer.displayName = "ToastContainer";

export { ToastContainer };
