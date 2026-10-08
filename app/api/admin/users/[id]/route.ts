import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/admin/users/[id] — Retrieve single user details
export async function GET(
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
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find author profile and article count
    const author = await prisma.author.findFirst({
      where: {
        OR: [
          { email: user.email },
          { name: user.name },
        ],
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return NextResponse.json({
      user: {
        ...user,
        designation: author?.designation || (user.role === "SUPER_ADMIN" ? "Executive Editor" : user.role === "EDITOR" ? "Senior Editor" : "Staff Reporter"),
        bio: author?.bio || null,
        authorProfile: author
          ? {
              id: author.id,
              slug: author.slug,
              designation: author.designation,
              bio: author.bio,
              articleCount: author._count.articles,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] — Edit employee details
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
    const {
      name,
      email,
      designation,
      bio,
      role,
      avatar,
      status,
    } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect Last Active Super Admin
    if (existingUser.role === "SUPER_ADMIN") {
      const isDemotingOrSuspending =
        (role && role !== "SUPER_ADMIN") || (status && status !== "ACTIVE");

      if (isDemotingOrSuspending) {
        const activeSuperAdmins = await prisma.user.count({
          where: {
            role: "SUPER_ADMIN",
            status: "ACTIVE",
            id: { not: id },
          },
        });

        if (activeSuperAdmins === 0) {
          return NextResponse.json(
            {
              error:
                "Security Protection: Cannot demote or deactivate the last remaining active Super Admin account.",
            },
            { status: 400 }
          );
        }
      }
    }

    // Check email uniqueness if email is changed
    let normalizedEmail = existingUser.email;
    if (email && email.trim().toLowerCase() !== existingUser.email.toLowerCase()) {
      normalizedEmail = email.trim().toLowerCase();
      const emailConflict = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (emailConflict && emailConflict.id !== id) {
        return NextResponse.json(
          { error: `Email address "${normalizedEmail}" is already taken.` },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existingUser.name,
        email: normalizedEmail,
        role: role !== undefined ? (role as Role) : existingUser.role,
        avatar: avatar !== undefined ? avatar?.trim() : existingUser.avatar,
        status: status !== undefined ? status : existingUser.status,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Synchronize Author profile if one exists for this user/email
    const existingAuthor = await prisma.author.findFirst({
      where: {
        OR: [
          { email: existingUser.email },
          { email: updatedUser.email },
          { name: existingUser.name },
        ],
      },
    });

    if (existingAuthor) {
      await prisma.author.update({
        where: { id: existingAuthor.id },
        data: {
          name: updatedUser.name,
          email: updatedUser.email,
          designation: designation !== undefined ? designation.trim() : existingAuthor.designation,
          bio: bio !== undefined ? bio?.trim() : existingAuthor.bio,
          avatar: updatedUser.avatar || existingAuthor.avatar,
        },
      });
    }

    // Audit Log
    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: "USER_UPDATED",
      entityType: "USER",
      entityId: updatedUser.id,
      entityTitle: `${updatedUser.name} (${updatedUser.email})`,
      previousStatus: existingUser.status,
      newStatus: updatedUser.status,
      details: {
        updatedFields: {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          designation: designation,
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        designation: designation || existingAuthor?.designation || "Staff Member",
        bio: bio !== undefined ? bio : existingAuthor?.bio,
      },
    });
  } catch (error) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update employee details" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] — Safe Archive or Delete Employee
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

    // Prevent deleting self
    if (session.id === id) {
      return NextResponse.json(
        { error: "Action Denied: You cannot delete your own active session account." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect Last Super Admin
    if (user.role === "SUPER_ADMIN") {
      const activeSuperAdmins = await prisma.user.count({
        where: {
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          id: { not: id },
        },
      });

      if (activeSuperAdmins === 0) {
        return NextResponse.json(
          {
            error:
              "Action Denied: Cannot delete or archive the only remaining Super Admin.",
          },
          { status: 400 }
        );
      }
    }

    // Check Historical Records to protect journalistic attribution
    const [authoredArticles, createdArticles, commentsCount] = await Promise.all([
      prisma.author.findFirst({
        where: {
          OR: [{ email: user.email }, { name: user.name }],
        },
        include: {
          _count: { select: { articles: true } },
        },
      }),
      prisma.article.count({ where: { createdById: user.id } }),
      prisma.comment.count({ where: { userId: user.id } }),
    ]);

    const totalArticles = (authoredArticles?._count.articles || 0) + createdArticles;

    // If historical articles or comments exist: Safe-Archive (Deactivate & mark status SUSPENDED)
    if (totalArticles > 0 || commentsCount > 0) {
      await prisma.user.update({
        where: { id },
        data: { status: "SUSPENDED" },
      });

      await logAuditEvent({
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: "USER_ARCHIVED",
        entityType: "USER",
        entityId: user.id,
        entityTitle: `${user.name} (${user.email})`,
        previousStatus: user.status,
        newStatus: "SUSPENDED",
        details: {
          reason: `Account safely archived to preserve ${totalArticles} articles and ${commentsCount} comments in newsroom history.`,
        },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: `Account archived successfully. Historical articles (${totalArticles}) and comments are safely preserved.`,
      });
    }

    // If zero historical records, perform safe permanent deletion
    await prisma.user.delete({
      where: { id },
    });

    if (authoredArticles && (authoredArticles._count.articles === 0)) {
      await prisma.author.delete({
        where: { id: authoredArticles.id },
      }).catch(() => {});
    }

    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: "USER_DELETED",
      entityType: "USER",
      entityId: user.id,
      entityTitle: `${user.name} (${user.email})`,
      details: { deletedEmail: user.email, role: user.role },
    });

    return NextResponse.json({
      success: true,
      deleted: true,
      message: "Employee account removed successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to remove employee account" },
      { status: 500 }
    );
  }
}
