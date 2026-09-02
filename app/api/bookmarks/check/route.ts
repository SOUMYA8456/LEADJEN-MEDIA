import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ isSaved: false, isAuthenticated: false });
    }

    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId,
        },
      },
    });

    return NextResponse.json({
      isSaved: Boolean(bookmark),
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("GET /api/bookmarks/check error:", error);
    return NextResponse.json({ isSaved: false }, { status: 500 });
  }
}
