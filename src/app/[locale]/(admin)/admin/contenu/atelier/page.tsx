"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Plus, Edit2, Trash2, Save, X,
  Image as ImageIcon, Video, Eye, EyeOff,
  ChevronUp, ChevronDown, GripVertical,
  Loader2, Upload, Hammer, ExternalLink,
  BookOpen, Cog, Heart, Users, Zap, Pin,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import MultilingualInput from "@/components/admin/MultilingualInput";
import TranslateAllButton from "@/components/admin/TranslateAllButton";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toaster";

// ═══════════════════════════════════════════════════════════
// Types
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

interface PageSection {
  id?: string;
  sectionKey: string;
  titleFr: string; titleEn: string; titleEs: string; titleAr: string;
  subtitleFr: string; subtitleEn: string; subtitleEs: string; subtitleAr: string;
  contentFr: string; contentEn: string; contentEs: string; contentAr: string;
  imageUrl: string; videoUrl: string;
  bgImage: string;
  ctaTextFr: string; ctaTextEn: string; ctaTextEs: string; ctaTextAr: string;
  ctaUrl: string;
  cta2TextFr: string; cta2TextEn: string; cta2TextEs: string; cta2TextAr: string;
  cta2Url: string;
  order: number; isActive: boolean;
}

type TabId = "slides" | "story" | "process" | "machines" | "values" | "team" | "cta";

// ═══════════════════════════════════════════════════════════
// Tab config
// ═══════════════════════════════════════════════════════════

const TABS: Array<{ id: TabId; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "slides", icon: ImageIcon },
  { id: "story", icon: BookOpen },
  { id: "process", icon: Hammer },
  { id: "machines", icon: Cog },
  { id: "values", icon: Heart },
  { id: "team", icon: Users },
  { id: "cta", icon: Zap },
];

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Contenu Atelier",
    subtitle: "Gérez le contenu de la page Atelier",
    previewLink: "Voir la page",
    // Tab labels
    slides: "Slides Hero",
    story: "Notre Histoire",
    process: "Processus",
    machines: "Équipements",
    values: "Valeurs",
    team: "Équipe",
    cta: "Appel à l'action",
    // Slides
    newSlide: "Ajouter une slide",
    editSlide: "Modifier la slide",
    noSlides: "Aucune slide",
    addFirst: "Ajouter votre première slide",
    mediaType: "Type de média",
    bannerImage: "Image de la bannière",
    videoLabel: "Vidéo (MP4 ou WebM, max 50MB)",
    videoPoster: "Image de couverture",
    slideTitle: "Titre de la slide",
    slideSubtitle: "Sous-titre",
    ctaLabel: "Texte du bouton (CTA)",
    ctaUrlLabel: "Lien du bouton (CTA)",
    activeLabel: "Active (visible sur le site)",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Enregistré !",
    deleteConfirm: "Supprimer cette slide ?",
    titleRequired: "Le titre en français est requis",
    autoTranslate: "Traduction automatique",
    autoTranslateDesc: "Remplissez en français, puis cliquez pour traduire",
    uploadVideo: "Cliquer pour uploader une vidéo",
    uploading: "Upload en cours...",
    change: "Changer",
    remove: "Supprimer",
    errorSave: "Erreur lors de l'enregistrement",
    // Section fields
    sectionTitle: "Titre",
    sectionSubtitle: "Sous-titre",
    sectionContent: "Contenu",
    sectionImage: "Image",
    ctaText: "Texte du bouton",
    ctaUrl: "URL du bouton",
    cta2Text: "2ème bouton (texte)",
    cta2Url: "2ème bouton (URL)",
    sectionActive: "Section visible",
    sectionHidden: "Section masquée",
    equipmentImages: "Images des équipements",
    equipmentImagesDesc: "Ajoutez une photo pour chaque équipement (200×200 recommandé)",
    machineNames: ["CNC 5 Axes", "Scie à Panneaux", "Dégauchisseuse-Raboteuse", "Tour à Bois", "Cabine de Finition", "Outils Traditionnels"],
    processImages: "Images des étapes",
    processImagesDesc: "Ajoutez une photo pour chaque étape du processus",
    processNames: ["Sélection du Bois", "Conception & Design", "Découpe CNC", "Sculpture à la Main", "Assemblage", "Finition & Vernissage"],
    teamMembers: "Membres de l'équipe",
    teamMembersDesc: "Ajoutez une photo et modifiez les informations de chaque membre",
    addMember: "Ajouter un membre",
    memberName: "Nom",
    memberRole: "Rôle / Poste",
    memberExperience: "Expérience (ex: 20+)",
    memberSpecialty: "Spécialité",
    memberPhoto: "Photo",
    removeMember: "Retirer",
  },
  en: {
    title: "Workshop Content",
    subtitle: "Manage the content of the Workshop page",
    previewLink: "View page",
    slides: "Hero Slides",
    story: "Our Story",
    process: "Process",
    machines: "Equipment",
    values: "Values",
    team: "Team",
    cta: "Call to Action",
    newSlide: "Add a slide",
    editSlide: "Edit slide",
    noSlides: "No slides",
    addFirst: "Add your first slide",
    mediaType: "Media type",
    bannerImage: "Banner image",
    videoLabel: "Video (MP4 or WebM, max 50MB)",
    videoPoster: "Cover image",
    slideTitle: "Slide title",
    slideSubtitle: "Subtitle",
    ctaLabel: "Button text (CTA)",
    ctaUrlLabel: "Button link (CTA)",
    activeLabel: "Active (visible on site)",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    saved: "Saved!",
    deleteConfirm: "Delete this slide?",
    titleRequired: "French title is required",
    autoTranslate: "Auto-translate",
    autoTranslateDesc: "Fill in French fields, then click to translate",
    uploadVideo: "Click to upload a video",
    uploading: "Uploading...",
    change: "Change",
    remove: "Remove",
    errorSave: "Error saving",
    sectionTitle: "Title",
    sectionSubtitle: "Subtitle",
    sectionContent: "Content",
    sectionImage: "Image",
    ctaText: "Button text",
    ctaUrl: "Button URL",
    cta2Text: "2nd button (text)",
    cta2Url: "2nd button (URL)",
    sectionActive: "Section visible",
    sectionHidden: "Section hidden",
    equipmentImages: "Equipment images",
    equipmentImagesDesc: "Add a photo for each equipment (200×200 recommended)",
    machineNames: ["5-Axis CNC", "Panel Saw", "Jointer-Planer", "Wood Lathe", "Finishing Booth", "Traditional Tools"],
    processImages: "Process step images",
    processImagesDesc: "Add a photo for each process step",
    processNames: ["Wood Selection", "Design & Planning", "CNC Cutting", "Hand Carving", "Assembly", "Finishing & Varnishing"],
    teamMembers: "Team members",
    teamMembersDesc: "Add a photo and edit the information of each member",
    addMember: "Add a member",
    memberName: "Name",
    memberRole: "Role / Position",
    memberExperience: "Experience (e.g. 20+)",
    memberSpecialty: "Specialty",
    memberPhoto: "Photo",
    removeMember: "Remove",
  },
  es: {
    title: "Contenido del Taller",
    subtitle: "Gestiona el contenido de la página del Taller",
    previewLink: "Ver página",
    slides: "Slides Hero",
    story: "Nuestra Historia",
    process: "Proceso",
    machines: "Equipos",
    values: "Valores",
    team: "Equipo",
    cta: "Llamada a la acción",
    newSlide: "Añadir diapositiva",
    editSlide: "Editar diapositiva",
    noSlides: "Sin diapositivas",
    addFirst: "Añade tu primera diapositiva",
    mediaType: "Tipo de medio",
    bannerImage: "Imagen del banner",
    videoLabel: "Vídeo (MP4 o WebM, máx. 50MB)",
    videoPoster: "Imagen de portada",
    slideTitle: "Título",
    slideSubtitle: "Subtítulo",
    ctaLabel: "Texto del botón (CTA)",
    ctaUrlLabel: "Enlace del botón (CTA)",
    activeLabel: "Activa (visible en el sitio)",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    saved: "¡Guardado!",
    deleteConfirm: "¿Eliminar esta diapositiva?",
    titleRequired: "El título en francés es obligatorio",
    autoTranslate: "Traducción automática",
    autoTranslateDesc: "Rellena en francés y haz clic para traducir",
    uploadVideo: "Subir un vídeo",
    uploading: "Subiendo...",
    change: "Cambiar",
    remove: "Eliminar",
    errorSave: "Error al guardar",
    sectionTitle: "Título",
    sectionSubtitle: "Subtítulo",
    sectionContent: "Contenido",
    sectionImage: "Imagen",
    ctaText: "Texto del botón",
    ctaUrl: "URL del botón",
    cta2Text: "2º botón (texto)",
    cta2Url: "2º botón (URL)",
    sectionActive: "Sección visible",
    sectionHidden: "Sección oculta",
    equipmentImages: "Imágenes de equipos",
    equipmentImagesDesc: "Añade una foto para cada equipo (200×200 recomendado)",
    machineNames: ["CNC 5 Ejes", "Sierra de Paneles", "Cepilladora", "Torno de Madera", "Cabina de Acabado", "Herramientas Tradicionales"],
    processImages: "Imágenes de los pasos",
    processImagesDesc: "Añade una foto para cada paso del proceso",
    processNames: ["Selección de Madera", "Diseño y Planificación", "Corte CNC", "Tallado a Mano", "Ensamblaje", "Acabado y Barnizado"],
    teamMembers: "Miembros del equipo",
    teamMembersDesc: "Añade una foto y edita la información de cada miembro",
    addMember: "Añadir miembro",
    memberName: "Nombre",
    memberRole: "Rol / Puesto",
    memberExperience: "Experiencia (ej: 20+)",
    memberSpecialty: "Especialidad",
    memberPhoto: "Foto",
    removeMember: "Eliminar",
  },
  ar: {
    title: "محتوى الورشة",
    subtitle: "إدارة محتوى صفحة الورشة",
    previewLink: "عرض الصفحة",
    slides: "شرائح البانر",
    story: "قصتنا",
    process: "العملية",
    machines: "المعدات",
    values: "القيم",
    team: "الفريق",
    cta: "دعوة للعمل",
    newSlide: "إضافة شريحة",
    editSlide: "تعديل الشريحة",
    noSlides: "لا توجد شرائح",
    addFirst: "أضف أول شريحة",
    mediaType: "نوع الوسائط",
    bannerImage: "صورة البانر",
    videoLabel: "فيديو (MP4 أو WebM، حد أقصى 50MB)",
    videoPoster: "صورة الغلاف",
    slideTitle: "عنوان الشريحة",
    slideSubtitle: "العنوان الفرعي",
    ctaLabel: "نص الزر (CTA)",
    ctaUrlLabel: "رابط الزر (CTA)",
    activeLabel: "نشطة (مرئية على الموقع)",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    saved: "تم الحفظ!",
    deleteConfirm: "حذف هذه الشريحة؟",
    titleRequired: "العنوان بالفرنسية مطلوب",
    autoTranslate: "ترجمة تلقائية",
    autoTranslateDesc: "املأ بالفرنسية ثم انقر للترجمة",
    uploadVideo: "تحميل فيديو",
    uploading: "جاري التحميل...",
    change: "تغيير",
    remove: "حذف",
    errorSave: "خطأ في الحفظ",
    sectionTitle: "العنوان",
    sectionSubtitle: "العنوان الفرعي",
    sectionContent: "المحتوى",
    sectionImage: "الصورة",
    ctaText: "نص الزر",
    ctaUrl: "رابط الزر",
    cta2Text: "الزر الثاني (نص)",
    cta2Url: "الزر الثاني (رابط)",
    sectionActive: "القسم مرئي",
    sectionHidden: "القسم مخفي",
    equipmentImages: "صور المعدات",
    equipmentImagesDesc: "أضف صورة لكل معدة (200×200 موصى بها)",
    machineNames: ["CNC 5 محاور", "منشار الألواح", "مسوي-مسحجة", "مخرطة خشب", "كابينة التشطيب", "أدوات تقليدية"],
    processImages: "صور المراحل",
    processImagesDesc: "أضف صورة لكل مرحلة من العملية",
    processNames: ["اختيار الخشب", "التصميم والتخطيط", "قطع CNC", "النحت اليدوي", "التجميع", "التشطيب والتلميع"],
    teamMembers: "أعضاء الفريق",
    teamMembersDesc: "أضف صورة وعدّل معلومات كل عضو",
    addMember: "إضافة عضو",
    memberName: "الاسم",
    memberRole: "الدور / المنصب",
    memberExperience: "الخبرة (مثال: +20)",
    memberSpecialty: "التخصص",
    memberPhoto: "الصورة",
    removeMember: "حذف",
  },
};

// ═══════════════════════════════════════════════════════════
// Helper: empty section
// ═══════════════════════════════════════════════════════════

const emptySection = (key: string, order: number): PageSection => ({
  sectionKey: key, order, isActive: true,
  titleFr: "", titleEn: "", titleEs: "", titleAr: "",
  subtitleFr: "", subtitleEn: "", subtitleEs: "", subtitleAr: "",
  contentFr: "", contentEn: "", contentEs: "", contentAr: "",
  imageUrl: "", videoUrl: "", bgImage: "",
  ctaTextFr: "", ctaTextEn: "", ctaTextEs: "", ctaTextAr: "",
  ctaUrl: "",
  cta2TextFr: "", cta2TextEn: "", cta2TextEs: "", cta2TextAr: "",
  cta2Url: "",
});

const SECTION_KEYS = ["story", "process", "machines", "values", "team", "cta"] as const;

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function AtelierContentPage() {
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("slides");

  // ─── SLIDES STATE ─────────────────────────────────────
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const [slidesSaving, setSlidesSaving] = useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideTitleValues, setSlideTitleValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [slideSubtitleValues, setSlideSubtitleValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [slideCtaTextValues, setSlideCtaTextValues] = useState<MultilingualValues>({ fr: "", en: "", es: "", ar: "" });
  const [slideFormData, setSlideFormData] = useState({
    mediaType: "image" as "image" | "video",
    imageUrl: "", videoUrl: "", videoPoster: "", ctaUrl: "", isActive: true, order: 0,
  });
  const [videoUploading, setVideoUploading] = useState(false);

  // ─── SECTIONS STATE ───────────────────────────────────
  const [sections, setSections] = useState<Record<string, PageSection>>({});
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsSaving, setSectionsSaving] = useState(false);
  const [sectionsSaved, setSectionsSaved] = useState(false);

  // ─── DATA FETCHING ────────────────────────────────────

  const fetchSlides = useCallback(async () => {
    setSlidesLoading(true);
    try {
      const res = await fetch("/api/cms/hero-slides?pageSlug=atelier");
      const data = await res.json();
      setSlides(data.slides || []);
    } catch (e) { console.error("Failed to fetch slides:", e); }
    finally { setSlidesLoading(false); }
  }, []);

  const fetchSections = useCallback(async () => {
    setSectionsLoading(true);
    try {
      const res = await fetch("/api/cms/pages/atelier/sections");
      const data = res.ok ? await res.json() : { sections: [] };
      const existing: PageSection[] = data.sections || [];
      const map: Record<string, PageSection> = {};
      SECTION_KEYS.forEach((key, i) => {
        const found = existing.find((s) => s.sectionKey === key);
        map[key] = found ? { ...emptySection(key, i), ...found, order: i } : emptySection(key, i);
      });
      setSections(map);
    } catch (e) { console.error("Failed to fetch sections:", e); }
    finally { setSectionsLoading(false); }
  }, []);

  useEffect(() => { fetchSlides(); fetchSections(); }, [fetchSlides, fetchSections]);

  // ─── SECTION HELPERS ──────────────────────────────────

  const getML = (section: PageSection, field: string): MultilingualValues => {
    const rec = section as unknown as Record<string, string>;
    return {
      fr: rec[`${field}Fr`] || "",
      en: rec[`${field}En`] || "",
      es: rec[`${field}Es`] || "",
      ar: rec[`${field}Ar`] || "",
    };
  };

  const updateML = (sectionKey: string, field: string, values: MultilingualValues) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [`${field}Fr`]: values.fr, [`${field}En`]: values.en,
        [`${field}Es`]: values.es, [`${field}Ar`]: values.ar,
      },
    }));
  };

  const updateField = (sectionKey: string, field: string, value: string | boolean) => {
    setSections((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [field]: value } }));
  };

  const handleSaveSections = async () => {
    setSectionsSaving(true);
    setSectionsSaved(false);
    try {
      const res = await fetch("/api/cms/pages/atelier/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: Object.values(sections) }),
      });
      if (res.ok) {
        setSectionsSaved(true);
        setTimeout(() => setSectionsSaved(false), 2000);
        toast.success(t.saved, locale === "ar" ? "تم حفظ التعديلات بنجاح" : locale === "es" ? "Los cambios se han guardado" : locale === "en" ? "Changes saved successfully" : "Les modifications ont été enregistrées");
      } else {
        toast.error(t.errorSave, locale === "ar" ? "حدث خطأ أثناء الحفظ" : locale === "es" ? "Error al guardar" : locale === "en" ? "An error occurred while saving" : "Une erreur est survenue lors de l'enregistrement");
      }
    } catch (e) {
      console.error("Failed to save sections:", e);
      toast.error(t.errorSave, locale === "ar" ? "حدث خطأ أثناء الحفظ" : locale === "es" ? "Error al guardar" : locale === "en" ? "An error occurred while saving" : "Une erreur est survenue lors de l'enregistrement");
    }
    finally { setSectionsSaving(false); }
  };

  // ─── SLIDE CRUD ───────────────────────────────────────

  const resetSlideForm = () => {
    setSlideTitleValues({ fr: "", en: "", es: "", ar: "" });
    setSlideSubtitleValues({ fr: "", en: "", es: "", ar: "" });
    setSlideCtaTextValues({ fr: "", en: "", es: "", ar: "" });
    setSlideFormData({ mediaType: "image", imageUrl: "", videoUrl: "", videoPoster: "", ctaUrl: "", isActive: true, order: slides.length });
    setEditingSlideId(null);
  };

  const handleNewSlide = () => { resetSlideForm(); setSlideFormData((p) => ({ ...p, order: slides.length })); setShowSlideModal(true); };

  const handleEditSlide = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideTitleValues({ fr: slide.titleFr || "", en: slide.titleEn || "", es: slide.titleEs || "", ar: slide.titleAr || "" });
    setSlideSubtitleValues({ fr: slide.subtitleFr || "", en: slide.subtitleEn || "", es: slide.subtitleEs || "", ar: slide.subtitleAr || "" });
    setSlideCtaTextValues({ fr: slide.ctaTextFr || "", en: slide.ctaTextEn || "", es: "", ar: "" });
    setSlideFormData({ mediaType: (slide.mediaType as "image" | "video") || "image", imageUrl: slide.imageUrl || "", videoUrl: slide.videoUrl || "", videoPoster: slide.videoPoster || "", ctaUrl: slide.ctaUrl || "", isActive: slide.isActive, order: slide.order });
    setShowSlideModal(true);
  };

  const handleSaveSlide = async () => {
    if (!slideTitleValues.fr) { alert(t.titleRequired); return; }
    setSlidesSaving(true);
    try {
      const payload: Record<string, unknown> = {
        targetPage: "atelier", mediaType: slideFormData.mediaType,
        titleFr: slideTitleValues.fr, titleEn: slideTitleValues.en || undefined, titleEs: slideTitleValues.es || undefined, titleAr: slideTitleValues.ar || undefined,
        subtitleFr: slideSubtitleValues.fr || undefined, subtitleEn: slideSubtitleValues.en || undefined, subtitleEs: slideSubtitleValues.es || undefined, subtitleAr: slideSubtitleValues.ar || undefined,
        ctaTextFr: slideCtaTextValues.fr || undefined, ctaTextEn: slideCtaTextValues.en || undefined,
        ctaUrl: slideFormData.ctaUrl || undefined,
        imageUrl: slideFormData.imageUrl || null, videoUrl: slideFormData.videoUrl || null, videoPoster: slideFormData.videoPoster || null,
        isActive: slideFormData.isActive, order: slideFormData.order,
      };
      Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k]; });
      const method = editingSlideId ? "PUT" : "POST";
      const url = editingSlideId ? `/api/cms/hero-slides/${editingSlideId}` : "/api/cms/hero-slides";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        fetchSlides(); setShowSlideModal(false); resetSlideForm();
        toast.success(t.saved, locale === "ar" ? "تم حفظ الشريحة بنجاح" : locale === "es" ? "Slide guardada" : locale === "en" ? "Slide saved successfully" : "La slide a été enregistrée");
      } else {
        const err = await res.json();
        toast.error(t.errorSave, err.error || undefined);
      }
    } catch {
      toast.error(t.errorSave);
    }
    finally { setSlidesSaving(false); }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await fetch(`/api/cms/hero-slides/${id}`, { method: "DELETE" });
      fetchSlides();
      toast.success(locale === "ar" ? "تم الحذف" : locale === "es" ? "Eliminado" : locale === "en" ? "Deleted" : "Supprimé");
    } catch {
      toast.error(t.errorSave);
    }
  };

  const handleToggleSlide = async (slide: HeroSlide) => { try { await fetch(`/api/cms/hero-slides/${slide.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !slide.isActive }) }); fetchSlides(); } catch {} };

  const handleMoveSlide = async (slide: HeroSlide, dir: "up" | "down") => {
    const idx = slides.findIndex((s) => s.id === slide.id);
    const nIdx = dir === "up" ? idx - 1 : idx + 1;
    if (nIdx < 0 || nIdx >= slides.length) return;
    const arr = [...slides]; [arr[idx], arr[nIdx]] = [arr[nIdx], arr[idx]];
    try { await Promise.all(arr.map((s, i) => fetch(`/api/cms/hero-slides/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: i }) }))); fetchSlides(); } catch {}
  };

  const handleVideoUpload = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) { alert("Max 50MB"); return; }
    setVideoUploading(true);
    const fd = new FormData(); fd.append("file", file);
    try { const res = await fetch("/api/upload", { method: "POST", body: fd }); if (res.ok) { const data = await res.json(); setSlideFormData((p) => ({ ...p, videoUrl: data.url })); } } catch { alert(t.errorSave); }
    finally { setVideoUploading(false); }
  };

  // ─── RENDER SECTION TAB ───────────────────────────────

  const renderSectionTab = (sectionKey: string) => {
    const section = sections[sectionKey];
    if (!section) return <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" /></div>;

    const showContent = sectionKey === "story" || sectionKey === "cta";
    const showImage = sectionKey === "story";
    const showCta = sectionKey === "cta";
    const showMachineImages = sectionKey === "machines";
    const showProcessImages = sectionKey === "process";
    const showTeamMembers = sectionKey === "team";

    // Parse machine images from bgImage (JSON map)
    const machineImages: Record<string, string> = showMachineImages
      ? (() => { try { return JSON.parse(section.bgImage || "{}"); } catch { return {}; } })()
      : {};

    const updateMachineImage = (index: number, url: string) => {
      const updated = { ...machineImages, [String(index)]: url };
      updateField(sectionKey, "bgImage", JSON.stringify(updated));
    };

    // Parse process step images from videoUrl (JSON map)
    const processImages: Record<string, string> = showProcessImages
      ? (() => { try { return JSON.parse(section.videoUrl || "{}"); } catch { return {}; } })()
      : {};

    const updateProcessImage = (index: number, url: string) => {
      const updated = { ...processImages, [String(index)]: url };
      updateField(sectionKey, "videoUrl", JSON.stringify(updated));
    };

    // Parse team members from bgImage (JSON array) - for team section
    interface TeamMember { name: string; role: string; experience: string; specialty: string; photo: string; }
    const teamMembers: TeamMember[] = showTeamMembers
      ? (() => { try { const parsed = JSON.parse(section.bgImage || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; } })()
      : [];

    const updateTeamMembers = (members: TeamMember[]) => {
      updateField(sectionKey, "bgImage", JSON.stringify(members));
    };

    const addTeamMember = () => {
      updateTeamMembers([...teamMembers, { name: "", role: "", experience: "", specialty: "", photo: "" }]);
    };

    const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
      const updated = [...teamMembers];
      updated[index] = { ...updated[index], [field]: value };
      updateTeamMembers(updated);
    };

    const removeTeamMember = (index: number) => {
      updateTeamMembers(teamMembers.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-6">
        {/* Auto-translate */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">{t.autoTranslate}</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">{t.autoTranslateDesc}</p>
          </div>
          <TranslateAllButton
            fields={[
              { fieldName: "title", values: getML(section, "title"), onChange: (v) => updateML(sectionKey, "title", v) },
              { fieldName: "subtitle", values: getML(section, "subtitle"), onChange: (v) => updateML(sectionKey, "subtitle", v) },
              ...(showContent ? [{ fieldName: "content", values: getML(section, "content"), onChange: (v: MultilingualValues) => updateML(sectionKey, "content", v) }] : []),
              ...(showCta ? [{ fieldName: "ctaText", values: getML(section, "ctaText"), onChange: (v: MultilingualValues) => updateML(sectionKey, "ctaText", v) }] : []),
            ]}
          />
        </div>

        {/* Title */}
        <MultilingualInput label={t.sectionTitle} values={getML(section, "title")} onChange={(v) => updateML(sectionKey, "title", v)} placeholder="Titre de la section" />

        {/* Subtitle */}
        <MultilingualInput label={t.sectionSubtitle} values={getML(section, "subtitle")} onChange={(v) => updateML(sectionKey, "subtitle", v)} placeholder="Sous-titre" />

        {/* Content (story + cta) */}
        {showContent && (
          <MultilingualInput label={t.sectionContent} values={getML(section, "content")} onChange={(v) => updateML(sectionKey, "content", v)} type="textarea" rows={4} placeholder="Contenu de la section" />
        )}

        {/* Image */}
        {showImage && (
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">{t.sectionImage}</label>
            <ImageUpload value={section.imageUrl} onChange={(url) => updateField(sectionKey, "imageUrl", url)} folder="general" locale={locale} aspectRatio="video" />
          </div>
        )}

        {/* Machine Equipment Images */}
        {showMachineImages && (
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{(t as Record<string, unknown>).equipmentImages as string}</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{(t as Record<string, unknown>).equipmentImagesDesc as string}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {((t as Record<string, unknown>).machineNames as string[]).map((name, i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{name}</p>
                  <ImageUpload
                    value={machineImages[String(i)] || ""}
                    onChange={(url) => updateMachineImage(i, url)}
                    folder="general"
                    locale={locale}
                    aspectRatio="square"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Step Images */}
        {showProcessImages && (
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{(t as Record<string, unknown>).processImages as string}</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{(t as Record<string, unknown>).processImagesDesc as string}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {((t as Record<string, unknown>).processNames as string[]).map((name, i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-full text-xs font-bold mr-2">{i + 1}</span>
                    {name}
                  </p>
                  <ImageUpload
                    value={processImages[String(i)] || ""}
                    onChange={(url) => updateProcessImage(i, url)}
                    folder="general"
                    locale={locale}
                    aspectRatio="video"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members */}
        {showTeamMembers && (
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">{(t as Record<string, unknown>).teamMembers as string}</label>
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> {(t as Record<string, unknown>).addMember as string}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{(t as Record<string, unknown>).teamMembersDesc as string}</p>

            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{(t as Record<string, unknown>).addMember as string}</p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {teamMembers.map((member, i) => (
                  <div key={i} className="flex-shrink-0 w-[220px] border border-gray-100 dark:border-gray-700 rounded-xl p-3 space-y-3 bg-gray-50 dark:bg-gray-900/30">
                    {/* Photo */}
                    <ImageUpload
                      value={member.photo || ""}
                      onChange={(url) => updateTeamMember(i, "photo", url)}
                      folder="general"
                      locale={locale}
                      aspectRatio="square"
                    />
                    {/* Name */}
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateTeamMember(i, "name", e.target.value)}
                      placeholder={(t as Record<string, unknown>).memberName as string}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {/* Role */}
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateTeamMember(i, "role", e.target.value)}
                      placeholder={(t as Record<string, unknown>).memberRole as string}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {/* Experience + Specialty row */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={member.experience}
                        onChange={(e) => updateTeamMember(i, "experience", e.target.value)}
                        placeholder={(t as Record<string, unknown>).memberExperience as string}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        value={member.specialty}
                        onChange={(e) => updateTeamMember(i, "specialty", e.target.value)}
                        placeholder={(t as Record<string, unknown>).memberSpecialty as string}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeTeamMember(i)}
                      className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> {(t as Record<string, unknown>).removeMember as string}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {showCta && (
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Bouton d&apos;action</h4>
            <MultilingualInput label={t.ctaText} values={getML(section, "ctaText")} onChange={(v) => updateML(sectionKey, "ctaText", v)} placeholder="Texte du bouton" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.ctaUrl}</label>
              <input type="text" value={section.ctaUrl} onChange={(e) => updateField(sectionKey, "ctaUrl", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="/contact" />
            </div>
            <MultilingualInput label={t.cta2Text} values={getML(section, "cta2Text")} onChange={(v) => updateML(sectionKey, "cta2Text", v)} placeholder="2ème bouton" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.cta2Url}</label>
              <input type="text" value={section.cta2Url} onChange={(e) => updateField(sectionKey, "cta2Url", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="/devis" />
            </div>
          </div>
        )}

        {/* Active toggle */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
          <input type="checkbox" id={`active-${sectionKey}`} checked={section.isActive} onChange={(e) => updateField(sectionKey, "isActive", e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
          <label htmlFor={`active-${sectionKey}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.activeLabel}</label>
          <span className={`ml-auto text-xs px-2 py-1 rounded ${section.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
            {section.isActive ? t.sectionActive : t.sectionHidden}
          </span>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-900/30">
            <Hammer className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Save button for section tabs */}
          {activeTab !== "slides" && (
            <button
              onClick={handleSaveSections}
              disabled={sectionsSaving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm font-medium"
            >
              {sectionsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {sectionsSaving ? t.saving : sectionsSaved ? t.saved : t.save}
            </button>
          )}
          <a
            href={`/${locale}/atelier`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
          >
            <ExternalLink className="w-4 h-4" />
            {t.previewLink}
          </a>
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────── */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map(({ id, icon: Icon }) => {
            const isActive = activeTab === id;
            const badge = id === "slides" && slides.length > 0 ? String(slides.length) : null;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {t[id]}
                {badge && (
                  <span className={cn("px-1.5 py-0.5 text-xs rounded-full", isActive ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500")}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Tab Content ─────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
        {/* SLIDES TAB */}
        {activeTab === "slides" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">Images et vidéos du carrousel hero</p>
              <button onClick={handleNewSlide} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium">
                <Plus className="w-4 h-4" /> {t.newSlide}
              </button>
            </div>

            {slidesLoading ? (
              <div className="text-center py-12"><Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto" /></div>
            ) : slides.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t.noSlides}</p>
                <button onClick={handleNewSlide} className="mt-3 text-amber-600 hover:text-amber-700 font-medium text-sm">{t.addFirst}</button>
              </div>
            ) : (
              <div className="space-y-3">
                {slides.map((slide, index) => (
                  <div key={slide.id} className={`rounded-lg border dark:border-gray-700 p-4 flex items-center gap-4 transition-opacity ${!slide.isActive ? "opacity-50" : ""}`}>
                    {/* Pin number + reorder */}
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={() => handleMoveSlide(slide, "up")} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold",
                        index === 0
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-2 ring-amber-300 dark:ring-amber-700"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      )} title={`Pin ${index + 1}`}>
                        {index + 1}
                      </div>
                      <button onClick={() => handleMoveSlide(slide, "down")} disabled={index === slides.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                    {/* Media preview */}
                    <div className="w-32 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {slide.mediaType === "video" && slide.videoUrl ? (
                        <>{slide.videoPoster ? <img src={slide.videoPoster} alt="" className="w-full h-full object-cover" /> : <video src={slide.videoUrl} className="w-full h-full object-cover" muted preload="metadata" />}<div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-white text-[10px] font-medium flex items-center gap-1"><Video className="w-3 h-3" /> Video</div></>
                      ) : slide.imageUrl ? (
                        <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>
                      )}
                      {/* Pin 1 badge on thumbnail */}
                      {index === 0 && slide.isActive && (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-amber-500 rounded text-white text-[10px] font-bold flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" /> 1
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{slide.titleFr || "(Sans titre)"}</h3>
                        {index === 0 && <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded font-semibold">1er</span>}
                      </div>
                      {slide.subtitleFr && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{slide.subtitleFr}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className={slide.titleFr ? "text-green-500" : ""}>FR {slide.titleFr ? "✓" : "○"}</span>
                        <span className={slide.titleEn ? "text-green-500" : ""}>EN {slide.titleEn ? "✓" : "○"}</span>
                        <span className={slide.titleEs ? "text-green-500" : ""}>ES {slide.titleEs ? "✓" : "○"}</span>
                        <span className={slide.titleAr ? "text-green-500" : ""}>AR {slide.titleAr ? "✓" : "○"}</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleSlide(slide)} className={`p-2 rounded-lg ${slide.isActive ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`} title={slide.isActive ? "Désactiver" : "Activer"}>{slide.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</button>
                      <button onClick={() => handleEditSlide(slide)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Modifier"><Edit2 className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteSlide(slide.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Supprimer"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION TABS */}
        {activeTab === "story" && (sectionsLoading ? <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" /></div> : renderSectionTab("story"))}
        {activeTab === "process" && (sectionsLoading ? <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" /></div> : renderSectionTab("process"))}
        {activeTab === "machines" && (sectionsLoading ? <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" /></div> : renderSectionTab("machines"))}
        {activeTab === "values" && (sectionsLoading ? <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" /></div> : renderSectionTab("values"))}
        {activeTab === "team" && (sectionsLoading ? <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" /></div> : renderSectionTab("team"))}
        {activeTab === "cta" && (sectionsLoading ? <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" /></div> : renderSectionTab("cta"))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          SLIDE EDIT MODAL
      ═══════════════════════════════════════════════════════ */}
      {showSlideModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingSlideId ? t.editSlide : t.newSlide}</h2>
              <button onClick={() => { setShowSlideModal(false); resetSlideForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Auto-translate */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">{t.autoTranslate}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">{t.autoTranslateDesc}</p>
                </div>
                <TranslateAllButton fields={[
                  { fieldName: "title", values: slideTitleValues, onChange: setSlideTitleValues },
                  { fieldName: "subtitle", values: slideSubtitleValues, onChange: setSlideSubtitleValues },
                  { fieldName: "ctaText", values: slideCtaTextValues, onChange: setSlideCtaTextValues },
                ]} />
              </div>

              {/* Media type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.mediaType}</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setSlideFormData({ ...slideFormData, mediaType: "image" })} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${slideFormData.mediaType === "image" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700" : "border-gray-200 dark:border-gray-600 hover:border-gray-300"}`}><ImageIcon className="w-5 h-5" /> Image</button>
                  <button type="button" onClick={() => setSlideFormData({ ...slideFormData, mediaType: "video" })} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${slideFormData.mediaType === "video" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700" : "border-gray-200 dark:border-gray-600 hover:border-gray-300"}`}><Video className="w-5 h-5" /> Video</button>
                </div>
              </div>

              {/* Media upload */}
              {slideFormData.mediaType === "image" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bannerImage}</label>
                  <ImageUpload value={slideFormData.imageUrl} onChange={(url) => setSlideFormData({ ...slideFormData, imageUrl: url })} folder="general" aspectRatio="wide" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.videoLabel}</label>
                    {slideFormData.videoUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-amber-300 bg-black max-w-lg">
                        <video src={slideFormData.videoUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="cursor-pointer bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">{t.change}<input type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); }} /></label>
                          <button type="button" onClick={() => setSlideFormData({ ...slideFormData, videoUrl: "", videoPoster: "" })} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600">{t.remove}</button>
                        </div>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center aspect-video max-w-lg border-2 border-dashed rounded-xl cursor-pointer transition-all ${videoUploading ? "border-amber-400 bg-amber-50/50" : "border-gray-300 dark:border-gray-600 hover:border-amber-400 hover:bg-amber-50/50"}`}>
                        {videoUploading ? <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-2" /> : <Upload className="w-10 h-10 text-gray-400 mb-2" />}
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{videoUploading ? t.uploading : t.uploadVideo}</span>
                        <span className="text-sm text-gray-400 mt-1">MP4, WebM - max 50MB</span>
                        <input type="file" accept="video/mp4,video/webm" className="hidden" disabled={videoUploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); }} />
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.videoPoster}</label>
                    <ImageUpload value={slideFormData.videoPoster} onChange={(url) => setSlideFormData({ ...slideFormData, videoPoster: url })} folder="general" aspectRatio="wide" />
                  </div>
                </div>
              )}

              <MultilingualInput label={t.slideTitle} required placeholder="Ex: L'Art du Bois Marocain" values={slideTitleValues} onChange={setSlideTitleValues} />
              <MultilingualInput label={t.slideSubtitle} type="textarea" rows={2} placeholder="Ex: Menuiserie artisanale" values={slideSubtitleValues} onChange={setSlideSubtitleValues} />
              <MultilingualInput label={t.ctaLabel} placeholder="Ex: Découvrir nos services" values={slideCtaTextValues} onChange={setSlideCtaTextValues} />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.ctaUrlLabel}</label>
                <input type="text" value={slideFormData.ctaUrl} onChange={(e) => setSlideFormData({ ...slideFormData, ctaUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="/services" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="slideActive" checked={slideFormData.isActive} onChange={(e) => setSlideFormData({ ...slideFormData, isActive: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                <label htmlFor="slideActive" className="text-sm text-gray-700 dark:text-gray-300">{t.activeLabel}</label>
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
              <button onClick={() => { setShowSlideModal(false); resetSlideForm(); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">{t.cancel}</button>
              <button onClick={handleSaveSlide} disabled={slidesSaving || !slideTitleValues.fr || (slideFormData.mediaType === "image" ? !slideFormData.imageUrl : !slideFormData.videoUrl)} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50">
                {slidesSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {slidesSaving ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
