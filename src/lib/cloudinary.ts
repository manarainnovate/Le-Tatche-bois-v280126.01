import { v2 as cloudinary } from "cloudinary";

// ═══════════════════════════════════════════════════════════
// Cloudinary Configuration
// ═══════════════════════════════════════════════════════════

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  transformation?: object[];
  resourceType?: "image" | "video" | "raw" | "auto";
}

// ═══════════════════════════════════════════════════════════
// Upload Image
// ═══════════════════════════════════════════════════════════

export async function uploadImage(
  file: Buffer,
  folder: string = "le-tatche-bois"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            const errorMessage = error instanceof Error
              ? error.message
              : typeof error === "object" && error !== null && "message" in error
                ? String((error as { message: unknown }).message)
                : "Unknown upload error";
            reject(new Error(errorMessage));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          } else {
            reject(new Error("Upload failed: No result returned"));
          }
        }
      )
      .end(file);
  });
}

// ═══════════════════════════════════════════════════════════
// Upload Image with Options
// ═══════════════════════════════════════════════════════════

export async function uploadImageWithOptions(
  file: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = "le-tatche-bois",
    transformation = [{ quality: "auto:good" }, { fetch_format: "auto" }],
    resourceType = "image",
  } = options;

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: resourceType,
          transformation,
        },
        (error, result) => {
          if (error) {
            const errorMessage = error instanceof Error
              ? error.message
              : typeof error === "object" && error !== null && "message" in error
                ? String((error as { message: unknown }).message)
                : "Unknown upload error";
            reject(new Error(errorMessage));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          } else {
            reject(new Error("Upload failed: No result returned"));
          }
        }
      )
      .end(file);
  });
}

// ═══════════════════════════════════════════════════════════
// Delete Image
// ═══════════════════════════════════════════════════════════

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

// ═══════════════════════════════════════════════════════════
// Delete Multiple Images
// ═══════════════════════════════════════════════════════════

export async function deleteImages(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return;
  await cloudinary.api.delete_resources(publicIds);
}

// ═══════════════════════════════════════════════════════════
// Get Optimized URL with transformations
// ═══════════════════════════════════════════════════════════

export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    crop?: string;
  } = {}
): string {
  const transformations: object[] = [];

  if (options.width || options.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: options.crop ?? "fill",
    });
  }

  transformations.push({ quality: options.quality ?? "auto:good" });
  transformations.push({ fetch_format: "auto" });

  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations,
  });
}

// ═══════════════════════════════════════════════════════════
// Get Multiple Sizes
// ═══════════════════════════════════════════════════════════

export function getImageSizes(publicId: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  return {
    thumbnail: getOptimizedUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedUrl(publicId, { width: 300, height: 300 }),
    medium: getOptimizedUrl(publicId, { width: 600, height: 600 }),
    large: getOptimizedUrl(publicId, { width: 1200, height: 1200 }),
    original: getOptimizedUrl(publicId, {}),
  };
}

// ═══════════════════════════════════════════════════════════
// Folder paths for different content types
// ═══════════════════════════════════════════════════════════

export const UPLOAD_FOLDERS = {
  products: "le-tatche-bois/products",
  projects: "le-tatche-bois/projects",
  services: "le-tatche-bois/services",
  quotes: "le-tatche-bois/quotes",
  categories: "le-tatche-bois/categories",
  general: "le-tatche-bois/general",
} as const;

export type UploadFolder = keyof typeof UPLOAD_FOLDERS;

export default cloudinary;
