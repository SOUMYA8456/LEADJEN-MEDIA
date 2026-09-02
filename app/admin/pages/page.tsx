"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle,
  Eye,
  RefreshCw,
  Globe,
} from "lucide-react";

interface StaticPageItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  seoTitle?: string;
  updatedAt: string;
}

export default function AdminPagesManager() {
  const [pages, setPages] = useState<StaticPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pages");
      const data = await res.json();
      if (data.pages) {
        setPages(data.pages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the page "${title}"?`)) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPages(pages.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete page.");
      }
    } catch {
      alert("Delete failed.");
    }
  };

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-mono font-bold uppercase rounded">
              SITE BUILDER
            </span>
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[9px] font-mono font-bold uppercase rounded">
              EDITORIAL PAGES
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-1">
            Static &amp; Policy Pages Manager
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Manage About Us, Privacy Policy, Terms, Editorial Standards, and custom editorial pages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/pages/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Page</span>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <Search className="w-4 h-4 text-neutral-400 ml-2" />
        <input
          type="text"
          placeholder="Search by page title or URL slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs font-sans text-black dark:text-white placeholder-neutral-400 focus:outline-hidden"
        />
        <button
          type="button"
          onClick={fetchPages}
          className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 rounded-lg transition"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4 font-bold">Page Title</th>
                <th className="py-3 px-4 font-bold">URL Path</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Last Updated</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 font-mono">
                    {loading ? "Loading static pages..." : "No pages found."}
                  </td>
                </tr>
              ) : (
                filteredPages.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                    <td className="py-3.5 px-4 font-bold text-black dark:text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-500">
                      /{p.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          p.status === "PUBLISHED"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                      {new Date(p.updatedAt).toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${p.slug}`}
                          target="_blank"
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white rounded-lg transition"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/pages/${p.id}/edit`}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-lg transition"
                          title="Edit Page"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-1.5 hover:bg-red-500/10 text-neutral-400 hover:text-red-600 rounded-lg transition"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
