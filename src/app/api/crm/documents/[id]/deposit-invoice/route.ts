import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";
import { generateB2BNumber } from "@/lib/crm/generate-document-number";
import { createAuditLog } from "@/lib/crm/audit";

// ═══════════════════════════════════════════════════════════
// P0-1: Acompte (Deposit) Invoice Creation
// ═══════════════════════════════════════════════════════════
// Flow: DEVIS → FACTURE_ACOMPTE (deposit invoice)
// Later: FACTURE_ACOMPTE is deducted from final FACTURE
// ═══════════════════════════════════════════════════════════

const depositInvoiceSchema = z.object({
  depositPercent: z.number().min(1).max(100).optional(),
  depositAmount: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.depositPercent !== undefined || data.depositAmount !== undefined,
  { message: "Either depositPercent or depositAmount is required" }
);

// ═══════════════════════════════════════════════════════════
// POST /api/crm/documents/[id]/deposit-invoice
// Create a deposit invoice (FACTURE_ACOMPTE) from a DEVIS
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = depositInvoiceSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Get source devis
    const devis = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          orderBy: { order: "asc" },
        },
        depositInvoices: true, // Get existing deposit invoices
      },
    });

    if (!devis) {
      return apiError("Devis non trouvé", 404);
    }

    // Validate it's a DEVIS
    if (devis.type !== "DEVIS") {
      return apiError("La facture d'acompte ne peut être créée qu'à partir d'un devis", 400);
    }

    // Validate devis status (must be ACCEPTED)
    if (devis.status !== "ACCEPTED") {
      return apiError("Le devis doit être accepté pour créer une facture d'acompte", 400);
    }

    // Calculate total deposits already invoiced
    const existingDepositsTotal = devis.depositInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalTTC),
      0
    );

    // Calculate deposit amount
    const devisTTC = Number(devis.totalTTC);
    let depositAmount: number;

    if (data.depositAmount !== undefined) {
      depositAmount = data.depositAmount;
    } else if (data.depositPercent !== undefined) {
      depositAmount = (devisTTC * data.depositPercent) / 100;
    } else {
      // Default to devis deposit percent or 30%
      const defaultPercent = devis.depositPercent ? Number(devis.depositPercent) : 30;
      depositAmount = (devisTTC * defaultPercent) / 100;
    }

    // Round to 2 decimal places
    depositAmount = Math.round(depositAmount * 100) / 100;

    // Validate total deposits don't exceed devis total
    if (existingDepositsTotal + depositAmount > devisTTC) {
      const remaining = devisTTC - existingDepositsTotal;
      return apiError(
        `Le montant de l'acompte dépasse le solde restant. Maximum autorisé: ${remaining.toFixed(2)} DH`,
        400
      );
    }

    // Calculate VAT breakdown for deposit (proportional to devis VAT rates)
    const tvaDetails = devis.tvaDetails as { rate: number; base: number; amount: number }[] || [];
    const totalTVA = tvaDetails.reduce((sum, tva) => sum + tva.amount, 0);
    const depositRatio = depositAmount / devisTTC;

    // Calculate deposit HT and TVA
    const depositTVA = Math.round(totalTVA * depositRatio * 100) / 100;
    const depositHT = Math.round((depositAmount - depositTVA) * 100) / 100;

    // Calculate VAT breakdown for deposit invoice
    const depositTVADetails = tvaDetails.map((tva) => ({
      rate: tva.rate,
      base: Math.round(tva.base * depositRatio * 100) / 100,
      amount: Math.round(tva.amount * depositRatio * 100) / 100,
    }));

    // Generate deposit invoice number (FA prefix for Facture Acompte)
    const number = await generateB2BNumber("FACTURE_ACOMPTE");

    // Create deposit invoice
    const depositInvoice = await prisma.cRMDocument.create({
      data: {
        type: "FACTURE_ACOMPTE",
        number,
        clientId: devis.clientId,
        projectId: devis.projectId,
        linkedDevisId: devis.id, // Link to source devis
        isDepositInvoice: true,
        date: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        // Client snapshot
        clientName: devis.clientName,
        clientAddress: devis.clientAddress,
        clientCity: devis.clientCity,
        clientIce: devis.clientIce,
        clientPhone: devis.clientPhone,
        clientEmail: devis.clientEmail,
        // Reference
        devisRef: devis.number,
        // Totals
        totalHT: depositHT,
        discountAmount: 0,
        netHT: depositHT,
        tvaDetails: depositTVADetails,
        totalTVA: depositTVA,
        totalTTC: depositAmount,
        balance: depositAmount,
        // Deposit info
        depositPercent: data.depositPercent,
        depositAmount: depositAmount,
        // Notes
        publicNotes: data.notes || `Acompte de ${Math.round(depositRatio * 100)}% sur devis ${devis.number}`,
        footerText: `Acompte sur devis ${devis.number} - Montant total du devis: ${devisTTC.toFixed(2)} DH`,
        // Single line item for deposit
        items: {
          create: [{
            designation: `Acompte sur devis ${devis.number}`,
            description: `Acompte de ${Math.round(depositRatio * 100)}% sur le montant total TTC de ${devisTTC.toFixed(2)} DH`,
            quantity: 1,
            unit: "forfait",
            unitPriceHT: depositHT,
            discountPercent: 0,
            discountAmount: 0,
            tvaRate: totalTVA > 0 ? Math.round((depositTVA / depositHT) * 100 * 100) / 100 : 20,
            totalHT: depositHT,
            totalTVA: depositTVA,
            totalTTC: depositAmount,
            order: 0,
          }],
        },
      },
      include: {
        client: {
          select: { id: true, fullName: true, clientNumber: true },
        },
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      action: "create",
      entity: "CRMDocument",
      entityId: depositInvoice.id,
      description: `Facture d'acompte créée depuis devis ${devis.number}`,
      documentNumber: depositInvoice.number,
      documentType: "FACTURE_ACOMPTE",
      documentAmount: depositAmount,
      category: "financial",
    });

    return apiSuccess(
      {
        ...depositInvoice,
        totalHT: Number(depositInvoice.totalHT),
        netHT: Number(depositInvoice.netHT),
        totalTVA: Number(depositInvoice.totalTVA),
        totalTTC: Number(depositInvoice.totalTTC),
        depositAmount: Number(depositInvoice.depositAmount),
        sourceDevis: {
          id: devis.id,
          number: devis.number,
          totalTTC: devisTTC,
          existingDeposits: existingDepositsTotal,
          remainingBalance: devisTTC - existingDepositsTotal - depositAmount,
        },
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Deposit Invoice POST");
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/crm/documents/[id]/deposit-invoice
// Get deposit invoices for a devis or deposit info for an invoice
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get document with deposit relationships
    const document = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        depositInvoices: {
          include: {
            payments: true,
          },
          orderBy: { createdAt: "asc" },
        },
        linkedDevis: {
          select: {
            id: true,
            number: true,
            totalTTC: true,
            status: true,
          },
        },
        depositInvoice: {
          select: {
            id: true,
            number: true,
            totalTTC: true,
            paidAmount: true,
            status: true,
          },
        },
      },
    });

    if (!document) {
      return apiError("Document non trouvé", 404);
    }

    // Calculate deposit summary based on document type
    let depositSummary;

    if (document.type === "DEVIS") {
      // For DEVIS: show all deposit invoices and remaining balance
      const totalDepositsInvoiced = document.depositInvoices.reduce(
        (sum, inv) => sum + Number(inv.totalTTC),
        0
      );
      const totalDepositsPaid = document.depositInvoices.reduce(
        (sum, inv) => sum + Number(inv.paidAmount),
        0
      );
      const devisTTC = Number(document.totalTTC);

      depositSummary = {
        devisId: document.id,
        devisNumber: document.number,
        devisTotalTTC: devisTTC,
        depositInvoices: document.depositInvoices.map((inv) => ({
          id: inv.id,
          number: inv.number,
          amount: Number(inv.totalTTC),
          paidAmount: Number(inv.paidAmount),
          balance: Number(inv.balance),
          status: inv.status,
          date: inv.date,
          paymentsCount: inv.payments.length,
        })),
        totalDepositsInvoiced,
        totalDepositsPaid,
        remainingToInvoice: devisTTC - totalDepositsInvoiced,
        remainingToPay: totalDepositsInvoiced - totalDepositsPaid,
        percentInvoiced: Math.round((totalDepositsInvoiced / devisTTC) * 100),
        percentPaid: Math.round((totalDepositsPaid / devisTTC) * 100),
      };
    } else if (document.type === "FACTURE_ACOMPTE") {
      // For deposit invoice: show link to source devis
      depositSummary = {
        depositInvoiceId: document.id,
        depositInvoiceNumber: document.number,
        amount: Number(document.totalTTC),
        paidAmount: Number(document.paidAmount),
        balance: Number(document.balance),
        status: document.status,
        sourceDevis: document.linkedDevis
          ? {
              id: document.linkedDevis.id,
              number: document.linkedDevis.number,
              totalTTC: Number(document.linkedDevis.totalTTC),
              status: document.linkedDevis.status,
            }
          : null,
      };
    } else if (document.type === "FACTURE") {
      // For final invoice: show applied deposits
      depositSummary = {
        invoiceId: document.id,
        invoiceNumber: document.number,
        invoiceTotalTTC: Number(document.totalTTC),
        appliedDeposit: document.depositInvoice
          ? {
              id: document.depositInvoice.id,
              number: document.depositInvoice.number,
              amount: Number(document.depositInvoice.totalTTC),
              paidAmount: Number(document.depositInvoice.paidAmount),
              status: document.depositInvoice.status,
            }
          : null,
        totalDepositsApplied: Number(document.totalDepositsApplied),
        netToPay: Number(document.totalTTC) - Number(document.totalDepositsApplied),
      };
    } else {
      return apiError("Ce type de document ne gère pas les acomptes", 400);
    }

    return apiSuccess(depositSummary);
  } catch (error) {
    return handleApiError(error, "Deposit Invoice GET");
  }
}
