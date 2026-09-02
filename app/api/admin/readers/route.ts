import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role === "REPORTER" || session.role === "READER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const skip = (page - 1) * limit;

    const where: any = {
      role: "READER",
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [readers, total, activeCount, suspendedCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              bookmarks: true,
              comments: true,
              categoryFollows: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: "READER", status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "READER", status: "SUSPENDED" } }),
    ]);

    return NextResponse.json({
      readers,
      stats: {
        total,
        active: activeCount,
        suspended: suspendedCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/readers error:", error);
    return NextResponse.json({ error: "Failed to fetch readers" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "EDITOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { readerId, action } = body;

    if (!readerId || !action) {
      return NextResponse.json({ error: "readerId and action are required" }, { status: 400 });
    }

    const reader = await prisma.user.findUnique({
      where: { id: readerId },
    });

    if (!reader) {
      return NextResponse.json({ error: "Reader not found" }, { status: 404 });
    }

    const newStatus = action === "SUSPEND" ? "SUSPENDED" : "ACTIVE";

    const updated = await prisma.user.update({
      where: { id: readerId },
      data: { status: newStatus },
    });

    const auditAction = action === "SUSPEND" ? "READER_SUSPENDED" : "READER_REACTIVATED";

    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: auditAction,
      entityType: "USER",
      entityId: reader.id,
      entityTitle: reader.name,
      previousStatus: reader.status,
      newStatus,
    });

    return NextResponse.json({ success: true, reader: updated });
  } catch (error) {
    console.error("PUT /api/admin/readers error:", error);
    return NextResponse.json({ error: "Failed to update reader status" }, { status: 500 });
  }
}
