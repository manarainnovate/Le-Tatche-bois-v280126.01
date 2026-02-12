/**
 * API Route: Papier En-tête (Blank Letterhead) PDF Generator
 *
 * GET /api/crm/documents/papier-entete
 *
 * Generates and returns a blank branded letterhead PDF
 * No authentication required - this is a public utility endpoint
 */

import { NextResponse } from 'next/server';
import { generatePapierEntetePDF } from '@/lib/pdf/document-types/papier-entete';

/**
 * GET handler - Generate and return papier en-tête PDF
 */
export async function GET() {
  try {
    console.log('[API] Generating papier en-tête PDF...');

    const buffer = await generatePapierEntetePDF();

    console.log('[API] ✅ Papier en-tête PDF generated successfully');

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="papier-entete-le-tatche-bois.pdf"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API] ❌ Letterhead generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate letterhead PDF',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
