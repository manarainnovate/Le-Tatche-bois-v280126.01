/**
 * LE TATCHE BOIS - PDF Base Layout System
 *
 * Core layout functions for professional documents (Facture, Devis, etc.)
 * Translated from Python/ReportLab to TypeScript/PDFKit
 *
 * IMPORTANT: Coordinate system difference:
 * - ReportLab: (0,0) at bottom-left, Y increases upward
 * - PDFKit: (0,0) at top-left, Y increases downward
 */

import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import { formatNumber } from './helpers/format-utils';

// Import PDFKit types
type PDFDocument = PDFKit.PDFDocument;

// ────────────────────────────────────────────────────────────────────────────────
// CONSTANTS - Colors & Dimensions
// ────────────────────────────────────────────────────────────────────────────────

/** Brand colors matching LE TATCHE BOIS identity */
export const COLORS = {
  BROWN_DARK: '#4A2511',     // Primary dark brown
  BROWN_MEDIUM: '#6B3A22',   // Medium brown for text
  GOLD: '#C4973B',           // Primary gold
  GOLD_DARK: '#8B6914',      // Dark gold for accents
  GOLD_LIGHT: '#F5E6C8',     // Light gold for backgrounds
  GRAY_DARK: '#444444',      // Dark gray for text
  GRAY: '#888888',           // Medium gray
  GRAY_LIGHT: '#F5F5F0',     // Light gray backgrounds
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;

/** A4 page dimensions in points (1 point = 1/72 inch) */
export const PAGE = {
  WIDTH: 595.27,    // A4 width in points
  HEIGHT: 841.89,   // A4 height in points
} as const;

/** Page margins in points (converted from mm) */
export const MARGINS = {
  LEFT: 70.87,      // ~25mm
  RIGHT: 56.69,     // ~20mm
  TOP: 14.17,       // ~5mm
  BOTTOM: 28.35,    // ~10mm
} as const;

/** Company information */
export const COMPANY = {
  name: 'LE TATCHE BOIS',
  type: 'S.A.R.L A.U',
  activity: 'Menuiserie Artisanat - Décoration',
  address: 'LOT HAMANE EL FETOUAKI N° 365',
  city: 'LAMHAMID - MARRAKECH',
  rc: '120511',
  if: '50628346',
  ice: '002942117000021',
  pat: '64601859',
  email: 'letatchebois@gmail.com',
  email2: 'contact@letatchebois.com',
  tel1: '0687 44 184',
  tel2: '0698 01 34 68',
  website: 'www.letatchebois.com',
  // Bank details — Banque Populaire NAKHIL
  bank: {
    name: 'Banque Populaire',
    branch: 'NAKHIL',
    holder: 'STE LE TATCHE BOIS',
    rib: '145 450 2121144005640004 43',
    iban: 'MA64 145450212114400564000443',
    swift: 'BCPOMAMC',
  },
} as const;

// ────────────────────────────────────────────────────────────────────────────────
// ASSET PATHS
// ────────────────────────────────────────────────────────────────────────────────

/** Base path for PDF assets */
const ASSETS_BASE = path.join(process.cwd(), 'public', 'pdf-assets', 'le-tatche-bois-pdf-assets');

/** Asset file paths */
export const ASSETS = {
  logoHeader: path.join(ASSETS_BASE, 'logo-header.png'),
  logoWatermark: path.join(ASSETS_BASE, 'logo-watermark.png'),
  woodBg: path.join(ASSETS_BASE, 'wood-bg.png'),
  woodBar: path.join(ASSETS_BASE, 'wood-bar.png'),
  woodHeader: path.join(ASSETS_BASE, 'wood-header.png'),
  frameTop: path.join(ASSETS_BASE, 'frame_top.png'),
  frameBottom: path.join(ASSETS_BASE, 'frame_bottom.png'),
  frameLeft: path.join(ASSETS_BASE, 'frame_left.png'),
  frameRight: path.join(ASSETS_BASE, 'frame_right.png'),
} as const;

/** Unit conversion constant: 1mm = 2.834645669 points */
const MM = 2.834645669;

// ────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Draw wood texture clipped to a rectangular area
 * Used for table headers, badges, decorative elements
 */
export function drawWoodTexture(
  doc: PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  imagePath: string,
  opacity: number = 1.0
): void {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }

    doc.save();

    // Clip to rectangular area
    doc.rect(x, y, width, height).clip();

    // Draw image with opacity
    if (opacity < 1.0) {
      doc.opacity(opacity);
    }

    doc.image(imagePath, x, y, {
      width: width,
      height: height,
    });

    doc.restore();
  } catch (error) {
    // Fallback to solid brown color
    console.warn(`Failed to draw wood texture: ${error instanceof Error ? error.message : String(error)}`);
    doc.save();
    doc.fillColor(COLORS.BROWN_DARK).rect(x, y, width, height).fill();
    doc.restore();
  }
}

/**
 * Draw gold gradient bar (or wood texture bar)
 * Used for decorative separators
 */
export function drawGoldGradientBar(
  doc: PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  try {
    // Try to use wood bar texture first
    if (fs.existsSync(ASSETS.woodBar)) {
      drawWoodTexture(doc, x, y, width, height, ASSETS.woodBar, 1.0);
      return;
    }
  } catch (error) {
    console.warn(`Wood bar texture not available, using gradient fallback`);
  }

  // Fallback: draw gradient manually
  doc.save();

  // PDFKit doesn't support gradients natively, so we'll use a solid gold color
  // or create a gradient effect with multiple rectangles
  const steps = 60;
  const stepWidth = width / steps;

  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;

    // Interpolate between GOLD_DARK and GOLD_LIGHT
    const r1 = parseInt(COLORS.GOLD_DARK.slice(1, 3), 16) / 255;
    const g1 = parseInt(COLORS.GOLD_DARK.slice(3, 5), 16) / 255;
    const b1 = parseInt(COLORS.GOLD_DARK.slice(5, 7), 16) / 255;

    const r2 = parseInt(COLORS.GOLD_LIGHT.slice(1, 3), 16) / 255;
    const g2 = parseInt(COLORS.GOLD_LIGHT.slice(3, 5), 16) / 255;
    const b2 = parseInt(COLORS.GOLD_LIGHT.slice(5, 7), 16) / 255;

    const r = r1 + (r2 - r1) * ratio;
    const g = g1 + (g2 - g1) * ratio;
    const b = b1 + (b2 - b1) * ratio;

    doc.fillColor([r * 255, g * 255, b * 255])
       .rect(x + i * stepWidth, y, stepWidth + 0.5, height)
       .fill();
  }

  doc.restore();
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN LAYOUT FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Draw wood texture as full page background with white overlay
 * Creates a subtle, professional appearance
 */
export function drawWoodBackground(doc: PDFDocument): void {
  try {
    if (!fs.existsSync(ASSETS.woodBg)) {
      console.warn('Wood background image not found, skipping');
      return;
    }

    doc.save();

    // Draw wood texture
    doc.image(ASSETS.woodBg, 0, 0, {
      width: PAGE.WIDTH,
      height: PAGE.HEIGHT,
    });

    // Semi-transparent white overlay (80% opacity)
    doc.fillColor(COLORS.WHITE)
       .opacity(0.80)
       .rect(0, 0, PAGE.WIDTH, PAGE.HEIGHT)
       .fill();

    doc.restore();
  } catch (error) {
    console.warn(`Failed to draw wood background: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Draw centered logo watermark - big, subtle, professional
 * Default opacity: 0.06 for subtle branding
 */
export function drawCenterWatermark(doc: PDFDocument, opacity: number = 0.06): void {
  try {
    if (!fs.existsSync(ASSETS.logoWatermark)) {
      console.warn('Watermark logo not found, skipping');
      return;
    }

    const logoWidth = 180 * MM;   // 180mm
    const logoHeight = 130 * MM;  // 130mm

    const x = (PAGE.WIDTH - logoWidth) / 2;
    const y = (PAGE.HEIGHT - logoHeight) / 2 - 15 * MM;

    doc.save();
    doc.opacity(opacity);
    doc.image(ASSETS.logoWatermark, x, y, {
      width: logoWidth,
      height: logoHeight,
      fit: [logoWidth, logoHeight],
      align: 'center',
      valign: 'center',
    });
    doc.restore();
  } catch (error) {
    console.warn(`Failed to draw watermark: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper: Load frame image with multi-path fallback
 * BUG C FIX: Try multiple possible paths (local dev + Docker production)
 */
function loadFrameImage(filename: string): Buffer | null {
  const possiblePaths = [
    // Standard development path
    path.join(process.cwd(), 'public', 'pdf-assets', 'le-tatche-bois-pdf-assets', filename),
    // Next.js standalone build (Docker)
    path.join(process.cwd(), 'pdf-assets', 'le-tatche-bois-pdf-assets', filename),
    // Docker absolute path
    path.join('/app', 'public', 'pdf-assets', 'le-tatche-bois-pdf-assets', filename),
    // Relative to this file
    path.join(__dirname, '..', '..', '..', '..', 'public', 'pdf-assets', 'le-tatche-bois-pdf-assets', filename),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log(`[PDF] ✓ Found ${filename} at: ${p}`);
      return fs.readFileSync(p);
    }
  }

  console.warn(`[PDF] ✗ Frame image NOT FOUND: ${filename}`);
  console.warn('[PDF] Tried paths:', possiblePaths);
  return null;
}

/**
 * Draw ornate carved wood frame border
 * 4mm strips on all four sides with wood texture
 * BUG C FIX: Multi-path fallback + gold rectangle fallback if images missing
 */
export function drawBorderFrame(doc: PDFDocument): void {
  const thickness = 4 * MM;  // 4mm frame thickness

  console.log('[PDF] ═══ drawBorderFrame START ═══');

  // BUG C FIX: Load images with fallback paths
  const topBuffer = loadFrameImage('frame_top.png');
  const bottomBuffer = loadFrameImage('frame_bottom.png');
  const leftBuffer = loadFrameImage('frame_left.png');
  const rightBuffer = loadFrameImage('frame_right.png');

  let imagesLoaded = 0;

  try {
    // Top strip
    if (topBuffer) {
      doc.save();
      doc.image(topBuffer, 0, 0, {
        width: PAGE.WIDTH,
        height: thickness,
      });
      doc.restore();
      imagesLoaded++;
    }

    // Bottom strip
    if (bottomBuffer) {
      doc.save();
      doc.image(bottomBuffer, 0, PAGE.HEIGHT - thickness, {
        width: PAGE.WIDTH,
        height: thickness,
      });
      doc.restore();
      imagesLoaded++;
    }

    // Left strip
    if (leftBuffer) {
      doc.save();
      doc.image(leftBuffer, 0, 0, {
        width: thickness,
        height: PAGE.HEIGHT,
      });
      doc.restore();
      imagesLoaded++;
    }

    // Right strip
    if (rightBuffer) {
      doc.save();
      doc.image(rightBuffer, PAGE.WIDTH - thickness, 0, {
        width: thickness,
        height: PAGE.HEIGHT,
      });
      doc.restore();
      imagesLoaded++;
    }

    console.log(`[PDF] ✅ Border frame: ${imagesLoaded}/4 images loaded`);

    // BUG C FIX: FALLBACK - If NO images loaded, draw gold rectangle border
    if (imagesLoaded === 0) {
      console.warn('[PDF] ⚠️  No frame images found — drawing FALLBACK gold border');
      doc.save();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(2)
         .rect(4, 4, PAGE.WIDTH - 8, PAGE.HEIGHT - 8)
         .stroke();
      doc.restore();
    }

  } catch (error) {
    console.error('[PDF] ❌ Border frame error:', error);
    // Draw fallback border on error
    try {
      doc.save();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(2)
         .rect(4, 4, PAGE.WIDTH - 8, PAGE.HEIGHT - 8)
         .stroke();
      doc.restore();
      console.log('[PDF] ✅ Fallback gold border drawn');
    } catch (fallbackError) {
      console.error('[PDF] ❌ Even fallback border failed:', fallbackError);
    }
  }

  console.log('[PDF] ═══ drawBorderFrame END ═══');
}

/**
 * Header return type
 */
export interface HeaderResult {
  titleY: number;      // Y position of document title
  fieldsY: number;     // Y position where additional fields can start
  leftX: number;       // X position for left-aligned content
}

/**
 * Draw the professional header with logo and company info
 *
 * @param doc - PDFDocument instance
 * @param docType - Document type (e.g., "FACTURE", "DEVIS")
 * @param docNumber - Document number (e.g., "F-2026/0001")
 * @param docDate - Document date (e.g., "05/01/2026")
 * @param pageInfo - Optional page numbering info for multi-page documents
 * @returns Header positioning info for subsequent content
 */
export function drawHeader(
  doc: PDFDocument,
  docType?: string,
  docNumber?: string,
  docDate?: string,
  pageInfo?: { currentPage: number; totalPages: number }
): HeaderResult {
  const margin = 25 * MM;

  // Header area dimensions (top-left origin)
  const headerTop = 5 * MM;
  const headerBottom = 50 * MM;

  // ── Logo (left side) - drawn at full opacity ──
  try {
    if (fs.existsSync(ASSETS.logoHeader)) {
      const logoWidth = 35 * MM;
      const logoHeight = 35 * MM;
      const logoX = 5 * MM;
      const logoY = headerTop + 5 * MM;

      doc.save();
      doc.image(ASSETS.logoHeader, logoX, logoY, {
        width: logoWidth,
        height: logoHeight,
        fit: [logoWidth, logoHeight],
      });
      doc.restore();
    }
  } catch (error) {
    console.warn(`Failed to load header logo: ${error instanceof Error ? error.message : String(error)}`);
  }

  // ══════════════════════════════════════════════════════════
  // COMPANY INFO BLOCK — All aligned to the right of logo
  // Tight vertical spacing, one clean column
  // ══════════════════════════════════════════════════════════
  const textX = 5 * MM + 40 * MM;  // Right of logo
  const lineSpacing = 11;           // Tight line spacing (11pt between lines)

  // Line 1: Company name — 20pt bold
  const nameY = headerTop + 10 * MM;
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('LE TATCHE BOIS', textX, nameY, { lineBreak: false });
  doc.restore();

  // Line 2: Type + Activity — right below name (24pt gap for 20pt text)
  const typeY = nameY + 24;
  doc.save();
  doc.fillColor(COLORS.GOLD_DARK)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text(COMPANY.type, textX, typeY, { continued: true });
  doc.fillColor(COLORS.BROWN_MEDIUM)
     .font('Helvetica')
     .fontSize(8)
     .text(`  •  ${COMPANY.activity}`, { continued: false });
  doc.restore();

  // Line 3: Address — on one line
  const addressY = typeY + lineSpacing + 2;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8)
     .text(`${COMPANY.address} - ${COMPANY.city}`, textX, addressY, { lineBreak: false });
  doc.restore();

  // Line 4: Telephone
  const contactY = addressY + lineSpacing;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8)
     .text(`Tél : ${COMPANY.tel1}  /  ${COMPANY.tel2}`, textX, contactY, { lineBreak: false });
  doc.restore();

  // Line 5: Email (both addresses)
  const emailY = contactY + lineSpacing;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8)
     .text(`Email : ${COMPANY.email}  /  ${COMPANY.email2}`, textX, emailY, { lineBreak: false });
  doc.restore();

  // Line 6: Website
  const webY = emailY + lineSpacing;
  doc.save();
  doc.fillColor(COLORS.GOLD_DARK)
     .font('Helvetica')
     .fontSize(8)
     .text(`Web : ${COMPANY.website}`, textX, webY, { lineBreak: false });
  doc.restore();

  // ── Bottom gold gradient line (separator) - BUG 1 FIX: Add 8pt gap after text ──
  const separatorY = headerBottom + 1 * MM + 8;
  drawGoldGradientBar(doc, 0, separatorY, PAGE.WIDTH, 3 * MM);

  // ── Document type title (if specified) ──
  if (docType) {
    const titleY = headerBottom + 6 * MM + 8;

    // Build title text
    let titleText = docType.toUpperCase();
    if (docNumber) {
      titleText += `  N° : ${docNumber}`;
    }
    // Add page number if multi-page
    if (pageInfo && pageInfo.totalPages > 1) {
      titleText += `          Page ${pageInfo.currentPage}/${pageInfo.totalPages}`;
    }

    // BUG 3 FIX: Calculate max width to avoid overlap with client box
    const clientBoxLeft = PAGE.WIDTH - MARGINS.RIGHT - 75 * MM;
    const titleMaxWidth = clientBoxLeft - MARGINS.LEFT - 10;  // 10pt gap

    // Auto-scale font if needed (max 11.5pt, min 8pt)
    let fontSize = 11.5;
    doc.font('Helvetica-Bold').fontSize(fontSize);
    while (fontSize > 8 && doc.widthOfString(titleText) > titleMaxWidth) {
      fontSize -= 0.5;
      doc.fontSize(fontSize);
    }

    const leftX = margin;

    doc.save();
    doc.fillColor(COLORS.BROWN_DARK)
       .font('Helvetica-Bold')
       .fontSize(fontSize)
       .text(titleText, leftX, titleY, { width: titleMaxWidth, lineBreak: false });
    doc.restore();

    // Date - same left_x start, bold
    const dateY = titleY + 16;
    if (docDate) {
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`Date :  ${docDate}`, leftX, dateY);
      doc.restore();
    }

    const fieldsY = dateY + 16;  // Start for additional fields
    return { titleY, fieldsY, leftX };
  }

  return {
    titleY: headerBottom + 10 * MM,
    fieldsY: headerBottom + 20 * MM,
    leftX: margin,
  };
}

/**
 * Draw a minimal header for continuation pages (page 2, 3, etc.)
 * Shows: company name, document type + number + page info, gold separator
 * Returns Y position where table should start
 */
export function drawContinuationPageHeader(
  doc: PDFDocument,
  docType: string,
  docNumber: string,
  pageInfo: { currentPage: number; totalPages: number }
): number {
  const margin = 25 * MM;
  const topY = 8 * MM;

  // Company name — smaller than main header
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('LE TATCHE BOIS', margin, topY);
  doc.restore();

  // Gold separator line
  const separatorY = topY + 20;
  drawGoldGradientBar(doc, 0, separatorY, PAGE.WIDTH, 2 * MM);

  // Document title with page number
  const titleY = separatorY + 8;
  let titleText = `${docType.toUpperCase()}  N° : ${docNumber}`;
  titleText += `          Page ${pageInfo.currentPage}/${pageInfo.totalPages}`;

  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(titleText, margin, titleY);
  doc.restore();

  // "Suite" mention
  const suiteY = titleY + 14;
  doc.save();
  doc.fillColor(COLORS.GRAY)
     .font('Helvetica-Oblique')
     .fontSize(8)
     .text('(Suite)', margin, suiteY);
  doc.restore();

  return suiteY + 12;  // Y where table header should start
}

/**
 * Draw "Report page suivante" row at bottom of a non-last page
 * Shows the running subtotal being carried to the next page
 */
export function drawPageCarryForward(
  doc: PDFDocument,
  currentY: number,
  runningSubtotal: number,
  tableWidth: number,
  margin: number
): number {
  const rowHeight = 7 * MM;
  const y = currentY;

  // Background
  doc.save();
  doc.fillColor('#F5EDE0')
     .opacity(0.6)
     .rect(margin, y, tableWidth, rowHeight)
     .fill();
  doc.restore();

  // Border
  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(0.8)
     .rect(margin, y, tableWidth, rowHeight)
     .stroke();
  doc.restore();

  // Text
  const textY = y + (rowHeight / 2) - 4;
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(8.5);

  doc.text('Report page suivante ►', margin + 8, textY, {
    width: tableWidth * 0.6,
    align: 'left',
    lineBreak: false,
  });

  doc.text(`${formatNumber(runningSubtotal)} DH`, margin + tableWidth * 0.6, textY, {
    width: tableWidth * 0.4 - 10,
    align: 'right',
    lineBreak: false,
  });

  doc.restore();

  return y + rowHeight;
}

/**
 * Draw "Report page précédente" row at top of a continuation page
 * Shows the subtotal carried from the previous page
 */
export function drawPageCarryForwardFrom(
  doc: PDFDocument,
  currentY: number,
  previousSubtotal: number,
  tableWidth: number,
  margin: number
): number {
  const rowHeight = 6 * MM;
  const y = currentY;

  // Background
  doc.save();
  doc.fillColor('#F5EDE0')
     .opacity(0.5)
     .rect(margin, y, tableWidth, rowHeight)
     .fill();
  doc.restore();

  // Border
  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(0.5)
     .rect(margin, y, tableWidth, rowHeight)
     .stroke();
  doc.restore();

  // Text
  const textY = y + (rowHeight / 2) - 3.5;
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Oblique')
     .fontSize(8);

  doc.text('◄ Report page précédente', margin + 8, textY, {
    width: tableWidth * 0.6,
    align: 'left',
    lineBreak: false,
  });

  doc.text(`${formatNumber(previousSubtotal)} DH`, margin + tableWidth * 0.6, textY, {
    width: tableWidth * 0.4 - 10,
    align: 'right',
    lineBreak: false,
  });

  doc.restore();

  return y + rowHeight;
}

// ────────────────────────────────────────────────────────────────────────────────
// QR CODE FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Generate QR code containing bank/payment info + invoice reference
 * Returns a PNG buffer that can be embedded in PDFKit
 *
 * Content is SIMPLE TEXT optimized for readability when scanned
 */
export async function generateInvoiceQR(
  docNumber: string,
  totalTTC?: number,
  clientName?: string
): Promise<Buffer> {
  // Build QR content — SIMPLE format for easy scanning
  const lines = [
    `LE TATCHE BOIS`,
    ``,
    `COORDONNEES BANCAIRES:`,
    `Titulaire: ${COMPANY.bank.holder}`,
    `RIB: ${COMPANY.bank.rib}`,
    `IBAN: ${COMPANY.bank.iban}`,
    `SWIFT: ${COMPANY.bank.swift}`,
    `Banque: ${COMPANY.bank.name} ${COMPANY.bank.branch}`,
    ``,
    `DOCUMENT: ${docNumber}`,
  ];

  if (totalTTC !== undefined && totalTTC > 0) {
    lines.push(`Montant: ${totalTTC.toFixed(2)} DH`);
  }

  lines.push(``);
  lines.push(`CONTACT:`);
  lines.push(`Tel: ${COMPANY.tel1}`);
  lines.push(`Email: ${COMPANY.email2}`);
  lines.push(`Web: ${COMPANY.website}`);
  lines.push(`ICE: ${COMPANY.ice}`);

  const qrContent = lines.join('\n');

  // Generate QR as PNG buffer
  const qrBuffer = await QRCode.toBuffer(qrContent, {
    errorCorrectionLevel: 'M',  // Medium error correction
    type: 'png',
    width: 300,       // 300px resolution for sharp print
    margin: 1,
    color: {
      dark: '#3E2723',   // Dark brown (matches COLORS.BROWN_DARK)
      light: '#FFFFFF00', // Transparent background
    },
  });

  return qrBuffer;
}

/**
 * Draw QR code at top-right corner of the page
 * Position: Right side, aligned with header
 */
export function drawQRCode(
  doc: PDFDocument,
  qrBuffer: Buffer
): void {
  const qrSize = 22 * MM;   // ~62pt = good scannable size
  const margin = 8 * MM;    // Right margin
  const topMargin = 6 * MM; // Top margin

  const qrX = PAGE.WIDTH - margin - qrSize;
  const qrY = topMargin;

  // Draw QR image
  try {
    doc.image(qrBuffer, qrX, qrY, {
      width: qrSize,
      height: qrSize,
    });

    // Small label below QR
    doc.save();
    doc.fillColor(COLORS.GRAY)
       .font('Helvetica')
       .fontSize(5.5)
       .text('Scanner pour coordonnées bancaires', qrX - 5, qrY + qrSize + 1, {
         width: qrSize + 10,
         align: 'center',
         lineBreak: false,
       });
    doc.restore();
  } catch (error) {
    console.warn('Failed to draw QR code:', error);
  }
}

/**
 * Draw the professional footer with legal info
 */
export function drawFooter(doc: PDFDocument): void {
  const margin = 25 * MM;
  const footerHeight = 22 * MM;
  const footerTop = PAGE.HEIGHT - footerHeight;
  const woodBarHeight = 3 * MM;

  // ── Gold gradient bar (separator at top of footer) ──
  drawGoldGradientBar(doc, 0, footerTop, PAGE.WIDTH, woodBarHeight);

  // ── Footer background (very light beige with transparency) ──
  // IMPORTANT: Start BELOW the wood bar so it doesn't cover it
  doc.save();
  doc.fillColor('#FFFCF0')
     .opacity(0.6)
     .rect(0, footerTop + woodBarHeight, PAGE.WIDTH, footerHeight - woodBarHeight)
     .fill();
  doc.restore();

  // ── Legal identifiers ──
  let y = footerTop + 5 * MM;

  // Line 1: Address
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(7.5)
     .text(`${COMPANY.address} - ${COMPANY.city}`, 0, y, {
       width: PAGE.WIDTH,
       align: 'center',
     });
  doc.restore();

  // Line 2: Legal identifiers - simplified for reliability
  // FIXED: Avoid continued:true complexity, use simple centered text
  y += 8;
  doc.save();
  doc.font('Helvetica')
     .fontSize(7)
     .fillColor(COLORS.GRAY_DARK)
     .text(
       `RC : ${COMPANY.rc}  |  IF : ${COMPANY.if}  |  ICE : ${COMPANY.ice}  |  PAT : ${COMPANY.pat}`,
       0,
       y,
       { width: PAGE.WIDTH, align: 'center' }
     );
  doc.restore();

  // Line 3: Contact
  y += 8;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(7)
     .text(
       `Email : ${COMPANY.email}  |  contact@letatchebois.com  |  Tél : ${COMPANY.tel1} / ${COMPANY.tel2}`,
       0,
       y,
       { width: PAGE.WIDTH, align: 'center' }
     );
  doc.restore();

  // Line 4: Website
  y += 8;
  doc.save();
  doc.fillColor(COLORS.GOLD_DARK)
     .font('Helvetica-Bold')
     .fontSize(7)
     .text(COMPANY.website, 0, y, { width: PAGE.WIDTH, align: 'center' });
  doc.restore();
}

/**
 * Client info interface
 */
export interface ClientInfo {
  name: string;
  address: string;
  city: string;
  ice?: string;
}

/**
 * Draw client information box - clean style, compact
 *
 * @param doc - PDFDocument instance
 * @param topY - Y position for top of box
 * @param client - Client information
 * @returns Y position of box bottom (for layout calculations)
 */
export function drawClientBox(
  doc: PDFDocument,
  topY: number,
  client: ClientInfo
): number {
  const margin = 20 * MM;
  const boxWidth = 75 * MM;
  const boxHeight = 30 * MM;  // BUG 4 FIX: Increased from 28mm to 30mm for more space
  const boxX = PAGE.WIDTH - margin - boxWidth;
  const boxY = topY;

  // Box border only - clear background
  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(0.8)
     .rect(boxX, boxY, boxWidth, boxHeight)
     .stroke();
  doc.restore();

  // "Client :" label - BUG 4 FIX: Add proper padding from top (3mm)
  const padTop = 3 * MM;
  const padLeft = 3 * MM;

  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Client :', boxX + padLeft, boxY + padTop);
  doc.restore();

  // Client name - BUG 4 FIX: Position 12pt below label
  const textX = boxX + padLeft;
  let textY = boxY + padTop + 12;

  doc.save();
  doc.fillColor(COLORS.BLACK)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(client.name || '[Nom du client]', textX, textY, { width: boxWidth - 2 * padLeft });
  doc.restore();

  // Address - BUG 4 FIX: Better spacing
  textY += 12;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8.5)
     .text(client.address || '[Adresse du client]', textX, textY, { width: boxWidth - 2 * padLeft });
  doc.restore();

  // City
  textY += 11;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8.5)
     .text(client.city || '[Ville]', textX, textY, { width: boxWidth - 2 * padLeft });
  doc.restore();

  // ICE (if provided)
  if (client.ice) {
    textY += 11;
    doc.save();
    doc.fillColor(COLORS.BROWN_DARK)
       .font('Helvetica-Bold')
       .fontSize(8)
       .text(`ICE : ${client.ice}`, textX, textY, { width: boxWidth - 2 * padLeft });
    doc.restore();
  }

  return boxY + boxHeight;
}

/**
 * Item interface for table
 */
export interface TableItem {
  desc: string;      // Description
  qty: number;       // Quantity
  price: number;     // Unit price HT
  unit?: string;     // Unit (default: "U")
}

/**
 * Items table result
 */
export interface TableResult {
  afterTableY: number;  // Y position after table and totals
  totalTTC: number;     // Total TTC amount
}

/**
 * Pagination configuration for multi-page documents
 */
export interface TablePaginationConfig {
  docType: string;             // 'FACTURE', 'DEVIS', etc.
  docNumber: string;           // Document number
  maxItemsFirstPage: number;   // Default ~15 (first page has header/client)
  maxItemsContinuation: number; // Default ~22 (continuation pages have mini header)
}

/**
 * Draw the items table with totals
 * Handles pagination if items overflow
 *
 * @param doc - PDFDocument instance
 * @param startY - Y position to start table
 * @param items - Array of items to display
 * @param tvaRate - TVA rate (default 0.20 for 20%)
 * @param showTVA - Whether to show TVA calculations
 * @param pagination - Optional pagination config for multi-page documents
 * @returns Table result with positioning and totals
 */
export function drawItemsTable(
  doc: PDFDocument,
  startY: number,
  items: TableItem[],
  tvaRate: number = 0.20,
  showTVA: boolean = true,
  pagination?: TablePaginationConfig
): TableResult {
  const margin = 20 * MM;
  const tableWidth = PAGE.WIDTH - 2 * margin;
  const footerLimit = 28 * MM;  // Don't draw below this

  // Column widths
  const colWidths = {
    num: 8 * MM,       // N°
    desc: tableWidth - 68 * MM,  // DÉSIGNATION
    unit: 10 * MM,     // U
    qty: 12 * MM,      // QTÉ
    puHT: 19 * MM,     // P.U. HT
    totalHT: 19 * MM,  // TOTAL HT
  };

  // Row heights
  const headerRowHeight = 7 * MM;
  const dataRowHeight = 5.5 * MM;

  // Calculate subtotal
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.qty * item.price;
  }

  // Declare currentY here so it's available for both single and multi-page modes
  let currentY = startY;

  // ══════════════════════════════════════════════════════════════
  // PAGINATION LOGIC
  // ══════════════════════════════════════════════════════════════
  const needsPagination = pagination && items.length > pagination.maxItemsFirstPage;

  if (!needsPagination) {
    // ══════════════════════════════════════════════════════════════
    // SINGLE PAGE MODE (existing logic - unchanged)
    // ══════════════════════════════════════════════════════════════

    // ── Draw table header with wood texture ──
    const headerY = startY;

    // Draw wood texture behind header
    try {
      if (fs.existsSync(ASSETS.woodHeader)) {
        drawWoodTexture(doc, margin, headerY, tableWidth, headerRowHeight, ASSETS.woodHeader, 1.0);
      } else {
        // Fallback to brown background
        doc.save();
        doc.fillColor(COLORS.BROWN_DARK)
           .rect(margin, headerY, tableWidth, headerRowHeight)
           .fill();
        doc.restore();
      }
    } catch (error) {
      console.warn('Wood header texture not available, using solid color');
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .rect(margin, headerY, tableWidth, headerRowHeight)
         .fill();
      doc.restore();
    }

    // Draw header borders
    doc.save();
    doc.strokeColor(COLORS.GOLD_DARK)
       .lineWidth(1.5)
       .rect(margin, headerY, tableWidth, headerRowHeight)
       .stroke();
    doc.restore();

    // Header text (white on wood/brown)
    const headers = ['N°', 'DÉSIGNATION', 'U', 'QTÉ', 'P.U. HT', 'TOTAL HT'];
    let xPos = margin;
    const headerTextY = headerY + (headerRowHeight / 2) - 3;  // Vertically centered

    doc.save();
    doc.fillColor(COLORS.WHITE)
       .font('Helvetica-Bold')
       .fontSize(9);

    // N°
    doc.text(headers[0], xPos, headerTextY, { width: colWidths.num, align: 'center' });
    xPos += colWidths.num;

    // DÉSIGNATION
    doc.text(headers[1], xPos + 2, headerTextY, { width: colWidths.desc - 4, align: 'center' });
    xPos += colWidths.desc;

    // U
    doc.text(headers[2], xPos, headerTextY, { width: colWidths.unit, align: 'center' });
    xPos += colWidths.unit;

    // QTÉ
    doc.text(headers[3], xPos, headerTextY, { width: colWidths.qty, align: 'center' });
    xPos += colWidths.qty;

    // P.U. HT
    doc.text(headers[4], xPos, headerTextY, { width: colWidths.puHT, align: 'right' });
    xPos += colWidths.puHT;

    // TOTAL HT
    doc.text(headers[5], xPos, headerTextY, { width: colWidths.totalHT, align: 'right' });

    doc.restore();

    // ── Draw data rows ──
    currentY = headerY + headerRowHeight;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowY = currentY;
      const total = item.qty * item.price;

      // Alternating row background (very subtle)
      if (i % 2 === 0) {
        doc.save();
        doc.fillColor('#FAF8F0')
           .opacity(0.35)
           .rect(margin, rowY, tableWidth, dataRowHeight)
           .fill();
        doc.restore();
      } else {
        doc.save();
        doc.fillColor(COLORS.WHITE)
           .opacity(0.35)
           .rect(margin, rowY, tableWidth, dataRowHeight)
           .fill();
        doc.restore();
      }

      // Row text
      const textY = rowY + (dataRowHeight / 2) - 2.5;
      xPos = margin;

      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica')
         .fontSize(7.5);

      // N° (centered)
      doc.text(`${i + 1}`, xPos, textY, { width: colWidths.num, align: 'center', lineBreak: false });
      xPos += colWidths.num;

      // Description (left aligned with padding)
      doc.text(item.desc, xPos + 2, textY, { width: colWidths.desc - 4, align: 'left', lineBreak: false });
      xPos += colWidths.desc;

      // Unit (centered)
      doc.text(item.unit || 'U', xPos, textY, { width: colWidths.unit, align: 'center', lineBreak: false });
      xPos += colWidths.unit;

      // Quantity (centered)
      doc.text(`${item.qty}`, xPos, textY, { width: colWidths.qty, align: 'center', lineBreak: false });
      xPos += colWidths.qty;

      // Unit price (right aligned)
      doc.text(formatNumber(item.price), xPos, textY, { width: colWidths.puHT - 2, align: 'right', lineBreak: false });
      xPos += colWidths.puHT;

      // Total (right aligned)
      doc.text(formatNumber(total), xPos, textY, { width: colWidths.totalHT - 2, align: 'right', lineBreak: false });

      doc.restore();

      currentY += dataRowHeight;
    }

    // ══════════════════════════════════════════════════════════════
    // GRID LINES — Draw AFTER all row backgrounds and text
    // ══════════════════════════════════════════════════════════════
    const tableTop = headerY;
    const tableBottom = currentY;

    doc.save();
    doc.strokeColor('#8B7355')  // Medium brown for grid
       .lineWidth(0.5);

    // Outer border rectangle
    doc.rect(margin, tableTop, tableWidth, tableBottom - tableTop).stroke();

    // Vertical lines between columns
    const colX = {
      afterNum: margin + colWidths.num,
      afterDesc: margin + colWidths.num + colWidths.desc,
      afterUnit: margin + colWidths.num + colWidths.desc + colWidths.unit,
      afterQty: margin + colWidths.num + colWidths.desc + colWidths.unit + colWidths.qty,
      afterPuHT: margin + colWidths.num + colWidths.desc + colWidths.unit + colWidths.qty + colWidths.puHT,
    };

    const verticalLines = [
      colX.afterNum,    // After N°
      colX.afterDesc,   // After DÉSIGNATION
      colX.afterUnit,   // After U
      colX.afterQty,    // After QTÉ
      colX.afterPuHT,   // After P.U. HT
    ];

    for (const x of verticalLines) {
      doc.moveTo(x, tableTop)
         .lineTo(x, tableBottom)
         .stroke();
    }

    // Horizontal line under header (thicker)
    doc.strokeColor('#C4973B')  // Gold for header separator
       .lineWidth(1.0)
       .moveTo(margin, tableTop + headerRowHeight)
       .lineTo(margin + tableWidth, tableTop + headerRowHeight)
       .stroke();

    // Horizontal lines between data rows (subtle)
    doc.strokeColor('#8B7355')
       .lineWidth(0.3);
    for (let i = 1; i < items.length; i++) {
      const y = headerY + headerRowHeight + (i * dataRowHeight);
      doc.moveTo(margin, y)
         .lineTo(margin + tableWidth, y)
         .stroke();
    }

    doc.restore();
  } else {
    // ══════════════════════════════════════════════════════════════
    // MULTI-PAGE MODE
    // ══════════════════════════════════════════════════════════════

    // Split items into pages
    const { maxItemsFirstPage, maxItemsContinuation, docType, docNumber } = pagination;
    const totalPages = 1 + Math.ceil((items.length - maxItemsFirstPage) / maxItemsContinuation);

    let itemIndex = 0;
    let runningSubtotal = 0;
    currentY = startY;  // Use the outer-scoped currentY

    // Helper function to draw table header
    const drawTableHeader = (headerY: number) => {
      // Draw wood texture behind header
      try {
        if (fs.existsSync(ASSETS.woodHeader)) {
          drawWoodTexture(doc, margin, headerY, tableWidth, headerRowHeight, ASSETS.woodHeader, 1.0);
        } else {
          // Fallback to brown background
          doc.save();
          doc.fillColor(COLORS.BROWN_DARK)
             .rect(margin, headerY, tableWidth, headerRowHeight)
             .fill();
          doc.restore();
        }
      } catch (error) {
        console.warn('Wood header texture not available, using solid color');
        doc.save();
        doc.fillColor(COLORS.BROWN_DARK)
           .rect(margin, headerY, tableWidth, headerRowHeight)
           .fill();
        doc.restore();
      }

      // Draw header borders
      doc.save();
      doc.strokeColor(COLORS.GOLD_DARK)
         .lineWidth(1.5)
         .rect(margin, headerY, tableWidth, headerRowHeight)
         .stroke();
      doc.restore();

      // Header text (white on wood/brown)
      const headers = ['N°', 'DÉSIGNATION', 'U', 'QTÉ', 'P.U. HT', 'TOTAL HT'];
      let xPos = margin;
      const headerTextY = headerY + (headerRowHeight / 2) - 3;  // Vertically centered

      doc.save();
      doc.fillColor(COLORS.WHITE)
         .font('Helvetica-Bold')
         .fontSize(9);

      // N°
      doc.text(headers[0], xPos, headerTextY, { width: colWidths.num, align: 'center' });
      xPos += colWidths.num;

      // DÉSIGNATION
      doc.text(headers[1], xPos + 2, headerTextY, { width: colWidths.desc - 4, align: 'center' });
      xPos += colWidths.desc;

      // U
      doc.text(headers[2], xPos, headerTextY, { width: colWidths.unit, align: 'center' });
      xPos += colWidths.unit;

      // QTÉ
      doc.text(headers[3], xPos, headerTextY, { width: colWidths.qty, align: 'center' });
      xPos += colWidths.qty;

      // P.U. HT
      doc.text(headers[4], xPos, headerTextY, { width: colWidths.puHT, align: 'right' });
      xPos += colWidths.puHT;

      // TOTAL HT
      doc.text(headers[5], xPos, headerTextY, { width: colWidths.totalHT, align: 'right' });

      doc.restore();
    };

    // Helper function to draw rows
    const drawRows = (pageItems: TableItem[], startRowNumber: number, rowsStartY: number) => {
      let rowY = rowsStartY;

      for (let i = 0; i < pageItems.length; i++) {
        const item = pageItems[i];
        const total = item.qty * item.price;

        // Alternating row background (very subtle)
        if (i % 2 === 0) {
          doc.save();
          doc.fillColor('#FAF8F0')
             .opacity(0.35)
             .rect(margin, rowY, tableWidth, dataRowHeight)
             .fill();
          doc.restore();
        } else {
          doc.save();
          doc.fillColor(COLORS.WHITE)
             .opacity(0.35)
             .rect(margin, rowY, tableWidth, dataRowHeight)
             .fill();
          doc.restore();
        }

        // Row text
        const textY = rowY + (dataRowHeight / 2) - 2.5;
        let xPos = margin;

        doc.save();
        doc.fillColor(COLORS.BROWN_DARK)
           .font('Helvetica')
           .fontSize(7.5);

        // N° (centered) - CONTINUOUS numbering
        doc.text(`${startRowNumber + i}`, xPos, textY, { width: colWidths.num, align: 'center', lineBreak: false });
        xPos += colWidths.num;

        // Description (left aligned with padding)
        doc.text(item.desc, xPos + 2, textY, { width: colWidths.desc - 4, align: 'left', lineBreak: false });
        xPos += colWidths.desc;

        // Unit (centered)
        doc.text(item.unit || 'U', xPos, textY, { width: colWidths.unit, align: 'center', lineBreak: false });
        xPos += colWidths.unit;

        // Quantity (centered)
        doc.text(`${item.qty}`, xPos, textY, { width: colWidths.qty, align: 'center', lineBreak: false });
        xPos += colWidths.qty;

        // Unit price (right aligned)
        doc.text(formatNumber(item.price), xPos, textY, { width: colWidths.puHT - 2, align: 'right', lineBreak: false });
        xPos += colWidths.puHT;

        // Total (right aligned)
        doc.text(formatNumber(total), xPos, textY, { width: colWidths.totalHT - 2, align: 'right', lineBreak: false });

        doc.restore();

        rowY += dataRowHeight;
      }

      return rowY;
    };

    // Helper function to draw grid lines
    const drawGridLines = (tableTop: number, tableBottom: number, numRows: number) => {
      doc.save();
      doc.strokeColor('#8B7355')  // Medium brown for grid
         .lineWidth(0.5);

      // Outer border rectangle
      doc.rect(margin, tableTop, tableWidth, tableBottom - tableTop).stroke();

      // Vertical lines between columns
      const colX = {
        afterNum: margin + colWidths.num,
        afterDesc: margin + colWidths.num + colWidths.desc,
        afterUnit: margin + colWidths.num + colWidths.desc + colWidths.unit,
        afterQty: margin + colWidths.num + colWidths.desc + colWidths.unit + colWidths.qty,
        afterPuHT: margin + colWidths.num + colWidths.desc + colWidths.unit + colWidths.qty + colWidths.puHT,
      };

      const verticalLines = [
        colX.afterNum,    // After N°
        colX.afterDesc,   // After DÉSIGNATION
        colX.afterUnit,   // After U
        colX.afterQty,    // After QTÉ
        colX.afterPuHT,   // After P.U. HT
      ];

      for (const x of verticalLines) {
        doc.moveTo(x, tableTop)
           .lineTo(x, tableBottom)
           .stroke();
      }

      // Horizontal line under header (thicker)
      doc.strokeColor('#C4973B')  // Gold for header separator
         .lineWidth(1.0)
         .moveTo(margin, tableTop + headerRowHeight)
         .lineTo(margin + tableWidth, tableTop + headerRowHeight)
         .stroke();

      // Horizontal lines between data rows (subtle)
      doc.strokeColor('#8B7355')
         .lineWidth(0.3);
      for (let i = 1; i < numRows; i++) {
        const y = tableTop + headerRowHeight + (i * dataRowHeight);
        doc.moveTo(margin, y)
           .lineTo(margin + tableWidth, y)
           .stroke();
      }

      doc.restore();
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
          totalPages
        });

        // Draw table header
        drawTableHeader(tableStartY);
        currentY = tableStartY + headerRowHeight;

        // Draw "Report page précédente" row
        currentY = drawPageCarryForwardFrom(doc, currentY, runningSubtotal, tableWidth, margin);
      } else {
        // First page - draw table header at startY
        drawTableHeader(currentY);
        currentY += headerRowHeight;
      }

      // Draw rows for this page
      const tableTopForPage = isFirstPage ? startY : (currentY - headerRowHeight - (isFirstPage ? 0 : 6 * MM));
      currentY = drawRows(pageItems, itemIndex + 1, currentY);

      // Update running subtotal
      for (const item of pageItems) {
        runningSubtotal += item.qty * item.price;
      }

      // Draw grid lines for this page
      drawGridLines(tableTopForPage, currentY, pageItems.length);

      if (!isLastPage) {
        // Draw "Report page suivante" row
        currentY = drawPageCarryForward(doc, currentY, runningSubtotal, tableWidth, margin);

        // Draw footer and border for non-last pages
        drawFooter(doc);
        drawBorderFrame(doc);
      }

      itemIndex += pageItems.length;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TOTALS BOX — Right-aligned, with proper padding
  // ══════════════════════════════════════════════════════════════
  const totalsBoxWidth = 200;  // Total width of box in points
  const totalsBoxX = margin + tableWidth - totalsBoxWidth;  // Right-aligned with table
  const totalsBoxTop = currentY + 8;  // 8pt gap below table
  const totalsRowHeight = 18;  // Height of each row in totals
  const totalsPadLeft = 10;  // Left padding inside box
  const totalsPadRight = 10;  // Right padding inside box
  const labelColWidth = 80;  // Width for "Total HT", "TVA (20%)" labels
  const valueColWidth = totalsBoxWidth - labelColWidth;  // Rest for values

  // Calculate totals
  const tvaAmount = showTVA ? subtotal * tvaRate : 0;
  const totalTTC = subtotal + tvaAmount;

  // Row 1: Total HT
  const row1Y = totalsBoxTop;
  // Row 2: TVA
  const row2Y = row1Y + totalsRowHeight;
  // Row 3: Total TTC (bold, bigger)
  const row3Y = row2Y + totalsRowHeight;
  const totalsBoxBottom = showTVA ? (row3Y + totalsRowHeight + 4) : (row1Y + totalsRowHeight + 4);

  // Draw box background — same semi-transparent style as table data rows
  doc.save();

  if (showTVA) {
    // Rows 1-2: Same as table even rows (subtle semi-transparent)
    doc.save();
    doc.fillColor('#FAF8F0')
       .opacity(0.35)
       .rect(totalsBoxX, row1Y, totalsBoxWidth, totalsRowHeight * 2)
       .fill();
    doc.restore();

    // Row 3 (Total TTC): Slightly more visible
    doc.save();
    doc.fillColor('#FAF8F0')
       .opacity(0.45)
       .rect(totalsBoxX, row3Y, totalsBoxWidth, totalsRowHeight + 4)
       .fill();
    doc.restore();
  } else {
    doc.save();
    doc.fillColor('#FAF8F0')
       .opacity(0.35)
       .rect(totalsBoxX, row1Y, totalsBoxWidth, totalsRowHeight + 4)
       .fill();
    doc.restore();
  }

  // Draw outer border
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(0.8)
     .rect(totalsBoxX, totalsBoxTop, totalsBoxWidth, totalsBoxBottom - totalsBoxTop)
     .stroke();

  doc.restore();

  // ── TEXT (drawn AFTER backgrounds and borders) ──

  if (showTVA) {
    // Row 1: Total HT
    const textY1 = row1Y + 5;  // 5pt top padding
    doc.save();
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.GRAY_DARK)
       .text('Total HT', totalsBoxX + totalsPadLeft, textY1, {
         width: labelColWidth - totalsPadLeft,
         align: 'left',
         lineBreak: false,
       });
    doc.text(`${formatNumber(subtotal)} DH`, totalsBoxX + labelColWidth, textY1, {
      width: valueColWidth - totalsPadRight,
      align: 'right',
      lineBreak: false,
    });
    doc.restore();

    // Row 2: TVA
    const textY2 = row2Y + 5;
    doc.save();
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.GRAY_DARK)
       .text(`TVA (${Math.round(tvaRate * 100)}%)`, totalsBoxX + totalsPadLeft, textY2, {
         width: labelColWidth - totalsPadLeft,
         align: 'left',
         lineBreak: false,
       });
    doc.text(`${formatNumber(tvaAmount)} DH`, totalsBoxX + labelColWidth, textY2, {
      width: valueColWidth - totalsPadRight,
      align: 'right',
      lineBreak: false,
    });
    doc.restore();

    // Horizontal separator between TVA and Total TTC (drawn BEFORE text)
    doc.save();
    doc.strokeColor(COLORS.GOLD)
       .lineWidth(0.5)
       .moveTo(totalsBoxX, row3Y)
       .lineTo(totalsBoxX + totalsBoxWidth, row3Y)
       .stroke();
    doc.restore();

    // Row 3: Total TTC (bold, larger, brown color)
    const textY3 = row3Y + 5;
    doc.save();
    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.BROWN_DARK)
       .text('Total TTC', totalsBoxX + totalsPadLeft, textY3, {
         width: labelColWidth - totalsPadLeft,
         align: 'left',
         lineBreak: false,
       });
    doc.fillColor('#C41E1E')  // Red for TTC amount
       .text(`${formatNumber(totalTTC)} DH`, totalsBoxX + labelColWidth, textY3, {
         width: valueColWidth - totalsPadRight,
         align: 'right',
         lineBreak: false,
       });
    doc.restore();
  } else {
    // No TVA - just show total
    const textY1 = row1Y + 5;
    doc.save();
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.BROWN_DARK)
       .text('Total', totalsBoxX + totalsPadLeft, textY1, {
         width: labelColWidth - totalsPadLeft,
         align: 'left',
         lineBreak: false,
       });
    doc.text(`${formatNumber(subtotal)} DH`, totalsBoxX + labelColWidth, textY1, {
      width: valueColWidth - totalsPadRight,
      align: 'right',
      lineBreak: false,
    });
    doc.restore();

    // Note about TVA
    const noteY = row1Y + totalsRowHeight / 2 + 3;
    doc.save();
    doc.font('Helvetica-Oblique').fontSize(7).fillColor(COLORS.GRAY)
       .text('TVA non applicable', totalsBoxX + totalsPadLeft, noteY, {
         width: totalsBoxWidth - totalsPadLeft - totalsPadRight,
         align: 'center',
         lineBreak: false,
       });
    doc.restore();
  }

  const afterTableY = totalsBoxBottom;

  return { afterTableY, totalTTC };
}

/**
 * Draw signature section - two columns for vendor and client
 *
 * @param doc - PDFDocument instance
 * @param startY - Y position to start signature section
 */
export function drawSignatureSection(doc: PDFDocument, startY: number): void {
  const margin = 20 * MM;
  const boxWidth = 55 * MM;
  const boxHeight = 18 * MM;

  const y = startY;

  // Vendor signature (left)
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(8)
     .text('Cachet et signature du vendeur', margin, y);
  doc.restore();

  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(0.5)
     .dash(2, { space: 2 })
     .rect(margin, y + 3, boxWidth, boxHeight - 3)
     .stroke();
  doc.restore();

  // Client signature (right)
  const clientX = PAGE.WIDTH - margin - boxWidth;
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(8)
     .text('Cachet et signature du client', clientX, y);
  doc.restore();

  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(0.5)
     .dash(2, { space: 2 })
     .rect(clientX, y + 3, boxWidth, boxHeight - 3)
     .stroke();
  doc.restore();
}
