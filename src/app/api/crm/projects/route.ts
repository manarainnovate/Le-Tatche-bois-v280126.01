import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";
import { generateB2BNumber } from "@/lib/crm/generate-document-number";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createProjectSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  type: z.enum(["FABRICATION", "INSTALLATION", "BOTH"]).default("BOTH"),
  siteAddress: z.string().optional(),
  siteCity: z.string().optional(),
  startDate: z.string().optional(),
  expectedEndDate: z.string().optional(),
  specifications: z.string().optional(),
  materials: z.any().optional(),
  estimatedBudget: z.number().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assignedToId: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/projects - List projects
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filters
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { projectNumber: { contains: search, mode: "insensitive" } },
        { client: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.cRMProject.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              clientNumber: true,
              fullName: true,
            },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
          _count: {
            select: { documents: true, tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.cRMProject.count({ where }),
    ]);

    return apiSuccess({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "Projects GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/projects - Create project
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createProjectSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if client exists
    const client = await prisma.cRMClient.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    // Generate project number with new B2B format (PRJ260001, etc.)
    const projectNumber = await generateB2BNumber("PROJECT");

    // Create project
    const project = await prisma.cRMProject.create({
      data: {
        projectNumber,
        clientId: data.clientId,
        name: data.name,
        description: data.description,
        type: data.type,
        siteAddress: data.siteAddress,
        siteCity: data.siteCity,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : undefined,
        specifications: data.specifications,
        materials: data.materials,
        estimatedBudget: data.estimatedBudget,
        priority: data.priority,
        assignedToId: data.assignedToId || undefined,
        status: "STUDY",
      },
      include: {
        client: {
          select: {
            id: true,
            clientNumber: true,
            fullName: true,
          },
        },
      },
    });

    // Create default checklist items
    const defaultChecklist = [
      "Portes alignées correctement",
      "Charnières fonctionnent",
      "Coulisses tiroirs OK",
      "Finitions propres",
      "Pas de rayures",
      "Quincaillerie complète",
      "Nettoyage effectué",
    ];

    await prisma.projectChecklist.createMany({
      data: defaultChecklist.map((item, index) => ({
        projectId: project.id,
        item,
        order: index,
      })),
    });

    return apiSuccess(project, 201);
  } catch (error) {
    return handleApiError(error, "Projects POST");
  }
}
