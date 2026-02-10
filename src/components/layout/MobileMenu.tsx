"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { useUIStore } from "@/stores/ui";
import { useCartCount } from "@/stores/cart";
import { useDirection } from "@/hooks/useDirection";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
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

// ═══════════════════════════════════════════════════════════
// MOBILE MENU COMPONENT
// ═══════════════════════════════════════════════════════════

export function MobileMenu() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const direction = useDirection();
  const isRTL = direction === "rtl";

  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const cartCount = useCartCount();

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

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed top-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-50 lg:hidden",
          "flex flex-col shadow-2xl",
          isRTL ? "left-0 animate-slide-in-left" : "right-0 animate-slide-in-right"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4 border-b",
            isRTL && "flex-row-reverse"
          )}
        >
          <Link href={`/${locale}`} onClick={closeMobileMenu}>
            <Image
              src="/images/logo.png"
              alt="LE TATCHE BOIS"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={closeMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-4">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href === "/" ? "" : item.href}`}
                  onClick={closeMobileMenu}
                  className={cn(
                    "block px-4 py-3 rounded-lg font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-wood-cream/60 text-wood-primary border-l-3 border-wood-primary"
                      : "text-gray-600 hover:bg-wood-cream/40 hover:text-wood-primary active:scale-[0.98]",
                    isRTL ? "text-right border-l-0 border-r-3" : ""
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
              className={cn(
                "flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg",
                isRTL && "flex-row-reverse"
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-3 font-medium text-gray-700",
                  isRTL && "flex-row-reverse"
                )}
              >
                <ShoppingCart className="w-5 h-5" />
                {t("cart")}
              </span>
              {cartCount > 0 && (
                <span className="bg-wood-primary text-white text-xs px-2 py-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t p-4 space-y-4">
          {/* Quote CTA */}
          <Link
            href={`/${locale}/devis`}
            onClick={closeMobileMenu}
            className={cn(
              "w-full inline-flex items-center justify-center",
              "h-10 px-4 text-base rounded-lg gap-2",
              "bg-gradient-to-r from-wood-primary to-wood-secondary",
              "text-white shadow-md font-medium",
              "hover:brightness-110 transition-all duration-200"
            )}
          >
            <FileText className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {t("quote")}
          </Link>

          {/* Language & Currency */}
          <div
            className={cn(
              "flex items-center justify-between",
              isRTL && "flex-row-reverse"
            )}
          >
            <LanguageSwitcher variant="default" />
            <CurrencySwitcher variant="default" />
          </div>

          {/* Contact */}
          <div
            className={cn(
              "pt-4 border-t space-y-2 text-sm text-gray-600",
              isRTL && "text-right"
            )}
          >
            <a
              href="tel:+212500000000"
              className={cn(
                "flex items-center gap-2 hover:text-wood-primary",
                isRTL && "flex-row-reverse"
              )}
            >
              <Phone className="w-4 h-4" />
              <span className="ltr-force">+212 5XX XX XX XX</span>
            </a>
            <a
              href="mailto:contact@letatche-bois.ma"
              className={cn(
                "flex items-center gap-2 hover:text-wood-primary",
                isRTL && "flex-row-reverse"
              )}
            >
              <Mail className="w-4 h-4" />
              contact@letatche-bois.ma
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

MobileMenu.displayName = "MobileMenu";

export default MobileMenu;
