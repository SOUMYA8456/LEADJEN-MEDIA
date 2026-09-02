import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, generateToken, COOKIE_NAME } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword, avatar } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create public READER user account (NEVER grant editorial permissions on sign up)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "READER",
        avatar: avatar || null,
        status: "ACTIVE",
      },
    });

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = generateToken(sessionUser);

    // Auto-create a welcome notification for the reader
    await prisma.userNotification.create({
      data: {
        userId: user.id,
        title: "Welcome to Leadjen Media",
        message: "Thank you for joining Leadjen Media. You can now save articles, follow categories, and participate in discussions.",
        type: "SYSTEM",
      },
    });

    // Log registration audit event
    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "READER_REGISTERED",
      entityType: "USER",
      entityId: user.id,
      entityTitle: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      message: "Welcome to Leadjen Media.",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
