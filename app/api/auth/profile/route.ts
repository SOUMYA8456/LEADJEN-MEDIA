import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest, hashPassword, comparePassword, generateToken, COOKIE_NAME } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            bookmarks: true,
            categoryFollows: true,
            comments: true,
            userNotifications: {
              where: { isRead: false },
            },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error("GET /api/auth/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatar, currentPassword, newPassword } = body;

    const existing = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar || null;
    }

    // Password change handling
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      const isValidCurrent = await comparePassword(currentPassword, existing.passwordHash);
      if (!isValidCurrent) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
    });

    await logAuditEvent({
      userId: updated.id,
      userName: updated.name,
      userRole: updated.role,
      action: "READER_PROFILE_UPDATED",
      entityType: "USER",
      entityId: updated.id,
      entityTitle: updated.name,
    });

    const sessionUser = {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    };

    const token = generateToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
      },
      message: "Profile updated successfully.",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("PUT /api/auth/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
