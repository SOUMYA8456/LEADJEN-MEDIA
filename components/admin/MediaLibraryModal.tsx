"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  CheckCircle,
  Clock,
  HardDrive,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType?: string;
  size?: number;
  altText?: string;
  createdAt: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, mediaItem?: MediaItem) => void;
  title?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select from Media Library",
}: MediaLibraryModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/media?search=${encodeURIComponent(search)}&limit=60`);
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
        if (data.media.length > 0 && !selectedItem) {
          setSelectedItem(data.media[0]);
        }
      }
    } catch (err) {
      console.error("Fetch media error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(20);
    setError(null);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();
      if (res.ok && data.media) {
        setMediaList([data.media, ...mediaList]);
        setSelectedItem(data.media);
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      } else {
        setUploading(false);
        setError(data.error || "Upload failed. Please try again.");
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploading(false);
      setError("Network upload error. Please check connection.");
    }
  };

  const handleConfirmSelection = () => {
    if (selectedItem) {
      onSelect(selectedItem.url, selectedItem);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-black dark:text-white" />
            <h2 className="font-serif font-black text-lg text-black dark:text-white">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or title..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-black dark:text-white font-mono focus:outline-none"
            />
          </div>

          <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? `Uploading (${uploadProgress}%)` : "Upload New File"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 overflow-hidden">
            <div
              className="bg-black dark:bg-white h-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Error Callout */}
        {error && (
          <div className="px-6 py-2 bg-red-950/20 text-red-500 text-xs font-mono border-b border-red-800">
            {error}
          </div>
        )}

        {/* Main Content Area: Grid + Preview Sidebar */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Media Grid (8 cols) */}
          <div className="md:col-span-8 p-6 overflow-y-auto border-r border-neutral-200 dark:border-neutral-800">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-xs font-mono text-neutral-400">
                Loading assets...
              </div>
            ) : mediaList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-center space-y-2">
                <ImageIcon className="w-10 h-10 stroke-1" />
                <p className="text-sm font-serif">No images found</p>
                <p className="text-xs font-mono">Upload a new image to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {mediaList.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition text-left focus:outline-none ${
                        isSelected
                          ? "border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1 bg-black text-white dark:bg-white dark:text-black rounded-full shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] font-mono truncate">
                        {item.originalName}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Sidebar (4 cols) */}
          <div className="md:col-span-4 p-6 bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between overflow-y-auto">
            {selectedItem ? (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-sm text-black dark:text-white pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  Asset Details
                </h3>

                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.originalName}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Filename</span>
                    <span className="font-bold text-black dark:text-white break-all">
                      {selectedItem.originalName}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Uploaded</span>
                    <span className="text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(selectedItem.createdAt)}
                    </span>
                  </div>

                  {selectedItem.size && (
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">Size</span>
                      <span className="text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {(selectedItem.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}

                  {selectedItem.altText && (
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">Alt Description</span>
                      <span className="text-neutral-600 dark:text-neutral-300">
                        {selectedItem.altText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-neutral-400 text-center py-12">
                Select an image to preview details
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold uppercase hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedItem}
                onClick={handleConfirmSelection}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition disabled:opacity-40 shadow-xs"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Use This Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
