import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload a file buffer to Cloudinary.
 * Uses upload() instead of upload_stream() for serverless compatibility.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    resourceType?: "image" | "video" | "audio" | "auto";
    publicId?: string;
    transformation?: Record<string, unknown>;
    filename?: string;
  } = {}
): Promise<{ url: string; publicId: string; format: string; resourceType: string }> {
  const { folder = "pakalale", resourceType = "auto", publicId, transformation, filename } = options;

  // Convert buffer to base64 data URI for serverless compatibility
  const base64 = buffer.toString("base64");
  const dataUri = `data:application/octet-stream;base64,${base64}`;

  const uploadOptions: Record<string, unknown> = {
    folder,
    resource_type: resourceType === "auto" ? "auto" : resourceType,
    ...(publicId ? { public_id: publicId } : {}),
    ...(transformation ? { transformation } : {}),
    ...(filename ? { public_id: `${folder}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}` } : {}),
  };

  try {
    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error("[Cloudinary] Upload error:", error);
    throw error;
  }
}

/**
 * Generate optimized URL for images
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
    transformation: [{ width, height, crop, quality, format }],
    secure: true,
  });
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
