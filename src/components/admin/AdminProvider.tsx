"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { UserRole } from "@prisma/client";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface User {
  id: string;
  name?: string | null;
  email: string;
  role: UserRole;
  image?: string | null;
}

interface AdminContextType {
  user: User;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  isRTL: boolean;
}

// ═══════════════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════════════

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════════════

interface AdminProviderProps {
  children: ReactNode;
  user: User;
  locale: string;
}

export function AdminProvider({ children, user, locale }: AdminProviderProps) {
  // Mobile sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  // RTL check
  const isRTL = locale === "ar";

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  // Save theme to localStorage and apply to document
  useEffect(() => {
    localStorage.setItem("admin-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("admin-sidebar-collapsed");
    if (savedCollapsed === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  // Save sidebar collapsed state
  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close mobile sidebar on route change (handled by parent)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        user,
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        theme,
        setTheme,
        isRTL,
      }}
    >
      <div dir={isRTL ? "rtl" : "ltr"}>{children}</div>
    </AdminContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}

// ═══════════════════════════════════════════════════════════
// Role Helpers
// ═══════════════════════════════════════════════════════════

export function hasRole(user: User, roles: UserRole[]): boolean {
  return roles.includes(user.role);
}

export function isAdmin(user: User): boolean {
  return user.role === "ADMIN";
}

export function canManageOrders(user: User): boolean {
  return ["ADMIN", "SALES"].includes(user.role);
}

export function canManageContent(user: User): boolean {
  return ["ADMIN", "EDITOR"].includes(user.role);
}

export function canManageUsers(user: User): boolean {
  return user.role === "ADMIN";
}
