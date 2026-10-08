import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { calculateReadingTime, slugify } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit";
import { createEditorialNotification } from "@/lib/notifications";
import { broadcastRealtimeEvent } from "@/lib/realtime";
import { revalidatePath } from "next/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        category: true,
        author: true,
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Get single article error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const existing = await prisma.article.findUnique({
      where: { id: params.id },
      include: { category: true, author: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Role check: REPORTER can only edit their own articles
    const isOwner =
      existing.createdById === user.id ||
      existing.authorId === user.id ||
      (existing.author && existing.author.name.toLowerCase().includes(user.name.toLowerCase()));

    if (user.role === "REPORTER" && !isOwner && existing.createdById) {
      return NextResponse.json(
        { error: "Reporters can only edit their own articles." },
        { status: 403 }
      );
    }

    const { clientUpdatedAt, forceOverwrite } = body;

    // Concurrent Editing Guard
    if (clientUpdatedAt && existing.updatedAt && !forceOverwrite) {
      const clientTime = new Date(clientUpdatedAt).getTime();
      const dbTime = new Date(existing.updatedAt).getTime();
      if (dbTime - clientTime > 5000) {
        return NextResponse.json(
          {
            error: "CONFLICT: This article was modified by another editor while you were editing.",
            isConflict: true,
            lastModifiedAt: existing.updatedAt,
          },
          { status: 409 }
        );
      }
    }

    const {
      title,
      slug,
      subtitle,
      excerpt,
      content,
      featuredImage,
      gallery,
      categoryId,
      authorId,
      status,
      reviewFeedback,
      isFeatured,
      isBreaking,
      isTrending,
      isVideo,
      videoUrl,
      isOpinion,
      seoTitle,
      seoDescription,
      ogImage,
      scheduledAt,
    } = body;

    // RBAC status checks for REPORTER
    let newStatus = status !== undefined ? status : existing.status;
    if (user.role === "REPORTER") {
      if (status === "PUBLISHED" || status === "APPROVED" || status === "SCHEDULED") {
        return NextResponse.json(
          { error: "Reporters cannot directly approve, schedule, or publish articles. Submit for review instead." },
          { status: 403 }
        );
      }
      // If reporter edits while in review or resubmits
      if (status && !["DRAFT", "IN_REVIEW", "ARCHIVED"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status transition for reporter role." },
          { status: 403 }
        );
      }
    }

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = slugify(slug);
      const conflict = await prisma.article.findFirst({
        where: { slug: finalSlug, NOT: { id: existing.id } },
      });
      if (conflict) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const readingTime = content ? calculateReadingTime(content) : existing.readingTime;

    let publishedAt = existing.publishedAt;
    let scheduledDate = existing.scheduledAt;
    let submittedAt = existing.submittedAt;
    let reviewedAt = existing.reviewedAt;
    let reviewedById = existing.reviewedById;

    if (newStatus === "PUBLISHED" && (!existing.publishedAt || existing.status !== "PUBLISHED")) {
      publishedAt = new Date();
      reviewedAt = new Date();
      reviewedById = user.id;
    } else if (newStatus === "SCHEDULED" && scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      reviewedAt = new Date();
      reviewedById = user.id;
    } else if (newStatus === "APPROVED") {
      reviewedAt = new Date();
      reviewedById = user.id;
    } else if (newStatus === "IN_REVIEW") {
      submittedAt = new Date();
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: finalSlug,
        subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content !== undefined ? content : existing.content,
        featuredImage: featuredImage !== undefined ? featuredImage : existing.featuredImage,
        gallery: gallery !== undefined ? (typeof gallery === "string" ? gallery : JSON.stringify(gallery)) : existing.gallery,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        authorId: authorId !== undefined ? authorId : existing.authorId,
        status: newStatus,
        reviewFeedback: reviewFeedback !== undefined ? reviewFeedback : existing.reviewFeedback,
        submittedAt,
        reviewedAt,
        reviewedById,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
        isBreaking: user.role === "REPORTER" ? existing.isBreaking : isBreaking !== undefined ? Boolean(isBreaking) : existing.isBreaking,
        isTrending: isTrending !== undefined ? Boolean(isTrending) : existing.isTrending,
        isVideo: isVideo !== undefined ? Boolean(isVideo) : existing.isVideo,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        isOpinion: isOpinion !== undefined ? Boolean(isOpinion) : existing.isOpinion,
        readingTime,
        seoTitle: seoTitle !== undefined ? seoTitle : existing.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : existing.seoDescription,
        ogImage: ogImage !== undefined ? ogImage : existing.ogImage,
        scheduledAt: scheduledDate,
        publishedAt,
      },
      include: {
        category: true,
        author: true,
      },
    });

    // Determine audit action
    let auditAction = "ARTICLE_UPDATED";
    if (existing.status !== newStatus) {
      if (existing.status === "DRAFT" && newStatus === "IN_REVIEW") {
        auditAction = "ARTICLE_SUBMITTED";
      } else if (existing.status === "IN_REVIEW" && newStatus === "DRAFT") {
        auditAction = "CHANGES_REQUESTED";
      } else if (existing.status === "IN_REVIEW" && newStatus === "APPROVED") {
        auditAction = "ARTICLE_APPROVED";
      } else if (newStatus === "SCHEDULED") {
        auditAction = "ARTICLE_SCHEDULED";
      } else if (newStatus === "PUBLISHED") {
        auditAction = "ARTICLE_PUBLISHED";
      } else if (newStatus === "ARCHIVED") {
        auditAction = "ARTICLE_ARCHIVED";
      }
    }

    // 1. Record Audit Log
    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: auditAction,
      entityType: "ARTICLE",
      entityId: updated.id,
      entityTitle: updated.title,
      previousStatus: existing.status,
      newStatus: updated.status,
      details: reviewFeedback ? { feedback: reviewFeedback } : undefined,
    });

    // 2. Dispatch in-CMS notifications
    if (existing.status !== newStatus) {
      const recipientId = existing.createdById || null;
      if (auditAction === "CHANGES_REQUESTED" && reviewFeedback) {
        await createEditorialNotification({
          userId: recipientId,
          targetRole: recipientId ? null : "REPORTER",
          message: `Editor requested changes on "${updated.title}": "${reviewFeedback}"`,
          type: "CHANGES_REQUESTED",
          articleId: updated.id,
          link: `/admin/articles/${updated.id}/edit`,
        });
      } else if (auditAction === "ARTICLE_APPROVED") {
        await createEditorialNotification({
          userId: recipientId,
          targetRole: recipientId ? null : "REPORTER",
          message: `Your article "${updated.title}" has been APPROVED by editorial desk.`,
          type: "APPROVED",
          articleId: updated.id,
          link: `/admin/news-desk`,
        });
      } else if (auditAction === "ARTICLE_PUBLISHED") {
        await createEditorialNotification({
          userId: recipientId,
          message: `Your article "${updated.title}" is now PUBLISHED live.`,
          type: "PUBLISHED",
          articleId: updated.id,
          link: `/${updated.category.slug}/${updated.slug}`,
        });
      } else if (auditAction === "ARTICLE_SUBMITTED") {
        await createEditorialNotification({
          targetRole: "EDITOR",
          message: `Article submitted for review: "${updated.title}" by ${user.name}`,
          type: "SUBMITTED",
          articleId: updated.id,
          link: `/admin/news-desk`,
        });
      }
    }

    if (updated.status === "PUBLISHED") {
      broadcastRealtimeEvent("ARTICLE_PUBLISHED", {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        category: updated.category.slug,
      });
      broadcastRealtimeEvent("HOMEPAGE_SYNC", {
        action: "ARTICLE_UPDATED",
        id: updated.id,
      });
    }

    try {
      revalidatePath("/");
      revalidatePath(`/${existing.category.slug}`);
      revalidatePath(`/${updated.category.slug}`);
      revalidatePath(`/${updated.category.slug}/${updated.slug}`);
      revalidatePath("/search");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const isOwner = article.createdById === user.id;
    const canDelete =
      user.role === "SUPER_ADMIN" ||
      user.role === "EDITOR" ||
      (user.role === "REPORTER" && isOwner && article.status === "DRAFT");

    if (!canDelete) {
      return NextResponse.json(
        { error: "You do not have permission to delete this article." },
        { status: 403 }
      );
    }

    // Delete related records in transaction to prevent foreign key errors
    await prisma.$transaction([
      prisma.homepageSectionArticle.deleteMany({ where: { articleId: params.id } }),
      prisma.articleTag.deleteMany({ where: { articleId: params.id } }),
      prisma.articleView.deleteMany({ where: { articleId: params.id } }),
      prisma.comment.deleteMany({ where: { articleId: params.id } }),
      prisma.bookmark.deleteMany({ where: { articleId: params.id } }),
      prisma.editorialNotification.deleteMany({ where: { articleId: params.id } }),
      prisma.article.delete({ where: { id: params.id } }),
    ]);

    // Record audit log
    try {
      await logAuditEvent({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "ARTICLE_DELETED",
        entityType: "ARTICLE",
        entityId: params.id,
        entityTitle: article.title,
        previousStatus: article.status,
        newStatus: "DELETED",
      });
    } catch (auditErr) {
      console.warn("Audit log error on delete:", auditErr);
    }

    try {
      revalidatePath("/");
      revalidatePath(`/${article.category.slug}`);
      revalidatePath("/search");
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Delete article error:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
