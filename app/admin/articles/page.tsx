import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma, { syncScheduledArticles } from "@/lib/db";
import {
  PlusCircle,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Flame,
  Star,
  TrendingUp,
  Clock,
  Filter,
  Radio,
} from "lucide-react";
import { formatTimeAgo, formatArticleDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminArticlesListPage({
  searchParams,
}: {
  searchParams: { status?: string; category?: string; search?: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  await syncScheduledArticles();

  const where: any = {};
  if (searchParams.status && searchParams.status !== "ALL") {
    where.status = searchParams.status;
  }
  if (searchParams.category && searchParams.category !== "ALL") {
    where.category = { slug: searchParams.category };
  }
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { excerpt: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  const [articles, categories, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true, author: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.article.count({ where }),
  ]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white">
            Editorial Articles Repository
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Total Articles in Database: {total}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/news-desk"
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
          >
            News Desk Queue
          </Link>
          <Link
            href="/admin/articles/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write New Article</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold font-mono uppercase no-scrollbar">
            {[
              { label: "All Stories", value: "" },
              { label: "Published", value: "PUBLISHED" },
              { label: "In Review", value: "IN_REVIEW" },
              { label: "Approved", value: "APPROVED" },
              { label: "Drafts", value: "DRAFT" },
              { label: "Scheduled", value: "SCHEDULED" },
              { label: "Archived", value: "ARCHIVED" },
            ].map((tab) => {
              const active = (searchParams.status || "") === tab.value;
              return (
                <Link
                  key={tab.label}
                  href={`/admin/articles${tab.value ? `?status=${tab.value}` : ""}`}
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    active
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                <th className="py-3 px-4 font-semibold">Article & Author</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Flags</th>
                <th className="py-3 px-4 font-semibold">Views</th>
                <th className="py-3 px-4 font-semibold text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <p className="font-serif text-base text-neutral-700 dark:text-neutral-300">No articles found in this view.</p>
                    <p className="text-xs mt-1 font-mono">Create an article or adjust filters.</p>
                  </td>
                </tr>
              ) : (
                articles.map((art) => {
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
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3 max-w-lg">
                          <img
                            src={art.featuredImage}
                            alt={art.title}
                            className="w-14 h-10 object-cover rounded-lg bg-neutral-100 flex-shrink-0 mt-0.5"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/articles/${art.id}/edit`}
                              className="font-serif font-bold text-sm text-black dark:text-white hover:text-red-600 line-clamp-2 leading-snug"
                            >
                              {art.title}
                            </Link>
                            <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                              By {art.author?.name} • Created {formatTimeAgo(art.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {art.category?.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${statusBg}`}>
                          {art.status.replace("_", " ")}
                        </span>
                        {art.status === "SCHEDULED" && art.scheduledAt && (
                          <span className="text-[9px] text-neutral-400 font-mono block mt-0.5">
                            {formatArticleDate(art.scheduledAt)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {art.isFeatured && (
                            <span className="p-1 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded" title="Featured Story">
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </span>
                          )}
                          {art.isBreaking && (
                            <span className="p-1 bg-red-600/10 text-red-600 rounded font-bold text-[9px] font-mono uppercase" title="Breaking News">
                              🔴 BREAKING
                            </span>
                          )}
                          {art.isTrending && (
                            <span className="p-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded" title="Trending">
                              <TrendingUp className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-600 dark:text-neutral-400">
                        {art.viewCount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-2">
                        <Link
                          href={`/${art.category?.slug}/${art.slug}`}
                          target="_blank"
                          className="p-1 text-neutral-400 hover:text-red-600 inline-block"
                          title="View Live Article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg text-xs font-mono font-bold uppercase transition inline-block"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
