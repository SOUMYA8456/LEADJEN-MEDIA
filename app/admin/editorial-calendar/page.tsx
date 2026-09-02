"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Edit,
  Plus,
  Filter,
  CheckCircle,
  FileText,
  X,
  ExternalLink,
  Megaphone,
  Radio,
  Video,
} from "lucide-react";

interface CalendarItem {
  id: string;
  type: "ARTICLE" | "BREAKING" | "ADVERTISEMENT" | "VIDEO";
  title: string;
  subtitle?: string;
  status: string;
  scheduledTime: string;
  categoryOrLocation?: string;
  authorOrBrand?: string;
  editUrl: string;
}

export default function EditorialCalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK" | "DAY">("MONTH");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [articlesRes, breakingRes, adsRes] = await Promise.all([
        fetch("/api/articles?limit=150&status=ALL").then((r) => r.json()).catch(() => ({ articles: [] })),
        fetch("/api/breaking?admin=true").then((r) => r.json()).catch(() => ({ breaking: [] })),
        fetch("/api/ads?admin=true").then((r) => r.json()).catch(() => ({ ads: [] })),
      ]);

      const unifiedItems: CalendarItem[] = [];

      if (articlesRes.articles) {
        articlesRes.articles.forEach((art: any) => {
          const scheduledTime = art.scheduledAt || art.publishedAt || art.updatedAt || art.createdAt;
          unifiedItems.push({
            id: art.id,
            type: "ARTICLE",
            title: art.title,
            status: art.status,
            scheduledTime,
            categoryOrLocation: art.category?.name || "News",
            authorOrBrand: art.author?.name || "Staff",
            editUrl: `/admin/articles/${art.id}/edit`,
          });
        });
      }

      if (breakingRes.breaking) {
        breakingRes.breaking.forEach((b: any) => {
          const scheduledTime = b.startTime || b.createdAt;
          unifiedItems.push({
            id: b.id,
            type: "BREAKING",
            title: b.title,
            status: b.isActive ? "ACTIVE" : "INACTIVE",
            scheduledTime,
            categoryOrLocation: `Priority ${b.priority || "HIGH"}`,
            authorOrBrand: "Editorial Desk",
            editUrl: `/admin/breaking`,
          });
        });
      }

      if (adsRes.ads) {
        adsRes.ads.forEach((ad: any) => {
          const scheduledTime = ad.startDate || ad.createdAt;
          unifiedItems.push({
            id: ad.id,
            type: "ADVERTISEMENT",
            title: ad.name,
            status: ad.computedStatus || ad.status,
            scheduledTime,
            categoryOrLocation: ad.location,
            authorOrBrand: ad.advertiser || "Direct Partner",
            editUrl: `/admin/advertisements/${ad.id}/edit`,
          });
        });
      }

      setItems(unifiedItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "MONTH") d.setMonth(d.getMonth() - 1);
    else if (viewMode === "WEEK") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "MONTH") d.setMonth(d.getMonth() + 1);
    else if (viewMode === "WEEK") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().slice(0, 10);
    return items.filter((item) => {
      if (typeFilter !== "ALL" && item.type !== typeFilter) return false;
      const targetDateStr = item.scheduledTime ? item.scheduledTime.slice(0, 10) : "";
      return targetDateStr === dateStr;
    });
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    monthDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(new Date(year, month, i));
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="bg-black text-white p-6 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-red-600/20 text-red-500 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold block">
                NEWSROOM PLANNING & DISPATCH
              </span>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
                EDITORIAL CALENDAR
              </h1>
            </div>
          </div>
          <p className="text-xs text-neutral-400 font-sans mt-2">
            Multi-track timeline displaying scheduled articles, breaking news releases, advertising campaigns, and media briefings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/articles/create"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-md shadow-red-950"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </Link>
          <Link
            href="/admin/advertisements/create"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-mono font-bold uppercase border border-neutral-800"
          >
            <Megaphone className="w-4 h-4 text-red-500" />
            <span>Schedule Ad</span>
          </Link>
        </div>
      </div>

      {/* Control Bar: View Switcher, Month Navigation, Type Filter */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white border-x border-neutral-200 dark:border-neutral-800"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="font-serif font-black text-lg sm:text-xl text-black dark:text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* View Mode & Type Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase focus:outline-none"
          >
            <option value="ALL">ALL PIPELINES</option>
            <option value="ARTICLE">ARTICLES ONLY</option>
            <option value="BREAKING">BREAKING NEWS</option>
            <option value="ADVERTISEMENT">ADVERTISEMENTS</option>
          </select>

          {/* View Modes */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            {(["MONTH", "WEEK", "DAY"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                  viewMode === m
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month Calendar Grid */}
      {viewMode === "MONTH" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 text-center py-2.5 font-mono text-[10px] font-bold uppercase text-neutral-500">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-200 dark:divide-neutral-800">
            {monthDays.map((date, idx) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[110px] bg-neutral-50/50 dark:bg-neutral-950/40 p-2"
                  ></div>
                );
              }

              const dayItems = getItemsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-[110px] p-2 transition space-y-1.5 ${
                    isToday ? "bg-red-50/30 dark:bg-red-950/10" : "bg-white dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? "w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"
                          : "text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[9px] font-mono text-neutral-400 font-bold">
                        {dayItems.length} items
                      </span>
                    )}
                  </div>

                  {/* Items list for this day */}
                  <div className="space-y-1 overflow-y-auto max-h-24 no-scrollbar">
                    {dayItems.map((item) => {
                      const typeIcon =
                        item.type === "BREAKING" ? "🔴" : item.type === "ADVERTISEMENT" ? "📢" : "📄";

                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 rounded bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 hover:border-black dark:hover:border-white cursor-pointer transition text-left"
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-[9px]">{typeIcon}</span>
                            <span className="text-[10px] font-serif font-bold text-black dark:text-white truncate">
                              {item.title}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day View */}
      {viewMode !== "MONTH" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-serif font-black text-lg text-black dark:text-white">
            Scheduled Pipeline — {currentDate.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </h3>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {getItemsForDate(currentDate).length === 0 ? (
              <div className="py-8 text-center text-neutral-400 font-mono text-xs italic">
                No articles, breaking news or advertisements scheduled on this date.
              </div>
            ) : (
              getItemsForDate(currentDate).map((item) => (
                <div key={`${item.type}-${item.id}`} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-neutral-500">
                        {item.type} • {item.categoryOrLocation}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        By {item.authorOrBrand}
                      </span>
                    </div>
                    <h4
                      onClick={() => setSelectedItem(item)}
                      className="font-serif font-bold text-base text-black dark:text-white hover:text-red-600 cursor-pointer"
                    >
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black rounded text-[10px] font-mono font-bold uppercase">
                      {item.status}
                    </span>
                    <Link
                      href={item.editUrl}
                      className="p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Item Quick Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-bold uppercase rounded">
                  {selectedItem.type}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Status: {selectedItem.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-neutral-500 font-bold block">
                {selectedItem.categoryOrLocation} • {selectedItem.authorOrBrand}
              </span>
              <h3 className="font-serif font-black text-xl text-black dark:text-white">
                {selectedItem.title}
              </h3>
              <div className="text-xs font-mono text-neutral-400 pt-2 space-y-1">
                <div>🕒 Target Time: {new Date(selectedItem.scheduledTime).toLocaleString("en-IN")} IST</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-mono font-bold uppercase"
              >
                Close
              </button>
              <Link
                href={selectedItem.editUrl}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
              >
                Open Manager
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
