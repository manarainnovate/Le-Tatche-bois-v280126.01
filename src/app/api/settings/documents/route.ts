import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ═══════════════════════════════════════════════════════════
// Validation Schema (subset of CompanySettings for document-related settings)
// ═══════════════════════════════════════════════════════════

const DocumentSettingsSchema = z.object({
  // Numbering prefixes
  leadPrefix: z.string().optional(),
  clientPrefix: z.string().optional(),
  projectPrefix: z.string().optional(),
  devisPrefix: z.string().optional(),
  bcPrefix: z.string().optional(),
  blPrefix: z.string().optional(),
  pvPrefix: z.string().optional(),
  facturePrefix: z.string().optional(),
  avoirPrefix: z.string().optional(),
  paymentPrefix: z.string().optional(),
  // Default terms
  defaultPaymentDays: z.number().int().min(0).optional(),
  quoteValidityDays: z.number().int().positive().optional(),
  defaultDepositPercent: z.number().min(0).max(100).optional(),
  // Default footer texts
  quoteFooter: z.string().optional().nullable(),
  bcFooter: z.string().optional().nullable(),
  blFooter: z.string().optional().nullable(),
  invoiceFooter: z.string().optional().nullable(),
  pvFooter: z.string().optional().nullable(),
  avoirFooter: z.string().optional().nullable(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/settings/documents - Get document settings
// ═══════════════════════════════════════════════════════════

export async function GET() {
  try {
    let settings = await prisma.companySettings.findFirst();

    if (!settings) {
      // Create default settings
      settings = await prisma.companySettings.create({
        data: {
          id: "company",
        },
      });
    }

    // Return only document-related settings
    return NextResponse.json({
      success: true,
      data: {
        leadPrefix: settings.leadPrefix,
        clientPrefix: settings.clientPrefix,
        projectPrefix: settings.projectPrefix,
        devisPrefix: settings.devisPrefix,
        bcPrefix: settings.bcPrefix,
        blPrefix: settings.blPrefix,
        pvPrefix: settings.pvPrefix,
        facturePrefix: settings.facturePrefix,
        avoirPrefix: settings.avoirPrefix,
        paymentPrefix: settings.paymentPrefix,
        defaultPaymentDays: settings.defaultPaymentDays,
        quoteValidityDays: settings.quoteValidityDays,
        defaultDepositPercent: settings.defaultDepositPercent ? Number(settings.defaultDepositPercent) : null,
        quoteFooter: settings.quoteFooter,
        bcFooter: settings.bcFooter,
        blFooter: settings.blFooter,
        invoiceFooter: settings.invoiceFooter,
        pvFooter: settings.pvFooter,
        avoirFooter: settings.avoirFooter,
      },
    });
  } catch (error) {
    console.error("Error fetching document settings:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/settings/documents - Update document settings
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
    const validated = DocumentSettingsSchema.parse(body);

    // Convert to update data, excluding nulls/undefined
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validated)) {
      if (value !== undefined && value !== null) {
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
        leadPrefix: settings.leadPrefix,
        clientPrefix: settings.clientPrefix,
        projectPrefix: settings.projectPrefix,
        devisPrefix: settings.devisPrefix,
        bcPrefix: settings.bcPrefix,
        blPrefix: settings.blPrefix,
        pvPrefix: settings.pvPrefix,
        facturePrefix: settings.facturePrefix,
        avoirPrefix: settings.avoirPrefix,
        paymentPrefix: settings.paymentPrefix,
        defaultPaymentDays: settings.defaultPaymentDays,
        quoteValidityDays: settings.quoteValidityDays,
        defaultDepositPercent: settings.defaultDepositPercent ? Number(settings.defaultDepositPercent) : null,
        quoteFooter: settings.quoteFooter,
        bcFooter: settings.bcFooter,
        blFooter: settings.blFooter,
        invoiceFooter: settings.invoiceFooter,
        pvFooter: settings.pvFooter,
        avoirFooter: settings.avoirFooter,
      },
    });
  } catch (error) {
    console.error("Error updating document settings:", error);

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
