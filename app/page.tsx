import React from "react";
import prisma, { syncScheduledArticles } from "@/lib/db";
import { ensureDefaultHomepageSections } from "@/lib/homepage-defaults";
import { DynamicSectionRenderer } from "@/components/news/DynamicSectionRenderer";
import { ArticleData } from "@/components/news/NewsCard";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { preview?: string };
}) {
  // 1. Promote scheduled articles whose time has arrived
  await syncScheduledArticles();

  // 2. Ensure default editorial homepage configuration exists
  await ensureDefaultHomepageSections();

  // 3. Authenticate draft preview: only authorized staff (SUPER_ADMIN, EDITOR, REPORTER) can view draft
  let isPreviewDraft = false;
  if (searchParams?.preview === "draft" || searchParams?.preview === "true") {
    const session = await getSession();
    if (session && (session.role === "SUPER_ADMIN" || session.role === "EDITOR" || session.role === "REPORTER")) {
      isPreviewDraft = true;
    }
  }

  const now = new Date();

  // 4. Fetch active homepage sections in configured order (draft or published)
  let rawSections: any[] = [];
  if (isPreviewDraft) {
    rawSections = await prisma.homepageSection.findMany({
      where: { enabled: true },
      include: {
        category: true,
        manualArticles: {
          include: {
            article: {
              include: { category: true, author: true },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  } else {
    // Public visitors load the latest published version snapshot
    const latestPublished = await prisma.homepageVersion.findFirst({
      orderBy: { publishedAt: "desc" },
    });

    if (latestPublished && latestPublished.snapshot) {
      try {
        const parsed = JSON.parse(latestPublished.snapshot);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawSections = parsed.filter((s: any) => s.enabled !== false);
        }
      } catch {}
    }

    if (rawSections.length === 0) {
      rawSections = await prisma.homepageSection.findMany({
        where: { enabled: true },
        include: {
          category: true,
          manualArticles: {
            include: {
              article: {
                include: { category: true, author: true },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      });
    }
  }

  const [breakingItems, videoItems, photoGallery, sidebarAd, trendingList] =
    await Promise.all([
      prisma.breakingNews.findMany({
        where: { isActive: true },
        orderBy: { priority: "asc" },
      }),
      prisma.videoNews.findMany({
        take: 3,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.photoGallery.findFirst({
        orderBy: { publishedAt: "desc" },
      }),
      prisma.advertisement.findFirst({
        where: {
          location: "SIDEBAR_AD",
          isActive: true,
          status: "ACTIVE",
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
        orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      }),
      prisma.article.findMany({
        where: { isTrending: true, status: "PUBLISHED", publishedAt: { lte: now } },
        select: { title: true },
        take: 6,
      }),
    ]);

  const sections = rawSections;

  const trendingTopics = trendingList.map((t) => t.title);

  // 4. Fetch content for each section based on its contentSource
  const renderedSections = await Promise.all(
    sections.map(async (sec) => {
      let articles: ArticleData[] = [];

      if (sec.contentSource === "MANUAL" && sec.manualArticles && sec.manualArticles.length > 0) {
        articles = sec.manualArticles
          .map((m: any) => m.article)
          .filter((a: any) => a && a.status === "PUBLISHED" && (!a.publishedAt || a.publishedAt <= now)) as any;
      } else if (sec.contentSource === "CATEGORY" && sec.categoryId) {
        articles = (await prisma.article.findMany({
          where: {
            categoryId: sec.categoryId,
            status: "PUBLISHED",
            publishedAt: { lte: now },
          },
          include: { category: true, author: true },
          orderBy: { publishedAt: "desc" },
          take: sec.storyLimit || 4,
        })) as any;
      } else if (sec.contentSource === "FEATURED" || sec.type === "HERO") {
        articles = (await prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            publishedAt: { lte: now },
          },
          include: { category: true, author: true },
          orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
          take: Math.max(sec.storyLimit || 5, 5),
        })) as any;
      } else if (sec.contentSource === "TRENDING" || sec.type === "TRENDING") {
        articles = (await prisma.article.findMany({
          where: {
            isTrending: true,
            status: "PUBLISHED",
            publishedAt: { lte: now },
          },
          include: { category: true, author: true },
          orderBy: { publishedAt: "desc" },
          take: sec.storyLimit || 4,
        })) as any;
      } else if (sec.contentSource === "MOST_READ" || sec.type === "MOST_READ") {
        articles = (await prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            publishedAt: { lte: now },
          },
          include: { category: true, author: true },
          orderBy: { viewCount: "desc" },
          take: sec.storyLimit || 6,
        })) as any;
      } else if (sec.contentSource === "LATEST" || sec.type === "LATEST_NEWS" || sec.type === "NEWS_GRID") {
        articles = (await prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            publishedAt: { lte: now },
          },
          include: { category: true, author: true },
          orderBy: { publishedAt: "desc" },
          take: sec.storyLimit || 6,
        })) as any;
      }

      return {
        section: sec,
        articles,
      };
    })
  );

  return (
    <div className="w-full bg-white dark:bg-editorial-darkBg transition-colors min-h-screen">
      {renderedSections.map(({ section, articles }) => (
        <DynamicSectionRenderer
          key={section.id}
          section={section as any}
          articles={articles}
          breakingItems={breakingItems}
          trendingTopics={trendingTopics}
          videoItems={videoItems}
          photoGallery={photoGallery}
          sidebarAd={sidebarAd}
        />
      ))}
    </div>
  );
}
