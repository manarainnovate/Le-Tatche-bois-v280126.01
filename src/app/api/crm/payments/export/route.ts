import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// GET /api/crm/payments/export - Export payments to CSV
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filters
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const method = searchParams.get("method") || "";
    const clientId = searchParams.get("clientId") || "";

    // Build where clause
    const where: any = {};

    if (method) {
      where.method = method;
    }

    if (clientId) {
      where.document = { clientId };
    }

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    // Get payments
    const payments = await prisma.cRMPayment.findMany({
      where,
      include: {
        document: {
          select: {
            number: true,
            clientName: true,
            totalTTC: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Generate CSV
    const headers = [
      "Date",
      "Client",
      "Facture",
      "Montant",
      "Mode de paiement",
      "Référence",
      "Notes",
    ];

    const methodLabels: Record<string, string> = {
      CASH: "Espèces",
      CHECK: "Chèque",
      BANK_TRANSFER: "Virement bancaire",
      CARD: "Carte bancaire",
      OTHER: "Autre",
    };

    const rows = payments.map((payment) => [
      new Intl.DateTimeFormat("fr-FR").format(new Date(payment.date)),
      payment.document?.clientName || "",
      payment.document?.number || "",
      Number(payment.amount).toFixed(2),
      methodLabels[payment.method] || payment.method,
      payment.reference || "",
      payment.notes || "",
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      ),
    ].join("\n");

    // Add BOM for Excel UTF-8 compatibility
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="paiements-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting payments:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'export des paiements" },
      { status: 500 }
    );
  }
}
