"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, Loader2, AlertCircle } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    dragDrop: "Glissez-deposez des images ici",
    or: "ou",
    browse: "Parcourir les fichiers",
    maxSize: "Taille max: {size}MB par fichier",
    uploading: "Telechargement en cours...",
    uploadComplete: "Telechargement termine",
    error: "Erreur de telechargement",
    filesSelected: "{count} fichier(s) selectionne(s)",
    invalidType: "Type de fichier non valide",
    tooLarge: "Fichier trop volumineux",
  },
  en: {
    dragDrop: "Drag and drop images here",
    or: "or",
    browse: "Browse files",
    maxSize: "Max size: {size}MB per file",
    uploading: "Uploading...",
    uploadComplete: "Upload complete",
    error: "Upload error",
    filesSelected: "{count} file(s) selected",
    invalidType: "Invalid file type",
    tooLarge: "File too large",
  },
  es: {
    dragDrop: "Arrastra y suelta imagenes aqui",
    or: "o",
    browse: "Explorar archivos",
    maxSize: "Tamano max: {size}MB por archivo",
    uploading: "Subiendo...",
    uploadComplete: "Subida completa",
    error: "Error de subida",
    filesSelected: "{count} archivo(s) seleccionado(s)",
    invalidType: "Tipo de archivo no valido",
    tooLarge: "Archivo demasiado grande",
  },
  ar: {
    dragDrop: "اسحب وأفلت الصور هنا",
    or: "أو",
    browse: "تصفح الملفات",
    maxSize: "الحد الأقصى: {size} ميجابايت لكل ملف",
    uploading: "جاري الرفع...",
    uploadComplete: "اكتمل الرفع",
    error: "خطأ في الرفع",
    filesSelected: "تم اختيار {count} ملف(ات)",
    invalidType: "نوع ملف غير صالح",
    tooLarge: "الملف كبير جداً",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  error?: string;
}

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
  locale?: string;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function UploadZone({
  onUpload,
  maxSizeMB = 50,
  accept = "image/*",
  multiple = true,
  locale = "fr",
  className,
}: UploadZoneProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check type
    if (!file.type.startsWith("image/")) {
      return t.invalidType;
    }
    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return t.tooLarge;
    }
    return null;
  };

  // Handle files
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const validFiles: File[] = [];
      const newUploads: UploadProgress[] = [];

      // Validate each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        const error = validateFile(file);
        if (error) {
          newUploads.push({
            fileName: file.name,
            progress: 0,
            status: "error",
            error,
          });
        } else {
          validFiles.push(file);
          newUploads.push({
            fileName: file.name,
            progress: 0,
            status: "uploading",
          });
        }
      }

      setUploads(newUploads);

      if (validFiles.length > 0) {
        setIsUploading(true);

        try {
          // Simulate progress
          for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            if (!file) continue;

            // Update progress
            setUploads((prev) =>
              prev.map((u) =>
                u.fileName === file.name ? { ...u, progress: 50 } : u
              )
            );
          }

          await onUpload(validFiles);

          // Mark complete
          setUploads((prev) =>
            prev.map((u) =>
              u.status === "uploading" ? { ...u, progress: 100, status: "complete" } : u
            )
          );

          // Clear after delay
          setTimeout(() => {
            setUploads([]);
          }, 2000);
        } catch {
          setUploads((prev) =>
            prev.map((u) =>
              u.status === "uploading"
                ? { ...u, status: "error", error: t.error }
                : u
            )
          );
        } finally {
          setIsUploading(false);
        }
      }
    },
    [onUpload, maxSizeMB, t]
  );

  // Drag handlers
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
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  // File input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
          isDragging
            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
            : "border-gray-300 hover:border-amber-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-amber-500 dark:hover:bg-gray-800",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t.uploading}
            </p>
          </div>
        ) : (
          <>
            <Upload className="mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.dragDrop}
            </p>
            <p className="mb-4 text-sm text-gray-500">{t.or}</p>
            <button
              type="button"
              className="rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              {t.browse}
            </button>
            <p className="mt-4 text-xs text-gray-400">
              {t.maxSize.replace("{size}", String(maxSizeMB))}
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={`${upload.fileName}-${index}`}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3",
                upload.status === "error"
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                  : upload.status === "complete"
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              )}
            >
              {upload.status === "uploading" && (
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              )}
              {upload.status === "complete" && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {upload.status === "error" && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                  {upload.fileName}
                </p>
                {upload.error && (
                  <p className="text-xs text-red-500">{upload.error}</p>
                )}
              </div>

              {upload.status === "uploading" && (
                <div className="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-amber-600 transition-all"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
