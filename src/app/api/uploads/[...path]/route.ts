export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

// ═══════════════════════════════════════════════════════════
// MIME Types for uploaded files
// ═══════════════════════════════════════════════════════════

const MIME_TYPES: Record<string, string> = {
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',

  // Documents
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.csv': 'text/csv',

  // Video
  '.mp4': 'video/mp4',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.wmv': 'video/x-ms-wmv',
  '.webm': 'video/webm',

  // Audio
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',

  // Archives
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
  '.7z': 'application/x-7z-compressed',
};

// ═══════════════════════════════════════════════════════════
// GET /api/uploads/[...path] - Serve uploaded files
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join('/');

    // Security: prevent path traversal attacks
    if (filePath.includes('..') || filePath.includes('\\') || filePath.startsWith('/')) {
      console.warn('[API /uploads] Path traversal attempt blocked:', filePath);
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Build full file path
    const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath);

    console.log('[API /uploads] Serving file:', fullPath);

    // Check if file exists
    try {
      await stat(fullPath);
    } catch {
      console.error('[API /uploads] File not found:', fullPath);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Determine if file should be downloaded or displayed
    const disposition = request.nextUrl.searchParams.get('download') === 'true'
      ? `attachment; filename="${path.basename(fullPath)}"`
      : 'inline';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[API /uploads] Error serving file:', error);
    console.error('[API /uploads] Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to serve file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
