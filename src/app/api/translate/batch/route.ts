import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════
// Batch Translation API - Multiple Fields Translation
// Uses MyMemory Translation API (free, no API key required)
// ═══════════════════════════════════════════════════════════

const LANGUAGE_CODES: Record<string, string> = {
  fr: "fr",
  en: "en",
  es: "es",
  ar: "ar",
};

interface FieldToTranslate {
  fieldName: string;
  text: string;
}

interface BatchTranslateRequest {
  fields: FieldToTranslate[];
  fromLang: string;
  toLangs: string[];
}

interface TranslationResults {
  [fieldName: string]: {
    [lang: string]: string;
  };
}

async function translateWithMyMemory(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  // Add small delay to avoid rate limiting
  await new Promise((resolve) => setTimeout(resolve, 100));

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${fromLang}|${toLang}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("MyMemory API error");
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || "Translation failed");
  }

  return data.responseData.translatedText;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchTranslateRequest = await request.json();
    const { fields, fromLang, toLangs } = body;

    // Validate input
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty fields array" },
        { status: 400 }
      );
    }

    if (!fromLang || !toLangs || !Array.isArray(toLangs)) {
      return NextResponse.json(
        { error: "Missing fromLang or toLangs" },
        { status: 400 }
      );
    }

    // Validate languages
    if (!LANGUAGE_CODES[fromLang]) {
      return NextResponse.json(
        { error: `Invalid source language: ${fromLang}` },
        { status: 400 }
      );
    }

    for (const lang of toLangs) {
      if (!LANGUAGE_CODES[lang]) {
        return NextResponse.json(
          { error: `Invalid target language: ${lang}` },
          { status: 400 }
        );
      }
    }

    const translations: TranslationResults = {};

    // Process each field
    for (const field of fields) {
      if (!field.text || field.text.trim() === "") {
        continue;
      }

      translations[field.fieldName] = {};

      // Translate to each target language
      for (const toLang of toLangs) {
        if (toLang === fromLang) {
          translations[field.fieldName][toLang] = field.text;
          continue;
        }

        try {
          const translatedText = await translateWithMyMemory(
            field.text,
            fromLang,
            toLang
          );
          translations[field.fieldName][toLang] = translatedText;
        } catch (error) {
          console.error(
            `Translation failed for ${field.fieldName} to ${toLang}:`,
            error
          );
          // Keep original text on failure
          translations[field.fieldName][toLang] = "";
        }
      }
    }

    return NextResponse.json({
      translations,
      fromLang,
      toLangs,
      fieldsProcessed: Object.keys(translations).length,
    });
  } catch (error) {
    console.error("Batch translation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
