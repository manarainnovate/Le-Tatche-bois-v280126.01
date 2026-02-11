"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    dragDrop: "Glissez-déposez une image ici",
    or: "ou",
    browse: "Parcourir",
    maxSize: "Max {size}MB • JPG, PNG, GIF, WebP",
    uploading: "Téléchargement...",
    change: "Changer",
    remove: "Supprimer",
    retry: "Cliquez pour réessayer",
  },
  en: {
    dragDrop: "Drag & drop an image here",
    or: "or",
    browse: "Browse",
    maxSize: "Max {size}MB • JPG, PNG, GIF, WebP",
    uploading: "Uploading...",
    change: "Change",
    remove: "Remove",
    retry: "Click to retry",
  },
  es: {
    dragDrop: "Arrastra y suelta una imagen aquí",
    or: "o",
    browse: "Explorar",
    maxSize: "Máximo {size}MB • JPG, PNG, GIF, WebP",
    uploading: "Subiendo...",
    change: "Cambiar",
    remove: "Eliminar",
    retry: "Clic para reintentar",
  },
  ar: {
    dragDrop: "اسحب وأفلت صورة هنا",
    or: "أو",
    browse: "تصفح",
    maxSize: "الحد الأقصى {size} ميجابايت",
    uploading: "جاري الرفع...",
    change: "تغيير",
    remove: "إزالة",
    retry: "انقر لإعادة المحاولة",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  maxSizeMB?: number;
  locale?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
}

// ═══════════════════════════════════════════════════════════
// Image Upload Component (Single Image - Local Storage)
// ═══════════════════════════════════════════════════════════

export function ImageUpload({
  value,
  onChange,
  folder = "general",
  maxSizeMB = 50,
  locale = "fr",
  className,
  aspectRatio = "auto",
}: ImageUploadProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    auto: "",
  };

  // Handle file upload to local storage
  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Fichier trop volumineux. Max ${maxSizeMB}MB`);
        return;
      }

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image");
        return;
      }

      setIsUploading(true);

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
            onChange(url);
            console.log("✅ Image uploaded:", url);
          } else {
            setError("Upload échoué - pas d'URL retournée");
          }
        } else {
          setError(data.error || "Échec du téléchargement");
        }
      } catch (err) {
        console.error("Upload error:", err);
        setError("Erreur de connexion. Réessayez.");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSizeMB, onChange]
  );

  // Handle drag events
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
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        void handleUpload(file);
      } else {
        setError("Veuillez déposer une image");
      }
    },
    [handleUpload]
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove image
  const handleRemove = async () => {
    if (value && (value.startsWith("/uploads/") || value.startsWith("/api/uploads/"))) {
      // Try to delete from server
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        });
      } catch (err) {
        console.warn("Could not delete file:", err);
      }
    }
    onChange("");
    setError(null);
  };

  // If we have an image, show preview with change/remove options
  if (value) {
    return (
      <div className={cn("relative flex items-start gap-4", className)}>
        {/* Thumbnail preview — full image scaled down */}
        <div className="group relative h-[120px] w-[200px] flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.svg";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              {t.change}
            </button>
            <button
              type="button"
              onClick={() => void handleRemove()}
              className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
            >
              {t.remove}
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">{value.split("/").pop()}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  // Empty state - show upload zone
  return (
    <div className={cn(aspectClasses[aspectRatio], className)}>
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors cursor-pointer",
          isDragging
            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
            : error
            ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
            : "border-gray-300 hover:border-amber-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-amber-500 dark:hover:bg-gray-800"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.uploading}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            <p className="text-xs text-gray-500">{t.retry}</p>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-10 w-10 text-gray-400" />
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  );
}

export default ImageUpload;
