import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createAppointmentSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().optional(),
  type: z.enum(["VISIT", "MEASURE", "DELIVERY", "INSTALLATION", "MEETING", "FOLLOW_UP"]),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  leadId: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  assignedTo: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/appointments - Get appointments
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const leadId = searchParams.get("leadId");
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");
    const assignedTo = searchParams.get("assignedTo");

    // Build where clause
    const where: Record<string, unknown> = {};

    // Date range filter
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) {
        (where.startDate as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.startDate as Record<string, Date>).lte = new Date(endDate);
      }
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            leadNumber: true,
            fullName: true,
            company: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    // Group by date for calendar view
    const groupedByDate = appointments.reduce(
      (acc, appointment) => {
        const dateKey = appointment.startDate.toISOString().split("T")[0];
        if (dateKey) {
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(appointment);
        }
        return acc;
      },
      {} as Record<string, typeof appointments>
    );

    return apiSuccess({
      appointments,
      groupedByDate,
      total: appointments.length,
    });
  } catch (error) {
    return handleApiError(error, "Appointments GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/appointments - Create appointment
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createAppointmentSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Validate that at least one relation is provided
    if (!data.leadId && !data.clientId && !data.projectId) {
      return apiError("Lead, client ou projet requis", 400);
    }

    // Validate lead exists if provided
    if (data.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: data.leadId },
      });
      if (!lead) {
        return apiError("Lead non trouvé", 404);
      }
    }

    // Validate client exists if provided
    if (data.clientId) {
      const client = await prisma.cRMClient.findUnique({
        where: { id: data.clientId },
      });
      if (!client) {
        return apiError("Client non trouvé", 404);
      }
    }

    // Validate project exists if provided
    if (data.projectId) {
      const project = await prisma.cRMProject.findUnique({
        where: { id: data.projectId },
      });
      if (!project) {
        return apiError("Projet non trouvé", 404);
      }
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        location: data.location,
        leadId: data.leadId,
        clientId: data.clientId,
        projectId: data.projectId,
        assignedToId: data.assignedTo,
        status: "SCHEDULED",
      },
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

    // Create activity for the related entity
    if (data.leadId) {
      await prisma.activity.create({
        data: {
          leadId: data.leadId,
          type: "MEETING",
          title: `Rendez-vous planifié: ${data.title}`,
          description: `${data.type} prévu le ${new Date(data.startDate).toLocaleDateString("fr-FR")}`,
        },
      });
    } else if (data.clientId) {
      await prisma.activity.create({
        data: {
          clientId: data.clientId,
          type: "MEETING",
          title: `Rendez-vous planifié: ${data.title}`,
          description: `${data.type} prévu le ${new Date(data.startDate).toLocaleDateString("fr-FR")}`,
        },
      });
    }

    return apiSuccess(appointment, 201);
  } catch (error) {
    return handleApiError(error, "Appointments POST");
  }
}
