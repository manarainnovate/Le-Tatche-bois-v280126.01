"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { ImageGallery, type GalleryImage } from "@/components/ui/ImageGallery";
import { cn } from "@/lib/utils";
import type { Project, Locale, ProjectPhase } from "@/data/projects";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ProjectTimelineProps {
  project: Project;
  locale: Locale;
}

interface PhaseItem {
  type: "before" | "during" | "after";
  data: ProjectPhase;
  icon: string;
  step?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const translations = {
  before: { fr: "Avant", en: "Before", ar: "قبل", es: "Antes" },
  during: { fr: "En Cours", en: "During", ar: "أثناء", es: "Durante" },
  after: { fr: "Après", en: "After", ar: "بعد", es: "Después" },
  step: { fr: "Étape", en: "Step", ar: "خطوة", es: "Paso" },
  photos: { fr: "photos", en: "photos", ar: "صور", es: "fotos" },
  processTitle: {
    fr: "Le Processus de Création",
    en: "The Creation Process",
    ar: "عملية الإنشاء",
    es: "El Proceso de Creación",
  },
  clickToExplore: {
    fr: "Cliquez pour explorer chaque étape",
    en: "Click to explore each step",
    ar: "انقر لاستكشاف كل خطوة",
    es: "Haga clic para explorar cada paso",
  },
  previous: { fr: "Précédent", en: "Previous", ar: "السابق", es: "Anterior" },
  next: { fr: "Suivant", en: "Next", ar: "التالي", es: "Siguiente" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ProjectTimeline({ project, locale }: ProjectTimelineProps) {
  const [activePhase, setActivePhase] = useState(0);
  const isRTL = locale === "ar";

  // If no phases, don't render
  if (!project.phases) return null;

  // Build all phases array
  const phaseIcons = ["🪵", "✂️", "🔨", "✨", "🏠"];
  const allPhases: PhaseItem[] = [
    { type: "before", data: project.phases.before, icon: "📋" },
    ...project.phases.during.map((phase, i) => ({
      type: "during" as const,
      data: phase,
      icon: phaseIcons[i] ?? "⚙️",
      step: i + 1,
    })),
    { type: "after", data: project.phases.after, icon: "🎉" },
  ];

  const currentPhase = allPhases[activePhase];

  // Get text for locale
  const getText = (key: keyof typeof translations) =>
    translations[key][locale] ?? translations[key].fr;

  // Get phase label
  const getPhaseLabel = (phase: PhaseItem) => {
    if (phase.type === "before") return getText("before");
    if (phase.type === "after") return getText("after");
    return `${getText("step")} ${phase.step}`;
  };

  // Convert images to GalleryImage format
  const galleryImages: GalleryImage[] = currentPhase
    ? currentPhase.data.images.map((src, i) => ({
        src,
        alt: `${currentPhase.data.title[locale]} - ${i + 1}`,
      }))
    : [];

  if (!currentPhase) return null;

  return (
    <div className="py-12" dir={isRTL ? "rtl" : "ltr"}>
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-wood-dark mb-2">
          {getText("processTitle")}
        </h2>
        <p className="text-gray-500">{getText("clickToExplore")}</p>
      </div>

      {/* Timeline Navigation */}
      <div className="relative mb-12 px-4">
        {/* Progress Line */}
        <div className="absolute top-7 left-8 right-8 h-1 bg-gray-200 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-wood-primary to-wood-secondary rounded-full transition-all duration-500"
            style={{
              width: `${(activePhase / (allPhases.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Phase Dots */}
        <div className="relative flex justify-between">
          {allPhases.map((phase, index) => (
            <button
              key={index}
              onClick={() => setActivePhase(index)}
              className="relative flex flex-col items-center group"
            >
              {/* Dot */}
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 z-10",
                  index === activePhase
                    ? "bg-wood-primary text-white scale-110 shadow-lg"
                    : index < activePhase
                      ? "bg-wood-secondary text-white"
                      : "bg-white border-2 border-gray-300 hover:border-wood-primary"
                )}
              >
                {phase.icon}
              </div>

              {/* Label */}
              <div
                className={cn(
                  "mt-3 text-sm font-medium transition-colors whitespace-nowrap",
                  index === activePhase ? "text-wood-primary" : "text-gray-500"
                )}
              >
                {getPhaseLabel(phase)}
              </div>

              {/* Photo count badge */}
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Camera size={12} />
                {phase.data.images.length}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Phase Content */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image Gallery Side */}
          <div className="bg-gray-50 p-6 lg:p-8">
            <ImageGallery
              images={galleryImages}
              aspectRatio="video"
              showThumbnails
              enableLightbox
              enableZoom
            />
          </div>

          {/* Content Side */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            {/* Phase Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 w-fit",
                currentPhase.type === "before"
                  ? "bg-blue-100 text-blue-700"
                  : currentPhase.type === "after"
                    ? "bg-green-100 text-green-700"
                    : "bg-wood-cream text-wood-primary"
              )}
            >
              <span className="text-lg">{currentPhase.icon}</span>
              {getPhaseLabel(currentPhase)}
            </div>

            {/* Title */}
            <h3 className="text-2xl lg:text-3xl font-bold text-wood-dark mb-6">
              {currentPhase.data.title[locale]}
            </h3>

            {/* Description */}
            {currentPhase.data.description && (
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {currentPhase.data.description[locale]}
              </p>
            )}

            {/* Navigation Buttons */}
            <div className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
              <button
                onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
                disabled={activePhase === 0}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                  activePhase === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-wood-dark hover:bg-gray-200",
                  isRTL && "flex-row-reverse"
                )}
              >
                <ChevronLeft
                  size={20}
                  className={isRTL ? "rotate-180" : ""}
                />
                {getText("previous")}
              </button>
              <button
                onClick={() =>
                  setActivePhase(Math.min(allPhases.length - 1, activePhase + 1))
                }
                disabled={activePhase === allPhases.length - 1}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                  activePhase === allPhases.length - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-wood-primary text-white hover:bg-wood-secondary",
                  isRTL && "flex-row-reverse"
                )}
              >
                {getText("next")}
                <ChevronRight
                  size={20}
                  className={isRTL ? "rotate-180" : ""}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Jump Thumbnails */}
      <div
        className={cn(
          "mt-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide",
          isRTL && "flex-row-reverse"
        )}
      >
        {allPhases.map((phase, index) => (
          <button
            key={index}
            onClick={() => setActivePhase(index)}
            className={cn(
              "relative flex-shrink-0 w-32 h-24 rounded-xl overflow-hidden transition-all",
              index === activePhase
                ? "ring-4 ring-wood-primary"
                : "opacity-60 hover:opacity-100"
            )}
          >
            <Image
              src={phase.data.images[0] ?? "/images/placeholder.jpg"}
              alt={phase.data.title[locale]}
              fill
              className="object-cover"
              sizes="128px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium truncate">
              {getPhaseLabel(phase)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

ProjectTimeline.displayName = "ProjectTimeline";
