import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = checkRateLimit(`inquiry:${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      company,
      inquiryType = "ADVERTISING", // ADVERTISING | SERVICE | GENERAL
      serviceName,
      advertisingType,
      budget,
      timeline,
      message,
    } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Create an editorial notification for newsroom and advertising desk
    try {
      await prisma.editorialNotification.create({
        data: {
          targetRole: "SUPER_ADMIN",
          message: `New ${inquiryType} Inquiry from ${name} (${company || "Individual"}) — ${email}`,
          type: "INQUIRY_RECEIVED",
          link: "/admin/site-builder/advertising",
        },
      });
    } catch {}

    // Create an audit log record
    try {
      await logAuditEvent({
        userId: "system",
        userName: name,
        userRole: "PUBLIC_CLIENT",
        action: "INQUIRY_SUBMITTED",
        entityType: inquiryType === "ADVERTISING" ? "ADVERTISEMENT" : "SERVICE",
        entityTitle: `${inquiryType}: ${company || name}`,
        details: JSON.stringify({
          name,
          email,
          phone,
          company,
          inquiryType,
          serviceName,
          advertisingType,
          budget,
          timeline,
          message: message.slice(0, 500),
          ip,
        }),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out to Leadjen Media. Our partnership desk will respond within 24 business hours.",
    });
  } catch (error: any) {
    console.error("Inquiry submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}
