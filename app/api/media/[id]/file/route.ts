import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE_URL, req.url), 307);
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media || !media.url) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE_URL, req.url), 307);
    }

    // 1. Handle Stored Data URI (Permanent Postgres Blob)
    if (media.url.startsWith("data:")) {
      const commaIdx = media.url.indexOf(",");
      if (commaIdx !== -1) {
        const header = media.url.substring(0, commaIdx);
        const base64Data = media.url.substring(commaIdx + 1);
        const mimeMatch = header.match(/^data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : media.mimeType || "image/jpeg";
        const buffer = Buffer.from(base64Data, "base64");

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    // 2. Handle External URLs (e.g., Cloudinary, Unsplash)
    if (media.url.startsWith("http://") || media.url.startsWith("https://")) {
      return NextResponse.redirect(media.url, 307);
    }

    // 3. Handle local disk path (e.g., /uploads/...)
    if (media.url.startsWith("/uploads/")) {
      const localFilePath = path.join(process.cwd(), "public", media.url);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": media.mimeType || "image/jpeg",
            "Content-Length": fileBuffer.length.toString(),
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    // 4. Default fallback redirect
    return NextResponse.redirect(
      new URL(media.url.startsWith("/") ? media.url : FALLBACK_IMAGE_URL, req.url),
      307
    );
  } catch (err: any) {
    console.error("[Media File Stream] Error serving file:", err?.message || err);
    return NextResponse.redirect(new URL(FALLBACK_IMAGE_URL, req.url), 307);
  }
}
