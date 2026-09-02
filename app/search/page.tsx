import React from "react";
import prisma from "@/lib/db";
import { HorizontalNewsCard } from "@/components/news/NewsCard";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  return {
    title: `Search: ${searchParams.q || "Archive"} | LEADJEN MEDIA`,
    description: "Search verified news reports, investigations, and commentary across Leadjen Media.",
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string };
}) {
  const query = searchParams.q || "";
  const categoryFilter = searchParams.category || "";
  const sort = searchParams.sort || "latest";

  const where: any = {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
  };

  if (query.trim()) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { subtitle: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ];
  }

  if (categoryFilter) {
    where.category = { slug: categoryFilter };
  }

  const orderBy: any = {};
  if (sort === "most_read") {
    orderBy.viewCount = "desc";
  } else {
    orderBy.publishedAt = "desc";
  }

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true, author: true },
      orderBy,
      take: 40,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="w-full bg-white dark:bg-editorial-darkBg py-10 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Header */}
        <div className="pb-6 border-b-2 border-gray-950 dark:border-white">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
            SEARCH ARCHIVE
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-gray-950 dark:text-white">
            {query ? `Search Results for "${query}"` : "Explore All News Articles"}
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Found {articles.length} verified news stories in database
          </p>
        </div>

        {/* Categories & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-editorial-darkCard rounded-xl border border-gray-200 dark:border-gray-800">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            <Link
              href={`/search?q=${encodeURIComponent(query)}&sort=${sort}`}
              className={`px-3 py-1.5 rounded-md font-bold uppercase transition ${
                !categoryFilter
                  ? "bg-[#1E1B1A] text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/search?q=${encodeURIComponent(query)}&category=${c.slug}&sort=${sort}`}
                className={`px-3 py-1.5 rounded-md font-bold uppercase transition whitespace-nowrap ${
                  categoryFilter === c.slug
                    ? "bg-[#1E1B1A] text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-400">Sort:</span>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&category=${categoryFilter}&sort=latest`}
              className={`px-2.5 py-1 rounded font-bold uppercase ${
                sort === "latest"
                  ? "text-black dark:text-white font-black underline"
                  : "text-gray-500"
              }`}
            >
              Latest
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&category=${categoryFilter}&sort=most_read`}
              className={`px-2.5 py-1 rounded font-bold uppercase ${
                sort === "most_read"
                  ? "text-black dark:text-white font-black underline"
                  : "text-gray-500"
              }`}
            >
              Most Read
            </Link>
          </div>
        </div>

        {/* Results List */}
        {articles.length === 0 ? (
          <div className="py-16 text-center text-gray-400 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl p-8">
            <Search className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
            <p className="font-serif text-lg text-gray-700 dark:text-gray-300">
              No published articles matched your search query.
            </p>
            <p className="text-xs mt-1 font-mono">
              Try searching with alternative keywords or clearing category filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <HorizontalNewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
