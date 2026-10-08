import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/authors/[id] — Fetch single author profile
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const author = await prisma.author.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    return NextResponse.json({ author });
  } catch (error) {
    console.error("GET /api/authors/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch author" }, { status: 500 });
  }
}

// PUT /api/authors/[id] — Update author profile (SUPER_ADMIN only)
export async function PUT(
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
    const body = await req.json();
    const { name, designation, department, bio, avatar, email, twitter, linkedin, status } = body;

    const existing = await prisma.author.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    const updated = await prisma.author.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        designation: designation !== undefined ? designation.trim() : existing.designation,
        department: department !== undefined ? department.trim() : existing.department,
        bio: bio !== undefined ? bio?.trim() : existing.bio,
        avatar: avatar !== undefined ? avatar?.trim() : existing.avatar,
        email: email !== undefined ? email?.trim() : existing.email,
        twitter: twitter !== undefined ? twitter?.trim() : existing.twitter,
        linkedin: linkedin !== undefined ? linkedin?.trim() : existing.linkedin,
        status: status !== undefined ? status : existing.status,
      },
    });

    // Also synchronize corresponding User account if one exists
    if (updated.email || existing.email) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: updated.email || "" },
            { email: existing.email || "" },
          ],
        },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            name: updated.name,
            designation: updated.designation,
            department: updated.department,
            bio: updated.bio,
            avatar: updated.avatar,
          },
        });
      }
    }

    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: "AUTHOR_UPDATED",
      entityType: "AUTHOR",
      entityId: updated.id,
      entityTitle: `${updated.name} (${updated.designation})`,
      details: { updatedFields: { name, designation, department, status } },
    });

    return NextResponse.json({ success: true, author: updated });
  } catch (error) {
    console.error("PUT /api/authors/[id] error:", error);
    return NextResponse.json({ error: "Failed to update author" }, { status: 500 });
  }
}

// DELETE /api/authors/[id] — Safe Archive or Delete Author (SUPER_ADMIN only)
export async function DELETE(
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
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: { select: { articles: true } },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    // If author has published or historical articles: Archive rather than breaking article records
    if (author._count.articles > 0) {
      await prisma.author.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      await logAuditEvent({
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: "AUTHOR_ARCHIVED",
        entityType: "AUTHOR",
        entityId: author.id,
        entityTitle: `${author.name}`,
        details: {
          reason: `Preserved attribution for ${author._count.articles} published stories.`,
        },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: `Author archived successfully. Historical attribution for ${author._count.articles} articles is preserved.`,
      });
    }

    // Zero articles: safe removal
    await prisma.author.delete({ where: { id } });

    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: "AUTHOR_DELETED",
      entityType: "AUTHOR",
      entityId: author.id,
      entityTitle: `${author.name}`,
      details: { deletedName: author.name },
    });

    return NextResponse.json({
      success: true,
      deleted: true,
      message: "Author profile removed successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/authors/[id] error:", error);
    return NextResponse.json({ error: "Failed to remove author profile" }, { status: 500 });
  }
}
