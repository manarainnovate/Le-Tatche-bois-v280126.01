"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  Edit,
  Trash2,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface MediaFile {
  id: string;
  url: string;
  filename: string;
  alt: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  createdAt: Date;
}

interface MediaItemProps {
  file: MediaFile;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (file: MediaFile) => void;
  onDelete?: (id: string) => void;
  onCopyUrl?: (url: string) => void;
  viewMode?: "grid" | "list";
  locale?: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    copyUrl: "Copier l'URL",
    copied: "Copie!",
    edit: "Modifier",
    delete: "Supprimer",
    download: "Telecharger",
    openInNewTab: "Ouvrir dans un nouvel onglet",
  },
  en: {
    copyUrl: "Copy URL",
    copied: "Copied!",
    edit: "Edit",
    delete: "Delete",
    download: "Download",
    openInNewTab: "Open in new tab",
  },
  es: {
    copyUrl: "Copiar URL",
    copied: "Copiado!",
    edit: "Editar",
    delete: "Eliminar",
    download: "Descargar",
    openInNewTab: "Abrir en nueva pestana",
  },
  ar: {
    copyUrl: "نسخ الرابط",
    copied: "تم النسخ!",
    edit: "تعديل",
    delete: "حذف",
    download: "تحميل",
    openInNewTab: "فتح في علامة تبويب جديدة",
  },
};

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function MediaItem({
  file,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onCopyUrl,
  viewMode = "grid",
  locale = "fr",
}: MediaItemProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const [copied, setCopied] = useState(false);

  // Handle copy URL
  const handleCopyUrl = () => {
    void navigator.clipboard.writeText(file.url);
    setCopied(true);
    onCopyUrl?.(file.url);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle click
  const handleClick = () => {
    if (onSelect) {
      onSelect(file.id);
    }
  };

  // Grid View
  if (viewMode === "grid") {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-lg border bg-white transition-all dark:bg-gray-800",
          isSelected
            ? "border-amber-500 ring-2 ring-amber-500"
            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
        )}
      >
        {/* Image */}
        <div
          onClick={handleClick}
          className="relative aspect-square cursor-pointer"
        >
          <Image
            src={file.url}
            alt={file.alt || file.filename}
            fill
            className="object-cover"
          />

          {/* Selection Checkbox */}
          {onSelect && (
            <div
              className={cn(
                "absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded border transition-all",
                isSelected
                  ? "border-amber-500 bg-amber-500"
                  : "border-white/80 bg-white/80 opacity-0 group-hover:opacity-100"
              )}
            >
              {isSelected && <Check className="h-3 w-3 text-white" />}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyUrl();
              }}
              className="rounded-full bg-white/90 p-2 text-gray-700 hover:bg-white"
              title={copied ? t.copied : t.copyUrl}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(file);
                }}
                className="rounded-full bg-white/90 p-2 text-gray-700 hover:bg-white"
                title={t.edit}
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.id);
                }}
                className="rounded-full bg-white/90 p-2 text-red-600 hover:bg-white"
                title={t.delete}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-2">
          <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
            {file.filename}
          </p>
          <p className="text-xs text-gray-400">
            {file.width}x{file.height} • {formatFileSize(file.size)}
          </p>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-all",
        isSelected
          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
          : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
      )}
    >
      {/* Checkbox */}
      {onSelect && (
        <div
          className={cn(
            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border",
            isSelected
              ? "border-amber-500 bg-amber-500"
              : "border-gray-300 dark:border-gray-600"
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={file.url}
          alt={file.alt || file.filename}
          fill
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-gray-900 dark:text-white">
          {file.filename}
        </p>
        <p className="text-sm text-gray-500">
          {file.width}x{file.height} • {formatFileSize(file.size)} • {formatDate(file.createdAt, locale)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCopyUrl();
          }}
          className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
          title={copied ? t.copied : t.copyUrl}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(file);
            }}
            className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:hover:bg-gray-700"
            title={t.edit}
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.id);
            }}
            className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            title={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
