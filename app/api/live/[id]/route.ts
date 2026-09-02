import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { broadcastRealtimeEvent } from "@/lib/realtime";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "REPORTER") {
      return NextResponse.json(
        { error: "Reporters do not have permission to modify live updates." },
        { status: 403 }
      );
    }

    const { title, content, authorName, isUrgent, imageUrl, videoUrl } =
      await req.json();

    const existing = await prisma.liveUpdate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Live update not found" }, { status: 404 });
    }

    const updated = await prisma.liveUpdate.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        content: content !== undefined ? content.trim() : existing.content,
        authorName: authorName !== undefined ? authorName : existing.authorName,
        isUrgent: isUrgent !== undefined ? Boolean(isUrgent) : existing.isUrgent,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
      },
    });

    // Broadcast Real-time Event
    broadcastRealtimeEvent("LIVE_UPDATE", {
      action: "UPDATED",
      update: updated,
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "LIVE_UPDATE_EDITED",
      entityType: "LIVE_UPDATE",
      entityId: updated.id,
      entityTitle: updated.title,
    });

    return NextResponse.json({ success: true, update: updated });
  } catch (error) {
    console.error("PUT /api/live/[id] error:", error);
    return NextResponse.json({ error: "Failed to edit live update" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "REPORTER") {
      return NextResponse.json(
        { error: "Reporters do not have permission to delete live updates." },
        { status: 403 }
      );
    }

    const existing = await prisma.liveUpdate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Live update not found" }, { status: 404 });
    }

    await prisma.liveUpdate.delete({
      where: { id: params.id },
    });

    // Broadcast Real-time Event
    broadcastRealtimeEvent("LIVE_UPDATE", {
      action: "DELETED",
      id: params.id,
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "LIVE_UPDATE_DELETED",
      entityType: "LIVE_UPDATE",
      entityId: params.id,
      entityTitle: existing.title,
    });

    return NextResponse.json({ success: true, message: "Live update deleted" });
  } catch (error) {
    console.error("DELETE /api/live/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete live update" }, { status: 500 });
  }
}
