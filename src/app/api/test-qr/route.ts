/**
 * Test QR Code Preview Endpoint
 * GET /api/test-qr - Returns QR code as PNG image for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateInvoiceQR } from '@/lib/pdf/base-layout';

export async function GET(request: NextRequest) {
  try {
    // Generate test QR code
    const qrBuffer = await generateInvoiceQR(
      'FAC-2026/0001',
      12500.00,
      'Test Client Name'
    );

    // Return as PNG image (convert Buffer to Uint8Array for NextResponse)
    return new NextResponse(new Uint8Array(qrBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[Test QR] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
