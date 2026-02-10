import { prisma } from "@/lib/prisma";
import { auditDepositDeduction, auditDepositInvoiceCreation } from "./audit";

// ═══════════════════════════════════════════════════════════
// FIX 4: Deposit Application Service
// ═══════════════════════════════════════════════════════════
//
// Handles:
// - Applying deposit invoices to final invoices
// - Calculating amountDue
// - Persisting deposit deductions in database
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface AppliedDeposit {
  id: string;
  number: string;
  totalTTC: number;
  paidAmount: number;
  appliedAmount: number;
}

export interface ApplyDepositsResult {
  success: boolean;
  finalInvoiceId: string;
  appliedDeposits: AppliedDeposit[];
  totalDepositsApplied: number;
  amountDue: number;
  newBalance: number;
}

// ═══════════════════════════════════════════════════════════
// Error Classes
// ═══════════════════════════════════════════════════════════

export class DepositServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "DepositServiceError";
  }
}

// ═══════════════════════════════════════════════════════════
// Apply Deposits to Final Invoice
// ═══════════════════════════════════════════════════════════

/**
 * Apply deposit invoices to a final invoice
 * This stores the deduction in the database (not just UI)
 */
export async function applyDepositsToInvoice(
  finalInvoiceId: string,
  depositInvoiceIds: string[],
  userId?: string
): Promise<ApplyDepositsResult> {
  // Fetch the final invoice
  const finalInvoice = await prisma.cRMDocument.findUnique({
    where: { id: finalInvoiceId },
    include: {
      linkedDevis: {
        include: {
          depositInvoices: {
            where: {
              status: { in: ["PAID", "PARTIAL"] },
            },
            select: {
              id: true,
              number: true,
              totalTTC: true,
              paidAmount: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!finalInvoice) {
    throw new DepositServiceError(
      `Facture ${finalInvoiceId} non trouvée`,
      "INVOICE_NOT_FOUND"
    );
  }

  if (finalInvoice.type !== "FACTURE") {
    throw new DepositServiceError(
      `Le document ${finalInvoice.number} n'est pas une facture finale`,
      "NOT_FINAL_INVOICE"
    );
  }

  // Verify all deposit invoice IDs are valid and paid
  const validDepositIds = new Set(
    finalInvoice.linkedDevis?.depositInvoices.map((d) => d.id) || []
  );

  const invalidIds = depositInvoiceIds.filter((id) => !validDepositIds.has(id));
  if (invalidIds.length > 0) {
    throw new DepositServiceError(
      `Factures d'acompte invalides ou non payées: ${invalidIds.join(", ")}`,
      "INVALID_DEPOSIT_IDS"
    );
  }

  // Calculate amounts to apply from each deposit
  const depositsToApply =
    finalInvoice.linkedDevis?.depositInvoices.filter((d) =>
      depositInvoiceIds.includes(d.id)
    ) || [];

  const appliedDeposits: AppliedDeposit[] = depositsToApply.map((deposit) => ({
    id: deposit.id,
    number: deposit.number,
    totalTTC: Number(deposit.totalTTC),
    paidAmount: Number(deposit.paidAmount),
    appliedAmount: Number(deposit.paidAmount), // Apply only what was actually paid
  }));

  const totalDepositsApplied = appliedDeposits.reduce(
    (sum, d) => sum + d.appliedAmount,
    0
  );

  const totalTTC = Number(finalInvoice.totalTTC);
  const paidAmount = Number(finalInvoice.paidAmount);
  const amountDue = Math.max(0, totalTTC - totalDepositsApplied - paidAmount);
  const newBalance = amountDue; // Balance is the amount still due

  // Update the final invoice with deposit deduction data
  await prisma.$transaction(async (tx) => {
    // Update the final invoice
    await tx.cRMDocument.update({
      where: { id: finalInvoiceId },
      data: {
        totalDepositsApplied,
        appliedDepositIds: depositInvoiceIds,
        amountDue,
        balance: newBalance,
      },
    });

    // Link each deposit invoice to this final invoice
    for (const depositId of depositInvoiceIds) {
      await tx.cRMDocument.update({
        where: { id: depositId },
        data: {
          depositInvoiceId: finalInvoiceId, // Link to final invoice
        },
      });
    }
  });

  // Audit the deposit deduction
  await auditDepositDeduction(
    finalInvoiceId,
    finalInvoice.number,
    appliedDeposits.map((d) => ({ number: d.number, amount: d.appliedAmount })),
    totalDepositsApplied,
    userId
  );

  return {
    success: true,
    finalInvoiceId,
    appliedDeposits,
    totalDepositsApplied,
    amountDue,
    newBalance,
  };
}

// ═══════════════════════════════════════════════════════════
// Calculate Amount Due for a Document
// ═══════════════════════════════════════════════════════════

/**
 * Recalculate amountDue for a document
 * amountDue = totalTTC - totalDepositsApplied - paidAmount
 */
export async function recalculateAmountDue(documentId: string): Promise<number> {
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    select: {
      totalTTC: true,
      totalDepositsApplied: true,
      paidAmount: true,
    },
  });

  if (!document) {
    throw new DepositServiceError(
      `Document ${documentId} non trouvé`,
      "DOCUMENT_NOT_FOUND"
    );
  }

  const totalTTC = Number(document.totalTTC);
  const totalDepositsApplied = Number(document.totalDepositsApplied);
  const paidAmount = Number(document.paidAmount);

  const amountDue = Math.max(0, totalTTC - totalDepositsApplied - paidAmount);

  // Update the document
  await prisma.cRMDocument.update({
    where: { id: documentId },
    data: { amountDue, balance: amountDue },
  });

  return amountDue;
}

// ═══════════════════════════════════════════════════════════
// Get Deposit Summary for a Devis
// ═══════════════════════════════════════════════════════════

/**
 * Get summary of deposits for a quote/devis
 */
export async function getDepositSummary(devisId: string): Promise<{
  devisId: string;
  devisNumber: string;
  totalTTC: number;
  depositInvoices: Array<{
    id: string;
    number: string;
    totalTTC: number;
    paidAmount: number;
    status: string;
    isApplied: boolean;
    appliedToInvoiceId: string | null;
  }>;
  totalDepositsIssued: number;
  totalDepositsPaid: number;
  remainingAfterDeposits: number;
}> {
  const devis = await prisma.cRMDocument.findUnique({
    where: { id: devisId },
    include: {
      depositInvoices: {
        select: {
          id: true,
          number: true,
          totalTTC: true,
          paidAmount: true,
          status: true,
          depositInvoiceId: true, // Link to final invoice if applied
        },
      },
    },
  });

  if (!devis) {
    throw new DepositServiceError(`Devis ${devisId} non trouvé`, "DEVIS_NOT_FOUND");
  }

  const totalTTC = Number(devis.totalTTC);
  const depositInvoices = devis.depositInvoices.map((d) => ({
    id: d.id,
    number: d.number,
    totalTTC: Number(d.totalTTC),
    paidAmount: Number(d.paidAmount),
    status: d.status,
    isApplied: !!d.depositInvoiceId,
    appliedToInvoiceId: d.depositInvoiceId,
  }));

  const totalDepositsIssued = depositInvoices.reduce((sum, d) => sum + d.totalTTC, 0);
  const totalDepositsPaid = depositInvoices.reduce((sum, d) => sum + d.paidAmount, 0);
  const remainingAfterDeposits = totalTTC - totalDepositsPaid;

  return {
    devisId,
    devisNumber: devis.number,
    totalTTC,
    depositInvoices,
    totalDepositsIssued,
    totalDepositsPaid,
    remainingAfterDeposits,
  };
}

// ═══════════════════════════════════════════════════════════
// Remove Deposit Application
// ═══════════════════════════════════════════════════════════

/**
 * Remove deposit application from a final invoice
 * (Only allowed if invoice is still in DRAFT status)
 */
export async function removeDepositApplication(
  finalInvoiceId: string,
  depositInvoiceId: string,
  userId?: string
): Promise<void> {
  const finalInvoice = await prisma.cRMDocument.findUnique({
    where: { id: finalInvoiceId },
    select: {
      id: true,
      number: true,
      status: true,
      isLocked: true,
      isDraft: true,
      appliedDepositIds: true,
      totalDepositsApplied: true,
      totalTTC: true,
      paidAmount: true,
    },
  });

  if (!finalInvoice) {
    throw new DepositServiceError(
      `Facture ${finalInvoiceId} non trouvée`,
      "INVOICE_NOT_FOUND"
    );
  }

  if (finalInvoice.isLocked || !finalInvoice.isDraft) {
    throw new DepositServiceError(
      `La facture ${finalInvoice.number} est verrouillée et ne peut pas être modifiée`,
      "INVOICE_LOCKED"
    );
  }

  // Find the deposit to remove
  const depositInvoice = await prisma.cRMDocument.findUnique({
    where: { id: depositInvoiceId },
    select: { id: true, number: true, paidAmount: true },
  });

  if (!depositInvoice) {
    throw new DepositServiceError(
      `Facture d'acompte ${depositInvoiceId} non trouvée`,
      "DEPOSIT_NOT_FOUND"
    );
  }

  if (!finalInvoice.appliedDepositIds.includes(depositInvoiceId)) {
    throw new DepositServiceError(
      `La facture d'acompte ${depositInvoice.number} n'est pas appliquée à cette facture`,
      "DEPOSIT_NOT_APPLIED"
    );
  }

  // Calculate new values
  const newAppliedIds = finalInvoice.appliedDepositIds.filter(
    (id) => id !== depositInvoiceId
  );
  const removedAmount = Number(depositInvoice.paidAmount);
  const newTotalDepositsApplied = Number(finalInvoice.totalDepositsApplied) - removedAmount;
  const newAmountDue = Math.max(
    0,
    Number(finalInvoice.totalTTC) - newTotalDepositsApplied - Number(finalInvoice.paidAmount)
  );

  // Update in transaction
  await prisma.$transaction(async (tx) => {
    // Update final invoice
    await tx.cRMDocument.update({
      where: { id: finalInvoiceId },
      data: {
        appliedDepositIds: newAppliedIds,
        totalDepositsApplied: newTotalDepositsApplied,
        amountDue: newAmountDue,
        balance: newAmountDue,
      },
    });

    // Unlink deposit invoice
    await tx.cRMDocument.update({
      where: { id: depositInvoiceId },
      data: {
        depositInvoiceId: null,
      },
    });
  });
}
