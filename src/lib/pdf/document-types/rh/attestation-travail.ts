/**
 * LE TATCHE BOIS - Attestation de Travail (Work Certificate) PDF Generator
 *
 * Generates work certificates in 4 languages (FR, EN, AR, ES)
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
  COMPANY,
} from '../../base-layout';
import { getRHTranslations, type RHLanguage } from '../../helpers/rh-translations';
import { formatDate, formatDateLong } from '../../helpers/format-utils';

type PDFDocument = PDFKit.PDFDocument;

const MM = 2.834645669;

// ────────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────

export interface AttestationTravailData {
  refNumber: string;
  employeeFullName: string;
  employeeCIN: string;
  birthDate: Date | string;
  birthPlace: string;
  hireDate: Date | string;
  position: string;
  department: string;
  isCurrentlyEmployed: boolean;
  endDate?: Date | string;
  issueDate: Date | string;
  issueCity: string;
  lang: RHLanguage;
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

export async function generateAttestationTravailPDF(data: AttestationTravailData): Promise<Buffer> {
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
      const header = drawHeader(doc, t.workCertificate, data.refNumber, formatDate(data.issueDate));

      // Main content area
      const margin = 25 * MM;
      let currentY = header.fieldsY + 10 * MM;

      // Title
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(14)
         .text(t.workCertificateTitle, 0, currentY, {
           width: PAGE.WIDTH,
           align: 'center',
         });
      doc.restore();

      currentY += 15 * MM;

      // Introductory text
      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(10)
         .text(t.certifyThat, margin, currentY, {
           width: PAGE.WIDTH - 2 * margin,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      currentY += 15 * MM;

      // Employee information box
      const boxWidth = PAGE.WIDTH - 2 * margin;
      const boxHeight = 65 * MM;

      doc.save();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.8)
         .rect(margin, currentY, boxWidth, boxHeight)
         .stroke();
      doc.restore();

      // Box content
      const padLeft = 5 * MM;
      let boxY = currentY + 5 * MM;

      // Employee name
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(12)
         .text(data.employeeFullName, margin + padLeft, boxY, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      boxY += 10 * MM;

      // Birth date and place
      const birthText = `${t.bornOn} ${formatDate(data.birthDate)} ${t.at} ${data.birthPlace}`;
      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(10)
         .text(birthText, margin + padLeft, boxY, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      boxY += 8 * MM;

      // CIN
      const cinText = `${t.cinNumber} ${data.employeeCIN}`;
      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(10)
         .text(cinText, margin + padLeft, boxY, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      boxY += 12 * MM;

      // Employment info
      const employmentText = `${t.employedSince} ${formatDate(data.hireDate)}`;
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(employmentText, margin + padLeft, boxY, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      boxY += 8 * MM;

      // Position
      const positionText = `${t.asPosition} ${data.position}`;
      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(10)
         .text(positionText, margin + padLeft, boxY, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      boxY += 8 * MM;

      // Department
      const deptText = `${t.inDepartment} ${data.department}`;
      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(10)
         .text(deptText, margin + padLeft, boxY, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      currentY += boxHeight + 10 * MM;

      // Employment status
      const statusText = data.isCurrentlyEmployed
        ? t.currentlyEmployed
        : `${t.leftCompanyOn} ${formatDate(data.endDate!)}`;

      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(statusText, margin, currentY, {
           width: PAGE.WIDTH - 2 * margin,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      currentY += 12 * MM;

      // Certificate purpose
      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica-Oblique')
         .fontSize(9)
         .text(t.certificateIssued, margin, currentY, {
           width: PAGE.WIDTH - 2 * margin,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      currentY += 15 * MM;

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

      // Signature section
      const sigBoxWidth = 55 * MM;
      const sigBoxHeight = 18 * MM;
      const sigX = PAGE.WIDTH - margin - sigBoxWidth;

      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(8)
         .text(t.employerSignature, sigX, currentY);
      doc.restore();

      doc.save();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.5)
         .dash(2, { space: 2 })
         .rect(sigX, currentY + 3, sigBoxWidth, sigBoxHeight - 3)
         .stroke();
      doc.restore();

      // Draw footer and border
      drawFooter(doc);
      drawBorderFrame(doc);

      doc.end();

    } catch (error) {
      console.error('Error generating attestation travail PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export default generateAttestationTravailPDF;
