"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  FileText,
  Radio,
  Megaphone,
  MousePointer,
  Percent,
  TrendingUp,
  Flame,
  Award,
  Users,
  Layers,
  Calendar,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { formatTimeAgo, formatArticleDate } from "@/lib/utils";

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("today");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics?range=${range}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [range]);

  const formatCompact = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-mono font-bold uppercase rounded-md tracking-wider">
              EDITORIAL INTELLIGENCE
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Live Readership & Monetization Analytics
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-1">
            Newsroom Analytics Dashboard
          </h1>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl font-mono text-xs font-bold uppercase">
          {[
            { label: "Today", value: "today" },
            { label: "Yesterday", value: "yesterday" },
            { label: "7 Days", value: "7days" },
            { label: "30 Days", value: "30days" },
            { label: "All Time", value: "all" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRange(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                range === tab.value
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-neutral-400 font-mono text-xs">
          Aggregating verified PostgreSQL readership metrics...
        </div>
      ) : !data ? (
        <div className="p-16 text-center text-red-500 font-mono text-xs">
          Failed to load analytics data.
        </div>
      ) : (
        <>
          {/* 7 METRICS SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* Total Views */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Total Views</span>
                <Eye className="w-3.5 h-3.5 text-black dark:text-white" />
              </div>
              <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
                {formatCompact(data.overview.totalViews)}
              </div>
              <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Total portal reach</span>
            </div>

            {/* Articles Published */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Published</span>
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
                {data.overview.articlesPublished}
              </div>
              <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">In selected period</span>
            </div>

            {/* Breaking News */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Breaking News</span>
                <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              </div>
              <div className="text-xl sm:text-2xl font-serif font-black text-red-600">
                {data.overview.breakingNews}
              </div>
              <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Active bulletins</span>
            </div>

            {/* Active Ads */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Active Ads</span>
                <Megaphone className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
                {data.overview.activeAds}
              </div>
              <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">In active rotation</span>
            </div>

            {/* Ad Impressions */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Ad Impressions</span>
                <Eye className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
                {formatCompact(data.overview.adImpressions)}
              </div>
              <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Served banner views</span>
            </div>

            {/* Ad Clicks */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Ad Clicks</span>
                <MousePointer className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
                {data.overview.adClicks.toLocaleString()}
              </div>
              <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Total ad traffic</span>
            </div>

            {/* Ad CTR */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Ad CTR</span>
                <Percent className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="text-xl sm:text-2xl font-serif font-black text-red-600">
                {data.overview.adCtr}%
              </div>
              <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Click rate</span>
            </div>
          </div>

          {/* MOST READ (Actual Views) VS TRENDING (Editorially Designated) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MOST READ — Ranked by REAL reader view count */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-black text-white text-[9px] font-mono font-bold uppercase rounded">
                      VERIFIED DATA
                    </span>
                    <h3 className="font-serif font-bold text-base text-black dark:text-white flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-red-600" />
                      Most Read Stories
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-neutral-400 mt-0.5">
                    Ranked strictly by verified reader view counts
                  </p>
                </div>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 mt-3">
                {data.mostRead.slice(0, 6).map((art: any, idx: number) => (
                  <div key={art.id} className="py-3 flex items-start gap-3">
                    <span className="font-mono font-black text-xs text-red-600 pt-0.5">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="font-serif font-bold text-xs text-black dark:text-white hover:text-red-600 line-clamp-2 leading-snug"
                      >
                        {art.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-1">
                        <span>{art.category?.name}</span>
                        <span>•</span>
                        <span>By {art.author?.name}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 font-mono">
                      <span className="font-bold text-xs text-black dark:text-white block">
                        {formatCompact(art.viewCount)}
                      </span>
                      <span className="text-[9px] text-neutral-400">views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TRENDING — Editorially Curated Current Topics */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-mono font-bold uppercase rounded">
                      EDITORIAL CURATION
                    </span>
                    <h3 className="font-serif font-bold text-base text-black dark:text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-red-600" />
                      Trending Topics
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-neutral-400 mt-0.5">
                    Editorially designated trending topics and developing stories
                  </p>
                </div>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 mt-3">
                {data.trending.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400 font-mono text-xs italic">
                    No articles currently flagged as Trending.
                  </div>
                ) : (
                  data.trending.slice(0, 6).map((art: any, idx: number) => (
                    <div key={art.id} className="py-3 flex items-start gap-3">
                      <span className="font-mono font-bold text-xs text-neutral-400 pt-0.5">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="font-serif font-bold text-xs text-black dark:text-white hover:text-red-600 line-clamp-2 leading-snug"
                        >
                          {art.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-1">
                          <span>{art.category?.name}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(art.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 font-mono">
                        <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[9px] font-bold text-neutral-600 dark:text-neutral-300">
                          TRENDING
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* TOP CATEGORIES & TOP AUTHORS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Categories */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
                <span>Top Performing Categories</span>
                <Layers className="w-4 h-4 text-neutral-400" />
              </h3>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 mt-3">
                {data.topCategories.slice(0, 6).map((cat: any) => (
                  <div key={cat.id} className="py-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-black dark:text-white uppercase block">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {cat.articleCount} articles published
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-black dark:text-white block">
                        {formatCompact(cat.totalViews)}
                      </span>
                      <span className="text-[9px] text-neutral-400">views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Authors */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
                <span>Top Editorial Correspondents</span>
                <Users className="w-4 h-4 text-neutral-400" />
              </h3>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 mt-3">
                {data.topAuthors.slice(0, 6).map((aut: any) => (
                  <div key={aut.id} className="py-3 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={aut.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                        alt={aut.name}
                        className="w-8 h-8 rounded-full object-cover bg-neutral-200"
                      />
                      <div>
                        <span className="font-bold text-black dark:text-white block font-serif text-sm">
                          {aut.name}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {aut.articleCount} articles published
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-black dark:text-white block">
                        {formatCompact(aut.totalViews)}
                      </span>
                      <span className="text-[9px] text-neutral-400">views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
