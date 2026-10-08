import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type") || "ALL"; // ALL, IMAGES, VIDEOS
    const sort = searchParams.get("sort") || "latest"; // latest, oldest, name
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "40", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { filename: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type === "IMAGES") {
      where.mimeType = { startsWith: "image/" };
    } else if (type === "VIDEOS") {
      where.mimeType = { startsWith: "video/" };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "name") {
      orderBy = { originalName: "asc" };
    }

    const [mediaItems, totalCount] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    // Compute reverse usages for each media asset
    const mediaWithUsages = await Promise.all(
      mediaItems.map(async (m) => {
        const [articles, pages] = await Promise.all([
          prisma.article.findMany({
            where: {
              OR: [
                { featuredImage: { contains: m.url } },
                { featuredImage: { contains: m.filename } },
                { gallery: { contains: m.url } },
              ],
            },
            select: { id: true, title: true, slug: true, status: true },
            take: 10,
          }),
          prisma.page.findMany({
            where: {
              featuredImage: { contains: m.url },
            },
            select: { id: true, title: true, slug: true },
            take: 5,
          }),
        ]);

        const usages = [
          ...articles.map((a) => ({
            type: "article" as const,
            id: a.id,
            title: a.title,
            slug: a.slug,
            status: a.status,
          })),
          ...pages.map((p) => ({
            type: "page" as const,
            id: p.id,
            title: p.title,
            slug: p.slug,
          })),
        ];

        return {
          ...m,
          usages,
          usageCount: usages.length,
        };
      })
    );

    return NextResponse.json({
      media: mediaWithUsages,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json({ error: "Failed to fetch media assets" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Check usages if force is not set
    if (!force) {
      const activeArticles = await prisma.article.findMany({
        where: {
          OR: [
            { featuredImage: { contains: existing.url } },
            { featuredImage: { contains: existing.filename } },
            { gallery: { contains: existing.url } },
          ],
        },
        select: { id: true, title: true, slug: true },
        take: 5,
      });

      if (activeArticles.length > 0) {
        return NextResponse.json(
          {
            error: `This media asset is currently used in ${activeArticles.length} article(s). Deleting it will result in broken images.`,
            usedInArticles: activeArticles,
            requiresForce: true,
          },
          { status: 409 }
        );
      }
    }

    await prisma.media.delete({ where: { id } });

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "MEDIA_DELETED",
          entityType: "MEDIA",
          entityId: id,
          entityTitle: existing.originalName,
        },
      });
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Failed to delete media asset" }, { status: 500 });
  }
}
