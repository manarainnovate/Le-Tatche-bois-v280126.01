import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const PaymentMethodEnum = z.enum(["CASH", "CHECK", "BANK_TRANSFER", "CARD", "OTHER"]);

const UpdatePaymentSchema = z.object({
  amount: z.number().positive("Le montant doit être positif").optional(),
  date: z.coerce.date().optional(),
  method: PaymentMethodEnum.optional(),
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/payments/[id] - Get single payment
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payment = await prisma.cRMPayment.findUnique({
      where: { id },
      include: {
        document: {
          select: {
            id: true,
            number: true,
            type: true,
            clientId: true,
            clientName: true,
            totalTTC: true,
            paidAmount: true,
            balance: true,
            client: {
              select: {
                id: true,
                fullName: true,
                clientNumber: true,
              },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Paiement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...payment,
        amount: Number(payment.amount),
        document: payment.document ? {
          ...payment.document,
          totalTTC: Number(payment.document.totalTTC),
          paidAmount: Number(payment.document.paidAmount),
          balance: Number(payment.document.balance),
        } : null,
      },
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du paiement" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/crm/payments/[id] - Update payment
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = UpdatePaymentSchema.parse(body);

    // Get current payment with document
    const currentPayment = await prisma.cRMPayment.findUnique({
      where: { id },
      include: {
        document: {
          select: {
            id: true,
            totalTTC: true,
            paidAmount: true,
            status: true,
          },
        },
      },
    });

    if (!currentPayment) {
      return NextResponse.json(
        { success: false, error: "Paiement non trouvé" },
        { status: 404 }
      );
    }

    if (!currentPayment.document) {
      return NextResponse.json(
        { success: false, error: "Document non associé au paiement" },
        { status: 400 }
      );
    }

    // If amount is being changed, validate and update document
    if (validated.amount !== undefined && validated.amount !== Number(currentPayment.amount)) {
      const amountDifference = validated.amount - Number(currentPayment.amount);
      const currentBalance =
        Number(currentPayment.document.totalTTC) - Number(currentPayment.document.paidAmount);

      if (amountDifference > currentBalance) {
        return NextResponse.json(
          {
            success: false,
            error: `Le nouveau montant dépasse le solde disponible`,
          },
          { status: 400 }
        );
      }

      // Update payment and document in transaction
      const doc = currentPayment.document!;
      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.cRMPayment.update({
          where: { id },
          data: validated,
        });

        // Calculate new totals
        const newPaidAmount = Number(doc.paidAmount) + amountDifference;
        const newBalance = Number(doc.totalTTC) - newPaidAmount;

        // Determine new status
        let newStatus = doc.status;
        if (newBalance <= 0) {
          newStatus = "PAID";
        } else if (newPaidAmount > 0) {
          newStatus = "PARTIAL";
        } else {
          newStatus = "SENT";
        }

        await tx.cRMDocument.update({
          where: { id: currentPayment.documentId! },
          data: {
            paidAmount: newPaidAmount,
            balance: newBalance,
            status: newStatus,
          },
        });

        return payment;
      });

      return NextResponse.json({
        success: true,
        data: {
          ...result,
          amount: Number(result.amount),
        },
      });
    }

    // Simple update without amount change
    const payment = await prisma.cRMPayment.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...payment,
        amount: Number(payment.amount),
      },
    });
  } catch (error) {
    console.error("Error updating payment:", error);

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
      { success: false, error: "Erreur lors de la mise à jour du paiement" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/payments/[id] - Delete payment
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the payment with document
    const payment = await prisma.cRMPayment.findUnique({
      where: { id },
      include: {
        document: {
          select: {
            id: true,
            totalTTC: true,
            paidAmount: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Paiement non trouvé" },
        { status: 404 }
      );
    }

    if (!payment.document) {
      return NextResponse.json(
        { success: false, error: "Document non associé au paiement" },
        { status: 400 }
      );
    }

    // Delete payment and update document in transaction
    const doc = payment.document;
    await prisma.$transaction(async (tx) => {
      await tx.cRMPayment.delete({
        where: { id },
      });

      // Calculate new totals
      const newPaidAmount = Number(doc.paidAmount) - Number(payment.amount);
      const newBalance = Number(doc.totalTTC) - newPaidAmount;

      // Determine new status
      let newStatus = doc.status;
      if (newBalance >= Number(doc.totalTTC)) {
        newStatus = "SENT";
      } else if (newPaidAmount > 0) {
        newStatus = "PARTIAL";
      }

      await tx.cRMDocument.update({
        where: { id: payment.documentId! },
        data: {
          paidAmount: newPaidAmount,
          balance: newBalance,
          status: newStatus,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Paiement supprimé avec succès",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du paiement" },
      { status: 500 }
    );
  }
}
