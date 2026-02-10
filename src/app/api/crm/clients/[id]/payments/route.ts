import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";
import { generateNumber } from "@/lib/crm/generate-number";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createPaymentSchema = z.object({
  documentId: z.string().min(1, "Document requis"),
  amount: z.number().positive("Montant doit être positif"),
  method: z.enum(["CASH", "BANK_TRANSFER", "CHECK", "CARD", "MOBILE", "OTHER"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/clients/[id]/payments - Get client payments
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Filters
    const method = searchParams.get("method");
    const documentId = searchParams.get("documentId");

    // Check if client exists
    const client = await prisma.cRMClient.findUnique({
      where: { id },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    // Build where clause - payments through documents
    const where: Record<string, unknown> = {
      document: {
        clientId: id,
      },
    };

    if (method) {
      where.method = method;
    }

    if (documentId) {
      where.documentId = documentId;
    }

    const payments = await prisma.cRMPayment.findMany({
      where,
      include: {
        document: {
          select: {
            id: true,
            number: true,
            type: true,
            totalTTC: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Calculate totals by method
    const totalsByMethod = payments.reduce(
      (acc, payment) => {
        const method = payment.method;
        acc[method] = (acc[method] || 0) + Number(payment.amount);
        acc.total += Number(payment.amount);
        return acc;
      },
      { total: 0 } as Record<string, number>
    );

    return apiSuccess({
      payments,
      totalsByMethod,
    });
  } catch (error) {
    return handleApiError(error, "Client Payments GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/clients/[id]/payments - Create payment
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = createPaymentSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if client exists
    const client = await prisma.cRMClient.findUnique({
      where: { id },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    // Check if document exists and belongs to client
    const document = await prisma.cRMDocument.findFirst({
      where: {
        id: data.documentId,
        clientId: id,
      },
    });

    if (!document) {
      return apiError("Document non trouvé ou n'appartient pas à ce client", 404);
    }

    // Check if payment amount doesn't exceed balance
    const currentBalance = Number(document.balance);
    if (data.amount > currentBalance) {
      return apiError(
        `Le montant (${data.amount}) dépasse le solde restant (${currentBalance})`,
        400
      );
    }

    // Generate payment number
    const paymentNumber = await generateNumber("PAYMENT");

    // Create payment and update document in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.cRMPayment.create({
        data: {
          paymentNumber,
          clientId: id,
          documentId: data.documentId,
          amount: data.amount,
          method: data.method,
          reference: data.reference,
          notes: data.notes,
          date: data.date ? new Date(data.date) : new Date(),
          status: "COMPLETED",
        },
        include: {
          document: {
            select: {
              id: true,
              number: true,
              type: true,
            },
          },
        },
      });

      // Update document paid amount and balance
      const newPaidAmount = Number(document.paidAmount) + data.amount;
      const newBalance = Number(document.totalTTC) - newPaidAmount;

      await tx.cRMDocument.update({
        where: { id: data.documentId },
        data: {
          paidAmount: newPaidAmount,
          balance: newBalance,
          status: newBalance <= 0 ? "PAID" : document.status,
        },
      });

      // Update client total paid and balance
      await tx.cRMClient.update({
        where: { id },
        data: {
          totalPaid: { increment: data.amount },
          balance: { decrement: data.amount },
        },
      });

      // Create activity
      await tx.activity.create({
        data: {
          clientId: id,
          type: "NOTE",
          title: `Paiement reçu: ${paymentNumber}`,
          description: `Paiement de ${data.amount} MAD par ${data.method} pour ${document.number}`,
        },
      });

      return payment;
    });

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error, "Client Payments POST");
  }
}
