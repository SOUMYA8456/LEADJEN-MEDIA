import React from "react";
import prisma from "@/lib/db";
import { VideoNewsSection } from "@/components/news/VideoNewsSection";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video News & Special Reports | LEADJEN MEDIA",
  description: "Watch high-definition video broadcasts, investigative briefings, and on-ground reports from Leadjen Media.",
};

export default async function VideosPage() {
  const videos = await prisma.videoNews.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="w-full bg-gray-950 text-white py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-4 border-b border-gray-800">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-leadjen-400 mb-1">
            <Link href="/" className="hover:underline">HOME</Link> / VIDEOS
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight uppercase">
            LEADJEN VIDEO JOURNALISM
          </h1>
          <p className="mt-2 text-sm text-gray-400 max-w-2xl font-sans">
            In-depth visual investigations, studio debates, documentary features, and live on-location dispatches.
          </p>
        </div>

        <VideoNewsSection videos={videos} />
      </div>
    </div>
  );
}
