import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Site Services API (public website services)
// ═══════════════════════════════════════════════════════════

const createSchema = z.object({
  slug: z.string().min(1),
  titleFr: z.string().min(1),
  titleEn: z.string().nullable().optional(),
  titleEs: z.string().nullable().optional(),
  titleAr: z.string().nullable().optional(),
  shortDescFr: z.string().nullable().optional(),
  shortDescEn: z.string().nullable().optional(),
  shortDescEs: z.string().nullable().optional(),
  shortDescAr: z.string().nullable().optional(),
  fullDescFr: z.string().nullable().optional(),
  fullDescEn: z.string().nullable().optional(),
  fullDescEs: z.string().nullable().optional(),
  fullDescAr: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - List all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    const services = await prisma.siteService.findMany({
      where: active === "true" ? { isActive: true } : undefined,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Site Services GET error:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST - Create service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check slug uniqueness
    const existing = await prisma.siteService.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    // Get next order number
    const lastService = await prisma.siteService.findFirst({
      orderBy: { order: "desc" },
    });

    const service = await prisma.siteService.create({
      data: {
        ...data,
        order: data.order ?? (lastService?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Site Services POST error:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
