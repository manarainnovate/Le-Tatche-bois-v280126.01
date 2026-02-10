import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";

// ═══════════════════════════════════════════════════════════
// GET /api/crm/clients/[id]/documents - Get client documents
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Filters
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    // Check if client exists
    const client = await prisma.cRMClient.findUnique({
      where: { id },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    // Build where clause
    const where: Record<string, unknown> = { clientId: id };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const documents = await prisma.cRMDocument.findMany({
      where,
      include: {
        project: {
          select: { id: true, projectNumber: true, name: true },
        },
        _count: {
          select: { items: true, payments: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // Calculate totals
    const totals = documents.reduce(
      (acc, doc) => {
        acc.totalHT += Number(doc.totalHT);
        acc.totalTTC += Number(doc.totalTTC);
        acc.paidAmount += Number(doc.paidAmount);
        acc.balance += Number(doc.balance);
        return acc;
      },
      { totalHT: 0, totalTTC: 0, paidAmount: 0, balance: 0 }
    );

    return apiSuccess({
      documents,
      totals,
    });
  } catch (error) {
    return handleApiError(error, "Client Documents GET");
  }
}
