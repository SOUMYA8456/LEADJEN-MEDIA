import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to view saved stories." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") === "oldest" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: user.id },
        include: {
          article: {
            include: {
              category: true,
              author: true,
            },
          },
        },
        orderBy: { createdAt: sort },
        skip,
        take: limit,
      }),
      prisma.bookmark.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      bookmarks: bookmarks.map((b) => ({
        id: b.id,
        savedAt: b.createdAt,
        article: b.article,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/bookmarks error:", error);
    return NextResponse.json({ error: "Failed to fetch saved stories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to save stories." }, { status: 401 });
    }

    const body = await req.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    // Upsert bookmark (prevents duplicates)
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        articleId,
      },
    });

    return NextResponse.json({ success: true, isSaved: true, bookmark });
  } catch (error) {
    console.error("POST /api/bookmarks error:", error);
    return NextResponse.json({ error: "Failed to save story" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
    }

    await prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        articleId,
      },
    });

    return NextResponse.json({ success: true, isSaved: false });
  } catch (error) {
    console.error("DELETE /api/bookmarks error:", error);
    return NextResponse.json({ error: "Failed to remove saved story" }, { status: 500 });
  }
}
