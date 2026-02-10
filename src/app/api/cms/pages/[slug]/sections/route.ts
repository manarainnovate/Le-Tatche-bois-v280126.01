import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// CMS Page Sections API
// ═══════════════════════════════════════════════════════════

// GET - Get all sections for a page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const sections = await prisma.pageSection.findMany({
      where: { pageSlug: slug },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("PageSections GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

// PUT - Update/Create sections for a page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "sections must be an array" }, { status: 400 });
    }

    // Upsert each section
    const results = await Promise.all(
      sections.map(async (section: {
        sectionKey: string;
        sectionType?: string;
        titleFr?: string;
        titleEn?: string;
        titleEs?: string;
        titleAr?: string;
        subtitleFr?: string;
        subtitleEn?: string;
        subtitleEs?: string;
        subtitleAr?: string;
        contentFr?: string;
        contentEn?: string;
        contentEs?: string;
        contentAr?: string;
        imageUrl?: string;
        videoUrl?: string;
        bgColor?: string;
        bgImage?: string;
        bgOverlay?: number;
        ctaTextFr?: string;
        ctaTextEn?: string;
        ctaUrl?: string;
        ctaStyle?: string;
        cta2TextFr?: string;
        cta2TextEn?: string;
        cta2Url?: string;
        order?: number;
        isActive?: boolean;
      }) => {
        return prisma.pageSection.upsert({
          where: {
            pageSlug_sectionKey: {
              pageSlug: slug,
              sectionKey: section.sectionKey,
            },
          },
          update: {
            sectionType: section.sectionType,
            titleFr: section.titleFr,
            titleEn: section.titleEn,
            titleEs: section.titleEs,
            titleAr: section.titleAr,
            subtitleFr: section.subtitleFr,
            subtitleEn: section.subtitleEn,
            subtitleEs: section.subtitleEs,
            subtitleAr: section.subtitleAr,
            contentFr: section.contentFr,
            contentEn: section.contentEn,
            contentEs: section.contentEs,
            contentAr: section.contentAr,
            imageUrl: section.imageUrl,
            videoUrl: section.videoUrl,
            bgColor: section.bgColor,
            bgImage: section.bgImage,
            bgOverlay: section.bgOverlay,
            ctaTextFr: section.ctaTextFr,
            ctaTextEn: section.ctaTextEn,
            ctaUrl: section.ctaUrl,
            ctaStyle: section.ctaStyle,
            cta2TextFr: section.cta2TextFr,
            cta2TextEn: section.cta2TextEn,
            cta2Url: section.cta2Url,
            order: section.order ?? 0,
            isActive: section.isActive ?? true,
          },
          create: {
            pageSlug: slug,
            sectionKey: section.sectionKey,
            sectionType: section.sectionType || "content",
            titleFr: section.titleFr,
            titleEn: section.titleEn,
            titleEs: section.titleEs,
            titleAr: section.titleAr,
            subtitleFr: section.subtitleFr,
            subtitleEn: section.subtitleEn,
            subtitleEs: section.subtitleEs,
            subtitleAr: section.subtitleAr,
            contentFr: section.contentFr,
            contentEn: section.contentEn,
            contentEs: section.contentEs,
            contentAr: section.contentAr,
            imageUrl: section.imageUrl,
            videoUrl: section.videoUrl,
            bgColor: section.bgColor,
            bgImage: section.bgImage,
            bgOverlay: section.bgOverlay,
            ctaTextFr: section.ctaTextFr,
            ctaTextEn: section.ctaTextEn,
            ctaUrl: section.ctaUrl,
            ctaStyle: section.ctaStyle,
            cta2TextFr: section.cta2TextFr,
            cta2TextEn: section.cta2TextEn,
            cta2Url: section.cta2Url,
            order: section.order ?? 0,
            isActive: section.isActive ?? true,
          },
        });
      })
    );

    return NextResponse.json({ sections: results });
  } catch (error) {
    console.error("PageSections PUT error:", error);
    return NextResponse.json({ error: "Failed to update sections" }, { status: 500 });
  }
}
