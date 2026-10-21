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
    }).catch(() => []),
    prisma.category.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ]);

  return (
    <div className="w-full bg-[#FFF8E7] dark:bg-editorial-darkBg py-10 min-h-screen text-[#241A1A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Header */}
        <div className="pb-6 border-b-2 border-[#4A0B1C] dark:border-white">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B1024] block mb-1">
            SEARCH ARCHIVE
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#241A1A] dark:text-white">
            {query ? `Search Results for "${query}"` : "Explore All News Articles"}
          </h1>
          <p className="text-xs text-[#665858] font-mono mt-1">
            Found {articles.length} verified news stories in database
          </p>
        </div>

        {/* Categories & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#FFFCF5] dark:bg-editorial-darkCard rounded-xl border border-[#E8DCCB] dark:border-gray-800">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            <Link
              href={`/search?q=${encodeURIComponent(query)}&sort=${sort}`}
              className={`px-3 py-1.5 rounded-md font-bold uppercase transition ${
                !categoryFilter
                  ? "bg-[#4A0B1C] text-white"
                  : "bg-[#F7EEDB] dark:bg-gray-800 text-[#4A0B1C] dark:text-gray-300 hover:bg-[#E8DCCB]"
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
                    ? "bg-[#4A0B1C] text-white"
                    : "bg-[#F7EEDB] dark:bg-gray-800 text-[#4A0B1C] dark:text-gray-300 hover:bg-[#E8DCCB]"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#665858]">Sort:</span>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&category=${categoryFilter}&sort=latest`}
              className={`px-2.5 py-1 rounded font-bold uppercase ${
                sort === "latest"
                  ? "text-[#4A0B1C] dark:text-white font-black underline"
                  : "text-[#665858]"
              }`}
            >
              Latest
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&category=${categoryFilter}&sort=most_read`}
              className={`px-2.5 py-1 rounded font-bold uppercase ${
                sort === "most_read"
                  ? "text-[#4A0B1C] dark:text-white font-black underline"
                  : "text-[#665858]"
              }`}
            >
              Most Read
            </Link>
          </div>
        </div>

        {/* Results List */}
        {articles.length === 0 ? (
          <div className="py-16 text-center text-[#665858] border border-dashed border-[#E8DCCB] dark:border-gray-800 rounded-xl p-8 bg-[#FFFCF5]">
            <Search className="w-10 h-10 mx-auto text-[#665858] dark:text-gray-700 mb-2" />
            <p className="font-serif text-lg text-[#241A1A] dark:text-gray-300">
              No published articles matched your search query.
            </p>
            <p className="text-xs mt-1 font-mono text-[#665858]">
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
