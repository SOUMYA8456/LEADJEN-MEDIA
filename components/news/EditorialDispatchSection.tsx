"use client";

import React from "react";
import Link from "next/link";
import { ArticleData } from "./NewsCard";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface EditorialDispatchProps {
  title?: string;
  subtitle?: string;
  articles?: ArticleData[];
  className?: string;
}

export function EditorialDispatchSection({
  title = "LEADJEN EDITORIAL DISPATCH",
  subtitle = "Authoritative analysis and essential investigations curated by our executive editors",
  articles = [],
  className = "",
}: EditorialDispatchProps) {
  if (!articles || articles.length === 0) return null;

  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);

  return (
    <section className={`w-full bg-[#FAF8F5] dark:bg-[#0E131C] border-b border-editorial-border dark:border-editorial-darkBorder py-8 shadow-none ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-6 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-black text-white dark:bg-white dark:text-black rounded-md shadow-none">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-gray-950 dark:text-white tracking-tight uppercase">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-sans mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500 uppercase">
            <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
            <span>Executive Bureau Verified</span>
          </div>
        </div>

        {/* Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Dispatch Focus Card */}
          {mainArticle && (
            <div className="lg:col-span-6 bg-white dark:bg-editorial-darkCard p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-none space-y-4">
              <Link
                href={`/${mainArticle.category?.slug || "news"}/${mainArticle.slug}`}
                className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-gray-900 group"
              >
                <img
                  src={mainArticle.featuredImage}
                  alt={mainArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold uppercase rounded shadow-none">
                  {mainArticle.category?.name || "Editorial Focus"}
                </div>
              </Link>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <span>By {mainArticle.author?.name || "Leadjen Editorial Desk"}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(mainArticle.publishedAt)}</span>
                </div>

                <Link
                  href={`/${mainArticle.category?.slug || "news"}/${mainArticle.slug}`}
                  className="block group"
                >
                  <h3 className="font-serif font-black text-xl sm:text-2xl text-gray-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors leading-snug">
                    {mainArticle.title}
                  </h3>
                </Link>

                {mainArticle.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-sans line-clamp-3 leading-relaxed">
                    {mainArticle.excerpt}
                  </p>
                )}

                <div className="pt-2">
                  <Link
                    href={`/${mainArticle.category?.slug || "news"}/${mainArticle.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-black dark:text-white hover:underline"
                  >
                    <span>Read Full Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Dispatch Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {secondaryArticles.map((art, idx) => (
              <div
                key={art.id}
                className="p-4 bg-white dark:bg-editorial-darkCard rounded-xl border border-gray-200 dark:border-gray-800 shadow-none flex flex-col sm:flex-row gap-4 items-start group"
              >
                <Link
                  href={`/${art.category?.slug || "news"}/${art.slug}`}
                  className="relative w-full sm:w-36 aspect-[16/10] sm:aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    src={art.featuredImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-mono font-bold uppercase rounded">
                    0{idx + 2}
                  </span>
                </Link>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    {art.category?.name || "Dispatch"}
                  </span>
                  <Link
                    href={`/${art.category?.slug || "news"}/${art.slug}`}
                    className="font-serif font-bold text-sm sm:text-base text-gray-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2 leading-snug"
                  >
                    {art.title}
                  </Link>
                  <div className="text-[11px] font-mono text-gray-400">
                    {art.author?.name || "Editorial Desk"} • {formatTimeAgo(art.publishedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
