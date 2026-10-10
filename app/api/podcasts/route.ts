import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { DEFAULT_PODCAST_EPISODES } from "@/lib/podcast-defaults";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.siteSettings.findFirst({
      select: { siteConfigJson: true },
    });

    let episodes = DEFAULT_PODCAST_EPISODES;
    if (settings?.siteConfigJson) {
      try {
        const parsed = JSON.parse(settings.siteConfigJson);
        if (Array.isArray(parsed.podcastEpisodes) && parsed.podcastEpisodes.length > 0) {
          episodes = parsed.podcastEpisodes;
        }
      } catch {}
    }

    return NextResponse.json({ episodes });
  } catch (error) {
    console.error("Podcasts GET error:", error);
    return NextResponse.json({ episodes: DEFAULT_PODCAST_EPISODES });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { episodeId, coverImage, audioUrl, title, series, host, description, duration, category } = body;

    if (!episodeId) {
      return NextResponse.json({ error: "Episode ID is required" }, { status: 400 });
    }

    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: "default" } });
    }

    let config: any = {};
    try {
      config = settings.siteConfigJson ? JSON.parse(settings.siteConfigJson) : {};
    } catch {}

    if (!Array.isArray(config.podcastEpisodes) || config.podcastEpisodes.length === 0) {
      config.podcastEpisodes = JSON.parse(JSON.stringify(DEFAULT_PODCAST_EPISODES));
    }

    const epIndex = config.podcastEpisodes.findIndex((e: any) => e.id === episodeId);
    if (epIndex === -1) {
      return NextResponse.json({ error: "Podcast episode not found" }, { status: 404 });
    }

    const ep = config.podcastEpisodes[epIndex];
    if (coverImage !== undefined) ep.coverImage = coverImage;
    if (audioUrl !== undefined) ep.audioUrl = audioUrl;
    if (title !== undefined) ep.title = title;
    if (series !== undefined) ep.series = series;
    if (host !== undefined) ep.host = host;
    if (description !== undefined) ep.description = description;
    if (duration !== undefined) ep.duration = duration;
    if (category !== undefined) ep.category = category;

    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { siteConfigJson: JSON.stringify(config) },
    });

    try {
      revalidatePath("/");
      revalidatePath("/listen");
    } catch {}

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "PODCAST_UPDATED",
          entityType: "PODCAST",
          entityId: episodeId,
          entityTitle: ep.title,
          details: JSON.stringify({ coverImage, audioUrl, title }),
        },
      });
    } catch {}

    return NextResponse.json({ success: true, episode: ep });
  } catch (error: any) {
    console.error("Update podcast error:", error);
    return NextResponse.json({ error: "Failed to update podcast" }, { status: 500 });
  }
}
