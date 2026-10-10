import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { DEFAULT_PODCAST_EPISODES } from "@/lib/podcast-defaults";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR" && user.role !== "REPORTER")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const [articles, videos, photoGalleries, advertisements, siteSettings] = await Promise.all([
      prisma.article.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          featuredImage: true,
          status: true,
          updatedAt: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
      prisma.videoNews.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          videoUrl: true,
          thumbnail: true,
          duration: true,
          category: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.photoGallery.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          description: true,
          photographer: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.advertisement.findMany({
        select: {
          id: true,
          name: true,
          location: true,
          imageUrl: true,
          isActive: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.siteSettings.findFirst({
        select: {
          id: true,
          logoImage: true,
          siteName: true,
          siteConfigJson: true,
        },
      }),
    ]);

    let podcastEpisodes = DEFAULT_PODCAST_EPISODES;
    if (siteSettings?.siteConfigJson) {
      try {
        const parsed = JSON.parse(siteSettings.siteConfigJson);
        if (Array.isArray(parsed.podcastEpisodes) && parsed.podcastEpisodes.length > 0) {
          podcastEpisodes = parsed.podcastEpisodes;
        }
      } catch {}
    }

    return NextResponse.json({
      articles,
      videos: videos.map((v, idx) => ({ ...v, isFeatured: idx === 0 })),
      podcasts: podcastEpisodes,
      photoGalleries,
      advertisements,
      branding: {
        logoImage: siteSettings?.logoImage || null,
        siteName: siteSettings?.siteName || "LEADJEN MEDIA",
      },
    });
  } catch (error: any) {
    console.error("Media placements GET error:", error);
    return NextResponse.json({ error: "Failed to fetch media placements" }, { status: 500 });
  }
}
