"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Radio, Clock, User, AlertCircle, Share2, ExternalLink, Video, Image as ImageIcon } from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";

interface LiveUpdateItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  isUrgent: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
  linkedArticleId?: string | null;
  timestamp?: string | null;
  createdAt: string | Date;
}

interface LiveCoverageData {
  id: string;
  title: string;
  summary?: string | null;
  status: string;
  category?: string | null;
  startedAt: string | Date;
}

interface LiveDeskStreamProps {
  initialCoverage: LiveCoverageData | null;
  initialUpdates: LiveUpdateItem[];
}

export function LiveDeskStream({
  initialCoverage,
  initialUpdates,
}: LiveDeskStreamProps) {
  const [coverage, setCoverage] = useState<LiveCoverageData | null>(initialCoverage);
  const [updates, setUpdates] = useState<LiveUpdateItem[]>(initialUpdates);

  const fetchLiveState = async () => {
    try {
      const res = await fetch("/api/live");
      if (res.ok) {
        const data = await res.json();
        if (data.coverage !== undefined) setCoverage(data.coverage);
        if (data.liveUpdates) setUpdates(data.liveUpdates);
      }
    } catch {}
  };

  // Real-time Event Listener for LIVE_UPDATE and LIVE_COVERAGE_UPDATE
  const { status: connectionStatus } = useRealtime({
    eventTypes: ["LIVE_UPDATE", "LIVE_COVERAGE_UPDATE"],
    onEvent: (event) => {
      if (event.type === "LIVE_UPDATE" || event.type === "LIVE_COVERAGE_UPDATE") {
        fetchLiveState();
      }
    },
  });

  return (
    <div className="w-full bg-white dark:bg-neutral-950 py-10 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Block */}
        <div className="pb-6 border-b-2 border-red-600 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                {coverage?.status === "ENDED" ? "COVERAGE CONCLUDED" : "LIVE DESK STREAM"}
              </span>

              {coverage?.category && (
                <span className="text-xs font-mono uppercase text-neutral-500 font-bold">
                  {coverage.category}
                </span>
              )}
            </div>

            {/* Real-time Connection State */}
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                connectionStatus === "connected"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              ● {connectionStatus === "connected" ? "REAL-TIME STREAM CONNECTED" : "RECONNECTING..."}
            </span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-black dark:text-white tracking-tight">
            {coverage ? coverage.title : "Continuous Live News Coverage & Real-Time Intelligence"}
          </h1>

          {coverage?.summary && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
              {coverage.summary}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 pt-1">
            <span>Started: {new Date(coverage?.startedAt || Date.now()).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })} IST</span>
            <span>•</span>
            <span>{updates.length} Verified Dispatches</span>
          </div>
        </div>

        {/* Live Timeline Stream */}
        {updates.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            Live correspondents are currently monitoring the wires. Verified updates will appear here in real time.
          </div>
        ) : (
          <div className="relative border-l-2 border-red-200 dark:border-red-950 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
            {updates.map((update) => (
              <div key={update.id} className="relative group">
                {/* Pin on timeline */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-2 w-4 h-4 rounded-full bg-white dark:bg-neutral-950 border-4 border-red-600 group-hover:scale-125 transition-transform" />

                <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                  {/* Timestamp & Metadata */}
                  <div className="flex flex-wrap items-center justify-between text-xs font-mono text-neutral-500">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {update.timestamp || "LIVE"}
                      </span>
                      {update.isUrgent && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase rounded">
                          URGENT
                        </span>
                      )}
                    </div>
                    <span className="font-medium">By {update.authorName}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
                    {update.title}
                  </h3>

                  {/* Body Content */}
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed whitespace-pre-line">
                    {update.content}
                  </p>

                  {/* Optional Image */}
                  {update.imageUrl && (
                    <div className="pt-2">
                      <img
                        src={update.imageUrl}
                        alt={update.title}
                        className="w-full max-h-96 object-cover rounded-xl border border-neutral-200 dark:border-neutral-800"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Optional Video Embed */}
                  {update.videoUrl && (
                    <div className="pt-2">
                      <a
                        href={update.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase hover:opacity-90 transition"
                      >
                        <Video className="w-4 h-4" />
                        <span>Watch Video Dispatch</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
