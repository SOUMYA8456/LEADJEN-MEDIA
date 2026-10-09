import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.redirect(
        new URL("https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80", req.url),
        307
      );
    }

    const article = await prisma.article.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: {
        featuredImage: true,
      },
    });

    if (!article || !article.featuredImage) {
      return NextResponse.redirect(
        new URL("https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80", req.url),
        307
      );
    }

    const imageStr = article.featuredImage;

    // Handle Data URI (e.g. data:image/jpeg;base64,...)
    if (imageStr.startsWith("data:")) {
      const commaIdx = imageStr.indexOf(",");
      if (commaIdx !== -1) {
        const header = imageStr.substring(0, commaIdx);
        const base64Data = imageStr.substring(commaIdx + 1);
        const mimeMatch = header.match(/^data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
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

    // Handle standard HTTP / HTTPS URLs
    if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
      return NextResponse.redirect(imageStr, 307);
    }

    // Relative path or fallback
    return NextResponse.redirect(
      new URL(imageStr.startsWith("/") ? imageStr : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80", req.url),
      307
    );
  } catch (err: any) {
    console.error("[Article Image API] Error serving article image:", err?.message || err);
    return NextResponse.redirect(
      new URL("https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80", req.url),
      307
    );
  }
}
