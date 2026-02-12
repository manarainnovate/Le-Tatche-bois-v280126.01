import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-helpers';

// ═══════════════════════════════════════════════════════════
// DELETE - Bulk delete documents
// ═══════════════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return apiError('Aucun document sélectionné', 400);
    }

    // Only allow deleting DRAFT documents
    const docs = await prisma.cRMDocument.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true, number: true, isDraft: true },
    });

    const nonDrafts = docs.filter((d) => !d.isDraft);
    if (nonDrafts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer ${nonDrafts.length} document(s) confirmé(s). Seuls les brouillons peuvent être supprimés.`,
          nonDeletable: nonDrafts.map((d) => d.number),
        },
        { status: 400 }
      );
    }

    // Delete items first, then documents
    await prisma.cRMDocumentItem.deleteMany({
      where: { documentId: { in: ids } },
    });

    const result = await prisma.cRMDocument.deleteMany({
      where: { id: { in: ids } },
    });

    return apiSuccess({
      deleted: result.count,
      message: `${result.count} document(s) supprimé(s)`,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return apiError('Erreur de suppression', 500);
  }
}

// ═══════════════════════════════════════════════════════════
// PUT - Bulk status update
// ═══════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  try {
    const { ids, status } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return apiError('Aucun document sélectionné', 400);
    }

    if (!status) {
      return apiError('Statut requis', 400);
    }

    const result = await prisma.cRMDocument.updateMany({
      where: { id: { in: ids } },
      data: { status, updatedAt: new Date() },
    });

    return apiSuccess({
      updated: result.count,
      message: `${result.count} document(s) mis à jour`,
    });
  } catch (error) {
    console.error('Bulk status update error:', error);
    return apiError('Erreur de mise à jour', 500);
  }
}
