import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const updateAppointmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["VISIT", "MEASURE", "DELIVERY", "INSTALLATION", "MEETING", "FOLLOW_UP"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  assignedTo: z.string().optional(),
  outcome: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/appointments/[id] - Get appointment details
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            leadNumber: true,
            fullName: true,
            company: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      return apiError("Rendez-vous non trouvé", 404);
    }

    return apiSuccess(appointment);
  } catch (error) {
    return handleApiError(error, "Appointment GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/crm/appointments/[id] - Update appointment
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateAppointmentSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return apiError("Rendez-vous non trouvé", 404);
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assignedTo !== undefined) updateData.assignedToId = data.assignedTo;
    if (data.outcome !== undefined) updateData.outcome = data.outcome;

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        lead: {
          select: {
            id: true,
            leadNumber: true,
            fullName: true,
          },
        },
      },
    });

    // Create activity if status changed to completed
    if (data.status === "COMPLETED" && existingAppointment.status !== "COMPLETED") {
      const activityData: Record<string, unknown> = {
        type: "MEETING",
        title: `Rendez-vous terminé: ${appointment.title}`,
        description: data.outcome || `${appointment.type} complété`,
      };

      if (existingAppointment.leadId) {
        activityData.leadId = existingAppointment.leadId;
      } else if (existingAppointment.clientId) {
        activityData.clientId = existingAppointment.clientId;
      }

      await prisma.activity.create({
        data: activityData as {
          type: "CALL" | "WHATSAPP" | "EMAIL" | "VISIT" | "MEETING" | "NOTE" | "STATUS_CHANGE";
          title?: string;
          description: string;
          leadId?: string;
          clientId?: string;
        },
      });
    }

    return apiSuccess(appointment);
  } catch (error) {
    return handleApiError(error, "Appointment PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/appointments/[id] - Delete appointment
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return apiError("Rendez-vous non trouvé", 404);
    }

    // Don't allow deleting completed appointments
    if (appointment.status === "COMPLETED") {
      return apiError("Impossible de supprimer un rendez-vous terminé", 400);
    }

    // Delete appointment
    await prisma.appointment.delete({
      where: { id },
    });

    return apiSuccess({ message: "Rendez-vous supprimé" });
  } catch (error) {
    return handleApiError(error, "Appointment DELETE");
  }
}
