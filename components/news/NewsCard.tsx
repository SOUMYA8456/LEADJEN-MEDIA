import React from "react";
import Link from "next/link";
import { Clock, Play } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt: string;
  featuredImage: string;
  category?: {
    name: string;
    slug: string;
    color?: string | null;
  } | null;
  author?: {
    name: string;
    slug: string;
    avatar?: string | null;
    designation?: string | null;
  } | null;
  publishedAt?: Date | string | null;
  readingTime?: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isVideo?: boolean;
  viewCount?: number;
}

export function NewsCard({
  article,
  priority = false,
  showExcerpt = true,
  aspectRatio = "aspect-[16/10]",
}: {
  article: ArticleData;
  priority?: boolean;
  showExcerpt?: boolean;
  aspectRatio?: string;
}) {
  const categorySlug = article.category?.slug || "news";
  const href = `/${categorySlug}/${article.slug}`;

  return (
    <article className="group flex flex-col bg-transparent transition-all">
      <Link href={href} className={`relative block w-full ${aspectRatio} overflow-hidden rounded bg-gray-100 dark:bg-gray-800`}>
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading={priority ? "eager" : "lazy"}
        />
        {article.isBreaking && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            BREAKING
          </div>
        )}
        {article.isVideo && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
            <Play className="w-3 h-3 fill-current" />
            VIDEO
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 pt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-1.5">
          <Link
            href={`/${categorySlug}`}
            className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:underline"
          >
            {article.category?.name || "News"}
          </Link>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span className="text-gray-400 dark:text-gray-500 font-normal normal-case flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>

        <h3 className="font-serif font-bold text-base sm:text-lg leading-snug text-gray-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2">
          <Link href={href}>{article.title}</Link>
        </h3>

        {showExcerpt && article.excerpt && (
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed font-sans">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800/80">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            By {article.author?.name || "Leadjen Desk"}
          </span>
          <span className="text-black dark:text-white font-semibold group-hover:translate-x-0.5 transition-transform">
            Read →
          </span>
        </div>
      </div>
    </article>
  );
}

export function CompactNewsCard({ article }: { article: ArticleData }) {
  const categorySlug = article.category?.slug || "news";
  const href = `/${categorySlug}/${article.slug}`;

  return (
    <article className="group flex gap-3.5 py-3 border-b border-gray-100 dark:border-gray-800/80 last:border-0">
      <Link href={href} className="relative w-24 h-20 sm:w-28 sm:h-20 flex-shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {article.isBreaking && (
          <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black px-1 rounded">
            LIVE
          </span>
        )}
      </Link>

      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-0.5">
          <span>{article.category?.name || "News"}</span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span className="text-gray-400 font-normal normal-case">
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>
        <h4 className="font-serif font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition line-clamp-2 leading-tight">
          <Link href={href}>{article.title}</Link>
        </h4>
      </div>
    </article>
  );
}

export function HorizontalNewsCard({ article }: { article: ArticleData }) {
  const categorySlug = article.category?.slug || "news";
  const href = `/${categorySlug}/${article.slug}`;

  return (
    <article className="group flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-white dark:bg-editorial-darkCard border border-gray-200/80 dark:border-editorial-darkBorder hover:border-neutral-400 dark:hover:border-neutral-600 transition">
      <Link href={href} className="relative w-full sm:w-56 h-40 sm:h-auto flex-shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {article.isBreaking && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
            BREAKING
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
          <span className="text-neutral-600 dark:text-neutral-400">
            {article.category?.name}
          </span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span className="text-gray-400 text-[11px] normal-case">
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>

        <h3 className="font-serif font-bold text-lg sm:text-xl text-gray-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition leading-snug">
          <Link href={href}>{article.title}</Link>
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500">
          <span>By {article.author?.name || "Leadjen Desk"}</span>
          <span className="text-neutral-700 dark:text-neutral-300 font-semibold">
            {article.readingTime || 3} min read
          </span>
        </div>
      </div>
    </article>
  );
}

export function VideoNewsCard({
  video,
}: {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    category: string;
    videoUrl: string;
    publishedAt?: Date | string | null;
  };
}) {
  return (
    <div className="group relative rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-none group-hover:scale-110 group-hover:bg-white transition">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
          {video.duration}
        </span>
      </div>

      <div className="p-3 bg-gray-950">
        <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block mb-1">
          {video.category}
        </span>
        <h4 className="font-serif font-bold text-sm text-white line-clamp-2 group-hover:text-neutral-300 transition">
          {video.title}
        </h4>
      </div>
    </div>
  );
}
