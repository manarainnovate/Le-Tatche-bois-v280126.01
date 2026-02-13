/**
 * LE TATCHE BOIS - Bulletin de Paie (Payslip) PDF Generator
 *
 * Generates payslips in 4 languages (FR, EN, AR, ES) with Moroccan social charges
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
import { formatDate, formatNumber } from '../../helpers/format-utils';

type PDFDocument = PDFKit.PDFDocument;

const MM = 2.834645669;

// ────────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────

export interface BonusItem {
  description: string;
  amount: number;
}

export interface DeductionItem {
  description: string;
  amount: number;
}

export interface BulletinPaieData {
  refNumber: string;
  employeeFullName: string;
  employeeCIN: string;
  position: string;
  department: string;
  cnssNumber: string;
  payPeriodStart: Date | string;
  payPeriodEnd: Date | string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  bonuses: BonusItem[];
  customDeductions: DeductionItem[];
  workDays: number;
  paidLeave: number;
  sickLeave: number;
  issueDate: Date | string;
  lang: RHLanguage;
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

function calculateMoroccanPayslip(data: BulletinPaieData) {
  // Earnings
  const overtime = data.overtimeHours * data.overtimeRate;
  const totalBonuses = data.bonuses.reduce((sum, b) => sum + b.amount, 0);
  const grossPay = data.baseSalary + overtime + totalBonuses;

  // Employee deductions (Moroccan rates)
  const cnssEmployee = grossPay * 0.0448;  // 4.48%
  const amoEmployee = grossPay * 0.0226;   // 2.26%
  const totalCustomDeductions = data.customDeductions.reduce((sum, d) => sum + d.amount, 0);
  const totalDeductions = cnssEmployee + amoEmployee + totalCustomDeductions;

  // Net pay
  const netPay = grossPay - totalDeductions;

  // Employer charges
  const cnssEmployer = grossPay * 0.0898;  // 8.98%
  const amoEmployer = grossPay * 0.0411;   // 4.11%
  const taxeProfessionnelle = grossPay * 0.016;  // 1.6%
  const totalEmployerCharges = cnssEmployer + amoEmployer + taxeProfessionnelle;

  return {
    overtime,
    totalBonuses,
    grossPay,
    cnssEmployee,
    amoEmployee,
    totalCustomDeductions,
    totalDeductions,
    netPay,
    cnssEmployer,
    amoEmployer,
    taxeProfessionnelle,
    totalEmployerCharges,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

export async function generateBulletinPaiePDF(data: BulletinPaieData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const t = getRHTranslations(data.lang);
      const isRTL = data.lang === 'ar';
      const calc = calculateMoroccanPayslip(data);

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
      const header = drawHeader(doc, t.payslip, data.refNumber, formatDate(data.issueDate));

      // Main content area
      const margin = 20 * MM;
      let currentY = header.fieldsY + 5 * MM;

      // Employee info box
      const infoBoxHeight = 20 * MM;
      const infoBoxWidth = PAGE.WIDTH - 2 * margin;

      doc.save();
      doc.fillColor('#FAF8F0')
         .opacity(0.4)
         .rect(margin, currentY, infoBoxWidth, infoBoxHeight)
         .fill();
      doc.restore();

      doc.save();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.8)
         .rect(margin, currentY, infoBoxWidth, infoBoxHeight)
         .stroke();
      doc.restore();

      const infoY = currentY + 3 * MM;
      const colWidth = infoBoxWidth / 2;

      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(data.employeeFullName, margin + 3 * MM, infoY);

      const positionLabel = data.lang === 'fr' ? 'Poste' : data.lang === 'en' ? 'Position' : data.lang === 'ar' ? 'الوظيفة' : 'Puesto';
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(8.5)
         .text(`${positionLabel} : ${data.position}`, margin + 3 * MM, infoY + 6 * MM)
         .text(`${t.department} : ${data.department}`, margin + 3 * MM, infoY + 11 * MM);

      doc.text(`${t.cinNumber} ${data.employeeCIN}`, margin + colWidth + 3 * MM, infoY + 6 * MM)
         .text(`${t.cnssNumber} ${data.cnssNumber}`, margin + colWidth + 3 * MM, infoY + 11 * MM);
      doc.restore();

      currentY += infoBoxHeight + 3 * MM;

      // Pay period
      const periodText = `${t.payPeriod} : ${formatDate(data.payPeriodStart)} - ${formatDate(data.payPeriodEnd)}`;
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(periodText, margin, currentY);
      doc.restore();

      currentY += 8 * MM;

      // Work days info
      const daysText = `${t.workDays} : ${data.workDays}  |  ${t.paidLeave} : ${data.paidLeave}  |  ${t.sickLeave} : ${data.sickLeave}`;
      doc.save();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(8)
         .text(daysText, margin, currentY);
      doc.restore();

      currentY += 10 * MM;

      // Two-column layout for earnings and deductions
      const columnWidth = (PAGE.WIDTH - 2 * margin - 5 * MM) / 2;
      const leftColX = margin;
      const rightColX = margin + columnWidth + 5 * MM;
      const rowHeight = 6 * MM;

      // Left column: EARNINGS
      let leftY = currentY;

      // Earnings header
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .rect(leftColX, leftY, columnWidth, 6 * MM)
         .fill();
      doc.fillColor(COLORS.WHITE)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(t.earnings, leftColX, leftY + 2 * MM, { width: columnWidth, align: 'center' });
      doc.restore();

      leftY += 6 * MM;

      // Base salary
      doc.save();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.5)
         .rect(leftColX, leftY, columnWidth, rowHeight)
         .stroke();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica')
         .fontSize(8.5)
         .text(t.baseSalary, leftColX + 2 * MM, leftY + 1.5 * MM, { width: columnWidth * 0.6 });
      doc.text(`${formatNumber(data.baseSalary)} ${t.currency}`, leftColX + columnWidth * 0.6, leftY + 1.5 * MM, { width: columnWidth * 0.4 - 4 * MM, align: 'right' });
      doc.restore();

      leftY += rowHeight;

      // Overtime
      if (data.overtimeHours > 0) {
        doc.save();
        doc.strokeColor(COLORS.GOLD)
           .lineWidth(0.5)
           .rect(leftColX, leftY, columnWidth, rowHeight)
           .stroke();
        doc.fillColor(COLORS.GRAY_DARK)
           .font('Helvetica')
           .fontSize(8)
           .text(`${t.overtime} (${data.overtimeHours}h)`, leftColX + 2 * MM, leftY + 1.5 * MM, { width: columnWidth * 0.6 });
        doc.text(`${formatNumber(calc.overtime)} ${t.currency}`, leftColX + columnWidth * 0.6, leftY + 1.5 * MM, { width: columnWidth * 0.4 - 4 * MM, align: 'right' });
        doc.restore();

        leftY += rowHeight;
      }

      // Bonuses
      for (const bonus of data.bonuses) {
        doc.save();
        doc.strokeColor(COLORS.GOLD)
           .lineWidth(0.5)
           .rect(leftColX, leftY, columnWidth, rowHeight)
           .stroke();
        doc.fillColor(COLORS.GRAY_DARK)
           .font('Helvetica')
           .fontSize(8)
           .text(bonus.description, leftColX + 2 * MM, leftY + 1.5 * MM, { width: columnWidth * 0.6 });
        doc.text(`${formatNumber(bonus.amount)} ${t.currency}`, leftColX + columnWidth * 0.6, leftY + 1.5 * MM, { width: columnWidth * 0.4 - 4 * MM, align: 'right' });
        doc.restore();

        leftY += rowHeight;
      }

      // Gross pay total
      doc.save();
      doc.fillColor('#F5EDE0')
         .opacity(0.6)
         .rect(leftColX, leftY, columnWidth, rowHeight)
         .fill();
      doc.strokeColor(COLORS.GOLD_DARK)
         .lineWidth(1.0)
         .rect(leftColX, leftY, columnWidth, rowHeight)
         .stroke();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(t.grossPay, leftColX + 2 * MM, leftY + 1.5 * MM, { width: columnWidth * 0.6 });
      doc.text(`${formatNumber(calc.grossPay)} ${t.currency}`, leftColX + columnWidth * 0.6, leftY + 1.5 * MM, { width: columnWidth * 0.4 - 4 * MM, align: 'right' });
      doc.restore();

      // Right column: DEDUCTIONS
      let rightY = currentY;

      // Deductions header
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .rect(rightColX, rightY, columnWidth, 6 * MM)
         .fill();
      doc.fillColor(COLORS.WHITE)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(t.deductions, rightColX, rightY + 2 * MM, { width: columnWidth, align: 'center' });
      doc.restore();

      rightY += 6 * MM;

      // CNSS
      doc.save();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.5)
         .rect(rightColX, rightY, columnWidth, rowHeight)
         .stroke();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica')
         .fontSize(8.5)
         .text(t.cnssDeduction, rightColX + 2 * MM, rightY + 1.5 * MM, { width: columnWidth * 0.6 });
      doc.text(`${formatNumber(calc.cnssEmployee)} ${t.currency}`, rightColX + columnWidth * 0.6, rightY + 1.5 * MM, { width: columnWidth * 0.4 - 4 * MM, align: 'right' });
      doc.restore();

      rightY += rowHeight;

      // AMO
      doc.save();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.5)
         .rect(rightColX, rightY, columnWidth, rowHeight)
         .stroke();
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(8)
         .text(t.amoDeduction, rightColX + 2 * MM, rightY + 1.5 * MM, { width: columnWidth * 0.6 });
      doc.text(`${formatNumber(calc.amoEmployee)} ${t.currency}`, rightColX + columnWidth * 0.6, rightY + 1.5 * MM, { width: columnWidth * 0.4 - 4 * MM, align: 'right' });
      doc.restore();

      rightY += rowHeight;

      // Custom deductions
      for (const deduction of data.customDeductions) {
        doc.save();
        doc.strokeColor(COLORS.GOLD)
           .lineWidth(0.5)
           .rect(rightColX, rightY, columnWidth, rowHeight)
           .stroke();
        doc.fillColor(COLORS.GRAY_DARK)
           .font('Helvetica')
           .fontSize(8)
           .text(deduction.description, rightColX + 2 * MM, rightY + 1.5 * MM, { width: columnWidth * 0.6 });
        doc.text(`${formatNumber(deduction.amount)} ${t.currency}`, rightColX + columnWidth * 0.6, rightY + 1.5 * MM, { width: columnWidth * 0.4 - 4 * MM, align: 'right' });
        doc.restore();

        rightY += rowHeight;
      }

      // Total deductions
      doc.save();
      doc.fillColor('#F5EDE0')
         .opacity(0.6)
         .rect(rightColX, rightY, columnWidth, rowHeight)
         .fill();
      doc.strokeColor(COLORS.GOLD_DARK)
         .lineWidth(1.0)
         .rect(rightColX, rightY, columnWidth, rowHeight)
         .stroke();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(t.totalDeductions, rightColX + 2 * MM, rightY + 1.5 * MM, { width: columnWidth * 0.6 });
      doc.text(`${formatNumber(calc.totalDeductions)} ${t.currency}`, rightColX + columnWidth * 0.6, rightY + 1.5 * MM, { width: columnWidth * 0.4 - 4 * MM, align: 'right' });
      doc.restore();

      // Net pay box (full width)
      currentY = Math.max(leftY, rightY) + 8 * MM;

      const netBoxHeight = 10 * MM;

      doc.save();
      doc.fillColor('#C4973B')
         .opacity(0.2)
         .rect(margin, currentY, infoBoxWidth, netBoxHeight)
         .fill();
      doc.strokeColor(COLORS.GOLD_DARK)
         .lineWidth(1.5)
         .rect(margin, currentY, infoBoxWidth, netBoxHeight)
         .stroke();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(12)
         .text(t.netPay, margin + 5 * MM, currentY + 3 * MM, { width: infoBoxWidth * 0.5 });
      doc.fillColor('#C41E1E')
         .font('Helvetica-Bold')
         .fontSize(14)
         .text(`${formatNumber(calc.netPay)} ${t.currency}`, margin + infoBoxWidth * 0.5, currentY + 3 * MM, { width: infoBoxWidth * 0.5 - 10 * MM, align: 'right' });
      doc.restore();

      currentY += netBoxHeight + 8 * MM;

      // Employer charges box
      const chargesBoxHeight = 20 * MM;

      doc.save();
      doc.fillColor('#FAF8F0')
         .opacity(0.3)
         .rect(margin, currentY, infoBoxWidth, chargesBoxHeight)
         .fill();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.8)
         .rect(margin, currentY, infoBoxWidth, chargesBoxHeight)
         .stroke();

      const chargesY = currentY + 3 * MM;

      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(t.employerCharges, margin + 3 * MM, chargesY);

      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(8)
         .text(`${t.cnssEmployer} : ${formatNumber(calc.cnssEmployer)} ${t.currency}`, margin + 3 * MM, chargesY + 6 * MM)
         .text(`${t.amoEmployer} : ${formatNumber(calc.amoEmployer)} ${t.currency}`, margin + 3 * MM, chargesY + 11 * MM)
         .text(`${t.taxeProfessionnelle} : ${formatNumber(calc.taxeProfessionnelle)} ${t.currency}`, margin + colWidth + 3 * MM, chargesY + 6 * MM);

      doc.restore();

      // Draw footer and border
      drawFooter(doc);
      drawBorderFrame(doc);

      doc.end();

    } catch (error) {
      console.error('Error generating bulletin de paie PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export default generateBulletinPaiePDF;
