"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useDirection } from "@/hooks/useDirection";
import { useCartCount } from "@/stores/cart";
import { useCurrencyStore, type CurrencyCode } from "@/stores/currency";
import { useSiteSettings } from "@/stores/siteSettings";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Menu,
  FileText,
  ChevronDown,
  Globe,
  Coins,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface NavItem {
  key: string;
  href: string;
}

interface Language {
  code: string;
  label: string;
  flag: string;
}

interface Currency {
  code: string;
  symbol: string;
  label: string;
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

const navItems: NavItem[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/atelier" },
  { key: "services", href: "/services" },
  { key: "projects", href: "/realisations" },
  { key: "shop", href: "/boutique" },
  { key: "contact", href: "/contact" },
];

const languages: Language[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
];

const currencies: Currency[] = [
  { code: "MAD", symbol: "DH", label: "Dirham (DH)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "USD", symbol: "$", label: "Dollar ($)" },
  { code: "GBP", symbol: "£", label: "Pound (£)" },
];

// ═══════════════════════════════════════════════════════════
// DROPDOWN COMPONENT
// ═══════════════════════════════════════════════════════════

function Dropdown({
  trigger,
  children,
  isOpen,
  onToggle,
  onClose,
  isRTL,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isRTL: boolean;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium",
          "rounded-lg transition-colors",
          "text-gray-700 hover:text-wood-primary hover:bg-gray-100",
          isRTL && "flex-row-reverse"
        )}
      >
        {trigger}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 py-1 bg-white rounded-lg shadow-lg border border-gray-100",
            "min-w-[140px] z-50",
            isRTL ? "left-0" : "right-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HEADER COMPONENT
// ═══════════════════════════════════════════════════════════

export interface HeaderProps {
  onMobileMenuOpen?: () => void;
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { isScrolled } = useScrollPosition();
  const direction = useDirection();
  const isRTL = direction === "rtl";

  const cartCount = useCartCount();
  const { currency, setCurrency } = useCurrencyStore();
  const { logoHeader, siteName, isLoaded: settingsLoaded } = useSiteSettings();

  // Dropdown states
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  // Get current language (non-null assertion safe since arrays are non-empty)
  const currentLang = languages.find((l) => l.code === locale) ?? languages[0]!;
  const currentCurrency = currencies.find((c) => c.code === currency) ?? currencies[0]!;

  // Check if link is active
  const isActive = (href: string) => {
    if (href === "/") {
      // Home is only active on exact match: /fr or /fr/
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    const localePath = `/${locale}${href}`;
    return pathname === localePath || pathname.startsWith(`${localePath}/`);
  };

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    // Save user's MANUAL language choice (highest priority)
    // This overrides auto-detection permanently
    const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
    document.cookie = `preferred-locale=${langCode}; path=/; max-age=${maxAge}; samesite=lax`;

    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${langCode}${pathWithoutLocale}`);
    setLangOpen(false);
  };

  // Handle currency change
  const handleCurrencyChange = (currencyCode: CurrencyCode) => {
    // Save user's MANUAL currency choice (highest priority)
    // This overrides auto-detection permanently
    localStorage.setItem("manual-currency-choice", currencyCode);

    setCurrency(currencyCode);
    setCurrencyOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* MOBILE HEADER: Hamburger LEFT | Logo CENTER | Cart RIGHT */}
        <div className="flex lg:hidden items-center justify-between h-16">
          {/* Left: Hamburger Menu (Mobile Only) */}
          <div className="w-10 flex items-center justify-start">
            <button
              onClick={onMobileMenuOpen}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Center: Logo (Mobile Only) */}
          <div className="flex-1 flex items-center justify-center">
            <Link href={`/${locale}`} className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoHeader || "/images/logo.png"}
                alt={siteName}
                className={cn(
                  "h-12 w-auto object-contain transition-opacity duration-300",
                  !settingsLoaded && "opacity-0"
                )}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  const fallback = img.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = "inline";
                }}
              />
              <span className="text-xl font-bold text-wood-primary hidden">
                {siteName}
              </span>
            </Link>
          </div>

          {/* Right: Cart Icon (Mobile Only) */}
          <div className="w-10 flex items-center justify-end">
            <Link
              href={`/${locale}/cart`}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t("cart")}
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 bg-wood-primary text-white text-xs",
                    "w-5 h-5 flex items-center justify-center rounded-full font-medium",
                    isRTL ? "-left-1" : "-right-1"
                  )}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* DESKTOP HEADER: Original Layout */}
        <div
          className={cn(
            "hidden lg:flex items-center justify-between h-20",
            isRTL && "flex-row-reverse"
          )}
        >
          {/* Logo - Desktop */}
          <Link href={`/${locale}`} className="flex-shrink-0 flex items-center min-w-[120px] min-h-[64px] lg:min-h-[80px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoHeader || "/images/logo.png"}
              alt={siteName}
              className={cn(
                "h-16 lg:h-20 w-auto object-contain transition-opacity duration-300",
                !settingsLoaded && "opacity-0"
              )}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
                const fallback = img.nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = "inline";
              }}
            />
            <span
              className="text-2xl font-bold text-wood-primary hidden"
            >
              {siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className={cn(
              "flex items-center gap-1",
              isRTL && "flex-row-reverse"
            )}
          >
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href === "/" ? "" : item.href}`}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive(item.href)
                    ? "text-wood-primary bg-wood-cream/60 shadow-sm"
                    : "text-gray-600 hover:text-wood-primary hover:bg-wood-cream/40 active:scale-95"
                )}
              >
                {t(item.key)}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-wood-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions - Desktop */}
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}
          >
            {/* Currency Switcher - Desktop */}
            <div>
              <Dropdown
                trigger={
                  <>
                    <Coins className="w-4 h-4" />
                    <span>{currentCurrency.symbol}</span>
                  </>
                }
                isOpen={currencyOpen}
                onToggle={() => {
                  setCurrencyOpen(!currencyOpen);
                  setLangOpen(false);
                }}
                onClose={() => setCurrencyOpen(false)}
                isRTL={isRTL}
              >
                {currencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr.code as CurrencyCode)}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors",
                      "flex items-center gap-2",
                      curr.code === currency && "bg-wood-light/30 text-wood-primary",
                      isRTL && "text-right flex-row-reverse"
                    )}
                  >
                    <span className="font-medium w-6">{curr.symbol}</span>
                    <span>{curr.label}</span>
                  </button>
                ))}
              </Dropdown>
            </div>

            {/* Language Switcher - Desktop */}
            <div>
              <Dropdown
                trigger={
                  <>
                    <Globe className="w-4 h-4" />
                    <span>{currentLang.flag}</span>
                  </>
                }
                isOpen={langOpen}
                onToggle={() => {
                  setLangOpen(!langOpen);
                  setCurrencyOpen(false);
                }}
                onClose={() => setLangOpen(false)}
                isRTL={isRTL}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors",
                      "flex items-center gap-2",
                      lang.code === locale && "bg-wood-light/30 text-wood-primary",
                      isRTL && "text-right flex-row-reverse"
                    )}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </Dropdown>
            </div>

            {/* Cart Icon - Desktop */}
            <Link
              href={`/${locale}/cart`}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t("cart")}
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 bg-wood-primary text-white text-xs",
                    "w-5 h-5 flex items-center justify-center rounded-full font-medium",
                    isRTL ? "-left-1" : "-right-1"
                  )}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Quote CTA - Desktop */}
            <Link
              href={`/${locale}/devis`}
              className={cn(
                "inline-flex items-center justify-center",
                "h-10 px-4 text-base rounded-lg gap-2",
                "bg-gradient-to-r from-wood-primary to-wood-secondary",
                "text-white shadow-md font-medium",
                "hover:brightness-110 transition-all duration-200"
              )}
            >
              <FileText className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {t("quote")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

Header.displayName = "Header";

export default Header;
