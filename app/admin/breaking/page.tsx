"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  Plus,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Flame,
  X,
  RefreshCw,
  Calendar,
  Layers,
  Pause,
  Play,
  Wifi,
} from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";

interface BreakingItem {
  id: string;
  title: string;
  description?: string | null;
  linkUrl?: string | null;
  linkedArticleId?: string | null;
  isLive: boolean;
  priority: "URGENT" | "HIGH" | "NORMAL" | string;
  status: "ACTIVE" | "PAUSED" | "EXPIRED" | string;
  isActive: boolean;
  startTime: string;
  expiresAt?: string | null;
  createdAt: string;
}

interface ArticleOption {
  id: string;
  title: string;
  slug: string;
  category: { slug: string };
}

export default function AdminBreakingPage() {
  const [items, setItems] = useState<BreakingItem[]>([]);
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PAUSED" | "ALL">("ACTIVE");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BreakingItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formLinkedArticleId, setFormLinkedArticleId] = useState("");
  const [formPriority, setFormPriority] = useState<"URGENT" | "HIGH" | "NORMAL">("URGENT");
  const [formIsLive, setFormIsLive] = useState(true);
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "PAUSED">("ACTIVE");
  const [formStartTime, setFormStartTime] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  // Real-time Connection Status Hook
  const { status: connectionStatus } = useRealtime({
    eventTypes: ["BREAKING_UPDATE"],
    onEvent: () => {
      fetchBreakingItems();
    },
  });

  useEffect(() => {
    fetchBreakingItems();
    fetchArticles();
  }, []);

  const fetchBreakingItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/breaking?admin=true");
      const data = await res.json();
      if (data.breaking) {
        setItems(data.breaking);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load breaking items", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles?limit=50&status=PUBLISHED");
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch {}
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormDescription("");
    setFormLinkUrl("");
    setFormLinkedArticleId("");
    setFormPriority("URGENT");
    setFormIsLive(true);
    setFormStatus("ACTIVE");
    setFormStartTime(new Date().toISOString().slice(0, 16));
    setFormExpiresAt("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BreakingItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description || "");
    setFormLinkUrl(item.linkUrl || "");
    setFormLinkedArticleId(item.linkedArticleId || "");
    setFormPriority((item.priority as any) || "URGENT");
    setFormIsLive(item.isLive);
    setFormStatus((item.status as any) || "ACTIVE");
    setFormStartTime(item.startTime ? new Date(item.startTime).toISOString().slice(0, 16) : "");
    setFormExpiresAt(item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 16) : "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setMessage({ text: "Headline title is required", type: "error" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        title: formTitle,
        description: formDescription || null,
        linkUrl: formLinkUrl || null,
        linkedArticleId: formLinkedArticleId || null,
        priority: formPriority,
        isLive: formIsLive,
        status: formStatus,
        isActive: formStatus === "ACTIVE",
        startTime: formStartTime ? new Date(formStartTime).toISOString() : new Date().toISOString(),
        expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
      };

      const url = editingItem ? `/api/breaking/${editingItem.id}` : "/api/breaking";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save breaking news");
      }

      setMessage({
        text: editingItem ? "Breaking item updated & broadcast." : "Breaking news published & broadcast live to public visitors!",
        type: "success",
      });
      setIsModalOpen(false);
      fetchBreakingItems();
    } catch (err: any) {
      setMessage({ text: err.message || "An error occurred", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: BreakingItem) => {
    try {
      const newStatus = item.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
      const res = await fetch(`/api/breaking/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          isActive: newStatus === "ACTIVE",
        }),
      });

      if (res.ok) {
        setMessage({
          text: `Breaking news ${newStatus === "ACTIVE" ? "resumed" : "paused"} and updated on public ticker.`,
          type: "success",
        });
        fetchBreakingItems();
      }
    } catch {
      setMessage({ text: "Failed to update status", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this breaking news alert?")) return;

    try {
      const res = await fetch(`/api/breaking/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ text: "Breaking alert removed from ticker.", type: "success" });
        fetchBreakingItems();
      }
    } catch {
      setMessage({ text: "Failed to delete breaking alert", type: "error" });
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "ACTIVE") return item.status === "ACTIVE";
    if (activeTab === "PAUSED") return item.status === "PAUSED";
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-mono font-bold uppercase rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              REAL-TIME DISPATCH
            </span>
            {/* Realtime Status Indicator */}
            <span
              className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                connectionStatus === "connected"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              ● {connectionStatus === "connected" ? "LIVE STREAM ACTIVE" : "RECONNECTING..."}
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-1">
            Breaking News Desk
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Manage instant breaking bulletins streamed live across website viewports
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Post Breaking Alert</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-2 text-xs font-mono ${
            message.type === "success"
              ? "bg-black text-white border-neutral-700"
              : "bg-red-950/20 border-red-800 text-red-500"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-2 border-b-2 font-bold transition ${
            activeTab === "ACTIVE"
              ? "border-black dark:border-white text-black dark:text-white"
              : "border-transparent text-neutral-400 hover:text-black dark:hover:text-white"
          }`}
        >
          ACTIVE ALERTS ({items.filter((i) => i.status === "ACTIVE").length})
        </button>
        <button
          onClick={() => setActiveTab("PAUSED")}
          className={`px-4 py-2 border-b-2 font-bold transition ${
            activeTab === "PAUSED"
              ? "border-black dark:border-white text-black dark:text-white"
              : "border-transparent text-neutral-400 hover:text-black dark:hover:text-white"
          }`}
        >
          PAUSED ({items.filter((i) => i.status === "PAUSED").length})
        </button>
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 border-b-2 font-bold transition ${
            activeTab === "ALL"
              ? "border-black dark:border-white text-black dark:text-white"
              : "border-transparent text-neutral-400 hover:text-black dark:hover:text-white"
          }`}
        >
          ALL BULLETINS ({items.length})
        </button>
      </div>

      {/* Breaking Items List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-neutral-400">
            Loading real-time breaking stream...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            No breaking bulletins in this category. Click &quot;Post Breaking Alert&quot; to publish.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                      item.priority === "URGENT"
                        ? "bg-red-600 text-white"
                        : item.priority === "HIGH"
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {item.priority}
                  </span>

                  <span
                    className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                      item.status === "ACTIVE"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    ● {item.status}
                  </span>

                  {item.isLive && (
                    <span className="text-[10px] text-red-600 font-mono font-bold">
                      ● LIVE DEVELOPING
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-base text-black dark:text-white">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs text-neutral-500 font-sans">
                    {item.description}
                  </p>
                )}

                {item.linkUrl && (
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-neutral-400 hover:text-black dark:hover:text-white hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{item.linkUrl}</span>
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(item)}
                  className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-mono font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title={item.status === "ACTIVE" ? "Pause Alert" : "Resume Alert"}
                >
                  {item.status === "ACTIVE" ? (
                    <Pause className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Play className="w-4 h-4 text-green-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-mono font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title="Edit Alert"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl border border-red-900/30 text-red-600 hover:bg-red-950/20 transition"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-serif font-bold text-base text-black dark:text-white">
                {editingItem ? "Edit Breaking Alert" : "Publish Breaking Alert"}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Major Geopolitical Accord Signed at Geneva Summit"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-sans text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Short Context Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Key briefing point explaining the breaking development..."
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-sans focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase font-bold focus:outline-none"
                  >
                    <option value="URGENT">URGENT (RED BADGE)</option>
                    <option value="HIGH">HIGH PRIORITY</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                    Delivery Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase font-bold focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (STREAMING)</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Link to Existing Article (Optional)
                </label>
                <select
                  value={formLinkedArticleId}
                  onChange={(e) => {
                    setFormLinkedArticleId(e.target.value);
                    const sel = articles.find((a) => a.id === e.target.value);
                    if (sel) {
                      setFormLinkUrl(`/${sel.category.slug}/${sel.slug}`);
                    }
                  }}
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-sans text-xs focus:outline-none"
                >
                  <option value="">-- Or enter custom link below --</option>
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Custom Destination URL
                </label>
                <input
                  type="text"
                  placeholder="/technology/my-article or https://..."
                  value={formLinkUrl}
                  onChange={(e) => setFormLinkUrl(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition disabled:opacity-50"
                >
                  {saving ? "Broadcasting..." : editingItem ? "Update Alert" : "Publish Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
