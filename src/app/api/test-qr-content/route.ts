/**
 * Test QR Code Content Endpoint
 * GET /api/test-qr-content - Returns the TEXT content that's encoded in QR
 */

import { NextRequest, NextResponse } from 'next/server';
import { COMPANY } from '@/lib/pdf/base-layout';

export async function GET(request: NextRequest) {
  try {
    // This is the EXACT vCard text that gets encoded in the QR code
    const docNumber = 'FAC-2026/0001';
    const totalTTC = 12500.00;
    const clientName = 'Test Client Name';

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${COMPANY.name}`,
      `ORG:${COMPANY.name};${COMPANY.type}`,
      `TITLE:${COMPANY.activity}`,
      `TEL;TYPE=WORK,VOICE:${COMPANY.tel1}`,
      `TEL;TYPE=WORK,VOICE:${COMPANY.tel2}`,
      `EMAIL;TYPE=INTERNET:${COMPANY.email}`,
      `EMAIL;TYPE=INTERNET:${COMPANY.email2}`,
      `URL:${COMPANY.website}`,
      `ADR;TYPE=WORK:;;${COMPANY.address};LAMHAMID;MARRAKECH;;Morocco`,
    ];

    // Add bank info in NOTE field
    let note = `COORDONNEES BANCAIRES:\\n`;
    note += `Titulaire: ${COMPANY.bank.holder}\\n`;
    note += `RIB: ${COMPANY.bank.rib}\\n`;
    note += `IBAN: ${COMPANY.bank.iban}\\n`;
    note += `SWIFT: ${COMPANY.bank.swift}\\n`;
    note += `Banque: ${COMPANY.bank.name} ${COMPANY.bank.branch}\\n`;
    note += `\\nDOCUMENT: ${docNumber}`;

    if (totalTTC !== undefined && totalTTC > 0) {
      note += `\\nMontant: ${totalTTC.toFixed(2)} DH`;
    }
    if (clientName) {
      note += `\\nClient: ${clientName}`;
    }
    note += `\\nICE: ${COMPANY.ice}`;

    lines.push(`NOTE:${note}`);
    lines.push('END:VCARD');

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
