"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Target,
  Building2,
  FolderKanban,
  FileText,
  Package,
  User,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface SearchResult {
  id: string;
  type: "lead" | "client" | "project" | "document" | "product" | "user";
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  href: string;
}

interface LocalizedStrings {
  placeholder: string;
  noResults: string;
  searching: string;
  recentSearches: string;
  clearRecent: string;
  leads: string;
  clients: string;
  projects: string;
  documents: string;
  products: string;
  users: string;
  pressEsc: string;
}

const translations: Record<string, LocalizedStrings> = {
  fr: {
    placeholder: "Rechercher leads, clients, projets...",
    noResults: "Aucun resultat trouve",
    searching: "Recherche en cours...",
    recentSearches: "Recherches recentes",
    clearRecent: "Effacer",
    leads: "Leads",
    clients: "Clients",
    projects: "Projets",
    documents: "Documents",
    products: "Produits",
    users: "Utilisateurs",
    pressEsc: "Appuyez sur Echap pour fermer",
  },
  en: {
    placeholder: "Search leads, clients, projects...",
    noResults: "No results found",
    searching: "Searching...",
    recentSearches: "Recent searches",
    clearRecent: "Clear",
    leads: "Leads",
    clients: "Clients",
    projects: "Projects",
    documents: "Documents",
    products: "Products",
    users: "Users",
    pressEsc: "Press Esc to close",
  },
  es: {
    placeholder: "Buscar prospectos, clientes, proyectos...",
    noResults: "No se encontraron resultados",
    searching: "Buscando...",
    recentSearches: "Busquedas recientes",
    clearRecent: "Borrar",
    leads: "Prospectos",
    clients: "Clientes",
    projects: "Proyectos",
    documents: "Documentos",
    products: "Productos",
    users: "Usuarios",
    pressEsc: "Presione Esc para cerrar",
  },
  ar: {
    placeholder: "بحث عن العملاء المحتملين والعملاء والمشاريع...",
    noResults: "لم يتم العثور على نتائج",
    searching: "جاري البحث...",
    recentSearches: "عمليات البحث الأخيرة",
    clearRecent: "مسح",
    leads: "العملاء المحتملون",
    clients: "العملاء",
    projects: "المشاريع",
    documents: "المستندات",
    products: "المنتجات",
    users: "المستخدمون",
    pressEsc: "اضغط Esc للإغلاق",
  },
};

// ═══════════════════════════════════════════════════════════
// Icon Mapping
// ═══════════════════════════════════════════════════════════

const typeIcons: Record<SearchResult["type"], React.ComponentType<{ className?: string }>> = {
  lead: Target,
  client: Building2,
  project: FolderKanban,
  document: FileText,
  product: Package,
  user: User,
};

const typeColors: Record<SearchResult["type"], string> = {
  lead: "text-blue-500 bg-blue-50",
  client: "text-emerald-500 bg-emerald-50",
  project: "text-amber-500 bg-amber-50",
  document: "text-purple-500 bg-purple-50",
  product: "text-orange-500 bg-orange-50",
  user: "text-gray-500 bg-gray-50",
};

// ═══════════════════════════════════════════════════════════
// Global Search Component
// ═══════════════════════════════════════════════════════════

interface GlobalSearchProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ locale, isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);

  const t = (translations[locale as keyof typeof translations] ?? translations.fr) as LocalizedStrings;

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("crm-recent-searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const maxIndex = results.length > 0 ? results.length - 1 : recentSearches.length - 1;
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const items = results.length > 0 ? results : recentSearches;
        const selected = items[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, recentSearches, selectedIndex, onClose]);

  // Search API call
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle selection
  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    const newRecent = [result, ...recentSearches.filter((r) => r.id !== result.id)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("crm-recent-searches", JSON.stringify(newRecent));

    // Navigate
    router.push(`/${locale}${result.href}`);
    onClose();
    setQuery("");
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("crm-recent-searches");
  };

  if (!isOpen) return null;

  const displayItems = query.trim() ? results : recentSearches;
  const showRecentHeader = !query.trim() && recentSearches.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-start justify-center pt-[10vh] px-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 h-14 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-lg"
            />
            {isLoading && <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Recent searches header */}
            {showRecentHeader && (
              <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
                <span>{t.recentSearches}</span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {t.clearRecent}
                </button>
              </div>
            )}

            {/* No results */}
            {query.trim() && !isLoading && results.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p>{t.noResults}</p>
              </div>
            )}

            {/* Results list */}
            {displayItems.length > 0 && (
              <ul className="py-2">
                {displayItems.map((item, index) => {
                  const Icon = typeIcons[item.type];
                  const colorClass = typeColors[item.type];

                  return (
                    <li key={`${item.type}-${item.id}`}>
                      <button
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                          selectedIndex === index
                            ? "bg-amber-50 dark:bg-amber-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        )}
                      >
                        {/* Icon */}
                        <span className={cn("flex-shrink-0 p-2 rounded-lg", colorClass)}>
                          <Icon className="h-4 w-4" />
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                          )}
                        </div>

                        {/* Badge */}
                        {item.badge && (
                          <span
                            className={cn(
                              "flex-shrink-0 px-2 py-0.5 text-xs rounded-full",
                              item.badgeColor || "bg-gray-100 text-gray-600"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Arrow */}
                        {selectedIndex === index && (
                          <ArrowRight className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                    ↑↓
                  </kbd>
                  <span>Navigation</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                    ↵
                  </kbd>
                  <span>Select</span>
                </span>
              </div>
              <span>{t.pressEsc}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Global Search Trigger (for Header)
// ═══════════════════════════════════════════════════════════

interface GlobalSearchTriggerProps {
  locale: string;
  className?: string;
}

export function GlobalSearchTrigger({ locale, className }: GlobalSearchTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = (translations[locale as keyof typeof translations] ?? translations.fr) as LocalizedStrings;

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600",
          "text-gray-500 dark:text-gray-400 transition-colors",
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">{t.placeholder}</span>
        <kbd className="hidden sm:inline-flex h-5 items-center px-1.5 text-[10px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
          ⌘K
        </kbd>
      </button>

      <GlobalSearch locale={locale} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Default Export
// ═══════════════════════════════════════════════════════════

export default GlobalSearch;
