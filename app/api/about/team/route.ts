import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    const user = getSessionFromRequest(req);
    const canSeeDrafts = includeDrafts && Boolean(user && (user.role === "SUPER_ADMIN" || user.role === "EDITOR"));

    const members = await prisma.teamMember.findMany({
      where: canSeeDrafts ? {} : { status: "PUBLISHED" },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, teamMembers: members });
  } catch (error: any) {
    console.error("[GET /api/about/team] Error:", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized. Staff permissions required." }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Employee full name is required." }, { status: 400 });
    }
    if (!body.designation || !body.designation.trim()) {
      return NextResponse.json({ error: "Designation is required." }, { status: 400 });
    }

    // Determine default order if not provided
    let order = Number(body.order);
    if (isNaN(order)) {
      const highest = await prisma.teamMember.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      order = (highest?.order || 0) + 1;
    }

    const newMember = await prisma.teamMember.create({
      data: {
        name: body.name.trim(),
        designation: body.designation.trim(),
        bio: body.bio?.trim() || null,
        photo: body.photo || null,
        order,
        status: body.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        isDemo: Boolean(body.isDemo),
        twitter: body.twitter?.trim() || null,
        linkedin: body.linkedin?.trim() || null,
        email: body.email?.trim() || null,
      },
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "CREATE",
          entityType: "TEAM_MEMBER",
          entityId: newMember.id,
          entityTitle: newMember.name,
          details: JSON.stringify({ designation: newMember.designation, status: newMember.status }),
        },
      });
    } catch {}

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    console.error("[POST /api/about/team] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create team member" }, { status: 500 });
  }
}
