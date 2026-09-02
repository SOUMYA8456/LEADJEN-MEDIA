import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ad = await prisma.advertisement.findUnique({
      where: { id: params.id },
    });

    if (!ad) {
      return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("GET /api/ads/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch ad" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role === "REPORTER") {
      return NextResponse.json(
        { error: "Reporters do not have permission to manage advertisements." },
        { status: 403 }
      );
    }

    const existing = await prisma.advertisement.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      advertiser,
      campaignName,
      creativeType,
      location,
      imageUrl,
      desktopImage,
      tabletImage,
      mobileImage,
      destinationUrl,
      htmlContent,
      priority,
      status,
      device,
      rotationMode,
      rotationInterval,
      startDate,
      endDate,
      maxImpressions,
      maxClicks,
      isActive,
    } = body;

    if (destinationUrl && !isValidDestinationUrl(destinationUrl)) {
      return NextResponse.json(
        { error: "A valid destination URL is required (cannot start with javascript: or data:)." },
        { status: 400 }
      );
    }

    const updated = await prisma.advertisement.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        advertiser: advertiser !== undefined ? (advertiser ? advertiser.trim() : null) : existing.advertiser,
        campaignName: campaignName !== undefined ? (campaignName ? campaignName.trim() : null) : existing.campaignName,
        creativeType: creativeType !== undefined ? creativeType : existing.creativeType,
        location: location !== undefined ? location : existing.location,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        desktopImage: desktopImage !== undefined ? desktopImage : existing.desktopImage,
        tabletImage: tabletImage !== undefined ? tabletImage : existing.tabletImage,
        mobileImage: mobileImage !== undefined ? mobileImage : existing.mobileImage,
        destinationUrl: destinationUrl !== undefined ? destinationUrl.trim() : existing.destinationUrl,
        htmlContent: htmlContent !== undefined ? htmlContent : existing.htmlContent,
        priority: priority !== undefined ? parseInt(priority) : existing.priority,
        status: status !== undefined ? status : existing.status,
        device: device !== undefined ? device : existing.device,
        rotationMode: rotationMode !== undefined ? rotationMode : existing.rotationMode,
        rotationInterval: rotationInterval !== undefined ? parseInt(rotationInterval) : existing.rotationInterval,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
        maxImpressions: maxImpressions !== undefined ? (maxImpressions ? parseInt(maxImpressions) : null) : existing.maxImpressions,
        maxClicks: maxClicks !== undefined ? (maxClicks ? parseInt(maxClicks) : null) : existing.maxClicks,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    let action = "ADVERTISEMENT_UPDATED";
    if (existing.isActive && !updated.isActive) action = "ADVERTISEMENT_PAUSED";
    else if (!existing.isActive && updated.isActive) action = "ADVERTISEMENT_RESUMED";
    else if (updated.status === "ARCHIVED") action = "ADVERTISEMENT_ARCHIVED";

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      entityType: "SETTING",
      entityId: updated.id,
      entityTitle: updated.name,
      previousStatus: existing.status,
      newStatus: updated.status,
      details: { location: updated.location, priority: updated.priority },
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin/homepage");
    } catch {}

    return NextResponse.json({ success: true, ad: updated });
  } catch (error) {
    console.error("PUT /api/ads/[id] error:", error);
    return NextResponse.json({ error: "Failed to update advertisement" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role === "REPORTER") {
      return NextResponse.json(
        { error: "Reporters do not have permission to delete advertisements." },
        { status: 403 }
      );
    }

    const existing = await prisma.advertisement.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
    }

    await prisma.advertisement.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "ADVERTISEMENT_DELETED",
      entityType: "SETTING",
      entityId: params.id,
      entityTitle: existing.name,
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, message: "Advertisement deleted" });
  } catch (error) {
    console.error("DELETE /api/ads/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete advertisement" }, { status: 500 });
  }
}
