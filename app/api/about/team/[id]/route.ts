import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.teamMember.findUnique({
      where: { id: params.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized. Staff permissions required." }, { status: 401 });
    }

    const body = await req.json();

    const existing = await prisma.teamMember.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    const updated = await prisma.teamMember.update({
      where: { id: params.id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        designation: body.designation !== undefined ? body.designation.trim() : undefined,
        bio: body.bio !== undefined ? (body.bio?.trim() || null) : undefined,
        photo: body.photo !== undefined ? body.photo : undefined,
        order: body.order !== undefined ? Number(body.order) : undefined,
        status: body.status !== undefined ? (body.status === "DRAFT" ? "DRAFT" : "PUBLISHED") : undefined,
        isDemo: body.isDemo !== undefined ? Boolean(body.isDemo) : undefined,
        twitter: body.twitter !== undefined ? (body.twitter?.trim() || null) : undefined,
        linkedin: body.linkedin !== undefined ? (body.linkedin?.trim() || null) : undefined,
        email: body.email !== undefined ? (body.email?.trim() || null) : undefined,
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
          entityType: "TEAM_MEMBER",
          entityId: updated.id,
          entityTitle: updated.name,
          details: JSON.stringify({ designation: updated.designation, status: updated.status }),
        },
      });
    } catch {}

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    console.error("[PUT /api/about/team/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized. Staff permissions required." }, { status: 401 });
    }

    const existing = await prisma.teamMember.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    await prisma.teamMember.delete({
      where: { id: params.id },
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "DELETE",
          entityType: "TEAM_MEMBER",
          entityId: existing.id,
          entityTitle: existing.name,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error: any) {
    console.error("[DELETE /api/about/team/[id]] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete team member" }, { status: 500 });
  }
}
