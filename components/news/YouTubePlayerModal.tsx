"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Play, Film } from "lucide-react";
import { parseVideoUrl } from "@/lib/youtube";

export interface PlayableVideo {
  id?: string;
  title: string;
  videoUrl?: string | null;
  category?: string | { name: string; slug?: string } | null;
  duration?: string | null;
  thumbnail?: string | null;
  thumbnailUrl?: string | null;
  description?: string | null;
}

interface YouTubePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: PlayableVideo | null;
}

export function YouTubePlayerModal({ isOpen, onClose, video }: YouTubePlayerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const rawUrl = video.videoUrl || "";
  const parsed = parseVideoUrl(rawUrl);

  const categoryName =
    typeof video.category === "string"
      ? video.category
      : video.category?.name || "Special Report";

  // External watch URL for YouTube
  const youtubeWatchUrl = parsed.videoId
    ? `https://www.youtube.com/watch?v=${parsed.videoId}`
    : rawUrl.startsWith("http")
    ? rawUrl
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div
        className="relative w-full max-w-4xl bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider bg-red-600 text-white rounded">
              {categoryName}
            </span>
            {video.duration && (
              <span className="text-[11px] font-mono text-neutral-400">
                {video.duration}
              </span>
            )}
            <span className="text-xs text-neutral-400 truncate max-w-xs sm:max-w-md hidden sm:inline">
              {video.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {youtubeWatchUrl && (
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
                title="Watch on original provider"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Screen (16:9 Aspect Ratio) */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {parsed.type === "youtube" ? (
            <iframe
              src={parsed.embedUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : parsed.type === "vimeo" ? (
            <iframe
              src={parsed.embedUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : parsed.type === "direct" && rawUrl ? (
            <video
              src={rawUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-400">
              <Film className="w-12 h-12 mb-3 text-neutral-600" />
              <p className="font-serif font-bold text-lg text-white mb-1">
                Video Unavailable
              </p>
              <p className="text-xs font-mono max-w-md">
                The video URL is missing or cannot be previewed.
              </p>
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="p-4 sm:p-5 bg-neutral-900 border-t border-neutral-800">
          <h3 className="font-serif font-bold text-base sm:text-lg text-white line-clamp-2">
            {video.title}
          </h3>
          {video.description && (
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 font-sans line-clamp-3">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
