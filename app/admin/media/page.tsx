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
  Layers,
  Clock,
  HardDrive,
  X,
  ExternalLink,
  Edit2,
  Save,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

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
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "IMAGES" | "VIDEOS">("ALL");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "name">("latest");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected item modal / drawer
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editingAlt, setEditingAlt] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const [altSavedSuccess, setAltSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        type: activeTab,
        sort: sortBy,
        limit: "60",
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

  useEffect(() => {
    fetchMedia();
  }, [search, activeTab, sortBy]);

  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 10 : prev));
    }, 200);

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
        if (!res.ok) {
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
      fetchMedia();
    }, 400);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media asset? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMediaList(mediaList.filter((m) => m.id !== id));
        if (selectedMedia?.id === id) {
          setSelectedMedia(null);
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith("http") || url.startsWith("data:") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenDetails = (item: MediaItem) => {
    setSelectedMedia(item);
    setEditingAlt(item.altText || "");
    setAltSavedSuccess(false);
  };

  const handleSaveDetails = async () => {
    if (!selectedMedia) return;
    setSavingAlt(true);
    try {
      const res = await fetch(`/api/media/${selectedMedia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText: editingAlt }),
      });
      const data = await res.json();
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white">
            Media Asset Library
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Production Media Management • Cloud Storage & High-Res CDN
          </p>
        </div>

        {/* Upload Trigger Button */}
        <label className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-xs transition cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? `Uploading (${uploadProgress}%)` : "Upload New Files"}</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => handleFilesUpload(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Drag and Drop Zone */}
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
          <p className="text-sm font-serif font-bold text-black dark:text-white">
            Drag & drop images here, or browse from computer
          </p>
          <p className="text-xs font-mono text-neutral-500">
            Supports JPG, PNG, WEBP, GIF up to 10MB each
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

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-950/20 border border-red-800 text-red-400 text-xs font-mono rounded-xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        {/* Tabs: ALL, IMAGES, VIDEOS */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-mono font-bold uppercase">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "ALL"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            All ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("IMAGES")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "IMAGES"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            Images
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("VIDEOS")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "VIDEOS"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            Videos
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename or alt..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-black dark:text-white font-mono focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-black dark:text-white font-mono uppercase focus:outline-none"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Media Asset Grid */}
      {loading ? (
        <div className="text-center py-16 text-neutral-400 font-mono text-xs">
          Loading media library assets...
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-16 text-center text-neutral-400">
          <ImageIcon className="w-12 h-12 mx-auto stroke-1 mb-2" />
          <p className="font-serif text-lg text-black dark:text-white">No media assets found</p>
          <p className="text-xs mt-1 font-mono">Upload images or videos above to populate the library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mediaList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenDetails(item)}
              className="group relative bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:border-black dark:hover:border-white transition cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.altText || item.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3">
                <p className="text-xs font-bold text-black dark:text-white truncate" title={item.originalName}>
                  {item.originalName}
                </p>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-1">
                  <span>{item.size ? `${(item.size / 1024).toFixed(0)} KB` : "Asset"}</span>
                  <span>{formatTimeAgo(item.createdAt)}</span>
                </div>

                {/* Bottom Actions */}
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(item.url, item.id);
                    }}
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
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded transition"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details & Metadata Edit Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-serif font-black text-lg text-black dark:text-white">
                Media Details & Metadata
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Image */}
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <img
                src={selectedMedia.url}
                alt={selectedMedia.altText || selectedMedia.originalName}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Original Filename</span>
                <span className="font-bold text-black dark:text-white break-all">
                  {selectedMedia.originalName}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Uploaded At</span>
                <span className="text-black dark:text-white">{new Date(selectedMedia.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">File Size</span>
                <span className="text-black dark:text-white">
                  {selectedMedia.size ? `${(selectedMedia.size / 1024).toFixed(1)} KB` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">MIME Type</span>
                <span className="text-black dark:text-white">{selectedMedia.mimeType || "image/*"}</span>
              </div>
            </div>

            {/* Alt Text / Caption Editor */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-black dark:text-white">
                Alt Description / Caption (For SEO & Accessibility)
              </label>
              <textarea
                rows={2}
                value={editingAlt}
                onChange={(e) => setEditingAlt(e.target.value)}
                placeholder="Descriptive caption or alt text..."
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white font-sans focus:outline-none"
              />
            </div>

            {altSavedSuccess && (
              <div className="text-xs font-mono font-bold text-green-500 flex items-center gap-1">
                <Check className="w-4 h-4" /> Metadata updated successfully!
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => handleCopyUrl(selectedMedia.url, selectedMedia.id)}
                className="flex items-center gap-1.5 px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedMedia.id)}
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
    </div>
  );
}
