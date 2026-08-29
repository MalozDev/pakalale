import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload a file buffer to Cloudinary.
 * Supports images, videos, and audio.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    resourceType?: "image" | "video" | "audio" | "auto";
    publicId?: string;
    transformation?: Record<string, unknown>;
  } = {}
): Promise<{ url: string; publicId: string; format: string; resourceType: string }> {
  const { folder = "pakalale", resourceType = "auto", publicId, transformation } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: resourceType,
      ...(publicId ? { public_id: publicId } : {}),
      ...(transformation ? { transformation } : {}),
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed - no result"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          resourceType: result.resource_type,
        });
      })
      .end(buffer);
  });
}

/**
 * Generate optimized URL for images (thumbnails, avatars, etc.)
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  const { width = 800, height = 600, crop = "fill", quality = "auto", format = "auto" } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop, quality, format },
    ],
    secure: true,
  });
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
