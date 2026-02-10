import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Hero Slides API
// ═══════════════════════════════════════════════════════════

const createSchema = z.object({
  targetPage: z.string().min(1),
  mediaType: z.enum(["image", "video"]).optional(),
  imageUrl: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  videoPoster: z.string().nullable().optional(),
  titleFr: z.string().min(1),
  titleEn: z.string().nullable().optional(),
  titleEs: z.string().nullable().optional(),
  titleAr: z.string().nullable().optional(),
  subtitleFr: z.string().nullable().optional(),
  subtitleEn: z.string().nullable().optional(),
  subtitleEs: z.string().nullable().optional(),
  subtitleAr: z.string().nullable().optional(),
  ctaTextFr: z.string().nullable().optional(),
  ctaTextEn: z.string().nullable().optional(),
  ctaUrl: z.string().nullable().optional(),
  cta2TextFr: z.string().nullable().optional(),
  cta2TextEn: z.string().nullable().optional(),
  cta2Url: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - List slides by page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetPage = searchParams.get("pageSlug") || searchParams.get("targetPage");

    const slides = await prisma.heroSlide.findMany({
      where: targetPage ? { targetPage } : undefined,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Hero Slides GET error:", error);
    return NextResponse.json({ error: "Failed to fetch slides" }, { status: 500 });
  }
}

// POST - Create slide
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Map pageSlug to targetPage for backwards compatibility
    if (body.pageSlug && !body.targetPage) {
      body.targetPage = body.pageSlug;
      delete body.pageSlug;
    }

    // Map ctaLabel fields to ctaText fields
    if (body.ctaLabelFr && !body.ctaTextFr) {
      body.ctaTextFr = body.ctaLabelFr;
      delete body.ctaLabelFr;
    }
    if (body.ctaLabelEn && !body.ctaTextEn) {
      body.ctaTextEn = body.ctaLabelEn;
      delete body.ctaLabelEn;
    }
    if (body.ctaLink && !body.ctaUrl) {
      body.ctaUrl = body.ctaLink;
      delete body.ctaLink;
    }

    // Remove fields that don't exist in schema
    delete body.ctaLabelEs;
    delete body.ctaLabelAr;

    const validation = createSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get next order number
    const lastSlide = await prisma.heroSlide.findFirst({
      where: { targetPage: data.targetPage },
      orderBy: { order: "desc" },
    });

    const slide = await prisma.heroSlide.create({
      data: {
        ...data,
        order: data.order ?? (lastSlide?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error("Hero Slides POST error:", error);
    return NextResponse.json({ error: "Failed to create slide" }, { status: 500 });
  }
}
