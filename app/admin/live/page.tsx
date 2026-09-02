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
  Video,
  Image as ImageIcon,
  Play,
  Pause,
  StopCircle,
  X,
} from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";

interface LiveUpdateItem {
  id: string;
  coverageId?: string | null;
  title: string;
  content: string;
  authorName: string;
  isUrgent: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
  linkedArticleId?: string | null;
  timestamp?: string | null;
  createdAt: string;
}

interface LiveCoverageData {
  id: string;
  title: string;
  summary?: string | null;
  status: "UPCOMING" | "LIVE" | "PAUSED" | "ENDED" | string;
  category?: string | null;
  startedAt: string;
}

export default function AdminLivePage() {
  const [coverage, setCoverage] = useState<LiveCoverageData | null>(null);
  const [updates, setUpdates] = useState<LiveUpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Live Coverage Modal State
  const [coverageModalOpen, setCoverageModalOpen] = useState(false);
  const [coverageTitle, setCoverageTitle] = useState("");
  const [coverageSummary, setCoverageSummary] = useState("");
  const [coverageCategory, setCoverageCategory] = useState("Breaking News");
  const [coverageSaving, setCoverageSaving] = useState(false);

  // Live Update Modal State
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<LiveUpdateItem | null>(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateAuthor, setUpdateAuthor] = useState("Leadjen News Desk");
  const [updateIsUrgent, setUpdateIsUrgent] = useState(false);
  const [updateImageUrl, setUpdateImageUrl] = useState("");
  const [updateVideoUrl, setUpdateVideoUrl] = useState("");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [updateSaving, setUpdateSaving] = useState(false);

  // Real-time Connection Status Hook
  const { status: connectionStatus } = useRealtime({
    eventTypes: ["LIVE_UPDATE", "LIVE_COVERAGE_UPDATE"],
    onEvent: () => {
      fetchLiveDesk();
    },
  });

  useEffect(() => {
    fetchLiveDesk();
  }, []);

  const fetchLiveDesk = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/live");
      const data = await res.json();
      if (data.coverage !== undefined) setCoverage(data.coverage);
      if (data.liveUpdates) setUpdates(data.liveUpdates);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load live coverage data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStartCoverage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverageTitle.trim()) return;

    setCoverageSaving(true);
    try {
      const res = await fetch("/api/live/coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: coverageTitle,
          summary: coverageSummary,
          category: coverageCategory,
          status: "LIVE",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start live coverage");

      setCoverage(data.coverage);
      setCoverageModalOpen(false);
      setMessage({ text: "Live coverage initiated and broadcast across portals!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setCoverageSaving(false);
    }
  };

  const handleUpdateCoverageStatus = async (newStatus: string) => {
    if (!coverage) return;
    try {
      const res = await fetch("/api/live/coverage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coverage.id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setMessage({ text: `Live coverage status updated to ${newStatus}.`, type: "success" });
        fetchLiveDesk();
      }
    } catch {
      setMessage({ text: "Failed to update coverage status", type: "error" });
    }
  };

  const handleOpenCreateUpdate = () => {
    setEditingUpdate(null);
    setUpdateTitle("");
    setUpdateContent("");
    setUpdateAuthor("Leadjen News Desk");
    setUpdateIsUrgent(false);
    setUpdateImageUrl("");
    setUpdateVideoUrl("");
    setUpdateModalOpen(true);
  };

  const handleOpenEditUpdate = (up: LiveUpdateItem) => {
    setEditingUpdate(up);
    setUpdateTitle(up.title);
    setUpdateContent(up.content);
    setUpdateAuthor(up.authorName);
    setUpdateIsUrgent(up.isUrgent);
    setUpdateImageUrl(up.imageUrl || "");
    setUpdateVideoUrl(up.videoUrl || "");
    setUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim()) {
      setMessage({ text: "Title and content are required", type: "error" });
      return;
    }

    setUpdateSaving(true);
    setMessage(null);

    try {
      const payload = {
        coverageId: coverage?.id || null,
        title: updateTitle,
        content: updateContent,
        authorName: updateAuthor,
        isUrgent: updateIsUrgent,
        imageUrl: updateImageUrl || null,
        videoUrl: updateVideoUrl || null,
      };

      const url = editingUpdate ? `/api/live/${editingUpdate.id}` : "/api/live";
      const method = editingUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save update");

      setUpdateModalOpen(false);
      setMessage({
        text: editingUpdate ? "Live update edited & broadcast." : "Live micro-update published and broadcast to public visitors!",
        type: "success",
      });
      fetchLiveDesk();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setUpdateSaving(false);
    }
  };

  const handleDeleteUpdate = async (id: string) => {
    if (!confirm("Delete this live update?")) return;
    try {
      const res = await fetch(`/api/live/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ text: "Live update deleted from stream.", type: "success" });
        fetchLiveDesk();
      }
    } catch {
      setMessage({ text: "Failed to delete update", type: "error" });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-mono font-bold uppercase rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE NEWS WIRE
            </span>
            <span
              className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                connectionStatus === "connected"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              ● {connectionStatus === "connected" ? "REAL-TIME ENGINE ONLINE" : "RECONNECTING..."}
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-1">
            Live Updates Desk
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Coordinate ongoing developing coverage streamed live to `/live`
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!coverage || coverage.status === "ENDED" ? (
            <button
              type="button"
              onClick={() => {
                setCoverageTitle("");
                setCoverageSummary("");
                setCoverageModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
            >
              <Radio className="w-4 h-4 text-red-600" />
              <span>Start Live Coverage</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateUpdate}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post Live Dispatch</span>
            </button>
          )}
        </div>
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

      {/* Active Coverage Control Card */}
      {coverage && coverage.status !== "ENDED" && (
        <div className="p-6 bg-white dark:bg-neutral-900 border-2 border-red-600 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                ACTIVE LIVE STORY
              </span>
              <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-mono font-bold uppercase rounded">
                STATUS: {coverage.status}
              </span>
            </div>

            {/* Coverage Life-Cycle Controls */}
            <div className="flex items-center gap-2">
              {coverage.status === "LIVE" ? (
                <button
                  type="button"
                  onClick={() => handleUpdateCoverageStatus("PAUSED")}
                  className="flex items-center gap-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-lg text-xs font-mono font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Pause className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpdateCoverageStatus("LIVE")}
                  className="flex items-center gap-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-lg text-xs font-mono font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Play className="w-3.5 h-3.5 text-green-500" />
                  <span>Resume Live</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (confirm("End this live coverage?")) {
                    handleUpdateCoverageStatus("ENDED");
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white hover:bg-black rounded-lg text-xs font-mono font-bold uppercase"
              >
                <StopCircle className="w-3.5 h-3.5 text-red-500" />
                <span>Conclude Coverage</span>
              </button>
            </div>
          </div>

          <h2 className="font-serif font-black text-xl sm:text-2xl text-black dark:text-white">
            {coverage.title}
          </h2>
          {coverage.summary && (
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans">
              {coverage.summary}
            </p>
          )}
        </div>
      )}

      {/* Live Dispatches Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-serif font-black text-lg text-black dark:text-white">
            Live Stream Timeline ({updates.length} Updates)
          </h3>
          <button
            type="button"
            onClick={handleOpenCreateUpdate}
            className="flex items-center gap-1 text-xs font-mono font-bold text-red-600 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Update</span>
          </button>
        </div>

        {updates.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            No live updates posted yet. Click &quot;Post Live Dispatch&quot; to publish your first micro-update.
          </div>
        ) : (
          updates.map((up) => (
            <div
              key={up.id}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {up.timestamp || "LIVE"}
                  </span>
                  {up.isUrgent && (
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase rounded">
                      URGENT
                    </span>
                  )}
                  <span className="text-neutral-400">By {up.authorName}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditUpdate(up)}
                    className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUpdate(up.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-serif font-bold text-base text-black dark:text-white">
                {up.title}
              </h4>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed whitespace-pre-line">
                {up.content}
              </p>

              {up.imageUrl && (
                <img
                  src={up.imageUrl}
                  alt={up.title}
                  className="h-32 w-auto object-cover rounded-lg border border-neutral-200 dark:border-neutral-800"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Start Coverage Modal */}
      {coverageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-serif font-bold text-base text-black dark:text-white">
                Start Live Developing Story
              </span>
              <button
                type="button"
                onClick={() => setCoverageModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartCoverage} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Coverage Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budget 2026 Live: Parliamentary Session & Economic Analysis"
                  value={coverageTitle}
                  onChange={(e) => setCoverageTitle(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-sans text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Editorial Summary Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of the developing story..."
                  value={coverageSummary}
                  onChange={(e) => setCoverageSummary(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-sans focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCoverageModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={coverageSaving}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition"
                >
                  {coverageSaving ? "Starting..." : "Broadcast Live Coverage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post / Edit Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-serif font-bold text-base text-black dark:text-white">
                {editingUpdate ? "Edit Live Dispatch" : "Post Real-Time Dispatch"}
              </span>
              <button
                type="button"
                onClick={() => setUpdateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Update Title / Catchline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finance Ministry releases preliminary revenue figures"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-sans text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Dispatch Body Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Live verified report details..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-sans focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                    Author Byline
                  </label>
                  <input
                    type="text"
                    value={updateAuthor}
                    onChange={(e) => setUpdateAuthor(e.target.value)}
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updateIsUrgent}
                      onChange={(e) => setUpdateIsUrgent(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span className="text-[11px] font-bold uppercase text-red-600">
                      FLAG AS URGENT
                    </span>
                  </label>
                </div>
              </div>

              {/* Image Input + Media Library button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase text-neutral-500">
                    Dispatch Photo (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaModalOpen(true)}
                    className="text-[10px] font-mono text-neutral-400 hover:text-black dark:hover:text-white hover:underline inline-flex items-center gap-1"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Media Library</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="https://..."
                  value={updateImageUrl}
                  onChange={(e) => setUpdateImageUrl(e.target.value)}
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono text-xs focus:outline-none"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Video Dispatch Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://youtube.com/... or mp4"
                  value={updateVideoUrl}
                  onChange={(e) => setUpdateVideoUrl(e.target.value)}
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateSaving}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition"
                >
                  {updateSaving ? "Broadcasting..." : editingUpdate ? "Save Changes" : "Broadcast Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Library Selector Modal */}
      {mediaModalOpen && (
        <MediaLibraryModal
          isOpen={mediaModalOpen}
          onClose={() => setMediaModalOpen(false)}
          onSelect={(url) => {
            setUpdateImageUrl(url);
            setMediaModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
