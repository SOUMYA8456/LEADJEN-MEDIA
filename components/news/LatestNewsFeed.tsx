import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatArticleTime, formatTimeAgo } from "@/lib/utils";
import { ArticleData } from "./NewsCard";

export function LatestNewsFeed({ articles }: { articles: ArticleData[] }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-editorial-darkCard border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-5 shadow-none">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white animate-pulse"></span>
          <h2 className="font-serif font-black text-lg sm:text-xl text-gray-950 dark:text-white tracking-tight">
            LATEST NEWS
          </h2>
        </div>
        <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
          Real-time Updates
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
        {articles.map((article) => {
          const categorySlug = article.category?.slug || "news";
          const href = `/${categorySlug}/${article.slug}`;

          return (
            <div
              key={article.id}
              className="py-3 sm:py-3.5 flex items-start gap-3 sm:gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-800/40 rounded px-1 -mx-1 transition"
            >
              {/* Time Indicator */}
              <div className="flex flex-col items-center justify-center flex-shrink-0 w-16 sm:w-20 pt-0.5">
                <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                  {formatArticleTime(article.publishedAt) || "WIRE"}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {formatTimeAgo(article.publishedAt)}
                </span>
              </div>

              {/* Story Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {article.category?.name}
                  </span>
                  {article.isBreaking && (
                    <span className="bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded">
                      BREAKING
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-sm sm:text-base text-gray-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition leading-snug">
                  <Link href={href}>{article.title}</Link>
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mt-1 font-sans">
                  {article.excerpt}
                </p>
              </div>

              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition self-center hidden sm:block flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
