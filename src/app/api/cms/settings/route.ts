import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ═══════════════════════════════════════════════════════════
// CMS Settings API
// ═══════════════════════════════════════════════════════════

// GET - Get settings by group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");

    if (!group) {
      return NextResponse.json({ error: "Group parameter required" }, { status: 400 });
    }

    // Get settings
    const settingsRaw = await prisma.siteSetting.findMany({
      where: { group },
    });

    // Convert to object keyed by setting key
    const settings: Record<string, {
      valueFr?: string | null;
      valueEn?: string | null;
      valueEs?: string | null;
      valueAr?: string | null;
      valueJson?: unknown;
    }> = {};

    for (const setting of settingsRaw) {
      settings[setting.key] = {
        valueFr: setting.valueFr,
        valueEn: setting.valueEn,
        valueEs: setting.valueEs,
        valueAr: setting.valueAr,
        valueJson: setting.valueJson,
      };
    }

    // Get social links if footer
    let socialLinks: { id: string; platform: string; url: string; isActive: boolean }[] = [];
    if (group === "footer") {
      socialLinks = await prisma.socialLink.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          platform: true,
          url: true,
          isActive: true,
        },
      });
    }

    return NextResponse.json({ settings, socialLinks });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { group, settings, socialLinks } = body;

    if (!group) {
      return NextResponse.json({ error: "Group parameter required" }, { status: 400 });
    }

    // Update settings
    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        const typedValue = value as {
          valueFr?: string;
          valueEn?: string;
          valueEs?: string;
          valueAr?: string;
          valueJson?: unknown;
        };

        // Handle valueJson properly for Prisma Json type
        const jsonValue = typedValue.valueJson !== undefined
          ? (typedValue.valueJson === null
              ? Prisma.JsonNull
              : typedValue.valueJson as Prisma.InputJsonValue)
          : undefined;

        await prisma.siteSetting.upsert({
          where: { key: `${group}_${key}` },
          update: {
            valueFr: typedValue.valueFr,
            valueEn: typedValue.valueEn,
            valueEs: typedValue.valueEs,
            valueAr: typedValue.valueAr,
            valueJson: jsonValue,
            group,
          },
          create: {
            key: `${group}_${key}`,
            valueFr: typedValue.valueFr,
            valueEn: typedValue.valueEn,
            valueEs: typedValue.valueEs,
            valueAr: typedValue.valueAr,
            valueJson: jsonValue,
            group,
          },
        });
      }
    }

    // Update social links
    if (socialLinks && Array.isArray(socialLinks)) {
      // Delete existing and recreate
      await prisma.socialLink.deleteMany({});

      for (let i = 0; i < socialLinks.length; i++) {
        const link = socialLinks[i];
        if (link.url) {
          await prisma.socialLink.create({
            data: {
              platform: link.platform,
              url: link.url,
              order: i,
              isActive: link.isActive ?? true,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
