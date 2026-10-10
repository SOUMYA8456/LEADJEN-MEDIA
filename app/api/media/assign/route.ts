import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR" && user.role !== "REPORTER")) {
      return NextResponse.json({ error: "Unauthorized access. Staff permission required." }, { status: 401 });
    }

    const body = await req.json();
    const { mediaUrl, targetType, targetId, field } = body;

    if (!mediaUrl || !targetType || !targetId) {
      return NextResponse.json(
        { error: "Missing required fields: mediaUrl, targetType, targetId" },
        { status: 400 }
      );
    }

    let affectedEntityTitle = "";

    // 1. Assign to Article
    if (targetType === "article") {
      const article = await prisma.article.findUnique({
        where: { id: targetId },
        include: { category: true },
      });

      if (!article) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }

      await prisma.article.update({
        where: { id: targetId },
        data: { featuredImage: mediaUrl },
      });

      affectedEntityTitle = article.title;
      try {
        revalidatePath("/");
        if (article.category?.slug) {
          revalidatePath(`/${article.category.slug}`);
          revalidatePath(`/${article.category.slug}/${article.slug}`);
        }
      } catch {}
    }

    // 2. Assign to Video News / Featured Video
    else if (targetType === "video") {
      const video = await prisma.videoNews.findUnique({
        where: { id: targetId },
      });

      if (!video) {
        return NextResponse.json({ error: "Video record not found" }, { status: 404 });
      }

      const updateData: any = {};
      if (field === "videoUrl") {
        updateData.videoUrl = mediaUrl;
      } else {
        updateData.thumbnail = mediaUrl;
      }

      await prisma.videoNews.update({
        where: { id: targetId },
        data: updateData,
      });

      affectedEntityTitle = video.title;
      try {
        revalidatePath("/");
        revalidatePath("/videos");
      } catch {}
    }

    // 3. Assign to Podcast Episode
    else if (targetType === "podcast") {
      let settings = await prisma.siteSettings.findFirst();
      if (!settings) {
        settings = await prisma.siteSettings.create({ data: { id: "default" } });
      }

      let config: any = {};
      try {
        config = settings.siteConfigJson ? JSON.parse(settings.siteConfigJson) : {};
      } catch {}

      if (!Array.isArray(config.podcastEpisodes)) {
        config.podcastEpisodes = [
          {
            id: "ep-1",
            title: "Leadjen Daily Brief: Global Trade Policy Shifts, Semiconductor Corridors & Market Open",
            series: "Leadjen Daily Brief",
            duration: "08:45",
            publishedAt: "Today • 06:30 AM IST",
            description: "Executive morning briefing on India's manufacturing and economic policy.",
            coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
            category: "Daily Briefing",
            host: "Aarav Sharma & Editorial Desk",
          },
          {
            id: "ep-2",
            title: "Inside the AI Sovereign Compute Race: How Nations Are Building National Infrastructure",
            series: "Tech Dispatches",
            duration: "24:18",
            publishedAt: "Yesterday",
            description: "Investigative deep dive into sovereign computing and silicon supply chains.",
            coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
            category: "Technology",
            host: "Vikram Malhotra",
          },
          {
            id: "ep-3",
            title: "The Closing Bell: Central Bank Rate Trajectories and Asian Equity Momentum",
            series: "Business & Markets",
            duration: "14:20",
            publishedAt: "Aug 30, 2026",
            description: "Comprehensive financial recap analyzing institutional capital flows.",
            coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
            category: "Business",
            host: "Priya Nair",
          },
          {
            id: "ep-4",
            title: "Geopolitics Unfolded: Maritime Security Corridors and Southern Hemisphere Trade Routes",
            series: "World Brief",
            duration: "19:50",
            publishedAt: "Aug 29, 2026",
            description: "Foreign affairs analysis on naval diplomacy and infrastructure pacts.",
            coverImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
            category: "World",
            host: "Global Bureau Team",
          },
          {
            id: "ep-5",
            title: "Clean Grid Transition: The Real Engineering Challenges of Round-the-Clock Renewables",
            series: "Special Investigations",
            duration: "28:10",
            publishedAt: "Aug 28, 2026",
            description: "Technical discussion on pumped storage and high-voltage transmission lines.",
            coverImage: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
            category: "Science",
            host: "Rohan Sengupta",
          },
        ];
      }

      const epIndex = config.podcastEpisodes.findIndex((e: any) => e.id === targetId);
      if (epIndex !== -1) {
        if (field === "audioUrl") {
          config.podcastEpisodes[epIndex].audioUrl = mediaUrl;
        } else {
          config.podcastEpisodes[epIndex].coverImage = mediaUrl;
        }
        affectedEntityTitle = config.podcastEpisodes[epIndex].title;
      } else {
        return NextResponse.json({ error: "Podcast episode not found" }, { status: 404 });
      }

      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: { siteConfigJson: JSON.stringify(config) },
      });

      try {
        revalidatePath("/");
        revalidatePath("/listen");
      } catch {}
    }

    // 4. Assign to Site Branding (Publication Logo)
    else if (targetType === "branding") {
      let settings = await prisma.siteSettings.findFirst();
      if (!settings) {
        settings = await prisma.siteSettings.create({ data: { id: "default" } });
      }

      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: { logoImage: mediaUrl },
      });

      affectedEntityTitle = "Leadjen Media Publication Logo";
      try {
        revalidatePath("/");
      } catch {}
    }

    // 5. Assign to Photo Gallery Cover
    else if (targetType === "photoGallery") {
      const gallery = await prisma.photoGallery.findUnique({
        where: { id: targetId },
      });

      if (!gallery) {
        return NextResponse.json({ error: "Photo Gallery not found" }, { status: 404 });
      }

      await prisma.photoGallery.update({
        where: { id: targetId },
        data: { coverImage: mediaUrl },
      });

      affectedEntityTitle = gallery.title;
      try {
        revalidatePath("/");
        revalidatePath("/photos");
      } catch {}
    }

    // 6. Assign to Advertisement Banner
    else if (targetType === "advertisement") {
      const ad = await prisma.advertisement.findUnique({
        where: { id: targetId },
      });

      if (!ad) {
        return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
      }

      await prisma.advertisement.update({
        where: { id: targetId },
        data: { imageUrl: mediaUrl },
      });

      affectedEntityTitle = ad.name;
      try {
        revalidatePath("/");
      } catch {}
    } else {
      return NextResponse.json({ error: `Unsupported targetType: ${targetType}` }, { status: 400 });
    }

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "MEDIA_ASSIGNED",
          entityType: targetType.toUpperCase(),
          entityId: targetId,
          entityTitle: affectedEntityTitle,
          details: JSON.stringify({ mediaUrl, field: field || "primary", targetType }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Media successfully assigned to ${targetType}: "${affectedEntityTitle}"`,
      targetType,
      targetId,
      mediaUrl,
    });
  } catch (error: any) {
    console.error("Assign media error:", error);
    return NextResponse.json({ error: "Failed to assign media reference" }, { status: 500 });
  }
}
