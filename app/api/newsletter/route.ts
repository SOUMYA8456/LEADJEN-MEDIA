import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { RateLimiters } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Rate Limiting: 3 signups per 10 minutes
    const rateLimit = RateLimiters.newsletter(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const normalized = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalized },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You are already subscribed to Leadjen Daily Briefing.",
      });
    }

    await prisma.newsletterSubscriber.create({
      data: { email: normalized },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription confirmed.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Subscription error" },
      { status: 500 }
    );
  }
}
