import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const updateClientSchema = z.object({
  clientType: z.enum(["INDIVIDUAL", "COMPANY"]).optional(),
  fullName: z.string().min(2).optional(),
  company: z.string().nullable().optional(),
  phone: z.string().min(8).optional(),
  phoneAlt: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  billingAddress: z.string().nullable().optional(),
  billingCity: z.string().nullable().optional(),
  billingPostalCode: z.string().nullable().optional(),
  billingCountry: z.string().optional(),
  deliveryAddress: z.string().nullable().optional(),
  deliveryCity: z.string().nullable().optional(),
  deliveryPostalCode: z.string().nullable().optional(),
  ice: z.string().nullable().optional(),
  taxId: z.string().nullable().optional(),
  rc: z.string().nullable().optional(),
  paymentTerms: z.string().optional(),
  defaultDiscount: z.number().min(0).max(100).nullable().optional(),
  creditLimit: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/clients/[id] - Get client with all relations
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.cRMClient.findUnique({
      where: { id },
      include: {
        leadOrigin: {
          select: { id: true, leadNumber: true, source: true },
        },
        projects: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            projectNumber: true,
            name: true,
            status: true,
            type: true,
            estimatedBudget: true,
            startDate: true,
            expectedEndDate: true,
            createdAt: true,
          },
        },
        documents: {
          orderBy: { date: "desc" },
          take: 20,
          select: {
            id: true,
            number: true,
            type: true,
            status: true,
            date: true,
            totalTTC: true,
            paidAmount: true,
            balance: true,
          },
        },
        payments: {
          orderBy: { date: "desc" },
          take: 20,
          select: {
            id: true,
            paymentNumber: true,
            date: true,
            amount: true,
            method: true,
            status: true,
            document: {
              select: { number: true, type: true },
            },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            projects: true,
            documents: true,
            payments: true,
          },
        },
      },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    return apiSuccess({ client });
  } catch (error) {
    return handleApiError(error, "Client GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/crm/clients/[id] - Update client
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateClientSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    // Check if client exists
    const existingClient = await prisma.cRMClient.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return apiError("Client non trouvé", 404);
    }

    const data = result.data;

    // Update client
    const client = await prisma.cRMClient.update({
      where: { id },
      data: {
        clientType: data.clientType ?? existingClient.clientType,
        fullName: data.fullName ?? existingClient.fullName,
        company: data.company !== undefined ? data.company : existingClient.company,
        phone: data.phone ?? existingClient.phone,
        phoneAlt: data.phoneAlt !== undefined ? data.phoneAlt : existingClient.phoneAlt,
        email: data.email !== undefined ? data.email : existingClient.email,
        billingAddress: data.billingAddress !== undefined ? data.billingAddress : existingClient.billingAddress,
        billingCity: data.billingCity !== undefined ? data.billingCity : existingClient.billingCity,
        billingPostalCode: data.billingPostalCode !== undefined ? data.billingPostalCode : existingClient.billingPostalCode,
        billingCountry: data.billingCountry ?? existingClient.billingCountry,
        deliveryAddress: data.deliveryAddress !== undefined ? data.deliveryAddress : existingClient.deliveryAddress,
        deliveryCity: data.deliveryCity !== undefined ? data.deliveryCity : existingClient.deliveryCity,
        deliveryPostalCode: data.deliveryPostalCode !== undefined ? data.deliveryPostalCode : existingClient.deliveryPostalCode,
        ice: data.ice !== undefined ? data.ice : existingClient.ice,
        taxId: data.taxId !== undefined ? data.taxId : existingClient.taxId,
        rc: data.rc !== undefined ? data.rc : existingClient.rc,
        paymentTerms: data.paymentTerms ?? existingClient.paymentTerms,
        defaultDiscount: data.defaultDiscount !== undefined ? data.defaultDiscount : existingClient.defaultDiscount,
        creditLimit: data.creditLimit !== undefined ? data.creditLimit : existingClient.creditLimit,
        notes: data.notes !== undefined ? data.notes : existingClient.notes,
        tags: data.tags ?? existingClient.tags,
      },
    });

    return apiSuccess({ client });
  } catch (error) {
    return handleApiError(error, "Client PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/clients/[id] - Delete client
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if client exists and has documents
    const client = await prisma.cRMClient.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
            projects: true,
          },
        },
      },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    // Don't delete if has documents
    if (client._count.documents > 0) {
      return apiError(
        "Ce client a des documents et ne peut pas être supprimé. Veuillez d'abord supprimer ou archiver les documents.",
        400
      );
    }

    // Don't delete if has projects
    if (client._count.projects > 0) {
      return apiError(
        "Ce client a des projets et ne peut pas être supprimé. Veuillez d'abord supprimer ou archiver les projets.",
        400
      );
    }

    // Delete client (activities and attachments will cascade)
    await prisma.cRMClient.delete({
      where: { id },
    });

    return apiSuccess({ message: "Client supprimé avec succès" });
  } catch (error) {
    return handleApiError(error, "Client DELETE");
  }
}
