"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, X, ArrowRight } from "lucide-react";
import { VideoNewsCard } from "./NewsCard";

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
          >
            <VideoNewsCard video={vid} />
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden shadow-none border border-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                {activeVideo.category} • {activeVideo.duration}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={activeVideo.thumbnail}
                alt={activeVideo.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-none mb-4">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white max-w-lg">
                  {activeVideo.title}
                </h3>
                <p className="text-xs text-gray-300 mt-2 font-mono">
                  Streaming HD Video Broadcast (Demo Stream)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
