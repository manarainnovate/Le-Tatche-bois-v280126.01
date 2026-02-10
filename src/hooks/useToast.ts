"use client";

import { useToastStore, type ToastType } from "@/stores/toast";

// ═══════════════════════════════════════════════════════════
// USE TOAST HOOK TYPES
// ═══════════════════════════════════════════════════════════

interface ToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface UseToastReturn {
  toast: (options: ToastOptions) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ═══════════════════════════════════════════════════════════
// USE TOAST HOOK
// ═══════════════════════════════════════════════════════════

export function useToast(): UseToastReturn {
  const { addToast, removeToast, clearAll } = useToastStore();

  const toast = (options: ToastOptions) => {
    addToast(options);
  };

  const success = (title: string, message?: string) => {
    addToast({ type: "success", title, message });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: "error", title, message });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: "warning", title, message });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: "info", title, message });
  };

  const dismiss = (id: string) => {
    removeToast(id);
  };

  const dismissAll = () => {
    clearAll();
  };

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };
}

export default useToast;
