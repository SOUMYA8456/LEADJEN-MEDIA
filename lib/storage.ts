import crypto from "crypto";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/jpg",
];

export const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/aac",
  "audio/m4a",
  "audio/ogg",
  "audio/x-m4a",
];

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
export const ALLOWED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".aac", ".m4a", ".ogg"];
export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_AUDIO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export interface ValidationResult {
  valid: boolean;
  mediaCategory?: "image" | "audio" | "video";
  error?: string;
}

/**
 * Validates file extension, MIME type, and size.
 * Disallows executable scripts, HTML, SVG, or path traversal patterns.
 */
export function validateMediaFile(
  file: File | { name: string; type: string; size: number }
): ValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  const mimeType = (file.type || "").toLowerCase().trim();
  const rawFileName = (file.name || "").toLowerCase().trim();

  // Guard against path traversal patterns
  if (rawFileName.includes("..") || rawFileName.includes("/") || rawFileName.includes("\\")) {
    return { valid: false, error: "Invalid filename. Path traversal characters detected." };
  }

  // Determine media category
  const isImage =
    ALLOWED_IMAGE_MIME_TYPES.includes(mimeType) ||
    ALLOWED_IMAGE_EXTENSIONS.some((ext) => rawFileName.endsWith(ext));

  const isAudio =
    ALLOWED_AUDIO_MIME_TYPES.includes(mimeType) ||
    ALLOWED_AUDIO_EXTENSIONS.some((ext) => rawFileName.endsWith(ext));

  const isVideo =
    ALLOWED_VIDEO_MIME_TYPES.includes(mimeType) ||
    ALLOWED_VIDEO_EXTENSIONS.some((ext) => rawFileName.endsWith(ext));

  if (!isImage && !isAudio && !isVideo) {
    return {
      valid: false,
      error:
        "Unsupported file format. Please upload an image (JPG, PNG, WEBP, GIF), audio podcast (MP3, WAV, AAC, M4A), or video (MP4, WEBM).",
    };
  }

  if (isImage) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return { valid: false, error: "Image file exceeds maximum limit of 10 MB." };
    }
    return { valid: true, mediaCategory: "image" };
  }

  if (isAudio) {
    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      return { valid: false, error: "Audio file exceeds maximum limit of 50 MB." };
    }
    return { valid: true, mediaCategory: "audio" };
  }

  if (isVideo) {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return { valid: false, error: "Video file exceeds maximum limit of 100 MB." };
    }
    return { valid: true, mediaCategory: "video" };
  }

  return { valid: false, error: "Unsupported file type" };
}

// Backward-compatible alias for existing callers
export function validateImageFile(file: File | { name: string; type: string; size: number }): ValidationResult {
  return validateMediaFile(file);
}

/**
 * Generates safe, sanitized filename with random hash to prevent naming collisions
 */
export function generateSafeFilename(originalName: string): string {
  const sanitized = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const dotIndex = sanitized.lastIndexOf(".");
  if (dotIndex !== -1) {
    const base = sanitized.substring(0, dotIndex).substring(0, 50);
    const ext = sanitized.substring(dotIndex);
    return `${Date.now()}_${base}_${randomSuffix}${ext}`;
  }
  return `${Date.now()}_${sanitized.substring(0, 50)}_${randomSuffix}`;
}

/**
 * Uploads media using Cloudinary (if credentials exist) or persists in permanent storage.
 */
export async function uploadMedia(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; publicId: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const safeFilename = generateSafeFilename(filename);

  // 1. If Cloudinary credentials exist, perform signed upload
  if (cloudName && apiKey && apiSecret && cloudName.trim() && apiKey.trim() && apiSecret.trim()) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signatureString = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

      const resourceType = mimeType.startsWith("video/")
        ? "video"
        : mimeType.startsWith("audio/")
        ? "auto"
        : "image";

      const formData = new FormData();
      const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
      formData.append("file", blob, safeFilename);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          return {
            url: data.secure_url,
            publicId: data.public_id || safeFilename,
          };
        }
      } else {
        console.warn("[Storage] Cloudinary upload returned non-200, falling back to permanent storage:", await res.text());
      }
    } catch (cloudErr) {
      console.warn("[Storage] Cloudinary upload failed, falling back to permanent storage:", cloudErr);
    }
  }

  // 2. Permanent Data Storage Fallback (Stored in Postgres)
  const base64Data = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  const publicId = `media_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

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
