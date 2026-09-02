import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { broadcastRealtimeEvent } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coverageId = searchParams.get("coverageId");

    // Fetch active live coverage
    let activeCoverage = null;
    if (coverageId) {
      activeCoverage = await prisma.liveCoverage.findUnique({
        where: { id: coverageId },
      });
    } else {
      activeCoverage = await prisma.liveCoverage.findFirst({
        where: { status: { in: ["LIVE", "PAUSED", "UPCOMING"] } },
        orderBy: { startedAt: "desc" },
      });
    }

    const where: any = {};
    if (activeCoverage) {
      where.coverageId = activeCoverage.id;
    }

    const liveUpdates = await prisma.liveUpdate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      coverage: activeCoverage,
      liveUpdates,
    });
  } catch (error) {
    console.error("GET /api/live error:", error);
    return NextResponse.json({ error: "Failed to fetch live updates" }, { status: 500 });
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
        { error: "Reporters do not have permission to publish live updates directly." },
        { status: 403 }
      );
    }

    const {
      coverageId,
      title,
      content,
      authorName,
      isUrgent = false,
      imageUrl,
      videoUrl,
      linkedArticleId,
      timestamp,
    } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Format IST timestamp if not provided
    const istTime =
      timestamp ||
      new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      }) + " IST";

    const update = await prisma.liveUpdate.create({
      data: {
        coverageId: coverageId || null,
        title: title.trim(),
        content: content.trim(),
        authorName: authorName || user.name || "Leadjen News Desk",
        isUrgent: Boolean(isUrgent),
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        linkedArticleId: linkedArticleId || null,
        timestamp: istTime,
      },
    });

    // Broadcast Real-Time Event
    broadcastRealtimeEvent("LIVE_UPDATE", {
      action: "CREATED",
      update,
    });

    // Audit Log
    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "LIVE_UPDATE_PUBLISHED",
      entityType: "LIVE_UPDATE",
      entityId: update.id,
      entityTitle: update.title,
      details: { isUrgent: update.isUrgent, coverageId: update.coverageId },
    });

    return NextResponse.json({ success: true, update });
  } catch (error) {
    console.error("POST /api/live error:", error);
    return NextResponse.json({ error: "Failed to create live update" }, { status: 500 });
  }
}
