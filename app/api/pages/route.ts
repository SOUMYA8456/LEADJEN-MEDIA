import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { sanitizeHtml, sanitizePlainText } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const status = searchParams.get("status");

    if (slug) {
      const page = await prisma.page.findUnique({
        where: { slug },
      });
      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }
      return NextResponse.json({ page });
    }

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const pages = await prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("GET /api/pages error:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin or Editor role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, slug, content, featuredImage, seoTitle, seoDescription, status } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Page title and content are required." },
        { status: 400 }
      );
    }

    const cleanSlug = slug ? slugify(slug) : slugify(title);

    // Check duplicate slug
    const existing = await prisma.page.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A page with slug "${cleanSlug}" already exists.` },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        title: sanitizePlainText(title),
        slug: cleanSlug,
        content: sanitizeHtml(content),
        featuredImage: featuredImage || null,
        seoTitle: seoTitle ? sanitizePlainText(seoTitle) : title,
        seoDescription: seoDescription ? sanitizePlainText(seoDescription) : null,
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "PAGE_CREATED",
      entityType: "SETTING",
      entityId: page.id,
      entityTitle: page.title,
      details: { slug: page.slug, status: page.status },
    });

    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pages error:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
