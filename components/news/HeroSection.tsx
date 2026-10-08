import React from "react";
import Link from "next/link";
import { Play, ArrowRight, Radio } from "lucide-react";
import { ArticleData } from "./NewsCard";
import { SidebarAd } from "@/components/ads/AdBanner";
import { formatTimeAgo, formatArticleDate } from "@/lib/utils";

interface HeroSectionProps {
  heroArticle?: ArticleData | null;
  leftArticles?: ArticleData[];
  rightVideo?: any;
  sidebarAd?: any;
  leftTitle?: string;
  leftBadge?: string;
  allLiveLabel?: string;
  allLiveUrl?: string;
  showAllLiveLink?: boolean;
  rightTitle?: string;
  rightWatchUrl?: string;
}

export function HeroSection({
  heroArticle,
  leftArticles = [],
  rightVideo,
  sidebarAd,
  leftTitle = "Live Developing",
  leftBadge = "Live Updates",
  allLiveLabel = "All Live →",
  allLiveUrl = "/live",
  showAllLiveLink = true,
  rightTitle = "Video Briefing",
  rightWatchUrl = "/videos",
}: HeroSectionProps) {
  if (!heroArticle) return null;

  const categorySlug = heroArticle.category?.slug || "news";
  const heroHref = `/${categorySlug}/${heroArticle.slug}`;

  return (
    <section className="w-full bg-white dark:bg-editorial-darkCard border-b border-gray-200 dark:border-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Developing / Live Updates & Secondary Cards */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 flex flex-col space-y-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 lg:pr-6 pb-6 lg:pb-0">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                {leftTitle}
              </span>
              {showAllLiveLink && (
                <Link
                  href={allLiveUrl}
                  className="text-[11px] font-bold text-black dark:text-white hover:underline"
                >
                  {allLiveLabel}
                </Link>
              )}
            </div>

            {leftArticles.slice(0, 1).map((art) => (
              <div key={art.id} className="group">
                <Link
                  href={`/${art.category?.slug || "news"}/${art.slug}`}
                  className="relative block aspect-[16/10] overflow-hidden rounded bg-gray-100 dark:bg-gray-800 mb-2"
                >
                  <img
                    src={art.featuredImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-none">
                    {leftBadge}
                  </div>
                </Link>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {art.category?.name || "News"}
                </span>
                <h4 className="font-serif font-bold text-sm sm:text-base text-gray-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition leading-snug mt-0.5">
                  <Link href={`/${art.category?.slug || "news"}/${art.slug}`}>
                    {art.title}
                  </Link>
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {art.excerpt}
                </p>
              </div>
            ))}

            {/* Compact secondary list in left column */}
            <div className="pt-2 divide-y divide-gray-100 dark:divide-gray-800/80">
              {leftArticles.slice(1, 3).map((art) => (
                <div key={art.id} className="py-2.5 group">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    {art.category?.name || "News"}
                  </span>
                  <h5 className="font-serif font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition line-clamp-2">
                    <Link href={`/${art.category?.slug || "news"}/${art.slug}`}>
                      {art.title}
                    </Link>
                  </h5>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTER COLUMN: The Primary Lead Story of the Day          */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & Tag */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded">
                  {heroArticle.category?.name || "Special Report"}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {formatArticleDate(heroArticle.publishedAt)}
                </span>
              </div>

              {/* Lead Headline */}
              <h1 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl lg:text-4xl text-gray-950 dark:text-white tracking-tight leading-[1.15] hover:text-neutral-600 dark:hover:text-neutral-300 transition">
                <Link href={heroHref}>{heroArticle.title}</Link>
              </h1>

              {/* Hero Featured Visual */}
              <Link
                href={heroHref}
                className="relative block aspect-[16/9] w-full overflow-hidden rounded-lg my-4 bg-gray-100 dark:bg-gray-800 shadow-none group"
              >
                <img
                  src={heroArticle.featuredImage}
                  alt={heroArticle.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
                {heroArticle.isBreaking && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded shadow-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    BREAKING NEWS
                  </div>
                )}
              </Link>

              {/* Editorial Summary / Excerpt */}
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed font-sans font-normal">
                {heroArticle.excerpt}
              </p>
            </div>

            {/* Author & Action Bar */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={heroArticle.author?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"}
                    alt={heroArticle.author?.name || "Author"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    By {heroArticle.author?.name || "Leadjen Editorial Desk"}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {formatTimeAgo(heroArticle.publishedAt)} • {heroArticle.readingTime || 4} min read
                  </span>
                </div>
              </div>

              <Link
                href={heroHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1B1A] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition shadow-none group"
              >
                <span>Read Story</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Video News Widget & Sidebar Ad Space        */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 flex flex-col space-y-5 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 lg:pl-6 pt-6 lg:pt-0">
            {/* Video Spotlight Card */}
            {rightVideo && (
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-bold flex items-center gap-1">
                    <Play className="w-3.5 h-3.5 text-black dark:text-white" />
                    {rightTitle}
                  </span>
                  <Link
                    href={rightWatchUrl}
                    className="text-[11px] font-bold text-black dark:text-white hover:underline"
                  >
                    Watch →
                  </Link>
                </div>

                <div className="group relative rounded overflow-hidden bg-gray-900">
                  <div className="relative aspect-video">
                    <img
                      src={rightVideo.thumbnail || rightVideo.thumbnailUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80"}
                      alt={rightVideo.title || "Video Briefing"}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center group-hover:scale-110 transition shadow-none">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    {rightVideo.duration && (
                      <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                        {rightVideo.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 bg-gray-950">
                    <h5 className="font-serif font-bold text-xs text-white line-clamp-2 leading-tight group-hover:text-neutral-300 transition">
                      {rightVideo.title || "Editorial Video Dispatch"}
                    </h5>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Ad Placement */}
            {sidebarAd && (
              <div className="flex-1">
                <SidebarAd ad={sidebarAd} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
