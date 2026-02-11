import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentPDF } from '@/lib/pdf/pdf-generator';

/**
 * GET /api/crm/documents/[id]/pdf
 * Génère un PDF professionnel pour tout type de document CRM
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Generate PDF using new PDFKit-based system
    const { buffer, filename } = await generateDocumentPDF(id);

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);

    // Specific error handling
    if (error.message === 'Document non trouvé') {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    if (error.message?.includes('pas encore implémentée')) {
      return NextResponse.json(
        { error: error.message },
        { status: 501 } // Not Implemented
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
