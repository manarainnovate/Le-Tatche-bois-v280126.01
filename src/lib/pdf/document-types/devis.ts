/**
 * LE TATCHE BOIS - Devis (Quote) PDF Generator
 *
 * Generates professional quote PDFs
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
  generateInvoiceQR,
  drawQRCode,
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
 * Devis item with TVA calculation support
 */
export interface DevisItem {
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent?: number;
  tvaRate: number;
}

/**
 * Client information for devis
 */
export interface DevisClient {
  fullName: string;
  address?: string;
  city?: string;
  ice?: string;
}

/**
 * Complete devis data structure
 */
export interface DevisData {
  document: {
    id: string;
    number: string;
    date: Date | string;
    validityDays?: number;  // Default: 30 jours
    nature?: string;        // Default: Menuiserie bois
    status: string;
    items: DevisItem[];
    client: DevisClient;
    discountGlobal?: number;
    notes?: string;
    internalNotes?: string;
    conditions?: string;
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

/** Unit conversion constant: 1mm = 2.834645669 points */
const MM = 2.834645669;

/**
 * Draw reference fields (Date, Validité, Nature) on left side
 */
function drawReferenceFields(
  doc: PDFDocument,
  header: HeaderResult,
  date: Date | string,
  validityDays: number = 30,
  nature: string = 'Menuiserie bois'
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

  // Validité
  doc.text(`Validité :  ${validityDays} jours`, header.leftX, fy);
  fy += LINE_H;

  // Nature
  doc.text(`Nature :  ${nature}`, header.leftX, fy);

  doc.restore();

  return fy;  // Return bottom Y position (largest value = lowest point)
}

/**
 * Draw amount in words box with gold border
 *
 * Format: "*****Arrêté le présent devis à la somme de : ******"
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
     .text('*****Arrêté le présent devis à la somme de : ******', 0, line1Y, {
       width: PAGE.WIDTH,
       align: 'center',
     });
  doc.restore();

  // Amount in French
  const line2Y = boxY + 7 * MM;
  const amountText = `*** ${amountInFrench(totalTTC)} ***`;
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

/**
 * Draw conditions section
 */
function drawConditionsSection(
  doc: PDFDocument,
  startY: number,
  conditions?: string
): number {
  if (!conditions) {
    return startY;  // Skip if no conditions
  }

  const margin = 25 * MM;
  const y = startY;

  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Conditions :', margin, y);

  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8.5)
     .text(conditions, margin, y + 5 * MM, {
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
 * Generate a professional devis (quote) PDF
 *
 * @param data - Complete devis data structure
 * @returns Promise<Buffer> containing the generated PDF
 *
 * @example
 * const pdf = await generateDevisPDF({
 *   document: {
 *     number: 'D-2026/0001',
 *     date: new Date(),
 *     items: [...],
 *     client: {...}
 *   }
 * });
 */
export async function generateDevisPDF(data: DevisData): Promise<Buffer> {
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

      // ── Generate QR code (async, must be done before drawing) ──
      // Calculate total TTC for QR
      let qrTotalTTC = 0;
      for (const item of data.document.items) {
        let price = item.unitPriceHT;
        if (item.discountPercent && item.discountPercent > 0) {
          price = price * (1 - item.discountPercent / 100);
        }
        const lineTotalHT = item.quantity * price;
        const lineTotalTTC = lineTotalHT * (1 + item.tvaRate / 100);
        qrTotalTTC += lineTotalTTC;
      }

      const qrBuffer = await generateInvoiceQR(
        data.document.number,
        qrTotalTTC,
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
      const maxFirstPage = 15;
      const maxContinuation = 22;
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
        'DEVIS',
        data.document.number,
        '', // No date in header - it's in left fields
        pageInfo
      );

      // ── Draw reference fields on left ──
      const leftBottom = drawReferenceFields(
        doc,
        header,
        data.document.date,
        data.document.validityDays || 30,
        data.document.nature || 'Menuiserie bois'
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

      // Convert DevisItem[] to TableItem[]
      const tableItems: TableItem[] = data.document.items.map((item) => {
        let price = item.unitPriceHT;

        // Apply item-level discount if exists
        if (item.discountPercent && item.discountPercent > 0) {
          price = price * (1 - item.discountPercent / 100);
        }

        return {
          desc: item.designation,
          qty: item.quantity,
          price: price,
          unit: item.unit || 'U',
        };
      });

      // Draw table with TVA (20% standard rate for Morocco)
      const tableResult = drawItemsTable(
        doc,
        tableY,
        tableItems,
        0.20,  // TVA rate 20%
        true,  // Show TVA
        totalPages > 1 ? {
          docType: 'DEVIS',
          docNumber: data.document.number,
          maxItemsFirstPage: maxFirstPage,
          maxItemsContinuation: maxContinuation,
        } : undefined
      );

      // ── Sequential Y flow (FIXED: always descend) ──
      let currentY = tableResult.afterTableY + 3 * MM;

      // Amount in French words box
      const amountBoxBottom = drawAmountInWordsBox(doc, currentY, tableResult.totalTTC);
      currentY = amountBoxBottom + 5 * MM;

      // Conditions section (if exists)
      if (data.document.conditions) {
        currentY = drawConditionsSection(
          doc,
          currentY,
          data.document.conditions
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
      console.error('Error generating devis PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────────────────────────────────────

export default generateDevisPDF;
