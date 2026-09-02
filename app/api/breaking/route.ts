import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { broadcastRealtimeEvent } from "@/lib/realtime";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "true";
    const filter = searchParams.get("filter"); // "active" | "scheduled" | "expired" | "all"

    const now = new Date();

    if (isAdmin) {
      const user = getSessionFromRequest(req);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      let where: any = {};
      if (filter === "active") {
        where = {
          isActive: true,
          status: "ACTIVE",
          startTime: { lte: now },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        };
      } else if (filter === "scheduled") {
        where = {
          isActive: true,
          startTime: { gt: now },
        };
      } else if (filter === "expired") {
        where = {
          OR: [
            { isActive: false },
            { status: "EXPIRED" },
            { expiresAt: { lte: now } },
          ],
        };
      }

      const breaking = await prisma.breakingNews.findMany({
        where,
        orderBy: [
          { priority: "asc" },
          { createdAt: "desc" },
        ],
      });

      return NextResponse.json({ breaking });
    }

    // Public endpoint: only return currently valid active breaking items sorted by priority
    const breaking = await prisma.breakingNews.findMany({
      where: {
        isActive: true,
        status: "ACTIVE",
        startTime: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ breaking });
  } catch (error) {
    console.error("GET /api/breaking error:", error);
    return NextResponse.json({ error: "Failed to fetch breaking news" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "REPORTER") {
      return NextResponse.json(
        { error: "Reporters do not have permission to publish breaking news." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      linkUrl,
      linkedArticleId,
      isLive = false,
      priority = "NORMAL",
      status = "ACTIVE",
      isActive = true,
      startTime,
      expiresAt,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Headline title is required" }, { status: 400 });
    }

    const item = await prisma.breakingNews.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        linkUrl: linkUrl || null,
        linkedArticleId: linkedArticleId || null,
        isLive: Boolean(isLive),
        priority: ["URGENT", "HIGH", "NORMAL", "MEDIUM", "LOW"].includes(priority) ? priority : "NORMAL",
        status: ["ACTIVE", "PAUSED", "EXPIRED"].includes(status) ? status : "ACTIVE",
        isActive: Boolean(isActive),
        startTime: startTime ? new Date(startTime) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Broadcast Real-time Event to all connected browser sessions
    broadcastRealtimeEvent("BREAKING_UPDATE", {
      action: "CREATED",
      id: item.id,
      title: item.title,
      priority: item.priority,
    });

    // Audit Log
    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "BREAKING_CREATED",
      entityType: "BREAKING_NEWS",
      entityId: item.id,
      entityTitle: item.title,
      details: { priority: item.priority, isLive: item.isLive, status: item.status },
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("POST /api/breaking error:", error);
    return NextResponse.json({ error: "Failed to create breaking item" }, { status: 500 });
  }
}
