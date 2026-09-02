import React from "react";
import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";
import prisma from "@/lib/db";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  let siteConfig: SiteBuilderConfig = DEFAULT_SITE_BUILDER_CONFIG;
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settings?.siteConfigJson) {
      siteConfig = { ...DEFAULT_SITE_BUILDER_CONFIG, ...JSON.parse(settings.siteConfigJson) };
    }
  } catch {}

  const errorConfig = siteConfig.error404 || DEFAULT_SITE_BUILDER_CONFIG.error404;

  const popularCategories = [
    { name: "India", href: "/india" },
    { name: "World", href: "/world" },
    { name: "Politics", href: "/politics" },
    { name: "Business", href: "/business" },
    { name: "Technology", href: "/technology" },
    { name: "Sports", href: "/sports" },
    { name: "Live Desk", href: "/live" },
    { name: "Videos", href: "/videos" },
  ];

  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-neutral-950 text-center font-sans">
      <div className="max-w-xl space-y-6">
        <span className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold uppercase rounded tracking-widest inline-block">
          404 • STORY NOT FOUND
        </span>

        <h1 className="font-serif font-black text-3xl sm:text-5xl text-black dark:text-white tracking-tight">
          {errorConfig.heading || "Story Not Available"}
        </h1>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed max-w-md mx-auto">
          {errorConfig.description || "The requested dispatch, article, or multimedia page may have been archived, relocated, or expired."}
        </p>

        {/* Search Input */}
        {errorConfig.showSearchBox !== false && (
          <form action="/search" method="GET" className="max-w-md mx-auto">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Search Leadjen Media news archives..."
                className="bg-transparent flex-1 text-xs text-black dark:text-white focus:outline-hidden font-sans"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold uppercase"
              >
                Search
              </button>
            </div>
          </form>
        )}

        {/* Popular Categories */}
        {errorConfig.showPopularStories !== false && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-mono uppercase text-neutral-400 block font-bold">
              Explore Active News Desks:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto">
              {popularCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="px-3 py-1 bg-neutral-100 dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-mono transition"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href={errorConfig.buttonUrl || "/"}
            className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>{errorConfig.buttonText || "Return to Homepage"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
