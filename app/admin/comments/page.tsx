"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  Shield,
  Clock,
  User,
  Check,
  Ban,
  Radio,
} from "lucide-react";
import { formatTimeAgo, formatArticleDate } from "@/lib/utils";

export default function CommentModerationPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, pending: 0, approved: 0, rejected: 0, spam: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [statusFilter, search]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments/admin?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (commentId: string, status: string) => {
    try {
      setActionLoading(commentId);
      const res = await fetch(`/api/comments/${commentId}/moderate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to permanently delete this comment?")) return;
    try {
      setActionLoading(commentId);
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-mono font-bold uppercase rounded-md tracking-wider">
              AUDIENCE MODERATION
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Editorial Community Desk
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-1">
            Reader Comments Moderation
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search comments, readers, articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 text-black dark:text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
            Awaiting Moderation
          </span>
          <div className="text-2xl font-serif font-black text-red-600 mt-1 flex items-center gap-2">
            <span>{stats.pending || 0}</span>
            {stats.pending > 0 && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
          </div>
          <span className="text-[10px] font-mono text-neutral-500">Requires editor approval</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
            Approved & Live
          </span>
          <div className="text-2xl font-serif font-black text-black dark:text-white mt-1">
            {stats.approved || 0}
          </div>
          <span className="text-[10px] font-mono text-neutral-500">Visible on public articles</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
            Rejected
          </span>
          <div className="text-2xl font-serif font-black text-neutral-500 mt-1">
            {stats.rejected || 0}
          </div>
          <span className="text-[10px] font-mono text-neutral-500">Policy violations</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
            Spam Blocked
          </span>
          <div className="text-2xl font-serif font-black text-neutral-500 mt-1">
            {stats.spam || 0}
          </div>
          <span className="text-[10px] font-mono text-neutral-500">Automated / manual spam</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl font-mono text-xs font-bold uppercase w-fit">
        {[
          { label: `Pending (${stats.pending || 0})`, value: "PENDING" },
          { label: `Approved (${stats.approved || 0})`, value: "APPROVED" },
          { label: `Rejected (${stats.rejected || 0})`, value: "REJECTED" },
          { label: `Spam (${stats.spam || 0})`, value: "SPAM" },
          { label: "All Comments", value: "ALL" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              statusFilter === tab.value
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-neutral-400">
            Loading comment moderation queue...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-sm font-serif font-bold text-neutral-600 dark:text-neutral-400">
              No comments found in this queue.
            </p>
            <p className="text-xs font-mono text-neutral-400">
              All submitted discussions are currently reviewed.
            </p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-6 space-y-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition">
              {/* Comment Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs font-serif overflow-hidden">
                    {c.user?.avatar ? (
                      <img src={c.user.avatar} alt={c.authorName} className="w-full h-full object-cover" />
                    ) : (
                      c.authorName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-black dark:text-white">
                        {c.authorName}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        ({c.authorEmail})
                      </span>
                      {c.user?.role && (
                        <span className="px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 rounded text-[9px] font-mono uppercase text-neutral-500 font-bold">
                          {c.user.role}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {formatTimeAgo(c.createdAt)} ({new Date(c.createdAt).toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      c.status === "APPROVED"
                        ? "bg-neutral-100 text-neutral-900 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-100"
                        : c.status === "PENDING"
                        ? "bg-red-600 text-white font-black animate-pulse"
                        : c.status === "SPAM"
                        ? "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>

              {/* Article Context */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs font-mono">
                <span className="text-neutral-400 uppercase text-[9px] font-bold block mb-0.5">
                  Article:
                </span>
                <Link
                  href={`/${c.article?.category?.slug || "news"}/${c.article?.slug}`}
                  target="_blank"
                  className="font-serif font-bold text-black dark:text-white hover:text-red-600 flex items-center gap-1.5"
                >
                  <span>{c.article?.title}</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </Link>
              </div>

              {/* Comment Content */}
              <div className="p-4 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-sans text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                "{c.content}"
              </div>

              {/* Editorial Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {c.status !== "APPROVED" && (
                  <button
                    onClick={() => handleModerate(c.id, "APPROVED")}
                    disabled={actionLoading === c.id}
                    className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {c.status !== "REJECTED" && (
                  <button
                    onClick={() => handleModerate(c.id, "REJECTED")}
                    disabled={actionLoading === c.id}
                    className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                {c.status !== "SPAM" && (
                  <button
                    onClick={() => handleModerate(c.id, "SPAM")}
                    disabled={actionLoading === c.id}
                    className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Mark Spam</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={actionLoading === c.id}
                  className="px-3.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-500 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 border border-red-900/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
