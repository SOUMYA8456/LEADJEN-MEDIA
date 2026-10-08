import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// POST /api/admin/users/[id]/reset-password — Reset employee password (SUPER_ADMIN only)
export async function POST(
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
    const body = await req.json().catch(() => ({}));
    const customPassword = body.password;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate secure temporary password if not provided
    const tempPassword =
      customPassword && customPassword.trim().length >= 6
        ? customPassword.trim()
        : `LjMedia@${crypto.randomBytes(4).toString("hex")}`;

    // Hash securely with bcrypt
    const passwordHash = await hashPassword(tempPassword);

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Audit Log — Explicitly NO password in logs
    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: "PASSWORD_RESET",
      entityType: "USER",
      entityId: user.id,
      entityTitle: `${user.name} (${user.email})`,
      details: {
        targetUserId: user.id,
        targetEmail: user.email,
        targetRole: user.role,
        resetBy: session.email,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
      tempPassword, // Returned ONLY once in response payload for Super Admin copy
    });
  } catch (error) {
    console.error("POST /api/admin/users/[id]/reset-password error:", error);
    return NextResponse.json(
      { error: "Failed to reset employee password" },
      { status: 500 }
    );
  }
}
