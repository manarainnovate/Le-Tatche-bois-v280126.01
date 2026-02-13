/**
 * LE TATCHE BOIS - Facture (Invoice) PDF Generator
 *
 * Generates professional invoice PDFs conforming to Moroccan CGI art. 145
 * Translated from Python/ReportLab to TypeScript/PDFKit
 *
 * Reference: REFERENCE-generate_docs.py lines 733-816 (create_facture)
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
  COMPANY,
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
 * Invoice item with TVA calculation support
 */
export interface FactureItem {
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent?: number;
  tvaRate: number;
}

/**
 * Client information for facture
 */
export interface FactureClient {
  fullName: string;
  address?: string;
  city?: string;
  ice?: string;
}

/**
 * Source document references
 */
export interface SourceDocuments {
  bonCommande?: string;
  bonLivraison?: string;
}

/**
 * Complete facture data structure
 */
export interface FactureData {
  document: {
    id: string;
    number: string;
    date: Date | string;
    dueDate?: Date | string;
    status: string;
    items: FactureItem[];
    client: FactureClient;
    discountGlobal?: number;
    notes?: string;
    internalNotes?: string;
    paymentMethod?: string;
    bankInfo?: string;
    sourceDocuments?: SourceDocuments;
    paymentDate?: Date | string;  // For "Acquittée" mention
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

/** Unit conversion constant: 1mm = 2.834645669 points */
const MM = 2.834645669;

/**
 * Draw reference fields (Bon de commande, Bon de livraison) on left side
 * Reference: Python lines 772-780
 */
function drawReferenceFields(
  doc: PDFDocument,
  header: HeaderResult,
  sourceDocuments?: SourceDocuments
): number {
  const LINE_H = 16;
  let fy = header.fieldsY;

  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(9);

  // Réf. Bon de commande
  const bcRef = sourceDocuments?.bonCommande || '____________________';
  doc.text(`Réf. Bon de commande :  ${bcRef}`, header.leftX, fy);
  fy += LINE_H;  // FIXED: PDFKit Y increases downward

  // Réf. Bon de livraison
  const blRef = sourceDocuments?.bonLivraison || '____________________';
  doc.text(`Réf. Bon de livraison :    ${blRef}`, header.leftX, fy);

  doc.restore();

  return fy;  // Return bottom Y position (largest value = lowest point)
}

/**
 * Draw amount in words box with gold border
 * Reference: Python lines 789-797
 *
 * Format: "*****Arrêté la présente facture à la somme de : ******"
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
     .text('*****Arrêté la présente facture à la somme de : ******', 0, line1Y, {
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
 * Draw payment section (mode de paiement, bank info)
 * Reference: Python lines 664-685
 */
function drawPaymentSection(
  doc: PDFDocument,
  startY: number,
  paymentMethod?: string,
  bankInfo?: string
): number {
  const margin = 25 * MM;
  let y = startY;

  // Mode de paiement label and value
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Délai de paiement :', margin, y, { continued: true });

  const paymentText = paymentMethod || '30 jours';
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8.5)
     .text(`  ${paymentText}`, { continued: false });
  doc.restore();

  y += 5 * MM;

  // Bank details box — compact, with light background
  const bankBoxWidth = PAGE.WIDTH - 2 * margin;
  const bankBoxHeight = 12 * MM;

  // Light background
  doc.save();
  doc.fillColor('#FAF8F0')
     .opacity(0.4)
     .rect(margin, y, bankBoxWidth, bankBoxHeight)
     .fill();
  doc.restore();

  // Border
  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(0.5)
     .rect(margin, y, bankBoxWidth, bankBoxHeight)
     .stroke();
  doc.restore();

  // Bank icon label
  const textY = y + 2.5 * MM;
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(7.5)
     .text('Coordonnées bancaires (RIB) :', margin + 3 * MM, textY);
  doc.restore();

  // Bank details in 2 columns
  const col1X = margin + 3 * MM;
  const col2X = margin + bankBoxWidth / 2;
  const detailY = textY + 10;

  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(7);

  // Left column
  doc.text(`Titulaire : ${COMPANY.bank.holder}`, col1X, detailY, { lineBreak: false });
  doc.text(`RIB : ${COMPANY.bank.rib}`, col1X, detailY + 9, { lineBreak: false });

  // Right column
  doc.text(`Banque : ${COMPANY.bank.name} — ${COMPANY.bank.branch}`, col2X, detailY, { lineBreak: false });
  doc.text(`IBAN : ${COMPANY.bank.iban}  |  SWIFT : ${COMPANY.bank.swift}`, col2X, detailY + 9, { lineBreak: false });

  doc.restore();

  return y + bankBoxHeight + 3 * MM;
}

/**
 * Draw "Acquittée" legal mention if paid
 * Reference: Python lines 809-813
 */
function drawAcquitteeMention(
  doc: PDFDocument,
  paymentDate?: Date | string
): void {
  if (!paymentDate) {
    return;  // Only show if payment date exists
  }

  const margin = 25 * MM;
  // FIXED: Position at bottom of page (27mm from bottom)
  const y = PAGE.HEIGHT - 27 * MM;

  const dateStr = formatDate(paymentDate);
  const text = `Acquittée le ${dateStr}`;

  doc.save();
  doc.fillColor(COLORS.GRAY)
     .font('Helvetica-Oblique')
     .fontSize(7)
     .text(text, margin, y);
  doc.restore();
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Generate a professional facture (invoice) PDF
 *
 * @param data - Complete facture data structure
 * @returns Promise<Buffer> containing the generated PDF
 *
 * @example
 * const pdf = await generateFacturePDF({
 *   document: {
 *     number: 'F-2026/0001',
 *     date: new Date(),
 *     items: [...],
 *     client: {...}
 *   }
 * });
 */
export async function generateFacturePDF(data: FactureData): Promise<Buffer> {
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

      // ── Generate QR code (async, must be done before creating PDF) ──
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
      const dateStr = formatDate(data.document.date);
      const header = drawHeader(
        doc,
        'FACTURE',
        data.document.number,
        dateStr,
        pageInfo
      );

      // ── Draw échéance (due date) if provided ──
      let leftY = header.fieldsY;
      if (data.document.dueDate) {
        const dueDateStr = formatDate(data.document.dueDate);
        doc.save();
        doc.fillColor(COLORS.BROWN_DARK)
           .font('Helvetica-Bold')
           .fontSize(10)
           .text(`Échéance :  ${dueDateStr}`, header.leftX, leftY);
        doc.restore();
        leftY += 16;  // Move down for next fields
      }

      // ── Draw reference fields on left ──
      // Temporarily modify header.fieldsY to account for échéance
      const modifiedHeader = { ...header, fieldsY: leftY };
      const leftBottom = drawReferenceFields(
        doc,
        modifiedHeader,
        data.document.sourceDocuments
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
      // Increased spacing from 4mm to 8mm for better visual separation
      const tableY = Math.max(leftBottom, clientBottom) + 8 * MM;

      // Convert FactureItem[] to TableItem[]
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
          docType: 'FACTURE',
          docNumber: data.document.number,
          maxItemsFirstPage: maxFirstPage,
          maxItemsContinuation: maxContinuation,
        } : undefined
      );

      // ── Sequential Y flow - BUG 7 FIX: Better spacing between sections ──
      let currentY = tableResult.afterTableY + 3 * MM;

      // Amount in French words box - BUG 7 FIX: Reduce gap from 5mm to 4mm
      const amountBoxBottom = drawAmountInWordsBox(doc, currentY, tableResult.totalTTC);
      currentY = amountBoxBottom + 4 * MM;

      // Always show payment section with bank details
      currentY = drawPaymentSection(
        doc,
        currentY,
        data.document.paymentMethod || '30 jours',
        data.document.bankInfo
      );
      currentY += 2 * MM;

      // Signature section - BUG 6 FIX: Ensure signatures don't get cut off by footer
      // Calculate maximum Y position to avoid footer overlap
      const footerTop = PAGE.HEIGHT - 25 * MM;  // Footer starts at 25mm from bottom
      const signatureHeight = 22 * MM;
      const maxSignatureY = footerTop - signatureHeight - 5 * MM;  // 5mm gap before footer
      const signatureY = Math.min(currentY + 8 * MM, maxSignatureY);

      drawSignatureSection(doc, signatureY);

      // ── Draw "Acquittée" mention if paid ──
      drawAcquitteeMention(doc, data.document.paymentDate);

      // ── Draw footer ──
      drawFooter(doc);

      // ── Draw border frame (must be last) ──
      drawBorderFrame(doc);

      // ── Finalize PDF ──
      doc.end();

    } catch (error) {
      console.error('Error generating facture PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────────────────────────────────────

export default generateFacturePDF;
