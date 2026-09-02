import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const section = await prisma.homepageSection.findUnique({
      where: { id: params.id },
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
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ section });
  } catch (error: any) {
    console.error("GET /api/homepage/sections/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch section" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      enabled,
      sortOrder,
      layout,
      contentSource,
      categoryId,
      storyLimit,
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
      viewAllUrl,
      customSettings,
      desktopCols,
      tabletCols,
      mobileCols,
      manualArticleIds,
    } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (type !== undefined) dataToUpdate.type = type;
    if (title !== undefined) dataToUpdate.title = title;
    if (subtitle !== undefined) dataToUpdate.subtitle = subtitle;
    if (enabled !== undefined) dataToUpdate.enabled = Boolean(enabled);
    if (sortOrder !== undefined) dataToUpdate.sortOrder = Number(sortOrder);
    if (layout !== undefined) dataToUpdate.layout = layout;
    if (contentSource !== undefined) dataToUpdate.contentSource = contentSource;
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId || null;
    if (storyLimit !== undefined) dataToUpdate.storyLimit = Number(storyLimit);
    if (background !== undefined) dataToUpdate.background = background;
    if (spacing !== undefined) dataToUpdate.spacing = spacing;
    if (borders !== undefined) dataToUpdate.borders = borders;
    if (imageRatio !== undefined) dataToUpdate.imageRatio = imageRatio;
    if (showImages !== undefined) dataToUpdate.showImages = Boolean(showImages);
    if (showExcerpt !== undefined) dataToUpdate.showExcerpt = Boolean(showExcerpt);
    if (showAuthor !== undefined) dataToUpdate.showAuthor = Boolean(showAuthor);
    if (showDate !== undefined) dataToUpdate.showDate = Boolean(showDate);
    if (showReadingTime !== undefined) dataToUpdate.showReadingTime = Boolean(showReadingTime);
    if (showCategory !== undefined) dataToUpdate.showCategory = Boolean(showCategory);
    if (showViewAll !== undefined) dataToUpdate.showViewAll = Boolean(showViewAll);
    if (viewAllUrl !== undefined) dataToUpdate.viewAllUrl = viewAllUrl || null;
    if (desktopCols !== undefined) dataToUpdate.desktopCols = Number(desktopCols);
    if (tabletCols !== undefined) dataToUpdate.tabletCols = Number(tabletCols);
    if (mobileCols !== undefined) dataToUpdate.mobileCols = Number(mobileCols);
    if (body.isDraft !== undefined) dataToUpdate.isDraft = Boolean(body.isDraft);

    if (customSettings !== undefined) {
      dataToUpdate.customSettings =
        typeof customSettings === "object" ? JSON.stringify(customSettings) : customSettings;
    }

    // Update section and sync manual articles if provided
    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(manualArticleIds)) {
        await tx.homepageSectionArticle.deleteMany({
          where: { sectionId: params.id },
        });

        if (manualArticleIds.length > 0) {
          await tx.homepageSectionArticle.createMany({
            data: manualArticleIds.map((artId: string, idx: number) => ({
              sectionId: params.id,
              articleId: artId,
              sortOrder: idx,
            })),
          });
        }
      }

      return tx.homepageSection.update({
        where: { id: params.id },
        data: dataToUpdate,
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
      });
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ section: updated });
  } catch (error: any) {
    console.error("PUT /api/homepage/sections/[id] error:", error);
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin required." }, { status: 403 });
    }

    await prisma.homepageSection.delete({
      where: { id: params.id },
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, message: "Section deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/homepage/sections/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
