"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Loader2, GripVertical, Plus, AlertCircle, CheckSquare, Square, Trash2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    dragDrop: "Glissez-déposez des images ici",
    or: "ou",
    browse: "Parcourir",
    maxSize: "Max {size}MB par image • JPG, PNG, GIF, WebP",
    uploading: "Téléchargement...",
    removeImage: "Supprimer",
    addMore: "Ajouter",
    retry: "Cliquez pour réessayer",
    errorSize: "Fichier trop volumineux",
    errorType: "Type de fichier non supporté",
    imagesCount: "{count} / {max} images",
    selectAll: "Tout sélectionner",
    deselectAll: "Tout désélectionner",
    deleteSelected: "Supprimer ({count})",
    confirmDeleteSelected: "Supprimer les {count} images sélectionnées ?",
  },
  en: {
    dragDrop: "Drag & drop images here",
    or: "or",
    browse: "Browse",
    maxSize: "Max {size}MB per image • JPG, PNG, GIF, WebP",
    uploading: "Uploading...",
    removeImage: "Remove",
    addMore: "Add more",
    retry: "Click to retry",
    errorSize: "File too large",
    errorType: "File type not supported",
    imagesCount: "{count} / {max} images",
    selectAll: "Select all",
    deselectAll: "Deselect all",
    deleteSelected: "Delete ({count})",
    confirmDeleteSelected: "Delete {count} selected images?",
  },
  es: {
    dragDrop: "Arrastra y suelta imágenes aquí",
    or: "o",
    browse: "Explorar",
    maxSize: "Máximo {size}MB por imagen • JPG, PNG, GIF, WebP",
    uploading: "Subiendo...",
    removeImage: "Eliminar",
    addMore: "Añadir más",
    retry: "Clic para reintentar",
    errorSize: "Archivo demasiado grande",
    errorType: "Tipo de archivo no soportado",
    imagesCount: "{count} / {max} imágenes",
    selectAll: "Seleccionar todo",
    deselectAll: "Deseleccionar todo",
    deleteSelected: "Eliminar ({count})",
    confirmDeleteSelected: "¿Eliminar las {count} imágenes seleccionadas?",
  },
  ar: {
    dragDrop: "اسحب وأفلت الصور هنا",
    or: "أو",
    browse: "تصفح",
    maxSize: "الحد الأقصى {size} ميجابايت لكل صورة",
    uploading: "جاري الرفع...",
    removeImage: "إزالة",
    addMore: "إضافة المزيد",
    retry: "انقر لإعادة المحاولة",
    errorSize: "الملف كبير جداً",
    errorType: "نوع الملف غير مدعوم",
    imagesCount: "{count} / {max} صور",
    selectAll: "تحديد الكل",
    deselectAll: "إلغاء التحديد",
    deleteSelected: "حذف ({count})",
    confirmDeleteSelected: "حذف {count} صور محددة؟",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  maxImages?: number;
  maxSizeMB?: number;
  locale?: string;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Multi Image Upload Component (Local Storage)
// ═══════════════════════════════════════════════════════════

export function MultiImageUpload({
  value,
  onChange,
  folder = "general",
  maxImages = 20,
  maxSizeMB = 50,
  locale = "fr",
  className,
}: MultiImageUploadProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Toggle individual image selection
  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Select all / deselect all
  const toggleSelectAll = () => {
    if (selectedIndices.size === value.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(value.map((_, i) => i)));
    }
  };

  // Delete selected images
  const handleDeleteSelected = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (selectedIndices.size === 0) return;
    const msg = t.confirmDeleteSelected.replace("{count}", String(selectedIndices.size));
    if (!confirm(msg)) return;

    // Collect URLs to delete from server (in background)
    const urlsToDelete = Array.from(selectedIndices)
      .map((idx) => value[idx])
      .filter((url): url is string => !!url && url.startsWith("/uploads/"));

    // Update UI instantly (optimistic)
    const newUrls = value.filter((_, i) => !selectedIndices.has(i));
    setSelectedIndices(new Set());
    onChange(newUrls);

    // Fire server deletes in background (don't block UI)
    if (urlsToDelete.length > 0) {
      Promise.allSettled(
        urlsToDelete.map((url) =>
          fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          }).catch(() => {})
        )
      );
    }
  };

  // Handle file upload to local storage
  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (value.length >= maxImages) return;

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      const newUrls: string[] = [];
      const errors: string[] = [];
      const filesToUpload = Array.from(files).slice(0, maxImages - value.length);
      const totalFiles = filesToUpload.length;

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        if (!file) continue;

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name}: ${t.errorSize}`);
          continue;
        }

        // Check if it's an image
        if (!file.type.startsWith("image/")) {
          errors.push(`${file.name}: ${t.errorType}`);
          continue;
        }

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", folder);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (response.ok) {
            // Support both direct url and uploads array format
            const url = data.url || data.uploads?.[0]?.url;
            if (url) {
              newUrls.push(url);
              console.log("✅ Image uploaded:", url);
            }
          } else {
            errors.push(`${file.name}: ${data.error || "Upload failed"}`);
          }
        } catch (err) {
          console.error("Upload error:", err);
          errors.push(`${file.name}: Connection error`);
        }

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
      }

      if (errors.length > 0) {
        setError(errors.join(", "));
      }

      setIsUploading(false);
      setUploadProgress(0);
    },
    [value, maxImages, maxSizeMB, folder, onChange, t.errorSize, t.errorType]
  );

  // Handle drag events for file drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      void handleUpload(e.dataTransfer.files);
    },
    [handleUpload]
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleUpload(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove image (with server delete for local files)
  const handleRemove = (index: number) => {
    const urlToRemove = value[index];

    // Clear selection to avoid stale indices
    setSelectedIndices(new Set());

    // Update UI instantly
    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);

    // Fire server delete in background (don't block UI)
    if (urlToRemove && urlToRemove.startsWith("/uploads/")) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToRemove }),
      }).catch(() => {});
    }
  };

  // Drag reorder handlers
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newUrls = [...value];
    const draggedUrl = newUrls[draggedIndex];
    if (!draggedUrl) return;

    newUrls.splice(draggedIndex, 1);
    newUrls.splice(index, 0, draggedUrl);
    onChange(newUrls);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selection Toolbar */}
      {value.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={toggleSelectAll}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              selectedIndices.size === value.length && value.length > 0
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-gray-300 bg-white text-gray-600 hover:border-amber-400 hover:text-amber-600"
            )}
          >
            {selectedIndices.size === value.length && value.length > 0 ? (
              <CheckSquare className="h-3.5 w-3.5" />
            ) : (
              <Square className="h-3.5 w-3.5" />
            )}
            {selectedIndices.size === value.length && value.length > 0 ? t.deselectAll : t.selectAll}
          </button>
          {selectedIndices.size > 0 && (
            <button
              type="button"
              onClick={() => handleDeleteSelected()}
              className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t.deleteSelected.replace("{count}", String(selectedIndices.size))}
            </button>
          )}
        </div>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragEnd={handleImageDragEnd}
              className={cn(
                "group relative aspect-square cursor-move overflow-hidden rounded-lg border-2 transition-colors",
                selectedIndices.has(index)
                  ? "border-amber-500 ring-2 ring-amber-300"
                  : "border-gray-200 dark:border-gray-700",
                draggedIndex === index && "opacity-50"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-image.svg";
                }}
              />

              {/* Selection Checkbox */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleSelect(index); }}
                className={cn(
                  "absolute top-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded transition-opacity",
                  selectedIndices.has(index)
                    ? "bg-amber-500 text-white opacity-100"
                    : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                )}
              >
                {selectedIndices.has(index) ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>

              {/* Overlay Actions */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                  title={t.removeImage}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drag Handle */}
              <div className="absolute left-1 top-1 rounded bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-white" />
              </div>

              {/* Index Badge */}
              <div className="absolute bottom-1 right-1 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                {index + 1}
              </div>
            </div>
          ))}

          {/* Add More Button */}
          {canAddMore && !isUploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-amber-500 hover:text-amber-500 dark:border-gray-600"
            >
              <Plus className="h-8 w-8" />
            </button>
          )}
        </div>
      )}

      {/* Upload Zone (show when no images) */}
      {value.length === 0 && !isUploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer",
            isDragging
              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
              : error
              ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
              : "border-gray-300 hover:border-amber-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-amber-500 dark:hover:bg-gray-800"
          )}
        >
          {error ? (
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              <p className="text-xs text-gray-500">{t.retry}</p>
            </div>
          ) : (
            <>
              <Upload className="mb-3 h-10 w-10 text-gray-400" />
              <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.dragDrop}
              </p>
              <p className="mb-3 text-sm text-gray-500">{t.or}</p>
              <span className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">
                {t.browse}
              </span>
              <p className="mt-3 text-xs text-gray-400">
                {t.maxSize.replace("{size}", String(maxSizeMB))}
              </p>
            </>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 p-8 dark:bg-amber-900/20">
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-amber-600" />
          <p className="text-sm text-gray-600 dark:text-gray-300">{t.uploading}</p>
          <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">{uploadProgress}%</p>
        </div>
      )}

      {/* Images Count */}
      {value.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t.imagesCount.replace("{count}", String(value.length)).replace("{max}", String(maxImages))}
        </p>
      )}

      {/* Error Display (when images exist) */}
      {error && value.length > 0 && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}

export default MultiImageUpload;
