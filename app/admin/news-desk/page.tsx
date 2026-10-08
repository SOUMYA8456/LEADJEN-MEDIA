"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Radio,
  Eye,
  Plus,
  Search,
  Filter,
  Send,
  Calendar,
  Layers,
  Edit,
  Trash2,
  Check,
  X,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronDown,
  TrendingUp,
  RefreshCw,
  Bell,
  Archive,
  ArrowRight,
  Shield,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  slug: string;
  avatar?: string | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  reviewFeedback?: string | null;
  createdById?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  isFeatured: boolean;
  isBreaking: boolean;
  isTrending: boolean;
  readingTime: number;
  viewCount: number;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
  createdAt: string;
  category: Category;
  author: Author;
}

interface BreakingItem {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | string;
  isLive: boolean;
  isActive: boolean;
  linkUrl?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

interface Stats {
  totalArticles: number;
  drafts: number;
  inReview: number;
  approved: number;
  scheduled: number;
  publishedToday: number;
  activeBreaking: number;
  totalViews: number;
}

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "EDITOR" | "REPORTER";
}

export default function NewsDeskPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    drafts: 0,
    inReview: 0,
    approved: 0,
    scheduled: 0,
    publishedToday: 0,
    activeBreaking: 0,
    totalViews: 0,
  });
  const [breakingNews, setBreakingNews] = useState<BreakingItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Review Drawer / Modal State
  const [reviewArticle, setReviewArticle] = useState<Article | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [reviewActionLoading, setReviewActionLoading] = useState<boolean>(false);
  const [scheduleDateTime, setScheduleDateTime] = useState<string>("");
  const [showScheduleInput, setShowScheduleInput] = useState<boolean>(false);

  // Delete Article Modal State
  const [deleteModalArticle, setDeleteModalArticle] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Quick Breaking Modal
  const [isQuickBreakingOpen, setIsQuickBreakingOpen] = useState(false);
  const [newBreakingTitle, setNewBreakingTitle] = useState("");
  const [newBreakingPriority, setNewBreakingPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [newBreakingExpiryHours, setNewBreakingExpiryHours] = useState<number>(4);

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const fetchSessionAndData = async () => {
    try {
      setLoading(true);
      const [authRes, statsRes, catRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/news-desk/stats"),
        fetch("/api/categories"),
      ]);

      const authData = await authRes.json();
      if (authData.user) {
        setSession(authData.user);
      }

      const statsData = await statsRes.json();
      if (statsData.stats) setStats(statsData.stats);
      if (statsData.activeBreaking) setBreakingNews(statsData.activeBreaking);

      const catData = await catRes.json();
      if (catData.categories) setCategories(catData.categories);

      await fetchArticles("ALL", "all", "all", "");
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load News Desk data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (status: string, cat: string, auth: string, query: string) => {
    try {
      let url = `/api/articles?limit=100`;
      if (status !== "ALL") url += `&status=${status}`;
      else url += `&status=ALL`;
      if (cat !== "all") url += `&category=${cat}`;
      if (auth !== "all") url += `&author=${auth}`;
      if (query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchArticles(tab, selectedCategory, selectedAuthor, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles(activeTab, selectedCategory, selectedAuthor, searchQuery);
  };

  // Review Actions
  const handleOpenReview = (art: Article) => {
    setReviewArticle(art);
    setFeedbackText(art.reviewFeedback || "");
    setShowScheduleInput(false);
    setScheduleDateTime(
      art.scheduledAt ? new Date(art.scheduledAt).toISOString().slice(0, 16) : ""
    );
  };

  const handleRequestChanges = async () => {
    if (!reviewArticle) return;
    if (!feedbackText.trim()) {
      alert("Please provide editorial feedback explaining the changes required.");
      return;
    }
    try {
      setReviewActionLoading(true);
      const res = await fetch(`/api/articles/${reviewArticle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DRAFT",
          reviewFeedback: feedbackText.trim(),
        }),
      });
      if (res.ok) {
        setMessage({
          text: `Changes requested on "${reviewArticle.title}". Returned to reporter draft queue.`,
          type: "success",
        });
        setReviewArticle(null);
        fetchSessionAndData();
      } else {
        const d = await res.json();
        setMessage({ text: d.error || "Failed to request changes", type: "error" });
      }
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleApproveArticle = async () => {
    if (!reviewArticle) return;
    try {
      setReviewActionLoading(true);
      const res = await fetch(`/api/articles/${reviewArticle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          reviewFeedback: null,
        }),
      });
      if (res.ok) {
        setMessage({
          text: `✓ Article "${reviewArticle.title}" has been APPROVED by the desk.`,
          type: "success",
        });
        setReviewArticle(null);
        fetchSessionAndData();
      } else {
        const d = await res.json();
        setMessage({ text: d.error || "Failed to approve article", type: "error" });
      }
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handlePublishNow = async () => {
    if (!reviewArticle) return;
    if (!confirm(`Publish "${reviewArticle.title}" live immediately to the public website?`)) return;
    try {
      setReviewActionLoading(true);
      const res = await fetch(`/api/articles/${reviewArticle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PUBLISHED",
          publishedAt: new Date(),
        }),
      });
      if (res.ok) {
        setMessage({
          text: `🎉 Article "${reviewArticle.title}" is now PUBLISHED live!`,
          type: "success",
        });
        setReviewArticle(null);
        fetchSessionAndData();
      } else {
        const d = await res.json();
        setMessage({ text: d.error || "Failed to publish article", type: "error" });
      }
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleScheduleArticle = async () => {
    if (!reviewArticle || !scheduleDateTime) {
      alert("Please select a valid scheduled date & time.");
      return;
    }
    const targetDate = new Date(scheduleDateTime);
    if (isNaN(targetDate.getTime())) {
      alert("Invalid date/time format.");
      return;
    }
    try {
      setReviewActionLoading(true);
      const res = await fetch(`/api/articles/${reviewArticle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SCHEDULED",
          scheduledAt: targetDate.toISOString(),
        }),
      });
      if (res.ok) {
        setMessage({
          text: `📅 Article "${reviewArticle.title}" scheduled for publication at ${targetDate.toLocaleString("en-IN")} IST`,
          type: "success",
        });
        setReviewArticle(null);
        fetchSessionAndData();
      } else {
        const d = await res.json();
        setMessage({ text: d.error || "Failed to schedule article", type: "error" });
      }
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleDirectSubmitForReview = async (art: Article) => {
    try {
      const res = await fetch(`/api/articles/${art.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_REVIEW" }),
      });
      if (res.ok) {
        setMessage({
          text: `Article "${art.title}" submitted to the editorial review queue.`,
          type: "success",
        });
        fetchSessionAndData();
      }
    } catch {}
  };

  // Delete Article Action
  const handleConfirmDelete = async () => {
    if (!deleteModalArticle) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/articles/${deleteModalArticle.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const deletedTitle = deleteModalArticle.title;
        setArticles((prev) => prev.filter((a) => a.id !== deleteModalArticle.id));
        setStats((prev) => ({
          ...prev,
          totalArticles: Math.max(0, prev.totalArticles - 1),
          drafts: deleteModalArticle.status === "DRAFT" ? Math.max(0, prev.drafts - 1) : prev.drafts,
          inReview: deleteModalArticle.status === "IN_REVIEW" ? Math.max(0, prev.inReview - 1) : prev.inReview,
          approved: deleteModalArticle.status === "APPROVED" ? Math.max(0, prev.approved - 1) : prev.approved,
          scheduled: deleteModalArticle.status === "SCHEDULED" ? Math.max(0, prev.scheduled - 1) : prev.scheduled,
        }));

        if (reviewArticle?.id === deleteModalArticle.id) {
          setReviewArticle(null);
        }

        setDeleteModalArticle(null);
        setMessage({
          text: `✓ Article "${deletedTitle}" was permanently deleted.`,
          type: "success",
        });
      } else {
        const err = await res.json();
        setMessage({
          text: err.error || "Failed to delete article",
          type: "error",
        });
      }
    } catch (e: any) {
      console.error("Delete article failed:", e);
      setMessage({
        text: "An error occurred while deleting the article.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateQuickBreaking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBreakingTitle.trim()) return;
    try {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + newBreakingExpiryHours);

      const res = await fetch("/api/breaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBreakingTitle.trim(),
          priority: newBreakingPriority,
          isLive: true,
          isActive: true,
          expiresAt: expiry.toISOString(),
        }),
      });
      if (res.ok) {
        setMessage({ text: `🔴 Breaking News published to live ticker.`, type: "success" });
        setNewBreakingTitle("");
        setIsQuickBreakingOpen(false);
        fetchSessionAndData();
      } else {
        const d = await res.json();
        setMessage({ text: d.error || "Failed to create breaking news", type: "error" });
      }
    } catch {
      setMessage({ text: "Error publishing breaking news", type: "error" });
    }
  };

  const isEditorOrAdmin = session?.role === "EDITOR" || session?.role === "SUPER_ADMIN";

  return (
    <div className="w-full max-w-[1720px] mx-auto px-1 sm:px-4 lg:px-6 pb-20 space-y-5">
      {/* Top Header & Newsroom Identity Bar */}
      <div className="bg-black border border-neutral-800 rounded-2xl p-4 sm:p-6 text-white shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span className="p-2 bg-red-600/20 text-red-500 rounded-xl flex-shrink-0">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </span>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold block">
                LEADJEN MEDIA NEWSROOM
              </span>
              <h1 className="font-serif font-black text-xl sm:text-2xl md:text-3xl text-white tracking-tight truncate">
                EDITORIAL NEWS DESK
              </h1>
            </div>
            <span className="px-2.5 py-0.5 bg-neutral-900 text-neutral-300 text-[10px] sm:text-[11px] font-mono font-bold rounded-full border border-neutral-700 flex items-center gap-1.5 ml-auto sm:ml-2">
              <Shield className="w-3 h-3 text-red-500" />
              {session?.role || "EDITORIAL"}
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-sans mt-2 max-w-2xl hidden sm:block">
            Real-time daily editorial operations: review reporter submissions, approve investigative stories, schedule wire updates, manage urgent breaking alerts, and monitor publication queues.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Link
            href="/admin/articles/create"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md shadow-red-950 font-sans whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </Link>

          {isEditorOrAdmin && (
            <>
              <button
                type="button"
                onClick={() => setIsQuickBreakingOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-red-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition border border-neutral-800 font-sans whitespace-nowrap"
              >
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>Breaking</span>
              </button>

              <Link
                href="/admin/editorial-calendar"
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition border border-neutral-800"
                title="Editorial Calendar"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">Calendar</span>
              </Link>

              <Link
                href="/admin/homepage"
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition border border-neutral-800"
                title="Homepage Builder"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden md:inline">Homepage</span>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={fetchSessionAndData}
            className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 transition"
            title="Refresh News Desk"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notifications Message */}
      {message && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-mono font-bold ${
            message.type === "success"
              ? "bg-black text-white border border-neutral-700"
              : "bg-red-950 text-red-300 border border-red-800"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span className="truncate">{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="hover:text-white ml-2 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. NEWS DESK SUMMARY METRIC CARDS (8 CARDS)                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
        {[
          { label: "TOTAL ARTICLES", value: stats.totalArticles, tab: "ALL", alert: false },
          { label: "DRAFTS", value: stats.drafts, tab: "DRAFT", alert: false },
          { label: "IN REVIEW", value: stats.inReview, tab: "IN_REVIEW", alert: stats.inReview > 0 },
          { label: "APPROVED", value: stats.approved, tab: "APPROVED", alert: false },
          { label: "SCHEDULED", value: stats.scheduled, tab: "SCHEDULED", alert: false },
          { label: "PUBLISHED TODAY", value: stats.publishedToday, tab: "PUBLISHED", alert: false },
          { label: "BREAKING NEWS", value: stats.activeBreaking, tab: null, alert: stats.activeBreaking > 0 },
          { label: "TOTAL VIEWS", value: stats.totalViews.toLocaleString(), tab: null, alert: false },
        ].map((card, i) => (
          <div
            key={i}
            onClick={() => card.tab && handleTabChange(card.tab)}
            className={`p-3 rounded-xl border transition flex flex-col justify-between ${
              card.tab ? "cursor-pointer hover:border-black dark:hover:border-neutral-500" : ""
            } ${
              card.alert
                ? "bg-red-950/20 border-red-600/60 dark:bg-red-950/40"
                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-[9px] font-bold text-neutral-500 uppercase truncate">
                {card.label}
              </span>
              {card.alert && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse flex-shrink-0"></span>}
            </div>
            <div
              className={`text-lg sm:text-2xl font-serif font-black mt-2 truncate ${
                card.alert
                  ? "text-red-600 dark:text-red-500"
                  : "text-neutral-900 dark:text-white"
              }`}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 2. URGENT / BREAKING LIVE ALERT STRIP                                     */}
      {/* ========================================================================= */}
      <div className="bg-black text-white rounded-xl p-3 sm:p-4 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[10px] font-bold uppercase rounded flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            BREAKING
          </span>
          {breakingNews.length > 0 ? (
            <div className="text-xs font-sans truncate text-neutral-200">
              <span className="font-bold text-white uppercase mr-1">
                [{breakingNews[0].priority}]
              </span>
              {breakingNews[0].title}
            </div>
          ) : (
            <span className="text-xs text-neutral-400 font-sans italic">
              No active breaking bulletins at this moment.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isEditorOrAdmin && (
            <Link
              href="/admin/breaking"
              className="text-[11px] font-mono font-bold uppercase text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
            >
              <span>Manage ({breakingNews.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EDITORIAL QUEUE & FILTER CONTROLS                                      */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 sm:p-6 space-y-4 sm:space-y-5 shadow-xs">
        {/* Editorial Pipeline Status Tabs */}
        <div className="flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
          {[
            { id: "ALL", label: "ALL STORIES", count: stats.totalArticles },
            { id: "DRAFT", label: "DRAFT", count: stats.drafts },
            { id: "IN_REVIEW", label: "IN REVIEW", count: stats.inReview, urgent: stats.inReview > 0 },
            { id: "APPROVED", label: "APPROVED", count: stats.approved },
            { id: "SCHEDULED", label: "SCHEDULED", count: stats.scheduled },
            { id: "PUBLISHED", label: "PUBLISHED", count: Math.max(0, stats.totalArticles - stats.drafts - stats.inReview - stats.approved - stats.scheduled) },
            { id: "ARCHIVED", label: "ARCHIVED", count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  tab.urgent
                    ? "bg-red-600 text-white font-bold"
                    : activeTab === tab.id
                    ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Bar (Category, Search, Submit) */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by headline, slug, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-sans"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                fetchArticles(activeTab, e.target.value, selectedAuthor, searchQuery);
              }}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase focus:outline-none"
            >
              <option value="all">ALL CATEGORIES</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Search Submit Button */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition text-center"
            >
              Filter
            </button>
            {(searchQuery || selectedCategory !== "all" || selectedAuthor !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedAuthor("all");
                  fetchArticles(activeTab, "all", "all", "");
                }}
                className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300 rounded-xl text-xs font-mono transition"
                title="Reset Filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* ========================================================================= */}
        {/* MOBILE CARD VIEW (< md screens)                                           */}
        {/* ========================================================================= */}
        <div className="block md:hidden space-y-3">
          {articles.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 italic bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
              No articles found in this queue.
            </div>
          ) : (
            articles.map((art) => {
              const statusBg =
                art.status === "PUBLISHED"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : art.status === "APPROVED"
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black font-bold"
                  : art.status === "IN_REVIEW"
                  ? "bg-red-600 text-white font-bold"
                  : art.status === "SCHEDULED"
                  ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";

              return (
                <div
                  key={art.id}
                  className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${statusBg}`}>
                          {art.status.replace("_", " ")}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                          {art.category?.name || "General"}
                        </span>
                        {art.isBreaking && (
                          <span className="text-red-600 text-[9px] font-mono font-bold uppercase">🔴 BREAKING</span>
                        )}
                      </div>

                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="font-serif font-bold text-sm text-black dark:text-white hover:text-red-600 dark:hover:text-red-500 block leading-snug pt-1"
                      >
                        {art.title}
                      </Link>
                    </div>

                    {art.featuredImage && (
                      <img
                        src={art.featuredImage}
                        alt=""
                        className="w-14 h-14 object-cover rounded-lg bg-neutral-200 flex-shrink-0"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-800">
                    <span>By {art.author?.name || "Desk"}</span>
                    <span>{art.readingTime}m read • {art.viewCount} views</span>
                  </div>

                  {art.reviewFeedback && art.status === "DRAFT" && (
                    <div className="p-2 bg-red-950/10 border border-red-600/30 rounded text-[11px] text-red-600 dark:text-red-400 font-mono">
                      Feedback: &quot;{art.reviewFeedback}&quot;
                    </div>
                  )}

                  {/* Mobile Actions Bar */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenReview(art)}
                      className="flex items-center justify-center gap-1 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-lg text-xs font-mono font-bold uppercase"
                      title="Review / Inspect"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>

                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="flex items-center justify-center gap-1 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-lg text-xs font-mono font-bold uppercase"
                      title="Edit Article"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    {art.status === "DRAFT" ? (
                      <button
                        type="button"
                        onClick={() => handleDirectSubmitForReview(art)}
                        className="flex items-center justify-center gap-1 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold uppercase"
                        title="Submit for Review"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit</span>
                      </button>
                    ) : (
                      <Link
                        href={`/${art.category?.slug}/${art.slug}`}
                        target="_blank"
                        className="flex items-center justify-center gap-1 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-xs font-mono uppercase"
                        title="View Live"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteModalArticle(art)}
                      className="flex items-center justify-center gap-1 py-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-xs font-mono font-bold uppercase hover:bg-red-600 hover:text-white transition"
                      title="Delete Article"
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

        {/* ========================================================================= */}
        {/* DESKTOP EDITORIAL QUEUE TABLE (>= md screens)                             */}
        {/* ========================================================================= */}
        <div className="hidden md:block overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400">
              <tr>
                <th className="p-3.5">Article Headline</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Updated</th>
                <th className="p-3.5">Published / Schedule</th>
                <th className="p-3.5 text-right">Desk Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400 italic">
                    No articles found in this queue.
                  </td>
                </tr>
              ) : (
                articles.map((art) => {
                  const statusBg =
                    art.status === "PUBLISHED"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : art.status === "APPROVED"
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black font-bold"
                      : art.status === "IN_REVIEW"
                      ? "bg-red-600 text-white font-bold"
                      : art.status === "SCHEDULED"
                      ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";

                  return (
                    <tr key={art.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/60 transition">
                      {/* Article Title & Badges */}
                      <td className="p-3.5 max-w-sm">
                        <div className="space-y-1">
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="font-serif font-bold text-sm text-black dark:text-white hover:text-red-600 dark:hover:text-red-500 line-clamp-2"
                          >
                            {art.title}
                          </Link>
                          {art.reviewFeedback && art.status === "DRAFT" && (
                            <div className="p-1.5 bg-red-950/10 border border-red-600/30 rounded text-[11px] text-red-600 dark:text-red-400 flex items-start gap-1 font-mono">
                              <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">Changes requested: &quot;{art.reviewFeedback}&quot;</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                            <span>{art.readingTime} min read</span>
                            <span>•</span>
                            <span>{art.viewCount} views</span>
                            {art.isBreaking && (
                              <span className="text-red-600 font-bold uppercase">🔴 Breaking</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="p-3.5 whitespace-nowrap text-neutral-700 dark:text-neutral-300 font-medium">
                        {art.author?.name || "Leadjen Desk"}
                      </td>

                      {/* Category */}
                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px] font-bold text-neutral-500 uppercase">
                        {art.category?.name || "General"}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold ${statusBg}`}>
                          {art.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Updated */}
                      <td className="p-3.5 whitespace-nowrap text-[11px] font-mono text-neutral-500">
                        {new Date(art.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Published / Schedule */}
                      <td className="p-3.5 whitespace-nowrap text-[11px] font-mono text-neutral-500">
                        {art.status === "PUBLISHED" && art.publishedAt ? (
                          <span>{new Date(art.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        ) : art.status === "SCHEDULED" && art.scheduledAt ? (
                          <span className="text-neutral-900 dark:text-white font-bold">
                            🕒 {new Date(art.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 whitespace-nowrap text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(art)}
                          className="p-1.5 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                          title="Open Editorial Review / Inspection"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/admin/articles/${art.id}/edit`}
                          className="inline-block p-1.5 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                          title="Edit Article"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Quick Submit button for reporter if draft */}
                        {art.status === "DRAFT" && (
                          <button
                            type="button"
                            onClick={() => handleDirectSubmitForReview(art)}
                            className="px-2 py-1 bg-black hover:bg-neutral-800 text-white rounded text-[10px] font-mono font-bold uppercase transition"
                            title="Submit for Review"
                          >
                            Submit
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteModalArticle(art)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition"
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

      {/* ========================================================================= */}
      {/* 4. EDITORIAL ARTICLE REVIEW & INSPECTION DRAWER / MODAL                   */}
      {/* ========================================================================= */}
      {reviewArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-4xl w-full p-4 sm:p-6 space-y-5 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-bold uppercase rounded">
                  {reviewArticle.status.replace("_", " ")}
                </span>
                <span className="font-mono text-xs text-neutral-500 uppercase">
                  {reviewArticle.category?.name} • {reviewArticle.author?.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReviewArticle(null)}
                className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Article Content Inspection */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="font-serif font-black text-xl sm:text-2xl text-black dark:text-white leading-tight">
                {reviewArticle.title}
              </h2>
              {reviewArticle.subtitle && (
                <p className="font-serif text-sm text-neutral-600 dark:text-neutral-400 italic">
                  {reviewArticle.subtitle}
                </p>
              )}

              {/* Excerpt Box */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border-l-4 border-black dark:border-white rounded text-xs text-neutral-700 dark:text-neutral-300 font-sans">
                <strong>Excerpt:</strong> {reviewArticle.excerpt}
              </div>

              {/* Article Full Text Preview */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 max-h-60 overflow-y-auto text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap font-serif leading-relaxed">
                {reviewArticle.content}
              </div>

              {reviewArticle.featuredImage && (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <img
                    src={reviewArticle.featuredImage}
                    alt="Lead Image"
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="text-[11px] font-mono text-neutral-500 truncate">
                    Lead Image: <span className="text-black dark:text-white">{reviewArticle.featuredImage}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback / Changes Input */}
            <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                Editorial Review Feedback / Revision Notes
              </label>
              <textarea
                rows={2}
                placeholder="Write specific feedback if returning to reporter for revision..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-3 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-sans"
              />
            </div>

            {/* Schedule Input Box if active */}
            {showScheduleInput && (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 font-mono">
                <div className="text-xs font-bold text-black dark:text-white uppercase flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>Select Publication Date & Time (IST)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={scheduleDateTime}
                    onChange={(e) => setScheduleDateTime(e.target.value)}
                    className="flex-1 p-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-black dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleScheduleArticle}
                    disabled={reviewActionLoading}
                    className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded text-xs font-bold uppercase"
                  >
                    Confirm Schedule
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/articles/${reviewArticle.id}/edit`}
                  className="px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Full Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalArticle(reviewArticle);
                  }}
                  className="px-3.5 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Article</span>
                </button>
              </div>

              {isEditorOrAdmin && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRequestChanges}
                    disabled={reviewActionLoading}
                    className="px-3.5 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-mono font-bold uppercase transition"
                  >
                    Request Changes
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveArticle}
                    disabled={reviewActionLoading}
                    className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold uppercase transition border border-neutral-700"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowScheduleInput((prev) => !prev)}
                    className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-xl text-xs font-mono font-bold uppercase transition border border-neutral-700"
                  >
                    Schedule...
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishNow}
                    disabled={reviewActionLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase transition shadow-md shadow-red-950"
                  >
                    Publish Live
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
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
              <p>
                Are you sure you want to permanently delete the following article?
              </p>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="font-serif font-bold text-black dark:text-white line-clamp-2">
                  &ldquo;{deleteModalArticle.title}&rdquo;
                </p>
                <p className="text-[10px] font-mono text-neutral-400 mt-1 uppercase">
                  {deleteModalArticle.category?.name} • By {deleteModalArticle.author?.name} • Status: {deleteModalArticle.status}
                </p>
              </div>
              <p className="text-[11px] text-red-600 dark:text-red-400 font-mono">
                ⚠️ This will permanently remove the article from the website, newsfeeds, and archives.
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
                onClick={handleConfirmDelete}
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

      {/* ========================================================================= */}
      {/* 6. QUICK BREAKING NEWS MODAL                                              */}
      {/* ========================================================================= */}
      {isQuickBreakingOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <h3 className="font-serif font-black text-lg text-black dark:text-white">
                  Publish Urgent Breaking Bulletin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickBreakingOpen(false)}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickBreaking} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                  Breaking Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Major Diplomatic Accord Signed at Global Climate Summit"
                  value={newBreakingTitle}
                  onChange={(e) => setNewBreakingTitle(e.target.value)}
                  className="w-full p-3 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white focus:outline-none focus:border-red-600 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Urgency Priority
                  </label>
                  <select
                    value={newBreakingPriority}
                    onChange={(e: any) => setNewBreakingPriority(e.target.value)}
                    className="w-full p-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase"
                  >
                    <option value="HIGH">🔴 URGENT / HIGH</option>
                    <option value="MEDIUM">🟡 MEDIUM</option>
                    <option value="LOW">⚪ NORMAL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Expiry Hours
                  </label>
                  <select
                    value={newBreakingExpiryHours}
                    onChange={(e) => setNewBreakingExpiryHours(Number(e.target.value))}
                    className="w-full p-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase"
                  >
                    <option value={2}>2 Hours</option>
                    <option value={4}>4 Hours</option>
                    <option value={8}>8 Hours</option>
                    <option value={24}>24 Hours</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsQuickBreakingOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-md shadow-red-950"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Push to Live Ticker</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
