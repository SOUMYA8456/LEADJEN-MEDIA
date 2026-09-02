"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  User,
  Shield,
  Filter,
  RefreshCw,
  Search,
  CheckCircle,
  ArrowRight,
  Radio,
  Layers,
  Sparkles,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityTitle?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  details?: string | null;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchLogs(1, actionFilter, entityFilter);
  }, []);

  const fetchLogs = async (p: number, action: string, entity: string) => {
    try {
      setLoading(true);
      let url = `/api/audit-logs?page=${p}&limit=50`;
      if (action !== "ALL") url += `&action=${action}`;
      if (entity !== "ALL") url += `&entityType=${entity}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (act: string, ent: string) => {
    setActionFilter(act);
    setEntityFilter(ent);
    fetchLogs(1, act, ent);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-black text-white p-6 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-red-600/20 text-red-500 rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold block">
                EDITORIAL INTEGRITY & COMPLIANCE
              </span>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
                EDITORIAL AUDIT LOGS
              </h1>
            </div>
          </div>
          <p className="text-xs text-neutral-400 font-sans mt-2">
            Chronological audit trail of all editorial actions, reporter submissions, review decisions, schedule updates, and live publications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs(page, actionFilter, entityFilter)}
          className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-800 self-start sm:self-center"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">
            Action Type
          </label>
          <select
            value={actionFilter}
            onChange={(e) => handleFilterChange(e.target.value, entityFilter)}
            className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase focus:outline-none"
          >
            <option value="ALL">ALL ACTIONS</option>
            <option value="ARTICLE_CREATED">ARTICLE CREATED</option>
            <option value="ARTICLE_SUBMITTED">ARTICLE SUBMITTED</option>
            <option value="CHANGES_REQUESTED">CHANGES REQUESTED</option>
            <option value="ARTICLE_APPROVED">ARTICLE APPROVED</option>
            <option value="ARTICLE_SCHEDULED">ARTICLE SCHEDULED</option>
            <option value="ARTICLE_PUBLISHED">ARTICLE PUBLISHED</option>
            <option value="ARTICLE_DELETED">ARTICLE DELETED</option>
            <option value="BREAKING_CREATED">BREAKING CREATED</option>
            <option value="BREAKING_UPDATED">BREAKING UPDATED</option>
            <option value="BREAKING_DELETED">BREAKING DELETED</option>
            <option value="HOMEPAGE_PUBLISHED">HOMEPAGE PUBLISHED</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">
            Entity Type
          </label>
          <select
            value={entityFilter}
            onChange={(e) => handleFilterChange(actionFilter, e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase focus:outline-none"
          >
            <option value="ALL">ALL ENTITIES</option>
            <option value="ARTICLE">ARTICLE</option>
            <option value="BREAKING_NEWS">BREAKING NEWS</option>
            <option value="HOMEPAGE">HOMEPAGE</option>
            <option value="NAVIGATION">NAVIGATION</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400">
              <tr>
                <th className="p-3.5">Timestamp (IST)</th>
                <th className="p-3.5">Editorial User</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity / Target</th>
                <th className="p-3.5">Status Transition</th>
                <th className="p-3.5">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400 font-mono italic">
                    No audit records matching this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actionBadge =
                    log.action.includes("PUBLISHED")
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                      : log.action.includes("APPROVED")
                      ? "bg-neutral-900 text-white dark:bg-neutral-200 dark:text-black font-bold"
                      : log.action.includes("REQUESTED")
                      ? "bg-red-600 text-white font-bold"
                      : log.action.includes("SUBMITTED")
                      ? "bg-red-950 text-red-300 border border-red-800"
                      : "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300";

                  return (
                    <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950 transition font-mono">
                      {/* Timestamp */}
                      <td className="p-3.5 whitespace-nowrap text-[11px] text-neutral-500">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      {/* User */}
                      <td className="p-3.5 whitespace-nowrap font-sans font-medium text-black dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{log.userName || "System"}</span>
                          {log.userRole && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                              {log.userRole}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${actionBadge}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="p-3.5 max-w-xs truncate font-sans text-neutral-800 dark:text-neutral-200">
                        <div className="truncate font-bold" title={log.entityTitle || ""}>
                          {log.entityTitle || log.entityId || "—"}
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono uppercase block">
                          {log.entityType}
                        </span>
                      </td>

                      {/* Status Transition */}
                      <td className="p-3.5 whitespace-nowrap text-[11px]">
                        {log.previousStatus || log.newStatus ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-400">{log.previousStatus || "NEW"}</span>
                            <ArrowRight className="w-3 h-3 text-neutral-400" />
                            <span className="font-bold text-black dark:text-white">
                              {log.newStatus || "—"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic">—</span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="p-3.5 max-w-xs text-[11px] font-sans text-neutral-600 dark:text-neutral-400 truncate">
                        {log.details || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between font-mono text-xs">
            <span className="text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => fetchLogs(page - 1, actionFilter, entityFilter)}
                className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => fetchLogs(page + 1, actionFilter, entityFilter)}
                className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
