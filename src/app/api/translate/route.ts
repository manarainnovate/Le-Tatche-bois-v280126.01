import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════
// Translation API - Single Text Translation
// Uses MyMemory Translation API (free, no API key required)
// Fallback to LibreTranslate if MyMemory fails
// ═══════════════════════════════════════════════════════════

const LANGUAGE_CODES: Record<string, string> = {
  fr: "fr",
  en: "en",
  es: "es",
  ar: "ar",
};

interface TranslateRequest {
  text: string;
  fromLang: string;
  toLang: string;
}

async function translateWithMyMemory(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
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

async function translateWithLibreTranslate(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  // LibreTranslate free instance
  const url = "https://libretranslate.com/translate";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      source: fromLang,
      target: toLang,
      format: "text",
    }),
  });

  if (!response.ok) {
    throw new Error("LibreTranslate API error");
  }

  const data = await response.json();
  return data.translatedText;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, fromLang, toLang } = body;

    // Validate input
    if (!text || !fromLang || !toLang) {
      return NextResponse.json(
        { error: "Missing required fields: text, fromLang, toLang" },
        { status: 400 }
      );
    }

    // Validate languages
    if (!LANGUAGE_CODES[fromLang] || !LANGUAGE_CODES[toLang]) {
      return NextResponse.json(
        { error: "Invalid language code. Supported: fr, en, es, ar" },
        { status: 400 }
      );
    }

    // Skip if same language
    if (fromLang === toLang) {
      return NextResponse.json({ translatedText: text });
    }

    let translatedText: string;

    try {
      // Try MyMemory first (free, reliable)
      translatedText = await translateWithMyMemory(text, fromLang, toLang);
    } catch (error) {
      console.warn("MyMemory failed, trying LibreTranslate:", error);
      try {
        // Fallback to LibreTranslate
        translatedText = await translateWithLibreTranslate(
          text,
          fromLang,
          toLang
        );
      } catch (fallbackError) {
        console.error("All translation services failed:", fallbackError);
        return NextResponse.json(
          { error: "Translation services unavailable" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({
      translatedText,
      fromLang,
      toLang,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
