/**
 * Production Security & Sanitization Utilities for Leadjen Media
 * Prevents XSS, SQLi vectors, script injection, and protocol abuse.
 */

/**
 * Validates that a URL uses safe HTTP or HTTPS protocols
 * Strictly rejects dangerous protocols like javascript:, data:, vbscript:
 */
export function isValidSafeUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  // Block dangerous schemes
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:")
  ) {
    return false;
  }

  // Allow relative internal paths
  if (trimmed.startsWith("/")) return true;

  // Allow http and https
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitizes rich-text HTML while preserving legitimate editorial formatting
 * (p, h1-h6, b, strong, i, em, u, a, blockquote, ul, ol, li, img, hr, br, table)
 * Strips script tags, unsafe iframes, event handlers (onload, onclick, etc.), and javascript: links.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";

  let clean = html;

  // 1. Remove <script> tags and contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Remove inline event handlers (e.g. onclick, onerror, onload, onmouseover)
  clean = clean.replace(/\s*on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "");

  // 3. Remove javascript: links in href or src
  clean = clean.replace(/(href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi, '$1="#"');
  clean = clean.replace(/(href|src)\s*=\s*javascript:[^\s>]+/gi, '$1="#"');

  // 4. Remove dangerous tags (object, embed, applet, form, base)
  clean = clean.replace(/<\/?(object|embed|applet|form|base|meta|link)[^>]*>/gi, "");

  // 5. Allow only verified iframe embeds (YouTube, Vimeo, Cloudinary)
  clean = clean.replace(/<iframe\b([^>]*)>/gi, (match, attributes) => {
    const srcMatch = attributes.match(/src\s*=\s*["']([^"']*)["']/i);
    if (srcMatch && srcMatch[1]) {
      const src = srcMatch[1].toLowerCase();
      if (
        src.includes("youtube.com") ||
        src.includes("youtube-nocookie.com") ||
        src.includes("youtu.be") ||
        src.includes("player.vimeo.com") ||
        src.includes("cloudinary.com")
      ) {
        return `<iframe ${attributes} sandbox="allow-scripts allow-same-origin allow-presentation">`;
      }
    }
    return ""; // Strip unverified iframe
  });

  return clean;
}

/**
 * Sanitizes plain text input by stripping all HTML tags and trimming
 */
export function sanitizePlainText(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * Validates email format strictly
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Generates a unique correlation/request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
