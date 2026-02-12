import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

// ═══════════════════════════════════════════════════════════
// POST - Export documents to Excel or PDF
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const { ids, format, type: docType } = await request.json();

    // Build where clause
    const where: any = {};
    if (ids && Array.isArray(ids) && ids.length > 0) {
      where.id = { in: ids };
    }
    if (docType) {
      where.type = docType;
    }

    // Fetch documents with ALL details
    const documents = await prisma.cRMDocument.findMany({
      where,
      include: {
        client: true,
        items: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'excel') {
      return await generateExcel(documents, docType || 'FACTURE');
    } else {
      return NextResponse.json({ error: 'Format PDF non implémenté' }, { status: 501 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: "Erreur d'export" }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════
// Generate Excel Export
// ═══════════════════════════════════════════════════════════

async function generateExcel(documents: any[], docType: string) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LE TATCHE BOIS';
  workbook.created = new Date();

  // Header styling
  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF8B4513' },
  };
  const headerFont: Partial<ExcelJS.Font> = {
    bold: true,
    color: { argb: 'FFFFFFFF' },
    size: 11,
  };

  // ═══════════════════════════════════════════════════════════
  // SHEET 1: Summary
  // ═══════════════════════════════════════════════════════════
  const summarySheet = workbook.addWorksheet('Récapitulatif', {
    properties: { defaultRowHeight: 22 },
  });

  summarySheet.columns = [
    { header: 'N° Document', key: 'number', width: 28 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Échéance', key: 'dueDate', width: 14 },
    { header: 'Client', key: 'clientName', width: 25 },
    { header: 'ICE Client', key: 'clientICE', width: 18 },
    { header: 'Email Client', key: 'clientEmail', width: 25 },
    { header: 'Tél Client', key: 'clientPhone', width: 16 },
    { header: 'Nb Articles', key: 'itemCount', width: 12 },
    { header: 'Total HT', key: 'totalHT', width: 16 },
    { header: 'Remise', key: 'totalDiscount', width: 14 },
    { header: 'Net HT', key: 'netHT', width: 16 },
    { header: 'TVA 20%', key: 'tva20', width: 14 },
    { header: 'TVA 14%', key: 'tva14', width: 14 },
    { header: 'TVA 10%', key: 'tva10', width: 14 },
    { header: 'TVA 7%', key: 'tva7', width: 14 },
    { header: 'Total TVA', key: 'totalTVA', width: 14 },
    { header: 'Total TTC', key: 'totalTTC', width: 18 },
    { header: 'Payé', key: 'paidAmount', width: 14 },
    { header: 'Solde', key: 'balance', width: 14 },
    { header: 'Statut', key: 'status', width: 14 },
    { header: 'Créé le', key: 'createdAt', width: 18 },
  ];

  // Style header row
  const headerRow = summarySheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF5C2E00' } },
    };
  });
  headerRow.height = 30;

  // Add data rows
  let grandTotalHT = 0;
  let grandTotalTVA = 0;
  let grandTotalTTC = 0;
  let grandTotalPaid = 0;

  const statusLabels: Record<string, string> = {
    DRAFT: 'Brouillon',
    CONFIRMED: 'Confirmé',
    SENT: 'Envoyé',
    PAID: 'Payé',
    PARTIAL: 'Part. payé',
    CANCELLED: 'Annulé',
  };

  documents.forEach((doc, i) => {
    const items = doc.items || [];

    // Calculate totals from items
    let totalHT = 0;
    let totalDiscount = 0;
    const tvaBreakdown: Record<string, number> = {};

    items.forEach((item: any) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPriceHT) || 0;
      const discount = parseFloat(item.discountPercent) || 0;
      const tvaRate = parseFloat(item.tvaRate) || 0;

      const lineTotal = qty * price;
      const lineDiscount = lineTotal * (discount / 100);
      const lineNet = lineTotal - lineDiscount;
      const lineTVA = lineNet * (tvaRate / 100);

      totalHT += lineTotal;
      totalDiscount += lineDiscount;

      const rateKey = `${Math.round(tvaRate)}`;
      tvaBreakdown[rateKey] = (tvaBreakdown[rateKey] || 0) + lineTVA;
    });

    const netHT = totalHT - totalDiscount;
    const totalTVA = Object.values(tvaBreakdown).reduce((a, b) => a + b, 0);
    const totalTTC = netHT + totalTVA;
    const paidAmount = parseFloat(doc.paidAmount) || 0;

    grandTotalHT += netHT;
    grandTotalTVA += totalTVA;
    grandTotalTTC += totalTTC;
    grandTotalPaid += paidAmount;

    const row = summarySheet.addRow({
      number: doc.number,
      date: doc.date ? new Date(doc.date).toLocaleDateString('fr-FR') : '',
      dueDate: doc.dueDate ? new Date(doc.dueDate).toLocaleDateString('fr-FR') : '',
      clientName: doc.client?.fullName || '',
      clientICE: doc.client?.ice || '',
      clientEmail: doc.client?.email || '',
      clientPhone: doc.client?.phone || '',
      itemCount: items.length,
      totalHT: totalHT,
      totalDiscount: totalDiscount,
      netHT: netHT,
      tva20: tvaBreakdown['20'] || 0,
      tva14: tvaBreakdown['14'] || 0,
      tva10: tvaBreakdown['10'] || 0,
      tva7: tvaBreakdown['7'] || 0,
      totalTVA: totalTVA,
      totalTTC: totalTTC,
      paidAmount: paidAmount,
      balance: totalTTC - paidAmount,
      status: statusLabels[doc.status] || doc.status,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleString('fr-FR') : '',
    });

    // Alternate row colors
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF8F0' },
        };
      });
    }

    // Format currency cells
    [
      'totalHT',
      'totalDiscount',
      'netHT',
      'tva20',
      'tva14',
      'tva10',
      'tva7',
      'totalTVA',
      'totalTTC',
      'paidAmount',
      'balance',
    ].forEach((key) => {
      const col = summarySheet.columns.findIndex((c) => c.key === key) + 1;
      if (col > 0) {
        row.getCell(col).numFmt = '#,##0.00 "DH"';
      }
    });
  });

  // TOTALS ROW
  const totalsRow = summarySheet.addRow({
    number: '',
    clientName: `TOTAL (${documents.length} documents)`,
    netHT: grandTotalHT,
    totalTVA: grandTotalTVA,
    totalTTC: grandTotalTTC,
    paidAmount: grandTotalPaid,
    balance: grandTotalTTC - grandTotalPaid,
  });
  totalsRow.font = { bold: true, size: 12 };
  totalsRow.height = 28;
  totalsRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF3E0' },
    };
    cell.border = {
      top: { style: 'double', color: { argb: 'FF8B4513' } },
    };
  });
  ['netHT', 'totalTVA', 'totalTTC', 'paidAmount', 'balance'].forEach((key) => {
    const col = summarySheet.columns.findIndex((c) => c.key === key) + 1;
    if (col > 0) totalsRow.getCell(col).numFmt = '#,##0.00 "DH"';
  });

  // ═══════════════════════════════════════════════════════════
  // SHEET 2: Detail (all line items)
  // ═══════════════════════════════════════════════════════════
  const detailSheet = workbook.addWorksheet('Détail Articles', {
    properties: { defaultRowHeight: 20 },
  });

  detailSheet.columns = [
    { header: 'N° Document', key: 'docNumber', width: 28 },
    { header: 'Client', key: 'clientName', width: 22 },
    { header: 'Date', key: 'docDate', width: 14 },
    { header: 'Réf. Article', key: 'ref', width: 16 },
    { header: 'Désignation', key: 'designation', width: 35 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Quantité', key: 'quantity', width: 10 },
    { header: 'Unité', key: 'unit', width: 8 },
    { header: 'P.U. HT', key: 'unitPrice', width: 14 },
    { header: 'Remise %', key: 'discount', width: 10 },
    { header: 'Taux TVA', key: 'tvaRate', width: 10 },
    { header: 'Total HT', key: 'totalHT', width: 14 },
    { header: 'TVA', key: 'tvaAmount', width: 12 },
    { header: 'Total TTC', key: 'totalTTC', width: 14 },
  ];

  // Style header
  const detailHeaderRow = detailSheet.getRow(1);
  detailHeaderRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  detailHeaderRow.height = 28;

  // Add all line items
  documents.forEach((doc) => {
    (doc.items || []).forEach((item: any) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPriceHT) || 0;
      const discount = parseFloat(item.discountPercent) || 0;
      const tvaRate = parseFloat(item.tvaRate) || 0;

      const lineTotal = qty * price * (1 - discount / 100);
      const lineTVA = lineTotal * (tvaRate / 100);

      const row = detailSheet.addRow({
        docNumber: doc.number,
        clientName: doc.client?.fullName || '',
        docDate: doc.date ? new Date(doc.date).toLocaleDateString('fr-FR') : '',
        ref: item.reference || '',
        designation: item.designation,
        description: item.description || '',
        quantity: qty,
        unit: item.unit || 'U',
        unitPrice: price,
        discount: discount,
        tvaRate: `${Math.round(tvaRate)}%`,
        totalHT: lineTotal,
        tvaAmount: lineTVA,
        totalTTC: lineTotal + lineTVA,
      });

      ['unitPrice', 'totalHT', 'tvaAmount', 'totalTTC'].forEach((key) => {
        const col = detailSheet.columns.findIndex((c) => c.key === key) + 1;
        if (col > 0) row.getCell(col).numFmt = '#,##0.00 "DH"';
      });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Generate buffer and return
  // ═══════════════════════════════════════════════════════════
  const buffer = await workbook.xlsx.writeBuffer();

  const docTypeLabels: Record<string, string> = {
    FACTURE: 'factures',
    DEVIS: 'devis',
    BON_COMMANDE: 'bons-commande',
    BON_LIVRAISON: 'bons-livraison',
    PV_RECEPTION: 'pv-reception',
    AVOIR: 'avoirs',
  };

  const filename = `${docTypeLabels[docType] || 'documents'}-export-${
    new Date().toISOString().split('T')[0]
  }.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
