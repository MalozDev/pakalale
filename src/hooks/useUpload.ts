import { useState, useCallback } from "react";

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: string;
}

interface UseUploadOptions {
  folder?: string;
  type?: "image" | "video" | "audio" | "auto";
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", options.folder || "pakalale");
        formData.append("type", options.type || "auto");

        // Simulate progress (Cloudinary doesn't support XHR progress via fetch)
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const result: UploadResult = await response.json();
        setProgress(100);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        options.onError?.(message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
  }, []);

  return { upload, uploading, progress, error, reset };
}
