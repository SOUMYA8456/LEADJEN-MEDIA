import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

// PATCH /api/admin/users/[id]/status — Toggle user active / suspended status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Super Admin access required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!["ACTIVE", "SUSPENDED", "INACTIVE"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be ACTIVE or SUSPENDED." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect Last Active Super Admin
    if (user.role === "SUPER_ADMIN" && status !== "ACTIVE") {
      const activeSuperAdmins = await prisma.user.count({
        where: {
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          id: { not: id },
        },
      });

      if (activeSuperAdmins === 0) {
        return NextResponse.json(
          {
            error:
              "Protection rule: Cannot deactivate the last remaining active Super Admin account.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: status === "ACTIVE" ? "ACTIVE" : "SUSPENDED" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    // Audit Log
    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: "USER_STATUS_CHANGED",
      entityType: "USER",
      entityId: user.id,
      entityTitle: `${user.name} (${user.email})`,
      previousStatus: user.status,
      newStatus: updated.status,
      details: {
        reason: `Account status updated to ${updated.status} by Super Admin`,
      },
    });

    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/status error:", error);
    return NextResponse.json(
      { error: "Failed to update account status" },
      { status: 500 }
    );
  }
}
