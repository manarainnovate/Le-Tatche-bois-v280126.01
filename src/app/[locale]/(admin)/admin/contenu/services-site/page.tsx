"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Wrench,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import MultilingualInput from "@/components/admin/MultilingualInput";
import TranslateAllButton from "@/components/admin/TranslateAllButton";

// ═══════════════════════════════════════════════════════════
// CMS Site Services Manager
// (Different from CRM services - these are PUBLIC website services)
// ═══════════════════════════════════════════════════════════

interface SiteService {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string | null;
  titleEs: string | null;
  titleAr: string | null;
  shortDescFr: string | null;
  shortDescEn: string | null;
  shortDescEs: string | null;
  shortDescAr: string | null;
  fullDescFr: string | null;
  fullDescEn: string | null;
  fullDescEs: string | null;
  fullDescAr: string | null;
  icon: string | null;
  imageUrl: string | null;
  images: string[];
  order: number;
  isActive: boolean;
}

interface MultilingualValues {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

const ICONS = [
  { value: "hammer", label: "Menuiserie", emoji: "🔨" },
  { value: "door", label: "Portes", emoji: "🚪" },
  { value: "window", label: "Fenêtres", emoji: "🪟" },
  { value: "stairs", label: "Escaliers", emoji: "🪜" },
  { value: "kitchen", label: "Cuisines", emoji: "🍳" },
  { value: "closet", label: "Dressing", emoji: "👔" },
  { value: "table", label: "Meubles", emoji: "🪑" },
  { value: "wood", label: "Bois", emoji: "🪵" },
  { value: "tools", label: "Outillage", emoji: "🛠️" },
  { value: "design", label: "Design", emoji: "✏️" },
];

export default function SiteServicesPage() {
  const [services, setServices] = useState<SiteService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state with multilingual values
  const [titleValues, setTitleValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [shortDescValues, setShortDescValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [fullDescValues, setFullDescValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [formData, setFormData] = useState({
    slug: "",
    icon: "hammer",
    imageUrl: "",
    images: [] as string[],
    isActive: true,
    order: 0,
  });

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/cms/site-services");
      const data = await res.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Reset form
  const resetForm = () => {
    setTitleValues({ fr: "", en: "", es: "", ar: "" });
    setShortDescValues({ fr: "", en: "", es: "", ar: "" });
    setFullDescValues({ fr: "", en: "", es: "", ar: "" });
    setFormData({
      slug: "",
      icon: "hammer",
      imageUrl: "",
      images: [],
      isActive: true,
      order: services.length,
    });
    setEditingId(null);
  };

  // Save service
  const handleSave = async () => {
    if (!titleValues.fr || !formData.slug) {
      alert("Le titre en français et le slug sont requis");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        titleFr: titleValues.fr,
        titleEn: titleValues.en || null,
        titleEs: titleValues.es || null,
        titleAr: titleValues.ar || null,
        shortDescFr: shortDescValues.fr || null,
        shortDescEn: shortDescValues.en || null,
        shortDescEs: shortDescValues.es || null,
        shortDescAr: shortDescValues.ar || null,
        fullDescFr: fullDescValues.fr || null,
        fullDescEn: fullDescValues.en || null,
        fullDescEs: fullDescValues.es || null,
        fullDescAr: fullDescValues.ar || null,
        slug: formData.slug,
        icon: formData.icon,
        imageUrl: formData.imageUrl || null,
        images: formData.images,
        isActive: formData.isActive,
        order: formData.order,
      };

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/cms/site-services/${editingId}`
        : "/api/cms/site-services";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchServices();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Failed to save service:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  // Delete service
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;

    try {
      await fetch(`/api/cms/site-services/${id}`, { method: "DELETE" });
      fetchServices();
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  // Toggle active
  const handleToggleActive = async (service: SiteService) => {
    try {
      await fetch(`/api/cms/site-services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      fetchServices();
    } catch (error) {
      console.error("Failed to toggle service:", error);
    }
  };

  // Move service order
  const handleMove = async (service: SiteService, direction: "up" | "down") => {
    const currentIndex = services.findIndex((s) => s.id === service.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= services.length) return;

    const newServices = [...services];
    [newServices[currentIndex], newServices[newIndex]] = [
      newServices[newIndex],
      newServices[currentIndex],
    ];

    try {
      await Promise.all(
        newServices.map((s, i) =>
          fetch(`/api/cms/site-services/${s.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: i }),
          })
        )
      );
      fetchServices();
    } catch (error) {
      console.error("Failed to reorder services:", error);
    }
  };

  // New service
  const handleNew = () => {
    resetForm();
    setFormData(prev => ({ ...prev, order: services.length }));
    setShowModal(true);
  };

  // Edit service
  const handleEdit = (service: SiteService) => {
    setEditingId(service.id);
    setTitleValues({
      fr: service.titleFr || "",
      en: service.titleEn || "",
      es: service.titleEs || "",
      ar: service.titleAr || "",
    });
    setShortDescValues({
      fr: service.shortDescFr || "",
      en: service.shortDescEn || "",
      es: service.shortDescEs || "",
      ar: service.shortDescAr || "",
    });
    setFullDescValues({
      fr: service.fullDescFr || "",
      en: service.fullDescEn || "",
      es: service.fullDescEs || "",
      ar: service.fullDescAr || "",
    });
    setFormData({
      slug: service.slug,
      icon: service.icon || "hammer",
      imageUrl: service.imageUrl || "",
      images: service.images || [],
      isActive: service.isActive,
      order: service.order,
    });
    setShowModal(true);
  };

  const handleTitleChange = (values: MultilingualValues) => {
    setTitleValues(values);
    // Auto-generate slug from French title if new service
    if (!editingId && values.fr && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(values.fr) }));
    }
  };

  const getIconEmoji = (icon: string | null) => {
    return ICONS.find((i) => i.value === icon)?.emoji || "🔧";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services du Site</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les services affichés sur la page publique Services
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <Plus className="w-5 h-5" />
          Nouveau Service
        </button>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucun service configuré</p>
          <button
            onClick={handleNew}
            className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
          >
            Ajouter un service
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 flex items-center gap-4 ${
                !service.isActive ? "opacity-50" : ""
              }`}
            >
              {/* Order controls */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleMove(service, "up")}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-gray-500 text-center text-sm">
                  {index + 1}
                </span>
                <button
                  onClick={() => handleMove(service, "down")}
                  disabled={index === services.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Icon/Image */}
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-3xl">{getIconEmoji(service.icon)}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {service.titleFr}
                  </h3>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    /{service.slug}
                  </span>
                </div>
                {service.shortDescFr && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                    {service.shortDescFr}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className={service.titleFr ? "text-green-500" : ""}>FR {service.titleFr ? "✓" : "○"}</span>
                  <span className={service.titleEn ? "text-green-500" : ""}>EN {service.titleEn ? "✓" : "○"}</span>
                  <span className={service.titleEs ? "text-green-500" : ""}>ES {service.titleEs ? "✓" : "○"}</span>
                  <span className={service.titleAr ? "text-green-500" : ""}>AR {service.titleAr ? "✓" : "○"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`/fr/services/${service.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Voir sur le site"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`p-2 rounded-lg ${
                    service.isActive
                      ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={service.isActive ? "Désactiver" : "Activer"}
                >
                  {service.isActive ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
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
                {editingId ? "Modifier le Service" : "Nouveau Service"}
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
                    { fieldName: "shortDesc", values: shortDescValues, onChange: setShortDescValues },
                    { fieldName: "fullDesc", values: fullDescValues, onChange: setFullDescValues },
                  ]}
                />
              </div>

              {/* Title - 4 Languages */}
              <MultilingualInput
                label="Titre du service"
                required
                placeholder="Ex: Menuiserie sur mesure"
                values={titleValues}
                onChange={handleTitleChange}
              />

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug (URL) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">/services/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="menuiserie-sur-mesure"
                  />
                </div>
              </div>

              {/* Short Description - 4 Languages */}
              <MultilingualInput
                label="Description courte"
                type="textarea"
                rows={2}
                placeholder="Brève description affichée dans la liste des services"
                values={shortDescValues}
                onChange={setShortDescValues}
              />

              {/* Full Description - 4 Languages */}
              <MultilingualInput
                label="Description complète"
                type="textarea"
                rows={5}
                placeholder="Description détaillée affichée sur la page du service"
                values={fullDescValues}
                onChange={setFullDescValues}
              />

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icône
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: icon.value })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        formData.icon === icon.value
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/30"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <span className="text-xl">{icon.emoji}</span>
                      <span className="text-sm">{icon.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image principale du service
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="services"
                  aspectRatio="video"
                />
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Galerie d&apos;images ({formData.images.length} / 100)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Ajoutez entre 20 et 100 images pour le slider de la page du service
                </p>
                <MultiImageUpload
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                  folder="services"
                  maxImages={100}
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
                  Service actif (visible sur le site)
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
                disabled={saving || !titleValues.fr || !formData.slug}
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
