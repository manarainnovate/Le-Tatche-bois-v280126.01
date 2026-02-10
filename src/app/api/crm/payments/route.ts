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
  documentId: z.string().min(1, "Document ID requis"),
  amount: z.number().positive("Le montant doit être positif"),
  date: z.coerce.date(),
  method: PaymentMethodEnum,
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/payments - List all payments
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filters
    const search = searchParams.get("search") || "";
    const method = searchParams.get("method") || "";
    const clientId = searchParams.get("clientId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { document: { number: { contains: search, mode: "insensitive" } } },
        { document: { clientName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (method) {
      where.method = method;
    }

    if (clientId) {
      where.document = { ...where.document, clientId };
    }

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    // Get payments
    const [payments, total] = await Promise.all([
      prisma.cRMPayment.findMany({
        where,
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
            },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.cRMPayment.count({ where }),
    ]);

    // Calculate stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

    const [monthStats, quarterStats] = await Promise.all([
      prisma.cRMPayment.aggregate({
        where: { date: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.cRMPayment.aggregate({
        where: { date: { gte: startOfQuarter } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const transformedPayments = payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
      document: payment.document ? {
        ...payment.document,
        totalTTC: Number(payment.document.totalTTC),
        paidAmount: Number(payment.document.paidAmount),
        balance: Number(payment.document.balance),
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: transformedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        monthTotal: Number(monthStats._sum.amount || 0),
        monthCount: monthStats._count,
        quarterTotal: Number(quarterStats._sum.amount || 0),
        quarterCount: quarterStats._count,
        averagePayment:
          quarterStats._count > 0
            ? Number(quarterStats._sum.amount || 0) / quarterStats._count
            : 0,
      },
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
// POST /api/crm/payments - Create payment
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const validated = CreatePaymentSchema.parse(body);

    // Get the document
    const document = await prisma.cRMDocument.findUnique({
      where: { id: validated.documentId },
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
          documentId: validated.documentId,
          amount: validated.amount,
          date: validated.date,
          method: validated.method,
          reference: validated.reference || null,
          notes: validated.notes || null,
          createdById: session?.user?.id || null,
        },
        include: {
          document: {
            select: {
              id: true,
              number: true,
              clientName: true,
            },
          },
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
        where: { id: validated.documentId },
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
