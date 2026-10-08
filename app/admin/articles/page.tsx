import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma, { syncScheduledArticles } from "@/lib/db";
import { PlusCircle } from "lucide-react";
import { ArticlesTableClient } from "@/components/admin/ArticlesTableClient";

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
    <div className="space-y-5 pb-20 max-w-[1720px] mx-auto px-1 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-black text-xl sm:text-2xl md:text-3xl text-black dark:text-white">
            Editorial Articles Repository
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Total Articles in Database: {total}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/news-desk"
            className="flex-1 sm:flex-initial text-center px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
          >
            News Desk
          </Link>
          <Link
            href="/admin/articles/create"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write Article</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold font-mono uppercase no-scrollbar touch-pan-x pb-1">
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
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition flex-shrink-0 ${
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

      {/* Articles Table & Cards Client Component */}
      <ArticlesTableClient
        initialArticles={articles}
        categories={categories}
        currentStatus={searchParams.status || ""}
        currentCategory={searchParams.category || ""}
        currentSearch={searchParams.search || ""}
      />
    </div>
  );
}
