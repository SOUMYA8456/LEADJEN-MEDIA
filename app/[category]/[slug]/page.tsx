import React from "react";
import { notFound } from "next/navigation";
import prisma, { syncScheduledArticles } from "@/lib/db";
import { ReadingProgressBar } from "@/components/news/ReadingProgressBar";
import { ArticleContent } from "@/components/news/ArticleContent";
import { ShareButtons } from "@/components/news/ShareButtons";
import { NewsCard } from "@/components/news/NewsCard";
import { MostRead } from "@/components/news/MostRead";
import { SidebarAd, LeaderboardAd } from "@/components/ads/AdBanner";
import { NewsletterBox } from "@/components/news/NewsletterBox";
import { SaveArticleButton } from "@/components/news/SaveArticleButton";
import { FollowCategoryButton } from "@/components/news/FollowCategoryButton";
import { ArticleCommentsSection } from "@/components/news/ArticleCommentsSection";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";
import Link from "next/link";
import { Clock, Calendar, User, Eye, ArrowLeft, Tag } from "lucide-react";
import { formatArticleDate, formatTimeAgo } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { category: true, author: true },
  });

  if (!article) {
    return { title: "Article Not Found | LEADJEN MEDIA" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjen-media-news.vercel.app";
  const articleUrl = `${siteUrl}/${params.category}/${params.slug}`;

  return {
    title: article.seoTitle || `${article.title} | LEADJEN MEDIA`,
    description: article.seoDescription || article.excerpt,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      url: articleUrl,
      siteName: "LEADJEN MEDIA",
      images: [
        {
          url: article.ogImage || article.featuredImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author?.name || "Leadjen Editorial Desk"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      images: [article.ogImage || article.featuredImage],
      creator: "@leadjenmedia",
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  await syncScheduledArticles();
  const now = new Date();

  // Query article by slug
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      author: true,
    },
  });

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch Site Builder Settings
  let siteConfig: SiteBuilderConfig = DEFAULT_SITE_BUILDER_CONFIG;
  try {
    const settingsRecord = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settingsRecord?.siteConfigJson) {
      siteConfig = { ...DEFAULT_SITE_BUILDER_CONFIG, ...JSON.parse(settingsRecord.siteConfigJson) };
    }
  } catch {}

  const articleConfig = siteConfig.article || DEFAULT_SITE_BUILDER_CONFIG.article;

  // Fetch related articles in same category, trending stories, and advertisements
  const [relatedArticles, trendingArticles, topAd, inArticleAd, sidebarAd, bottomAd] = await Promise.all([
    articleConfig.showRelatedStories
      ? prisma.article.findMany({
          where: {
            categoryId: article.categoryId,
            id: { not: article.id },
            status: "PUBLISHED",
            publishedAt: { lte: now },
          },
          include: { category: true, author: true },
          orderBy: { publishedAt: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
    articleConfig.showMostReadSidebar
      ? prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            publishedAt: { lte: now },
          },
          include: { category: true },
          orderBy: { viewCount: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
    articleConfig.topAdEnabled
      ? prisma.advertisement.findFirst({
          where: {
            location: "TOP_LEADERBOARD",
            isActive: true,
            status: "ACTIVE",
          },
        })
      : Promise.resolve(null),
    articleConfig.middleAdEnabled
      ? prisma.advertisement.findFirst({
          where: {
            location: "IN_ARTICLE_AD",
            isActive: true,
            status: "ACTIVE",
          },
          orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
        })
      : Promise.resolve(null),
    articleConfig.sidebarAdEnabled
      ? prisma.advertisement.findFirst({
          where: {
            location: "SIDEBAR_AD",
            isActive: true,
            status: "ACTIVE",
          },
          orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
        })
      : Promise.resolve(null),
    articleConfig.bottomAdEnabled
      ? prisma.advertisement.findFirst({
          where: {
            location: "HOMEPAGE_CONTENT",
            isActive: true,
            status: "ACTIVE",
          },
        })
      : Promise.resolve(null),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjen-media-news.vercel.app";
  const articleUrl = `${siteUrl}/${params.category}/${params.slug}`;
  const categoryUrl = `${siteUrl}/${params.category}`;
  const authorUrl = `${siteUrl}/author/${article.author?.slug}`;

  // JSON-LD NewsArticle Structured Data
  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: [article.ogImage || article.featuredImage],
    datePublished: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    articleSection: article.category.name,
    inLanguage: "en-US",
    author: [
      {
        "@type": "Person",
        name: article.author?.name || "Leadjen Editorial Correspondent",
        jobTitle: article.author?.designation || "Senior Editorial Correspondent",
        url: authorUrl,
      },
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "LEADJEN MEDIA",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  // JSON-LD Breadcrumbs
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: article.category.name,
        item: categoryUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Sticky Top Reading Progress Bar */}
      {articleConfig.showReadingProgressBar !== false && <ReadingProgressBar />}

      <article className="w-full bg-white dark:bg-neutral-950 py-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Leaderboard Ad if enabled */}
          {topAd && (
            <div className="mb-6 flex justify-center">
              <LeaderboardAd ad={topAd} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Article Column (8 cols) */}
            <div className={`${articleConfig.showMostReadSidebar || sidebarAd ? "lg:col-span-8" : "lg:col-span-10 max-w-4xl mx-auto"}`}>
              {/* Breadcrumb & Follow Category */}
              {articleConfig.showBreadcrumbs !== false && (
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                    <Link href="/" className="hover:text-black dark:hover:text-white">
                      HOME
                    </Link>
                    <span>/</span>
                    <Link
                      href={`/${article.category.slug}`}
                      className="text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 hover:underline"
                    >
                      {article.category.name}
                    </Link>
                  </div>
                  <FollowCategoryButton
                    categoryId={article.categoryId}
                    categoryName={article.category.name}
                  />
                </div>
              )}

              {/* Main Headline */}
              <h1 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black dark:text-white tracking-tight leading-[1.15]">
                {article.title}
              </h1>

              {/* Subtitle */}
              {article.subtitle && (
                <p className="mt-3 text-base sm:text-xl text-neutral-600 dark:text-neutral-300 font-serif leading-relaxed">
                  {article.subtitle}
                </p>
              )}

              {/* Author, Date, Reading Time Bar */}
              <div className="mt-5 py-4 border-y border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Link href={`/author/${article.author.slug}`} className="shrink-0">
                    <img
                      src={article.author.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80"}
                      alt={article.author.name}
                      className="w-10 h-10 rounded-full object-cover bg-neutral-100"
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/author/${article.author.slug}`}
                      className="font-serif font-bold text-sm text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 block"
                    >
                      {article.author.name}
                    </Link>
                    <span className="text-[11px] text-neutral-500 font-mono block">
                      {article.author.designation || "Editorial Correspondent"}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono space-y-0.5 sm:text-right">
                  <div>Published: {formatArticleDate(article.publishedAt)}</div>
                  <div className="text-[11px] text-neutral-400">
                    {article.readingTime || 4} min read • Updated {formatTimeAgo(article.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Social Share Buttons & Bookmark */}
              {articleConfig.showSocialShare !== false && (
                <div className="my-3 flex items-center justify-between">
                  <ShareButtons title={article.title} />
                  <SaveArticleButton articleId={article.id} />
                </div>
              )}

              {/* Featured Visual */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden my-6 bg-neutral-100 dark:bg-neutral-800 shadow-xs">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Content with Text Resizer & Inline Ad */}
              <ArticleContent content={article.content} ad={inArticleAd} />

              {/* Bottom Article Ad if enabled */}
              {bottomAd && (
                <div className="my-6">
                  <LeaderboardAd ad={bottomAd} />
                </div>
              )}

              {/* Author Bio Box */}
              {articleConfig.showAuthorBio !== false && (
                <div className="my-8 p-5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-start gap-4">
                  <img
                    src={article.author.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
                    alt={article.author.name}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-base text-black dark:text-white">
                      Written by {article.author.name}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans mt-1 leading-relaxed">
                      {article.author.bio || "Senior journalist for Leadjen Media covering critical national and international developments."}
                    </p>
                    <Link
                      href={`/author/${article.author.slug}`}
                      className="inline-block mt-2 text-xs font-bold text-black dark:text-white hover:underline"
                    >
                      View all stories by {article.author.name} →
                    </Link>
                  </div>
                </div>
              )}

              {/* Related Stories Grid */}
              {articleConfig.showRelatedStories !== false && relatedArticles.length > 0 && (
                <div className="my-10 pt-8 border-t-2 border-black dark:border-white">
                  <h3 className="font-serif font-black text-xl text-black dark:text-white uppercase tracking-tight mb-6">
                    RELATED STORIES IN {article.category.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {relatedArticles.map((rel) => (
                      <NewsCard key={rel.id} article={rel} showExcerpt={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* Reader Comments & Moderated Discussion */}
              {articleConfig.showComments !== false && (
                <ArticleCommentsSection
                  articleId={article.id}
                  articleTitle={article.title}
                />
              )}

              {/* Newsletter Subscription */}
              {articleConfig.showNewsletterBox !== false && <NewsletterBox />}
            </div>

            {/* Right Column: Most Read & Sidebar Ad (4 cols) */}
            {(articleConfig.showMostReadSidebar || (articleConfig.sidebarAdEnabled && sidebarAd)) && (
              <div className="lg:col-span-4 space-y-6">
                {articleConfig.showMostReadSidebar && (
                  <MostRead articles={trendingArticles} title="MOST POPULAR STORIES" />
                )}
                {articleConfig.sidebarAdEnabled && sidebarAd && <SidebarAd ad={sidebarAd} />}
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
