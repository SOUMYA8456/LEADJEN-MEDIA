import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role === "REPORTER") {
      return NextResponse.json({ error: "Unauthorized. Editor or Super Admin required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const [ads, totalAgg, recentEvents] = await Promise.all([
      prisma.advertisement.findMany({
        orderBy: [{ viewCount: "desc" }, { clickCount: "desc" }],
      }),
      prisma.advertisement.aggregate({
        _sum: {
          viewCount: true,
          clickCount: true,
        },
      }),
      prisma.adEvent.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 3600 * 1000),
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const totalImpressions = totalAgg._sum.viewCount || 0;
    const totalClicks = totalAgg._sum.clickCount || 0;
    const overallCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    // Breakdown by Position
    const positionMap: Record<string, { impressions: number; clicks: number }> = {};
    ads.forEach((ad) => {
      if (!positionMap[ad.location]) {
        positionMap[ad.location] = { impressions: 0, clicks: 0 };
      }
      positionMap[ad.location].impressions += ad.viewCount;
      positionMap[ad.location].clicks += ad.clickCount;
    });

    const byPosition = Object.entries(positionMap).map(([position, stats]) => ({
      position,
      impressions: stats.impressions,
      clicks: stats.clicks,
      ctr: stats.impressions > 0 ? Number(((stats.clicks / stats.impressions) * 100).toFixed(2)) : 0,
    }));

    // Breakdown by Campaign / Ad
    const byCampaign = ads.map((ad) => ({
      id: ad.id,
      name: ad.name,
      advertiser: ad.advertiser || "Direct Partner",
      campaignName: ad.campaignName || ad.name,
      location: ad.location,
      status: ad.status,
      impressions: ad.viewCount,
      clicks: ad.clickCount,
      ctr: ad.viewCount > 0 ? Number(((ad.clickCount / ad.viewCount) * 100).toFixed(2)) : 0,
    }));

    // Breakdown by Device from AdEvent logs
    const deviceMap: Record<string, { impressions: number; clicks: number }> = {
      DESKTOP: { impressions: 0, clicks: 0 },
      TABLET: { impressions: 0, clicks: 0 },
      MOBILE: { impressions: 0, clicks: 0 },
    };

    recentEvents.forEach((ev) => {
      const dev = (ev.device || "DESKTOP").toUpperCase();
      if (!deviceMap[dev]) deviceMap[dev] = { impressions: 0, clicks: 0 };
      if (ev.type === "CLICK") deviceMap[dev].clicks += 1;
      else deviceMap[dev].impressions += 1;
    });

    const byDevice = Object.entries(deviceMap).map(([device, stats]) => ({
      device,
      impressions: stats.impressions,
      clicks: stats.clicks,
      ctr: stats.impressions > 0 ? Number(((stats.clicks / stats.impressions) * 100).toFixed(2)) : 0,
    }));

    // Over Time Timeline (Grouped by Date)
    const timelineMap: Record<string, { date: string; impressions: number; clicks: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const dateKey = d.toISOString().slice(0, 10);
      timelineMap[dateKey] = { date: dateKey, impressions: 0, clicks: 0 };
    }

    recentEvents.forEach((ev) => {
      const dateKey = ev.createdAt.toISOString().slice(0, 10);
      if (timelineMap[dateKey]) {
        if (ev.type === "CLICK") timelineMap[dateKey].clicks += 1;
        else timelineMap[dateKey].impressions += 1;
      }
    });

    const overTime = Object.values(timelineMap).map((t) => ({
      ...t,
      ctr: t.impressions > 0 ? Number(((t.clicks / t.impressions) * 100).toFixed(2)) : 0,
    }));

    return NextResponse.json({
      totalImpressions,
      totalClicks,
      overallCtr,
      activeAdsCount: ads.filter((a) => a.isActive && a.status === "ACTIVE").length,
      byPosition,
      byCampaign,
      byDevice,
      overTime,
    });
  } catch (error) {
    console.error("GET /api/ads/analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch ad analytics" }, { status: 500 });
  }
}
