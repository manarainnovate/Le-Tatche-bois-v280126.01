"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Upload,
  X,
  ImageIcon,
  Loader2,
  GripVertical,
  Star,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    dragDrop: "Glissez-déposez des images ici",
    or: "ou",
    browse: "Parcourir",
    maxSize: "Max {size}MB par image",
    uploading: "Téléchargement...",
    mainImage: "Image principale",
    setAsMain: "Définir comme principale",
    removeImage: "Supprimer l'image",
  },
  en: {
    dragDrop: "Drag & drop images here",
    or: "or",
    browse: "Browse",
    maxSize: "Max {size}MB per image",
    uploading: "Uploading...",
    mainImage: "Main image",
    setAsMain: "Set as main",
    removeImage: "Remove image",
  },
  es: {
    dragDrop: "Arrastra y suelta imágenes aquí",
    or: "o",
    browse: "Explorar",
    maxSize: "Máximo {size}MB por imagen",
    uploading: "Subiendo...",
    mainImage: "Imagen principal",
    setAsMain: "Establecer como principal",
    removeImage: "Eliminar imagen",
  },
  ar: {
    dragDrop: "اسحب وأفلت الصور هنا",
    or: "أو",
    browse: "تصفح",
    maxSize: "الحد الأقصى {size} ميجابايت لكل صورة",
    uploading: "جاري الرفع...",
    mainImage: "الصورة الرئيسية",
    setAsMain: "تعيين كرئيسية",
    removeImage: "إزالة الصورة",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface UploadedImage {
  id: string;
  url: string;
  alt?: string;
  isMain?: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  locale?: string;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Image Uploader Component
// ═══════════════════════════════════════════════════════════

export function ImageUploader({
  images,
  onChange,
  maxImages = 10,
  maxSizeMB = 50,
  locale = "fr",
  className,
}: ImageUploaderProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Handle file upload
  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length >= maxImages) return;

    setIsUploading(true);
    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        continue;
      }

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Upload to Cloudinary via API
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "projects");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const upload = data.uploads?.[0];
          if (upload) {
            newImages.push({
              id: upload.publicId || `img-${Date.now()}-${i}`,
              url: upload.url,
              isMain: images.length === 0 && newImages.length === 0,
            });
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
      }

      if (images.length + newImages.length >= maxImages) break;
    }

    onChange([...images, ...newImages]);
    setIsUploading(false);
  }, [images, maxImages, maxSizeMB, onChange]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    void handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleUpload(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove image
  const handleRemove = (id: string) => {
    const newImages = images.filter((img) => img.id !== id);
    // If removed image was main, set first remaining as main
    if (newImages.length > 0 && !newImages.some((img) => img.isMain)) {
      const firstImage = newImages[0];
      if (firstImage) {
        firstImage.isMain = true;
      }
    }
    onChange(newImages);
  };

  // Set as main image
  const handleSetMain = (id: string) => {
    onChange(
      images.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
    );
  };

  // Drag reorder handlers
  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    if (!draggedImage) return;

    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500",
          images.length >= maxImages && "pointer-events-none opacity-50"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
            <p className="text-sm text-gray-500">{t.uploading}</p>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-gray-400" />
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.dragDrop}
            </p>
            <p className="mb-3 text-sm text-gray-500">{t.or}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              {t.browse}
            </button>
            <p className="mt-3 text-xs text-gray-400">
              {t.maxSize.replace("{size}", String(maxSizeMB))}
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleImageDragStart(index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragEnd={handleImageDragEnd}
              className={cn(
                "group relative aspect-square cursor-move overflow-hidden rounded-lg border",
                image.isMain
                  ? "border-amber-500 ring-2 ring-amber-500"
                  : "border-gray-200 dark:border-gray-700",
                draggedIndex === index && "opacity-50"
              )}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `Image ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Overlay Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleSetMain(image.id)}
                  className={cn(
                    "rounded-full p-2",
                    image.isMain
                      ? "bg-amber-500 text-white"
                      : "bg-white/80 text-gray-700 hover:bg-white"
                  )}
                  title={image.isMain ? t.mainImage : t.setAsMain}
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  className="rounded-full bg-white/80 p-2 text-red-600 hover:bg-white"
                  title={t.removeImage}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drag Handle */}
              <div className="absolute left-1 top-1 rounded bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-white" />
              </div>

              {/* Main Badge */}
              {image.isMain && (
                <div className="absolute bottom-1 left-1 rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                  {t.mainImage}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !isUploading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              {locale === "ar" ? "لا توجد صور" : locale === "es" ? "Sin imágenes" : locale === "en" ? "No images" : "Aucune image"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
