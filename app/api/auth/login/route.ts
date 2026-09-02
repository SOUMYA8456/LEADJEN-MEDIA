import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, COOKIE_NAME } from "@/lib/auth";
import { RateLimiters } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Rate Limiting: 5 attempts per 15 minutes
    const rateLimit = RateLimiters.login(ip);
    if (!rateLimit.success) {
      const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${waitMinutes} minute(s).` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const authResult = await authenticateAdmin(email.trim(), password);

    if (!authResult) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 403 }
      );
    }

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
    return NextResponse.json(
      { error: "Authentication internal error" },
      { status: 500 }
    );
  }
}
