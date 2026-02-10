"use client";

import { useState } from "react";
import { Globe, Loader2, Check, AlertCircle } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface MultilingualValues {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

interface FieldToTranslate {
  fieldName: string;
  values: MultilingualValues;
  onChange: (values: MultilingualValues) => void;
}

interface TranslateAllButtonProps {
  fields: FieldToTranslate[];
  disabled?: boolean;
  className?: string;
}

interface TranslationResult {
  success: boolean;
  fieldName: string;
  translations?: {
    en: string;
    es: string;
    ar: string;
  };
  error?: string;
}

// ═══════════════════════════════════════════════════════════
// TranslateAllButton Component
// ═══════════════════════════════════════════════════════════

export default function TranslateAllButton({
  fields,
  disabled = false,
  className = "",
}: TranslateAllButtonProps) {
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleTranslateAll = async () => {
    // Filter fields that have French content and need translation
    const fieldsToTranslate = fields.filter(
      (field) => field.values.fr && field.values.fr.trim() !== ""
    );

    if (fieldsToTranslate.length === 0) {
      alert("Veuillez d'abord remplir les champs en français");
      return;
    }

    setTranslating(true);
    setProgress(0);
    setStatus("idle");
    setErrorMessage("");

    try {
      // Prepare batch request
      const batchFields = fieldsToTranslate.map((field) => ({
        fieldName: field.fieldName,
        text: field.values.fr,
      }));

      const response = await fetch("/api/translate/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: batchFields,
          fromLang: "fr",
          toLangs: ["en", "es", "ar"],
        }),
      });

      if (!response.ok) {
        throw new Error("Translation API error");
      }

      const data = await response.json();
      const { translations } = data;

      // Update each field with translations
      let successCount = 0;
      fieldsToTranslate.forEach((field, index) => {
        const fieldTranslations = translations[field.fieldName];
        if (fieldTranslations) {
          field.onChange({
            fr: field.values.fr,
            en: fieldTranslations.en || field.values.en,
            es: fieldTranslations.es || field.values.es,
            ar: fieldTranslations.ar || field.values.ar,
          });
          successCount++;
        }
        setProgress(((index + 1) / fieldsToTranslate.length) * 100);
      });

      if (successCount === fieldsToTranslate.length) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          `${successCount}/${fieldsToTranslate.length} champs traduits`
        );
      }
    } catch (error) {
      console.error("Translation error:", error);
      setStatus("error");
      setErrorMessage("Erreur lors de la traduction. Réessayez.");
    } finally {
      setTranslating(false);
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 3000);
    }
  };

  // Count fields that need translation
  const fieldsWithContent = fields.filter(
    (f) => f.values.fr && f.values.fr.trim() !== ""
  ).length;
  const fieldsNeedingTranslation = fields.filter(
    (f) =>
      f.values.fr &&
      f.values.fr.trim() !== "" &&
      (!f.values.en || !f.values.es || !f.values.ar)
  ).length;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleTranslateAll}
        disabled={disabled || translating || fieldsWithContent === 0}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
          status === "success"
            ? "bg-green-600 text-white"
            : status === "error"
            ? "bg-red-600 text-white"
            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
      >
        {translating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Traduction en cours...</span>
          </>
        ) : status === "success" ? (
          <>
            <Check className="w-4 h-4" />
            <span>Traduit avec succès!</span>
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Erreur de traduction</span>
          </>
        ) : (
          <>
            <Globe className="w-4 h-4" />
            <span>
              Traduire tous les champs ({fieldsNeedingTranslation} à traduire)
            </span>
          </>
        )}
      </button>

      {/* Progress bar */}
      {translating && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {errorMessage && status === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
      )}

      {/* Info text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {fieldsWithContent} champ(s) avec contenu FR →{" "}
        {fieldsNeedingTranslation} à traduire vers EN/ES/AR
      </p>
    </div>
  );
}
