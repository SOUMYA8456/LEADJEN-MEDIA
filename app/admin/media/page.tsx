"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Image as ImageIcon,
  Film,
  Headphones,
  Sliders,
  Clock,
  HardDrive,
  X,
  ExternalLink,
  Edit2,
  Save,
  Link as LinkIcon,
  AlertTriangle,
  Play,
  Star,
  Plus,
  RefreshCw,
  LayoutGrid,
  Radio,
  Bookmark,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";

interface MediaUsage {
  type: string;
  id: string;
  title: string;
  slug?: string;
  status?: string;
  field: string;
}

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  publicId?: string | null;
  mimeType?: string | null;
  size?: number | null;
  altText?: string | null;
  createdAt: string;
  usages?: MediaUsage[];
  usageCount?: number;
  inUse?: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  category: string;
  isFeatured?: boolean;
  publishedAt: string;
}

interface PodcastEpisode {
  id: string;
  title: string;
  series: string;
  duration: string;
  publishedAt: string;
  description: string;
  coverImage: string;
  category: string;
  host: string;
  audioUrl?: string;
}

interface ArticlePlacement {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  status: string;
  category?: { name: string; slug: string };
}

interface AdPlacement {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  isActive: boolean;
}

export default function MediaManagerPage() {
  // Navigation Desks
  const [activeDesk, setActiveDesk] = useState<
    "LIBRARY" | "EDITORIAL" | "VIDEOS" | "PODCASTS" | "BRANDING"
  >("LIBRARY");

  // Media Library state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [activeTypeTab, setActiveTypeTab] = useState<"ALL" | "IMAGES" | "VIDEOS" | "AUDIO">("ALL");
  const [usageFilter, setUsageFilter] = useState<"ALL" | "IN_USE" | "UNUSED">("ALL");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "name">("latest");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Selected item modal / drawer
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editingAlt, setEditingAlt] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const [altSavedSuccess, setAltSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Deletion Safeguard Warning modal
  const [deleteWarningModal, setDeleteWarningModal] = useState<{
    item: MediaItem;
    usages: MediaUsage[];
  } | null>(null);

  // Assignment Modal
  const [assignModal, setAssignModal] = useState<{
    media: MediaItem;
    targetType: "article" | "video" | "podcast" | "branding" | "photoGallery" | "advertisement";
  } | null>(null);
  const [assignTargetId, setAssignTargetId] = useState("");
  const [assignField, setAssignField] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Placements data
  const [placementsLoading, setPlacementsLoading] = useState(false);
  const [articles, setArticles] = useState<ArticlePlacement[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [ads, setAds] = useState<AdPlacement[]>([]);
  const [brandingLogo, setBrandingLogo] = useState<string | null>(null);

  // Video Desk Edit / Create Modal
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isNewVideoModalOpen, setIsNewVideoModalOpen] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: "",
    videoUrl: "",
    duration: "04:30",
    thumbnail: "",
    category: "Technology",
    isFeatured: false,
  });
  const [savingVideo, setSavingVideo] = useState(false);

  // Podcast Desk Edit Modal
  const [editingPodcast, setEditingPodcast] = useState<PodcastEpisode | null>(null);
  const [podcastForm, setPodcastForm] = useState({
    title: "",
    series: "",
    host: "",
    duration: "",
    category: "",
    coverImage: "",
    audioUrl: "",
    description: "",
  });
  const [savingPodcast, setSavingPodcast] = useState(false);

  // Fetch Media Library
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        type: activeTypeTab,
        usageStatus: usageFilter,
        sort: sortBy,
        limit: "80",
      });
      const res = await fetch(`/api/media?${query.toString()}`);
      const data = await res.json();
      if (data.media) setMediaList(data.media);
    } catch (err) {
      console.error("Fetch media error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Placements (Articles, Videos, Podcasts, Ads, Branding)
  const fetchPlacements = async () => {
    try {
      setPlacementsLoading(true);
      const res = await fetch("/api/media/placements");
      const data = await res.json();
      if (data.articles) setArticles(data.articles);
      if (data.videos) setVideos(data.videos);
      if (data.podcasts) setPodcasts(data.podcasts);
      if (data.advertisements) setAds(data.advertisements);
      if (data.branding) setBrandingLogo(data.branding.logoImage);
    } catch (err) {
      console.error("Fetch placements error:", err);
    } finally {
      setPlacementsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search, activeTypeTab, usageFilter, sortBy]);

  useEffect(() => {
    if (activeDesk !== "LIBRARY") {
      fetchPlacements();
    }
  }, [activeDesk]);

  // Upload handler with progress & validation
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(15);
    setErrorMessage(null);
    setSuccessMessage(null);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 12 : prev));
    }, 200);

    let uploadedCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          uploadedCount++;
        } else {
          setErrorMessage(data.error || "Upload failed. Please check file format and size.");
        }
      } catch (err) {
        setErrorMessage("Network error during file upload.");
      }
    }

    clearInterval(interval);
    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      if (uploadedCount > 0) {
        setSuccessMessage(`Successfully uploaded ${uploadedCount} asset(s).`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      fetchMedia();
    }, 400);
  };

  // Safe delete with reverse-reference check
  const handleDelete = async (item: MediaItem, force = false) => {
    if (item.usages && item.usages.length > 0 && !force) {
      setDeleteWarningModal({ item, usages: item.usages });
      return;
    }

    if (!force && !confirm(`Are you sure you want to permanently delete "${item.originalName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/media?id=${item.id}${force ? "&force=true" : ""}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMediaList(mediaList.filter((m) => m.id !== item.id));
        setSelectedIds(selectedIds.filter((id) => id !== item.id));
        if (selectedMedia?.id === item.id) setSelectedMedia(null);
        if (deleteWarningModal) setDeleteWarningModal(null);
        setSuccessMessage("Media asset permanently deleted.");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else if (data.requiresForce) {
        setDeleteWarningModal({ item, usages: data.blockedItems?.[0]?.usages || [] });
      } else {
        alert(data.error || "Delete failed.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Bulk delete unused items with safety check
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    // Check if any selected item is currently in use
    const selectedItems = mediaList.filter((m) => selectedIds.includes(m.id));
    const inUseItems = selectedItems.filter((m) => m.inUse);

    if (inUseItems.length > 0) {
      alert(
        `Cannot delete selected items. ${inUseItems.length} of the selected assets are currently in use by active articles or media slots. Please deselect them or replace their references first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} unused media assets?`)) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (res.ok) {
        setMediaList(mediaList.filter((m) => !selectedIds.includes(m.id)));
        setSelectedIds([]);
        setSuccessMessage(`Successfully deleted ${data.deletedCount || selectedIds.length} media assets.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(data.error || "Bulk delete failed.");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith("http") || url.startsWith("data:") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save Alt Description
  const handleSaveDetails = async () => {
    if (!selectedMedia) return;
    setSavingAlt(true);
    try {
      const res = await fetch(`/api/media/${selectedMedia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText: editingAlt }),
      });
      if (res.ok) {
        setSelectedMedia({ ...selectedMedia, altText: editingAlt });
        setMediaList(mediaList.map((m) => (m.id === selectedMedia.id ? { ...m, altText: editingAlt } : m)));
        setAltSavedSuccess(true);
        setTimeout(() => setAltSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Save media details error:", err);
    } finally {
      setSavingAlt(false);
    }
  };

  // Assign Media to target slot (Article, Video, Podcast, Branding, etc.)
  const handleAssignMedia = async () => {
    if (!assignModal || !assignTargetId) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/media/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: assignModal.media.url,
          targetType: assignModal.targetType,
          targetId: assignTargetId,
          field: assignField || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "Media successfully assigned!");
        setTimeout(() => setSuccessMessage(null), 4000);
        setAssignModal(null);
        setAssignTargetId("");
        fetchMedia();
        fetchPlacements();
      } else {
        alert(data.error || "Failed to assign media reference.");
      }
    } catch (err) {
      console.error("Assign media error:", err);
    } finally {
      setAssigning(false);
    }
  };

  // Save Video News (Update / Create)
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVideo(true);
    try {
      const isEdit = !!editingVideo;
      const url = isEdit ? `/api/videos/${editingVideo.id}` : "/api/videos";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoForm),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(isEdit ? "Video updated successfully!" : "Video created successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
        setEditingVideo(null);
        setIsNewVideoModalOpen(false);
        fetchPlacements();
      } else {
        alert(data.error || "Failed to save video.");
      }
    } catch (err) {
      console.error("Save video error:", err);
    } finally {
      setSavingVideo(false);
    }
  };

  // Save Podcast Episode
  const handleSavePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPodcast) return;
    setSavingPodcast(true);
    try {
      const res = await fetch("/api/podcasts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: editingPodcast.id,
          ...podcastForm,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Podcast episode updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
        setEditingPodcast(null);
        fetchPlacements();
      } else {
        alert(data.error || "Failed to update podcast.");
      }
    } catch (err) {
      console.error("Save podcast error:", err);
    } finally {
      setSavingPodcast(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans text-black dark:text-white">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg">
              <HardDrive className="w-4 h-4" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-neutral-500">
              EDITORIAL MULTIMEDIA COMMAND
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl tracking-tight">
            Media Manager &amp; Asset Library
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Production Media Management • Usage Tracking • Video Replacement • Podcast Audio • Revalidation
          </p>
        </div>

        {/* Global Upload Button */}
        <label className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-xs transition cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? `Uploading (${uploadProgress}%)` : "Upload Media Asset"}</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,audio/mpeg,audio/mp3,audio/wav,video/mp4"
            onChange={(e) => handleFilesUpload(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-800 text-emerald-400 text-xs font-mono rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
          <button type="button" onClick={() => setSuccessMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-950/20 border border-red-800 text-red-400 text-xs font-mono rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Desk Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-200 dark:border-neutral-800 pb-2 text-xs font-mono font-bold uppercase">
        <button
          type="button"
          onClick={() => setActiveDesk("LIBRARY")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeDesk === "LIBRARY"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-neutral-500 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Media Library ({mediaList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDesk("VIDEOS")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeDesk === "VIDEOS"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-neutral-500 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Featured &amp; Video News</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDesk("PODCASTS")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeDesk === "PODCASTS"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-neutral-500 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900"
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Podcasts &amp; Audio Briefs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDesk("EDITORIAL")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeDesk === "EDITORIAL"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-neutral-500 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Article &amp; Editorial Photos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDesk("BRANDING")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeDesk === "BRANDING"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-neutral-500 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900"
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Branding &amp; Banners</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* DESK 1: MEDIA LIBRARY (Search, Filter, Upload, Bulk Delete, Details)      */}
      {/* ========================================================================= */}
      {activeDesk === "LIBRARY" && (
        <div className="space-y-6">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFilesUpload(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragOver
                ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-800"
                : "border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="w-8 h-8 text-neutral-400" />
              <p className="text-sm font-serif font-bold">
                Drag &amp; drop photos, podcast audio, or videos here, or browse from computer
              </p>
              <p className="text-xs font-mono text-neutral-500">
                Supports Images (JPG, PNG, WEBP, GIF up to 10MB) • Audio Podcasts (MP3, WAV up to 50MB) • Videos (MP4 up to 100MB)
              </p>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-black dark:bg-white h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Search, Filter & Bulk Actions Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
            {/* Type Filter & Usage Status Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-mono font-bold uppercase">
                {(["ALL", "IMAGES", "VIDEOS", "AUDIO"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTypeTab(t)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeTypeTab === t
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "text-neutral-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-mono font-bold uppercase">
                {(["ALL", "IN_USE", "UNUSED"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUsageFilter(u)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      usageFilter === u
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "text-neutral-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {u.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Search, Sort, and Bulk Delete */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-60">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search filename or alt..."
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono focus:outline-hidden"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono uppercase focus:outline-hidden"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Sort by Name</option>
              </select>

              {/* Bulk Delete Button */}
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-xs transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Media Asset Grid */}
          {loading ? (
            <div className="text-center py-20 text-neutral-400 font-mono text-xs">
              Loading media library assets...
            </div>
          ) : mediaList.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-16 text-center text-neutral-400">
              <ImageIcon className="w-12 h-12 mx-auto stroke-1 mb-2" />
              <p className="font-serif text-lg text-black dark:text-white">No media assets found</p>
              <p className="text-xs mt-1 font-mono">Upload images, podcasts, or videos above to populate the library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {mediaList.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isAudio = item.mimeType?.startsWith("audio/");
                const isVideo = item.mimeType?.startsWith("video/");

                return (
                  <div
                    key={item.id}
                    className={`group relative bg-white dark:bg-neutral-900 rounded-xl border overflow-hidden shadow-xs transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-black dark:border-white ring-2 ring-black dark:ring-white"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                    }`}
                  >
                    {/* Media Thumbnail Viewport */}
                    <div
                      onClick={() => {
                        setSelectedMedia(item);
                        setEditingAlt(item.altText || "");
                        setAltSavedSuccess(false);
                      }}
                      className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-950 overflow-hidden"
                    >
                      {isAudio ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-neutral-400 bg-neutral-950">
                          <Headphones className="w-8 h-8 text-leadjen-500 mb-1" />
                          <span className="text-[10px] font-mono font-bold uppercase text-white truncate max-w-full">
                            PODCAST AUDIO
                          </span>
                        </div>
                      ) : isVideo ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-neutral-400 bg-neutral-950 relative">
                          <Film className="w-8 h-8 text-leadjen-500 mb-1" />
                          <span className="text-[10px] font-mono font-bold uppercase text-white truncate max-w-full">
                            VIDEO ASSET
                          </span>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.altText || item.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Usage Badge (Top Left) */}
                      <div className="absolute top-2 left-2">
                        {item.inUse ? (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-md bg-black/85 text-white dark:bg-white/95 dark:text-black backdrop-blur-xs shadow-xs">
                            {item.usageCount} In Use
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-md bg-neutral-900/60 text-neutral-300 backdrop-blur-xs">
                            Unused
                          </span>
                        )}
                      </div>

                      {/* Multi-select Checkbox (Top Right) */}
                      <div
                        className="absolute top-2 right-2 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            setSelectedIds(selectedIds.filter((id) => id !== item.id));
                          } else {
                            setSelectedIds([...selectedIds, item.id]);
                          }
                        }}
                      >
                        <button
                          type="button"
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                            isSelected
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-black/40 text-transparent hover:text-white"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-3">
                      <p className="text-xs font-bold truncate" title={item.originalName}>
                        {item.originalName}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-1">
                        <span>{item.size ? `${(item.size / 1024).toFixed(0)} KB` : "Asset"}</span>
                        <span>{formatTimeAgo(item.createdAt)}</span>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.url, item.id)}
                          className="flex items-center gap-1 text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-green-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setAssignModal({ media: item, targetType: "article" })}
                            className="p-1 text-neutral-500 hover:text-black dark:hover:text-white rounded text-[10px] font-mono font-bold"
                            title="Assign to Article or Placement"
                          >
                            Assign
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded transition"
                            title={item.inUse ? "Referenced media asset" : "Delete asset"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 2: FEATURED & VIDEO NEWS DESK                                        */}
      {/* ========================================================================= */}
      {activeDesk === "VIDEOS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div>
              <h2 className="font-serif font-black text-lg">Leadjen Video Journalism Desk</h2>
              <p className="text-xs font-mono text-neutral-500">
                Manage the primary featured video on the homepage VIDEO_BRIEF and all broadcast news reports.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setVideoForm({
                  title: "",
                  videoUrl: "",
                  duration: "04:30",
                  thumbnail: "",
                  category: "Technology",
                  isFeatured: true,
                });
                setIsNewVideoModalOpen(true);
              }}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add / Replace Video</span>
            </button>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid, idx) => (
              <div
                key={vid.id}
                className={`bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between ${
                  vid.isFeatured
                    ? "border-amber-500 ring-1 ring-amber-500/50"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <div>
                  <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </span>
                    </div>

                    {vid.isFeatured && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-black px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-black" />
                        <span>Featured Video (Homepage Brief)</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      {vid.duration}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded font-bold">
                      {vid.category}
                    </span>
                    <h3 className="font-serif font-black text-base leading-snug line-clamp-2">
                      {vid.title}
                    </h3>
                    <p className="text-xs font-mono text-neutral-400 truncate" title={vid.videoUrl}>
                      Stream: {vid.videoUrl}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVideo(vid);
                      setVideoForm({
                        title: vid.title,
                        videoUrl: vid.videoUrl,
                        duration: vid.duration,
                        thumbnail: vid.thumbnail,
                        category: vid.category,
                        isFeatured: !!vid.isFeatured,
                      });
                    }}
                    className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-xs font-mono font-bold uppercase"
                  >
                    Edit / Replace
                  </button>

                  <a
                    href={vid.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                  >
                    <span>Test Player</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 3: PODCASTS & AUDIO DESK                                             */}
      {/* ========================================================================= */}
      {activeDesk === "PODCASTS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div>
              <h2 className="font-serif font-black text-lg">Leadjen Listen Podcast Desk</h2>
              <p className="text-xs font-mono text-neutral-500">
                Manage audio briefings, series cover images, narrative audio media URLs, and host credits for the /listen page.
              </p>
            </div>
            <Link
              href="/listen"
              target="_blank"
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5"
            >
              <span>View /listen Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Podcasts List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((ep) => (
              <div
                key={ep.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                    <img
                      src={ep.coverImage}
                      alt={ep.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                      {ep.series}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      {ep.duration}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Host: {ep.host}
                    </span>
                    <h3 className="font-serif font-black text-base leading-snug line-clamp-2">
                      {ep.title}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2">{ep.description}</p>
                    {ep.audioUrl && (
                      <p className="text-[10px] font-mono text-emerald-500 truncate">
                        Audio Source: {ep.audioUrl}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPodcast(ep);
                      setPodcastForm({
                        title: ep.title,
                        series: ep.series,
                        host: ep.host,
                        duration: ep.duration,
                        category: ep.category,
                        coverImage: ep.coverImage,
                        audioUrl: ep.audioUrl || "",
                        description: ep.description,
                      });
                    }}
                    className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase"
                  >
                    Replace Cover / Audio
                  </button>
                  <span className="text-[10px] font-mono text-neutral-400">{ep.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 4: EDITORIAL PHOTOS & ARTICLES                                       */}
      {/* ========================================================================= */}
      {activeDesk === "EDITORIAL" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div>
              <h2 className="font-serif font-black text-lg">Article Editorial Photo Placements</h2>
              <p className="text-xs font-mono text-neutral-500">
                Audit and replace featured images on articles directly. Updates immediately reflect on the homepage and article details.
              </p>
            </div>
          </div>

          {/* Articles Photo Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-50 dark:bg-neutral-950 uppercase text-[10px] text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">Photo Preview</th>
                    <th className="p-3.5">Article Headline</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-950/50">
                      <td className="p-3.5 w-24">
                        <div className="w-20 aspect-video rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                          <img
                            src={art.featuredImage}
                            alt={art.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3.5 max-w-md">
                        <span className="font-serif font-bold text-sm text-black dark:text-white line-clamp-1">
                          {art.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          Slug: /{art.slug}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-bold uppercase text-[10px]">
                          {art.category?.name || "News"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            art.status === "PUBLISHED"
                              ? "bg-emerald-950/20 text-emerald-500 border border-emerald-800/30"
                              : "bg-amber-950/20 text-amber-500 border border-amber-800/30"
                          }`}
                        >
                          {art.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            // Find matching media or prompt assignment
                            const foundMedia = mediaList[0];
                            if (foundMedia) {
                              setAssignModal({ media: foundMedia, targetType: "article" });
                              setAssignTargetId(art.id);
                            } else {
                              alert("Please upload or select an asset from the Media Library first.");
                            }
                          }}
                          className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white rounded-lg text-xs font-mono font-bold uppercase"
                        >
                          Replace Photo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 5: BRANDING & ADVERTISING BANNERS                                    */}
      {/* ========================================================================= */}
      {activeDesk === "BRANDING" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-serif font-black text-lg">Site Publication Logo</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="w-48 h-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                {brandingLogo ? (
                  <img src={brandingLogo} alt="Site Logo" className="max-h-full object-contain" />
                ) : (
                  <span className="font-serif font-black text-base">LEADJEN MEDIA</span>
                )}
              </div>
              <div className="space-y-1 text-xs font-mono">
                <p className="font-bold">Active Publication Header Logo</p>
                <p className="text-neutral-500">
                  {brandingLogo ? `Current URL: ${brandingLogo.substring(0, 45)}...` : "Using default typographic wordmark."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const firstMedia = mediaList[0];
                    if (firstMedia) {
                      setAssignModal({ media: firstMedia, targetType: "branding" });
                      setAssignTargetId("default");
                    } else {
                      alert("Please upload a logo image in the Media Library first.");
                    }
                  }}
                  className="mt-2 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold uppercase inline-block"
                >
                  Replace Publication Logo
                </button>
              </div>
            </div>
          </div>

          {/* Advertisement Banners */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-serif font-black text-lg">Active Advertisement Banners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold">{ad.name}</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold">
                      {ad.location}
                    </span>
                  </div>
                  <div className="aspect-[4/1] bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden">
                    <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-neutral-400">
                      Status: {ad.isActive ? "Active" : "Paused"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const firstMedia = mediaList[0];
                        if (firstMedia) {
                          setAssignModal({ media: firstMedia, targetType: "advertisement" });
                          setAssignTargetId(ad.id);
                        } else {
                          alert("Please upload a banner asset in the Media Library first.");
                        }
                      }}
                      className="px-3 py-1 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 rounded text-xs font-mono font-bold uppercase"
                    >
                      Replace Banner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MEDIA ITEM DETAILS & ALT TEXT DRAWER                                */}
      {/* ========================================================================= */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-serif font-black text-lg">Media Asset Details &amp; Reverse References</h3>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Image / Audio Player */}
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
              {selectedMedia.mimeType?.startsWith("audio/") ? (
                <div className="p-6 text-center space-y-3">
                  <Headphones className="w-12 h-12 mx-auto text-leadjen-500" />
                  <p className="font-serif font-bold text-sm">{selectedMedia.originalName}</p>
                  <audio controls src={selectedMedia.url} className="w-full max-w-md mx-auto" />
                </div>
              ) : selectedMedia.mimeType?.startsWith("video/") ? (
                <video controls src={selectedMedia.url} className="w-full h-full object-contain" />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.altText || selectedMedia.originalName}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Original Filename</span>
                <span className="font-bold break-all">{selectedMedia.originalName}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Uploaded At</span>
                <span>{new Date(selectedMedia.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">File Size</span>
                <span>{selectedMedia.size ? `${(selectedMedia.size / 1024).toFixed(1)} KB` : "N/A"}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">MIME Type</span>
                <span>{selectedMedia.mimeType || "image/*"}</span>
              </div>
            </div>

            {/* Reverse Reference Usage List */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-black dark:text-white" />
                <h4 className="text-xs font-mono font-bold uppercase">
                  Active Database References ({selectedMedia.usages?.length || 0})
                </h4>
              </div>

              {selectedMedia.usages && selectedMedia.usages.length > 0 ? (
                <div className="max-h-40 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                  {selectedMedia.usages.map((u, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-950">
                      <div className="min-w-0 pr-3">
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-neutral-200 dark:bg-neutral-800 mr-2">
                          {u.type}
                        </span>
                        <span className="font-medium truncate">{u.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {u.field}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-neutral-500 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl">
                  This asset is completely unused. Safe to delete without causing broken content.
                </p>
              )}
            </div>

            {/* Alt Description Editor */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase">
                Alt Description / Caption (For SEO &amp; Accessibility)
              </label>
              <textarea
                rows={2}
                value={editingAlt}
                onChange={(e) => setEditingAlt(e.target.value)}
                placeholder="Descriptive caption or alt text..."
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-sans focus:outline-hidden"
              />
            </div>

            {altSavedSuccess && (
              <div className="text-xs font-mono font-bold text-green-500 flex items-center gap-1">
                <Check className="w-4 h-4" /> Metadata updated successfully!
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedMedia.url, selectedMedia.id)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-mono font-bold uppercase"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = selectedMedia;
                    setSelectedMedia(null);
                    setAssignModal({ media: item, targetType: "article" });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-xs font-mono font-bold uppercase"
                >
                  <span>Assign Placement</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedMedia)}
                  className="px-4 py-2 bg-red-950/20 text-red-600 border border-red-800/40 rounded-xl text-xs font-mono font-bold uppercase hover:bg-red-950/40 transition"
                >
                  Delete
                </button>
                <button
                  type="button"
                  disabled={savingAlt}
                  onClick={handleSaveDetails}
                  className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingAlt ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN MEDIA REFERENCE                                             */}
      {/* ========================================================================= */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-serif font-black text-lg">Assign Media Reference</h3>
              <button type="button" onClick={() => setAssignModal(null)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
                <img src={assignModal.media.url} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 text-xs font-mono">
                <p className="font-bold truncate">{assignModal.media.originalName}</p>
                <p className="text-neutral-400 truncate">{assignModal.media.url}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1">
                  Target Destination
                </label>
                <select
                  value={assignModal.targetType}
                  onChange={(e) =>
                    setAssignModal({ ...assignModal, targetType: e.target.value as any })
                  }
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono uppercase focus:outline-hidden"
                >
                  <option value="article">Article Featured Image</option>
                  <option value="video">Featured Video / Video News</option>
                  <option value="podcast">Podcast Episode Cover / Audio</option>
                  <option value="branding">Site Branding (Publication Logo)</option>
                  <option value="photoGallery">Photo Gallery Cover</option>
                  <option value="advertisement">Advertisement Banner</option>
                </select>
              </div>

              {/* Target ID Selector based on targetType */}
              {assignModal.targetType === "article" && (
                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1">
                    Select Article ({articles.length} available)
                  </label>
                  <select
                    value={assignTargetId}
                    onChange={(e) => setAssignTargetId(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono focus:outline-hidden"
                  >
                    <option value="">-- Choose Article --</option>
                    {articles.map((a) => (
                      <option key={a.id} value={a.id}>
                        [{a.category?.name || "News"}] {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignModal.targetType === "video" && (
                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1">
                    Select Video Broadcast
                  </label>
                  <select
                    value={assignTargetId}
                    onChange={(e) => setAssignTargetId(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono focus:outline-hidden"
                  >
                    <option value="">-- Choose Video --</option>
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.isFeatured ? "★ [FEATURED] " : ""}{v.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignModal.targetType === "podcast" && (
                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1">
                    Select Podcast Episode
                  </label>
                  <select
                    value={assignTargetId}
                    onChange={(e) => setAssignTargetId(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono focus:outline-hidden"
                  >
                    <option value="">-- Choose Podcast Episode --</option>
                    {podcasts.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        [{ep.series}] {ep.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignModal.targetType === "branding" && (
                <p className="text-xs font-mono text-neutral-500">
                  This will replace the main Leadjen Media masthead logo across the entire site.
                </p>
              )}

              {assignModal.targetType === "advertisement" && (
                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1">
                    Select Ad Placement
                  </label>
                  <select
                    value={assignTargetId}
                    onChange={(e) => setAssignTargetId(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono focus:outline-hidden"
                  >
                    <option value="">-- Choose Advertisement --</option>
                    {ads.map((ad) => (
                      <option key={ad.id} value={ad.id}>
                        [{ad.location}] {ad.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-mono font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assigning || (!assignTargetId && assignModal.targetType !== "branding")}
                onClick={handleAssignMedia}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Confirm & Replace Reference"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE WARNING FOR REFERENCED ASSETS                               */}
      {/* ========================================================================= */}
      {deleteWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-500">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-serif font-black text-lg">Active Reference Safeguard</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
              This media asset is currently in active use across{" "}
              <strong>{deleteWarningModal.usages.length} database reference(s)</strong>. Deleting it will result in broken images or dead links on the live production website:
            </p>

            <div className="max-h-36 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 text-xs font-mono">
              {deleteWarningModal.usages.map((u, i) => (
                <div key={i} className="py-1.5 flex items-center justify-between">
                  <span className="font-bold truncate mr-2">&bull; {u.title}</span>
                  <span className="text-[10px] text-neutral-400 shrink-0">({u.type})</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] font-mono text-neutral-500">
              Please replace or detach this asset in the referenced stories first to protect content integrity.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setDeleteWarningModal(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-bold uppercase rounded-xl"
              >
                Cancel (Keep Asset)
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteWarningModal.item, true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase rounded-xl shadow-xs"
              >
                Force Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT / CREATE VIDEO BROADCAST                                      */}
      {/* ========================================================================= */}
      {(editingVideo || isNewVideoModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveVideo}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-serif font-black text-lg">
                {editingVideo ? "Edit / Replace Video News" : "Add New Video Broadcast"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingVideo(null);
                  setIsNewVideoModalOpen(false);
                }}
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block font-bold uppercase mb-1">Video Title / Headline</label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="e.g. Inside India's High-Tech Cleanroom Facilities..."
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">
                  Video Stream URL (YouTube, Vimeo, Cloudinary, MP4)
                </label>
                <input
                  type="url"
                  required
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or https://..."
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    placeholder="04:30"
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Category</label>
                  <select
                    value={videoForm.category}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                  >
                    <option value="Technology">Technology</option>
                    <option value="World">World</option>
                    <option value="Business">Business</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Investigation">Investigation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  required
                  value={videoForm.thumbnail}
                  onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/... or /api/media/.../file"
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={videoForm.isFeatured}
                  onChange={(e) => setVideoForm({ ...videoForm, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="featuredCheck" className="font-bold cursor-pointer">
                  Promote to Homepage Featured Video (VIDEO_BRIEF)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setEditingVideo(null);
                  setIsNewVideoModalOpen(false);
                }}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-mono font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingVideo}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase disabled:opacity-50"
              >
                {savingVideo ? "Saving..." : "Save Video"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PODCAST EPISODE                                               */}
      {/* ========================================================================= */}
      {editingPodcast && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePodcast}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-serif font-black text-lg">Edit Podcast Episode &amp; Media</h3>
              <button type="button" onClick={() => setEditingPodcast(null)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block font-bold uppercase mb-1">Episode Title</label>
                <input
                  type="text"
                  required
                  value={podcastForm.title}
                  onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Series</label>
                  <input
                    type="text"
                    value={podcastForm.series}
                    onChange={(e) => setPodcastForm({ ...podcastForm, series: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Host Credit</label>
                  <input
                    type="text"
                    value={podcastForm.host}
                    onChange={(e) => setPodcastForm({ ...podcastForm, host: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Cover Image URL</label>
                <input
                  type="text"
                  required
                  value={podcastForm.coverImage}
                  onChange={(e) => setPodcastForm({ ...podcastForm, coverImage: e.target.value })}
                  placeholder="https://... or /api/media/.../file"
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">
                  Audio Stream URL (MP3/Podcast Feed or /api/media/.../file)
                </label>
                <input
                  type="text"
                  value={podcastForm.audioUrl}
                  onChange={(e) => setPodcastForm({ ...podcastForm, audioUrl: e.target.value })}
                  placeholder="https://... or /api/media/.../file"
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Description / Briefing Notes</label>
                <textarea
                  rows={3}
                  value={podcastForm.description}
                  onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl font-sans focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingPodcast(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-mono font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPodcast}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase disabled:opacity-50"
              >
                {savingPodcast ? "Saving..." : "Save Podcast"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
