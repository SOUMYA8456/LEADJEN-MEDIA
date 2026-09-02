import { NextRequest, NextResponse } from "next/server";
import prisma, { syncScheduledArticles } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { calculateReadingTime, slugify } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit";
import { createEditorialNotification } from "@/lib/notifications";
import { broadcastRealtimeEvent } from "@/lib/realtime";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Promote any scheduled articles whose time has passed
    await syncScheduledArticles();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const author = searchParams.get("author");
    const isFeatured = searchParams.get("featured");
    const isBreaking = searchParams.get("breaking");
    const isTrending = searchParams.get("trending");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: any = {};

    // Status filtering
    if (status && status !== "ALL") {
      where.status = status;
    } else if (!status) {
      // Public view default: only PUBLISHED articles
      where.status = "PUBLISHED";
      where.publishedAt = { lte: new Date() };
    }

    if (category && category !== "all") {
      where.category = { slug: category };
    }

    if (author && author !== "all") {
      where.author = { slug: author };
    }

    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    if (isBreaking === "true") {
      where.isBreaking = true;
    }

    if (isTrending === "true") {
      where.isTrending = true;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: true,
          author: true,
        },
        orderBy: [
          { updatedAt: "desc" },
          { publishedAt: "desc" },
        ],
        take: limit,
        skip: skip,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Articles GET error:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug: customSlug,
      subtitle,
      excerpt,
      content,
      featuredImage,
      gallery,
      categoryId,
      authorId,
      status = "DRAFT",
      isFeatured = false,
      isBreaking = false,
      isTrending = false,
      isVideo = false,
      videoUrl,
      isOpinion = false,
      seoTitle,
      seoDescription,
      ogImage,
      scheduledAt,
    } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    // Role-based status guard: REPORTER can only create DRAFT or submit IN_REVIEW
    let finalStatus = status;
    if (user.role === "REPORTER") {
      if (status === "PUBLISHED" || status === "APPROVED" || status === "SCHEDULED") {
        return NextResponse.json(
          { error: "Reporters cannot directly approve, schedule, or publish articles. Submit for review instead." },
          { status: 403 }
        );
      }
      if (status !== "IN_REVIEW") {
        finalStatus = "DRAFT";
      }
    }

    // Generate unique slug
    let baseSlug = customSlug ? slugify(customSlug) : slugify(title);
    let finalSlug = baseSlug;
    let count = 1;
    while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    // Resolve author: if none provided, match user name or pick first author
    let targetAuthorId = authorId;
    if (!targetAuthorId) {
      const matchedAuthor = await prisma.author.findFirst({
        where: { name: { contains: user.name, mode: "insensitive" } },
      });
      if (matchedAuthor) {
        targetAuthorId = matchedAuthor.id;
      } else {
        const defaultAuthor = await prisma.author.findFirst();
        targetAuthorId = defaultAuthor?.id;
      }
    }

    const readingTime = calculateReadingTime(content);

    let publishedAt: Date | null = null;
    let scheduledDate: Date | null = null;
    let submittedAt: Date | null = null;

    if (finalStatus === "PUBLISHED") {
      publishedAt = new Date();
    } else if (finalStatus === "SCHEDULED" && scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        publishedAt = new Date();
        finalStatus = "PUBLISHED";
      }
    } else if (finalStatus === "IN_REVIEW") {
      submittedAt = new Date();
    }

    const newArticle = await prisma.article.create({
      data: {
        title,
        slug: finalSlug,
        subtitle: subtitle || null,
        excerpt: excerpt || title,
        content,
        featuredImage: featuredImage || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
        gallery: gallery ? (typeof gallery === "string" ? gallery : JSON.stringify(gallery)) : null,
        categoryId,
        authorId: targetAuthorId,
        createdById: user.id,
        status: finalStatus,
        submittedAt,
        isFeatured: Boolean(isFeatured),
        isBreaking: user.role === "REPORTER" ? false : Boolean(isBreaking),
        isTrending: Boolean(isTrending),
        isVideo: Boolean(isVideo),
        videoUrl: videoUrl || null,
        isOpinion: Boolean(isOpinion),
        readingTime,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        ogImage: ogImage || featuredImage,
        scheduledAt: scheduledDate,
        publishedAt,
      },
      include: {
        category: true,
        author: true,
      },
    });

    // 1. Log audit event
    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: finalStatus === "IN_REVIEW" ? "ARTICLE_SUBMITTED" : "ARTICLE_CREATED",
      entityType: "ARTICLE",
      entityId: newArticle.id,
      entityTitle: newArticle.title,
      previousStatus: null,
      newStatus: finalStatus,
    });

    // 2. Dispatch notifications if submitted for review
    if (finalStatus === "IN_REVIEW") {
      await createEditorialNotification({
        userId: user.id,
        message: `Your article "${newArticle.title}" was submitted for editorial review.`,
        type: "SUBMITTED",
        articleId: newArticle.id,
        link: `/admin/news-desk`,
      });
      await createEditorialNotification({
        targetRole: "EDITOR",
        message: `New article submitted for review: "${newArticle.title}" by ${user.name}`,
        type: "SUBMITTED",
        articleId: newArticle.id,
        link: `/admin/news-desk`,
      });
    }

    if (finalStatus === "PUBLISHED") {
      broadcastRealtimeEvent("ARTICLE_PUBLISHED", {
        id: newArticle.id,
        title: newArticle.title,
        slug: newArticle.slug,
        category: newArticle.category.slug,
      });
      broadcastRealtimeEvent("HOMEPAGE_SYNC", {
        action: "ARTICLE_ADDED",
        id: newArticle.id,
      });
    }

    // Invalidate caches
    try {
      revalidatePath("/");
      revalidatePath(`/${newArticle.category.slug}`);
      revalidatePath(`/${newArticle.category.slug}/${newArticle.slug}`);
      revalidatePath("/search");
    } catch (e) {
      console.warn("Revalidate path error:", e);
    }

    return NextResponse.json({ success: true, article: newArticle });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
