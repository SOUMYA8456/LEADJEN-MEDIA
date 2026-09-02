import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ history: [] });
    }

    const views = await prisma.articleView.findMany({
      where: { userId: user.id },
      include: {
        article: {
          include: {
            category: true,
            author: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    // Deduplicate by article id
    const seen = new Set();
    const uniqueHistory: any[] = [];
    for (const v of views) {
      if (v.article && !seen.has(v.articleId)) {
        seen.add(v.articleId);
        uniqueHistory.push({
          id: v.id,
          viewedAt: v.createdAt,
          article: v.article,
        });
      }
    }

    return NextResponse.json({ history: uniqueHistory });
  } catch (error) {
    console.error("GET /api/history error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.articleView.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Reading history cleared." });
  } catch (error) {
    console.error("DELETE /api/history error:", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
