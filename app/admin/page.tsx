import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma, { syncScheduledArticles } from "@/lib/db";
import {
  FileText,
  Eye,
  Calendar,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Users,
  Image as ImageIcon,
  Radio,
  Layers,
} from "lucide-react";
import { formatTimeAgo, formatArticleDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Ensure scheduled articles get promoted
  await syncScheduledArticles();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Fetch real statistics directly from PostgreSQL
  const [
    totalArticles,
    publishedToday,
    draftsCount,
    inReviewCount,
    approvedCount,
    scheduledCount,
    breakingCount,
    totalViewsAgg,
    recentArticles,
    mostReadArticles,
    scheduledArticles,
    totalSectionsCount,
    latestVersion,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: todayStart },
      },
    }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "IN_REVIEW" } }),
    prisma.article.count({ where: { status: "APPROVED" } }),
    prisma.article.count({ where: { status: "SCHEDULED" } }),
    prisma.article.count({ where: { isBreaking: true, status: "PUBLISHED" } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { category: true, author: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      take: 5,
      orderBy: { viewCount: "desc" },
      include: { category: true },
    }),
    prisma.article.findMany({
      where: { status: "SCHEDULED" },
      take: 3,
      orderBy: { scheduledAt: "asc" },
      include: { category: true },
    }),
    prisma.homepageSection.count({ where: { enabled: true } }),
    prisma.homepageVersion.findFirst({ orderBy: { publishedAt: "desc" } }),
  ]);

  const totalViews = totalViewsAgg._sum.viewCount || 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Top Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white">
            Editorial Newsroom Overview
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Logged in as: {session.name} • {session.role.replace("_", " ")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/articles/create"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Article</span>
          </Link>
          <Link
            href="/admin/breaking"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>+ Breaking</span>
          </Link>
          <Link
            href="/admin/live"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span>+ Live Desk</span>
          </Link>
          <Link
            href="/admin/media"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>+ Media</span>
          </Link>
          <Link
            href="/admin/homepage"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Homepage</span>
          </Link>
        </div>
      </div>

      {/* HOMEPAGE CONTROL CENTER BANNER */}
      <div className="bg-black border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-600/40 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              PUBLIC HOMEPAGE: LIVE & SYNCED
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {totalSectionsCount} Active Database Sections
            </span>
          </div>
          <h2 className="font-serif font-black text-xl text-white">
            Leadjen Media Editorial Publishing Center
          </h2>
          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
            Visually reorder sections, customize hero lead stories, modify category grids, manage breaking bulletins, and control header navigation without code changes.
          </p>
          {latestVersion && (
            <div className="text-[11px] font-mono text-neutral-400 pt-1">
              Last Live Deployment: <span className="text-white font-bold">{latestVersion.name}</span> ({formatTimeAgo(latestVersion.publishedAt)})
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/homepage"
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition"
          >
            <span>Edit Homepage</span>
          </Link>
          <Link
            href="/admin/settings/site"
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <span>Site & Nav</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-transparent hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs font-mono transition"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Articles */}
        <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Total Articles
            </span>
            <FileText className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-white">
            {totalArticles}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">In database</span>
        </div>

        {/* In Review */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition ${inReviewCount > 0 ? "bg-red-950/20 border-red-600" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"}`}>
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              In Review
            </span>
            <Clock className="w-4 h-4 text-red-600" />
          </div>
          <div className={`text-2xl sm:text-3xl font-serif font-black ${inReviewCount > 0 ? "text-red-600" : "text-black dark:text-white"}`}>
            {inReviewCount}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Pending approval</span>
        </div>

        {/* Drafts */}
        <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Drafts
            </span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-white">
            {draftsCount}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">In progress</span>
        </div>

        {/* Scheduled */}
        <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Scheduled
            </span>
            <Calendar className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-white">
            {scheduledCount}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Auto-publish queue</span>
        </div>

        {/* Breaking News */}
        <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Breaking News
            </span>
            <Radio className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-red-600">
            {breakingCount}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Active on ticker</span>
        </div>

        {/* Total Views */}
        <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Total Views
            </span>
            <TrendingUp className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-white">
            {totalViews.toLocaleString()}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Verified readership</span>
        </div>
      </div>

      {/* Main Content Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Articles Table (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <h2 className="font-serif font-bold text-lg text-black dark:text-white">
                Recently Modified Stories
              </h2>
              <p className="text-xs text-neutral-500 font-mono">Live PostgreSQL database entries</p>
            </div>
            <Link
              href="/admin/articles"
              className="text-xs font-mono font-bold uppercase text-red-600 dark:text-red-500 hover:underline"
            >
              View All Articles →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                  <th className="pb-3 font-semibold">Article</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Views</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {recentArticles.map((art) => {
                  const statusBg =
                    art.status === "PUBLISHED"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : art.status === "APPROVED"
                      ? "bg-neutral-900 text-white dark:bg-neutral-200 dark:text-black font-bold"
                      : art.status === "IN_REVIEW"
                      ? "bg-red-600 text-white font-bold"
                      : art.status === "SCHEDULED"
                      ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";

                  return (
                    <tr key={art.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950 transition">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={art.featuredImage}
                            alt={art.title}
                            className="w-12 h-9 object-cover rounded-lg bg-neutral-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/articles/${art.id}/edit`}
                              className="font-serif font-bold text-sm text-black dark:text-white hover:text-red-600 line-clamp-1"
                            >
                              {art.title}
                            </Link>
                            <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                              By {art.author?.name} • {formatTimeAgo(art.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {art.category?.name}
                        </span>
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${statusBg}`}>
                          {art.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 whitespace-nowrap font-mono text-neutral-600 dark:text-neutral-400">
                        {art.viewCount.toLocaleString()}
                      </td>
                      <td className="py-3.5 whitespace-nowrap text-right space-x-2">
                        <Link
                          href={`/${art.category.slug}/${art.slug}`}
                          target="_blank"
                          className="text-neutral-400 hover:text-red-600"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5 inline" />
                        </Link>
                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="text-xs font-mono font-bold uppercase text-black dark:text-white hover:text-red-600 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Most Read & Scheduled (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Scheduled Publishing Queue */}
          {scheduledArticles.length > 0 && (
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
              <h3 className="font-serif font-bold text-sm text-black dark:text-white flex items-center gap-1.5 mb-3">
                <Calendar className="w-4 h-4 text-black dark:text-white" />
                Scheduled for Publication
              </h3>
              <div className="space-y-3">
                {scheduledArticles.map((item) => (
                  <div key={item.id} className="text-xs pb-2.5 border-b border-neutral-200 dark:border-neutral-800 last:border-0 last:pb-0">
                    <span className="font-bold text-black dark:text-white block line-clamp-1">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Scheduled for: {formatArticleDate(item.scheduledAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Read Articles */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs">
            <h3 className="font-serif font-bold text-base text-black dark:text-white flex items-center gap-1.5 pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800">
              <TrendingUp className="w-4 h-4 text-red-600" />
              Highest Read Stories
            </h3>
            <div className="space-y-3">
              {mostReadArticles.map((art, idx) => (
                <div key={art.id} className="flex items-start gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/80 last:border-0 last:pb-0">
                  <span className="font-mono font-bold text-xs text-red-600 pt-0.5">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="font-serif font-bold text-xs text-black dark:text-white hover:text-red-600 line-clamp-2"
                    >
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">
                      {art.viewCount.toLocaleString()} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
