/**
 * LE TATCHE BOIS - Bon de Livraison (Delivery Note) PDF Generator
 *
 * Generates professional delivery note PDFs WITHOUT PRICES
 * Follows the same pattern as facture.ts with corrected Y-axis coordinates
 */

import PDFDoc from 'pdfkit';
import * as fs from 'fs';
import {
  drawWoodBackground,
  drawCenterWatermark,
  drawBorderFrame,
  drawHeader,
  drawClientBox,
  drawSignatureSection,
  drawFooter,
  drawContinuationPageHeader,
  generateInvoiceQR,
  drawQRCode,
  COLORS,
  PAGE,
  MARGINS,
  ASSETS,
  HeaderResult,
  ClientInfo,
} from '../base-layout';
import { formatDate } from '../helpers/format-utils';

// Type alias for PDFDocument
type PDFDocument = PDFKit.PDFDocument;

// ────────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Bon de livraison item (NO PRICES)
 */
export interface BonLivraisonItem {
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  observations?: string;
}

/**
 * Client information for bon de livraison
 */
export interface BonLivraisonClient {
  fullName: string;
  address?: string;
  city?: string;
  ice?: string;
}

/**
 * Complete bon de livraison data structure
 */
export interface BonLivraisonData {
  document: {
    id: string;
    number: string;
    date: Date | string;
    refFacture?: string;
    refDevis?: string;
    status: string;
    items: BonLivraisonItem[];
    client: BonLivraisonClient;
    notes?: string;
    observations?: string;
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

/** Unit conversion constant: 1mm = 2.834645669 points */
const MM = 2.834645669;

/**
 * Draw reference fields (Date, Réf. Facture, Réf. Devis) on left side
 */
function drawReferenceFields(
  doc: PDFDocument,
  header: HeaderResult,
  date: Date | string,
  refFacture?: string,
  refDevis?: string
): number {
  const LINE_H = 16;
  let fy = header.fieldsY;

  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(9);

  // Date
  const dateStr = formatDate(date);
  doc.text(`Date :  ${dateStr}`, header.leftX, fy);
  fy += LINE_H;  // FIXED: PDFKit Y increases downward

  // Réf. Facture
  const factureRef = refFacture || '____________________';
  doc.text(`Réf. Facture :  ${factureRef}`, header.leftX, fy);
  fy += LINE_H;

  // Réf. Devis
  const devisRef = refDevis || '____________________';
  doc.text(`Réf. Devis :  ${devisRef}`, header.leftX, fy);

  doc.restore();

  return fy;  // Return bottom Y position (largest value = lowest point)
}

/**
 * Draw simple table WITHOUT PRICES (N°, Désignation, Qté, Unité, Observations)
 * This is a local function specific to bon de livraison
 */
function drawSimpleTable(
  doc: PDFDocument,
  startY: number,
  items: BonLivraisonItem[],
  pagination?: {
    docType: string;
    docNumber: string;
    maxItemsFirstPage: number;
    maxItemsContinuation: number;
  }
): number {
  const margin = 20 * MM;
  const tableWidth = PAGE.WIDTH - 2 * margin;

  // Column widths
  const colNo = 12 * MM;
  const colDesignation = 70 * MM;
  const colQty = 18 * MM;
  const colUnit = 18 * MM;
  const colObs = tableWidth - colNo - colDesignation - colQty - colUnit;

  const headerHeight = 8 * MM;
  const rowHeight = 6 * MM;

  // Check if pagination is needed
  const needsPagination = pagination && items.length > pagination.maxItemsFirstPage;

  if (!needsPagination) {
    // ══════════════════════════════════════════════════════════════
    // SINGLE PAGE MODE (existing logic - unchanged)
    // ══════════════════════════════════════════════════════════════

    let y = startY;

    // ── Draw table header with wood texture ──
    doc.save();

    // Header background - use wood texture image
    if (fs.existsSync(ASSETS.woodHeader)) {
      doc.image(ASSETS.woodHeader, margin, y, {
        width: tableWidth,
        height: headerHeight,
      });
    } else {
      // Fallback: dark brown rectangle
      doc.rect(margin, y, tableWidth, headerHeight)
         .fillAndStroke('#3E2012', COLORS.GOLD);
    }

    // Header border (gold outline)
    doc.strokeColor(COLORS.GOLD)
       .lineWidth(1.0)
       .rect(margin, y, tableWidth, headerHeight)
       .stroke();

    // Header text - WHITE on dark wood background
    const headerY = y + 3 * MM;
    doc.fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .fontSize(8.5);

    let xPos = margin + 2;
    doc.text('N°', xPos, headerY, { width: colNo, align: 'center' });
    xPos += colNo;
    doc.text('Désignation', xPos, headerY, { width: colDesignation, align: 'left' });
    xPos += colDesignation;
    doc.text('Qté', xPos, headerY, { width: colQty, align: 'center' });
    xPos += colQty;
    doc.text('Unité', xPos, headerY, { width: colUnit, align: 'center' });
    xPos += colUnit;
    doc.text('Observations', xPos, headerY, { width: colObs, align: 'center' });

    doc.restore();

    y += headerHeight;  // Move below header

    // ── Draw table rows ──
    doc.save();
    doc.fillColor(COLORS.GRAY_DARK)
       .strokeColor(COLORS.GOLD)
       .lineWidth(0.5)
       .font('Helvetica')
       .fontSize(8);

    items.forEach((item, index) => {
      // Row border
      doc.rect(margin, y, tableWidth, rowHeight).stroke();

      // Row content
      const textY = y + 2 * MM;
      let xPos = margin + 2;

      // N°
      doc.text(String(index + 1), xPos, textY, { width: colNo, align: 'center' });
      xPos += colNo;

      // Désignation
      doc.text(item.designation, xPos, textY, { width: colDesignation - 4, align: 'left' });
      xPos += colDesignation;

      // Qté
      doc.text(String(item.quantity), xPos, textY, { width: colQty, align: 'center' });
      xPos += colQty;

      // Unité
      doc.text(item.unit || 'U', xPos, textY, { width: colUnit, align: 'center' });
      xPos += colUnit;

      // Observations
      doc.text(item.observations || '', xPos, textY, { width: colObs - 4, align: 'left' });

      y += rowHeight;
    });

    doc.restore();

    return y;  // Return Y position after table
  } else {
    // ══════════════════════════════════════════════════════════════
    // MULTI-PAGE MODE
    // ══════════════════════════════════════════════════════════════

    const { maxItemsFirstPage, maxItemsContinuation, docType, docNumber } = pagination;
    const totalPages = 1 + Math.ceil((items.length - maxItemsFirstPage) / maxItemsContinuation);

    let itemIndex = 0;
    let currentY = startY;

    // Helper function to draw table header
    const drawTableHeader = (headerY: number) => {
      doc.save();

      // Header background - use wood texture image
      if (fs.existsSync(ASSETS.woodHeader)) {
        doc.image(ASSETS.woodHeader, margin, headerY, {
          width: tableWidth,
          height: headerHeight,
        });
      } else {
        // Fallback: dark brown rectangle
        doc.rect(margin, headerY, tableWidth, headerHeight)
           .fillAndStroke('#3E2012', COLORS.GOLD);
      }

      // Header border (gold outline)
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(1.0)
         .rect(margin, headerY, tableWidth, headerHeight)
         .stroke();

      // Header text - WHITE on dark wood background
      const headerTextY = headerY + 3 * MM;
      doc.fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .fontSize(8.5);

      let xPos = margin + 2;
      doc.text('N°', xPos, headerTextY, { width: colNo, align: 'center' });
      xPos += colNo;
      doc.text('Désignation', xPos, headerTextY, { width: colDesignation, align: 'left' });
      xPos += colDesignation;
      doc.text('Qté', xPos, headerTextY, { width: colQty, align: 'center' });
      xPos += colQty;
      doc.text('Unité', xPos, headerTextY, { width: colUnit, align: 'center' });
      xPos += colUnit;
      doc.text('Observations', xPos, headerTextY, { width: colObs, align: 'center' });

      doc.restore();
    };

    // Helper function to draw rows
    const drawRows = (pageItems: BonLivraisonItem[], startRowNumber: number, rowsStartY: number) => {
      let rowY = rowsStartY;

      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .strokeColor(COLORS.GOLD)
         .lineWidth(0.5)
         .font('Helvetica')
         .fontSize(8);

      pageItems.forEach((item, index) => {
        // Row border
        doc.rect(margin, rowY, tableWidth, rowHeight).stroke();

        // Row content
        const textY = rowY + 2 * MM;
        let xPos = margin + 2;

        // N° - CONTINUOUS numbering across pages
        doc.text(String(startRowNumber + index), xPos, textY, { width: colNo, align: 'center' });
        xPos += colNo;

        // Désignation
        doc.text(item.designation, xPos, textY, { width: colDesignation - 4, align: 'left' });
        xPos += colDesignation;

        // Qté
        doc.text(String(item.quantity), xPos, textY, { width: colQty, align: 'center' });
        xPos += colQty;

        // Unité
        doc.text(item.unit || 'U', xPos, textY, { width: colUnit, align: 'center' });
        xPos += colUnit;

        // Observations
        doc.text(item.observations || '', xPos, textY, { width: colObs - 4, align: 'left' });

        rowY += rowHeight;
      });

      doc.restore();

      return rowY;
    };

    // Process each page
    for (let page = 0; page < totalPages; page++) {
      const isFirstPage = page === 0;
      const isLastPage = page === totalPages - 1;
      const itemsForThisPage = isFirstPage ? maxItemsFirstPage : maxItemsContinuation;
      const pageItems = items.slice(itemIndex, itemIndex + itemsForThisPage);

      if (!isFirstPage) {
        // Add new page for continuation
        doc.addPage({ size: 'A4', margin: 0 });
        drawWoodBackground(doc);
        drawCenterWatermark(doc, 0.06);

        // Draw continuation header
        const tableStartY = drawContinuationPageHeader(doc, docType, docNumber, {
          currentPage: page + 1,
          totalPages: totalPages,
        });

        currentY = tableStartY;
      }

      // Draw table header
      const tableHeaderY = currentY;
      drawTableHeader(tableHeaderY);
      currentY = tableHeaderY + headerHeight;

      // Draw rows
      const startRowNumber = itemIndex + 1;  // 1-indexed row numbers
      currentY = drawRows(pageItems, startRowNumber, currentY);

      // If not last page, draw footer and border
      if (!isLastPage) {
        drawFooter(doc);
        drawBorderFrame(doc);
      }

      itemIndex += itemsForThisPage;
    }

    return currentY;  // Return Y position after last table
  }
}

/**
 * Draw observations section
 */
function drawObservationsSection(
  doc: PDFDocument,
  startY: number,
  observations?: string
): number {
  if (!observations) {
    return startY;  // Skip if no observations
  }

  const margin = 25 * MM;
  const y = startY;

  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Observations :', margin, y);

  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8.5)
     .text(observations, margin, y + 5 * MM, {
       width: PAGE.WIDTH - 2 * margin,
       align: 'left',
     });

  doc.restore();

  // FIXED: PDFKit Y increases downward
  return y + 15 * MM;  // Return next Y position (below current element)
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Generate a professional bon de livraison (delivery note) PDF
 *
 * @param data - Complete bon de livraison data structure
 * @returns Promise<Buffer> containing the generated PDF
 *
 * @example
 * const pdf = await generateBonLivraisonPDF({
 *   document: {
 *     number: 'BL-2026/0001',
 *     date: new Date(),
 *     items: [...],
 *     client: {...}
 *   }
 * });
 */
export async function generateBonLivraisonPDF(data: BonLivraisonData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // ── Validate required fields ──
      if (!data.document) {
        throw new Error('Document data is required');
      }
      if (!data.document.client) {
        throw new Error('Client information is required');
      }
      if (!data.document.items || data.document.items.length === 0) {
        throw new Error('At least one item is required');
      }

      // ── Generate QR code (no amount for BL, just reference and contact info) ──
      const qrBuffer = await generateInvoiceQR(
        data.document.number,
        undefined,  // No amount for delivery notes
        data.document.client.fullName
      );

      // ── Create PDF document ──
      const doc = new PDFDoc({
        size: 'A4',
        margin: 0,
        bufferPages: true,
        autoFirstPage: true,
      });

      // Collect PDF data in buffer
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ── Draw base layout elements ──
      drawWoodBackground(doc);
      drawCenterWatermark(doc, 0.06);

      // ── Draw QR code at top-right corner ──
      drawQRCode(doc, qrBuffer);

      // ── Calculate pagination info ──
      const maxFirstPage = 18;  // More room since no prices
      const maxContinuation = 25;
      const totalItems = data.document.items.length;
      const totalPages = totalItems <= maxFirstPage
        ? 1
        : 1 + Math.ceil((totalItems - maxFirstPage) / maxContinuation);

      const pageInfo = totalPages > 1
        ? { currentPage: 1, totalPages }
        : undefined;

      // ── Draw header with document info ──
      const header = drawHeader(
        doc,
        'BON DE LIVRAISON',
        data.document.number,
        '', // No date in header - it's in left fields
        pageInfo
      );

      // ── Draw reference fields on left ──
      const leftBottom = drawReferenceFields(
        doc,
        header,
        data.document.date,
        data.document.refFacture,
        data.document.refDevis
      );

      // ── Draw client box on right (aligned with title) ──
      const clientInfo: ClientInfo = {
        name: data.document.client.fullName,
        address: data.document.client.address || '',
        city: data.document.client.city || '',
        ice: data.document.client.ice,
      };

      const clientBottom = drawClientBox(doc, header.titleY + 3, clientInfo);

      // ── Draw simple items table (NO PRICES) ──
      // Table starts below whichever is lower: left fields or client box
      // FIXED: In PDFKit, larger Y = lower on page, so use Math.max
      const tableY = Math.max(leftBottom, clientBottom) + 4 * MM;

      const afterTableY = drawSimpleTable(
        doc,
        tableY,
        data.document.items,
        totalPages > 1 ? {
          docType: 'BON DE LIVRAISON',
          docNumber: data.document.number,
          maxItemsFirstPage: maxFirstPage,
          maxItemsContinuation: maxContinuation,
        } : undefined
      );

      // ── Sequential Y flow (FIXED: always descend) ──
      let currentY = afterTableY + 5 * MM;

      // Observations section (if exists)
      if (data.document.observations) {
        currentY = drawObservationsSection(
          doc,
          currentY,
          data.document.observations
        );
        currentY += 3 * MM;
      }

      // Signature section
      drawSignatureSection(doc, currentY + 10 * MM);

      // ── Draw footer ──
      drawFooter(doc);

      // ── Draw border frame (must be last) ──
      drawBorderFrame(doc);

      // ── Finalize PDF ──
      doc.end();

    } catch (error) {
      console.error('Error generating bon de livraison PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────────────────────────────────────

export default generateBonLivraisonPDF;
