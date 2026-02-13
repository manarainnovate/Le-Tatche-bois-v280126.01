/**
 * LE TATCHE BOIS - Attestation de Salaire (Salary Certificate) PDF Generator
 *
 * Generates salary certificates in 4 languages (FR, EN, AR, ES)
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
import { amountInFrench } from '../../helpers/french-numbers';

type PDFDocument = PDFKit.PDFDocument;

const MM = 2.834645669;

// ────────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────

export interface AttestationSalaireData {
  refNumber: string;
  employeeFullName: string;
  employeeCIN: string;
  birthDate: Date | string;
  birthPlace: string;
  hireDate: Date | string;
  position: string;
  department: string;
  cnssNumber: string;
  grossMonthlySalary: number;
  netMonthlySalary: number;
  isCurrentlyEmployed: boolean;
  endDate?: Date | string;
  issueDate: Date | string;
  issueCity: string;
  lang: RHLanguage;
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

export async function generateAttestationSalairePDF(data: AttestationSalaireData): Promise<Buffer> {
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
      const header = drawHeader(doc, t.salaryCertificate, data.refNumber, formatDate(data.issueDate));

      // Main content area
      const margin = 25 * MM;
      let currentY = header.fieldsY + 10 * MM;

      // Title
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(14)
         .text(t.salaryCertificateTitle, 0, currentY, {
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
      const boxHeight = 75 * MM;

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

      boxY += 8 * MM;

      // CNSS Number
      const cnssText = `${t.cnssNumber} ${data.cnssNumber}`;
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(cnssText, margin + padLeft, boxY, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      boxY += 12 * MM;

      // Employment info
      const employmentText = `${t.employedSince} ${formatDate(data.hireDate)} ${t.asPosition} ${data.position}`;
      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(10)
         .text(employmentText, margin + padLeft, boxY, {
           width: boxWidth - 2 * padLeft,
           align: isRTL ? 'right' : 'left',
         });
      doc.restore();

      boxY += 12 * MM;

      // Salary info box (nested)
      const salaryBoxY = boxY;
      const salaryBoxHeight = 18 * MM;

      doc.save();
      doc.fillColor('#FAF8F0')
         .opacity(0.5)
         .rect(margin + padLeft, salaryBoxY, boxWidth - 2 * padLeft, salaryBoxHeight)
         .fill();
      doc.restore();

      doc.save();
      doc.strokeColor(COLORS.GOLD_DARK)
         .lineWidth(0.5)
         .rect(margin + padLeft, salaryBoxY, boxWidth - 2 * padLeft, salaryBoxHeight)
         .stroke();
      doc.restore();

      let salaryY = salaryBoxY + 3 * MM;

      // Gross salary
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(t.grossSalary, margin + padLeft + 3 * MM, salaryY, {
           width: (boxWidth - 2 * padLeft) / 2,
           align: isRTL ? 'right' : 'left',
         });
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`${formatNumber(data.grossMonthlySalary)} ${t.currency}`, margin + padLeft + (boxWidth - 2 * padLeft) / 2, salaryY, {
           width: (boxWidth - 2 * padLeft) / 2 - 6 * MM,
           align: 'right',
         });
      doc.restore();

      salaryY += 7 * MM;

      // Net salary
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(t.netSalary, margin + padLeft + 3 * MM, salaryY, {
           width: (boxWidth - 2 * padLeft) / 2,
           align: isRTL ? 'right' : 'left',
         });
      doc.fillColor('#C41E1E')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(`${formatNumber(data.netMonthlySalary)} ${t.currency}`, margin + padLeft + (boxWidth - 2 * padLeft) / 2, salaryY, {
           width: (boxWidth - 2 * padLeft) / 2 - 6 * MM,
           align: 'right',
         });
      doc.restore();

      currentY += boxHeight + 10 * MM;

      // Amount in words box (French only for legal compliance)
      if (data.lang === 'fr') {
        const wordsBoxHeight = 10 * MM;

        doc.save();
        doc.strokeColor(COLORS.GOLD)
           .lineWidth(1.0)
           .rect(margin, currentY, boxWidth, wordsBoxHeight)
           .stroke();
        doc.restore();

        const line1Y = currentY + 3 * MM;
        doc.save();
        doc.fillColor(COLORS.BROWN_DARK)
           .font('Helvetica-Bold')
           .fontSize(7.5)
           .text(t.salaryInWords + ' :', 0, line1Y, {
             width: PAGE.WIDTH,
             align: 'center',
           });
        doc.restore();

        const line2Y = currentY + 7 * MM;
        const amountText = `*** ${amountInFrench(data.netMonthlySalary)} ***`;
        doc.save();
        doc.fillColor(COLORS.BROWN_DARK)
           .font('Helvetica-Bold')
           .fontSize(7.5)
           .text(amountText, 0, line2Y, {
             width: PAGE.WIDTH,
             align: 'center',
           });
        doc.restore();

        currentY += wordsBoxHeight + 10 * MM;
      } else {
        currentY += 5 * MM;
      }

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
      console.error('Error generating attestation salaire PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export default generateAttestationSalairePDF;
