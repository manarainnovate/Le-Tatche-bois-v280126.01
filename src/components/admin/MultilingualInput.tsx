"use client";

import { useState } from "react";
import {
  Globe,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  ExternalLink,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface MultilingualValues {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

interface MultilingualInputProps {
  label: string;
  values: MultilingualValues;
  onChange: (values: MultilingualValues) => void;
  type?: "text" | "textarea";
  rows?: number;
  required?: boolean;
  placeholder?: string;
}

const LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" as const },
  { code: "en", name: "English", flag: "🇬🇧", dir: "ltr" as const },
  { code: "es", name: "Español", flag: "🇪🇸", dir: "ltr" as const },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" as const },
];

// ═══════════════════════════════════════════════════════════
// MultilingualInput Component
// ═══════════════════════════════════════════════════════════

export default function MultilingualInput({
  label,
  values,
  onChange,
  type = "text",
  rows = 3,
  required = false,
  placeholder = "",
}: MultilingualInputProps) {
  const [activeTab, setActiveTab] = useState<"fr" | "en" | "es" | "ar">("fr");
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [translationMode, setTranslationMode] = useState<"auto" | "manual">("auto");

  const handleChange = (lang: keyof MultilingualValues, value: string) => {
    onChange({ ...values, [lang]: value });
  };

  // Copy French text to clipboard (for manual translation)
  const copyToClipboard = async () => {
    if (!values.fr) return;

    try {
      await navigator.clipboard.writeText(values.fr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Paste from clipboard
  const pasteFromClipboard = async (lang: keyof MultilingualValues) => {
    try {
      const text = await navigator.clipboard.readText();
      handleChange(lang, text);
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  // Auto-translate using API
  const handleAutoTranslate = async () => {
    if (!values.fr || values.fr.trim() === "") {
      alert("Veuillez d'abord écrire le texte en français");
      return;
    }

    setTranslating(true);

    try {
      const response = await fetch("/api/translate/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: [{ fieldName: "text", text: values.fr }],
          fromLang: "fr",
          toLangs: ["en", "es", "ar"],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const translations = data.translations.text;

        onChange({
          fr: values.fr,
          en: translations.en || values.en,
          es: translations.es || values.es,
          ar: translations.ar || values.ar,
        });
      } else {
        throw new Error("Translation failed");
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Erreur de traduction. Essayez le mode manuel.");
    } finally {
      setTranslating(false);
    }
  };

  const activeLang = LANGUAGES.find((l) => l.code === activeTab)!;

  return (
    <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Translation Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden text-xs dark:border-gray-600">
            <button
              type="button"
              onClick={() => setTranslationMode("auto")}
              className={`px-2 py-1 ${
                translationMode === "auto"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              🤖 Auto
            </button>
            <button
              type="button"
              onClick={() => setTranslationMode("manual")}
              className={`px-2 py-1 ${
                translationMode === "manual"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              ✍️ Manuel
            </button>
          </div>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="flex border-b dark:border-gray-700 overflow-x-auto">
        {LANGUAGES.map((lang) => {
          const hasContent = values[lang.code as keyof MultilingualValues]?.trim();
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveTab(lang.code as keyof MultilingualValues)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === lang.code
                  ? "text-amber-600 border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.code.toUpperCase()}</span>
              {hasContent && (
                <span
                  className="w-2 h-2 bg-green-500 rounded-full"
                  title="Rempli"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Input Area */}
      <div className="space-y-2">
        {/* Input Field */}
        <div className="relative">
          {type === "textarea" ? (
            <textarea
              value={values[activeTab] || ""}
              onChange={(e) => handleChange(activeTab, e.target.value)}
              rows={rows}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                activeLang.dir === "rtl" ? "text-right" : "text-left"
              }`}
              dir={activeLang.dir}
              placeholder={`${placeholder} (${activeLang.name})`}
              required={required && activeTab === "fr"}
            />
          ) : (
            <input
              type="text"
              value={values[activeTab] || ""}
              onChange={(e) => handleChange(activeTab, e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                activeLang.dir === "rtl" ? "text-right" : "text-left"
              }`}
              dir={activeLang.dir}
              placeholder={`${placeholder} (${activeLang.name})`}
              required={required && activeTab === "fr"}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* For French tab - Copy button */}
          {activeTab === "fr" && values.fr && (
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-600" />
                  Copié!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copier le texte FR
                </>
              )}
            </button>
          )}

          {/* For other tabs - Paste button (Manual mode) */}
          {activeTab !== "fr" && translationMode === "manual" && (
            <button
              type="button"
              onClick={() => pasteFromClipboard(activeTab)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
            >
              <Clipboard className="w-3 h-3" />
              Coller la traduction
            </button>
          )}

          {/* Auto-translate button (Auto mode) */}
          {activeTab === "fr" && translationMode === "auto" && (
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating || !values.fr}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900/30 dark:text-blue-400"
            >
              {translating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Traduction...
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  Traduire vers EN/ES/AR
                </>
              )}
            </button>
          )}

          {/* Link to Google Translate (Manual mode) */}
          {activeTab === "fr" && translationMode === "manual" && values.fr && (
            <a
              href={`https://translate.google.com/?sl=fr&tl=en&text=${encodeURIComponent(
                values.fr
              )}&op=translate`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
            >
              <ExternalLink className="w-3 h-3" />
              Ouvrir Google Translate
            </a>
          )}
        </div>
      </div>

      {/* Manual Translation Help */}
      {translationMode === "manual" && activeTab === "fr" && (
        <div className="p-3 bg-green-50 rounded-lg text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <strong>Mode Manuel:</strong>
          <ol className="list-decimal ml-4 mt-1 space-y-1">
            <li>Cliquez &quot;Copier le texte FR&quot; pour copier</li>
            <li>Cliquez &quot;Ouvrir Google Translate&quot; pour traduire</li>
            <li>Copiez la traduction de Google</li>
            <li>Sélectionnez l&apos;onglet EN/ES/AR</li>
            <li>Cliquez &quot;Coller la traduction&quot;</li>
          </ol>
        </div>
      )}

      {/* Show All Languages Toggle */}
      <button
        type="button"
        onClick={() => setShowAllLanguages(!showAllLanguages)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        {showAllLanguages ? (
          <>
            <ChevronUp className="w-3 h-3" />
            Masquer les autres langues
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            Voir toutes les langues
          </>
        )}
      </button>

      {/* Expanded View - All Languages */}
      {showAllLanguages && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3 dark:bg-gray-900">
          {LANGUAGES.filter((l) => l.code !== activeTab).map((lang) => (
            <div key={lang.code}>
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {lang.flag} {lang.name}
                  {values[lang.code as keyof MultilingualValues]?.trim() && (
                    <span className="text-green-600">✓</span>
                  )}
                </label>
                {lang.code !== "fr" && (
                  <button
                    type="button"
                    onClick={() =>
                      pasteFromClipboard(lang.code as keyof MultilingualValues)
                    }
                    className="text-xs text-green-600 hover:text-green-700"
                  >
                    Coller
                  </button>
                )}
              </div>
              {type === "textarea" ? (
                <textarea
                  value={values[lang.code as keyof MultilingualValues] || ""}
                  onChange={(e) =>
                    handleChange(
                      lang.code as keyof MultilingualValues,
                      e.target.value
                    )
                  }
                  rows={2}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                    lang.dir === "rtl" ? "text-right" : "text-left"
                  }`}
                  dir={lang.dir}
                  placeholder={lang.name}
                />
              ) : (
                <input
                  type="text"
                  value={values[lang.code as keyof MultilingualValues] || ""}
                  onChange={(e) =>
                    handleChange(
                      lang.code as keyof MultilingualValues,
                      e.target.value
                    )
                  }
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                    lang.dir === "rtl" ? "text-right" : "text-left"
                  }`}
                  dir={lang.dir}
                  placeholder={lang.name}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Translation Status */}
      <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
        {LANGUAGES.map((lang) => {
          const hasContent = values[lang.code as keyof MultilingualValues]?.trim();
          return (
            <span
              key={lang.code}
              className={`px-2 py-0.5 rounded text-xs ${
                hasContent
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-400 dark:bg-gray-700"
              }`}
            >
              {lang.flag} {hasContent ? "✓" : "○"}
            </span>
          );
        })}
      </div>
    </div>
  );
}
