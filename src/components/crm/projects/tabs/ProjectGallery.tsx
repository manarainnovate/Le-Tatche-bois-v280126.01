"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  Map,
  Trash2,
  Download,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Media {
  id: string;
  url: string;
  filename: string;
  type: string;
  tag: string;
  description?: string | null;
  createdAt: string;
}

interface ProjectGalleryProps {
  projectId: string;
  media: Media[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  addMedia: string;
  noMedia: string;
  noMediaDescription: string;
  before: string;
  during: string;
  after: string;
  plan: string;
  signature: string;
  contract: string;
  other: string;
  image: string;
  video: string;
  document: string;
  planFile: string;
  delete: string;
  confirmDelete: string;
  uploadFile: string;
  selectFile: string;
  description: string;
  descriptionPlaceholder: string;
  type: string;
  tag: string;
  save: string;
  cancel: string;
  close: string;
}

const translations: Record<string, Translations> = {
  fr: {
    addMedia: "Ajouter un média",
    noMedia: "Aucun média",
    noMediaDescription: "Ajoutez des photos, vidéos ou documents",
    before: "Avant",
    during: "Pendant",
    after: "Après",
    plan: "Plan",
    signature: "Signature",
    contract: "Contrat",
    other: "Autre",
    image: "Image",
    video: "Vidéo",
    document: "Document",
    planFile: "Plan",
    delete: "Supprimer",
    confirmDelete: "Confirmer la suppression ?",
    uploadFile: "Télécharger un fichier",
    selectFile: "Sélectionner un fichier",
    description: "Description",
    descriptionPlaceholder: "Description du fichier...",
    type: "Type",
    tag: "Catégorie",
    save: "Enregistrer",
    cancel: "Annuler",
    close: "Fermer",
  },
  en: {
    addMedia: "Add media",
    noMedia: "No media",
    noMediaDescription: "Add photos, videos or documents",
    before: "Before",
    during: "During",
    after: "After",
    plan: "Plan",
    signature: "Signature",
    contract: "Contract",
    other: "Other",
    image: "Image",
    video: "Video",
    document: "Document",
    planFile: "Plan",
    delete: "Delete",
    confirmDelete: "Confirm deletion?",
    uploadFile: "Upload file",
    selectFile: "Select file",
    description: "Description",
    descriptionPlaceholder: "File description...",
    type: "Type",
    tag: "Category",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
  },
  es: {
    addMedia: "Agregar media",
    noMedia: "Sin media",
    noMediaDescription: "Agregue fotos, videos o documentos",
    before: "Antes",
    during: "Durante",
    after: "Después",
    plan: "Plano",
    signature: "Firma",
    contract: "Contrato",
    other: "Otro",
    image: "Imagen",
    video: "Video",
    document: "Documento",
    planFile: "Plano",
    delete: "Eliminar",
    confirmDelete: "¿Confirmar eliminación?",
    uploadFile: "Subir archivo",
    selectFile: "Seleccionar archivo",
    description: "Descripción",
    descriptionPlaceholder: "Descripción del archivo...",
    type: "Tipo",
    tag: "Categoría",
    save: "Guardar",
    cancel: "Cancelar",
    close: "Cerrar",
  },
  ar: {
    addMedia: "إضافة وسائط",
    noMedia: "لا وسائط",
    noMediaDescription: "أضف صور أو فيديوهات أو مستندات",
    before: "قبل",
    during: "أثناء",
    after: "بعد",
    plan: "مخطط",
    signature: "توقيع",
    contract: "عقد",
    other: "أخرى",
    image: "صورة",
    video: "فيديو",
    document: "مستند",
    planFile: "مخطط",
    delete: "حذف",
    confirmDelete: "تأكيد الحذف؟",
    uploadFile: "رفع ملف",
    selectFile: "اختر ملف",
    description: "الوصف",
    descriptionPlaceholder: "وصف الملف...",
    type: "النوع",
    tag: "الفئة",
    save: "حفظ",
    cancel: "إلغاء",
    close: "إغلاق",
  },
};

// ═══════════════════════════════════════════════════════════
// Media Config
// ═══════════════════════════════════════════════════════════

const mediaTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileText,
  PLAN: Map,
};

const tagColors: Record<string, { bg: string; text: string }> = {
  BEFORE: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  DURING: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
  AFTER: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
  PLAN: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  SIGNATURE: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
  CONTRACT: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
  OTHER: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectGallery({
  projectId,
  media: initialMedia,
  locale,
}: ProjectGalleryProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;

  const [media, setMedia] = useState(initialMedia);
  const [showForm, setShowForm] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    url: "",
    filename: "",
    type: "IMAGE",
    tag: "OTHER",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTagLabel = (tag: string) => {
    const tagMap: Record<string, keyof Translations> = {
      BEFORE: "before",
      DURING: "during",
      AFTER: "after",
      PLAN: "plan",
      SIGNATURE: "signature",
      CONTRACT: "contract",
      OTHER: "other",
    };
    return t[tagMap[tag] || "other"];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim() || !formData.filename.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/crm/projects/${projectId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add media");

      const result = await response.json();
      setMedia((prev) => [result.data, ...prev]);
      setFormData({
        url: "",
        filename: "",
        type: "IMAGE",
        tag: "OTHER",
        description: "",
      });
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding media:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const response = await fetch(
        `/api/crm/projects/${projectId}/media?mediaId=${mediaId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete media");

      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      setSelectedMedia(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  // Filter media by tag
  const filteredMedia = activeFilter
    ? media.filter((m) => m.tag === activeFilter)
    : media;

  // Group media by tag
  const groupedMedia = filteredMedia.reduce((acc, m) => {
    if (!acc[m.tag]) acc[m.tag] = [];
    acc[m.tag].push(m);
    return acc;
  }, {} as Record<string, Media[]>);

  const tags = ["BEFORE", "DURING", "AFTER", "PLAN", "OTHER"];

  return (
    <div className="space-y-6">
      {/* Header with Filter and Add Button */}
      <div className="flex items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveFilter(null)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap",
              !activeFilter
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
            )}
          >
            All ({media.length})
          </button>
          {tags.map((tag) => {
            const count = media.filter((m) => m.tag === tag).length;
            if (count === 0) return null;

            return (
              <button
                key={tag}
                onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap",
                  activeFilter === tag
                    ? cn(tagColors[tag].bg, tagColors[tag].text)
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                )}
              >
                {getTagLabel(tag)} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.addMedia}
        </button>
      </div>

      {/* Add Media Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.selectFile} *
              </label>
              <input
                type="text"
                value={formData.filename}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, filename: e.target.value }))
                }
                placeholder="filename.jpg"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.type}
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="IMAGE">{t.image}</option>
                <option value="VIDEO">{t.video}</option>
                <option value="DOCUMENT">{t.document}</option>
                <option value="PLAN">{t.planFile}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.tag}
              </label>
              <select
                value={formData.tag}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tag: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="BEFORE">{t.before}</option>
                <option value="DURING">{t.during}</option>
                <option value="AFTER">{t.after}</option>
                <option value="PLAN">{t.plan}</option>
                <option value="SIGNATURE">{t.signature}</option>
                <option value="CONTRACT">{t.contract}</option>
                <option value="OTHER">{t.other}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.description}
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder={t.descriptionPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* Gallery */}
      {media.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {t.noMedia}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.noMediaDescription}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const TypeIcon = mediaTypeIcons[item.type] || FileText;
            const tagConf = tagColors[item.tag] || tagColors.OTHER;

            return (
              <div
                key={item.id}
                className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {/* Thumbnail */}
                {item.type === "IMAGE" ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TypeIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm truncate px-2">
                    {item.filename}
                  </span>
                </div>

                {/* Tag Badge */}
                <span
                  className={cn(
                    "absolute top-2 left-2 px-2 py-0.5 text-xs rounded-full",
                    tagConf.bg,
                    tagConf.text
                  )}
                >
                  {getTagLabel(item.tag)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {selectedMedia.filename}
                </h3>
                {selectedMedia.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedMedia.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Download className="h-5 w-5" />
                </a>
                <button
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex items-center justify-center bg-gray-900 min-h-[400px]">
              {selectedMedia.type === "IMAGE" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.filename}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              ) : selectedMedia.type === "VIDEO" ? (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full max-h-[60vh]"
                />
              ) : (
                <div className="text-center">
                  <FileText className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                  <a
                    href={selectedMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-400"
                  >
                    {t.close}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectGallery;
