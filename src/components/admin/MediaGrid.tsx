"use client";

import { cn } from "@/lib/utils";
import { MediaItem, type MediaFile } from "./MediaItem";
import { ImageIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    noMedia: "Aucun media",
    noMediaDesc: "Telechargez des images pour les voir ici",
    noResults: "Aucun resultat",
    noResultsDesc: "Aucun media ne correspond a votre recherche",
  },
  en: {
    noMedia: "No media",
    noMediaDesc: "Upload images to see them here",
    noResults: "No results",
    noResultsDesc: "No media matches your search",
  },
  es: {
    noMedia: "Sin medios",
    noMediaDesc: "Sube imagenes para verlas aqui",
    noResults: "Sin resultados",
    noResultsDesc: "Ningun medio coincide con tu busqueda",
  },
  ar: {
    noMedia: "لا توجد وسائط",
    noMediaDesc: "ارفع صوراً لرؤيتها هنا",
    noResults: "لا توجد نتائج",
    noResultsDesc: "لا توجد وسائط تطابق بحثك",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

interface MediaGridProps {
  files: MediaFile[];
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onEdit?: (file: MediaFile) => void;
  onDelete?: (id: string) => void;
  onCopyUrl?: (url: string) => void;
  viewMode?: "grid" | "list";
  isSearching?: boolean;
  locale?: string;
  className?: string;
}

export function MediaGrid({
  files,
  selectedIds = [],
  onSelect,
  onEdit,
  onDelete,
  onCopyUrl,
  viewMode = "grid",
  isSearching = false,
  locale = "fr",
  className,
}: MediaGridProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  // Empty state
  if (files.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600", className)}>
        <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {isSearching ? t.noResults : t.noMedia}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {isSearching ? t.noResultsDesc : t.noMediaDesc}
        </p>
      </div>
    );
  }

  // Grid View
  if (viewMode === "grid") {
    return (
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          className
        )}
      >
        {files.map((file) => (
          <MediaItem
            key={file.id}
            file={file}
            isSelected={selectedIds.includes(file.id)}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onCopyUrl={onCopyUrl}
            viewMode="grid"
            locale={locale}
          />
        ))}
      </div>
    );
  }

  // List View
  return (
    <div className={cn("space-y-2", className)}>
      {files.map((file) => (
        <MediaItem
          key={file.id}
          file={file}
          isSelected={selectedIds.includes(file.id)}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopyUrl={onCopyUrl}
          viewMode="list"
          locale={locale}
        />
      ))}
    </div>
  );
}
