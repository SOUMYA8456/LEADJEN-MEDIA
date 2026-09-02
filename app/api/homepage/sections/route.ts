import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { ensureDefaultHomepageSections } from "@/lib/homepage-defaults";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureDefaultHomepageSections();

    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("draft") === "true";

    const whereClause: any = {};
    if (!includeDrafts) {
      whereClause.isDraft = false;
    }

    const sections = await prisma.homepageSection.findMany({
      where: whereClause,
      include: {
        category: true,
        manualArticles: {
          include: {
            article: {
              include: { category: true, author: true },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ sections });
  } catch (error: any) {
    console.error("GET /api/homepage/sections error:", error);
    return NextResponse.json({ error: "Failed to fetch homepage sections" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      type,
      title,
      subtitle,
      layout = "featured-split",
      contentSource = "LATEST",
      categoryId,
      storyLimit = 4,
      background = "white",
      spacing = "normal",
      borders = "bottom",
      imageRatio = "aspect-[16/10]",
      showImages = true,
      showExcerpt = true,
      showAuthor = true,
      showDate = true,
      showReadingTime = true,
      showCategory = true,
      showViewAll = true,
      viewAllUrl,
      customSettings,
      desktopCols = 3,
      tabletCols = 2,
      mobileCols = 1,
      manualArticleIds = [],
    } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and Type are required" }, { status: 400 });
    }

    // Determine next sort order
    const maxSort = await prisma.homepageSection.aggregate({
      _max: { sortOrder: true },
    });
    const nextSortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const section = await prisma.homepageSection.create({
      data: {
        name,
        type,
        title: title || name,
        subtitle,
        layout,
        contentSource,
        categoryId: categoryId || null,
        storyLimit: Number(storyLimit) || 4,
        background,
        spacing,
        borders,
        imageRatio,
        showImages,
        showExcerpt,
        showAuthor,
        showDate,
        showReadingTime,
        showCategory,
        showViewAll,
        viewAllUrl: viewAllUrl || null,
        customSettings: typeof customSettings === "object" ? JSON.stringify(customSettings) : customSettings || null,
        desktopCols: Number(desktopCols) || 3,
        tabletCols: Number(tabletCols) || 2,
        mobileCols: Number(mobileCols) || 1,
        sortOrder: nextSortOrder,
        enabled: true,
        isDraft: false,
        manualArticles: {
          create: manualArticleIds.map((artId: string, idx: number) => ({
            articleId: artId,
            sortOrder: idx,
          })),
        },
      },
      include: {
        category: true,
        manualArticles: {
          include: { article: true },
        },
      },
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ section });
  } catch (error: any) {
    console.error("POST /api/homepage/sections error:", error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Sections array is required" }, { status: 400 });
    }

    // Bulk update all section properties in transaction
    await prisma.$transaction(
      sections.map((sec, idx) =>
        prisma.homepageSection.update({
          where: { id: sec.id },
          data: {
            sortOrder: idx,
            name: sec.name !== undefined ? sec.name : undefined,
            title: sec.title !== undefined ? sec.title : undefined,
            subtitle: sec.subtitle !== undefined ? sec.subtitle : undefined,
            type: sec.type !== undefined ? sec.type : undefined,
            layout: sec.layout !== undefined ? sec.layout : undefined,
            contentSource: sec.contentSource !== undefined ? sec.contentSource : undefined,
            categoryId: sec.categoryId !== undefined ? sec.categoryId || null : undefined,
            storyLimit: sec.storyLimit !== undefined ? Number(sec.storyLimit) : undefined,
            background: sec.background !== undefined ? sec.background : undefined,
            spacing: sec.spacing !== undefined ? sec.spacing : undefined,
            borders: sec.borders !== undefined ? sec.borders : undefined,
            showImages: sec.showImages !== undefined ? Boolean(sec.showImages) : undefined,
            showExcerpt: sec.showExcerpt !== undefined ? Boolean(sec.showExcerpt) : undefined,
            showAuthor: sec.showAuthor !== undefined ? Boolean(sec.showAuthor) : undefined,
            showDate: sec.showDate !== undefined ? Boolean(sec.showDate) : undefined,
            showViewAll: sec.showViewAll !== undefined ? Boolean(sec.showViewAll) : undefined,
            customSettings:
              sec.customSettings !== undefined
                ? typeof sec.customSettings === "object"
                  ? JSON.stringify(sec.customSettings)
                  : sec.customSettings
                : undefined,
            enabled: sec.enabled !== undefined ? sec.enabled : true,
            isDraft: true,
          },
        })
      )
    );

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, message: "Sections reordered successfully" });
  } catch (error: any) {
    console.error("PUT /api/homepage/sections error:", error);
    return NextResponse.json({ error: "Failed to reorder sections" }, { status: 500 });
  }
}
