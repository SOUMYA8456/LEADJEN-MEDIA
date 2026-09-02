"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowRight,
  Tag,
  Video,
  Camera,
  FileText,
  Flame,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<"all" | "news" | "videos" | "photos">("all");
  const [activeSort, setActiveSort] = useState<"latest" | "most_read">("latest");
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setArticles([]);
      setVideos([]);
      setPhotos([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&type=${activeType}&sort=${activeSort}`
        );
        const data = await res.json();
        if (data.articles) setArticles(data.articles.slice(0, 6));
        if (data.videos) setVideos(data.videos.slice(0, 4));
        if (data.photos) setPhotos(data.photos.slice(0, 4));
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, activeType, activeSort]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query)}&type=${activeType}&sort=${activeSort}`);
  };

  if (!isOpen) return null;

  const totalResultsCount = articles.length + videos.length + photos.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/75 backdrop-blur-md transition-all animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-none border border-gray-200 dark:border-gray-800 overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Search Header Form */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center border-b border-gray-200 dark:border-gray-800 p-4 sm:p-5 bg-gray-50/70 dark:bg-gray-900/90"
        >
          <Search className="w-6 h-6 text-black dark:text-white mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news, topics, authors, video or analysis..."
            className="w-full bg-transparent text-base sm:text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-sans font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full mr-2"
              aria-label="Clear query"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono font-bold px-2.5 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            aria-label="Close search"
          >
            ESC
          </button>
        </form>

        {/* Filter Tabs & Sort Controls Bar */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "all", label: "ALL", icon: Layers },
                { id: "news", label: "NEWS", icon: FileText },
                { id: "videos", label: "VIDEOS", icon: Video },
                { id: "photos", label: "PHOTOS", icon: Camera },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveType(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold uppercase transition ${
                    activeType === tab.id
                      ? "bg-[#1E1B1A] text-white shadow-none"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="uppercase font-bold">Sort:</span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value as any)}
              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 focus:outline-none"
            >
              <option value="latest">Latest First</option>
              <option value="most_read">Most Read</option>
            </select>
          </div>
        </div>

        {/* Search Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="py-12 text-center text-gray-400">
              <div className="inline-block w-6 h-6 border-2 border-[#1E1B1A] dark:border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-xs font-mono">Searching Leadjen Media archives...</p>
            </div>
          )}

          {/* Search Results Display */}
          {!loading && query && totalResultsCount > 0 && (
            <div className="space-y-6">
              {/* Articles Group */}
              {articles.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                    Articles ({articles.length})
                  </span>
                  <div className="space-y-2">
                    {articles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/${article.category?.slug || "news"}/${article.slug}`}
                        onClick={onClose}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/70 transition group border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                      >
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-20 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-200 dark:border-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                            {article.category?.name}
                          </span>
                          <h4 className="text-sm font-serif font-bold text-gray-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition line-clamp-1">
                            {article.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 font-sans">
                            {article.excerpt}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition self-center" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Group */}
              {videos.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                    Video Reports ({videos.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {videos.map((vid) => (
                      <Link
                        key={vid.id}
                        href="/videos"
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/70 transition border border-gray-100 dark:border-gray-800"
                      >
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-neutral-900 text-neutral-300 rounded font-bold">
                            {vid.duration}
                          </span>
                          <h5 className="text-xs font-serif font-bold text-gray-900 dark:text-white line-clamp-1 mt-1">
                            {vid.title}
                          </h5>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-center border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-xs font-mono font-bold text-black dark:text-white hover:underline uppercase"
                >
                  View all full search results for &quot;{query}&quot; →
                </button>
              </div>
            </div>
          )}

          {/* Initial State: Trending Searches */}
          {!loading && !query && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-black dark:text-white" />
                  <span className="text-xs uppercase font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400">
                    TRENDING SEARCH TOPICS
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Semiconductor Policy",
                    "Artificial Intelligence",
                    "Global Economy & Trade",
                    "Space Exploration",
                    "Cricket World Cup",
                    "Renewable Energy Grid",
                    "Central Bank Rates",
                    "Investigative Reports",
                  ].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setQuery(topic)}
                      className="text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-[#1E1B1A]/10 dark:hover:bg-neutral-700 hover:text-[#1E1B1A] dark:hover:text-white text-gray-700 dark:text-gray-300 px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 border border-transparent"
                    >
                      <Tag className="w-3 h-3 text-black dark:text-white" />
                      <span>{topic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 block mb-3">
                  QUICK DESKS
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {["India", "World", "Politics", "Business", "Technology", "Science", "Videos", "Listen"].map(
                    (d) => (
                      <Link
                        key={d}
                        href={d === "Videos" ? "/videos" : d === "Listen" ? "/listen" : `/${d.toLowerCase()}`}
                        onClick={onClose}
                        className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 hover:bg-[#1E1B1A] hover:text-white transition text-center font-bold text-gray-700 dark:text-gray-300 uppercase"
                      >
                        {d}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty Results State */}
          {!loading && query && totalResultsCount === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                No results found matching &quot;{query}&quot;
              </p>
              <p className="text-xs mt-1.5 max-w-sm mx-auto font-sans">
                Try searching for broader keywords, category names, or check your spelling.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
