import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const { type = "IMPRESSION", device = "DESKTOP", location, isAdminPreview = false } = body;

    // Do not count admin preview interactions as real production metrics
    if (isAdminPreview) {
      return NextResponse.json({ success: true, preview: true });
    }

    const ad = await prisma.advertisement.findUnique({
      where: { id: params.id },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (type === "CLICK") {
      await Promise.all([
        prisma.advertisement.update({
          where: { id: params.id },
          data: { clickCount: { increment: 1 } },
        }),
        prisma.adEvent.create({
          data: {
            adId: params.id,
            type: "CLICK",
            device,
            location: location || ad.location,
            userAgent: req.headers.get("user-agent") || null,
          },
        }),
      ]);
    } else {
      await Promise.all([
        prisma.advertisement.update({
          where: { id: params.id },
          data: { viewCount: { increment: 1 } },
        }),
        prisma.adEvent.create({
          data: {
            adId: params.id,
            type: "IMPRESSION",
            device,
            location: location || ad.location,
            userAgent: req.headers.get("user-agent") || null,
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/ads/[id]/track error:", error);
    return NextResponse.json({ error: "Failed to track ad event" }, { status: 500 });
  }
}
