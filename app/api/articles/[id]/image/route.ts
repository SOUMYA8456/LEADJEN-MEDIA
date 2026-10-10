import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB max

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE_URL, req.url), 307);
    }

    const article = await prisma.article.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: {
        id: true,
        slug: true,
        status: true,
        publishedAt: true,
        featuredImage: true,
      },
    });

    if (!article || !article.featuredImage) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE_URL, req.url), 307);
    }

    const isPublished =
      article.status === "PUBLISHED" &&
      (!article.publishedAt || new Date(article.publishedAt) <= new Date());

    // Authorization check: Private/Draft/Archived articles require authenticated staff role
    if (!isPublished) {
      const session = getSessionFromRequest(req);
      const isStaff =
        session &&
        (session.role === "SUPER_ADMIN" ||
          session.role === "EDITOR" ||
          session.role === "REPORTER");

      if (!isStaff) {
        return new NextResponse(
          JSON.stringify({
            error: "Access denied. Unpublished article media is restricted to editorial staff.",
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
            },
          }
        );
      }
    }

    const imageStr = article.featuredImage;

    // Cache headers: Never publicly cache private/draft media!
    const cacheControl = isPublished
      ? "public, max-age=86400, stale-while-revalidate=604800"
      : "private, no-cache, no-store, max-age=0, must-revalidate";

    // Handle Data URI (e.g. data:image/jpeg;base64,...)
    if (imageStr.startsWith("data:")) {
      const commaIdx = imageStr.indexOf(",");
      if (commaIdx !== -1) {
        const header = imageStr.substring(0, commaIdx);
        const base64Data = imageStr.substring(commaIdx + 1);
        const mimeMatch = header.match(/^data:([^;]+)/);
        const rawMimeType = mimeMatch ? mimeMatch[1].toLowerCase() : "image/jpeg";

        // Content-Type validation against allowed list
        if (!ALLOWED_MIME_TYPES.has(rawMimeType)) {
          console.warn(`[Article Image API] Disallowed MIME type "${rawMimeType}" for article ${article.id}`);
          return NextResponse.redirect(new URL(FALLBACK_IMAGE_URL, req.url), 307);
        }

        const buffer = Buffer.from(base64Data, "base64");

        // Size limit validation (5 MB)
        if (buffer.length > MAX_IMAGE_BYTES) {
          console.warn(`[Article Image API] Image payload exceeds size limit (${buffer.length} bytes) for article ${article.id}`);
          return new NextResponse(
            JSON.stringify({ error: "Image size exceeds maximum allowed limit (5 MB)" }),
            {
              status: 413,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": rawMimeType,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": cacheControl,
            ...(isPublished ? {} : { Pragma: "no-cache" }),
          },
        });
      }
    }

    // Handle standard HTTP / HTTPS URLs
    if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
      try {
        const parsed = new URL(imageStr);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          return NextResponse.redirect(imageStr, {
            status: 307,
            headers: {
              "Cache-Control": cacheControl,
            },
          });
        }
      } catch {
        // Fall through to fallback
      }
    }

    // Relative path or fallback
    return NextResponse.redirect(
      new URL(
        imageStr.startsWith("/") ? imageStr : FALLBACK_IMAGE_URL,
        req.url
      ),
      {
        status: 307,
        headers: {
          "Cache-Control": cacheControl,
        },
      }
    );
  } catch (err: any) {
    console.error("[Article Image API] Error serving article image:", err?.message || err);
    return NextResponse.redirect(
      new URL(FALLBACK_IMAGE_URL, req.url),
      307
    );
  }
}
