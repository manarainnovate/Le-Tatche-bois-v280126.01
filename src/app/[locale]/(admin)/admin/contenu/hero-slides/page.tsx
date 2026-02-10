"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  Video,
  Eye,
  EyeOff,
  Loader2,
  Upload,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import MultilingualInput from "@/components/admin/MultilingualInput";
import TranslateAllButton from "@/components/admin/TranslateAllButton";

// ═══════════════════════════════════════════════════════════
// CMS Hero Slides Manager
// ═══════════════════════════════════════════════════════════

interface HeroSlide {
  id: string;
  targetPage: string;
  mediaType: string;
  imageUrl: string | null;
  videoUrl: string | null;
  videoPoster: string | null;
  titleFr: string;
  titleEn: string | null;
  titleEs: string | null;
  titleAr: string | null;
  subtitleFr: string | null;
  subtitleEn: string | null;
  subtitleEs: string | null;
  subtitleAr: string | null;
  ctaTextFr: string | null;
  ctaTextEn: string | null;
  ctaUrl: string | null;
  order: number;
  isActive: boolean;
}

interface MultilingualValues {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

const PAGES = [
  { slug: "home", label: "Accueil" },
  { slug: "atelier", label: "Atelier" },
  { slug: "services", label: "Services" },
  { slug: "realisations", label: "Réalisations" },
  { slug: "boutique", label: "Boutique" },
  { slug: "contact", label: "Contact" },
];

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state with multilingual values
  const [titleValues, setTitleValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [subtitleValues, setSubtitleValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [ctaTextValues, setCtaTextValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [formData, setFormData] = useState({
    mediaType: "image" as "image" | "video",
    imageUrl: "",
    videoUrl: "",
    videoPoster: "",
    ctaUrl: "",
    isActive: true,
    order: 0,
  });
  const [videoUploading, setVideoUploading] = useState(false);

  // Fetch slides
  useEffect(() => {
    fetchSlides();
  }, [selectedPage]);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/hero-slides?pageSlug=${selectedPage}`);
      const data = await res.json();
      setSlides(data.slides || []);
    } catch (error) {
      console.error("Failed to fetch slides:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitleValues({ fr: "", en: "", es: "", ar: "" });
    setSubtitleValues({ fr: "", en: "", es: "", ar: "" });
    setCtaTextValues({ fr: "", en: "", es: "", ar: "" });
    setFormData({
      mediaType: "image",
      imageUrl: "",
      videoUrl: "",
      videoPoster: "",
      ctaUrl: "",
      isActive: true,
      order: slides.length,
    });
    setEditingId(null);
  };

  // Save slide
  const handleSave = async () => {
    if (!titleValues.fr) {
      alert("Le titre en français est requis");
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        targetPage: selectedPage,
        mediaType: formData.mediaType,
        titleFr: titleValues.fr,
        titleEn: titleValues.en || undefined,
        titleEs: titleValues.es || undefined,
        titleAr: titleValues.ar || undefined,
        subtitleFr: subtitleValues.fr || undefined,
        subtitleEn: subtitleValues.en || undefined,
        subtitleEs: subtitleValues.es || undefined,
        subtitleAr: subtitleValues.ar || undefined,
        ctaTextFr: ctaTextValues.fr || undefined,
        ctaTextEn: ctaTextValues.en || undefined,
        ctaUrl: formData.ctaUrl || undefined,
        imageUrl: formData.imageUrl || null,
        videoUrl: formData.videoUrl || null,
        videoPoster: formData.videoPoster || null,
        isActive: formData.isActive,
        order: formData.order,
      };

      // Remove undefined values so Zod doesn't reject them
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/cms/hero-slides/${editingId}`
        : "/api/cms/hero-slides";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchSlides();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || error.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Failed to save slide:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  // Delete slide
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette slide ?")) return;

    try {
      await fetch(`/api/cms/hero-slides/${id}`, { method: "DELETE" });
      fetchSlides();
    } catch (error) {
      console.error("Failed to delete slide:", error);
    }
  };

  // Toggle active
  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await fetch(`/api/cms/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });
      fetchSlides();
    } catch (error) {
      console.error("Failed to toggle slide:", error);
    }
  };

  // Move slide to a specific position (1-based input)
  const handleSetPosition = async (slide: HeroSlide, targetPos: number) => {
    const currentIndex = slides.findIndex((s) => s.id === slide.id);
    // Clamp to valid range (1-based → 0-based)
    const newIndex = Math.max(0, Math.min(slides.length - 1, targetPos - 1));

    if (newIndex === currentIndex) return;

    const newSlides = [...slides];
    // Remove from current position
    const [moved] = newSlides.splice(currentIndex, 1);
    // Insert at new position
    newSlides.splice(newIndex, 0, moved);

    try {
      await Promise.all(
        newSlides.map((s, i) =>
          fetch(`/api/cms/hero-slides/${s.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: i }),
          })
        )
      );
      fetchSlides();
    } catch (error) {
      console.error("Failed to reorder slides:", error);
    }
  };

  // New slide
  const handleNew = () => {
    resetForm();
    setFormData(prev => ({ ...prev, order: slides.length }));
    setShowModal(true);
  };

  // Edit slide
  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setTitleValues({
      fr: slide.titleFr || "",
      en: slide.titleEn || "",
      es: slide.titleEs || "",
      ar: slide.titleAr || "",
    });
    setSubtitleValues({
      fr: slide.subtitleFr || "",
      en: slide.subtitleEn || "",
      es: slide.subtitleEs || "",
      ar: slide.subtitleAr || "",
    });
    setCtaTextValues({
      fr: slide.ctaTextFr || "",
      en: slide.ctaTextEn || "",
      es: "",
      ar: "",
    });
    setFormData({
      mediaType: (slide.mediaType as "image" | "video") || "image",
      imageUrl: slide.imageUrl || "",
      videoUrl: slide.videoUrl || "",
      videoPoster: slide.videoPoster || "",
      ctaUrl: slide.ctaUrl || "",
      isActive: slide.isActive,
      order: slide.order,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bannières Hero</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les slides/bannières de chaque page
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Slide
        </button>
      </div>

      {/* Page Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {PAGES.map((page) => (
            <button
              key={page.slug}
              onClick={() => setSelectedPage(page.slug)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                selectedPage === page.slug
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slides List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto" />
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucune slide pour cette page</p>
          <button
            onClick={handleNew}
            className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
          >
            Ajouter une slide
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 flex items-center gap-4 ${
                !slide.isActive ? "opacity-50" : ""
              }`}
            >
              {/* Position input */}
              <div className="flex flex-col items-center gap-0.5">
                <input
                  type="number"
                  min={1}
                  max={slides.length}
                  defaultValue={index + 1}
                  key={`${slide.id}-${index}`}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val !== index + 1) {
                      handleSetPosition(slide, val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className={`w-10 h-10 text-center rounded-full text-sm font-bold border-2 outline-none transition-colors
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    ${index === 0
                      ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700"
                      : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                    } focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800`}
                  title="Tapez un numéro pour changer la position"
                />
                <span className="text-[9px] text-gray-400">/{slides.length}</span>
              </div>

              {/* Media preview */}
              <div className="w-32 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                {slide.mediaType === "video" && slide.videoUrl ? (
                  <>
                    {slide.videoPoster ? (
                      <img src={slide.videoPoster} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <video src={slide.videoUrl} className="w-full h-full object-cover" muted preload="metadata" />
                    )}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-white text-[10px] font-medium flex items-center gap-1">
                      <Video className="w-3 h-3" /> Video
                    </div>
                  </>
                ) : slide.imageUrl ? (
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {slide.titleFr || "(Sans titre)"}
                  </h3>
                  {index === 0 && <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded font-semibold">1er</span>}
                </div>
                {slide.subtitleFr && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {slide.subtitleFr}
                  </p>
                )}
                {slide.ctaUrl && (
                  <p className="text-xs text-amber-600 mt-1">
                    CTA: {slide.ctaTextFr} → {slide.ctaUrl}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className={slide.titleFr ? "text-green-500" : ""}>FR {slide.titleFr ? "✓" : "○"}</span>
                  <span className={slide.titleEn ? "text-green-500" : ""}>EN {slide.titleEn ? "✓" : "○"}</span>
                  <span className={slide.titleEs ? "text-green-500" : ""}>ES {slide.titleEs ? "✓" : "○"}</span>
                  <span className={slide.titleAr ? "text-green-500" : ""}>AR {slide.titleAr ? "✓" : "○"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(slide)}
                  className={`p-2 rounded-lg ${
                    slide.isActive
                      ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  title={slide.isActive ? "Désactiver" : "Activer"}
                >
                  {slide.isActive ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(slide)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? "Modifier la Slide" : "Nouvelle Slide"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Auto-Translate Section */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Traduction automatique</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Remplissez les champs en français, puis cliquez pour traduire
                  </p>
                </div>
                <TranslateAllButton
                  fields={[
                    { fieldName: "title", values: titleValues, onChange: setTitleValues },
                    { fieldName: "subtitle", values: subtitleValues, onChange: setSubtitleValues },
                    { fieldName: "ctaText", values: ctaTextValues, onChange: setCtaTextValues },
                  ]}
                />
              </div>

              {/* Media Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de média
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: "image" })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.mediaType === "image"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: "video" })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.mediaType === "video"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    Video
                  </button>
                </div>
              </div>

              {/* Conditional Media Upload */}
              {formData.mediaType === "image" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image de la bannière
                  </label>
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    folder="general"
                    aspectRatio="wide"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Video (MP4 ou WebM, max 50MB)
                    </label>
                    {formData.videoUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-amber-300 bg-black max-w-lg">
                        <video
                          src={formData.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="cursor-pointer bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">
                            Changer
                            <input
                              type="file"
                              accept="video/mp4,video/webm"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 50 * 1024 * 1024) { alert("Max 50MB"); return; }
                                setVideoUploading(true);
                                const fd = new FormData();
                                fd.append("file", file);
                                try {
                                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                                  if (res.ok) {
                                    const data = await res.json();
                                    setFormData(prev => ({ ...prev, videoUrl: data.url }));
                                  }
                                } catch { alert("Erreur upload"); }
                                finally { setVideoUploading(false); }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, videoUrl: "", videoPoster: "" })}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center aspect-video max-w-lg border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        videoUploading
                          ? "border-amber-400 bg-amber-50/50"
                          : "border-gray-300 dark:border-gray-600 hover:border-amber-400 hover:bg-amber-50/50"
                      }`}>
                        {videoUploading ? (
                          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-2" />
                        ) : (
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        )}
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {videoUploading ? "Upload en cours..." : "Cliquer pour uploader une video"}
                        </span>
                        <span className="text-sm text-gray-400 mt-1">MP4, WebM - max 50MB</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          disabled={videoUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 50 * 1024 * 1024) { alert("Max 50MB"); return; }
                            setVideoUploading(true);
                            const fd = new FormData();
                            fd.append("file", file);
                            try {
                              const res = await fetch("/api/upload", { method: "POST", body: fd });
                              if (res.ok) {
                                const data = await res.json();
                                setFormData(prev => ({ ...prev, videoUrl: data.url }));
                              }
                            } catch { alert("Erreur upload"); }
                            finally { setVideoUploading(false); }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Video Poster */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image de couverture (affichée pendant le chargement)
                    </label>
                    <ImageUpload
                      value={formData.videoPoster}
                      onChange={(url) => setFormData({ ...formData, videoPoster: url })}
                      folder="general"
                      aspectRatio="wide"
                    />
                  </div>
                </div>
              )}

              {/* Title - 4 Languages */}
              <MultilingualInput
                label="Titre de la bannière"
                required
                placeholder="Ex: L'Art du Bois Marocain"
                values={titleValues}
                onChange={setTitleValues}
              />

              {/* Subtitle - 4 Languages */}
              <MultilingualInput
                label="Sous-titre"
                type="textarea"
                rows={2}
                placeholder="Ex: Menuiserie artisanale à Marrakech"
                values={subtitleValues}
                onChange={setSubtitleValues}
              />

              {/* CTA Label - 4 Languages */}
              <MultilingualInput
                label="Texte du bouton (CTA)"
                placeholder="Ex: Découvrir nos services"
                values={ctaTextValues}
                onChange={setCtaTextValues}
              />

              {/* CTA Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lien du bouton (CTA)
                </label>
                <input
                  type="text"
                  value={formData.ctaUrl}
                  onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="/services"
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Slide active (visible sur le site)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !titleValues.fr || (formData.mediaType === "image" ? !formData.imageUrl : !formData.videoUrl)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
