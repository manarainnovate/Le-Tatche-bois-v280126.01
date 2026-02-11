/**
 * LE TATCHE BOIS - Avoir (Credit Note) PDF Generator
 *
 * Generates professional credit note PDFs with negative amounts
 * Follows the same pattern as facture.ts with corrected Y-axis coordinates
 */

import PDFDoc from 'pdfkit';
import {
  drawWoodBackground,
  drawCenterWatermark,
  drawBorderFrame,
  drawHeader,
  drawClientBox,
  drawItemsTable,
  drawSignatureSection,
  drawFooter,
  COLORS,
  PAGE,
  MARGINS,
  HeaderResult,
  ClientInfo,
  TableItem,
} from '../base-layout';
import { amountInFrench } from '../helpers/french-numbers';
import { formatDate } from '../helpers/format-utils';

// Type alias for PDFDocument
type PDFDocument = PDFKit.PDFDocument;

// ────────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Avoir item with TVA calculation support
 */
export interface AvoirItem {
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent?: number;
  tvaRate: number;
}

/**
 * Client information for avoir
 */
export interface AvoirClient {
  fullName: string;
  address?: string;
  city?: string;
  ice?: string;
}

/**
 * Complete avoir data structure
 */
export interface AvoirData {
  document: {
    id: string;
    number: string;
    date: Date | string;
    refFactureOrigine?: string;
    motif?: string;
    status: string;
    items: AvoirItem[];
    client: AvoirClient;
    discountGlobal?: number;
    notes?: string;
    internalNotes?: string;
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

/** Unit conversion constant: 1mm = 2.834645669 points */
const MM = 2.834645669;

/**
 * Draw reference fields (Date, Réf. Facture d'origine, Motif) on left side
 */
function drawReferenceFields(
  doc: PDFDocument,
  header: HeaderResult,
  date: Date | string,
  refFactureOrigine?: string,
  motif?: string
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

  // Réf. Facture d'origine
  const factureRef = refFactureOrigine || '____________________';
  doc.text(`Réf. Facture d'origine :  ${factureRef}`, header.leftX, fy);
  fy += LINE_H;

  // Motif
  const motifText = motif || '____________________';
  doc.text(`Motif :  ${motifText}`, header.leftX, fy);

  doc.restore();

  return fy;  // Return bottom Y position (largest value = lowest point)
}

/**
 * Draw amount in words box with gold border
 *
 * Format: "*****Arrêté le présent avoir à la somme de : ******"
 *         "*** {amount in French} ***"
 */
function drawAmountInWordsBox(
  doc: PDFDocument,
  startY: number,
  totalTTC: number
): number {
  const margin = 20 * MM;
  const boxWidth = PAGE.WIDTH - 2 * margin;
  const boxHeight = 10 * MM;
  const boxY = startY;

  // Gold bordered box
  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(1.0)
     .rect(margin, boxY, boxWidth, boxHeight)
     .stroke();
  doc.restore();

  // Top line
  const line1Y = boxY + 3 * MM;
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(7.5)
     .text('*****Arrêté le présent avoir à la somme de : ******', 0, line1Y, {
       width: PAGE.WIDTH,
       align: 'center',
     });
  doc.restore();

  // Amount in French (use absolute value for words)
  const line2Y = boxY + 7 * MM;
  const amountText = `*** ${amountInFrench(Math.abs(totalTTC))} ***`;
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(7.5)
     .text(amountText, 0, line2Y, {
       width: PAGE.WIDTH,
       align: 'center',
     });
  doc.restore();

  return boxY + boxHeight;
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Generate a professional avoir (credit note) PDF
 *
 * @param data - Complete avoir data structure
 * @returns Promise<Buffer> containing the generated PDF
 *
 * @example
 * const pdf = await generateAvoirPDF({
 *   document: {
 *     number: 'A-2026/0001',
 *     date: new Date(),
 *     items: [...],
 *     client: {...}
 *   }
 * });
 */
export async function generateAvoirPDF(data: AvoirData): Promise<Buffer> {
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
        'AVOIR',
        data.document.number,
        '' // No date in header - it's in left fields
      );

      // ── Draw reference fields on left ──
      const leftBottom = drawReferenceFields(
        doc,
        header,
        data.document.date,
        data.document.refFactureOrigine,
        data.document.motif
      );

      // ── Draw client box on right (aligned with title) ──
      const clientInfo: ClientInfo = {
        name: data.document.client.fullName,
        address: data.document.client.address || '',
        city: data.document.client.city || '',
        ice: data.document.client.ice,
      };

      const clientBottom = drawClientBox(doc, header.titleY + 3, clientInfo);

      // ── Draw items table ──
      // Table starts below whichever is lower: left fields or client box
      // FIXED: In PDFKit, larger Y = lower on page, so use Math.max
      const tableY = Math.max(leftBottom, clientBottom) + 4 * MM;

      // Convert AvoirItem[] to TableItem[] with NEGATIVE prices
      const tableItems: TableItem[] = data.document.items.map((item) => {
        let price = item.unitPriceHT;

        // Apply item-level discount if exists
        if (item.discountPercent && item.discountPercent > 0) {
          price = price * (1 - item.discountPercent / 100);
        }

        // IMPORTANT: Negate the price for credit note (avoir)
        return {
          desc: item.designation,
          qty: item.quantity,
          price: -price,  // Negative amount
          unit: item.unit || 'U',
        };
      });

      // Draw table with TVA (20% standard rate for Morocco)
      const tableResult = drawItemsTable(
        doc,
        tableY,
        tableItems,
        0.20,  // TVA rate 20%
        true   // Show TVA
      );

      // ── Sequential Y flow (FIXED: always descend) ──
      let currentY = tableResult.afterTableY + 3 * MM;

      // Amount in French words box (totals will be negative)
      const amountBoxBottom = drawAmountInWordsBox(doc, currentY, tableResult.totalTTC);
      currentY = amountBoxBottom + 5 * MM;

      // Signature section
      drawSignatureSection(doc, currentY + 10 * MM);

      // ── Draw footer ──
      drawFooter(doc);

      // ── Draw border frame (must be last) ──
      drawBorderFrame(doc);

      // ── Finalize PDF ──
      doc.end();

    } catch (error) {
      console.error('Error generating avoir PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────────────────────────────────────

export default generateAvoirPDF;
