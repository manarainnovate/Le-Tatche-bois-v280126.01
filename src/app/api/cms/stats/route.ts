import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Stats/Counters API
// ═══════════════════════════════════════════════════════════

const createSchema = z.object({
  value: z.string().min(1),
  labelFr: z.string().min(1),
  labelEn: z.string().nullable().optional(),
  labelEs: z.string().nullable().optional(),
  labelAr: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - List all stats
export async function GET() {
  try {
    const stats = await prisma.statCounter.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Stats GET error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

// POST - Create stat
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

    // Get next order number
    const lastStat = await prisma.statCounter.findFirst({
      orderBy: { order: "desc" },
    });

    const stat = await prisma.statCounter.create({
      data: {
        ...data,
        order: data.order ?? (lastStat?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ stat }, { status: 201 });
  } catch (error) {
    console.error("Stats POST error:", error);
    return NextResponse.json({ error: "Failed to create stat" }, { status: 500 });
  }
}
