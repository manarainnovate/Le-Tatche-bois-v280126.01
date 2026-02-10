import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, withAuth } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const createActivitySchema = z.object({
  type: z.enum(["CALL", "WHATSAPP", "EMAIL", "VISIT", "MEETING", "NOTE", "STATUS_CHANGE"]),
  title: z.string().optional(),
  description: z.string().min(1, "La description est requise"),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/leads/[id]/activities - Get lead activities
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return apiError("Lead non trouvé", 404);
    }

    const activities = await prisma.activity.findMany({
      where: { leadId: id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ activities });
  } catch (error) {
    return handleApiError(error, "Lead Activities GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/leads/[id]/activities - Create activity
// ═══════════════════════════════════════════════════════════

export const POST = withAuth(
  async (request: NextRequest, context, user) => {
    try {
      const { id } = await (context.params as Promise<{ id: string }>);
      const body = await request.json();
      const result = createActivitySchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      // Check if lead exists
      const lead = await prisma.lead.findUnique({
        where: { id },
      });

      if (!lead) {
        return apiError("Lead non trouvé", 404);
      }

      const data = result.data;

      // Create activity
      const activity = await prisma.activity.create({
        data: {
          type: data.type,
          title: data.title || null,
          description: data.description,
          leadId: id,
          createdById: user?.id || null,
        },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
      });

      // Update lead's status based on activity type if appropriate
      if (data.type === "CALL" || data.type === "WHATSAPP" || data.type === "EMAIL") {
        if (lead.status === "NEW") {
          await prisma.lead.update({
            where: { id },
            data: { status: "CONTACTED" },
          });
        }
      }

      return apiSuccess({ activity }, 201);
    } catch (error) {
      return handleApiError(error, "Lead Activities POST");
    }
  },
  ["ADMIN", "MANAGER", "COMMERCIAL"]
);
