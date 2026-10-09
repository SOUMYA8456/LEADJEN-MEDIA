import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.leadjenmediadaily.com";

  try {
    // Google News sitemaps require published articles from the last 48 hours or recent articles
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    let articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: {
          gte: fortyEightHoursAgo,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 1000,
    });

    // If few articles in last 48 hours, include the most recent published articles (up to 50)
    if (articles.length === 0) {
      articles = await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
        },
        include: {
          category: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 50,
      });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map((art) => {
    const pubDate = art.publishedAt ? new Date(art.publishedAt).toISOString() : new Date().toISOString();
    const cleanTitle = art.title
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
    const loc = `${baseUrl}/${art.category.slug}/${art.slug}`;

    return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>LEADJEN MEDIA</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${cleanTitle}</news:title>
    </news:news>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("News sitemap generation error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
