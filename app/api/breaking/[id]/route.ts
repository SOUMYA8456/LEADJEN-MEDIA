import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { broadcastRealtimeEvent } from "@/lib/realtime";
import { revalidatePath } from "next/cache";

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
        { error: "Reporters do not have permission to manage breaking news." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const existing = await prisma.breakingNews.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Breaking item not found" }, { status: 404 });
    }

    const {
      title,
      description,
      linkUrl,
      linkedArticleId,
      isLive,
      priority,
      status,
      isActive,
      startTime,
      expiresAt,
    } = body;

    const updated = await prisma.breakingNews.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
        linkUrl: linkUrl !== undefined ? linkUrl : existing.linkUrl,
        linkedArticleId: linkedArticleId !== undefined ? linkedArticleId : existing.linkedArticleId,
        isLive: isLive !== undefined ? Boolean(isLive) : existing.isLive,
        priority: priority !== undefined ? priority : existing.priority,
        status: status !== undefined ? status : existing.status,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        startTime: startTime ? new Date(startTime) : existing.startTime,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existing.expiresAt,
      },
    });

    // Broadcast Real-time Event
    broadcastRealtimeEvent("BREAKING_UPDATE", {
      action: "UPDATED",
      id: updated.id,
      title: updated.title,
      priority: updated.priority,
      status: updated.status,
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "BREAKING_UPDATED",
      entityType: "BREAKING_NEWS",
      entityId: updated.id,
      entityTitle: updated.title,
      details: { priority: updated.priority, isActive: updated.isActive, status: updated.status },
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("PUT /api/breaking/[id] error:", error);
    return NextResponse.json({ error: "Failed to update breaking item" }, { status: 500 });
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
        { error: "Reporters do not have permission to delete breaking news." },
        { status: 403 }
      );
    }

    const existing = await prisma.breakingNews.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Breaking item not found" }, { status: 404 });
    }

    await prisma.breakingNews.delete({
      where: { id: params.id },
    });

    // Broadcast Real-time Event
    broadcastRealtimeEvent("BREAKING_UPDATE", {
      action: "DELETED",
      id: params.id,
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "BREAKING_DELETED",
      entityType: "BREAKING_NEWS",
      entityId: params.id,
      entityTitle: existing.title,
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, message: "Breaking news deleted" });
  } catch (error) {
    console.error("DELETE /api/breaking/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete breaking item" }, { status: 500 });
  }
}
