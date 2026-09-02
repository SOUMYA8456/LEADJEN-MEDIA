import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ isFollowing: false, isAuthenticated: false });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }

    const follow = await prisma.categoryFollow.findUnique({
      where: {
        userId_categoryId: {
          userId: user.id,
          categoryId,
        },
      },
    });

    return NextResponse.json({
      isFollowing: Boolean(follow),
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("GET /api/categories/follow/check error:", error);
    return NextResponse.json({ isFollowing: false }, { status: 500 });
  }
}
