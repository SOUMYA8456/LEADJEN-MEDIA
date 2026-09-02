import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
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
          siteName: "LEADJEN MEDIA",
          tagline: "Independent journalism. Important stories.",
          logoText: "LEADJEN MEDIA",
          breakingNewsSpeed: 35,
          showLiveButton: true,
          showSearchButton: true,
          showClock: true,
          clockTimezone: "Asia/Kolkata",
          clockFormat: "12h",
          clockLabel: "IST",
          siteConfigJson: JSON.stringify(DEFAULT_SITE_BUILDER_CONFIG),
        },
      });
    }

    let siteConfig: SiteBuilderConfig = DEFAULT_SITE_BUILDER_CONFIG;
    if (isDraft && settings.draftSiteConfigJson) {
      try {
        siteConfig = { ...DEFAULT_SITE_BUILDER_CONFIG, ...JSON.parse(settings.draftSiteConfigJson) };
      } catch {}
    } else if (settings.siteConfigJson) {
      try {
        siteConfig = { ...DEFAULT_SITE_BUILDER_CONFIG, ...JSON.parse(settings.siteConfigJson) };
      } catch {}
    }

    // Derive effective fields from SiteBuilderConfig if present
    const effectiveHeaderNav =
      siteConfig.navigation?.items && siteConfig.navigation.items.length > 0
        ? JSON.stringify(siteConfig.navigation.items)
        : settings.headerNavItems;

    const effectiveFooterCols =
      siteConfig.footer?.columns && siteConfig.footer.columns.length > 0
        ? JSON.stringify(siteConfig.footer.columns)
        : settings.footerColumns;

    return NextResponse.json({
      settings: {
        ...settings,
        siteName: siteConfig.global?.siteName || settings.siteName,
        tagline: siteConfig.global?.tagline || settings.tagline,
        headerNavItems: effectiveHeaderNav,
        footerColumns: effectiveFooterCols,
        showLiveButton: siteConfig.header?.showLiveButton !== undefined ? siteConfig.header.showLiveButton : settings.showLiveButton,
        showSearchButton: siteConfig.header?.showSearchButton !== undefined ? siteConfig.header.showSearchButton : settings.showSearchButton,
        showClock: siteConfig.header?.showClock !== undefined ? siteConfig.header.showClock : settings.showClock,
        clockTimezone: siteConfig.header?.clockTimezone || settings.clockTimezone,
        clockFormat: siteConfig.header?.clockFormat || settings.clockFormat,
        clockLabel: siteConfig.header?.clockLabel || settings.clockLabel,
        headerAnnouncement: siteConfig.header?.headerAnnouncement,
        showAnnouncement: siteConfig.header?.showAnnouncement,
        siteConfig,
      },
    });
  } catch (error: any) {
    console.error("GET /api/settings/site error:", error);
    return NextResponse.json({ error: "Failed to fetch site settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized. Super Admin or Editor required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      siteName,
      tagline,
      logoText,
      logoImage,
      headerNavItems,
      draftHeaderNavItems,
      footerColumns,
      breakingNewsSpeed,
      showLiveButton,
      showSearchButton,
      showClock,
      clockTimezone,
      clockFormat,
      clockLabel,
    } = body;

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        siteName: siteName !== undefined ? siteName : undefined,
        tagline: tagline !== undefined ? tagline : undefined,
        logoText: logoText !== undefined ? logoText : undefined,
        logoImage: logoImage !== undefined ? logoImage : undefined,
        headerNavItems:
          headerNavItems !== undefined
            ? typeof headerNavItems === "string"
              ? headerNavItems
              : JSON.stringify(headerNavItems)
            : undefined,
        draftHeaderNavItems:
          draftHeaderNavItems !== undefined
            ? typeof draftHeaderNavItems === "string"
              ? draftHeaderNavItems
              : JSON.stringify(draftHeaderNavItems)
            : undefined,
        footerColumns:
          footerColumns !== undefined
            ? typeof footerColumns === "string"
              ? footerColumns
              : JSON.stringify(footerColumns)
            : undefined,
        breakingNewsSpeed: breakingNewsSpeed !== undefined ? Number(breakingNewsSpeed) : undefined,
        showLiveButton: showLiveButton !== undefined ? Boolean(showLiveButton) : undefined,
        showSearchButton: showSearchButton !== undefined ? Boolean(showSearchButton) : undefined,
        showClock: showClock !== undefined ? Boolean(showClock) : undefined,
        clockTimezone: clockTimezone !== undefined ? clockTimezone : undefined,
        clockFormat: clockFormat !== undefined ? clockFormat : undefined,
        clockLabel: clockLabel !== undefined ? clockLabel : undefined,
      },
      create: {
        id: "default",
        siteName: siteName || "LEADJEN MEDIA",
        tagline: tagline || "Independent journalism. Important stories.",
        logoText: logoText || "LEADJEN MEDIA",
        logoImage: logoImage || null,
        headerNavItems: headerNavItems ? JSON.stringify(headerNavItems) : null,
        draftHeaderNavItems: draftHeaderNavItems ? JSON.stringify(draftHeaderNavItems) : null,
        footerColumns: footerColumns ? JSON.stringify(footerColumns) : null,
        breakingNewsSpeed: Number(breakingNewsSpeed) || 35,
        showLiveButton: showLiveButton !== undefined ? Boolean(showLiveButton) : true,
        showSearchButton: showSearchButton !== undefined ? Boolean(showSearchButton) : true,
        showClock: showClock !== undefined ? Boolean(showClock) : true,
        clockTimezone: clockTimezone || "Asia/Kolkata",
        clockFormat: clockFormat || "12h",
        clockLabel: clockLabel || "IST",
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/search");
    } catch {}

    return NextResponse.json({ settings: updated });
  } catch (error: any) {
    console.error("PUT /api/settings/site error:", error);
    return NextResponse.json({ error: "Failed to update site settings" }, { status: 500 });
  }
}
