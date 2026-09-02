import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin role required to restore site versions." },
        { status: 403 }
      );
    }

    const version = await prisma.siteBuilderVersion.findUnique({
      where: { id: params.id },
    });

    if (!version) {
      return NextResponse.json({ error: "Version snapshot not found" }, { status: 404 });
    }

    // Restore to published configuration
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        siteConfigJson: version.snapshot,
        draftSiteConfigJson: null,
      },
      create: {
        id: "default",
        siteConfigJson: version.snapshot,
      },
    });

    // Record audit event
    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "SITE_BUILDER_RESTORED",
      entityType: "SETTING",
      entityTitle: `Restored Version: ${version.versionName}`,
      details: { versionId: version.id, restoredBy: user.name },
    });

    // Invalidate caches
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
      message: `Successfully restored site configuration from "${version.versionName}".`,
    });
  } catch (error) {
    console.error("Restore version error:", error);
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
