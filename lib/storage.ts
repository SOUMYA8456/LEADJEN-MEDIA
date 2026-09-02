import crypto from "crypto";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File | { name: string; type: string; size: number }): ValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "Image is too large. Maximum allowed size is 10MB." };
  }

  const mimeType = file.type?.toLowerCase();
  const fileName = file.name?.toLowerCase() || "";
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType) && !hasValidExtension) {
    return { valid: false, error: "Unsupported image format. Please upload JPG, PNG, WEBP, or GIF." };
  }

  return { valid: true };
}

/**
 * Uploads media using Cloudinary (if configured with API secret) or falls back to permanent data storage.
 */
export async function uploadMedia(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; publicId: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // 1. If Cloudinary credentials exist, perform signed upload
  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signatureString = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

      const formData = new FormData();
      const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
      formData.append("file", blob, filename);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          return {
            url: data.secure_url,
            publicId: data.public_id || filename,
          };
        }
      } else {
        console.warn("Cloudinary upload returned non-200, falling back to permanent storage:", await res.text());
      }
    } catch (cloudErr) {
      console.warn("Cloudinary upload failed, falling back to permanent data URI storage:", cloudErr);
    }
  }

  // 2. Permanent Data URI Storage Fallback
  // On Serverless (Vercel), writing to local disk filesystem is ephemeral.
  // Data URIs stored directly in PostgreSQL are 100% permanent, self-contained, and never break.
  const base64Data = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  const publicId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    url: dataUrl,
    publicId,
  };
}

/**
 * Validates and sanitizes video URLs (YouTube, Vimeo, Cloudinary, MP4)
 * Strictly rejects dangerous schemes like javascript:, data:, etc.
 */
export function sanitizeVideoUrl(rawUrl: string): { valid: boolean; embedUrl?: string; error?: string } {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, error: "Video URL is required" };
  }

  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();

  // Reject unsafe schemes
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return { valid: false, error: "Unsafe video URL protocol detected" };
  }

  if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
    return { valid: false, error: "Video URL must start with http:// or https://" };
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // YouTube handler
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      let videoId = "";
      if (host.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1);
      } else if (parsed.searchParams.has("v")) {
        videoId = parsed.searchParams.get("v") || "";
      } else if (parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1] || "";
      }

      if (videoId) {
        return {
          valid: true,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&rel=0`,
        };
      }
    }

    // Vimeo handler
    if (host.includes("vimeo.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const vimeoId = parts[parts.length - 1];
      if (vimeoId && /^\d+$/.test(vimeoId)) {
        return {
          valid: true,
          embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        };
      }
    }

    // Direct MP4 / WebM / Cloudinary Video
    if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.includes("cloudinary.com") || lower.includes("video")) {
      return {
        valid: true,
        embedUrl: trimmed,
      };
    }

    return { valid: true, embedUrl: trimmed };
  } catch {
    return { valid: false, error: "Invalid video URL format" };
  }
}
