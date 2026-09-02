import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .trim();
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Permissions: only comment owner OR editor/admin can edit
    const isOwner = comment.userId === session.id;
    const isStaff = session.role === "SUPER_ADMIN" || session.role === "EDITOR";

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Forbidden. You can only edit your own comments." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content cannot be empty." }, { status: 400 });
    }

    const sanitizedContent = sanitizeText(content);

    const updated = await prisma.comment.update({
      where: { id: params.id },
      data: {
        content: sanitizedContent,
        isEdited: true,
      },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error("PUT /api/comments/[id] error:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const isOwner = comment.userId === session.id;
    const isStaff = session.role === "SUPER_ADMIN" || session.role === "EDITOR";

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Forbidden. You can only delete your own comments." },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: "COMMENT_DELETED",
      entityType: "ARTICLE",
      entityId: comment.articleId,
      details: { commentId: params.id },
    });

    return NextResponse.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("DELETE /api/comments/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
