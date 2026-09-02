import { NextRequest, NextResponse } from "next/server";
import prisma, { syncScheduledArticles } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await syncScheduledArticles();

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "today";

    const now = new Date();
    let startDate: Date;

    if (range === "yesterday") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "30days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "all") {
      startDate = new Date(0);
    } else {
      // today
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    }

    const [
      totalArticles,
      publishedInRange,
      breakingCount,
      activeAdsCount,
      adAgg,
      totalViewsAgg,
      topArticles,
      trendingArticles,
      categories,
      authors,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({
        where: {
          status: "PUBLISHED",
          publishedAt: { gte: startDate },
        },
      }),
      prisma.breakingNews.count({ where: { isActive: true } }),
      prisma.advertisement.count({ where: { isActive: true, status: "ACTIVE" } }),
      prisma.advertisement.aggregate({
        _sum: { viewCount: true, clickCount: true },
      }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        take: 10,
        orderBy: { viewCount: "desc" },
        include: { category: true, author: true },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED", isTrending: true },
        take: 10,
        orderBy: { updatedAt: "desc" },
        include: { category: true, author: true },
      }),
      prisma.category.findMany({
        include: {
          articles: {
            where: { status: "PUBLISHED" },
            select: { viewCount: true },
          },
        },
      }),
      prisma.author.findMany({
        include: {
          articles: {
            where: { status: "PUBLISHED" },
            select: { viewCount: true },
          },
        },
      }),
    ]);

    const totalViews = totalViewsAgg._sum.viewCount || 0;
    const adImpressions = adAgg._sum.viewCount || 0;
    const adClicks = adAgg._sum.clickCount || 0;
    const adCtr = adImpressions > 0 ? Number(((adClicks / adImpressions) * 100).toFixed(2)) : 0;

    // Aggregate category performance
    const categoryPerformance = categories
      .map((cat) => {
        const catViews = cat.articles.reduce((acc, a) => acc + (a.viewCount || 0), 0);
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          articleCount: cat.articles.length,
          totalViews: catViews,
        };
      })
      .sort((a, b) => b.totalViews - a.totalViews);

    // Aggregate author performance
    const authorPerformance = authors
      .map((aut) => {
        const autViews = aut.articles.reduce((acc, a) => acc + (a.viewCount || 0), 0);
        return {
          id: aut.id,
          name: aut.name,
          slug: aut.slug,
          designation: aut.designation,
          avatar: aut.avatar,
          articleCount: aut.articles.length,
          totalViews: autViews,
        };
      })
      .sort((a, b) => b.totalViews - a.totalViews);

    return NextResponse.json({
      range,
      overview: {
        totalViews,
        articlesPublished: publishedInRange,
        totalArticles,
        breakingNews: breakingCount,
        activeAds: activeAdsCount,
        adImpressions,
        adClicks,
        adCtr,
      },
      mostRead: topArticles, // Real reader views
      trending: trendingArticles, // Editorially designated trending
      topCategories: categoryPerformance,
      topAuthors: authorPerformance,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
