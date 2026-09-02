import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { broadcastRealtimeEvent } from "@/lib/realtime";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET active live coverage
export async function GET() {
  try {
    const coverageList = await prisma.liveCoverage.findMany({
      orderBy: { startedAt: "desc" },
      include: {
        _count: { select: { updates: true } },
      },
    });

    return NextResponse.json({ coverageList });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch live coverages" }, { status: 500 });
  }
}

// POST: Create new live coverage
export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role === "REPORTER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      summary,
      category = "Breaking News",
      status = "LIVE",
      featuredImage,
    } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Coverage headline is required" }, { status: 400 });
    }

    let slug = slugify(title);
    // Check if slug exists
    const existing = await prisma.liveCoverage.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const coverage = await prisma.liveCoverage.create({
      data: {
        title: title.trim(),
        slug,
        summary: summary ? summary.trim() : null,
        category: category || "Breaking News",
        status: ["UPCOMING", "LIVE", "PAUSED", "ENDED"].includes(status) ? status : "LIVE",
        featuredImage: featuredImage || null,
        startedAt: new Date(),
      },
    });

    broadcastRealtimeEvent("LIVE_COVERAGE_UPDATE", {
      action: "CREATED",
      coverage,
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "LIVE_COVERAGE_STARTED",
      entityType: "LIVE_COVERAGE",
      entityId: coverage.id,
      entityTitle: coverage.title,
    });

    return NextResponse.json({ success: true, coverage });
  } catch (error) {
    console.error("POST /api/live/coverage error:", error);
    return NextResponse.json({ error: "Failed to create live coverage" }, { status: 500 });
  }
}

// PUT: Update status or details of live coverage
export async function PUT(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role === "REPORTER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, summary, category, status, featuredImage } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Coverage ID is required" }, { status: 400 });
    }

    const updated = await prisma.liveCoverage.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        summary: summary !== undefined ? summary : undefined,
        category: category !== undefined ? category : undefined,
        status: status !== undefined ? status : undefined,
        featuredImage: featuredImage !== undefined ? featuredImage : undefined,
        endedAt: status === "ENDED" ? new Date() : undefined,
      },
    });

    broadcastRealtimeEvent("LIVE_COVERAGE_UPDATE", {
      action: "UPDATED",
      coverage: updated,
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: status === "ENDED" ? "LIVE_COVERAGE_ENDED" : "LIVE_COVERAGE_UPDATED",
      entityType: "LIVE_COVERAGE",
      entityId: updated.id,
      entityTitle: updated.title,
      details: { status: updated.status },
    });

    return NextResponse.json({ success: true, coverage: updated });
  } catch (error) {
    console.error("PUT /api/live/coverage error:", error);
    return NextResponse.json({ error: "Failed to update live coverage" }, { status: 500 });
  }
}
