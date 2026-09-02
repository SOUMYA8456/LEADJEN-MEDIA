import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const follows = await prisma.categoryFollow.findMany({
      where: { userId: user.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      follows: follows.map((f) => ({
        id: f.id,
        followedAt: f.createdAt,
        category: f.category,
      })),
    });
  } catch (error) {
    console.error("GET /api/categories/follow error:", error);
    return NextResponse.json({ error: "Failed to fetch followed categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to follow topics." }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId } = body;

    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const follow = await prisma.categoryFollow.upsert({
      where: {
        userId_categoryId: {
          userId: user.id,
          categoryId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        categoryId,
      },
    });

    return NextResponse.json({ success: true, isFollowing: true, follow });
  } catch (error) {
    console.error("POST /api/categories/follow error:", error);
    return NextResponse.json({ error: "Failed to follow category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }

    await prisma.categoryFollow.deleteMany({
      where: {
        userId: user.id,
        categoryId,
      },
    });

    return NextResponse.json({ success: true, isFollowing: false });
  } catch (error) {
    console.error("DELETE /api/categories/follow error:", error);
    return NextResponse.json({ error: "Failed to unfollow category" }, { status: 500 });
  }
}
