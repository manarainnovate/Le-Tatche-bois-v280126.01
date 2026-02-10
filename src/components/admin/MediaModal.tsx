"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  Copy,
  Trash2,
  Download,
  ExternalLink,
  Save,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MediaFile } from "./MediaItem";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    details: "Details du fichier",
    filename: "Nom du fichier",
    dimensions: "Dimensions",
    fileSize: "Taille",
    uploadDate: "Date d'upload",
    url: "URL",
    altText: "Texte alternatif",
    altTextPlaceholder: "Description de l'image pour l'accessibilite",
    copyUrl: "Copier l'URL",
    copied: "Copie!",
    openInNewTab: "Ouvrir",
    download: "Telecharger",
    delete: "Supprimer",
    save: "Enregistrer",
    saving: "Enregistrement...",
    confirmDelete: "Etes-vous sur de vouloir supprimer ce fichier ?",
    close: "Fermer",
  },
  en: {
    details: "File Details",
    filename: "Filename",
    dimensions: "Dimensions",
    fileSize: "File Size",
    uploadDate: "Upload Date",
    url: "URL",
    altText: "Alt Text",
    altTextPlaceholder: "Image description for accessibility",
    copyUrl: "Copy URL",
    copied: "Copied!",
    openInNewTab: "Open",
    download: "Download",
    delete: "Delete",
    save: "Save",
    saving: "Saving...",
    confirmDelete: "Are you sure you want to delete this file?",
    close: "Close",
  },
  es: {
    details: "Detalles del Archivo",
    filename: "Nombre del archivo",
    dimensions: "Dimensiones",
    fileSize: "Tamano",
    uploadDate: "Fecha de subida",
    url: "URL",
    altText: "Texto Alternativo",
    altTextPlaceholder: "Descripcion de la imagen para accesibilidad",
    copyUrl: "Copiar URL",
    copied: "Copiado!",
    openInNewTab: "Abrir",
    download: "Descargar",
    delete: "Eliminar",
    save: "Guardar",
    saving: "Guardando...",
    confirmDelete: "Esta seguro de eliminar este archivo?",
    close: "Cerrar",
  },
  ar: {
    details: "تفاصيل الملف",
    filename: "اسم الملف",
    dimensions: "الأبعاد",
    fileSize: "حجم الملف",
    uploadDate: "تاريخ الرفع",
    url: "الرابط",
    altText: "النص البديل",
    altTextPlaceholder: "وصف الصورة لإمكانية الوصول",
    copyUrl: "نسخ الرابط",
    copied: "تم النسخ!",
    openInNewTab: "فتح",
    download: "تحميل",
    delete: "حذف",
    save: "حفظ",
    saving: "جاري الحفظ...",
    confirmDelete: "هل أنت متأكد من حذف هذا الملف؟",
    close: "إغلاق",
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
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

interface MediaModalProps {
  file: MediaFile;
  onClose: () => void;
  onSave?: (file: MediaFile) => Promise<void>;
  onDelete?: (id: string) => void;
  locale?: string;
}

export function MediaModal({
  file,
  onClose,
  onSave,
  onDelete,
  locale = "fr",
}: MediaModalProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [altText, setAltText] = useState(file.alt);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasChanges = altText !== file.alt;

  // Handle copy URL
  const handleCopyUrl = () => {
    void navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      await onSave({ ...file, alt: altText });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (confirm(t.confirmDelete)) {
      onDelete?.(file.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="flex w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800"
      >
        {/* Image Preview */}
        <div className="flex flex-1 items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
          <div className="relative max-h-[70vh] max-w-full">
            <Image
              src={file.url}
              alt={file.alt || file.filename}
              width={file.width}
              height={file.height}
              className="max-h-[70vh] w-auto object-contain"
            />
          </div>
        </div>

        {/* Details Panel */}
        <div className="flex w-80 flex-col border-s border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t.details}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Filename */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.filename}
                </label>
                <p className="mt-1 break-all text-sm font-medium text-gray-900 dark:text-white">
                  {file.filename}
                </p>
              </div>

              {/* Dimensions */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.dimensions}
                </label>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {file.width} x {file.height} px
                </p>
              </div>

              {/* File Size */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.fileSize}
                </label>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Upload Date */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.uploadDate}
                </label>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(file.createdAt, locale)}
                </p>
              </div>

              {/* URL */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.url}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={file.url}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    title={t.copyUrl}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.altText}
                </label>
                <textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder={t.altTextPlaceholder}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            {/* Quick Actions */}
            <div className="mb-4 flex gap-2">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4" />
                {t.openInNewTab}
              </a>
              <a
                href={file.url}
                download={file.filename}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                {t.download}
              </a>
            </div>

            {/* Save / Delete */}
            <div className="flex gap-2">
              {onDelete && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="me-2 h-4 w-4" />
                  {t.delete}
                </Button>
              )}
              {onSave && (
                <Button
                  onClick={() => void handleSave()}
                  disabled={!hasChanges || saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Save className="me-2 h-4 w-4" />
                      {t.save}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
