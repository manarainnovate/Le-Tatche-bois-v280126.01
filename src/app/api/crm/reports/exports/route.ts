import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";
import { formatMAD } from "@/lib/crm/vat-calculations";

// ═══════════════════════════════════════════════════════════
// P1: Accounting Exports
// ═══════════════════════════════════════════════════════════
// Export Types:
// 1. Sales Ledger (Journal des ventes)
// 2. Payments Ledger (Journal des encaissements)
// 3. Client Balances (Balance clients)
// 4. VAT Summary (Déclaration TVA)
// ═══════════════════════════════════════════════════════════

const exportSchema = z.object({
  type: z.enum(["sales_ledger", "payments_ledger", "client_balances", "vat_summary"]),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  format: z.enum(["json", "csv"]).optional().default("json"),
  clientId: z.string().optional(),
  documentType: z.enum(["FACTURE", "FACTURE_ACOMPTE", "AVOIR"]).optional(),
});

// ═══════════════════════════════════════════════════════════
// POST /api/crm/reports/exports - Generate accounting export
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = exportSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const { type, dateFrom, dateTo, format, clientId, documentType } = validation.data;
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    let exportData;
    let filename: string;

    switch (type) {
      case "sales_ledger":
        exportData = await generateSalesLedger(startDate, endDate, clientId, documentType);
        filename = `journal_ventes_${formatDateForFilename(startDate)}_${formatDateForFilename(endDate)}`;
        break;

      case "payments_ledger":
        exportData = await generatePaymentsLedger(startDate, endDate, clientId);
        filename = `journal_encaissements_${formatDateForFilename(startDate)}_${formatDateForFilename(endDate)}`;
        break;

      case "client_balances":
        exportData = await generateClientBalances(endDate, clientId);
        filename = `balance_clients_${formatDateForFilename(endDate)}`;
        break;

      case "vat_summary":
        exportData = await generateVATSummary(startDate, endDate);
        filename = `declaration_tva_${formatDateForFilename(startDate)}_${formatDateForFilename(endDate)}`;
        break;

      default:
        return apiError("Type d'export non supporté", 400);
    }

    // Log the export
    await prisma.accountingExport.create({
      data: {
        exportType: type,
        period: `${startDate.toISOString().slice(0, 7)} to ${endDate.toISOString().slice(0, 7)}`,
        dateFrom: startDate,
        dateTo: endDate,
        filename,
        format,
        recordCount: Array.isArray(exportData.records) ? exportData.records.length : 1,
        filters: { clientId, documentType },
      },
    });

    // Return based on format
    if (format === "csv") {
      const csv = convertToCSV(exportData.records, exportData.columns);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    }

    return apiSuccess({
      export: {
        type,
        period: {
          from: startDate,
          to: endDate,
        },
        filename,
        recordCount: Array.isArray(exportData.records) ? exportData.records.length : 1,
      },
      ...exportData,
    });
  } catch (error) {
    return handleApiError(error, "Accounting Export POST");
  }
}

// ═══════════════════════════════════════════════════════════
// 1. Sales Ledger (Journal des ventes)
// ═══════════════════════════════════════════════════════════

async function generateSalesLedger(
  startDate: Date,
  endDate: Date,
  clientId?: string,
  documentType?: string
) {
  const where: Record<string, unknown> = {
    type: { in: ["FACTURE", "FACTURE_ACOMPTE", "AVOIR"] },
    date: {
      gte: startDate,
      lte: endDate,
    },
    isDraft: false, // Only issued documents
  };

  if (clientId) {
    where.clientId = clientId;
  }
  if (documentType) {
    where.type = documentType;
  }

  const documents = await prisma.cRMDocument.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          clientNumber: true,
          fullName: true,
          ice: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const records = documents.map((doc) => {
    const tvaDetails = doc.tvaDetails as { rate: number; base: number; amount: number }[] || [];

    // For AVOIR, amounts should be negative
    const multiplier = doc.type === "AVOIR" ? -1 : 1;

    return {
      date: doc.date.toISOString().slice(0, 10),
      documentNumber: doc.number,
      documentType: doc.type,
      clientNumber: doc.client?.clientNumber || "",
      clientName: doc.clientName,
      clientICE: doc.clientIce || "",
      totalHT: Number(doc.netHT) * multiplier,
      // VAT breakdown
      tva0: tvaDetails.find((t) => t.rate === 0)?.amount || 0,
      tva7: tvaDetails.find((t) => t.rate === 7)?.amount || 0,
      tva10: tvaDetails.find((t) => t.rate === 10)?.amount || 0,
      tva14: tvaDetails.find((t) => t.rate === 14)?.amount || 0,
      tva20: tvaDetails.find((t) => t.rate === 20)?.amount || 0,
      totalTVA: Number(doc.totalTVA) * multiplier,
      totalTTC: Number(doc.totalTTC) * multiplier,
      paymentStatus: doc.status,
      paidAmount: Number(doc.paidAmount) * multiplier,
      balance: Number(doc.balance) * multiplier,
    };
  });

  // Calculate totals
  const totals = {
    totalHT: records.reduce((sum, r) => sum + r.totalHT, 0),
    tva0: records.reduce((sum, r) => sum + r.tva0, 0),
    tva7: records.reduce((sum, r) => sum + r.tva7, 0),
    tva10: records.reduce((sum, r) => sum + r.tva10, 0),
    tva14: records.reduce((sum, r) => sum + r.tva14, 0),
    tva20: records.reduce((sum, r) => sum + r.tva20, 0),
    totalTVA: records.reduce((sum, r) => sum + r.totalTVA, 0),
    totalTTC: records.reduce((sum, r) => sum + r.totalTTC, 0),
    totalPaid: records.reduce((sum, r) => sum + r.paidAmount, 0),
    totalBalance: records.reduce((sum, r) => sum + r.balance, 0),
  };

  const columns = [
    "date",
    "documentNumber",
    "documentType",
    "clientNumber",
    "clientName",
    "clientICE",
    "totalHT",
    "tva0",
    "tva7",
    "tva10",
    "tva14",
    "tva20",
    "totalTVA",
    "totalTTC",
    "paymentStatus",
    "paidAmount",
    "balance",
  ];

  return { records, totals, columns };
}

// ═══════════════════════════════════════════════════════════
// 2. Payments Ledger (Journal des encaissements)
// ═══════════════════════════════════════════════════════════

async function generatePaymentsLedger(
  startDate: Date,
  endDate: Date,
  clientId?: string
) {
  const where: Record<string, unknown> = {
    date: {
      gte: startDate,
      lte: endDate,
    },
    status: "COMPLETED",
  };

  if (clientId) {
    where.clientId = clientId;
  }

  const payments = await prisma.cRMPayment.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          clientNumber: true,
          fullName: true,
        },
      },
      document: {
        select: {
          number: true,
          type: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const records = payments.map((payment) => ({
    date: payment.date.toISOString().slice(0, 10),
    paymentNumber: payment.paymentNumber,
    clientNumber: payment.client?.clientNumber || "",
    clientName: payment.client?.fullName || "",
    documentNumber: payment.document?.number || "",
    documentType: payment.document?.type || "",
    amount: Number(payment.amount),
    method: payment.method,
    reference: payment.reference || "",
    bankName: payment.bankName || "",
    checkNumber: payment.checkNumber || "",
    checkDate: payment.checkDate?.toISOString().slice(0, 10) || "",
  }));

  // Group by payment method
  const byMethod: Record<string, number> = {};
  for (const payment of records) {
    byMethod[payment.method] = (byMethod[payment.method] || 0) + payment.amount;
  }

  const totals = {
    totalAmount: records.reduce((sum, r) => sum + r.amount, 0),
    byMethod,
  };

  const columns = [
    "date",
    "paymentNumber",
    "clientNumber",
    "clientName",
    "documentNumber",
    "documentType",
    "amount",
    "method",
    "reference",
    "bankName",
    "checkNumber",
    "checkDate",
  ];

  return { records, totals, columns };
}

// ═══════════════════════════════════════════════════════════
// 3. Client Balances (Balance clients)
// ═══════════════════════════════════════════════════════════

async function generateClientBalances(asOfDate: Date, clientId?: string) {
  const where: Record<string, unknown> = {};
  if (clientId) {
    where.id = clientId;
  }

  const clients = await prisma.cRMClient.findMany({
    where,
    select: {
      id: true,
      clientNumber: true,
      fullName: true,
      ice: true,
      phone: true,
      email: true,
      documents: {
        where: {
          type: { in: ["FACTURE", "FACTURE_ACOMPTE", "AVOIR"] },
          date: { lte: asOfDate },
          isDraft: false,
        },
        select: {
          type: true,
          totalTTC: true,
          paidAmount: true,
          balance: true,
          status: true,
          dueDate: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const records = clients
    .map((client) => {
      let totalInvoiced = 0;
      let totalPaid = 0;
      let totalCredits = 0;
      let overdueCount = 0;
      let overdueAmount = 0;

      for (const doc of client.documents) {
        if (doc.type === "AVOIR") {
          totalCredits += Number(doc.totalTTC);
        } else {
          totalInvoiced += Number(doc.totalTTC);
          totalPaid += Number(doc.paidAmount);

          // Check if overdue
          if (doc.status === "OVERDUE" || (doc.dueDate && doc.dueDate < asOfDate && Number(doc.balance) > 0)) {
            overdueCount++;
            overdueAmount += Number(doc.balance);
          }
        }
      }

      const balance = totalInvoiced - totalPaid - totalCredits;

      return {
        clientNumber: client.clientNumber,
        clientName: client.fullName,
        clientICE: client.ice || "",
        phone: client.phone,
        email: client.email || "",
        totalInvoiced,
        totalCredits,
        totalPaid,
        balance,
        overdueCount,
        overdueAmount,
        invoiceCount: client.documents.filter((d) => d.type !== "AVOIR").length,
        creditCount: client.documents.filter((d) => d.type === "AVOIR").length,
      };
    })
    .filter((c) => c.balance !== 0 || c.totalInvoiced > 0); // Only show clients with activity

  const totals = {
    totalInvoiced: records.reduce((sum, r) => sum + r.totalInvoiced, 0),
    totalCredits: records.reduce((sum, r) => sum + r.totalCredits, 0),
    totalPaid: records.reduce((sum, r) => sum + r.totalPaid, 0),
    totalBalance: records.reduce((sum, r) => sum + r.balance, 0),
    totalOverdue: records.reduce((sum, r) => sum + r.overdueAmount, 0),
    clientCount: records.length,
    clientsWithBalance: records.filter((r) => r.balance > 0).length,
    clientsWithOverdue: records.filter((r) => r.overdueAmount > 0).length,
  };

  const columns = [
    "clientNumber",
    "clientName",
    "clientICE",
    "phone",
    "email",
    "totalInvoiced",
    "totalCredits",
    "totalPaid",
    "balance",
    "overdueCount",
    "overdueAmount",
    "invoiceCount",
    "creditCount",
  ];

  return { records, totals, columns };
}

// ═══════════════════════════════════════════════════════════
// 4. VAT Summary (Déclaration TVA)
// ═══════════════════════════════════════════════════════════

async function generateVATSummary(startDate: Date, endDate: Date) {
  // Get all issued invoices and credit notes
  const documents = await prisma.cRMDocument.findMany({
    where: {
      type: { in: ["FACTURE", "FACTURE_ACOMPTE", "AVOIR"] },
      date: {
        gte: startDate,
        lte: endDate,
      },
      isDraft: false,
    },
    select: {
      type: true,
      number: true,
      date: true,
      netHT: true,
      totalTVA: true,
      totalTTC: true,
      tvaDetails: true,
    },
  });

  // Aggregate VAT by rate
  const vatByRate = new Map<number, { base: number; amount: number; count: number }>();

  for (const doc of documents) {
    const tvaDetails = doc.tvaDetails as { rate: number; base: number; amount: number }[] || [];
    const multiplier = doc.type === "AVOIR" ? -1 : 1;

    for (const detail of tvaDetails) {
      const existing = vatByRate.get(detail.rate) || { base: 0, amount: 0, count: 0 };
      vatByRate.set(detail.rate, {
        base: existing.base + detail.base * multiplier,
        amount: existing.amount + detail.amount * multiplier,
        count: existing.count + 1,
      });
    }
  }

  // Build breakdown
  const breakdown = [0, 7, 10, 14, 20].map((rate) => {
    const data = vatByRate.get(rate) || { base: 0, amount: 0, count: 0 };
    return {
      rate,
      rateLabel: rate === 0 ? "Exonéré" : `${rate}%`,
      baseHT: Math.round(data.base * 100) / 100,
      vatAmount: Math.round(data.amount * 100) / 100,
      transactionCount: data.count,
    };
  });

  // Calculate totals
  const invoices = documents.filter((d) => d.type !== "AVOIR");
  const credits = documents.filter((d) => d.type === "AVOIR");

  const totals = {
    period: {
      from: startDate.toISOString().slice(0, 10),
      to: endDate.toISOString().slice(0, 10),
    },
    invoiceCount: invoices.length,
    creditCount: credits.length,
    grossSalesHT: invoices.reduce((sum, d) => sum + Number(d.netHT), 0),
    creditsHT: credits.reduce((sum, d) => sum + Number(d.netHT), 0),
    netSalesHT: breakdown.reduce((sum, b) => sum + b.baseHT, 0),
    grossVAT: invoices.reduce((sum, d) => sum + Number(d.totalTVA), 0),
    creditsVAT: credits.reduce((sum, d) => sum + Number(d.totalTVA), 0),
    netVATCollected: breakdown.reduce((sum, b) => sum + b.vatAmount, 0),
    totalTTC: breakdown.reduce((sum, b) => sum + b.baseHT + b.vatAmount, 0),
  };

  const columns = [
    "rate",
    "rateLabel",
    "baseHT",
    "vatAmount",
    "transactionCount",
  ];

  return { records: breakdown, totals, columns };
}

// ═══════════════════════════════════════════════════════════
// Helper: Convert to CSV
// ═══════════════════════════════════════════════════════════

function convertToCSV(records: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(";");
  const rows = records.map((record) =>
    columns
      .map((col) => {
        const value = record[col];
        if (value === null || value === undefined) return "";
        if (typeof value === "number") return value.toString().replace(".", ",");
        if (typeof value === "string" && value.includes(";")) return `"${value}"`;
        return String(value);
      })
      .join(";")
  );
  return [header, ...rows].join("\n");
}

// ═══════════════════════════════════════════════════════════
// Helper: Format date for filename
// ═══════════════════════════════════════════════════════════

function formatDateForFilename(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

// ═══════════════════════════════════════════════════════════
// GET /api/crm/reports/exports - List recent exports
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const exports = await prisma.accountingExport.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return apiSuccess({
      exports: exports.map((e) => ({
        id: e.id,
        type: e.exportType,
        period: e.period,
        dateFrom: e.dateFrom,
        dateTo: e.dateTo,
        filename: e.filename,
        format: e.format,
        recordCount: e.recordCount,
        createdAt: e.createdAt,
      })),
      availableTypes: [
        { value: "sales_ledger", label: "Journal des ventes" },
        { value: "payments_ledger", label: "Journal des encaissements" },
        { value: "client_balances", label: "Balance clients" },
        { value: "vat_summary", label: "Déclaration TVA" },
      ],
    });
  } catch (error) {
    return handleApiError(error, "Accounting Exports GET");
  }
}
