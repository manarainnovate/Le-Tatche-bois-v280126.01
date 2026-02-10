import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const updateLeadSchema = z.object({
  source: z.enum(["WEBSITE", "WHATSAPP", "PHONE", "FACEBOOK", "INSTAGRAM", "REFERRAL", "WALK_IN", "OTHER"]).optional(),
  fullName: z.string().min(2).optional(),
  company: z.string().nullable().optional(),
  phone: z.string().min(8).optional(),
  phoneAlt: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  city: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  clientType: z.enum(["INDIVIDUAL", "COMPANY"]).optional(),
  ice: z.string().nullable().optional(),
  need: z.string().nullable().optional(),
  budgetMin: z.number().nullable().optional(),
  budgetMax: z.number().nullable().optional(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["NEW", "CONTACTED", "VISIT_SCHEDULED", "MEASURES_TAKEN", "QUOTE_SENT", "NEGOTIATION", "WON", "LOST"]).optional(),
  assignedToId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  lostReason: z.string().nullable().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/leads/[id] - Get lead with activities
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        activities: {
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          orderBy: { startDate: "desc" },
          take: 10,
        },
        convertedToClient: {
          select: { id: true, clientNumber: true, fullName: true },
        },
      },
    });

    if (!lead) {
      return apiError("Lead non trouvé", 404);
    }

    return apiSuccess({ lead });
  } catch (error) {
    return handleApiError(error, "Lead GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/crm/leads/[id] - Update lead
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateLeadSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return apiError("Lead non trouvé", 404);
    }

    const data = result.data;

    // Track status change for activity
    const statusChanged = data.status && data.status !== existingLead.status;
    const oldStatus = existingLead.status;

    // Update lead
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        // Handle optional null values
        company: data.company !== undefined ? data.company : existingLead.company,
        phoneAlt: data.phoneAlt !== undefined ? data.phoneAlt : existingLead.phoneAlt,
        email: data.email !== undefined ? data.email : existingLead.email,
        city: data.city !== undefined ? data.city : existingLead.city,
        address: data.address !== undefined ? data.address : existingLead.address,
        ice: data.ice !== undefined ? data.ice : existingLead.ice,
        need: data.need !== undefined ? data.need : existingLead.need,
        budgetMin: data.budgetMin !== undefined ? data.budgetMin : existingLead.budgetMin,
        budgetMax: data.budgetMax !== undefined ? data.budgetMax : existingLead.budgetMax,
        notes: data.notes !== undefined ? data.notes : existingLead.notes,
        assignedToId: data.assignedToId !== undefined ? data.assignedToId : existingLead.assignedToId,
        lostReason: data.lostReason !== undefined ? data.lostReason : existingLead.lostReason,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });

    // Create activity for status change
    if (statusChanged) {
      await prisma.activity.create({
        data: {
          type: "STATUS_CHANGE",
          description: `Statut changé de "${oldStatus}" à "${data.status}"`,
          leadId: id,
        },
      });
    }

    return apiSuccess({ lead });
  } catch (error) {
    return handleApiError(error, "Lead PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/leads/[id] - Delete lead
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        convertedToClient: true,
      },
    });

    if (!lead) {
      return apiError("Lead non trouvé", 404);
    }

    // Don't delete if converted to client
    if (lead.convertedToClient) {
      return apiError("Ce lead a été converti en client et ne peut pas être supprimé", 400);
    }

    // Delete lead (activities will cascade)
    await prisma.lead.delete({
      where: { id },
    });

    return apiSuccess({ message: "Lead supprimé avec succès" });
  } catch (error) {
    return handleApiError(error, "Lead DELETE");
  }
}
