/**
 * Test QR Code Content Endpoint
 * GET /api/test-qr-content - Returns the TEXT content that's encoded in QR
 */

import { NextRequest, NextResponse } from 'next/server';
import { COMPANY } from '@/lib/pdf/base-layout';

export async function GET(request: NextRequest) {
  try {
    // This is the EXACT text that gets encoded in the QR code
    const docNumber = 'FAC-2026/0001';
    const totalTTC = 12500.00;
    const clientName = 'Test Client Name';

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

    // Return as plain text
    return new NextResponse(qrContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[Test QR Content] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
