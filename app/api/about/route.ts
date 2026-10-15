import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { getAboutPageData } from "@/lib/about-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    const user = getSessionFromRequest(req);
    const canSeeDrafts = includeDrafts && Boolean(user && (user.role === "SUPER_ADMIN" || user.role === "EDITOR"));

    const data = await getAboutPageData(canSeeDrafts);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("[GET /api/about] Error:", error);
    return NextResponse.json({ error: "Failed to fetch about page data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized. Staff permissions required." }, { status: 401 });
    }

    const body = await req.json();

    const updated = await prisma.aboutPageSettings.upsert({
      where: { id: "default" },
      update: {
        heroHeading: body.heroHeading ?? undefined,
        heroSubtitle: body.heroSubtitle ?? undefined,
        introduction: body.introduction ?? undefined,
        ceoName: body.ceoName ?? undefined,
        ceoDesignation: body.ceoDesignation ?? undefined,
        ceoBio: body.ceoBio ?? undefined,
        ceoMessage: body.ceoMessage ?? undefined,
        ceoPhoto: body.ceoPhoto ?? undefined,
        ceoTwitter: body.ceoTwitter ?? undefined,
        ceoLinkedin: body.ceoLinkedin ?? undefined,
        ceoEmail: body.ceoEmail ?? undefined,
        missionTitle: body.missionTitle ?? undefined,
        missionText: body.missionText ?? undefined,
        visionTitle: body.visionTitle ?? undefined,
        visionText: body.visionText ?? undefined,
        valuesTitle: body.valuesTitle ?? undefined,
        valuesJson: body.values ? JSON.stringify(body.values) : undefined,
        coverageTitle: body.coverageTitle ?? undefined,
        coverageText: body.coverageText ?? undefined,
      },
      create: {
        id: "default",
        heroHeading: body.heroHeading || "ABOUT LEADJEN MEDIA",
        heroSubtitle: body.heroSubtitle || "Independent Journalism. Trusted Perspectives. Stories That Matter.",
        introduction: body.introduction || "Leadjen Media is an independent digital news publishing and media enterprise.",
        ceoName: body.ceoName || "CEO & Director",
        ceoDesignation: body.ceoDesignation || "Chief Executive Officer & Director",
        ceoBio: body.ceoBio || "",
        ceoMessage: body.ceoMessage || "",
        ceoPhoto: body.ceoPhoto || null,
        ceoTwitter: body.ceoTwitter || null,
        ceoLinkedin: body.ceoLinkedin || null,
        ceoEmail: body.ceoEmail || null,
        missionTitle: body.missionTitle || "OUR MISSION",
        missionText: body.missionText || "",
        visionTitle: body.visionTitle || "OUR VISION",
        visionText: body.visionText || "",
        valuesTitle: body.valuesTitle || "OUR EDITORIAL VALUES",
        valuesJson: body.values ? JSON.stringify(body.values) : null,
        coverageTitle: body.coverageTitle || "WHAT WE COVER",
        coverageText: body.coverageText || "",
      },
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "UPDATE",
          entityType: "ABOUT_SETTINGS",
          entityId: "default",
          entityTitle: "About Page Settings",
          details: JSON.stringify({ updatedFields: Object.keys(body) }),
        },
      });
    } catch {}

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("[PUT /api/about] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update about settings" }, { status: 500 });
  }
}
