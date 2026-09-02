import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Fetch current sections with all relations
    const allSections = await prisma.homepageSection.findMany({
      include: {
        category: true,
        manualArticles: {
          include: { article: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // 2. Mark all as non-draft
    await prisma.homepageSection.updateMany({
      data: { isDraft: false },
    });

    // 3. Commit draft navigation items if any
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settings && settings.draftHeaderNavItems) {
      await prisma.siteSettings.update({
        where: { id: "default" },
        data: {
          headerNavItems: settings.draftHeaderNavItems,
        },
      });
    }

    // 4. Create a version snapshot for history & rollback
    const versionName = `Homepage Deployment — ${new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    const version = await prisma.homepageVersion.create({
      data: {
        name: versionName,
        snapshot: JSON.stringify(allSections),
        publishedBy: session.name || session.email,
      },
    });

    // 5. Invalidate public Next.js homepage and category cache
    try {
      revalidatePath("/");
      revalidatePath("/search");
      revalidatePath("/videos");
      revalidatePath("/photos");
      revalidatePath("/listen");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Homepage and navigation published successfully to production.",
      version,
    });
  } catch (error: any) {
    console.error("POST /api/homepage/publish error:", error);
    return NextResponse.json({ error: "Failed to publish homepage" }, { status: 500 });
  }
}
