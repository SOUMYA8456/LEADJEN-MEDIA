"use client";

import React from "react";
import Link from "next/link";
import { NewsCard, CompactNewsCard, HorizontalNewsCard, VideoNewsCard, ArticleData } from "@/components/news/NewsCard";
import { HeroSection } from "@/components/news/HeroSection";
import { BreakingTicker } from "@/components/news/BreakingTicker";
import { LatestNewsFeed } from "@/components/news/LatestNewsFeed";
import { MostRead } from "@/components/news/MostRead";
import { VideoNewsSection } from "@/components/news/VideoNewsSection";
import { PhotoGallerySection } from "@/components/news/PhotoGallerySection";
import { NewsletterBox } from "@/components/news/NewsletterBox";
import { LeaderboardAd, SidebarAd, InArticleAd } from "@/components/ads/AdBanner";
import { VideoBriefSection } from "@/components/news/VideoBriefSection";
import { EditorialDispatchSection } from "@/components/news/EditorialDispatchSection";
import { ArrowRight, Flame, Sparkles } from "lucide-react";

export interface SectionRenderProps {
  section: {
    id: string;
    name: string;
    type: string;
    title?: string | null;
    subtitle?: string | null;
    layout?: string;
    contentSource?: string;
    background?: string;
    spacing?: string;
    borders?: string;
    showImages?: boolean;
    showExcerpt?: boolean;
    showAuthor?: boolean;
    showDate?: boolean;
    showReadingTime?: boolean;
    showCategory?: boolean;
    showViewAll?: boolean;
    viewAllUrl?: string | null;
    customSettings?: string | null;
    desktopCols?: number;
    tabletCols?: number;
    mobileCols?: number;
    category?: { id: string; name: string; slug: string; color?: string | null } | null;
  };
  articles?: ArticleData[];
  breakingItems?: any[];
  trendingTopics?: string[];
  videoItems?: any[];
  photoGallery?: any;
  ads?: any[];
  sidebarAd?: any;
  liveUpdates?: any[];
}

export function DynamicSectionRenderer({
  section,
  articles = [],
  breakingItems = [],
  trendingTopics = [],
  videoItems = [],
  photoGallery = null,
  sidebarAd = null,
  liveUpdates = [],
}: SectionRenderProps) {
  const {
    type,
    title,
    subtitle,
    layout = "featured-split",
    background = "white",
    spacing = "normal",
    borders = "bottom",
    showImages = true,
    showExcerpt = true,
    showAuthor = true,
    showDate = true,
    showViewAll = true,
    viewAllUrl,
    desktopCols = 3,
    category,
    customSettings,
  } = section;

  let parsedSettings: any = {};
  try {
    if (customSettings) {
      parsedSettings = typeof customSettings === "string" ? JSON.parse(customSettings) : customSettings;
    }
  } catch {}

  // Section Spacing Classes
  const spacingClass =
    spacing === "compact"
      ? "py-4 sm:py-6"
      : spacing === "spacious"
      ? "py-12 sm:py-16"
      : "py-8 sm:py-10";

  // Section Background Classes
  const bgClass =
    background === "warm-white"
      ? "bg-[#FAF8F5] dark:bg-[#12161E]"
      : background === "light-gray"
      ? "bg-gray-50 dark:bg-editorial-darkCard"
      : background === "dark"
      ? "bg-gray-950 text-white"
      : background === "deep-navy"
      ? "bg-[#06101E] text-white"
      : background === "transparent"
      ? "bg-transparent"
      : "bg-white dark:bg-editorial-darkBg";

  // Section Border Classes
  const borderClass =
    borders === "top"
      ? "border-t border-gray-200 dark:border-gray-800"
      : borders === "bottom"
      ? "border-b border-gray-200 dark:border-gray-800"
      : borders === "both"
      ? "border-y border-gray-200 dark:border-gray-800"
      : "";

  const sectionHeading = title || (category ? category.name.toUpperCase() : "");
  const targetViewAll = viewAllUrl || (category ? `/${category.slug}` : "");

  // 1. ADVERTISEMENT
  if (type === "ADVERTISEMENT") {
    const placement = parsedSettings.placement || "TOP_LEADERBOARD";
    if (placement === "TOP_LEADERBOARD") {
      return (
        <div className={`w-full ${bgClass} ${borderClass}`}>
          <LeaderboardAd />
        </div>
      );
    }
    if (placement === "SIDEBAR_AD") {
      return (
        <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${spacingClass}`}>
          <SidebarAd ad={sidebarAd} />
        </div>
      );
    }
    return null;
  }

  // 2. SPECIAL LEADJEN VIDEO BRIEF
  if (type === "VIDEO_BRIEF") {
    return (
      <div className={`w-full ${borderClass}`}>
        <VideoBriefSection
          title={sectionHeading || "SPECIAL LEADJEN VIDEO BRIEF"}
          video={videoItems[0]}
        />
      </div>
    );
  }

  // 3. BREAKING TICKER
  if (type === "BREAKING_TICKER") {
    return (
      <div className={`w-full ${borderClass}`}>
        <BreakingTicker items={breakingItems} trendingTopics={trendingTopics} />
      </div>
    );
  }

  // 3. HERO SECTION
  if (type === "HERO") {
    const heroArticle = articles[0];
    const leftArticles = articles.slice(1, (parsedSettings.leftArticlesCount || 3) + 1);
    const rightVideo = parsedSettings.showRightVideo !== false ? videoItems[0] : null;

    if (!heroArticle) return null;

    // Layout: Hero 3-Col
    if (layout === "hero-3col" || !layout) {
      return (
        <div className={`w-full ${bgClass} ${borderClass}`}>
          <HeroSection
            heroArticle={heroArticle}
            leftArticles={leftArticles}
            rightVideo={rightVideo}
            sidebarAd={parsedSettings.showSidebarAd !== false ? sidebarAd : null}
            leftTitle={parsedSettings.leftTitle || "Live Developing"}
            leftBadge={parsedSettings.leftBadge || "Live Updates"}
            allLiveLabel={parsedSettings.allLiveLabel || "All Live →"}
            allLiveUrl={parsedSettings.allLiveUrl || "/live"}
            showAllLiveLink={parsedSettings.showAllLiveLink !== false}
            rightTitle={parsedSettings.rightTitle || "Video Briefing"}
            rightWatchUrl={parsedSettings.rightWatchUrl || "/videos"}
          />
        </div>
      );
    }

    // Layout: Full Width Feature Hero
    if (layout === "hero-fullwidth") {
      return (
        <div className={`w-full ${bgClass} ${borderClass} ${spacingClass}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${heroArticle.category?.slug || "news"}/${heroArticle.slug}`}
              className="group block relative rounded-2xl overflow-hidden bg-gray-900 shadow-xl"
            >
              <div className="aspect-[21/9] sm:aspect-[21/8] w-full relative">
                <img
                  src={heroArticle.featuredImage}
                  alt={heroArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-4xl space-y-3">
                  <span className="inline-block px-3 py-1 bg-[#1E1B1A] dark:bg-white text-white dark:text-black text-xs font-mono font-bold uppercase rounded tracking-wider">
                    {heroArticle.category?.name || "News"} • LEAD STORY
                  </span>
                  <h1 className="font-serif font-black text-2xl sm:text-4xl md:text-5xl text-white group-hover:text-neutral-300 transition-colors leading-[1.15]">
                    {heroArticle.title}
                  </h1>
                  {heroArticle.subtitle && (
                    <p className="text-gray-200 text-sm sm:text-lg line-clamp-2 font-serif hidden sm:block">
                      {heroArticle.subtitle}
                    </p>
                  )}
                  <div className="text-xs font-mono text-gray-300 pt-1">
                    By {heroArticle.author?.name || "Editorial Desk"} • {heroArticle.readingTime || 4} min read
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      );
    }

    // Default Hero Fallback
    return (
      <div className={`w-full ${bgClass} ${borderClass}`}>
        <HeroSection
          heroArticle={heroArticle}
          leftArticles={leftArticles}
          rightVideo={rightVideo}
          sidebarAd={sidebarAd}
        />
      </div>
    );
  }

  // 4. LATEST NEWS + MOST READ SPLIT
  if (type === "LATEST_NEWS") {
    const mostReadList = [...articles].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);

    return (
      <section className={`w-full ${bgClass} ${borderClass} ${spacingClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <LatestNewsFeed articles={articles.slice(0, 6)} />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <MostRead articles={mostReadList} title="MOST READ STORIES" />
              {parsedSettings.showSidebarAd !== false && <SidebarAd ad={sidebarAd} />}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 5. VIDEO SECTION
  if (type === "VIDEO") {
    return (
      <div className={`w-full ${bgClass} ${borderClass}`}>
        <VideoNewsSection videos={videoItems} />
      </div>
    );
  }

  // 6. PHOTO GALLERY
  if (type === "PHOTO_GALLERY") {
    return (
      <div className={`w-full ${bgClass} ${borderClass}`}>
        <PhotoGallerySection
          title={sectionHeading || "LEADJEN PHOTO JOURNALISM"}
          gallery={photoGallery}
        />
      </div>
    );
  }

  // 7. LEADJEN EDITORIAL DISPATCH / NEWSLETTER (FINAL SECTION BEFORE FOOTER)
  if (type === "NEWSLETTER" || type === "EDITORIAL_DISPATCH") {
    return (
      <div className={`w-full ${bgClass} ${borderClass} ${spacingClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterBox
            badge={parsedSettings.badge || "LEADJEN EDITORIAL DISPATCH"}
            title={title || parsedSettings.title || "GET THE NEWS THAT MATTERS"}
            description={
              subtitle ||
              parsedSettings.description ||
              "Daily headlines, critical investigative stories, global markets, and policy insights delivered directly to your inbox every morning."
            }
            placeholder={parsedSettings.placeholder || "Enter your email address..."}
            buttonText={parsedSettings.buttonText || "SUBSCRIBE"}
            supportingText={
              parsedSettings.supportingText ||
              "Zero spam. Unsubscribe anytime. Verified editorial dispatch."
            }
          />
        </div>
      </div>
    );
  }

  // 8. MOST READ STANDALONE
  if (type === "MOST_READ") {
    const mostReadList = [...articles].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 8);
    return (
      <section className={`w-full ${bgClass} ${borderClass} ${spacingClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pb-3 mb-6 border-b-2 border-gray-950 dark:border-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-black dark:text-white" />
              <h2 className="font-serif font-black text-xl text-gray-950 dark:text-white uppercase tracking-tight">
                {sectionHeading || "MOST READ STORIES"}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mostReadList.slice(0, 4).map((art, idx) => (
              <div key={art.id} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-editorial-darkCard rounded-xl">
                <span className="font-serif font-black text-3xl text-black dark:text-white">0{idx + 1}</span>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-gray-500 block mb-1">
                    {art.category?.name || "News"}
                  </span>
                  <Link
                    href={`/${art.category?.slug || "news"}/${art.slug}`}
                    className="font-serif font-bold text-sm text-gray-950 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 line-clamp-2"
                  >
                    {art.title}
                  </Link>
                  <span className="text-[11px] text-gray-400 font-mono block mt-1">
                    {art.viewCount || 0} verified readers
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 9. GENERAL CATEGORY & NEWS GRIDS
  if (articles.length === 0) return null;

  return (
    <section className={`w-full ${bgClass} ${borderClass} ${spacingClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {sectionHeading && (
          <div className="pb-3 mb-6 border-b-2 border-gray-950 dark:border-white flex items-center justify-between">
            <div>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-gray-950 dark:text-white uppercase tracking-tight">
                {sectionHeading}
              </h2>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-sans mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            {showViewAll && targetViewAll && (
              <Link
                href={targetViewAll}
                className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* Layout: FEATURED-SPLIT (1 Large Feature on Left + 3 Cards on Right) */}
        {layout === "featured-split" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              {articles[0] && (
                <NewsCard
                  article={articles[0]}
                  showExcerpt={showExcerpt}
                />
              )}
            </div>
            <div className="lg:col-span-5 space-y-4">
              {articles.slice(1, 4).map((art) => (
                <CompactNewsCard key={art.id} article={art} />
              ))}
            </div>
          </div>
        )}

        {/* Layout: THREE-COLUMN */}
        {layout === "three-col" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 3).map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                showExcerpt={showExcerpt}
              />
            ))}
          </div>
        )}

        {/* Layout: FOUR-COLUMN */}
        {layout === "four-col" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.slice(0, 4).map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                showExcerpt={showExcerpt}
              />
            ))}
          </div>
        )}

        {/* Layout: HORIZONTAL-LIST */}
        {layout === "horizontal-list" && (
          <div className="space-y-4">
            {articles.slice(0, 4).map((art) => (
              <HorizontalNewsCard key={art.id} article={art} />
            ))}
          </div>
        )}

        {/* Layout: COMPACT-LIST */}
        {layout === "compact-list" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.slice(0, 6).map((art) => (
              <CompactNewsCard key={art.id} article={art} />
            ))}
          </div>
        )}

        {/* Default Grid fallback based on desktopCols */}
        {!["featured-split", "three-col", "four-col", "horizontal-list", "compact-list"].includes(layout) && (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              desktopCols === 4 ? "lg:grid-cols-4" : desktopCols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"
            } gap-6`}
          >
            {articles.map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                showExcerpt={showExcerpt}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
