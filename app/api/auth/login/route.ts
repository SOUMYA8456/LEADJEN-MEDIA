import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, COOKIE_NAME } from "@/lib/auth";
import { RateLimiters } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown Device";
  let email = "";

  try {
    const body = await req.json().catch(() => ({}));
    email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    // Rate Limiting: 5 attempts per 15 minutes
    const rateLimit = RateLimiters.login(ip);
    if (!rateLimit.success) {
      const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (60 * 1000));
      await logAuditEvent({
        action: "LOGIN_FAILED",
        entityType: "SECURITY",
        entityTitle: `Rate Limited Login: ${email || "unknown"}`,
        details: { ip, userAgent, email, reason: `Rate limited (${waitMinutes}m cooldown)` },
      });
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${waitMinutes} minute(s).` },
        { status: 429 }
      );
    }

    if (!email || !password) {
      await logAuditEvent({
        action: "LOGIN_FAILED",
        entityType: "SECURITY",
        entityTitle: "Login Failed: Missing Credentials",
        details: { ip, userAgent, reason: "Missing email or password" },
      });
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const authResult = await authenticateAdmin(email, password);

    if (!authResult) {
      await logAuditEvent({
        action: "LOGIN_FAILED",
        entityType: "SECURITY",
        entityTitle: `Login Failed: ${email}`,
        details: { ip, userAgent, email, reason: "Invalid email or password" },
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if ("error" in authResult) {
      await logAuditEvent({
        action: "LOGIN_FAILED",
        entityType: "SECURITY",
        entityTitle: `Login Blocked: ${email}`,
        details: { ip, userAgent, email, reason: authResult.error },
      });
      return NextResponse.json(
        { error: authResult.error },
        { status: 403 }
      );
    }

    // Login Success Audit
    await logAuditEvent({
      userId: authResult.user.id,
      userName: authResult.user.name,
      userRole: authResult.user.role,
      action: "LOGIN_SUCCESS",
      entityType: "USER",
      entityId: authResult.user.id,
      entityTitle: `${authResult.user.name} (${authResult.user.email})`,
      details: {
        ip,
        userAgent,
        email: authResult.user.email,
        role: authResult.user.role,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: authResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    await logAuditEvent({
      action: "LOGIN_FAILED",
      entityType: "SECURITY",
      entityTitle: `Login Error: ${email || "unknown"}`,
      details: { ip, userAgent, email, reason: "Internal server error during authentication" },
    });
    return NextResponse.json(
      { error: "Authentication internal error" },
      { status: 500 }
    );
  }
}
