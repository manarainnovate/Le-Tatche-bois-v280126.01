"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

interface LanguageSwitcherProps {
  variant?: "dropdown" | "inline" | "compact";
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

const LANGUAGES: Language[] = [
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" },
];

// ═══════════════════════════════════════════════════════════
// LanguageSwitcher Component
// ═══════════════════════════════════════════════════════════

export default function LanguageSwitcher({
  variant = "dropdown",
  showFlag = true,
  showName = true,
  className = "",
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from pathname
  const currentLocale = pathname.split("/")[1] || "fr";
  const currentLanguage =
    LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  // Close dropdown when clicking outside
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

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    // Replace the locale in the current path
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
    const newPath = `/${langCode}${pathWithoutLocale || ""}`;

    router.push(newPath);
    setIsOpen(false);
  };

  // Dropdown variant
  if (variant === "dropdown") {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
          aria-label="Change language"
          aria-expanded={isOpen}
        >
          {showFlag && <span className="text-lg">{currentLanguage.flag}</span>}
          {showName && (
            <span className="text-sm font-medium">
              {currentLanguage.code.toUpperCase()}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fadeIn">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  lang.code === currentLocale
                    ? "bg-amber-50 dark:bg-amber-900/20"
                    : ""
                }`}
                dir={lang.dir}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex-1">
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    {lang.nativeName}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {lang.name}
                  </span>
                </div>
                {lang.code === currentLocale && (
                  <Check className="w-4 h-4 text-amber-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Inline variant (horizontal buttons)
  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              lang.code === currentLocale
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            title={lang.nativeName}
          >
            {showFlag && <span>{lang.flag}</span>}
            {showName && <span>{lang.code.toUpperCase()}</span>}
          </button>
        ))}
      </div>
    );
  }

  // Compact variant (icon only dropdown)
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="w-5 h-5" />
      </button>

      {/* Compact Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50 animate-fadeIn">
          <div className="flex gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  lang.code === currentLocale
                    ? "bg-amber-100 dark:bg-amber-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                title={lang.nativeName}
              >
                <span className="text-xl">{lang.flag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Footer Language Switcher - Special variant for footer
// ═══════════════════════════════════════════════════════════

export function FooterLanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || "fr";

  const handleLanguageChange = (langCode: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
    const newPath = `/${langCode}${pathWithoutLocale || ""}`;
    router.push(newPath);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
            lang.code === currentLocale
              ? "bg-amber-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.nativeName}</span>
        </button>
      ))}
    </div>
  );
}
