/**
 * LE TATCHE BOIS - PV de Réception (Reception Certificate) PDF Generator
 *
 * Generates professional reception certificate PDFs
 * Follows the same pattern as facture.ts with corrected Y-axis coordinates
 */

import PDFDoc from 'pdfkit';
import {
  drawWoodBackground,
  drawCenterWatermark,
  drawBorderFrame,
  drawHeader,
  drawClientBox,
  drawFooter,
  COLORS,
  PAGE,
  MARGINS,
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
 * État de réception (reception state)
 */
export type EtatReception = 'Conforme' | 'Réserves' | 'Non conforme';

/**
 * PV de réception item
 */
export interface PVReceptionItem {
  designation: string;
  description?: string;
  quantity: number;
  etat: EtatReception;
}

/**
 * Client information for PV de réception (Maître d'ouvrage)
 */
export interface PVReceptionClient {
  fullName: string;
  address?: string;
  city?: string;
  ice?: string;
}

/**
 * Complete PV de réception data structure
 */
export interface PVReceptionData {
  document: {
    id: string;
    number: string;
    date: Date | string;
    refBL?: string;
    refFacture?: string;
    status: string;
    items: PVReceptionItem[];
    client: PVReceptionClient;
    reserves?: string;
    notes?: string;
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

/** Unit conversion constant: 1mm = 2.834645669 points */
const MM = 2.834645669;

/**
 * Draw reference fields (Date, Réf. BL, Réf. Facture) on left side
 */
function drawReferenceFields(
  doc: PDFDocument,
  header: HeaderResult,
  date: Date | string,
  refBL?: string,
  refFacture?: string
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

  // Réf. BL
  const blRef = refBL || '____________________';
  doc.text(`Réf. BL :  ${blRef}`, header.leftX, fy);
  fy += LINE_H;

  // Réf. Facture
  const factureRef = refFacture || '____________________';
  doc.text(`Réf. Facture :  ${factureRef}`, header.leftX, fy);

  doc.restore();

  return fy;  // Return bottom Y position (largest value = lowest point)
}

/**
 * Draw reception state table (N°, Désignation, Qté, État)
 */
function drawReceptionTable(
  doc: PDFDocument,
  startY: number,
  items: PVReceptionItem[]
): number {
  const margin = 20 * MM;
  const tableWidth = PAGE.WIDTH - 2 * margin;

  // Column widths
  const colNo = 12 * MM;
  const colDesignation = 90 * MM;
  const colQty = 20 * MM;
  const colEtat = tableWidth - colNo - colDesignation - colQty;

  let y = startY;

  // ── Draw table header ──
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .strokeColor(COLORS.GOLD)
     .lineWidth(1.0);

  // Header background (light gold)
  doc.rect(margin, y, tableWidth, 8 * MM)
     .fillAndStroke(COLORS.GOLD_LIGHT, COLORS.GOLD);

  // Header text
  const headerY = y + 3 * MM;
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(8.5);

  let xPos = margin + 2;
  doc.text('N°', xPos, headerY, { width: colNo, align: 'center' });
  xPos += colNo;
  doc.text('Désignation', xPos, headerY, { width: colDesignation, align: 'left' });
  xPos += colDesignation;
  doc.text('Qté', xPos, headerY, { width: colQty, align: 'center' });
  xPos += colQty;
  doc.text('État', xPos, headerY, { width: colEtat, align: 'center' });

  doc.restore();

  y += 8 * MM;  // Move below header

  // ── Draw table rows ──
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .strokeColor(COLORS.GOLD)
     .lineWidth(0.5)
     .font('Helvetica')
     .fontSize(8);

  items.forEach((item, index) => {
    const rowHeight = 6 * MM;

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

    // État (colored based on state)
    doc.save();
    if (item.etat === 'Conforme') {
      doc.fillColor('#27ae60');  // Green
    } else if (item.etat === 'Non conforme') {
      doc.fillColor('#c0392b');  // Red
    } else {
      doc.fillColor('#f39c12');  // Orange for Réserves
    }
    doc.text(item.etat, xPos, textY, { width: colEtat, align: 'center' });
    doc.restore();

    y += rowHeight;
  });

  doc.restore();

  return y;  // Return Y position after table
}

/**
 * Draw reserves text area
 */
function drawReservesSection(
  doc: PDFDocument,
  startY: number,
  reserves?: string
): number {
  const margin = 25 * MM;
  const boxWidth = PAGE.WIDTH - 2 * margin;
  const boxHeight = 20 * MM;
  const y = startY;

  // Draw box
  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(1.0)
     .rect(margin, y, boxWidth, boxHeight)
     .stroke();
  doc.restore();

  // Title
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Réserves :', margin + 3, y + 3);
  doc.restore();

  // Content
  if (reserves) {
    doc.save();
    doc.fillColor(COLORS.GRAY_DARK)
       .font('Helvetica')
       .fontSize(8.5)
       .text(reserves, margin + 3, y + 8, {
         width: boxWidth - 6,
         align: 'left',
       });
    doc.restore();
  }

  return y + boxHeight;
}

/**
 * Draw dual signature section (Pour l'entreprise + Pour le maître d'ouvrage)
 */
function drawDualSignatureSection(doc: PDFDocument, startY: number): void {
  const margin = 25 * MM;
  const sectionWidth = (PAGE.WIDTH - 2 * margin) / 2;
  const y = startY;

  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(9);

  // Left signature: Pour l'entreprise
  doc.text('Pour l\'entreprise', margin, y, {
    width: sectionWidth - 5 * MM,
    align: 'center',
  });

  // Right signature: Pour le maître d'ouvrage
  doc.text('Pour le maître d\'ouvrage', margin + sectionWidth, y, {
    width: sectionWidth - 5 * MM,
    align: 'center',
  });

  // Signature lines
  const lineY = y + 25 * MM;
  const lineWidth = sectionWidth - 10 * MM;

  doc.strokeColor(COLORS.GRAY)
     .lineWidth(0.5);

  // Left signature line
  doc.moveTo(margin + 5 * MM, lineY)
     .lineTo(margin + 5 * MM + lineWidth, lineY)
     .stroke();

  // Right signature line
  doc.moveTo(margin + sectionWidth + 5 * MM, lineY)
     .lineTo(margin + sectionWidth + 5 * MM + lineWidth, lineY)
     .stroke();

  doc.restore();
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Generate a professional PV de réception (reception certificate) PDF
 *
 * @param data - Complete PV de réception data structure
 * @returns Promise<Buffer> containing the generated PDF
 *
 * @example
 * const pdf = await generatePVReceptionPDF({
 *   document: {
 *     number: 'PVR-2026/0001',
 *     date: new Date(),
 *     items: [...],
 *     client: {...}
 *   }
 * });
 */
export async function generatePVReceptionPDF(data: PVReceptionData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
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

      // ── Draw header with document info ──
      const header = drawHeader(
        doc,
        'PV DE RÉCEPTION',
        data.document.number,
        '' // No date in header - it's in left fields
      );

      // ── Draw reference fields on left ──
      const leftBottom = drawReferenceFields(
        doc,
        header,
        data.document.date,
        data.document.refBL,
        data.document.refFacture
      );

      // ── Draw client box on right (labeled "Maître d'ouvrage") ──
      const clientInfo: ClientInfo = {
        name: data.document.client.fullName,
        address: data.document.client.address || '',
        city: data.document.client.city || '',
        ice: data.document.client.ice,
      };

      const clientBottom = drawClientBox(doc, header.titleY + 3, clientInfo);

      // ── Draw reception state table ──
      // Table starts below whichever is lower: left fields or client box
      // FIXED: In PDFKit, larger Y = lower on page, so use Math.max
      const tableY = Math.max(leftBottom, clientBottom) + 4 * MM;

      const afterTableY = drawReceptionTable(doc, tableY, data.document.items);

      // ── Sequential Y flow (FIXED: always descend) ──
      let currentY = afterTableY + 5 * MM;

      // Reserves section
      const reservesBottom = drawReservesSection(doc, currentY, data.document.reserves);
      currentY = reservesBottom + 8 * MM;

      // Dual signature section
      drawDualSignatureSection(doc, currentY);

      // ── Draw footer ──
      drawFooter(doc);

      // ── Draw border frame (must be last) ──
      drawBorderFrame(doc);

      // ── Finalize PDF ──
      doc.end();

    } catch (error) {
      console.error('Error generating PV de réception PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────────────────────────────────────

export default generatePVReceptionPDF;
