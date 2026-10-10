import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { getMediaUsages } from "@/lib/media-usage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const media = await prisma.media.findUnique({
      where: { id: params.id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const usages = await getMediaUsages(media.id, media.url, media.filename);
    const publicUrl = media.url && media.url.startsWith("data:")
      ? `/api/media/${media.id}/file`
      : media.url;

    return NextResponse.json({
      media: {
        ...media,
        url: publicUrl,
        usages,
        usageCount: usages.length,
        inUse: usages.length > 0,
      },
    });
  } catch (error) {
    console.error("Media single GET error:", error);
    return NextResponse.json({ error: "Failed to fetch media item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR" && user.role !== "REPORTER")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { altText, originalName } = body;

    const updated = await prisma.media.update({
      where: { id: params.id },
      data: {
        ...(altText !== undefined && { altText }),
        ...(originalName !== undefined && { originalName }),
      },
    });

    const publicUrl = updated.url && updated.url.startsWith("data:")
      ? `/api/media/${updated.id}/file`
      : updated.url;

    return NextResponse.json({
      success: true,
      media: {
        ...updated,
        url: publicUrl,
      },
    });
  } catch (error) {
    console.error("Media PATCH error:", error);
    return NextResponse.json({ error: "Failed to update media item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const existing = await prisma.media.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (!force) {
      const usages = await getMediaUsages(existing.id, existing.url, existing.filename);
      if (usages.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete media asset because it is actively in use in ${usages.length} location(s).`,
            usages,
            requiresForce: true,
          },
          { status: 409 }
        );
      }
    }

    await prisma.media.delete({ where: { id: params.id } });

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "MEDIA_DELETED",
          entityType: "MEDIA",
          entityId: params.id,
          entityTitle: existing.originalName,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Failed to delete media asset" }, { status: 500 });
  }
}
