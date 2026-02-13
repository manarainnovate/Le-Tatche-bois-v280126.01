"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCurrency } from "@/stores/currency";
import { useUIStore } from "@/stores/ui";
import { useCartCount } from "@/stores/cart";
import { useDirection } from "@/hooks/useDirection";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useSiteSettings } from "@/stores/siteSettings";
import { cn } from "@/lib/utils";
import { X, ShoppingCart, FileText, Phone, Mail } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface NavItem {
  key: string;
  href: string;
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION ITEMS
// ═══════════════════════════════════════════════════════════

const navItems: NavItem[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/atelier" },
  { key: "services", href: "/services" },
  { key: "projects", href: "/realisations" },
  { key: "shop", href: "/boutique" },
  { key: "contact", href: "/contact" },
];

// Language options
const languages = [
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Español' },
  { code: 'ar', label: 'AR', flag: '🇲🇦', name: 'العربية' },
];

// Currency options
const currencies = [
  { code: 'MAD', symbol: 'DH', label: 'MAD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
];

// ═══════════════════════════════════════════════════════════
// MOBILE MENU COMPONENT
// ═══════════════════════════════════════════════════════════

export function MobileMenu() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const direction = useDirection();
  const isRTL = direction === "rtl";

  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const cartCount = useCartCount();
  const { currency, setCurrency } = useCurrency();
  const { logoHeader, siteName } = useSiteSettings();

  // Fix hydration mismatch for cart count (server renders 0, client hydrates from localStorage)
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lock body scroll when menu is open
  useBodyScrollLock(isMobileMenuOpen);

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeMobileMenu]);

  // Check if link is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    const localePath = `/${locale}${href}`;
    return pathname === localePath || pathname.startsWith(`${localePath}/`);
  };

  // Switch language
  const switchLocale = (newLocale: string) => {
    const currentPath = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${currentPath}`);
    closeMobileMenu();
  };

  // Switch currency
  const switchCurrency = (code: string) => {
    setCurrency(code as any);
    // Don't close menu - allow multiple selections
  };

  if (!isMobileMenuOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 lg:hidden",
          "animate-in fade-in duration-300"
        )}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Menu Panel - Opens from LEFT */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 w-[320px] max-w-[85vw] bg-white z-50 lg:hidden",
          "flex flex-col shadow-2xl",
          "animate-slide-in-left"
        )}
      >
        {/* Header - Logo LEFT, Close RIGHT */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {/* Logo on LEFT */}
          <Link href={`/${locale}`} onClick={closeMobileMenu} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoHeader || "/images/logo.png"}
              alt={siteName || "LE TATCHE BOIS"}
              className="h-10 w-auto object-contain"
            />
          </Link>
          {/* Close button on RIGHT */}
          <button
            onClick={closeMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          <nav className="py-4">
            <ul className="space-y-1 px-4">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href === "/" ? "" : item.href}`}
                    onClick={closeMobileMenu}
                    className={cn(
                      "block px-4 py-3 rounded-lg font-medium transition-all duration-200",
                      isActive(item.href)
                        ? "bg-amber-50 text-amber-600 border-l-4 border-amber-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-amber-600 active:scale-[0.98]",
                      isRTL ? "text-right border-l-0 border-r-4" : ""
                    )}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Cart Link */}
            <div className="px-4 mt-4">
              <Link
                href={`/${locale}/cart`}
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-3 font-medium text-gray-700">
                  <ShoppingCart className="w-5 h-5" />
                  {t("cart")}
                </span>
                {isClient && cartCount > 0 && (
                  <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>

          {/* Language Selector - 4 Buttons in Grid */}
          <div className="px-4 py-3 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {isRTL ? 'اللغة' : 'Langue'}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLocale(lang.code)}
                  className={cn(
                    "flex flex-col items-center py-3 rounded-lg text-xs font-medium transition-all",
                    locale === lang.code
                      ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                  )}
                >
                  <span className="text-xl mb-1">{lang.flag}</span>
                  <span className="font-bold">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selector - 4 Buttons in Grid */}
          <div className="px-4 py-3 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {isRTL ? 'العملة' : 'Devise'}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => switchCurrency(curr.code)}
                  className={cn(
                    "flex flex-col items-center py-3 rounded-lg text-xs font-medium transition-all",
                    currency === curr.code
                      ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                  )}
                >
                  <span className="text-lg mb-1 font-bold">{curr.symbol}</span>
                  <span className="text-[10px] font-semibold">{curr.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          {/* Quote CTA */}
          <Link
            href={`/${locale}/devis`}
            onClick={closeMobileMenu}
            className="w-full inline-flex items-center justify-center h-11 px-4 text-base rounded-lg gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg font-semibold hover:brightness-110 transition-all duration-200 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            {t("quote")}
          </Link>

          {/* Contact */}
          <div className="space-y-2 text-sm text-gray-600">
            <a
              href="tel:+212500000000"
              className="flex items-center gap-2 hover:text-amber-600 transition-colors"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="ltr-force">+212 5XX XX XX XX</span>
            </a>
            <a
              href="mailto:contact@letatche-bois.ma"
              className="flex items-center gap-2 hover:text-amber-600 transition-colors"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">contact@letatche-bois.ma</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

MobileMenu.displayName = "MobileMenu";

export default MobileMenu;
