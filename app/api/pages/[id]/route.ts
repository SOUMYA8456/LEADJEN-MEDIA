import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { sanitizeHtml, sanitizePlainText } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.page.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existing = await prisma.page.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const cleanSlug = slug ? slugify(slug) : existing.slug;

    // Check slug collision if slug changed
    if (cleanSlug !== existing.slug) {
      const collision = await prisma.page.findUnique({
        where: { slug: cleanSlug },
      });
      if (collision) {
        return NextResponse.json(
          { error: `A page with slug "${cleanSlug}" already exists.` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.page.update({
      where: { id: params.id },
      data: {
        title: title ? sanitizePlainText(title) : existing.title,
        slug: cleanSlug,
        content: content !== undefined ? sanitizeHtml(content) : existing.content,
        featuredImage: featuredImage !== undefined ? featuredImage : existing.featuredImage,
        seoTitle: seoTitle !== undefined ? sanitizePlainText(seoTitle) : existing.seoTitle,
        seoDescription: seoDescription !== undefined ? sanitizePlainText(seoDescription) : existing.seoDescription,
        status: status !== undefined ? status : existing.status,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "PAGE_UPDATED",
      entityType: "SETTING",
      entityId: updated.id,
      entityTitle: updated.title,
      details: { slug: updated.slug, status: updated.status },
    });

    return NextResponse.json({ success: true, page: updated });
  } catch (error) {
    console.error("PUT /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin role required to delete pages." },
        { status: 403 }
      );
    }

    const existing = await prisma.page.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await prisma.page.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "PAGE_DELETED",
      entityType: "SETTING",
      entityId: params.id,
      entityTitle: existing.title,
    });

    return NextResponse.json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
