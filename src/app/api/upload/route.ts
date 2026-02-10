import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

// ═══════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
];

// Image optimization settings
const OPT_MAX_WIDTH = 1920;
const OPT_MAX_HEIGHT = 1080;
const OPT_JPEG_QUALITY = 80;
const OPT_PNG_QUALITY = 80;
// Types that should be auto-optimized (skip SVG, GIF, video)
const OPTIMIZABLE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName).toLowerCase();
  const safeName = originalName
    .replace(ext, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .substring(0, 20);
  return `${safeName}-${timestamp}-${random}${ext}`;
}

function getUploadDir(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return path.join(process.cwd(), "public", "uploads", String(year), month);
}

function getPublicUrl(fileName: string): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `/uploads/${year}/${month}/${fileName}`;
}

// ═══════════════════════════════════════════════════════════
// Auto-Optimize Image
// ═══════════════════════════════════════════════════════════

async function optimizeImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; optimized: boolean }> {
  // Skip non-optimizable types
  if (!OPTIMIZABLE_TYPES.includes(mimeType)) {
    return { buffer, optimized: false };
  }

  try {
    const metadata = await sharp(buffer).metadata();
    const { width, height, hasAlpha, format } = metadata;

    if (!width || !height) {
      return { buffer, optimized: false };
    }

    let pipeline = sharp(buffer);

    // Resize if exceeds max dimensions
    if (width > OPT_MAX_WIDTH || height > OPT_MAX_HEIGHT) {
      pipeline = pipeline.resize(OPT_MAX_WIDTH, OPT_MAX_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Choose output format
    if (format === "png" && !hasAlpha) {
      // Convert opaque PNGs to JPEG for smaller size
      pipeline = pipeline.jpeg({ quality: OPT_JPEG_QUALITY, mozjpeg: true });
    } else if (format === "png") {
      pipeline = pipeline.png({ quality: OPT_PNG_QUALITY, compressionLevel: 9 });
    } else if (format === "webp") {
      pipeline = pipeline.webp({ quality: OPT_JPEG_QUALITY });
    } else {
      // JPEG
      pipeline = pipeline.jpeg({ quality: OPT_JPEG_QUALITY, mozjpeg: true });
    }

    const optimizedBuffer = await pipeline.toBuffer();

    // Only use optimized version if it's actually smaller
    if (optimizedBuffer.length < buffer.length) {
      console.log(
        `  Optimized: ${(buffer.length / 1024).toFixed(0)}KB → ${(optimizedBuffer.length / 1024).toFixed(0)}KB (${((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(0)}% saved)`
      );
      return { buffer: optimizedBuffer, optimized: true };
    }

    return { buffer, optimized: false };
  } catch (err) {
    // If optimization fails, return original buffer
    console.warn("Image optimization failed, using original:", err);
    return { buffer, optimized: false };
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/upload - Upload single image
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Also support "files" array for backwards compatibility
    if (!file) {
      const files = formData.getAll("files") as File[];
      if (files.length > 0) {
        // Handle multiple files
        return handleMultipleFiles(files);
      }
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Type de fichier non autorisé. Utilisez: JPG, PNG, GIF, WebP, SVG`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Maximum: 50MB" },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);

    // Auto-optimize image
    const { buffer: optimizedBuffer, optimized } = await optimizeImage(buffer, file.type);
    buffer = optimizedBuffer;

    // Create uploads directory
    const uploadDir = getUploadDir();
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename and save
    const fileName = generateFileName(file.name);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = getPublicUrl(fileName);

    console.log(`✅ File uploaded${optimized ? " (optimized)" : ""}:`, publicUrl);

    // Return in format compatible with existing code
    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      size: buffer.length,
      originalSize: file.size,
      type: file.type,
      optimized,
      // Also include uploads array for backwards compatibility
      uploads: [
        {
          url: publicUrl,
          filename: file.name,
          width: null,
          height: null,
          format: file.type.split("/")[1],
          bytes: buffer.length,
        },
      ],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur lors de l'upload";
    console.error("❌ Upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/upload - Upload multiple images
// ═══════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    return handleMultipleFiles(files);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur lors de l'upload";
    console.error("❌ Multi-upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper for multiple file uploads
async function handleMultipleFiles(files: File[]) {
  const uploadedFiles: { url: string; fileName: string; filename?: string }[] = [];
  const errors: string[] = [];

  // Create uploads directory
  const uploadDir = getUploadDir();
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Process each file
  for (const file of files) {
    try {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Type non autorisé`);
        continue;
      }
      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Trop volumineux (max 50MB)`);
        continue;
      }

      // Upload with auto-optimization
      const bytes = await file.arrayBuffer();
      let buffer = Buffer.from(bytes);

      const { buffer: optimizedBuffer } = await optimizeImage(buffer, file.type);
      buffer = optimizedBuffer;

      const fileName = generateFileName(file.name);
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      const publicUrl = getPublicUrl(fileName);
      uploadedFiles.push({
        url: publicUrl,
        fileName,
        filename: file.name,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push(`${file.name}: ${message}`);
    }
  }

  if (uploadedFiles.length === 0 && errors.length > 0) {
    return NextResponse.json(
      {
        error: "All uploads failed",
        errors: errors.map((e) => ({ field: "file", message: e })),
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `${uploadedFiles.length} fichier(s) téléchargé(s)${errors.length > 0 ? `, ${errors.length} échoué(s)` : ""}`,
    files: uploadedFiles,
    uploads: uploadedFiles,
    errors: errors.length > 0 ? errors : undefined,
  });
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/upload - Delete image by URL
// ═══════════════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url as string;

    // Also support publicId for backwards compatibility (ignore Cloudinary IDs)
    if (!url) {
      const publicId = body.publicId as string;
      if (publicId && publicId.startsWith("le-tatche-bois/")) {
        // This is a Cloudinary ID, just return success (nothing to delete locally)
        return NextResponse.json({ success: true, message: "Cloudinary image (skipped)" });
      }
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    if (!url.startsWith("/uploads/")) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", url);

    try {
      await unlink(filePath);
      console.log("✅ File deleted:", url);
    } catch (err) {
      // File might not exist, that's OK
      console.warn("File not found or already deleted:", url);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
    console.error("❌ Delete error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/upload - Get upload info and constraints
// ═══════════════════════════════════════════════════════════

export function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
    allowedTypes: ALLOWED_TYPES,
    storage: "local",
    uploadPath: "/uploads/{year}/{month}/{filename}",
  });
}
