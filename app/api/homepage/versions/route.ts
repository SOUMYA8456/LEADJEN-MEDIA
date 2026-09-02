import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const versions = await prisma.homepageVersion.findMany({
      orderBy: { publishedAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ versions });
  } catch (error: any) {
    console.error("GET /api/homepage/versions error:", error);
    return NextResponse.json({ error: "Failed to fetch version history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { versionId } = await req.json();
    if (!versionId) {
      return NextResponse.json({ error: "versionId is required" }, { status: 400 });
    }

    const version = await prisma.homepageVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || !version.snapshot) {
      return NextResponse.json({ error: "Version snapshot not found" }, { status: 404 });
    }

    const sectionsData: any[] = JSON.parse(version.snapshot);

    // Rollback in transaction
    await prisma.$transaction(async (tx) => {
      await tx.homepageSectionArticle.deleteMany();
      await tx.homepageSection.deleteMany();

      for (const s of sectionsData) {
        const manualIds = s.manualArticles?.map((m: any) => m.articleId) || [];
        await tx.homepageSection.create({
          data: {
            id: s.id,
            name: s.name,
            type: s.type,
            title: s.title,
            subtitle: s.subtitle,
            enabled: s.enabled,
            sortOrder: s.sortOrder,
            layout: s.layout,
            contentSource: s.contentSource,
            categoryId: s.categoryId,
            storyLimit: s.storyLimit,
            background: s.background,
            spacing: s.spacing,
            borders: s.borders,
            imageRatio: s.imageRatio,
            showImages: s.showImages,
            showExcerpt: s.showExcerpt,
            showAuthor: s.showAuthor,
            showDate: s.showDate,
            showReadingTime: s.showReadingTime,
            showCategory: s.showCategory,
            showViewAll: s.showViewAll,
            viewAllUrl: s.viewAllUrl,
            customSettings: s.customSettings,
            desktopCols: s.desktopCols,
            tabletCols: s.tabletCols,
            mobileCols: s.mobileCols,
            isDraft: false,
            manualArticles: {
              create: manualIds.map((artId: string, idx: number) => ({
                articleId: artId,
                sortOrder: idx,
              })),
            },
          },
        });
      }
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Restored version: ${version.name}`,
    });
  } catch (error: any) {
    console.error("POST /api/homepage/versions rollback error:", error);
    return NextResponse.json({ error: "Failed to rollback version" }, { status: 500 });
  }
}
