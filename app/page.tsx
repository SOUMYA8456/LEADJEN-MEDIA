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
  searchParams?: { preview?: string; t?: string };
}) {
  const now = new Date();

  // 1. Promote scheduled articles whose time has arrived (safe execution)
  try {
    await syncScheduledArticles();
  } catch (err: any) {
    console.warn("[Homepage] syncScheduledArticles error:", err?.message || err);
  }

  // 2. Ensure default editorial homepage configuration exists (safe execution)
  try {
    await ensureDefaultHomepageSections();
  } catch (err: any) {
    console.warn("[Homepage] ensureDefaultHomepageSections error:", err?.message || err);
  }

  // 3. Authenticate draft preview: only authorized staff (SUPER_ADMIN, EDITOR, REPORTER) can view draft
  let isPreviewDraft = false;
  const isPreviewRequested = searchParams?.preview === "draft" || searchParams?.preview === "true";

  if (isPreviewRequested) {
    try {
      const session = await getSession();
      if (
        session &&
        (session.role === "SUPER_ADMIN" || session.role === "EDITOR" || session.role === "REPORTER")
      ) {
        isPreviewDraft = true;
      }
    } catch (err: any) {
      console.warn("[Homepage] Auth check error during preview:", err?.message || err);
    }
  }

  // 4. Fetch active homepage sections in configured order (draft or published)
  let rawSections: any[] = [];
  try {
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
            rawSections = parsed.filter((s: any) => s && s.enabled !== false);
          }
        } catch (parseErr) {
          console.warn("[Homepage] Snapshot parse fallback to database sections");
        }
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
  } catch (secErr: any) {
    console.error("[Homepage] Error loading homepage sections:", secErr?.message || secErr);
  }

  // 5. Fetch Global Section Widgets (Breaking ticker, Video, Photo, Ads, Trending)
  let breakingItems: any[] = [];
  let videoItems: any[] = [];
  let photoGallery: any = null;
  let sidebarAd: any = null;
  let trendingList: any[] = [];

  try {
    const [breakingRes, videoRes, photoRes, adRes, trendingRes] = await Promise.all([
      prisma.breakingNews.findMany({
        where: { isActive: true },
        orderBy: { priority: "asc" },
      }).catch(() => []),
      prisma.videoNews.findMany({
        take: 3,
        orderBy: { publishedAt: "desc" },
      }).catch(() => []),
      prisma.photoGallery.findFirst({
        orderBy: { publishedAt: "desc" },
      }).catch(() => null),
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
      }).catch(() => null),
      prisma.article.findMany({
        where: {
          isTrending: true,
          status: isPreviewDraft ? undefined : "PUBLISHED",
          publishedAt: isPreviewDraft ? undefined : { lte: now },
        },
        select: { title: true },
        take: 6,
      }).catch(() => []),
    ]);

    breakingItems = breakingRes;
    videoItems = videoRes;
    photoGallery = photoRes;
    sidebarAd = adRes;
    trendingList = trendingRes;
  } catch (widgetErr: any) {
    console.warn("[Homepage] Error loading widgets:", widgetErr?.message || widgetErr);
  }

  const sections = Array.isArray(rawSections) ? rawSections.filter(Boolean) : [];
  const trendingTopics = trendingList.map((t) => t.title).filter(Boolean);

  // 6. Resilient content fetching per section
  const statusFilter = isPreviewDraft ? undefined : "PUBLISHED";
  const dateFilter = isPreviewDraft ? undefined : { lte: now };

  const renderedSections = await Promise.all(
    sections.map(async (sec) => {
      let articles: ArticleData[] = [];

      try {
        if (sec.contentSource === "MANUAL" && Array.isArray(sec.manualArticles) && sec.manualArticles.length > 0) {
          articles = sec.manualArticles
            .map((m: any) => m?.article)
            .filter((a: any) => a && (isPreviewDraft || (a.status === "PUBLISHED" && (!a.publishedAt || a.publishedAt <= now)))) as any;
        } else if (sec.contentSource === "CATEGORY" && sec.categoryId) {
          articles = (await prisma.article.findMany({
            where: {
              categoryId: sec.categoryId,
              ...(statusFilter ? { status: statusFilter } : {}),
              ...(dateFilter ? { publishedAt: dateFilter } : {}),
            },
            include: { category: true, author: true },
            orderBy: { publishedAt: "desc" },
            take: Number(sec.storyLimit) || 4,
          })) as any;
        } else if (sec.contentSource === "FEATURED" || sec.type === "HERO") {
          articles = (await prisma.article.findMany({
            where: {
              ...(statusFilter ? { status: statusFilter } : {}),
              ...(dateFilter ? { publishedAt: dateFilter } : {}),
            },
            include: { category: true, author: true },
            orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
            take: Math.max(Number(sec.storyLimit) || 5, 5),
          })) as any;
        } else if (sec.contentSource === "TRENDING" || sec.type === "TRENDING") {
          articles = (await prisma.article.findMany({
            where: {
              isTrending: true,
              ...(statusFilter ? { status: statusFilter } : {}),
              ...(dateFilter ? { publishedAt: dateFilter } : {}),
            },
            include: { category: true, author: true },
            orderBy: { publishedAt: "desc" },
            take: Number(sec.storyLimit) || 4,
          })) as any;
        } else if (sec.contentSource === "MOST_READ" || sec.type === "MOST_READ") {
          articles = (await prisma.article.findMany({
            where: {
              ...(statusFilter ? { status: statusFilter } : {}),
              ...(dateFilter ? { publishedAt: dateFilter } : {}),
            },
            include: { category: true, author: true },
            orderBy: { viewCount: "desc" },
            take: Number(sec.storyLimit) || 6,
          })) as any;
        } else if (sec.contentSource === "LATEST" || sec.type === "LATEST_NEWS" || sec.type === "NEWS_GRID") {
          articles = (await prisma.article.findMany({
            where: {
              ...(statusFilter ? { status: statusFilter } : {}),
              ...(dateFilter ? { publishedAt: dateFilter } : {}),
            },
            include: { category: true, author: true },
            orderBy: { publishedAt: "desc" },
            take: Number(sec.storyLimit) || 6,
          })) as any;
        }
      } catch (secFetchErr: any) {
        console.warn(`[Homepage] Error resolving articles for section ${sec.name || sec.id}:`, secFetchErr?.message || secFetchErr);
        articles = [];
      }

      return {
        section: sec,
        articles: Array.isArray(articles) ? articles : [],
      };
    })
  );

  return (
    <div className="w-full bg-white dark:bg-editorial-darkBg transition-colors min-h-screen">
      {isPreviewDraft && (
        <div className="sticky top-0 z-50 bg-amber-500 text-black px-4 py-1.5 text-xs font-mono font-bold flex items-center justify-between shadow-sm">
          <span>● EDITORIAL DRAFT PREVIEW MODE — Live Unsaved Sections &amp; Drafts Active</span>
          <span className="text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded">Staff Preview</span>
        </div>
      )}
      {renderedSections.map(({ section, articles }, index) => {
        if (!section || !section.type) return null;
        return (
          <DynamicSectionRenderer
            key={section.id || `section-${index}`}
            section={section as any}
            articles={articles}
            breakingItems={breakingItems}
            trendingTopics={trendingTopics}
            videoItems={videoItems}
            photoGallery={photoGallery}
            sidebarAd={sidebarAd}
          />
        );
      })}
    </div>
  );
}
