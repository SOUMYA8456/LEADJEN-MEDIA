"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Headphones,
  Play,
  Pause,
  Clock,
} from "lucide-react";

interface AudioEpisode {
  id: string;
  title: string;
  series: string;
  duration: string;
  publishedAt: string;
  description: string;
  coverImage: string;
  category: string;
  host: string;
}

const FEATURED_EPISODES: AudioEpisode[] = [
  {
    id: "ep-1",
    title: "Leadjen Daily Brief: Global Trade Policy Shifts, Semiconductor Corridors & Market Open",
    series: "Leadjen Daily Brief",
    duration: "08:45",
    publishedAt: "Today • 06:30 AM IST",
    description:
      "An executive morning briefing breaking down India's high-tech manufacturing push, energy security agreements, and key market indicators for the trading session ahead.",
    coverImage:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    category: "Daily Briefing",
    host: "Aarav Sharma & Editorial Desk",
  },
  {
    id: "ep-2",
    title: "Inside the AI Sovereign Compute Race: How Nations Are Building National Infrastructure",
    series: "Tech Dispatches",
    duration: "24:18",
    publishedAt: "Yesterday",
    description:
      "An investigative deep dive into the massive capital investments, silicon supply chains, and power grid bottlenecks shaping modern computing dominance.",
    coverImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    category: "Technology",
    host: "Vikram Malhotra",
  },
  {
    id: "ep-3",
    title: "The Closing Bell: Central Bank Rate Trajectories and Asian Equity Momentum",
    series: "Business & Markets",
    duration: "14:20",
    publishedAt: "Aug 30, 2026",
    description:
      "Comprehensive market recap analyzing foreign institutional flows, currency valuations, and major earnings reports.",
    coverImage:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    category: "Business",
    host: "Priya Nair",
  },
  {
    id: "ep-4",
    title: "Geopolitics Unfolded: Maritime Security Corridors and Southern Hemisphere Trade Routes",
    series: "World Brief",
    duration: "19:50",
    publishedAt: "Aug 29, 2026",
    description:
      "Foreign affairs editors analyze naval diplomacy, supply chain diversification, and newly signed multilateral infrastructure pacts.",
    coverImage:
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
    category: "World",
    host: "Global Bureau Team",
  },
  {
    id: "ep-5",
    title: "Clean Grid Transition: The Real Engineering Challenges of Round-the-Clock Renewables",
    series: "Special Investigations",
    duration: "28:10",
    publishedAt: "Aug 28, 2026",
    description:
      "A technical yet accessible discussion on pumped hydro storage, battery chemistry breakthroughs, and high-voltage direct current transmission lines.",
    coverImage:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
    category: "Science",
    host: "Rohan Sengupta",
  },
];

export default function ListenPage() {
  const [episodes, setEpisodes] = useState<AudioEpisode[]>(FEATURED_EPISODES);
  const [activeEpisode, setActiveEpisode] = useState<AudioEpisode>(FEATURED_EPISODES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<"1x" | "1.25x" | "1.5x" | "2x">("1x");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/podcasts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.episodes) && data.episodes.length > 0) {
          setEpisodes(data.episodes);
          setActiveEpisode((current) => {
            const found = data.episodes.find((e: AudioEpisode) => e.id === current.id);
            return found || data.episodes[0];
          });
        }
      })
      .catch((err) => console.warn("[Listen Page] Podcasts fetch error:", err));
  }, []);

  const categories = ["ALL", "Daily Briefing", "Technology", "Business", "World", "Science"];

  const filteredEpisodes =
    selectedCategory === "ALL"
      ? episodes
      : episodes.filter((ep) => ep.category === selectedCategory);

  const togglePlay = (episode: AudioEpisode) => {
    if (activeEpisode.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveEpisode(episode);
      setIsPlaying(true);
    }
  };

  const cycleSpeed = () => {
    const speeds: ("1x" | "1.25x" | "1.5x" | "2x")[] = ["1x", "1.25x", "1.5x", "2x"];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-28">
      {/* Top Banner & Header */}
      <div className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-2">
                <Link href="/" className="hover:underline">
                  HOME
                </Link>
                <span>/</span>
                <span>AUDIO JOURNALISM & PODCASTS</span>
              </div>
              <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight uppercase">
                LEADJEN LISTEN
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-2xl font-sans leading-relaxed">
                Independent audio briefings, investigative podcasts, and expert policy analysis
                delivered daily by the Leadjen Media newsroom.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-neutral-900 text-neutral-300 border border-neutral-700 rounded-full text-xs font-mono font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                5 SERIES ACTIVE
              </span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-mono font-bold uppercase">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full transition ${
                  selectedCategory === cat
                    ? "bg-[#1E1B1A] text-white shadow-none border border-neutral-700"
                    : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Hero Episode Player Card */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-neutral-800/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-4 relative group">
              <img
                src={activeEpisode.coverImage}
                alt={activeEpisode.title}
                className="w-full aspect-square object-cover rounded-xl shadow-none border border-gray-700"
              />
              <button
                type="button"
                onClick={() => togglePlay(activeEpisode)}
                className="absolute inset-0 m-auto w-16 h-16 bg-white text-black hover:bg-neutral-200 rounded-full flex items-center justify-center shadow-none transition transform group-hover:scale-110"
                aria-label={isPlaying ? "Pause Episode" : "Play Episode"}
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1 fill-current" />}
              </button>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-white text-black text-[10px] font-mono font-bold uppercase rounded tracking-wider">
                  NOW PLAYING SPOTLIGHT
                </span>
                <span className="text-xs font-mono text-gray-400">{activeEpisode.series}</span>
                <span className="text-gray-600">•</span>
                <span className="text-xs font-mono text-gray-400">{activeEpisode.duration}</span>
              </div>

              <h2 className="font-serif font-black text-xl sm:text-2xl md:text-3xl text-white leading-tight">
                {activeEpisode.title}
              </h2>

              <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed">
                {activeEpisode.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-gray-800/80">
                <div className="text-xs text-gray-400 font-sans">
                  Hosted by: <strong className="text-white">{activeEpisode.host}</strong>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => togglePlay(activeEpisode)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1E1B1A] hover:bg-black text-white border border-neutral-700 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-none"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? "Pause Audio" : "Listen Now"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={cycleSpeed}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-mono font-bold transition border border-gray-700"
                    title="Playback Speed"
                  >
                    {playbackSpeed}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Podcast Episode Feed Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <Headphones className="w-5 h-5 text-neutral-400" />
              <h3 className="font-serif font-black text-xl text-white tracking-tight uppercase">
                ALL AUDIO DISPATCHES & EPISODES
              </h3>
            </div>
            <span className="text-xs font-mono text-gray-400">{filteredEpisodes.length} Episodes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEpisodes.map((ep) => {
              const isSelected = activeEpisode.id === ep.id;
              const isItemPlaying = isSelected && isPlaying;

              return (
                <div
                  key={ep.id}
                  onClick={() => togglePlay(ep)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                    isSelected
                      ? "bg-neutral-900 border-neutral-600 shadow-none"
                      : "bg-gray-900/70 border-gray-800 hover:border-gray-700 hover:bg-gray-900"
                  }`}
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-gray-700">
                    <img
                      src={ep.coverImage}
                      alt={ep.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-none">
                        {isItemPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5 fill-current" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                        {ep.series}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ep.duration}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-sm sm:text-base text-white hover:text-neutral-300 transition line-clamp-2">
                      {ep.title}
                    </h4>

                    <p className="text-xs text-gray-400 line-clamp-2 font-sans">
                      {ep.description}
                    </p>

                    <div className="pt-1 text-[11px] text-gray-400 font-mono flex items-center gap-2">
                      <span>{ep.publishedAt}</span>
                      <span>•</span>
                      <span>{ep.host}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Bottom Persistent Audio Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 p-3 sm:p-4 shadow-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={activeEpisode.coverImage}
              alt={activeEpisode.title}
              className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-gray-700"
            />
            <div className="min-w-0">
              <h4 className="font-serif font-bold text-xs sm:text-sm text-white truncate max-w-xs sm:max-w-md">
                {activeEpisode.title}
              </h4>
              <p className="text-[11px] text-gray-400 font-mono truncate">
                {activeEpisode.series} • {activeEpisode.duration}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 bg-white text-black hover:bg-neutral-200 rounded-full transition shadow-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
            </button>

            <button
              type="button"
              onClick={cycleSpeed}
              className="hidden sm:block px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-mono font-bold"
            >
              {playbackSpeed}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
