import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, statSync } from "fs";
import path from "path";
import dotenv from "dotenv";
import sharp from "sharp";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// ═══════════════════════════════════════════════════════════
// Prisma client setup (adapter pattern required)
// ═══════════════════════════════════════════════════════════

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════
// Anthropic client setup
// ═══════════════════════════════════════════════════════════

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
if (!anthropicApiKey) {
  console.error("❌ ANTHROPIC_API_KEY not set in .env");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: anthropicApiKey });

// ═══════════════════════════════════════════════════════════
// Helper: Analyze image with Claude Vision
// ═══════════════════════════════════════════════════════════

interface SlideContent {
  titleFr: string;
  titleEn: string;
  titleEs: string;
  titleAr: string;
  subtitleFr: string;
  subtitleEn: string;
  subtitleEs: string;
  subtitleAr: string;
}

function getMediaType(ext: string): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  switch (ext.toLowerCase()) {
    case ".png": return "image/png";
    case ".webp": return "image/webp";
    case ".gif": return "image/gif";
    default: return "image/jpeg";
  }
}

const MAX_FILE_SIZE = 3.5 * 1024 * 1024; // 3.5MB raw → ~4.7MB base64, under 5MB API limit

async function analyzeImage(imagePath: string): Promise<SlideContent> {
  const absolutePath = path.join(process.cwd(), "public", imagePath);
  const originalSize = statSync(absolutePath).size;
  let imageBuffer: Buffer;
  let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  if (originalSize > MAX_FILE_SIZE) {
    // Resize large images with sharp
    imageBuffer = await sharp(absolutePath)
      .resize(1600, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    mediaType = "image/jpeg";
  } else {
    imageBuffer = readFileSync(absolutePath);
    const ext = path.extname(absolutePath);
    mediaType = getMediaType(ext);
  }

  const base64Image = imageBuffer.toString("base64");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `You are an expert at analyzing woodworking and carpentry images for a Moroccan artisan woodworking company called "Le Tatche Bois" based in Tangier, Morocco.

Analyze this image and determine what woodworking product/service it shows. Common categories:
- Portes (doors), Escaliers (staircases), Plafonds (ceilings), Cuisines (kitchens)
- Placards/Dressings (wardrobes/closets), Salons (living rooms), Moucharabieh (lattice screens)
- Habillage mural (wall cladding), Meubles (furniture), Bibliothèques (bookshelves)
- Fenêtres (windows), Pergolas, Portails (gates), Parquet (flooring)
- Charpente (framework), Bardage (facade cladding)

Generate a title and subtitle for this image in 4 languages.

RULES:
- Title: MAX 6 words, professional, evocative
- Subtitle: MAX 15 words, describes the craftsmanship or value shown
- Be specific to what you SEE in the image
- Mention wood types if visible (cedar, oak, walnut, etc.)
- Reference Moroccan/Islamic patterns if visible
- Keep Arabic text natural and professional

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "titleFr": "...",
  "titleEn": "...",
  "titleEs": "...",
  "titleAr": "...",
  "subtitleFr": "...",
  "subtitleEn": "...",
  "subtitleEs": "...",
  "subtitleAr": "..."
}`,
          },
        ],
      },
    ],
  });

  // Extract JSON from response
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from API");
  }

  let jsonStr = textBlock.text.trim();
  // Remove markdown code fences if present
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(jsonStr) as SlideContent;

  // Validate all fields exist
  const requiredFields: (keyof SlideContent)[] = [
    "titleFr", "titleEn", "titleEs", "titleAr",
    "subtitleFr", "subtitleEn", "subtitleEs", "subtitleAr",
  ];
  for (const field of requiredFields) {
    if (!parsed[field]) {
      throw new Error(`Missing field: ${field}`);
    }
  }

  return parsed;
}

// ═══════════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("🚀 Starting AI Vision-based hero slide title fix...\n");

  // 1. Fetch all slides
  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: "asc" },
  });

  console.log(`📊 Found ${slides.length} slides to analyze`);
  console.log(`🤖 Using Claude Sonnet for vision analysis\n`);

  let updated = 0;
  let errors = 0;
  const BATCH_SIZE = 5; // Process 5 at a time to avoid rate limits

  for (let i = 0; i < slides.length; i += BATCH_SIZE) {
    const batch = slides.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (slide) => {
      const imageUrl = slide.imageUrl;
      if (!imageUrl) {
        console.log(`  ⚠️  Slide #${slide.order} has no imageUrl, skipping`);
        return;
      }

      try {
        // Analyze image
        const content = await analyzeImage(imageUrl);

        // Update database
        await prisma.heroSlide.update({
          where: { id: slide.id },
          data: {
            titleFr: content.titleFr,
            titleEn: content.titleEn,
            titleEs: content.titleEs,
            titleAr: content.titleAr,
            subtitleFr: content.subtitleFr,
            subtitleEn: content.subtitleEn,
            subtitleEs: content.subtitleEs,
            subtitleAr: content.subtitleAr,
          },
        });

        updated++;
        console.log(
          `  ✅ [${updated}/${slides.length}] Slide #${slide.order}: "${content.titleFr}" → "${content.titleEn}"`
        );
      } catch (err: any) {
        errors++;
        console.error(
          `  ❌ Slide #${slide.order} (${imageUrl}): ${err.message}`
        );
      }
    });

    await Promise.all(promises);

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < slides.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`🎉 AI Vision analysis complete!`);
  console.log(`   ✅ Updated: ${updated} slides`);
  console.log(`   ❌ Errors: ${errors} slides`);
  console.log(`   📊 Total: ${slides.length} slides processed`);
  console.log(`═══════════════════════════════════════════`);
}

main()
  .catch((e) => {
    console.error("❌ Script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
