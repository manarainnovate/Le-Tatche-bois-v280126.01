/**
 * LE TATCHE BOIS - Ordre de Mission (Mission Order) PDF Generator
 *
 * Generates mission orders in 4 languages (FR, EN, AR, ES)
 */

import PDFDoc from 'pdfkit';
import {
  drawWoodBackground,
  drawCenterWatermark,
  drawBorderFrame,
  drawHeader,
  drawFooter,
  COLORS,
  PAGE,
} from '../../base-layout';
import { getRHTranslations, type RHLanguage } from '../../helpers/rh-translations';
import { formatDate, formatDateLong, formatNumber } from '../../helpers/format-utils';

type PDFDocument = PDFKit.PDFDocument;

const MM = 2.834645669;

// ────────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────

export interface OrdreMissionData {
  refNumber: string;
  employeeFullName: string;
  employeeCIN: string;
  position: string;
  department: string;
  destination: string;
  departureDate: Date | string;
  returnDate: Date | string;
  missionPurpose: string;
  transportMode: 'car' | 'train' | 'plane' | 'bus' | 'other';
  accommodation: string;
  estimatedBudget: number;
  notes?: string;
  approvalStatus: 'approved' | 'pending';
  issueDate: Date | string;
  issueCity: string;
  lang: RHLanguage;
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

export async function generateOrdreMissionPDF(data: OrdreMissionData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const t = getRHTranslations(data.lang);
      const isRTL = data.lang === 'ar';

      // Create PDF document
      const doc = new PDFDoc({
        size: 'A4',
        margin: 0,
        bufferPages: true,
        autoFirstPage: true,
      });

      // Collect PDF data
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Draw base layout
      drawWoodBackground(doc);
      drawCenterWatermark(doc, 0.06);

      // Draw header
      const header = drawHeader(doc, t.missionOrder, data.refNumber, formatDate(data.issueDate));

      // Main content area
      const margin = 25 * MM;
      let currentY = header.fieldsY + 10 * MM;

      // Title
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(14)
         .text(t.missionOrderTitle, 0, currentY, {
           width: PAGE.WIDTH,
           align: 'center',
         });
      doc.restore();

      currentY += 15 * MM;

      // Employee information box
      const boxWidth = PAGE.WIDTH - 2 * margin;
      const employeeBoxHeight = 25 * MM;

      // Employee box header
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .rect(margin, currentY, boxWidth, 6 * MM)
         .fill();
      doc.fillColor(COLORS.WHITE)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(t.employeeInfo, margin, currentY + 2 * MM, { width: boxWidth, align: 'center' });
      doc.restore();

      currentY += 6 * MM;

      // Employee box content
      doc.save();
      doc.fillColor('#FAF8F0')
         .opacity(0.4)
         .rect(margin, currentY, boxWidth, employeeBoxHeight - 6 * MM)
         .fill();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.8)
         .rect(margin, currentY, boxWidth, employeeBoxHeight - 6 * MM)
         .stroke();
      doc.restore();

      const padLeft = 5 * MM;
      let boxY = currentY + 3 * MM;
      const colWidth = boxWidth / 2;

      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(data.employeeFullName, margin + padLeft, boxY, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      boxY += 8 * MM;

      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(9);

      const positionLabel = data.lang === 'fr' ? 'Poste' : data.lang === 'en' ? 'Position' : data.lang === 'ar' ? 'الوظيفة' : 'Puesto';
      doc.text(`${positionLabel} : ${data.position}`, margin + padLeft, boxY);
      doc.text(`${t.cinNumber} ${data.employeeCIN}`, margin + colWidth + padLeft, boxY);

      boxY += 6 * MM;

      doc.text(`${t.department} : ${data.department}`, margin + padLeft, boxY);

      doc.restore();

      currentY += employeeBoxHeight + 5 * MM;

      // Mission details box
      const missionBoxHeight = 50 * MM;

      // Mission box header
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .rect(margin, currentY, boxWidth, 6 * MM)
         .fill();
      doc.fillColor(COLORS.WHITE)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(t.missionDetails, margin, currentY + 2 * MM, { width: boxWidth, align: 'center' });
      doc.restore();

      currentY += 6 * MM;

      // Mission box content
      doc.save();
      doc.fillColor('#FAF8F0')
         .opacity(0.4)
         .rect(margin, currentY, boxWidth, missionBoxHeight - 6 * MM)
         .fill();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.8)
         .rect(margin, currentY, boxWidth, missionBoxHeight - 6 * MM)
         .stroke();
      doc.restore();

      boxY = currentY + 3 * MM;

      // Destination
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`${t.destination} :`, margin + padLeft, boxY);
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(10)
         .text(data.destination, margin + padLeft + 30 * MM, boxY);
      doc.restore();

      boxY += 8 * MM;

      // Dates
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(`${t.departureDate} :`, margin + padLeft, boxY);
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(9)
         .text(formatDate(data.departureDate), margin + padLeft + 30 * MM, boxY);

      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .text(`${t.returnDate} :`, margin + colWidth + padLeft, boxY);
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .text(formatDate(data.returnDate), margin + colWidth + padLeft + 30 * MM, boxY);
      doc.restore();

      boxY += 8 * MM;

      // Mission purpose
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(`${t.missionPurpose} :`, margin + padLeft, boxY);
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(9)
         .text(data.missionPurpose, margin + padLeft, boxY + 5 * MM, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      boxY += 15 * MM;

      // Transport and accommodation
      const transportText = t.transportModes[data.transportMode];

      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(`${t.transportMode} :`, margin + padLeft, boxY);
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(9)
         .text(transportText, margin + padLeft + 30 * MM, boxY);

      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .text(`${t.accommodation} :`, margin + colWidth + padLeft, boxY);
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .text(data.accommodation, margin + colWidth + padLeft + 30 * MM, boxY);
      doc.restore();

      boxY += 8 * MM;

      // Budget
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(`${t.estimatedBudget} :`, margin + padLeft, boxY);
      doc.fillColor('#C41E1E')
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`${formatNumber(data.estimatedBudget)} ${t.currency}`, margin + padLeft + 30 * MM, boxY);
      doc.restore();

      currentY += missionBoxHeight + 5 * MM;

      // Notes section (if provided)
      if (data.notes) {
        const notesBoxHeight = 15 * MM;

        doc.save();
        doc.strokeColor(COLORS.GOLD)
           .lineWidth(0.8)
           .rect(margin, currentY, boxWidth, notesBoxHeight)
           .stroke();

        doc.fillColor(COLORS.BROWN_DARK)
           .font('Helvetica-Bold')
           .fontSize(9)
           .text(`${t.notes} :`, margin + padLeft, currentY + 2 * MM);

        doc.fillColor(COLORS.GRAY_DARK)
           .font('Helvetica')
           .fontSize(8.5)
           .text(data.notes, margin + padLeft, currentY + 7 * MM, {
             width: boxWidth - 2 * padLeft,
             align: isRTL ? 'right' : 'left',
           });
        doc.restore();

        currentY += notesBoxHeight + 5 * MM;
      } else {
        currentY += 2 * MM;
      }

      // Approval status
      const statusText = data.approvalStatus === 'approved' ? t.approved : t.pending;
      const statusColor = data.approvalStatus === 'approved' ? '#2D7A3E' : '#C4973B';

      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(`${t.approvalStatus} :`, margin, currentY);
      doc.fillColor(statusColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(statusText.toUpperCase(), margin + 40 * MM, currentY);
      doc.restore();

      currentY += 12 * MM;

      // Location and date
      const locationText = `${t.madeAt} ${data.issueCity}, ${t.on} ${formatDateLong(data.issueDate)}`;
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica')
         .fontSize(9)
         .text(locationText, margin, currentY, {
           width: PAGE.WIDTH - 2 * margin,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      currentY += 15 * MM;

      // Signature section - two columns
      const sigBoxWidth = 55 * MM;
      const sigBoxHeight = 18 * MM;

      // Employee signature (left)
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(8)
         .text(t.employeeSignature, margin, currentY);
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.5)
         .dash(2, { space: 2 })
         .rect(margin, currentY + 3, sigBoxWidth, sigBoxHeight - 3)
         .stroke();
      doc.restore();

      // Employer signature (right)
      const employerX = PAGE.WIDTH - margin - sigBoxWidth;

      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(8)
         .text(t.employerSignature, employerX, currentY);
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.5)
         .dash(2, { space: 2 })
         .rect(employerX, currentY + 3, sigBoxWidth, sigBoxHeight - 3)
         .stroke();
      doc.restore();

      // Draw footer and border
      drawFooter(doc);
      drawBorderFrame(doc);

      doc.end();

    } catch (error) {
      console.error('Error generating ordre de mission PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export default generateOrdreMissionPDF;
