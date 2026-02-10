import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";
import { generateB2BNumber } from "@/lib/crm/generate-document-number";
import { createAuditLog } from "@/lib/crm/audit";

// ═══════════════════════════════════════════════════════════
// P0-1: Final Invoice Creation (with deposit deduction)
// ═══════════════════════════════════════════════════════════
// Flow: BC (or BL/PV) → FACTURE with deposits deducted
// ═══════════════════════════════════════════════════════════

const finalInvoiceSchema = z.object({
  applyDeposits: z.boolean().default(true), // Auto-apply all paid deposit invoices
  specificDepositIds: z.array(z.string()).optional(), // Specific deposits to apply
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// POST /api/crm/documents/[id]/final-invoice
// Create a final invoice from BC with deposit deduction
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = finalInvoiceSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Get source document (BC, BL, or PV)
    const source = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!source) {
      return apiError("Document non trouvé", 404);
    }

    // Validate source type
    const validSourceTypes = ["BON_COMMANDE", "BON_LIVRAISON", "PV_RECEPTION"];
    if (!validSourceTypes.includes(source.type)) {
      return apiError(
        `La facture finale ne peut être créée qu'à partir d'un BC, BL ou PV`,
        400
      );
    }

    // Validate source status
    const validStatuses: Record<string, string[]> = {
      BON_COMMANDE: ["CONFIRMED", "PARTIAL", "DELIVERED"],
      BON_LIVRAISON: ["DELIVERED"],
      PV_RECEPTION: ["SIGNED"],
    };

    if (!validStatuses[source.type]?.includes(source.status)) {
      return apiError(
        `Le document doit être ${validStatuses[source.type]?.join(" ou ")} pour créer une facture`,
        400
      );
    }

    // Find deposit invoices to apply
    let depositsToApply: { id: string; number: string; amount: number; paidAmount: number }[] = [];

    if (data.applyDeposits) {
      // Find all paid deposit invoices linked to the source devis
      // First, trace back to the original devis
      let devisId: string | null = null;

      if (source.devisRef) {
        // Find devis by reference number
        const devis = await prisma.cRMDocument.findFirst({
          where: { number: source.devisRef, type: "DEVIS" },
        });
        devisId = devis?.id || null;
      } else if (source.parentId) {
        // Trace back through parent chain to find original devis
        const parent = await prisma.cRMDocument.findUnique({
          where: { id: source.parentId },
        });
        if (parent?.type === "DEVIS") {
          devisId = parent.id;
        } else if (parent?.parentId) {
          // Check grandparent (BC -> Devis)
          const grandparent = await prisma.cRMDocument.findUnique({
            where: { id: parent.parentId },
          });
          if (grandparent?.type === "DEVIS") {
            devisId = grandparent.id;
          } else if (grandparent?.parentId) {
            // Check great-grandparent (PV -> BL -> BC -> Devis)
            const greatGrandparent = await prisma.cRMDocument.findUnique({
              where: { id: grandparent.parentId },
            });
            if (greatGrandparent?.type === "DEVIS") {
              devisId = greatGrandparent.id;
            }
          }
        }
      }

      if (devisId) {
        const paidDeposits = await prisma.cRMDocument.findMany({
          where: {
            linkedDevisId: devisId,
            type: "FACTURE_ACOMPTE",
            status: "PAID",
          },
          select: {
            id: true,
            number: true,
            totalTTC: true,
            paidAmount: true,
          },
        });

        depositsToApply = paidDeposits.map((d) => ({
          id: d.id,
          number: d.number,
          amount: Number(d.totalTTC),
          paidAmount: Number(d.paidAmount),
        }));
      }
    } else if (data.specificDepositIds && data.specificDepositIds.length > 0) {
      // Apply specific deposits
      const specificDeposits = await prisma.cRMDocument.findMany({
        where: {
          id: { in: data.specificDepositIds },
          type: "FACTURE_ACOMPTE",
          status: "PAID",
        },
        select: {
          id: true,
          number: true,
          totalTTC: true,
          paidAmount: true,
        },
      });

      depositsToApply = specificDeposits.map((d) => ({
        id: d.id,
        number: d.number,
        amount: Number(d.totalTTC),
        paidAmount: Number(d.paidAmount),
      }));
    }

    // Calculate totals from source items
    const lineResults = source.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPriceHT: Number(item.unitPriceHT),
      discountPercent: item.discountPercent ? Number(item.discountPercent) : 0,
      discountAmount: Number(item.discountAmount),
      tvaRate: Number(item.tvaRate),
      totalHT: Number(item.totalHT),
      totalTVA: Number(item.totalTVA),
      totalTTC: Number(item.totalTTC),
    }));

    const totalHT = lineResults.reduce((sum, item) => sum + item.totalHT, 0);
    const totalTVA = lineResults.reduce((sum, item) => sum + item.totalTVA, 0);
    const totalTTC = totalHT + totalTVA;

    // Calculate deposits to apply
    const totalDepositsApplied = depositsToApply.reduce(
      (sum, d) => sum + d.paidAmount,
      0
    );

    // Final balance after deposits
    const balance = Math.max(0, totalTTC - totalDepositsApplied);

    // Build deposit deduction line items (negative lines)
    const depositLineItems = depositsToApply.map((deposit, index) => ({
      designation: `Déduction acompte ${deposit.number}`,
      description: `Acompte déjà facturé et payé - Facture ${deposit.number}`,
      quantity: 1,
      unit: "forfait",
      unitPriceHT: -deposit.paidAmount / 1.2, // Approximate HT (assuming 20% VAT)
      discountPercent: 0,
      discountAmount: 0,
      tvaRate: 20,
      totalHT: Math.round((-deposit.paidAmount / 1.2) * 100) / 100,
      totalTVA: Math.round(((-deposit.paidAmount / 1.2) * 0.2) * 100) / 100,
      totalTTC: -deposit.paidAmount,
      order: lineResults.length + index,
    }));

    // Generate invoice number
    const number = await generateB2BNumber("FACTURE");

    // Build references
    const refs: Record<string, string | null> = {
      devisRef: source.devisRef || null,
      bcRef: source.type === "BON_COMMANDE" ? source.number : (source.bcRef || null),
      blRef: source.type === "BON_LIVRAISON" ? source.number : (source.blRef || null),
      pvRef: source.type === "PV_RECEPTION" ? source.number : null,
    };

    // Create final invoice
    const invoice = await prisma.cRMDocument.create({
      data: {
        type: "FACTURE",
        number,
        clientId: source.clientId,
        projectId: source.projectId,
        parentId: source.id,
        ...refs,
        date: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        // Client snapshot
        clientName: source.clientName,
        clientAddress: source.clientAddress,
        clientCity: source.clientCity,
        clientIce: source.clientIce,
        clientPhone: source.clientPhone,
        clientEmail: source.clientEmail,
        // Totals (before deposit deduction)
        totalHT: totalHT,
        discountType: source.discountType,
        discountValue: source.discountValue,
        discountAmount: Number(source.discountAmount),
        netHT: totalHT,
        tvaDetails: source.tvaDetails as object ?? [],
        totalTVA: totalTVA,
        totalTTC: totalTTC,
        // Deposit tracking (FIX 4: Store deposit deductions in DB)
        totalDepositsApplied: totalDepositsApplied,
        depositInvoiceId: depositsToApply.length === 1 ? depositsToApply[0].id : null,
        appliedDepositIds: depositsToApply.map((d) => d.id), // FIX 4: Store all applied deposit IDs
        amountDue: balance, // FIX 4: Store calculated amount due
        // Balance (what's left to pay after deposits)
        balance: balance,
        paidAmount: totalDepositsApplied, // Deposits count as paid
        // Terms & Notes
        deliveryTime: source.deliveryTime,
        includes: source.includes,
        excludes: source.excludes,
        conditions: source.conditions,
        paymentTerms: source.paymentTerms,
        publicNotes: data.notes,
        footerText: totalDepositsApplied > 0
          ? `Montant total TTC: ${totalTTC.toFixed(2)} DH\nAcomptes déduits: ${totalDepositsApplied.toFixed(2)} DH\nNet à payer: ${balance.toFixed(2)} DH`
          : undefined,
        // Items (original items + deposit deduction lines)
        items: {
          create: [
            ...lineResults.map((item, index) => ({
              catalogItemId: item.catalogItemId,
              reference: item.reference,
              designation: item.designation,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPriceHT: item.unitPriceHT,
              discountPercent: item.discountPercent,
              discountAmount: item.discountAmount,
              tvaRate: item.tvaRate,
              totalHT: item.totalHT,
              totalTVA: item.totalTVA,
              totalTTC: item.totalTTC,
              order: index,
            })),
            ...depositLineItems.map((item) => ({
              designation: item.designation,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPriceHT: item.unitPriceHT,
              discountPercent: item.discountPercent,
              discountAmount: item.discountAmount,
              tvaRate: item.tvaRate,
              totalHT: item.totalHT,
              totalTVA: item.totalTVA,
              totalTTC: item.totalTTC,
              order: item.order,
            })),
          ],
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

    // Update source document status
    await prisma.cRMDocument.update({
      where: { id: source.id },
      data: {
        status: source.type === "BON_COMMANDE" ? "DELIVERED" : source.status,
      },
    });

    // Create audit log
    await createAuditLog({
      action: "create",
      entity: "CRMDocument",
      entityId: invoice.id,
      description: `Facture finale créée depuis ${source.type} ${source.number}${
        totalDepositsApplied > 0
          ? ` avec déduction d'acomptes de ${totalDepositsApplied.toFixed(2)} DH`
          : ""
      }`,
      documentNumber: invoice.number,
      documentType: "FACTURE",
      documentAmount: balance,
      category: "financial",
    });

    return apiSuccess(
      {
        ...invoice,
        totalHT: Number(invoice.totalHT),
        netHT: Number(invoice.netHT),
        totalTVA: Number(invoice.totalTVA),
        totalTTC: Number(invoice.totalTTC),
        totalDepositsApplied: Number(invoice.totalDepositsApplied),
        appliedDepositIds: invoice.appliedDepositIds, // FIX 4
        amountDue: Number(invoice.amountDue), // FIX 4
        balance: Number(invoice.balance),
        paidAmount: Number(invoice.paidAmount),
        depositsApplied: depositsToApply,
        netToPay: balance,
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Final Invoice POST");
  }
}
