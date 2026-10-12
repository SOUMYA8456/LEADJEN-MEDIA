/**
 * Leadjen Media YouTube & Video Helper Utilities
 * Provides resilient parsing for all YouTube, Vimeo, and direct video URL formats.
 */

export interface ParsedVideo {
  type: "youtube" | "vimeo" | "direct" | "unknown";
  isValid: boolean;
  videoId?: string;
  embedUrl: string;
  thumbnailUrl?: string;
  originalUrl: string;
}

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts a YouTube Video ID from any standard URL variation:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - Raw 11-char ID
 */
export function extractYouTubeVideoId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  const trimmed = urlOrId.trim();

  // If already an 11-char video ID
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  // Fast pattern matching for YouTube URLs
  const patterns = [
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback URL parser
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = parsed.pathname.slice(1).split("/")[0].split("?")[0];
      if (YOUTUBE_ID_REGEX.test(id)) return id;
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      if (parsed.searchParams.has("v")) {
        const id = parsed.searchParams.get("v");
        if (id && YOUTUBE_ID_REGEX.test(id)) return id;
      }

      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      const embedIdx = pathSegments.findIndex((s) => ["embed", "v", "shorts", "live"].includes(s));
      if (embedIdx !== -1 && pathSegments[embedIdx + 1]) {
        const id = pathSegments[embedIdx + 1];
        if (YOUTUBE_ID_REGEX.test(id)) return id;
      }
    }
  } catch {
    // Invalid URL structure
  }

  return null;
}

/**
 * Checks if a string is a valid YouTube URL or ID
 */
export function isYouTubeUrl(url: string | null | undefined): boolean {
  return !!extractYouTubeVideoId(url);
}

/**
 * Generates privacy-friendly, responsive embed URL for YouTube
 */
export function getYouTubeEmbedUrl(urlOrId: string, autoplay: boolean = true): string | null {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1`;
}

/**
 * Gets high-definition YouTube thumbnail URL with fallback to HQ
 */
export function getYouTubeThumbnailUrl(urlOrId: string, quality: "hq" | "maxres" = "hq"): string | null {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return null;
  if (quality === "maxres") {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Parses any video URL (YouTube, Vimeo, MP4, Cloudinary, etc.)
 */
export function parseVideoUrl(rawUrl: string | null | undefined): ParsedVideo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { type: "unknown", isValid: false, embedUrl: "", originalUrl: "" };
  }

  const trimmed = rawUrl.trim();

  // 1. YouTube
  const ytId = extractYouTubeVideoId(trimmed);
  if (ytId) {
    return {
      type: "youtube",
      isValid: true,
      videoId: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      originalUrl: trimmed,
    };
  }

  // 2. Vimeo
  if (trimmed.includes("vimeo.com")) {
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    const vimeoId = vimeoMatch?.[3] || trimmed.split("/").filter(Boolean).pop();
    if (vimeoId && /^\d+$/.test(vimeoId)) {
      return {
        type: "vimeo",
        isValid: true,
        videoId: vimeoId,
        embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
        originalUrl: trimmed,
      };
    }
  }

  // 3. Direct Video File (MP4, WebM, Cloudinary)
  const lower = trimmed.toLowerCase();
  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.includes("cloudinary.com") ||
    lower.includes("/video/upload/")
  ) {
    return {
      type: "direct",
      isValid: true,
      embedUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // 4. Fallback if it looks like an embed URL
  if (lower.startsWith("https://") || lower.startsWith("http://")) {
    return {
      type: "direct",
      isValid: true,
      embedUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  return {
    type: "unknown",
    isValid: false,
    embedUrl: "",
    originalUrl: trimmed,
  };
}
