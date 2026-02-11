"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image, File, Loader2 } from "lucide-react";

interface FileItem {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface MultiFileUploadProps {
  value: FileItem[];
  onChange: (files: FileItem[]) => void;
  maxSize?: number; // in MB
  maxFiles?: number;
  accept?: string;
  locale?: string;
}

const translations = {
  fr: {
    upload: "Télécharger des fichiers",
    dragDrop: "Glissez-déposez ou cliquez pour sélectionner",
    maxSize: "Taille max",
    maxFiles: "Max",
    files: "fichiers",
    remove: "Supprimer",
    uploading: "Téléchargement...",
    total: "Total",
    error: "Erreur",
    fileTooLarge: "Le fichier est trop volumineux",
    tooManyFiles: "Trop de fichiers",
  },
  en: {
    upload: "Upload files",
    dragDrop: "Drag and drop or click to select",
    maxSize: "Max size",
    maxFiles: "Max",
    files: "files",
    remove: "Remove",
    uploading: "Uploading...",
    total: "Total",
    error: "Error",
    fileTooLarge: "File is too large",
    tooManyFiles: "Too many files",
  },
  es: {
    upload: "Subir archivos",
    dragDrop: "Arrastra y suelta o haz clic para seleccionar",
    maxSize: "Tamaño máx",
    maxFiles: "Máx",
    files: "archivos",
    remove: "Eliminar",
    uploading: "Subiendo...",
    total: "Total",
    error: "Error",
    fileTooLarge: "El archivo es demasiado grande",
    tooManyFiles: "Demasiados archivos",
  },
  ar: {
    upload: "تحميل الملفات",
    dragDrop: "اسحب وأفلت أو انقر للاختيار",
    maxSize: "الحجم الأقصى",
    maxFiles: "الحد الأقصى",
    files: "ملفات",
    remove: "إزالة",
    uploading: "جاري التحميل...",
    total: "المجموع",
    error: "خطأ",
    fileTooLarge: "الملف كبير جدًا",
    tooManyFiles: "عدد كبير جدًا من الملفات",
  },
};

export function MultiFileUpload({
  value,
  onChange,
  maxSize = 100, // 100MB default
  maxFiles = 10,
  accept = "*/*",
  locale = "fr",
}: MultiFileUploadProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTotalSize = () => {
    const totalBytes = value.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(totalBytes);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (type.includes("pdf")) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const uploadFiles = async (files: FileList) => {
    setError("");

    // Check file count
    if (value.length + files.length > maxFiles) {
      setError(`${t.tooManyFiles} (${t.maxFiles}: ${maxFiles})`);
      return;
    }

    // Check individual file sizes
    const maxBytes = maxSize * 1024 * 1024;
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxBytes) {
        setError(`${files[i].name}: ${t.fileTooLarge} (${t.maxSize}: ${maxSize}MB)`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadedFiles: FileItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        uploadedFiles.push({
          name: file.name,
          url: data.url,
          size: file.size,
          type: file.type,
        });
      }

      onChange([...value, ...uploadedFiles]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void uploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void uploadFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-3">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
            : "border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-amber-600"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                {t.uploading}
              </p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.dragDrop}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.maxSize}: {maxSize}MB · {t.maxFiles}: {maxFiles} {t.files}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span>
              {value.length} {t.files}
            </span>
            <span>
              {t.total}: {getTotalSize()}
            </span>
          </div>
          <div className="space-y-2">
            {value.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex-shrink-0 text-amber-600 dark:text-amber-400">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="flex-shrink-0 rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
