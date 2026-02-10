#!/usr/bin/env node

/**
 * Image Optimization Script for LE TATCHE BOIS
 *
 * - Resizes images > 1920px wide or > 1080px tall
 * - Compresses JPEG to quality 80, PNG to JPEG (if no transparency)
 * - Backs up originals to /public/uploads/originals/
 * - Preserves filenames and paths for DB compatibility
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const PUBLIC_DIR = path.join(__dirname, 'public');
const ORIGINALS_DIR = path.join(PUBLIC_DIR, 'uploads', 'originals');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Size thresholds
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;

// Skip files smaller than this (already optimized)
const MIN_SIZE_TO_PROCESS = 100 * 1024; // 100KB

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getAllImages(dir) {
  const results = [];

  function walk(currentDir) {
    // Skip the originals backup folder
    if (currentDir.includes('/uploads/originals')) return;

    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return results;
}

function getRelativePath(fullPath) {
  return fullPath.replace(PUBLIC_DIR, '');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  IMAGE OPTIMIZATION - LE TATCHE BOIS');
  console.log('═══════════════════════════════════════════════');
  console.log('');

  // Find all images
  const allImages = getAllImages(PUBLIC_DIR);
  console.log(`Found ${allImages.length} images in /public/`);

  // Calculate total size before
  let totalBefore = 0;
  const imageSizes = [];

  for (const imgPath of allImages) {
    const stat = fs.statSync(imgPath);
    totalBefore += stat.size;
    imageSizes.push({ path: imgPath, size: stat.size });
  }

  console.log(`Total size BEFORE: ${formatBytes(totalBefore)}`);
  console.log('');

  // Show top 10 heaviest
  imageSizes.sort((a, b) => b.size - a.size);
  console.log('TOP 10 heaviest images:');
  for (let i = 0; i < Math.min(10, imageSizes.length); i++) {
    const img = imageSizes[i];
    console.log(`  ${i + 1}. ${formatBytes(img.size).padStart(10)} - ${getRelativePath(img.path)}`);
  }
  console.log('');

  // Filter images that need processing (> MIN_SIZE_TO_PROCESS)
  const toProcess = imageSizes.filter(img => img.size > MIN_SIZE_TO_PROCESS);
  const skipped = imageSizes.length - toProcess.length;
  console.log(`Processing ${toProcess.length} images (skipping ${skipped} already small)`);
  console.log('');

  // Ensure originals backup dir
  ensureDir(ORIGINALS_DIR);

  let processed = 0;
  let errors = 0;
  let totalAfter = 0;
  let totalSaved = 0;
  const results = [];

  for (let i = 0; i < toProcess.length; i++) {
    const { path: imgPath, size: originalSize } = toProcess[i];
    const relPath = getRelativePath(imgPath);
    const ext = path.extname(imgPath).toLowerCase();

    try {
      // Read image metadata
      const metadata = await sharp(imgPath).metadata();
      const { width, height, format, hasAlpha } = metadata;

      // Determine if resize is needed
      let needsResize = false;
      let targetWidth = width;
      let targetHeight = height;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        needsResize = true;
        // Fit within MAX_WIDTH x MAX_HEIGHT keeping aspect ratio
        const widthRatio = MAX_WIDTH / width;
        const heightRatio = MAX_HEIGHT / height;
        const ratio = Math.min(widthRatio, heightRatio);
        if (ratio < 1) {
          targetWidth = Math.round(width * ratio);
          targetHeight = Math.round(height * ratio);
        }
      }

      // Build sharp pipeline
      let pipeline = sharp(imgPath);

      // Resize if needed
      if (needsResize) {
        pipeline = pipeline.resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Output format
      let outputExt = ext;
      if (ext === '.png' && !hasAlpha) {
        // Convert opaque PNGs to JPEG
        pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
        outputExt = '.jpg';
      } else if (ext === '.png' && hasAlpha) {
        pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: JPEG_QUALITY });
      } else {
        // JPEG
        pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
      }

      // Process to buffer
      const outputBuffer = await pipeline.toBuffer();
      const newSize = outputBuffer.length;

      // Only save if actually smaller
      if (newSize < originalSize) {
        // Backup original
        const backupPath = path.join(ORIGINALS_DIR, relPath.replace(/^\/uploads\//, ''));
        ensureDir(path.dirname(backupPath));

        // Copy original to backup (if not already backed up)
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(imgPath, backupPath);
        }

        // If we converted PNG to JPG, we need to handle the filename
        if (ext === '.png' && outputExt === '.jpg') {
          // Write as JPEG but keep original PNG filename (overwrite)
          // Actually keep same filename to avoid DB breakage
          fs.writeFileSync(imgPath, outputBuffer);
        } else {
          // Write optimized version
          fs.writeFileSync(imgPath, outputBuffer);
        }

        const saved = originalSize - newSize;
        totalSaved += saved;
        totalAfter += newSize;
        processed++;

        results.push({
          path: relPath,
          before: originalSize,
          after: newSize,
          saved,
          resized: needsResize,
          dims: needsResize ? `${width}x${height} → ${targetWidth}x${targetHeight}` : `${width}x${height}`,
        });

        // Progress
        if (processed % 50 === 0 || i < 20) {
          console.log(`  [${i + 1}/${toProcess.length}] ${formatBytes(originalSize)} → ${formatBytes(newSize)} (saved ${formatBytes(saved)}) ${relPath.substring(0, 60)}...`);
        }
      } else {
        // Already optimal, keep as-is
        totalAfter += originalSize;
      }
    } catch (err) {
      errors++;
      totalAfter += originalSize;
      if (errors <= 5) {
        console.log(`  ⚠ Error: ${relPath} - ${err.message}`);
      }
    }
  }

  // Add skipped files sizes to totalAfter
  for (const img of imageSizes) {
    if (img.size <= MIN_SIZE_TO_PROCESS) {
      totalAfter += img.size;
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  OPTIMIZATION COMPLETE');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log(`  Total images found:     ${allImages.length}`);
  console.log(`  Images processed:       ${processed}`);
  console.log(`  Errors:                 ${errors}`);
  console.log(`  Skipped (already small): ${skipped}`);
  console.log('');
  console.log(`  Total size BEFORE:      ${formatBytes(totalBefore)}`);
  console.log(`  Total size AFTER:       ${formatBytes(totalAfter)}`);
  console.log(`  Space SAVED:            ${formatBytes(totalSaved)} (${((totalSaved / totalBefore) * 100).toFixed(1)}%)`);
  console.log('');
  console.log(`  Originals backed up to: /public/uploads/originals/`);
  console.log('');

  // Show top 10 biggest savings
  results.sort((a, b) => b.saved - a.saved);
  console.log('TOP 10 biggest savings:');
  for (let i = 0; i < Math.min(10, results.length); i++) {
    const r = results[i];
    console.log(`  ${i + 1}. ${formatBytes(r.before)} → ${formatBytes(r.after)} (saved ${formatBytes(r.saved)}) ${r.dims}`);
    console.log(`     ${r.path}`);
  }
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
