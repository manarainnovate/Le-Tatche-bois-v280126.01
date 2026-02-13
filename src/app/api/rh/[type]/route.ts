/**
 * LE TATCHE BOIS - RH Documents API Route
 *
 * Generates RH PDF documents (5 types) in 4 languages
 * POST /api/rh/[type]
 */

import { NextRequest, NextResponse } from 'next/server';
import generateAttestationTravailPDF, { type AttestationTravailData } from '@/lib/pdf/document-types/rh/attestation-travail';
import generateAttestationSalairePDF, { type AttestationSalaireData } from '@/lib/pdf/document-types/rh/attestation-salaire';
import generateNoteDeFraisPDF, { type NoteDeFraisData } from '@/lib/pdf/document-types/rh/note-de-frais';
import generateBulletinPaiePDF, { type BulletinPaieData } from '@/lib/pdf/document-types/rh/bulletin-de-paie';
import generateOrdreMissionPDF, { type OrdreMissionData } from '@/lib/pdf/document-types/rh/ordre-de-mission';

// ════════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════════

type RHDocumentType = 'attestation-travail' | 'attestation-salaire' | 'note-de-frais' | 'bulletin-paie' | 'ordre-mission';

type RHDocumentData =
  | AttestationTravailData
  | AttestationSalaireData
  | NoteDeFraisData
  | BulletinPaieData
  | OrdreMissionData;

// ════════════════════════════════════════════════════════════════════════════════
// API HANDLER
// ════════════════════════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body = await request.json();

    // Validate document type
    const validTypes: RHDocumentType[] = [
      'attestation-travail',
      'attestation-salaire',
      'note-de-frais',
      'bulletin-paie',
      'ordre-mission',
    ];

    if (!validTypes.includes(type as RHDocumentType)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate PDF based on type
    let pdfBuffer: Buffer;
    let filename: string;

    switch (type as RHDocumentType) {
      case 'attestation-travail': {
        const data = body as AttestationTravailData;
        pdfBuffer = await generateAttestationTravailPDF(data);
        filename = `Attestation_Travail_${data.refNumber}_${data.employeeFullName.replace(/\s+/g, '_')}.pdf`;
        break;
      }

      case 'attestation-salaire': {
        const data = body as AttestationSalaireData;
        pdfBuffer = await generateAttestationSalairePDF(data);
        filename = `Attestation_Salaire_${data.refNumber}_${data.employeeFullName.replace(/\s+/g, '_')}.pdf`;
        break;
      }

      case 'note-de-frais': {
        const data = body as NoteDeFraisData;
        pdfBuffer = await generateNoteDeFraisPDF(data);
        filename = `Note_de_Frais_${data.refNumber}_${data.employeeFullName.replace(/\s+/g, '_')}.pdf`;
        break;
      }

      case 'bulletin-paie': {
        const data = body as BulletinPaieData;
        pdfBuffer = await generateBulletinPaiePDF(data);
        filename = `Bulletin_Paie_${data.refNumber}_${data.employeeFullName.replace(/\s+/g, '_')}.pdf`;
        break;
      }

      case 'ordre-mission': {
        const data = body as OrdreMissionData;
        pdfBuffer = await generateOrdreMissionPDF(data);
        filename = `Ordre_Mission_${data.refNumber}_${data.employeeFullName.replace(/\s+/g, '_')}.pdf`;
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Unknown document type' },
          { status: 400 }
        );
    }

    // Return PDF with appropriate headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('[RH API] Error generating PDF:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// METADATA
// ════════════════════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
