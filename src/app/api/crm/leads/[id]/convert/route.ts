import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, withAuth } from "@/lib/api-helpers";
import { generateNumber } from "@/lib/crm/generate-number";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const convertLeadSchema = z.object({
  createProject: z.boolean().default(false),
  projectName: z.string().optional(),
  projectType: z.enum(["FABRICATION", "INSTALLATION", "BOTH"]).optional(),
  projectBudget: z.number().optional(),
});

// ═══════════════════════════════════════════════════════════
// POST /api/crm/leads/[id]/convert - Convert lead to client
// ═══════════════════════════════════════════════════════════

export const POST = withAuth(
  async (request: NextRequest, context, user) => {
    try {
      const { id } = await (context.params as Promise<{ id: string }>);
      const body = await request.json();
      const result = convertLeadSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      // Get lead
      const lead = await prisma.lead.findUnique({
        where: { id },
      });

      if (!lead) {
        return apiError("Lead non trouvé", 404);
      }

      // Check if already converted
      if (lead.convertedToClientId) {
        return apiError("Ce lead a déjà été converti en client", 400);
      }

      const data = result.data;
      const userId = user?.id;

      // Generate client number
      const clientNumber = await generateNumber("CLIENT");

      // Create client from lead data
      const client = await prisma.cRMClient.create({
        data: {
          clientNumber,
          clientType: lead.clientType,
          fullName: lead.fullName,
          company: lead.company,
          phone: lead.phone,
          phoneAlt: lead.phoneAlt,
          email: lead.email,
          billingAddress: lead.address,
          billingCity: lead.city,
          billingCountry: "Maroc",
          ice: lead.ice,
          notes: lead.notes,
        },
      });

      // Update lead with conversion info
      await prisma.lead.update({
        where: { id },
        data: {
          status: "WON",
          convertedToClientId: client.id,
          convertedAt: new Date(),
        },
      });

      // Create activity for conversion
      await prisma.activity.create({
        data: {
          type: "NOTE",
          description: `Lead converti en client: ${clientNumber}`,
          leadId: id,
          clientId: client.id,
          createdById: userId || null,
        },
      });

      // Create project if requested
      let project = null;
      if (data.createProject) {
        const projectNumber = await generateNumber("PROJECT");
        const projectName = data.projectName || `${lead.need || "Projet"} - ${lead.fullName}`;

        project = await prisma.cRMProject.create({
          data: {
            projectNumber,
            clientId: client.id,
            name: projectName,
            description: lead.need,
            type: data.projectType || "BOTH",
            status: "STUDY",
            siteAddress: lead.address,
            siteCity: lead.city,
            estimatedBudget: data.projectBudget || lead.budgetMax,
            assignedToId: lead.assignedToId,
          },
        });

        // Create activity for project creation
        await prisma.activity.create({
          data: {
            type: "NOTE",
            description: `Projet créé: ${projectNumber}`,
            clientId: client.id,
            projectId: project.id,
            createdById: userId || null,
          },
        });
      }

      return apiSuccess({
        client,
        project,
        message: "Lead converti avec succès",
      });
    } catch (error) {
      return handleApiError(error, "Lead Convert POST");
    }
  },
  ["ADMIN", "MANAGER", "COMMERCIAL"]
);
