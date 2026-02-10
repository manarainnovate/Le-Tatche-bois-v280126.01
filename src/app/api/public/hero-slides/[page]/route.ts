import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// Public API - Get Hero Slides for a specific page
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;

    const slides = await prisma.heroSlide.findMany({
      where: {
        targetPage: page,
        isActive: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Public hero slides error:", error);
    return NextResponse.json({ slides: [] });
  }
}
