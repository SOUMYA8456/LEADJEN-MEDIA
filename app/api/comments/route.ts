import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Basic HTML and script sanitizer
function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    const sessionUser = getSessionFromRequest(req);

    // Fetch approved comments OR user's own pending comments
    const where: any = {
      articleId,
      OR: [
        { status: "APPROVED" },
        ...(sessionUser ? [{ userId: sessionUser.id }] : []),
      ],
    };

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        authorName: true,
        status: true,
        isApproved: true,
        isEdited: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("GET /api/comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = getSessionFromRequest(req);
    const body = await req.json();
    const { articleId, content, authorName, authorEmail } = body;

    if (!articleId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "Article ID and comment content are required." },
        { status: 400 }
      );
    }

    const sanitizedContent = sanitizeText(content);
    if (!sanitizedContent) {
      return NextResponse.json(
        { error: "Comment contains invalid or empty characters." },
        { status: 400 }
      );
    }

    if (sanitizedContent.length > 2000) {
      return NextResponse.json(
        { error: "Comment is too long (maximum 2000 characters)." },
        { status: 400 }
      );
    }

    const name = sessionUser ? sessionUser.name : (authorName ? authorName.trim() : "Anonymous Reader");
    const email = sessionUser ? sessionUser.email : (authorEmail ? authorEmail.trim().toLowerCase() : "reader@leadjenmedia.com");

    // Basic anti-spam rate limiting: check recent comments by this user or email within 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const recentCount = await prisma.comment.count({
      where: {
        OR: [
          ...(sessionUser ? [{ userId: sessionUser.id }] : []),
          { authorEmail: email },
        ],
        createdAt: { gte: tenSecondsAgo },
      },
    });

    if (recentCount > 0) {
      return NextResponse.json(
        { error: "Please wait a moment before posting another comment." },
        { status: 429 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, title: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Default moderation status is PENDING
    const comment = await prisma.comment.create({
      data: {
        articleId,
        userId: sessionUser ? sessionUser.id : null,
        authorName: name,
        authorEmail: email,
        content: sanitizedContent,
        status: "PENDING",
        isApproved: false,
      },
    });

    // Record audit event
    await logAuditEvent({
      userId: sessionUser ? sessionUser.id : null,
      userName: name,
      userRole: sessionUser ? sessionUser.role : "READER",
      action: "COMMENT_SUBMITTED",
      entityType: "ARTICLE",
      entityId: articleId,
      entityTitle: article.title,
      newStatus: "PENDING",
      details: { commentId: comment.id },
    });

    return NextResponse.json({
      success: true,
      comment,
      message: "Comment submitted for editorial moderation.",
    });
  } catch (error) {
    console.error("POST /api/comments error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
