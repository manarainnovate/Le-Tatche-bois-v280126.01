import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Navigation API
// ═══════════════════════════════════════════════════════════

const navigationItemSchema = z.object({
  location: z.string(),
  labelFr: z.string().min(1),
  labelEn: z.string().nullable().optional(),
  labelEs: z.string().nullable().optional(),
  labelAr: z.string().nullable().optional(),
  url: z.string().min(1),
  target: z.string().default("_self"),
  icon: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().default(true),
});

// GET - List navigation items by location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    const where = location ? { location } : {};

    const items = await prisma.navigationItem.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Navigation GET error:", error);
    return NextResponse.json({ error: "Failed to fetch navigation" }, { status: 500 });
  }
}

// POST - Create navigation item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = navigationItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get max order for this location
    const maxOrder = await prisma.navigationItem.aggregate({
      where: { location: data.location },
      _max: { order: true },
    });

    const item = await prisma.navigationItem.create({
      data: {
        ...data,
        order: data.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Navigation POST error:", error);
    return NextResponse.json({ error: "Failed to create navigation item" }, { status: 500 });
  }
}
