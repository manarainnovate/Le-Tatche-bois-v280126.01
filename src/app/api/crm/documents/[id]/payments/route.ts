import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateNumber } from "@/lib/crm/generate-number";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const PaymentMethodEnum = z.enum(["CASH", "CHECK", "BANK_TRANSFER", "CARD", "OTHER"]);

const CreatePaymentSchema = z.object({
  amount: z.number().positive("Le montant doit être positif"),
  date: z.coerce.date(),
  method: PaymentMethodEnum,
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/documents/[id]/payments - List payments
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payments = await prisma.cRMPayment.findMany({
      where: { documentId: id },
      orderBy: { date: "desc" },
    });

    const transformedPayments = payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
    }));

    return NextResponse.json({
      success: true,
      data: transformedPayments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des paiements" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/documents/[id]/payments - Add payment
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const body = await request.json();
    const validated = CreatePaymentSchema.parse(body);

    // Get the document
    const document = await prisma.cRMDocument.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        totalTTC: true,
        paidAmount: true,
        balance: true,
        clientId: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document non trouvé" },
        { status: 404 }
      );
    }

    // Only invoices can have payments
    if (document.type !== "FACTURE") {
      return NextResponse.json(
        { success: false, error: "Seules les factures peuvent recevoir des paiements" },
        { status: 400 }
      );
    }

    // Check balance
    const currentBalance = Number(document.balance);
    if (validated.amount > currentBalance) {
      return NextResponse.json(
        {
          success: false,
          error: `Le montant (${validated.amount}) dépasse le solde restant (${currentBalance})`,
        },
        { status: 400 }
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
          clientId: document.clientId,
          documentId: id,
          amount: validated.amount,
          date: validated.date,
          method: validated.method,
          reference: validated.reference || null,
          notes: validated.notes || null,
          createdById: session?.user?.id || null,
        },
      });

      // Calculate new totals
      const newPaidAmount = Number(document.paidAmount) + validated.amount;
      const newBalance = Number(document.totalTTC) - newPaidAmount;

      // Determine new status
      let newStatus = document.status;
      if (newBalance <= 0) {
        newStatus = "PAID";
      } else if (newPaidAmount > 0) {
        newStatus = "PARTIAL";
      }

      // Update document
      await tx.cRMDocument.update({
        where: { id },
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
  } catch (error) {
    console.error("Error creating payment:", error);

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
      { success: false, error: "Erreur lors de l'enregistrement du paiement" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/documents/[id]/payments - Delete payment
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "ID du paiement requis" },
        { status: 400 }
      );
    }

    // Get the payment and document
    const payment = await prisma.cRMPayment.findUnique({
      where: { id: paymentId },
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

    if (payment.documentId !== documentId) {
      return NextResponse.json(
        { success: false, error: "Paiement non associé à ce document" },
        { status: 400 }
      );
    }

    if (!payment.document) {
      return NextResponse.json(
        { success: false, error: "Document non associé au paiement" },
        { status: 400 }
      );
    }

    // Delete payment and update document in transaction
    await prisma.$transaction(async (tx) => {
      // Delete payment
      await tx.cRMPayment.delete({
        where: { id: paymentId },
      });

      // Calculate new totals
      const newPaidAmount = Number(payment.document!.paidAmount) - Number(payment.amount);
      const newBalance = Number(payment.document!.totalTTC) - newPaidAmount;

      // Determine new status
      let newStatus = payment.document!.status;
      if (newBalance >= Number(payment.document!.totalTTC)) {
        newStatus = "SENT";
      } else if (newPaidAmount > 0) {
        newStatus = "PARTIAL";
      }

      // Update document
      await tx.cRMDocument.update({
        where: { id: documentId },
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
