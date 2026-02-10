"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Globe,
  Search,
  ExternalLink,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useAdmin } from "./AdminProvider";
import { AdminCurrencySwitcher } from "./AdminCurrencySwitcher";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    profile: "Mon profil",
    settings: "Parametres",
    logout: "Deconnexion",
    notifications: "Notifications",
    noNotifications: "Aucune notification",
    language: "Langue",
    search: "Rechercher...",
    viewSite: "Voir le site",
  },
  en: {
    profile: "My profile",
    settings: "Settings",
    logout: "Logout",
    notifications: "Notifications",
    noNotifications: "No notifications",
    language: "Language",
    search: "Search...",
    viewSite: "View site",
  },
  es: {
    profile: "Mi perfil",
    settings: "Configuracion",
    logout: "Cerrar sesion",
    notifications: "Notificaciones",
    noNotifications: "Sin notificaciones",
    language: "Idioma",
    search: "Buscar...",
    viewSite: "Ver sitio",
  },
  ar: {
    profile: "ملفي الشخصي",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    notifications: "الإشعارات",
    noNotifications: "لا توجد إشعارات",
    language: "اللغة",
    search: "بحث...",
    viewSite: "عرض الموقع",
  },
};

const languages = [
  { code: "fr", name: "Francais", flag: "FR" },
  { code: "en", name: "English", flag: "EN" },
  { code: "es", name: "Espanol", flag: "ES" },
  { code: "ar", name: "العربية", flag: "AR" },
];

// ═══════════════════════════════════════════════════════════
// Admin Header Component
// ═══════════════════════════════════════════════════════════

interface AdminHeaderProps {
  locale?: string;
}

export function AdminHeader({ locale = "fr" }: AdminHeaderProps) {
  const router = useRouter();
  const { user, sidebarOpen, setSidebarOpen, sidebarCollapsed, theme, setTheme, isRTL } =
    useAdmin();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  const handleLogout = () => {
    void signOut({ callbackUrl: `/${locale}/admin/login` });
  };

  const handleLanguageChange = (langCode: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, "");
    router.push(`/${langCode}${pathWithoutLocale}`);
    setShowLanguages(false);
  };

  // Get user initials
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800",
        isRTL ? "right-0" : "left-0",
        sidebarCollapsed ? "lg:left-20 lg:right-0" : "lg:left-64 lg:right-0",
        isRTL && (sidebarCollapsed ? "lg:right-20 lg:left-0" : "lg:right-64 lg:left-0"),
        "right-0 left-0 lg:right-0"
      )}
    >
      {/* Left: Mobile menu button + Search */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        <div className="hidden items-center md:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border-0 bg-gray-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* View Site Link */}
        <Link
          href={`/${locale}`}
          target="_blank"
          className="hidden items-center gap-1 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:flex"
        >
          <ExternalLink className="h-4 w-4" />
          <span>{t.viewSite}</span>
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          title={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Currency Switcher */}
        <AdminCurrencySwitcher isRTL={isRTL} />

        {/* Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowLanguages(!showLanguages);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            className="flex items-center gap-1 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <Globe className="h-5 w-5" />
            <span className="hidden text-sm font-medium sm:inline">
              {locale.toUpperCase()}
            </span>
          </button>

          {showLanguages && (
            <div
              className={cn(
                "absolute top-full mt-2 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800",
                isRTL ? "left-0" : "right-0"
              )}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                    locale === lang.code
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <span className="w-6 text-center font-medium">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowLanguages(false);
              setShowUserMenu(false);
            }}
            className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <Bell className="h-5 w-5" />
            {/* Badge */}
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div
              className={cn(
                "absolute top-full mt-2 w-72 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800",
                isRTL ? "left-0" : "right-0"
              )}
            >
              <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t.notifications}
                </h3>
              </div>
              <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {t.noNotifications}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowLanguages(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-medium text-white">
              {getInitials(user.name)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>

          {showUserMenu && (
            <div
              className={cn(
                "absolute top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800",
                isRTL ? "left-0" : "right-0"
              )}
            >
              <Link
                href={`/${locale}/admin/utilisateurs/${user.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="h-4 w-4" />
                {t.profile}
              </Link>
              <Link
                href={`/${locale}/admin/parametres`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="h-4 w-4" />
                {t.settings}
              </Link>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
