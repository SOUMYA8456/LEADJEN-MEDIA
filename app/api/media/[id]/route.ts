import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const media = await prisma.media.findUnique({
      where: { id: params.id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Media single GET error:", error);
    return NextResponse.json({ error: "Failed to fetch media item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR" && user.role !== "REPORTER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json({ success: true, media: updated });
  } catch (error) {
    console.error("Media PATCH error:", error);
    return NextResponse.json({ error: "Failed to update media item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.media.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
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
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Failed to delete media item" }, { status: 500 });
  }
}
