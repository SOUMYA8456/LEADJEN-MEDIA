import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role === "REPORTER" || session.role === "READER") {
      return NextResponse.json(
        { error: "Forbidden. Only Editors and Super Admins have comment moderation authority." },
        { status: 403 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: { article: { select: { title: true } } },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "SPAM", "DELETED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid moderation status" }, { status: 400 });
    }

    const isApproved = status === "APPROVED";

    const updated = await prisma.comment.update({
      where: { id: params.id },
      data: {
        status,
        isApproved,
      },
    });

    const action =
      status === "APPROVED"
        ? "COMMENT_APPROVED"
        : status === "REJECTED"
        ? "COMMENT_REJECTED"
        : status === "SPAM"
        ? "COMMENT_MARKED_SPAM"
        : "COMMENT_MODERATED";

    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action,
      entityType: "ARTICLE",
      entityId: comment.articleId,
      entityTitle: comment.article?.title,
      previousStatus: comment.status,
      newStatus: status,
      details: { commentId: params.id, authorName: comment.authorName },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error("PUT /api/comments/[id]/moderate error:", error);
    return NextResponse.json({ error: "Failed to moderate comment" }, { status: 500 });
  }
}
