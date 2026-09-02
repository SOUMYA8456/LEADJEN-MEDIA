import React from "react";
import { notFound } from "next/navigation";
import prisma, { syncScheduledArticles } from "@/lib/db";
import { NewsCard, HorizontalNewsCard } from "@/components/news/NewsCard";
import { MostRead } from "@/components/news/MostRead";
import { SidebarAd } from "@/components/ads/AdBanner";
import { NewsletterBox } from "@/components/news/NewsletterBox";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjen-media-news.vercel.app";
  const slug = params.category;

  // 1. Check Category
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (category) {
    const categoryUrl = `${siteUrl}/${slug}`;
    return {
      title: `${category.name} News, Breaking Bulletins & Analysis | LEADJEN MEDIA`,
      description:
        category.description ||
        `Read latest ${category.name} news, updates, investigative reports, and in-depth editorial coverage from Leadjen Media.`,
      alternates: { canonical: categoryUrl },
      openGraph: {
        title: `${category.name} News — Leadjen Media`,
        description: category.description || `Latest ${category.name} stories and reports`,
        url: categoryUrl,
        type: "website",
      },
    };
  }

  // 2. Check Static Page
  const staticPage = await prisma.page.findUnique({
    where: { slug },
  });

  if (staticPage && staticPage.status === "PUBLISHED") {
    const pageUrl = `${siteUrl}/${slug}`;
    return {
      title: staticPage.seoTitle || `${staticPage.title} | LEADJEN MEDIA`,
      description: staticPage.seoDescription || `Read ${staticPage.title} on Leadjen Media.`,
      alternates: { canonical: pageUrl },
      openGraph: {
        title: staticPage.seoTitle || staticPage.title,
        description: staticPage.seoDescription || "",
        url: pageUrl,
        type: "article",
      },
    };
  }

  return { title: "Page Not Found | LEADJEN MEDIA" };
}

export default async function DynamicCategoryOrStaticPage({
  params,
}: {
  params: { category: string };
}) {
  await syncScheduledArticles();
  const now = new Date();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjen-media-news.vercel.app";
  const slug = params.category;

  // 1. Check if slug matches a Category
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (category) {
    // Fetch Site Builder Settings
    const settingsRecord = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    let siteConfig: SiteBuilderConfig = DEFAULT_SITE_BUILDER_CONFIG;
    if (settingsRecord?.siteConfigJson) {
      try {
        siteConfig = { ...DEFAULT_SITE_BUILDER_CONFIG, ...JSON.parse(settingsRecord.siteConfigJson) };
      } catch {}
    }

    const catDefaults = siteConfig.categories || DEFAULT_SITE_BUILDER_CONFIG.categories;
    const override = catDefaults.categoryOverrides?.[slug] || {};

    const showSidebar = override.showSidebar !== undefined ? override.showSidebar : catDefaults.showSidebar;
    const showAdBanner = override.showAdBanner !== undefined ? override.showAdBanner : catDefaults.showAdBanner;
    const showMostRead = override.showMostRead !== undefined ? override.showMostRead : catDefaults.showMostRead;

    // Fetch articles & ads
    const [articles, trendingArticles, sidebarAd] = await Promise.all([
      prisma.article.findMany({
        where: {
          categoryId: category.id,
          status: "PUBLISHED",
          publishedAt: { lte: now },
        },
        include: { category: true, author: true },
        orderBy: { publishedAt: "desc" },
        take: 25,
      }),
      prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { lte: now },
        },
        include: { category: true },
        orderBy: { viewCount: "desc" },
        take: 5,
      }),
      showAdBanner
        ? prisma.advertisement.findFirst({
            where: { location: "SIDEBAR_AD", isActive: true },
          })
        : null,
    ]);

    const leadStory = catDefaults.showFeaturedStory ? articles[0] : null;
    const remainingStories = catDefaults.showFeaturedStory ? articles.slice(1) : articles;

    const categoryUrl = `${siteUrl}/${slug}`;
    const categoryJsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${category.name} News`,
      description: category.description || `Latest ${category.name} coverage`,
      url: categoryUrl,
      publisher: {
        "@type": "NewsMediaOrganization",
        name: "LEADJEN MEDIA",
        url: siteUrl,
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
        />
        <div className="w-full bg-white dark:bg-neutral-950 py-8 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Category Header */}
            <div className="pb-4 border-b-2 border-black dark:border-white">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1">
                <Link href="/" className="hover:underline">
                  HOME
                </Link>{" "}
                / {category.name}
              </div>
              <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-black dark:text-white tracking-tight uppercase">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl font-sans">
                  {category.description}
                </p>
              )}
            </div>

            {articles.length === 0 ? (
              <div className="py-16 text-center text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-8">
                <p className="font-serif text-lg text-neutral-700 dark:text-neutral-300">
                  No articles currently published under {category.name}.
                </p>
                <p className="text-xs mt-1 font-mono">
                  Publish articles under this category in the Admin CMS to display them here automatically.
                </p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${showSidebar ? "lg:grid-cols-12" : "max-w-5xl mx-auto"} gap-8 items-start`}>
                {/* Left Stream */}
                <div className={`${showSidebar ? "lg:col-span-8" : "w-full"} space-y-8`}>
                  {leadStory && (
                    <div className="pb-8 border-b border-neutral-200 dark:border-neutral-800">
                      <NewsCard article={leadStory} showExcerpt={true} aspectRatio="aspect-[16/9]" />
                    </div>
                  )}

                  <div className="space-y-4">
                    {remainingStories.map((story) => (
                      <HorizontalNewsCard key={story.id} article={story} />
                    ))}
                  </div>
                </div>

                {/* Right Sidebar */}
                {showSidebar && (
                  <div className="lg:col-span-4 space-y-6">
                    {showMostRead && <MostRead articles={trendingArticles} title={`TRENDING IN ${category.name}`} />}
                    {sidebarAd && <SidebarAd ad={sidebarAd} />}
                    {catDefaults.showNewsletter && <NewsletterBox />}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // 2. Check if slug matches a Static Page
  const staticPage = await prisma.page.findUnique({
    where: { slug },
  });

  if (staticPage && staticPage.status === "PUBLISHED") {
    return (
      <div className="w-full bg-white dark:bg-neutral-950 py-12 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb */}
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <Link href="/" className="hover:underline">
              HOME
            </Link>{" "}
            / {staticPage.title}
          </div>

          {/* Title Header */}
          <div className="space-y-3">
            <span className="px-2.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold uppercase rounded">
              EDITORIAL WIRE
            </span>
            <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-black dark:text-white tracking-tight">
              {staticPage.title}
            </h1>
            <p className="text-xs font-mono text-neutral-400">
              Last Updated: {new Date(staticPage.updatedAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long" })}
            </p>
          </div>

          {/* Featured Image if present */}
          {staticPage.featuredImage && (
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md">
              <img
                src={staticPage.featuredImage}
                alt={staticPage.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rich Content Body */}
          <div
            className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 font-serif leading-relaxed text-base sm:text-lg border-t border-neutral-100 dark:border-neutral-800 pt-6"
            dangerouslySetInnerHTML={{ __html: staticPage.content }}
          />

          <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-500">
            <span>LEADJEN MEDIA NEWSROOM</span>
            <Link href="/" className="underline hover:text-black dark:hover:text-white">
              ← Return to Front Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If neither category nor page exists, 404
  notFound();
}
