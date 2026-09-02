import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEFAULT_SEO_SETTINGS = {
  id: "default",
  siteTitle: "LEADJEN MEDIA | Independent Journalism. Important Stories.",
  siteDescription:
    "Leading digital news publishing platform covering India, world affairs, politics, business, technology, sports, health, and science.",
  siteUrl: "https://leadjen-media-news.vercel.app",
  publisherName: "LEADJEN MEDIA",
  publisherLogo: "https://leadjen-media-news.vercel.app/logo.png",
  defaultSocialImg:
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=630&q=80",
  twitterHandle: "@leadjenmedia",
  defaultKeywords:
    "news, breaking news, india news, world news, politics, business, technology, investigative journalism",
  googleVerify: "",
  bingVerify: "",
};

// GET /api/settings/seo
export async function GET() {
  try {
    let settings = await prisma.seoSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.seoSettings.create({
        data: DEFAULT_SEO_SETTINGS,
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("GET SEO Settings Error:", error);
    return NextResponse.json({ settings: DEFAULT_SEO_SETTINGS });
  }
}

// POST /api/settings/seo - Update settings with RBAC check
export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admins and Editors can modify SEO settings." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Sanitize user inputs to prevent HTML / JavaScript script injection
    const sanitize = (val: any) =>
      typeof val === "string"
        ? val
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .trim()
        : "";

    const updated = await prisma.seoSettings.upsert({
      where: { id: "default" },
      update: {
        siteTitle: sanitize(body.siteTitle) || DEFAULT_SEO_SETTINGS.siteTitle,
        siteDescription: sanitize(body.siteDescription) || DEFAULT_SEO_SETTINGS.siteDescription,
        siteUrl: sanitize(body.siteUrl) || DEFAULT_SEO_SETTINGS.siteUrl,
        publisherName: sanitize(body.publisherName) || DEFAULT_SEO_SETTINGS.publisherName,
        publisherLogo: sanitize(body.publisherLogo) || DEFAULT_SEO_SETTINGS.publisherLogo,
        defaultSocialImg: sanitize(body.defaultSocialImg) || DEFAULT_SEO_SETTINGS.defaultSocialImg,
        twitterHandle: sanitize(body.twitterHandle) || DEFAULT_SEO_SETTINGS.twitterHandle,
        defaultKeywords: sanitize(body.defaultKeywords) || DEFAULT_SEO_SETTINGS.defaultKeywords,
        googleVerify: sanitize(body.googleVerify),
        bingVerify: sanitize(body.bingVerify),
      },
      create: {
        id: "default",
        siteTitle: sanitize(body.siteTitle) || DEFAULT_SEO_SETTINGS.siteTitle,
        siteDescription: sanitize(body.siteDescription) || DEFAULT_SEO_SETTINGS.siteDescription,
        siteUrl: sanitize(body.siteUrl) || DEFAULT_SEO_SETTINGS.siteUrl,
        publisherName: sanitize(body.publisherName) || DEFAULT_SEO_SETTINGS.publisherName,
        publisherLogo: sanitize(body.publisherLogo) || DEFAULT_SEO_SETTINGS.publisherLogo,
        defaultSocialImg: sanitize(body.defaultSocialImg) || DEFAULT_SEO_SETTINGS.defaultSocialImg,
        twitterHandle: sanitize(body.twitterHandle) || DEFAULT_SEO_SETTINGS.twitterHandle,
        defaultKeywords: sanitize(body.defaultKeywords) || DEFAULT_SEO_SETTINGS.defaultKeywords,
        googleVerify: sanitize(body.googleVerify),
        bingVerify: sanitize(body.bingVerify),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "SEO_SETTINGS_UPDATED",
        entityType: "SETTING",
        entityId: "seo",
        entityTitle: "Global SEO Configuration",
        details: JSON.stringify({ siteTitle: updated.siteTitle }),
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("POST SEO Settings Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update SEO settings" },
      { status: 500 }
    );
  }
}
