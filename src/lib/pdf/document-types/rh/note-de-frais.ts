/**
 * LE TATCHE BOIS - Note de Frais (Expense Report) PDF Generator
 *
 * Generates expense reports in 4 languages (FR, EN, AR, ES)
 */

import PDFDoc from 'pdfkit';
import {
  drawWoodBackground,
  drawCenterWatermark,
  drawBorderFrame,
  drawHeader,
  drawFooter,
  drawWoodTexture,
  COLORS,
  PAGE,
  ASSETS,
} from '../../base-layout';
import { getRHTranslations, type RHLanguage } from '../../helpers/rh-translations';
import { formatDate, formatNumber } from '../../helpers/format-utils';
import fs from 'fs';

type PDFDocument = PDFKit.PDFDocument;

const MM = 2.834645669;

// ────────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────

export interface ExpenseItem {
  date: Date | string;
  description: string;
  category: 'transport' | 'meals' | 'accommodation' | 'supplies' | 'communication' | 'other';
  amount: number;
  hasReceipt: boolean;
}

export interface NoteDeFraisData {
  refNumber: string;
  employeeFullName: string;
  department: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  expenses: ExpenseItem[];
  advanceReceived: number;
  approvedBy?: string;
  issueDate: Date | string;
  lang: RHLanguage;
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ────────────────────────────────────────────────────────────────────────────────

export async function generateNoteDeFraisPDF(data: NoteDeFraisData): Promise<Buffer> {
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
      const header = drawHeader(doc, t.expenseReport, data.refNumber, formatDate(data.issueDate));

      // Main content area
      const margin = 20 * MM;
      let currentY = header.fieldsY + 5 * MM;

      // Employee info box
      const infoBoxHeight = 15 * MM;
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
         .fontSize(9);

      doc.text(`${t.employee} :`, margin + 3 * MM, infoY);
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .text(data.employeeFullName, margin + 3 * MM, infoY + 5 * MM);

      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .text(`${t.department} :`, margin + colWidth + 3 * MM, infoY);
      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .text(data.department, margin + colWidth + 3 * MM, infoY + 5 * MM);
      doc.restore();

      currentY += infoBoxHeight + 3 * MM;

      // Period
      const periodText = `${t.period} : ${t.from} ${formatDate(data.periodStart)} ${t.to} ${formatDate(data.periodEnd)}`;
      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(periodText, margin, currentY);
      doc.restore();

      currentY += 8 * MM;

      // Expenses table
      const tableWidth = PAGE.WIDTH - 2 * margin;
      const colWidths = {
        date: 18 * MM,
        desc: tableWidth - 68 * MM,
        category: 25 * MM,
        amount: 15 * MM,
        receipt: 10 * MM,
      };

      const headerRowHeight = 7 * MM;
      const dataRowHeight = 5.5 * MM;

      // Table header
      const headerY = currentY;

      try {
        if (fs.existsSync(ASSETS.woodHeader)) {
          drawWoodTexture(doc, margin, headerY, tableWidth, headerRowHeight, ASSETS.woodHeader, 1.0);
        } else {
          doc.save();
          doc.fillColor(COLORS.BROWN_DARK)
             .rect(margin, headerY, tableWidth, headerRowHeight)
             .fill();
          doc.restore();
        }
      } catch (error) {
        doc.save();
        doc.fillColor(COLORS.BROWN_DARK)
           .rect(margin, headerY, tableWidth, headerRowHeight)
           .fill();
        doc.restore();
      }

      doc.save();
      doc.strokeColor(COLORS.GOLD_DARK)
         .lineWidth(1.5)
         .rect(margin, headerY, tableWidth, headerRowHeight)
         .stroke();
      doc.restore();

      // Header text
      const headers = [t.expenseDate, t.description, t.category, t.amount, t.receipt];
      let xPos = margin;
      const headerTextY = headerY + (headerRowHeight / 2) - 3;

      doc.save();
      doc.fillColor(COLORS.WHITE)
         .font('Helvetica-Bold')
         .fontSize(8.5);

      doc.text(headers[0], xPos, headerTextY, { width: colWidths.date, align: 'center' });
      xPos += colWidths.date;

      doc.text(headers[1], xPos + 2, headerTextY, { width: colWidths.desc - 4, align: 'center' });
      xPos += colWidths.desc;

      doc.text(headers[2], xPos, headerTextY, { width: colWidths.category, align: 'center' });
      xPos += colWidths.category;

      doc.text(headers[3], xPos, headerTextY, { width: colWidths.amount, align: 'right' });
      xPos += colWidths.amount;

      doc.text(headers[4], xPos, headerTextY, { width: colWidths.receipt, align: 'center' });

      doc.restore();

      currentY = headerY + headerRowHeight;

      // Data rows
      let totalExpenses = 0;

      for (let i = 0; i < data.expenses.length; i++) {
        const expense = data.expenses[i];
        const rowY = currentY;

        totalExpenses += expense.amount;

        // Alternating background
        if (i % 2 === 0) {
          doc.save();
          doc.fillColor('#FAF8F0')
             .opacity(0.35)
             .rect(margin, rowY, tableWidth, dataRowHeight)
             .fill();
          doc.restore();
        }

        const textY = rowY + (dataRowHeight / 2) - 2.5;
        xPos = margin;

        doc.save();
        doc.fillColor(COLORS.BROWN_DARK)
           .font('Helvetica')
           .fontSize(7.5);

        // Date
        doc.text(formatDate(expense.date), xPos, textY, { width: colWidths.date, align: 'center', lineBreak: false });
        xPos += colWidths.date;

        // Description
        doc.text(expense.description, xPos + 2, textY, { width: colWidths.desc - 4, align: 'left', lineBreak: false });
        xPos += colWidths.desc;

        // Category
        const categoryText = t.categories[expense.category];
        doc.text(categoryText, xPos, textY, { width: colWidths.category, align: 'center', lineBreak: false });
        xPos += colWidths.category;

        // Amount
        doc.text(formatNumber(expense.amount), xPos, textY, { width: colWidths.amount - 2, align: 'right', lineBreak: false });
        xPos += colWidths.amount;

        // Receipt
        doc.text(expense.hasReceipt ? t.yes : t.no, xPos, textY, { width: colWidths.receipt, align: 'center', lineBreak: false });

        doc.restore();

        currentY += dataRowHeight;
      }

      // Table grid lines
      const tableTop = headerY;
      const tableBottom = currentY;

      doc.save();
      doc.strokeColor('#8B7355')
         .lineWidth(0.5)
         .rect(margin, tableTop, tableWidth, tableBottom - tableTop)
         .stroke();

      // Vertical lines
      const colX = {
        afterDate: margin + colWidths.date,
        afterDesc: margin + colWidths.date + colWidths.desc,
        afterCategory: margin + colWidths.date + colWidths.desc + colWidths.category,
        afterAmount: margin + colWidths.date + colWidths.desc + colWidths.category + colWidths.amount,
      };

      for (const x of Object.values(colX)) {
        doc.moveTo(x, tableTop).lineTo(x, tableBottom).stroke();
      }

      // Header separator
      doc.strokeColor('#C4973B')
         .lineWidth(1.0)
         .moveTo(margin, tableTop + headerRowHeight)
         .lineTo(margin + tableWidth, tableTop + headerRowHeight)
         .stroke();

      // Row separators
      doc.strokeColor('#8B7355')
         .lineWidth(0.3);
      for (let i = 1; i < data.expenses.length; i++) {
        const y = headerY + headerRowHeight + (i * dataRowHeight);
        doc.moveTo(margin, y).lineTo(margin + tableWidth, y).stroke();
      }

      doc.restore();

      currentY += 5 * MM;

      // Totals box
      const totalsBoxWidth = 80 * MM;
      const totalsBoxX = margin + tableWidth - totalsBoxWidth;
      const totalsRowHeight = 8 * MM;

      const balanceDue = totalExpenses - data.advanceReceived;

      // Total expenses
      doc.save();
      doc.fillColor('#FAF8F0')
         .opacity(0.35)
         .rect(totalsBoxX, currentY, totalsBoxWidth, totalsRowHeight)
         .fill();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.8)
         .rect(totalsBoxX, currentY, totalsBoxWidth, totalsRowHeight)
         .stroke();

      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(t.totalExpenses, totalsBoxX + 3 * MM, currentY + 2.5 * MM, { width: totalsBoxWidth / 2, align: 'left' });
      doc.text(`${formatNumber(totalExpenses)} ${t.currency}`, totalsBoxX + totalsBoxWidth / 2, currentY + 2.5 * MM, { width: totalsBoxWidth / 2 - 6 * MM, align: 'right' });
      doc.restore();

      currentY += totalsRowHeight;

      // Advance received
      doc.save();
      doc.fillColor('#FAF8F0')
         .opacity(0.35)
         .rect(totalsBoxX, currentY, totalsBoxWidth, totalsRowHeight)
         .fill();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.8)
         .rect(totalsBoxX, currentY, totalsBoxWidth, totalsRowHeight)
         .stroke();

      doc.fillColor(COLORS.GRAY_DARK)
         .font('Helvetica')
         .fontSize(9)
         .text(t.advanceReceived, totalsBoxX + 3 * MM, currentY + 2.5 * MM, { width: totalsBoxWidth / 2, align: 'left' });
      doc.text(`${formatNumber(data.advanceReceived)} ${t.currency}`, totalsBoxX + totalsBoxWidth / 2, currentY + 2.5 * MM, { width: totalsBoxWidth / 2 - 6 * MM, align: 'right' });
      doc.restore();

      currentY += totalsRowHeight;

      // Balance due
      doc.save();
      doc.fillColor('#FAF8F0')
         .opacity(0.45)
         .rect(totalsBoxX, currentY, totalsBoxWidth, totalsRowHeight + 2)
         .fill();
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.8)
         .rect(totalsBoxX, currentY, totalsBoxWidth, totalsRowHeight + 2)
         .stroke();

      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(t.balanceDue, totalsBoxX + 3 * MM, currentY + 2.5 * MM, { width: totalsBoxWidth / 2, align: 'left' });
      doc.fillColor('#C41E1E')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(`${formatNumber(balanceDue)} ${t.currency}`, totalsBoxX + totalsBoxWidth / 2, currentY + 2.5 * MM, { width: totalsBoxWidth / 2 - 6 * MM, align: 'right' });
      doc.restore();

      currentY += totalsRowHeight + 10 * MM;

      // Signature section
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

      // Approved by signature (right)
      const approverX = PAGE.WIDTH - margin - sigBoxWidth;
      const approverLabel = data.approvedBy ? `${t.approvedBy} : ${data.approvedBy}` : t.approvedBy;

      doc.save();
      doc.fillColor(COLORS.BROWN_DARK)
         .font('Helvetica-Bold')
         .fontSize(8)
         .text(approverLabel, approverX, currentY);
      doc.strokeColor(COLORS.GOLD)
         .lineWidth(0.5)
         .dash(2, { space: 2 })
         .rect(approverX, currentY + 3, sigBoxWidth, sigBoxHeight - 3)
         .stroke();
      doc.restore();

      // Draw footer and border
      drawFooter(doc);
      drawBorderFrame(doc);

      doc.end();

    } catch (error) {
      console.error('Error generating note de frais PDF:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export default generateNoteDeFraisPDF;
