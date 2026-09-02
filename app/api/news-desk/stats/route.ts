import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const now = new Date();

    const [
      totalArticles,
      draftsCount,
      inReviewCount,
      approvedCount,
      scheduledCount,
      publishedTodayCount,
      activeBreakingCount,
      activeBreakingList,
      totalViewsAgg,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.article.count({ where: { status: "IN_REVIEW" } }),
      prisma.article.count({ where: { status: "APPROVED" } }),
      prisma.article.count({ where: { status: "SCHEDULED" } }),
      prisma.article.count({
        where: {
          status: "PUBLISHED",
          publishedAt: { gte: startOfToday },
        },
      }),
      prisma.breakingNews.count({
        where: {
          isActive: true,
          startTime: { lte: now },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      prisma.breakingNews.findMany({
        where: {
          isActive: true,
          startTime: { lte: now },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        take: 5,
      }),
      prisma.article.aggregate({
        _sum: { viewCount: true },
      }),
    ]);

    const totalViews = totalViewsAgg._sum.viewCount || 0;

    return NextResponse.json({
      stats: {
        totalArticles,
        drafts: draftsCount,
        inReview: inReviewCount,
        approved: approvedCount,
        scheduled: scheduledCount,
        publishedToday: publishedTodayCount,
        activeBreaking: activeBreakingCount,
        totalViews,
      },
      activeBreaking: activeBreakingList,
    });
  } catch (error) {
    console.error("GET /api/news-desk/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
