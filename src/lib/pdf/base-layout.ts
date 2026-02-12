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
  tel1: '0687 44 184',
  tel2: '0698 01 34 68',
  website: 'www.letatchebois.com',
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
 * Draw ornate carved wood frame border
 * 4mm strips on all four sides with wood texture
 */
export function drawBorderFrame(doc: PDFDocument): void {
  const thickness = 4 * MM;  // 4mm frame thickness

  console.log('[PDF] drawBorderFrame - Starting border frame drawing');
  console.log('[PDF] Assets base path:', ASSETS_BASE);
  console.log('[PDF] Frame file paths:', {
    top: ASSETS.frameTop,
    bottom: ASSETS.frameBottom,
    left: ASSETS.frameLeft,
    right: ASSETS.frameRight,
  });

  try {
    // Top strip
    if (fs.existsSync(ASSETS.frameTop)) {
      console.log('[PDF] ✓ Drawing frame_top.png');
      doc.save();
      doc.image(ASSETS.frameTop, 0, 0, {
        width: PAGE.WIDTH,
        height: thickness,
      });
      doc.restore();
    } else {
      console.error('[PDF] ✗ frame_top.png not found:', ASSETS.frameTop);
    }

    // Bottom strip
    if (fs.existsSync(ASSETS.frameBottom)) {
      console.log('[PDF] ✓ Drawing frame_bottom.png');
      doc.save();
      doc.image(ASSETS.frameBottom, 0, PAGE.HEIGHT - thickness, {
        width: PAGE.WIDTH,
        height: thickness,
      });
      doc.restore();
    } else {
      console.error('[PDF] ✗ frame_bottom.png not found:', ASSETS.frameBottom);
    }

    // Left strip
    if (fs.existsSync(ASSETS.frameLeft)) {
      console.log('[PDF] ✓ Drawing frame_left.png');
      doc.save();
      doc.image(ASSETS.frameLeft, 0, 0, {
        width: thickness,
        height: PAGE.HEIGHT,
      });
      doc.restore();
    } else {
      console.error('[PDF] ✗ frame_left.png not found:', ASSETS.frameLeft);
    }

    // Right strip
    if (fs.existsSync(ASSETS.frameRight)) {
      console.log('[PDF] ✓ Drawing frame_right.png');
      doc.save();
      doc.image(ASSETS.frameRight, PAGE.WIDTH - thickness, 0, {
        width: thickness,
        height: PAGE.HEIGHT,
      });
      doc.restore();
    } else {
      console.error('[PDF] ✗ frame_right.png not found:', ASSETS.frameRight);
    }

    console.log('[PDF] ✅ Border frame drawing completed successfully');
  } catch (error) {
    console.error('[PDF] ❌ Failed to draw border frame:', error);
    if (error instanceof Error) {
      console.error('[PDF] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
  }
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
 * @returns Header positioning info for subsequent content
 */
export function drawHeader(
  doc: PDFDocument,
  docType?: string,
  docNumber?: string,
  docDate?: string
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

  // ── Company name and info (right of logo) ──
  const textX = 5 * MM + 40 * MM;
  const nameY = headerTop + 12 * MM;

  // Company name
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(22)
     .text('LE TATCHE BOIS', textX, nameY);
  doc.restore();

  // Type + Activity on same line
  const typeY = nameY + 15;
  doc.save();
  doc.fillColor(COLORS.GOLD_DARK)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(COMPANY.type, textX, typeY, { continued: true });

  doc.fillColor(COLORS.BROWN_MEDIUM)
     .font('Helvetica')
     .fontSize(8)
     .text(`  •  ${COMPANY.activity}`, { continued: false });
  doc.restore();

  // Contact info below - FIXED: explicit positions with lineBreak: false
  const contactY = nameY + 30;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8.5)
     .text(`Tél : ${COMPANY.tel1}  /  ${COMPANY.tel2}`, textX, contactY, { lineBreak: false });

  doc.text(`Email : ${COMPANY.email}`, textX, contactY + 11, { lineBreak: false });
  doc.restore();

  // ── Address (right aligned) ──
  const rightX = PAGE.WIDTH - margin;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(9)
     .text(COMPANY.address, rightX - 200, contactY, { width: 200, align: 'right' })
     .text(COMPANY.city, rightX - 200, contactY + 11, { width: 200, align: 'right' });
  doc.restore();

  // ── Bottom gold gradient line (separator) ──
  const separatorY = headerBottom + 1 * MM;
  drawGoldGradientBar(doc, 0, separatorY, PAGE.WIDTH, 3 * MM);

  // ── Document type title (if specified) ──
  if (docType) {
    const titleY = headerBottom + 6 * MM;

    // Build title text
    let titleText = docType.toUpperCase();
    if (docNumber) {
      titleText += `  N° : ${docNumber}`;
    }

    // Auto-scale font if needed (max 11.5pt, min 8pt)
    let fontSize = 11.5;
    doc.font('Helvetica-Bold').fontSize(fontSize);
    while (fontSize > 8 && doc.widthOfString(titleText) > PAGE.WIDTH - 2 * margin) {
      fontSize -= 0.5;
      doc.fontSize(fontSize);
    }

    const leftX = margin;

    doc.save();
    doc.fillColor(COLORS.BROWN_DARK)
       .font('Helvetica-Bold')
       .fontSize(fontSize)
       .text(titleText, leftX, titleY);
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
 * Draw the professional footer with legal info
 */
export function drawFooter(doc: PDFDocument): void {
  const margin = 25 * MM;
  const footerHeight = 22 * MM;
  const footerTop = PAGE.HEIGHT - footerHeight;

  // ── Gold gradient bar (separator at top of footer) ──
  drawGoldGradientBar(doc, 0, footerTop, PAGE.WIDTH, 3 * MM);

  // ── Footer background (very light beige with transparency) ──
  doc.save();
  doc.fillColor('#FFFCF0')
     .opacity(0.6)
     .rect(0, footerTop, PAGE.WIDTH, footerHeight)
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
  const boxHeight = 28 * MM;
  const boxX = PAGE.WIDTH - margin - boxWidth;
  const boxY = topY;

  // Box border only - clear background
  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(0.8)
     .rect(boxX, boxY, boxWidth, boxHeight)
     .stroke();
  doc.restore();

  // "Client :" label
  doc.save();
  doc.fillColor(COLORS.BROWN_DARK)
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text('Client :', boxX + 3 * MM, boxY + 5 * MM);
  doc.restore();

  // Client name
  const textX = boxX + 3 * MM;
  let textY = boxY + 12 * MM;

  doc.save();
  doc.fillColor(COLORS.BLACK)
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text(client.name || '[Nom du client]', textX, textY, { width: boxWidth - 6 * MM });
  doc.restore();

  // Address
  textY += 11;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8)
     .text(client.address || '[Adresse du client]', textX, textY, { width: boxWidth - 6 * MM });
  doc.restore();

  // City
  textY += 10;
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8)
     .text(client.city || '[Ville]', textX, textY, { width: boxWidth - 6 * MM });
  doc.restore();

  // ICE (if provided)
  if (client.ice) {
    textY += 10;
    doc.save();
    doc.fillColor(COLORS.BROWN_DARK)
       .font('Helvetica-Bold')
       .fontSize(7.5)
       .text(`ICE : ${client.ice}`, textX, textY, { width: boxWidth - 6 * MM });
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
 * Draw the items table with totals
 * Handles pagination if items overflow
 *
 * @param doc - PDFDocument instance
 * @param startY - Y position to start table
 * @param items - Array of items to display
 * @param tvaRate - TVA rate (default 0.20 for 20%)
 * @param showTVA - Whether to show TVA calculations
 * @returns Table result with positioning and totals
 */
export function drawItemsTable(
  doc: PDFDocument,
  startY: number,
  items: TableItem[],
  tvaRate: number = 0.20,
  showTVA: boolean = true
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
  let currentY = headerY + headerRowHeight;

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

    // Row borders
    doc.save();
    doc.strokeColor(COLORS.GOLD)
       .lineWidth(0.4)
       .rect(margin, rowY, tableWidth, dataRowHeight)
       .stroke();
    doc.restore();

    // Row text
    const textY = rowY + (dataRowHeight / 2) - 2.5;
    xPos = margin;

    doc.save();
    doc.fillColor(COLORS.BROWN_DARK)
       .font('Helvetica')
       .fontSize(7.5);

    // N° (centered)
    doc.text(`${i + 1}`, xPos, textY, { width: colWidths.num, align: 'center' });
    xPos += colWidths.num;

    // Description (left aligned with padding)
    doc.text(item.desc, xPos + 2, textY, { width: colWidths.desc - 4, align: 'left' });
    xPos += colWidths.desc;

    // Unit (centered)
    doc.text(item.unit || 'U', xPos, textY, { width: colWidths.unit, align: 'center' });
    xPos += colWidths.unit;

    // Quantity (centered)
    doc.text(`${item.qty}`, xPos, textY, { width: colWidths.qty, align: 'center' });
    xPos += colWidths.qty;

    // Unit price (right aligned)
    doc.text(formatNumber(item.price), xPos, textY, { width: colWidths.puHT - 2, align: 'right' });
    xPos += colWidths.puHT;

    // Total (right aligned)
    doc.text(formatNumber(total), xPos, textY, { width: colWidths.totalHT - 2, align: 'right' });

    doc.restore();

    currentY += dataRowHeight;
  }

  // ── Draw totals section ──
  const totalsY = currentY + 5 * MM;
  const totalsX = PAGE.WIDTH - margin - 60 * MM;
  const totalsWidth = 60 * MM;

  const tvaAmount = showTVA ? subtotal * tvaRate : 0;
  const totalTTC = subtotal + tvaAmount;

  // Totals box background
  const boxHeight = showTVA ? 25 * MM : 15 * MM;
  doc.save();
  doc.fillColor('#FFFEF8')
     .opacity(0.5)
     .roundedRect(totalsX, totalsY, totalsWidth, boxHeight, 2)
     .fill();
  doc.restore();

  // Totals box border
  doc.save();
  doc.strokeColor(COLORS.GOLD)
     .lineWidth(0.5)
     .roundedRect(totalsX, totalsY, totalsWidth, boxHeight, 2)
     .stroke();
  doc.restore();

  const labelX = totalsX + 3 * MM;
  const valueX = totalsX + totalsWidth - 3 * MM;
  let rowY = totalsY + 4 * MM;

  // Total HT
  doc.save();
  doc.fillColor(COLORS.GRAY_DARK)
     .font('Helvetica')
     .fontSize(8)
     .text('Total HT', labelX, rowY);

  doc.text(`${formatNumber(subtotal)} DH`, valueX - 50, rowY, {
    width: 50,
    align: 'right',
  });
  doc.restore();

  if (showTVA) {
    rowY += 9;
    doc.save();
    doc.fillColor(COLORS.GRAY_DARK)
       .font('Helvetica')
       .fontSize(8)
       .text(`TVA (${Math.round(tvaRate * 100)}%)`, labelX, rowY);

    doc.text(`${formatNumber(tvaAmount)} DH`, valueX - 50, rowY, {
      width: 50,
      align: 'right',
    });
    doc.restore();

    // Separator line
    rowY += 4;
    doc.save();
    doc.strokeColor(COLORS.GOLD)
       .lineWidth(0.5)
       .moveTo(labelX, rowY)
       .lineTo(valueX, rowY)
       .stroke();
    doc.restore();

    // Total TTC
    rowY += 9;
    doc.save();
    doc.fillColor(COLORS.BROWN_DARK)
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('Total TTC', labelX, rowY);

    // Wider width (120pt) to prevent "DH" from wrapping to next line
    doc.text(`${formatNumber(totalTTC)} DH`, valueX - 120, rowY, {
      width: 120,
      align: 'right',
    });
    doc.restore();
  } else {
    // No TVA - show note
    rowY += 4;
    doc.save();
    doc.strokeColor(COLORS.GOLD)
       .moveTo(labelX, rowY)
       .lineTo(valueX, rowY)
       .stroke();
    doc.restore();

    rowY += 9;
    doc.save();
    doc.fillColor(COLORS.GRAY)
       .font('Helvetica-Oblique')
       .fontSize(7.5)
       .text('TVA non applicable', labelX, rowY);
    doc.restore();
  }

  const afterTableY = totalsY + boxHeight + 3 * MM;

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
