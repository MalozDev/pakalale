import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * POST /api/upload
 * 
 * Upload files to Cloudinary. Accepts multipart/form-data with:
 * - file: the file to upload
 * - folder: optional folder name (default: "pakalale")
 * - type: "image" | "video" | "audio" | "auto" (default: "auto")
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "pakalale";
    const resourceType = (formData.get("type") as string) || "auto";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 50MB for video, 10MB for images/audio)
    const maxSize = resourceType === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${resourceType === "video" ? "50MB" : "10MB"}` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine the correct resource type
    let detectedType: "image" | "video" | "audio" | "auto" = "auto";
    if (resourceType === "video" || file.type.startsWith("video/")) {
      detectedType = "video";
    } else if (resourceType === "audio" || file.type.startsWith("audio/")) {
      detectedType = "audio";
    } else if (resourceType === "image" || file.type.startsWith("image/")) {
      detectedType = "image";
    }

    // Subfolder based on type
    const subFolder = `${folder}/${detectedType === "auto" ? "misc" : detectedType}s`;

    // Apply transformations based on type
    let transformation: Record<string, unknown> | undefined;
    if (detectedType === "image") {
      transformation = {
        quality: "auto",
        fetch_format: "auto",
      };
    }

    const result = await uploadToCloudinary(buffer, {
      folder: subFolder,
      resourceType: detectedType,
      transformation,
    });

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      resourceType: result.resourceType,
    });
  } catch (error) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
