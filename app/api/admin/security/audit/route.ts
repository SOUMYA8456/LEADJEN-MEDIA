import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/security/audit — Login Activity & Security Audit Logs (SUPER_ADMIN only)
export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Super Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "ALL"; // ALL, SUCCESS, FAILED, ADMIN_CHANGES
    const search = searchParams.get("search")?.trim();
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "40");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter === "SUCCESS") {
      where.action = "LOGIN_SUCCESS";
    } else if (filter === "FAILED") {
      where.action = "LOGIN_FAILED";
    } else if (filter === "ADMIN_CHANGES") {
      where.action = {
        in: [
          "USER_CREATED",
          "USER_UPDATED",
          "USER_DELETED",
          "USER_ARCHIVED",
          "USER_STATUS_CHANGED",
          "PASSWORD_RESET",
          "AUTHOR_UPDATED",
          "AUTHOR_ARCHIVED",
          "AUTHOR_DELETED",
        ],
      };
    } else {
      // ALL Security & User Auth events
      where.OR = [
        { action: { startsWith: "LOGIN_" } },
        { action: { startsWith: "USER_" } },
        { action: { startsWith: "PASSWORD_" } },
        { entityType: "SECURITY" },
        { entityType: "USER" },
      ];
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { userName: { contains: search, mode: "insensitive" } },
            { entityTitle: { contains: search, mode: "insensitive" } },
            { details: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const [logs, total, totalSuccess, totalFailed] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.count({ where: { action: "LOGIN_SUCCESS" } }),
      prisma.auditLog.count({ where: { action: "LOGIN_FAILED" } }),
    ]);

    // Parse details safely
    const formattedLogs = logs.map((log) => {
      let parsedDetails: any = null;
      try {
        if (log.details) {
          parsedDetails = JSON.parse(log.details);
        }
      } catch {
        parsedDetails = { raw: log.details };
      }

      return {
        id: log.id,
        timestamp: log.createdAt,
        action: log.action,
        entityType: log.entityType,
        entityTitle: log.entityTitle,
        userName: log.userName,
        userRole: log.userRole,
        ip: parsedDetails?.ip || "127.0.0.1",
        userAgent: parsedDetails?.userAgent || "Standard Browser",
        reason: parsedDetails?.reason || null,
        email: parsedDetails?.email || log.entityTitle || "—",
        details: parsedDetails,
      };
    });

    return NextResponse.json({
      logs: formattedLogs,
      stats: {
        total,
        totalSuccess,
        totalFailed,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/security/audit error:", error);
    return NextResponse.json(
      { error: "Failed to fetch security audit logs" },
      { status: 500 }
    );
  }
}
