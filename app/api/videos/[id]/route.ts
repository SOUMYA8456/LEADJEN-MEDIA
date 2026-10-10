import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { sanitizeVideoUrl } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { title, videoUrl, duration, thumbnail, category, isFeatured } = body;

    const existing = await prisma.videoNews.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (duration !== undefined) updateData.duration = duration;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (category !== undefined) updateData.category = category;

    if (videoUrl !== undefined) {
      const sanitized = sanitizeVideoUrl(videoUrl);
      if (!sanitized.valid) {
        return NextResponse.json({ error: sanitized.error || "Invalid video URL" }, { status: 400 });
      }
      updateData.videoUrl = sanitized.embedUrl || videoUrl;
    }

    // Promoting to featured video: update publishedAt to now so it is chronologically first
    if (isFeatured) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.videoNews.update({
      where: { id: params.id },
      data: updateData,
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
          action: "VIDEO_UPDATED",
          entityType: "VIDEO",
          entityId: updated.id,
          entityTitle: updated.title,
          details: JSON.stringify(updateData),
        },
      });
    } catch {}

    return NextResponse.json({ success: true, video: updated });
  } catch (error: any) {
    console.error("Update video error:", error);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized access. Super Admin permission required." }, { status: 401 });
    }

    const existing = await prisma.videoNews.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Count remaining videos
    const count = await prisma.videoNews.count();
    if (count <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the only remaining video broadcast on the website. Please replace it or add another video first." },
        { status: 400 }
      );
    }

    await prisma.videoNews.delete({ where: { id: params.id } });

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
          action: "VIDEO_DELETED",
          entityType: "VIDEO",
          entityId: params.id,
          entityTitle: existing.title,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, message: "Video deleted successfully" });
  } catch (error: any) {
    console.error("Delete video error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
