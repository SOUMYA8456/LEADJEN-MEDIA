import React from "react";
import Link from "next/link";
import { ArticleData } from "./NewsCard";
import { formatTimeAgo } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export function MostRead({
  articles,
  title = "MOST READ",
}: {
  articles: ArticleData[];
  title?: string;
}) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-editorial-darkCard border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-none">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b-2 border-gray-950 dark:border-white">
        <TrendingUp className="w-4 h-4 text-black dark:text-white" />
        <h3 className="font-serif font-black text-lg text-gray-950 dark:text-white tracking-tight uppercase">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {articles.slice(0, 5).map((article, index) => {
          const rank = String(index + 1).padStart(2, "0");
          const categorySlug = article.category?.slug || "news";
          const href = `/${categorySlug}/${article.slug}`;

          return (
            <div
              key={article.id}
              className="flex items-start gap-4 pb-3.5 border-b border-gray-100 dark:border-gray-800/80 last:border-0 last:pb-0 group"
            >
              {/* Large Editorial Rank Number */}
              <span className="font-serif font-black text-2xl sm:text-3xl text-neutral-300 dark:text-neutral-700 group-hover:text-black dark:group-hover:text-white transition-colors flex-shrink-0 leading-none pt-1">
                {rank}
              </span>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-0.5">
                  {article.category?.name}
                </span>
                <h4 className="font-serif font-bold text-sm text-gray-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition line-clamp-2 leading-snug">
                  <Link href={href}>{article.title}</Link>
                </h4>
                <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                  {formatTimeAgo(article.publishedAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
