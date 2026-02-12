/**
 * LE TATCHE BOIS - Papier En-tête (Blank Letterhead) PDF Generator
 *
 * Generates a professional blank page with company branding:
 * - Wood background texture
 * - Center watermark logo
 * - Header (company name, logo, contact info)
 * - Footer (legal info)
 * - Border frame
 *
 * NO table, NO client info, NO items, NO signatures - just the branded layout
 */

import PDFDoc from 'pdfkit';
import {
  drawWoodBackground,
  drawCenterWatermark,
  drawBorderFrame,
  drawHeader,
  drawFooter,
} from '../base-layout';

// Type alias for PDFDocument (same pattern as facture.ts)
type PDFDocument = PDFKit.PDFDocument;

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Generate a professional blank letterhead PDF
 *
 * @returns Promise<Buffer> containing the generated PDF
 *
 * @example
 * const pdf = await generatePapierEntetePDF();
 * // Returns a Buffer with a blank branded page
 */
export async function generatePapierEntetePDF(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
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

      // ── Draw header WITHOUT document type/number/date ──
      // Just company branding - no document title
      drawHeader(doc);

      // ── Draw footer ──
      drawFooter(doc);

      // ── Draw border frame (must be last) ──
      drawBorderFrame(doc);

      // ── Finalize PDF ──
      doc.end();

    } catch (error) {
      console.error('Error generating papier en-tête PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────────────────────────────────────

export default generatePapierEntetePDF;
