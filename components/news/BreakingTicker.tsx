"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Radio, Clock, AlertTriangle } from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";

export interface BreakingItem {
  id: string;
  title: string;
  description?: string | null;
  linkUrl?: string | null;
  isLive?: boolean;
  priority?: "URGENT" | "HIGH" | "NORMAL" | "MEDIUM" | "LOW" | string;
  startTime?: string | Date;
  expiresAt?: string | Date | null;
  status?: string;
  isActive?: boolean;
}

interface BreakingTickerProps {
  items?: BreakingItem[];
  trendingTopics?: string[];
}

export function BreakingTicker({
  items = [],
  trendingTopics = [
    "India Semiconductor Corridors",
    "Global Macro Policy Summit",
    "Clean Energy Infrastructure",
    "Quantum Computing Trials",
    "World Geopolitical Dispatch",
  ],
}: BreakingTickerProps) {
  const [breakingList, setBreakingList] = useState<BreakingItem[]>(items);

  // Fallback initial items if empty
  const defaultItems: BreakingItem[] = [
    {
      id: "default-1",
      title: "India High-Tech Manufacturing & Semiconductor Corridors Expand Commercial Trials in Dholera",
      linkUrl: "/technology",
      isLive: true,
      priority: "URGENT",
    },
    {
      id: "default-2",
      title: "Global Central Banks Announce Coordinated Monetary Strategy Framework at Geneva Summit",
      linkUrl: "/business",
      isLive: false,
      priority: "HIGH",
    },
  ];

  const fetchActiveBreaking = async () => {
    try {
      const res = await fetch("/api/breaking");
      if (res.ok) {
        const data = await res.json();
        if (data.breaking && Array.isArray(data.breaking)) {
          setBreakingList(data.breaking);
        }
      }
    } catch {}
  };

  // Listen to REAL-TIME BREAKING_UPDATE events
  useRealtime({
    eventTypes: ["BREAKING_UPDATE"],
    onEvent: (event) => {
      if (event.type === "BREAKING_UPDATE") {
        fetchActiveBreaking();
      }
    },
  });

  const activeItems = breakingList.length > 0 ? breakingList : defaultItems;

  return (
    <div className="w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-sans">
      {/* 1. BREAKING NEWS BAR */}
      <div className="border-b border-neutral-100 dark:border-neutral-900 bg-red-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center min-w-0">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white font-mono font-bold text-[10px] tracking-wider rounded uppercase flex-shrink-0 mr-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            BREAKING NEWS
          </div>

          <div className="overflow-hidden whitespace-nowrap flex-1 relative">
            <div className="inline-block animate-marquee hover:pause motion-reduce:animate-none">
              {activeItems.map((item, idx) => (
                <Link
                  key={item.id}
                  href={item.linkUrl || "#"}
                  className="inline-flex items-center text-black dark:text-white font-medium hover:underline mr-8 transition text-xs"
                >
                  {item.priority === "URGENT" && (
                    <span className="mr-1.5 px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-mono font-bold rounded">
                      URGENT
                    </span>
                  )}
                  {item.isLive && (
                    <span className="mr-1.5 text-red-600 dark:text-red-400 font-mono font-bold text-[10px]">
                      ● LIVE
                    </span>
                  )}
                  <span>{item.title}</span>
                  {idx < activeItems.length - 1 && (
                    <span className="mx-4 text-neutral-300 dark:text-neutral-700">•</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRENDING TOPICS BAR */}
      <div className="bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-black dark:text-white font-mono font-bold uppercase text-[10px] tracking-wider flex-shrink-0">
            <Flame className="w-3.5 h-3.5 text-red-600 fill-current" />
            <span>TRENDING TOPICS:</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-neutral-700 dark:text-neutral-300 font-mono whitespace-nowrap flex-1">
            {trendingTopics.map((topic, i) => (
              <React.Fragment key={topic}>
                <Link
                  href={`/search?q=${encodeURIComponent(topic)}`}
                  className="hover:text-black dark:hover:text-white hover:underline transition"
                >
                  {topic}
                </Link>
                {i < trendingTopics.length - 1 && (
                  <span className="text-neutral-300 dark:text-neutral-700 px-1 font-normal">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
