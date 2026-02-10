"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Quote,
  Star,
  Eye,
  EyeOff,
  User,
  Loader2,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import MultilingualInput from "@/components/admin/MultilingualInput";
import TranslateAllButton from "@/components/admin/TranslateAllButton";

// ═══════════════════════════════════════════════════════════
// CMS Testimonials Manager
// ═══════════════════════════════════════════════════════════

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  authorImage: string | null;
  contentFr: string;
  contentEn: string | null;
  contentEs: string | null;
  contentAr: string | null;
  rating: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

interface MultilingualValues {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "featured" | "inactive">("all");

  // Form state
  const [contentValues, setContentValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [formData, setFormData] = useState({
    authorName: "",
    authorRole: "",
    authorCompany: "",
    authorImage: "",
    rating: 5,
    isFeatured: false,
    isActive: true,
  });

  // Fetch testimonials
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/cms/testimonials");
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setContentValues({ fr: "", en: "", es: "", ar: "" });
    setFormData({
      authorName: "",
      authorRole: "",
      authorCompany: "",
      authorImage: "",
      rating: 5,
      isFeatured: false,
      isActive: true,
    });
    setEditingId(null);
  };

  // Save testimonial
  const handleSave = async () => {
    if (!formData.authorName || !contentValues.fr) {
      alert("Le nom de l'auteur et le témoignage en français sont requis");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        authorName: formData.authorName,
        authorRole: formData.authorRole || null,
        authorCompany: formData.authorCompany || null,
        authorImage: formData.authorImage || null,
        contentFr: contentValues.fr,
        contentEn: contentValues.en || null,
        contentEs: contentValues.es || null,
        contentAr: contentValues.ar || null,
        rating: formData.rating,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/cms/testimonials/${editingId}`
        : "/api/cms/testimonials";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchTestimonials();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Failed to save testimonial:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  // Delete testimonial
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;

    try {
      await fetch(`/api/cms/testimonials/${id}`, { method: "DELETE" });
      fetchTestimonials();
    } catch (error) {
      console.error("Failed to delete testimonial:", error);
    }
  };

  // Toggle active
  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      await fetch(`/api/cms/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !testimonial.isActive }),
      });
      fetchTestimonials();
    } catch (error) {
      console.error("Failed to toggle testimonial:", error);
    }
  };

  // Toggle featured
  const handleToggleFeatured = async (testimonial: Testimonial) => {
    try {
      await fetch(`/api/cms/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !testimonial.isFeatured }),
      });
      fetchTestimonials();
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  // New testimonial
  const handleNew = () => {
    resetForm();
    setShowModal(true);
  };

  // Edit testimonial
  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setContentValues({
      fr: testimonial.contentFr || "",
      en: testimonial.contentEn || "",
      es: testimonial.contentEs || "",
      ar: testimonial.contentAr || "",
    });
    setFormData({
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole || "",
      authorCompany: testimonial.authorCompany || "",
      authorImage: testimonial.authorImage || "",
      rating: testimonial.rating,
      isFeatured: testimonial.isFeatured,
      isActive: testimonial.isActive,
    });
    setShowModal(true);
  };

  // Filter testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === "featured") return t.isFeatured;
    if (filter === "inactive") return !t.isActive;
    return true;
  });

  // Render stars
  const renderStars = (rating: number, editable = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={() =>
              editable && setFormData({ ...formData, rating: star })
            }
            className={`${editable ? "cursor-pointer" : "cursor-default"}`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Témoignages</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les avis clients affichés sur le site
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <Plus className="w-5 h-5" />
          Nouveau Témoignage
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === "all"
              ? "bg-amber-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Tous ({testimonials.length})
        </button>
        <button
          onClick={() => setFilter("featured")}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === "featured"
              ? "bg-amber-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          En vedette ({testimonials.filter((t) => t.isFeatured).length})
        </button>
        <button
          onClick={() => setFilter("inactive")}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === "inactive"
              ? "bg-amber-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Inactifs ({testimonials.filter((t) => !t.isActive).length})
        </button>
      </div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto" />
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucun témoignage</p>
          <button
            onClick={handleNew}
            className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
          >
            Ajouter un témoignage
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 relative ${
                !testimonial.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Featured badge */}
              {testimonial.isFeatured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-medium">
                    En vedette
                  </span>
                </div>
              )}

              {/* Quote icon */}
              <Quote className="w-8 h-8 text-amber-200 dark:text-amber-800 mb-4" />

              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-4">
                &quot;{testimonial.contentFr}&quot;
              </p>

              {/* Translation status */}
              <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                <span className={testimonial.contentFr ? "text-green-500" : ""}>FR {testimonial.contentFr ? "✓" : "○"}</span>
                <span className={testimonial.contentEn ? "text-green-500" : ""}>EN {testimonial.contentEn ? "✓" : "○"}</span>
                <span className={testimonial.contentEs ? "text-green-500" : ""}>ES {testimonial.contentEs ? "✓" : "○"}</span>
                <span className={testimonial.contentAr ? "text-green-500" : ""}>AR {testimonial.contentAr ? "✓" : "○"}</span>
              </div>

              {/* Rating */}
              <div className="mb-4">{renderStars(testimonial.rating)}</div>

              {/* Author */}
              <div className="flex items-center gap-3">
                {testimonial.authorImage ? (
                  <img
                    src={testimonial.authorImage}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {testimonial.authorName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {[testimonial.authorRole, testimonial.authorCompany]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={() => handleToggleFeatured(testimonial)}
                  className={`p-2 rounded-lg ${
                    testimonial.isFeatured
                      ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={
                    testimonial.isFeatured
                      ? "Retirer de la vedette"
                      : "Mettre en vedette"
                  }
                >
                  <Star
                    className={`w-5 h-5 ${
                      testimonial.isFeatured ? "fill-amber-600" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={() => handleToggleActive(testimonial)}
                  className={`p-2 rounded-lg ${
                    testimonial.isActive
                      ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={testimonial.isActive ? "Désactiver" : "Activer"}
                >
                  {testimonial.isActive ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? "Modifier le Témoignage" : "Nouveau Témoignage"}
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
                    Remplissez le témoignage en français, puis cliquez pour traduire
                  </p>
                </div>
                <TranslateAllButton
                  fields={[
                    { fieldName: "content", values: contentValues, onChange: setContentValues },
                  ]}
                />
              </div>

              {/* Author Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photo de l&apos;auteur
                </label>
                <ImageUpload
                  value={formData.authorImage}
                  onChange={(url) => setFormData({ ...formData, authorImage: url })}
                  folder="general"
                  aspectRatio="square"
                />
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l&apos;auteur *
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fonction
                  </label>
                  <input
                    type="text"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Architecte"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.authorCompany}
                    onChange={(e) => setFormData({ ...formData, authorCompany: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Studio Architecture"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note
                </label>
                {renderStars(formData.rating, true)}
              </div>

              {/* Content - 4 Languages */}
              <MultilingualInput
                label="Témoignage"
                type="textarea"
                rows={4}
                required
                placeholder="Un travail remarquable..."
                values={contentValues}
                onChange={setContentValues}
              />

              {/* Options */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Actif
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="isFeatured" className="text-sm text-gray-700 dark:text-gray-300">
                    En vedette
                  </label>
                </div>
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
                disabled={saving || !formData.authorName || !contentValues.fr}
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
