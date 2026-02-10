"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastType } from "@/stores/toast";

// ═══════════════════════════════════════════════════════════
// TOAST PROPS
// ═══════════════════════════════════════════════════════════

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

// ═══════════════════════════════════════════════════════════
// TOAST CONFIGURATION
// ═══════════════════════════════════════════════════════════

const toastConfig = {
  success: {
    icon: CheckCircle,
    iconClass: "text-green-500",
    containerClass: "bg-green-50 border-green-200",
    titleClass: "text-green-800",
    messageClass: "text-green-700",
    progressClass: "bg-green-500",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-500",
    containerClass: "bg-red-50 border-red-200",
    titleClass: "text-red-800",
    messageClass: "text-red-700",
    progressClass: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-yellow-500",
    containerClass: "bg-yellow-50 border-yellow-200",
    titleClass: "text-yellow-800",
    messageClass: "text-yellow-700",
    progressClass: "bg-yellow-500",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    containerClass: "bg-blue-50 border-blue-200",
    titleClass: "text-blue-800",
    messageClass: "text-blue-700",
    progressClass: "bg-blue-500",
  },
};

// ═══════════════════════════════════════════════════════════
// TOAST COMPONENT
// ═══════════════════════════════════════════════════════════

function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [progress, setProgress] = React.useState(100);
  const [isPaused, setIsPaused] = React.useState(false);
  const startTimeRef = React.useRef<number>(Date.now());
  const remainingTimeRef = React.useRef<number>(duration);

  const config = toastConfig[type];
  const Icon = config.icon;

  // Auto-dismiss timer with pause/resume support
  React.useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    const initialRemaining = remainingTimeRef.current;

    const timer = setTimeout(() => {
      onClose(id);
    }, initialRemaining);

    // Progress bar animation
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = initialRemaining - elapsed;
      const progressPercent = (remaining / duration) * 100;
      setProgress(Math.max(0, progressPercent));
    }, 16); // ~60fps

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      // Save remaining time when pausing
      const elapsed = Date.now() - startTime;
      remainingTimeRef.current = Math.max(0, initialRemaining - elapsed);
    };
  }, [id, duration, onClose, isPaused]);

  // Reset start time when resuming
  React.useEffect(() => {
    if (!isPaused) {
      startTimeRef.current = Date.now();
    }
  }, [isPaused]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "relative min-w-[300px] max-w-[400px]",
        "rounded-lg border shadow-lg overflow-hidden",
        "p-4",
        config.containerClass
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Content */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconClass)} />

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm", config.titleClass)}>{title}</p>
          {message && (
            <p className={cn("mt-1 text-sm", config.messageClass)}>{message}</p>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onClose(id)}
          className={cn(
            "shrink-0 p-1 rounded-md",
            "opacity-70 hover:opacity-100",
            "transition-opacity duration-150",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            type === "success" && "focus:ring-green-500",
            type === "error" && "focus:ring-red-500",
            type === "warning" && "focus:ring-yellow-500",
            type === "info" && "focus:ring-blue-500"
          )}
          aria-label="Dismiss notification"
        >
          <X className={cn("w-4 h-4", config.iconClass)} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
        <motion.div
          className={cn("h-full", config.progressClass)}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

Toast.displayName = "Toast";

export { Toast };
