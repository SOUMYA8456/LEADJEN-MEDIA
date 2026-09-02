"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Shield,
  Bookmark,
  MessageSquare,
  Heart,
  Ban,
  CheckCircle,
  AlertCircle,
  Calendar,
  Lock,
} from "lucide-react";
import { formatTimeAgo, formatArticleDate } from "@/lib/utils";

export default function AdminReadersPage() {
  const [readers, setReaders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, active: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReaders();
  }, [search, statusFilter]);

  const fetchReaders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/readers?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setReaders(data.readers || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to load readers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (readerId: string, currentStatus: string) => {
    const action = currentStatus === "ACTIVE" ? "SUSPEND" : "REACTIVATE";
    const promptText =
      action === "SUSPEND"
        ? "Are you sure you want to suspend this reader account?"
        : "Reactivate this reader account?";
    if (!confirm(promptText)) return;

    try {
      setActionLoading(readerId);
      const res = await fetch("/api/admin/readers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readerId, action }),
      });

      if (res.ok) {
        fetchReaders();
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
              AUDIENCE MANAGEMENT
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Registered Public Readers
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-1">
            Reader Community Directory
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search readers by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 text-black dark:text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
            Total Readers
          </span>
          <div className="text-2xl font-serif font-black text-black dark:text-white mt-1">
            {stats.total || 0}
          </div>
          <span className="text-[10px] font-mono text-neutral-500">Registered member accounts</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
            Active Accounts
          </span>
          <div className="text-2xl font-serif font-black text-black dark:text-white mt-1">
            {stats.active || 0}
          </div>
          <span className="text-[10px] font-mono text-neutral-500">In good standing</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
            Suspended
          </span>
          <div className="text-2xl font-serif font-black text-red-600 mt-1">
            {stats.suspended || 0}
          </div>
          <span className="text-[10px] font-mono text-neutral-500">Restricted access</span>
        </div>
      </div>

      {/* Reader Directory Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 uppercase text-[10px] border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-bold">Reader</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold text-center">Saved Stories</th>
                <th className="px-6 py-4 font-bold text-center">Comments</th>
                <th className="px-6 py-4 font-bold text-center">Following</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                    Loading readers directory...
                  </td>
                </tr>
              ) : readers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-neutral-400">
                    No reader accounts found.
                  </td>
                </tr>
              ) : (
                readers.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs font-serif overflow-hidden">
                          {r.avatar ? (
                            <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                          ) : (
                            r.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="font-serif font-bold text-sm text-black dark:text-white block">
                            {r.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 block">{r.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-black dark:text-white">
                      {r._count?.bookmarks || 0}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-black dark:text-white">
                      {r._count?.comments || 0}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-black dark:text-white">
                      {r._count?.categoryFollows || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === "ACTIVE"
                            ? "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(r.id, r.status)}
                        disabled={actionLoading === r.id}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                          r.status === "ACTIVE"
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-red-950/20 hover:text-red-600"
                            : "bg-black text-white dark:bg-white dark:text-black"
                        }`}
                      >
                        {r.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                      </button>
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
