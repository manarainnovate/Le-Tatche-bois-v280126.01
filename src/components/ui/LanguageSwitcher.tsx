"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Globe } from "lucide-react";
import { useDirection } from "@/hooks/useDirection";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface LanguageSwitcherProps {
  /** Variant style */
  variant?: "default" | "minimal" | "icon-only";
  /** Custom className */
  className?: string;
  /** Show native name instead of English */
  showNativeName?: boolean;
}

// ═══════════════════════════════════════════════════════════
// LANGUAGES DATA
// ═══════════════════════════════════════════════════════════

const languages: Language[] = [
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇲🇦" },
];

// ═══════════════════════════════════════════════════════════
// DROPDOWN MENU COMPONENT
// ═══════════════════════════════════════════════════════════

function DropdownMenu({
  languages,
  currentCode,
  onSelect,
  direction,
  showNativeName,
}: {
  languages: Language[];
  currentCode: string;
  onSelect: (code: string) => void;
  direction: "ltr" | "rtl";
  showNativeName: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-wood-light",
        "min-w-[160px] z-50",
        "animate-in fade-in-0 zoom-in-95",
        direction === "rtl" ? "left-0" : "right-0"
      )}
      role="menu"
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
            "hover:bg-wood-light/50",
            currentCode === lang.code && "bg-wood-light/30"
          )}
          role="menuitem"
        >
          <span className="text-lg">{lang.flag}</span>
          <span className="flex-1 text-start">
            {showNativeName ? lang.nativeName : lang.name}
          </span>
          {currentCode === lang.code && (
            <Check className="w-4 h-4 text-wood-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LANGUAGE SWITCHER COMPONENT
// ═══════════════════════════════════════════════════════════

export function LanguageSwitcher({
  variant = "default",
  className,
  showNativeName = true,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const direction = useDirection();

  const currentLanguage =
    languages.find((l) => l.code === locale) ?? languages[0]!;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Remove current locale prefix and add new one
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${langCode}${pathWithoutLocale}`);
    setIsOpen(false);
  };

  // Icon-only variant
  if (variant === "icon-only") {
    return (
      <div ref={dropdownRef} className={cn("relative", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-2 hover:bg-wood-light/50 rounded-lg transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary"
          )}
          aria-label="Change language"
          aria-expanded={isOpen}
        >
          <Globe className="w-5 h-5 text-wood-primary" />
        </button>

        {isOpen && (
          <DropdownMenu
            languages={languages}
            currentCode={locale}
            onSelect={handleLanguageChange}
            direction={direction}
            showNativeName={showNativeName}
          />
        )}
      </div>
    );
  }

  // Default and minimal variants
  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-wood-light/50 border border-wood-light",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary",
          variant === "minimal" && "border-0 px-2"
        )}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        {variant === "default" && (
          <>
            <span className="text-sm font-medium text-wood-dark">
              {showNativeName
                ? currentLanguage.nativeName
                : currentLanguage.name}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-wood-muted transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {isOpen && (
        <DropdownMenu
          languages={languages}
          currentCode={locale}
          onSelect={handleLanguageChange}
          direction={direction}
          showNativeName={showNativeName}
        />
      )}
    </div>
  );
}

LanguageSwitcher.displayName = "LanguageSwitcher";

export default LanguageSwitcher;
