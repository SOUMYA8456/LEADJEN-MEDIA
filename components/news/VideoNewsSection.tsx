"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import { VideoNewsCard } from "./NewsCard";
import { YouTubePlayerModal } from "./YouTubePlayerModal";

interface VideoNewsSectionProps {
  videos: any[];
}

export function VideoNewsSection({ videos }: VideoNewsSectionProps) {
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  if (!videos || videos.length === 0) return null;

  return (
    <section className="w-full py-10 bg-gray-950 text-white my-8 rounded-xl p-6 sm:p-8 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1E1B1A] border border-neutral-700 flex items-center justify-center">
            <Play className="w-4 h-4 fill-current text-white ml-0.5" />
          </div>
          <div>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-white tracking-tight uppercase">
              LEADJEN VIDEO JOURNALISM
            </h2>
            <p className="text-xs text-gray-400">Exclusive visual reports & briefings</p>
          </div>
        </div>
        <Link
          href="/videos"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition"
        >
          <span>All Videos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {videos.map((vid) => (
          <div
            key={vid.id}
            onClick={() => setActiveVideo(vid)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveVideo(vid);
              }
            }}
          >
            <VideoNewsCard video={vid} />
          </div>
        ))}
      </div>

      {/* Real Responsive Video Player Modal */}
      <YouTubePlayerModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        video={activeVideo}
      />
    </section>
  );
}
