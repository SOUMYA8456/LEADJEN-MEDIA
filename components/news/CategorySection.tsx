import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleData, NewsCard, CompactNewsCard } from "./NewsCard";

interface CategorySectionProps {
  categoryName: string;
  categorySlug: string;
  articles: ArticleData[];
  layout?: "grid" | "featured-split" | "three-col";
}

export function CategorySection({
  categoryName,
  categorySlug,
  articles = [],
  layout = "featured-split",
}: CategorySectionProps) {
  if (!articles || articles.length === 0) return null;

  const leadStory = articles[0];
  const secondaryStories = articles.slice(1, 4);

  return (
    <section className="w-full py-8 border-b border-gray-200 dark:border-gray-800">
      {/* Category Section Header */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-gray-950 dark:border-white">
        <div className="flex items-center gap-3">
          <h2 className="font-serif font-black text-xl sm:text-2xl text-gray-950 dark:text-white tracking-tight uppercase">
            {categoryName}
          </h2>
        </div>
        <Link
          href={`/${categorySlug}`}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black dark:text-white hover:underline transition group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Editorial Content Layout */}
      {layout === "featured-split" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Lead Story in Category (7 cols) */}
          <div className="lg:col-span-7">
            <NewsCard article={leadStory} showExcerpt={true} aspectRatio="aspect-[16/10]" />
          </div>

          {/* Secondary Stacked Stories in Category (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-gray-100 dark:divide-gray-800/80 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 lg:pl-6 pt-4 lg:pt-0">
            {secondaryStories.map((story) => (
              <CompactNewsCard key={story.id} article={story} />
            ))}
          </div>
        </div>
      )}

      {layout === "three-col" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((story) => (
            <NewsCard key={story.id} article={story} showExcerpt={true} />
          ))}
        </div>
      )}
    </section>
  );
}
