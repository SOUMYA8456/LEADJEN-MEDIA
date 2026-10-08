"use client";

import React from "react";
import Link from "next/link";
import { Play, ArrowRight, Video } from "lucide-react";

interface VideoBriefSectionProps {
  title?: string;
  video?: {
    id?: string;
    title: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    videoUrl?: string | null;
    duration?: string | null;
    category?: { name: string; slug: string } | null;
  } | null;
  className?: string;
}

export function VideoBriefSection({
  title = "SPECIAL LEADJEN VIDEO BRIEF",
  video,
  className = "",
}: VideoBriefSectionProps) {
  const currentVideo = video || {
    title: "Inside the AI News Operations Command Center: How 24/7 Verification Works",
    description:
      "A special documentary dispatch behind Leadjen Media's technological journalism infrastructure, verified reporting standards, and global correspondent network.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=600&q=80",
    videoUrl: "/videos",
    duration: "04:45",
    category: { name: "Technology", slug: "technology" },
  };

  return (
    <section className={`w-full bg-editorial-paper dark:bg-editorial-darkCard border-b border-editorial-border dark:border-editorial-darkBorder py-5 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-black text-white dark:bg-white dark:text-black rounded">
              <Video className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <Link
            href="/videos"
            className="text-[11px] font-bold font-mono uppercase tracking-wider text-black dark:text-white hover:underline flex items-center gap-1"
          >
            <span>Watch All Briefings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          {/* Video Thumbnail */}
          <div className="md:col-span-5 relative group overflow-hidden rounded-lg aspect-video bg-black shadow-none">
            <img
              src={currentVideo.thumbnailUrl || (currentVideo as any).thumbnail || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80"}
              alt={currentVideo.title || "Video Brief"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-transform shadow-none">
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              </div>
            </div>
            {currentVideo.duration && (
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                {currentVideo.duration}
              </span>
            )}
          </div>

          {/* Video Editorial Details */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 text-[10px] font-mono font-bold uppercase rounded">
                {typeof currentVideo.category === "string" ? currentVideo.category : currentVideo.category?.name || "Special Report"}
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                Executive Briefing
              </span>
            </div>

            <Link href="/videos" className="block group">
              <h4 className="font-serif font-bold text-lg sm:text-xl text-gray-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2">
                {currentVideo.title}
              </h4>
            </Link>

            {currentVideo.description && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-sans">
                {currentVideo.description}
              </p>
            )}

            <div className="pt-2">
              <Link
                href="/videos"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E1B1A] dark:bg-white text-white dark:text-gray-950 hover:bg-black dark:hover:bg-neutral-200 text-xs font-bold font-mono uppercase tracking-wider rounded transition-colors shadow-none"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Watch →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
