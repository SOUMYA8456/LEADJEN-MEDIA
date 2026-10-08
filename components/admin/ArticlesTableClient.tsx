"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Clock,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { formatTimeAgo, formatArticleDate } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  status: string;
  isFeatured: boolean;
  isBreaking: boolean;
  isTrending: boolean;
  viewCount: number;
  scheduledAt?: Date | string | null;
  createdAt: Date | string;
  category?: Category | null;
  author?: Author | null;
}

interface ArticlesTableClientProps {
  initialArticles: any[];
  categories: Category[];
  currentStatus?: string;
  currentCategory?: string;
  currentSearch?: string;
}

export function ArticlesTableClient({
  initialArticles,
  categories,
  currentStatus = "",
  currentCategory = "",
  currentSearch = "",
}: ArticlesTableClientProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [deleteModalArticle, setDeleteModalArticle] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleDelete = async () => {
    if (!deleteModalArticle) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/articles/${deleteModalArticle.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const title = deleteModalArticle.title;
        setArticles((prev) => prev.filter((a) => a.id !== deleteModalArticle.id));
        setDeleteModalArticle(null);
        setMessage({
          text: `✓ Article "${title}" was deleted successfully.`,
          type: "success",
        });
      } else {
        const err = await res.json();
        setMessage({
          text: err.error || "Failed to delete article",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        text: "Error deleting article",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-mono font-bold ${
            message.type === "success"
              ? "bg-black text-white border border-neutral-700"
              : "bg-red-950 text-red-300 border border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MOBILE CARD VIEW (< md) */}
      <div className="block md:hidden space-y-3">
        {articles.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 text-center text-neutral-400 font-serif">
            No articles found in this view.
          </div>
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
              <div
                key={art.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  {art.featuredImage && (
                    <img
                      src={art.featuredImage}
                      alt=""
                      className="w-16 h-16 object-cover rounded-xl bg-neutral-100 dark:bg-neutral-800 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${statusBg}`}>
                        {art.status.replace("_", " ")}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {art.category?.name || "General"}
                      </span>
                    </div>

                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="font-serif font-bold text-sm text-black dark:text-white hover:text-red-600 block leading-snug"
                    >
                      {art.title}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span>By {art.author?.name || "Desk"}</span>
                  <span>{art.viewCount.toLocaleString()} views • {formatTimeAgo(new Date(art.createdAt))}</span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Link
                    href={`/${art.category?.slug}/${art.slug}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-mono uppercase font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>

                  <Link
                    href={`/admin/articles/${art.id}/edit`}
                    className="flex items-center justify-center gap-1 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono uppercase font-bold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeleteModalArticle(art)}
                    className="flex items-center justify-center gap-1 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-mono uppercase font-bold hover:bg-red-600 hover:text-white transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (>= md) */}
      <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
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
                              By {art.author?.name} • Created {formatTimeAgo(new Date(art.createdAt))}
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
                            {formatArticleDate(new Date(art.scheduledAt))}
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

                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                        <Link
                          href={`/${art.category?.slug}/${art.slug}`}
                          target="_blank"
                          className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition inline-block align-middle"
                          title="View Live Article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition inline-block align-middle"
                          title="Edit Article"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteModalArticle(art)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition inline-block align-middle"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
              <div className="p-3 bg-red-600/10 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-black dark:text-white">
                  Delete Article
                </h3>
                <span className="text-[10px] font-mono text-red-600 uppercase font-bold">
                  Permanent Action
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300 font-sans">
              <p>Are you sure you want to delete this article?</p>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="font-serif font-bold text-black dark:text-white line-clamp-2">
                  &ldquo;{deleteModalArticle.title}&rdquo;
                </p>
                <p className="text-[10px] font-mono text-neutral-400 mt-1 uppercase">
                  {deleteModalArticle.category?.name} • Status: {deleteModalArticle.status}
                </p>
              </div>
              <p className="text-[11px] text-red-600 dark:text-red-400 font-mono">
                ⚠️ This will permanently remove the dispatch from the live portal, search index, and archives.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setDeleteModalArticle(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-md shadow-red-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting..." : "Yes, Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
