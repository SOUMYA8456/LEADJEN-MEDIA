import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { sanitizeVideoUrl } from "@/lib/storage";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const videos = await prisma.videoNews.findMany({
      orderBy: { publishedAt: "desc" },
    });

    // The first item chronologically is the active featured/primary video on the homepage
    const formatted = videos.map((v, idx) => ({
      ...v,
      isFeatured: idx === 0,
    }));

    return NextResponse.json({ videos: formatted });
  } catch (error) {
    console.error("Videos GET error:", error);
    return NextResponse.json({ error: "Failed to fetch video news items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { title, videoUrl, duration = "04:30", thumbnail, category = "Technology", isFeatured } = body;

    if (!title || !videoUrl || !thumbnail) {
      return NextResponse.json(
        { error: "Title, video URL, and thumbnail are required" },
        { status: 400 }
      );
    }

    // Sanitize video URL
    const sanitized = sanitizeVideoUrl(videoUrl);
    if (!sanitized.valid) {
      return NextResponse.json({ error: sanitized.error || "Invalid video URL" }, { status: 400 });
    }

    let baseSlug = slugify(title, { lower: true, strict: true }) || "video-brief";
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.videoNews.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const publishedAt = isFeatured ? new Date() : new Date(Date.now() - 60000);

    const video = await prisma.videoNews.create({
      data: {
        title,
        slug,
        videoUrl: sanitized.embedUrl || videoUrl,
        duration,
        thumbnail,
        category,
        publishedAt,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/videos");
    } catch {}

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "VIDEO_CREATED",
          entityType: "VIDEO",
          entityId: video.id,
          entityTitle: video.title,
          details: JSON.stringify({ isFeatured, videoUrl }),
        },
      });
    } catch {}

    return NextResponse.json({ success: true, video });
  } catch (error: any) {
    console.error("Create video error:", error);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}
