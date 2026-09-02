import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// Helper to validate and sanitize destination URLs
function isValidDestinationUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:")
  ) {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");
    const status = searchParams.get("status");
    const device = searchParams.get("device");
    const isAdmin = searchParams.get("admin") === "true";

    const now = new Date();

    if (isAdmin) {
      const user = getSessionFromRequest(req);
      if (!user || user.role === "REPORTER") {
        return NextResponse.json({ error: "Unauthorized. Editor or Super Admin required." }, { status: 403 });
      }

      const where: any = {};
      if (location && location !== "ALL") where.location = location;
      if (status && status !== "ALL") where.status = status;
      if (device && device !== "ALL") where.device = device;

      const ads = await prisma.advertisement.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      });

      // Calculate automated status for each ad
      const enrichedAds = ads.map((ad) => {
        let computedStatus = ad.status;
        if (ad.status === "ACTIVE" || ad.status === "SCHEDULED") {
          if (ad.startDate && new Date(ad.startDate) > now) {
            computedStatus = "SCHEDULED";
          } else if (ad.endDate && new Date(ad.endDate) < now) {
            computedStatus = "EXPIRED";
          } else if (!ad.isActive) {
            computedStatus = "PAUSED";
          } else {
            computedStatus = "ACTIVE";
          }
        }
        const ctr = ad.viewCount > 0 ? Number(((ad.clickCount / ad.viewCount) * 100).toFixed(2)) : 0;
        return {
          ...ad,
          computedStatus,
          ctr,
        };
      });

      return NextResponse.json({ ads: enrichedAds });
    }

    // Public endpoint: only serve active, unexpired advertisements
    const where: any = {
      isActive: true,
      status: "ACTIVE",
      AND: [
        {
          OR: [{ startDate: null }, { startDate: { lte: now } }],
        },
        {
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      ],
    };

    if (location && location !== "ALL") {
      where.location = location;
    }

    if (device && device !== "ALL") {
      where.OR = [{ device: "ALL" }, { device }];
    }

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("GET /api/ads error:", error);
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role === "REPORTER") {
      return NextResponse.json(
        { error: "Reporters do not have permission to create or manage advertisements." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      advertiser,
      campaignName,
      creativeType = "IMAGE",
      location = "TOP_LEADERBOARD",
      imageUrl,
      desktopImage,
      tabletImage,
      mobileImage,
      destinationUrl,
      htmlContent,
      priority = 50,
      status = "ACTIVE",
      device = "ALL",
      rotationMode = "SINGLE",
      rotationInterval = 10,
      startDate,
      endDate,
      maxImpressions,
      maxClicks,
      isActive = true,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Advertisement name is required." }, { status: 400 });
    }

    if (!imageUrl && !desktopImage && !htmlContent) {
      return NextResponse.json({ error: "Creative asset or Image URL is required." }, { status: 400 });
    }

    if (!destinationUrl || !isValidDestinationUrl(destinationUrl)) {
      return NextResponse.json(
        { error: "A valid and safe destination URL is required (cannot start with javascript: or data:)." },
        { status: 400 }
      );
    }

    const primaryImage = imageUrl || desktopImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=250&q=80";

    const ad = await prisma.advertisement.create({
      data: {
        name: name.trim(),
        advertiser: advertiser ? advertiser.trim() : null,
        campaignName: campaignName ? campaignName.trim() : null,
        creativeType,
        location,
        imageUrl: primaryImage,
        desktopImage: desktopImage || primaryImage,
        tabletImage: tabletImage || null,
        mobileImage: mobileImage || null,
        destinationUrl: destinationUrl.trim(),
        htmlContent: htmlContent ? htmlContent.trim() : null,
        priority: parseInt(priority) || 50,
        status,
        device,
        rotationMode,
        rotationInterval: parseInt(rotationInterval) || 10,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxImpressions: maxImpressions ? parseInt(maxImpressions) : null,
        maxClicks: maxClicks ? parseInt(maxClicks) : null,
        isActive: Boolean(isActive),
      },
    });

    // Record Audit Log
    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "ADVERTISEMENT_CREATED",
      entityType: "SETTING",
      entityId: ad.id,
      entityTitle: ad.name,
      newStatus: ad.status,
      details: {
        location: ad.location,
        advertiser: ad.advertiser,
        priority: ad.priority,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin/homepage");
    } catch {}

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error("POST /api/ads error:", error);
    return NextResponse.json({ error: "Failed to create advertisement" }, { status: 500 });
  }
}
