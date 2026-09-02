import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { ensureDefaultHomepageSections } from "@/lib/homepage-defaults";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin required." }, { status: 403 });
    }

    // Delete all existing sections and manual mappings
    await prisma.homepageSectionArticle.deleteMany();
    await prisma.homepageSection.deleteMany();

    // Re-seed default layout
    await ensureDefaultHomepageSections();

    // Create baseline snapshot for public view
    const defaultSections = await prisma.homepageSection.findMany({
      include: {
        category: true,
        manualArticles: {
          include: { article: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    await prisma.homepageVersion.create({
      data: {
        name: `Baseline Default — ${new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
        snapshot: JSON.stringify(defaultSections),
        publishedBy: session.name || session.email,
      },
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Homepage restored to default editorial layout.",
    });
  } catch (error: any) {
    console.error("POST /api/homepage/reset error:", error);
    return NextResponse.json({ error: "Failed to reset homepage" }, { status: 500 });
  }
}
