import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// GET /api/crm/reports/sales - Sales report
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy") || "month"; // day, week, month
    const clientId = searchParams.get("clientId");

    // Default to current year
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Build where clause
    const where: any = {
      type: "FACTURE",
      date: { gte: start, lte: end },
      status: { not: "DRAFT" },
    };

    if (clientId) {
      where.clientId = clientId;
    }

    // Get invoices
    const invoices = await prisma.cRMDocument.findMany({
      where,
      select: {
        id: true,
        number: true,
        date: true,
        clientId: true,
        clientName: true,
        totalHT: true,
        totalTVA: true,
        totalTTC: true,
        paidAmount: true,
        balance: true,
        status: true,
      },
      orderBy: { date: "asc" },
    });

    // Group data
    const grouped: Record<
      string,
      {
        period: string;
        invoicesCount: number;
        totalHT: number;
        totalTVA: number;
        totalTTC: number;
        paidAmount: number;
        balance: number;
      }
    > = {};

    invoices.forEach((inv) => {
      const date = new Date(inv.date);
      let key: string;

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `S${Math.ceil(
            (date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7
          )} - ${date.toLocaleDateString("fr-FR", { month: "short" })}`;
          break;
        default: // month
          key = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      }

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          invoicesCount: 0,
          totalHT: 0,
          totalTVA: 0,
          totalTTC: 0,
          paidAmount: 0,
          balance: 0,
        };
      }

      grouped[key].invoicesCount++;
      grouped[key].totalHT += Number(inv.totalHT);
      grouped[key].totalTVA += Number(inv.totalTVA);
      grouped[key].totalTTC += Number(inv.totalTTC);
      grouped[key].paidAmount += Number(inv.paidAmount);
      grouped[key].balance += Number(inv.balance);
    });

    // Sales by client
    const byClient = await prisma.cRMDocument.groupBy({
      by: ["clientId", "clientName"],
      where,
      _sum: { totalTTC: true, paidAmount: true },
      _count: true,
      orderBy: { _sum: { totalTTC: "desc" } },
      take: 10,
    });

    // Sales by product/service (from document items)
    const itemsStats = await prisma.cRMDocumentItem.groupBy({
      by: ["catalogItemId"],
      where: {
        document: where,
      },
      _sum: { totalTTC: true, quantity: true },
      _count: true,
    });

    // Get catalog item names
    const itemIds = itemsStats.map((i) => i.catalogItemId).filter(Boolean) as string[];
    const catalogItems = await prisma.catalogItem.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, sku: true },
    });
    const itemMap = new Map(catalogItems.map((i) => [i.id, i]));

    const byProduct = itemsStats
      .map((item) => ({
        productId: item.catalogItemId,
        productName: item.catalogItemId
          ? itemMap.get(item.catalogItemId)?.name || "Produit inconnu"
          : "Article manuel",
        sku: item.catalogItemId ? itemMap.get(item.catalogItemId)?.sku : null,
        total: Number(item._sum.totalTTC || 0),
        quantity: Number(item._sum.quantity || 0),
        count: item._count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Summary stats
    const totals = invoices.reduce(
      (acc, inv) => ({
        count: acc.count + 1,
        totalHT: acc.totalHT + Number(inv.totalHT),
        totalTVA: acc.totalTVA + Number(inv.totalTVA),
        totalTTC: acc.totalTTC + Number(inv.totalTTC),
        paidAmount: acc.paidAmount + Number(inv.paidAmount),
        balance: acc.balance + Number(inv.balance),
      }),
      { count: 0, totalHT: 0, totalTVA: 0, totalTTC: 0, paidAmount: 0, balance: 0 }
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: totals,
        byPeriod: Object.values(grouped),
        byClient: byClient.map((c) => ({
          clientId: c.clientId,
          clientName: c.clientName,
          invoicesCount: c._count,
          totalTTC: Number(c._sum.totalTTC || 0),
          paidAmount: Number(c._sum.paidAmount || 0),
        })),
        byProduct,
        filters: {
          startDate: start,
          endDate: end,
          groupBy,
          clientId,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la génération du rapport" },
      { status: 500 }
    );
  }
}
