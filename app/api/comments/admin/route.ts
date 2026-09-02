import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role === "REPORTER" || session.role === "READER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search && search.trim()) {
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { authorName: { contains: search, mode: "insensitive" } },
        { authorEmail: { contains: search, mode: "insensitive" } },
        { article: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [comments, total, pendingCount, approvedCount, rejectedCount, spamCount] =
      await Promise.all([
        prisma.comment.findMany({
          where,
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: { select: { name: true, slug: true } },
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.comment.count({ where }),
        prisma.comment.count({ where: { status: "PENDING" } }),
        prisma.comment.count({ where: { status: "APPROVED" } }),
        prisma.comment.count({ where: { status: "REJECTED" } }),
        prisma.comment.count({ where: { status: "SPAM" } }),
      ]);

    return NextResponse.json({
      comments,
      stats: {
        total,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        spam: spamCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/comments/admin error:", error);
    return NextResponse.json({ error: "Failed to fetch admin comments" }, { status: 500 });
  }
}
