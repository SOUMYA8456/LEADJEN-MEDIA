import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const versions = await prisma.siteBuilderVersion.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        versionName: true,
        description: true,
        publishedBy: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
    }

    const targetVersion = await prisma.siteBuilderVersion.findUnique({
      where: { id: versionId },
    });

    if (!targetVersion) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Restore to SiteSettings
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        siteConfigJson: targetVersion.snapshot,
        draftSiteConfigJson: targetVersion.snapshot,
      },
      create: {
        id: "default",
        siteConfigJson: targetVersion.snapshot,
        draftSiteConfigJson: targetVersion.snapshot,
      },
    });

    // Create a rollback audit snapshot
    await prisma.siteBuilderVersion.create({
      data: {
        versionName: `Restored: ${targetVersion.versionName}`,
        description: `Rollback applied from version snapshot ${targetVersion.id}`,
        snapshot: targetVersion.snapshot,
        publishedBy: user.email || user.name || "System Admin",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully rolled back to version: ${targetVersion.versionName}`,
      config: JSON.parse(targetVersion.snapshot),
    });
  } catch (error) {
    console.error("Error restoring version:", error);
    return NextResponse.json({ error: "Failed to restore version snapshot" }, { status: 500 });
  }
}
