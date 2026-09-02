import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjen-media-news.vercel.app";

  try {
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 50,
    });

    const buildDate = new Date().toUTCString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:dc="http://purl.org/dc/elements/1.1/" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LEADJEN MEDIA — Latest News, Breaking Bulletins &amp; Analysis</title>
    <link>${baseUrl}</link>
    <description>Authoritative digital news covering politics, national affairs, technology, finance, world developments, and investigative journalism.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>LEADJEN MEDIA</title>
      <link>${baseUrl}</link>
    </image>
${articles
  .map((art) => {
    const link = `${baseUrl}/${art.category.slug}/${art.slug}`;
    const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : new Date().toUTCString();
    const cleanTitle = art.title
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
    const cleanExcerpt = art.excerpt
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
    const authorName = art.author?.name || "Leadjen Editorial Desk";
    const categoryName = art.category?.name || "General";

    return `    <item>
      <title>${cleanTitle}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${authorName}]]></dc:creator>
      <category><![CDATA[${categoryName}]]></category>
      <description><![CDATA[${cleanExcerpt}]]></description>
      ${
        art.featuredImage && !art.featuredImage.startsWith("data:")
          ? `<enclosure url="${art.featuredImage}" length="0" type="image/jpeg" />`
          : ""
      }
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error("RSS generation error:", error);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>LEADJEN MEDIA</title></channel></rss>`, {
      status: 200,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
