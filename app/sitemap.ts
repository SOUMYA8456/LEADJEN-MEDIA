import { MetadataRoute } from "next";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.leadjenmediadaily.com";

  let articleEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  let authorEntries: MetadataRoute.Sitemap = [];

  try {
    const [articles, categories, authors] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
        orderBy: { publishedAt: "desc" },
        take: 5000,
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.author.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    articleEntries = articles.map((art) => ({
      url: `${baseUrl}/${art.category.slug}/${art.slug}`,
      lastModified: art.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    categoryEntries = categories.map((cat) => ({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "hourly",
      priority: 0.9,
    }));

    authorEntries = authors.map((auth) => ({
      url: `${baseUrl}/author/${auth.slug}`,
      lastModified: auth.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (e) {
    // Graceful fallback during static build when database is offline
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/videos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/photos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/listen`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...categoryEntries,
    ...authorEntries,
    ...articleEntries,
  ];
}
