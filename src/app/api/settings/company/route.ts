import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const CompanySettingsSchema = z.object({
  companyName: z.string().min(1, "Nom requis"),
  tagline: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  phoneAlt: z.string().optional().nullable(),
  fax: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  // Legal info (Moroccan)
  rc: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  ice: z.string().optional().nullable(),
  pat: z.string().optional().nullable(),
  cnss: z.string().optional().nullable(),
  // Bank info
  bankName: z.string().optional().nullable(),
  bankAgency: z.string().optional().nullable(),
  bankAddress: z.string().optional().nullable(),
  rib: z.string().optional().nullable(),
  iban: z.string().optional().nullable(),
  swift: z.string().optional().nullable(),
  // TVA
  defaultTvaRate: z.number().min(0).max(100).optional(),
  tvaRates: z.array(z.number()).optional().nullable(),
  showPricesWithTva: z.boolean().optional(),
  // Logo
  logoUrl: z.string().optional().nullable(),
  logoLightUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  // Social
  facebook: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/settings/company - Get company settings
// ═══════════════════════════════════════════════════════════

export async function GET() {
  try {
    let settings = await prisma.companySettings.findFirst();

    if (!settings) {
      // Create default settings (use schema defaults)
      settings = await prisma.companySettings.create({
        data: {
          id: "company",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        defaultTvaRate: settings.defaultTvaRate ? Number(settings.defaultTvaRate) : 20,
      },
    });
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/settings/company - Update company settings
// ═══════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = CompanySettingsSchema.parse(body);

    // Build update data - allow null for logo fields to support removal
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validated)) {
      // Allow null for logo fields (to support logo removal)
      if (key === "logoUrl" || key === "logoLightUrl" || key === "faviconUrl") {
        updateData[key] = value;
      } else if (value !== null && value !== undefined) {
        updateData[key] = value;
      }
    }

    // Get or create settings
    let settings = await prisma.companySettings.findFirst();

    if (settings) {
      settings = await prisma.companySettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      settings = await prisma.companySettings.create({
        data: {
          id: "company",
          ...updateData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        defaultTvaRate: settings.defaultTvaRate ? Number(settings.defaultTvaRate) : 20,
      },
    });
  } catch (error) {
    console.error("Error updating company settings:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
}
