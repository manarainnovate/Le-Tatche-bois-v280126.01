/**
 * Test QR Code Content Endpoint
 * GET /api/test-qr-content - Returns the TEXT content that's encoded in QR
 */

import { NextRequest, NextResponse } from 'next/server';
import { COMPANY } from '@/lib/pdf/base-layout';

export async function GET(request: NextRequest) {
  try {
    // This is the EXACT URL text that gets encoded in the QR code
    const docNumber = 'FAC-2026/0001';
    const totalTTC = 12500.00;
    const clientName = 'Test Client Name';

    // Build URL to info page
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    let qrUrl = `${baseUrl}/api/qr-info/${encodeURIComponent(docNumber)}`;

    // Add query params for amount and client if provided
    const params: string[] = [];
    if (totalTTC !== undefined && totalTTC > 0) {
      params.push(`amount=${totalTTC.toFixed(2)}`);
    }
    if (clientName) {
      params.push(`client=${encodeURIComponent(clientName)}`);
    }

    if (params.length > 0) {
      qrUrl += '?' + params.join('&');
    }

    const qrContent = qrUrl;

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
