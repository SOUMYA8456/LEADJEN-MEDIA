import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { RateLimiters } from "@/lib/rate-limit";
import { sanitizePlainText } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Rate Limiting: 30 requests per minute
    const rateLimit = RateLimiters.search(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many search requests. Please slow down." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawQ = searchParams.get("q") || "";
    const q = sanitizePlainText(rawQ).slice(0, 150); // limit query length
    const category = searchParams.get("category");
    const type = searchParams.get("type") || "all"; // all, news, videos, photos
    const sort = searchParams.get("sort") || "latest"; // latest, most_read

    const where: any = {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    };

    if (q.trim()) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
        { author: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    const orderBy: any = {};
    if (sort === "most_read") {
      orderBy.viewCount = "desc";
    } else {
      orderBy.publishedAt = "desc";
    }

    let articles: any[] = [];
    let videos: any[] = [];
    let photos: any[] = [];

    if (type === "all" || type === "news") {
      articles = await prisma.article.findMany({
        where,
        include: {
          category: true,
          author: true,
        },
        orderBy,
        take: 40,
      });
    }

    if (type === "all" || type === "videos") {
      const videoWhere: any = {};
      if (q.trim()) {
        videoWhere.OR = [
          { title: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ];
      }
      videos = await prisma.videoNews.findMany({
        where: videoWhere,
        orderBy: { publishedAt: "desc" },
        take: 10,
      });
    }

    if (type === "all" || type === "photos") {
      const photoWhere: any = {};
      if (q.trim()) {
        photoWhere.OR = [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ];
      }
      photos = await prisma.photoGallery.findMany({
        where: photoWhere,
        orderBy: { publishedAt: "desc" },
        take: 10,
      });
    }

    return NextResponse.json({
      articles,
      videos,
      photos,
      count: articles.length + videos.length + photos.length,
      query: q,
      type,
      sort,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
