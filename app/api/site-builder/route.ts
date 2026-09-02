import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isDraft = searchParams.get("draft") === "true";

    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "default",
          siteConfigJson: JSON.stringify(DEFAULT_SITE_BUILDER_CONFIG),
        },
      });
    }

    let config: SiteBuilderConfig = DEFAULT_SITE_BUILDER_CONFIG;

    if (isDraft && settings.draftSiteConfigJson) {
      try {
        config = { ...DEFAULT_SITE_BUILDER_CONFIG, ...JSON.parse(settings.draftSiteConfigJson) };
      } catch {}
    } else if (settings.siteConfigJson) {
      try {
        config = { ...DEFAULT_SITE_BUILDER_CONFIG, ...JSON.parse(settings.siteConfigJson) };
      } catch {}
    }

    return NextResponse.json({
      config,
      hasDraft: Boolean(settings.draftSiteConfigJson),
      updatedAt: settings.updatedAt,
    });
  } catch (error: any) {
    console.error("GET /api/site-builder error:", error);
    return NextResponse.json({ error: "Failed to fetch site builder config" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin or Editor role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { config, isPublish, versionName, versionDescription } = body;

    if (!config) {
      return NextResponse.json({ error: "Configuration payload is required." }, { status: 400 });
    }

    const configString = JSON.stringify(config);

    let updated;
    if (isPublish) {
      // 1. Publish Live: update siteConfigJson and clear draftSiteConfigJson
      updated = await prisma.siteSettings.upsert({
        where: { id: "default" },
        update: {
          siteConfigJson: configString,
          draftSiteConfigJson: null,
          siteName: config.global?.siteName || "LEADJEN MEDIA",
          tagline: config.global?.tagline || undefined,
          showClock: config.header?.showClock !== undefined ? config.header.showClock : undefined,
          showLiveButton: config.header?.showLiveButton !== undefined ? config.header.showLiveButton : undefined,
          showSearchButton: config.header?.showSearchButton !== undefined ? config.header.showSearchButton : undefined,
        },
        create: {
          id: "default",
          siteConfigJson: configString,
          siteName: config.global?.siteName || "LEADJEN MEDIA",
          tagline: config.global?.tagline || "Independent journalism. Important stories.",
        },
      });

      // 2. Save version history snapshot
      await prisma.siteBuilderVersion.create({
        data: {
          versionName: versionName || `Version ${new Date().toISOString().slice(0, 16)}`,
          description: versionDescription || `Published by ${user.name} (${user.role})`,
          snapshot: configString,
          publishedBy: user.name,
        },
      });

      // 3. Record Audit Log
      await logAuditEvent({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "SITE_BUILDER_PUBLISHED",
        entityType: "SETTING",
        entityTitle: "Site Builder Configuration Live",
        details: { versionName, publishedBy: user.name },
      });

      // 4. Invalidate public caches
      try {
        revalidatePath("/");
        revalidatePath("/[category]", "page");
        revalidatePath("/live");
        revalidatePath("/videos");
        revalidatePath("/photos");
        revalidatePath("/search");
      } catch (e) {}

      return NextResponse.json({
        success: true,
        message: "Site Builder configuration successfully published to live website.",
        isPublished: true,
        config,
      });
    } else {
      // Save Draft
      updated = await prisma.siteSettings.upsert({
        where: { id: "default" },
        update: {
          draftSiteConfigJson: configString,
        },
        create: {
          id: "default",
          draftSiteConfigJson: configString,
          siteConfigJson: JSON.stringify(DEFAULT_SITE_BUILDER_CONFIG),
        },
      });

      await logAuditEvent({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "SITE_BUILDER_DRAFT_SAVED",
        entityType: "SETTING",
        entityTitle: "Site Builder Draft Saved",
      });

      return NextResponse.json({
        success: true,
        message: "Site Builder draft saved successfully. Changes are not yet public.",
        isPublished: false,
        config,
      });
    }
  } catch (error: any) {
    console.error("PUT /api/site-builder error:", error);
    return NextResponse.json({ error: "Failed to save site builder config" }, { status: 500 });
  }
}
