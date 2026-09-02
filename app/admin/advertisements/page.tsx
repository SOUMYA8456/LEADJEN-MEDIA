"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  PlusCircle,
  BarChart3,
  ExternalLink,
  Eye,
  MousePointer,
  Percent,
  Calendar,
  Layers,
  Edit,
  Trash2,
  Copy,
  PauseCircle,
  PlayCircle,
  Archive,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Search,
} from "lucide-react";
import { formatTimeAgo, formatArticleDate } from "@/lib/utils";

interface Advertisement {
  id: string;
  name: string;
  advertiser: string | null;
  campaignName: string | null;
  creativeType: string;
  location: string;
  imageUrl: string;
  desktopImage: string | null;
  tabletImage: string | null;
  mobileImage: string | null;
  destinationUrl: string;
  htmlContent: string | null;
  priority: number;
  status: string;
  computedStatus: string;
  device: string;
  rotationMode: string;
  rotationInterval: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  clickCount: number;
  viewCount: number;
  ctr: number;
  createdAt: string;
}

export default function AdvertisementsDashboard() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ads?admin=true`);
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch (err) {
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  // Metrics
  const activeAds = ads.filter((a) => a.computedStatus === "ACTIVE" && a.isActive);
  const scheduledAds = ads.filter((a) => a.computedStatus === "SCHEDULED");
  const expiredAds = ads.filter((a) => a.computedStatus === "EXPIRED");
  const draftAds = ads.filter((a) => a.status === "DRAFT");
  const totalImpressions = ads.reduce((acc, a) => acc + (a.viewCount || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clickCount || 0), 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  // Filtered ads
  const filteredAds = ads.filter((ad) => {
    if (activeTab === "ACTIVE" && ad.computedStatus !== "ACTIVE") return false;
    if (activeTab === "SCHEDULED" && ad.computedStatus !== "SCHEDULED") return false;
    if (activeTab === "DRAFT" && ad.status !== "DRAFT") return false;
    if (activeTab === "EXPIRED" && ad.computedStatus !== "EXPIRED") return false;
    if (activeTab === "PAUSED" && ad.computedStatus !== "PAUSED") return false;

    if (positionFilter !== "ALL" && ad.location !== positionFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ad.name.toLowerCase().includes(q) ||
        (ad.advertiser && ad.advertiser.toLowerCase().includes(q)) ||
        (ad.campaignName && ad.campaignName.toLowerCase().includes(q)) ||
        ad.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      setActionLoading(ad.id);
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !ad.isActive }),
      });
      if (res.ok) {
        showNotification(ad.isActive ? "Ad paused" : "Ad resumed and serving");
        await fetchAds();
      } else {
        const err = await res.json();
        showNotification(err.error || "Failed to update ad", "error");
      }
    } catch (e) {
      showNotification("Network error", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (ad: Advertisement) => {
    try {
      setActionLoading(ad.id);
      const res = await fetch(`/api/ads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${ad.name} (Copy)`,
          advertiser: ad.advertiser,
          campaignName: ad.campaignName,
          creativeType: ad.creativeType,
          location: ad.location,
          imageUrl: ad.imageUrl,
          desktopImage: ad.desktopImage,
          tabletImage: ad.tabletImage,
          mobileImage: ad.mobileImage,
          destinationUrl: ad.destinationUrl,
          htmlContent: ad.htmlContent,
          priority: ad.priority,
          status: "DRAFT",
          device: ad.device,
          rotationMode: ad.rotationMode,
          rotationInterval: ad.rotationInterval,
          isActive: false,
        }),
      });
      if (res.ok) {
        showNotification("Ad campaign duplicated as draft");
        await fetchAds();
      }
    } catch {
      showNotification("Failed to duplicate", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (ad: Advertisement) => {
    try {
      setActionLoading(ad.id);
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED", isActive: false }),
      });
      if (res.ok) {
        showNotification("Ad campaign archived");
        await fetchAds();
      }
    } catch {
      showNotification("Failed to archive", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (ad: Advertisement) => {
    if (!confirm(`Are you sure you want to permanently delete "${ad.name}"?`)) return;
    try {
      setActionLoading(ad.id);
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showNotification("Ad campaign deleted");
        await fetchAds();
      }
    } catch {
      showNotification("Failed to delete", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-black text-white border-neutral-700"
              : "bg-red-600 text-white border-red-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="w-4 h-4 text-red-500" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-mono font-bold uppercase rounded-md tracking-wider">
              MONETIZATION
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Campaigns & Placements Engine
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-1">
            Advertisement Manager
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/advertisements/analytics"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Ad Analytics</span>
          </Link>
          <Link
            href="/admin/homepage"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <Layers className="w-4 h-4" />
            <span>Homepage Placements</span>
          </Link>
          <Link
            href="/admin/advertisements/create"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Advertisement</span>
          </Link>
        </div>
      </div>

      {/* 7 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Active */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Active Ads</span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
            {activeAds.length}
          </div>
          <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Live in rotation</span>
        </div>

        {/* Scheduled */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Scheduled</span>
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
            {scheduledAds.length}
          </div>
          <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Upcoming launches</span>
        </div>

        {/* Expired */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Expired</span>
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-neutral-500">
            {expiredAds.length}
          </div>
          <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Auto-retired</span>
        </div>

        {/* Draft */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Drafts</span>
            <Edit className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
            {draftAds.length}
          </div>
          <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Not published</span>
        </div>

        {/* Impressions */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Impressions</span>
            <Eye className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
            {totalImpressions >= 1000 ? `${(totalImpressions / 1000).toFixed(1)}K` : totalImpressions}
          </div>
          <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Delivered views</span>
        </div>

        {/* Clicks */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Clicks</span>
            <MousePointer className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-black dark:text-white">
            {totalClicks.toLocaleString()}
          </div>
          <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Engagements</span>
        </div>

        {/* CTR */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Avg CTR</span>
            <Percent className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-red-600">
            {overallCtr}%
          </div>
          <span className="text-[9px] text-neutral-500 font-mono mt-0.5 block">Click conversion</span>
        </div>
      </div>

      {/* Control Bar: Filter Tabs, Search & Placement Filter */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-mono font-bold uppercase">
            {[
              { label: `All (${ads.length})`, value: "ALL" },
              { label: `Active (${activeAds.length})`, value: "ACTIVE" },
              { label: `Scheduled (${scheduledAds.length})`, value: "SCHEDULED" },
              { label: `Draft (${draftAds.length})`, value: "DRAFT" },
              { label: `Expired (${expiredAds.length})`, value: "EXPIRED" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl transition ${
                  activeTab === tab.value
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Position filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campaigns, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-xs pl-8 pr-3 py-1.5 rounded-xl border-none focus:ring-1 focus:ring-black dark:focus:ring-white font-mono"
              />
            </div>

            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-xs px-3 py-1.5 rounded-xl border-none font-mono"
            >
              <option value="ALL">All Positions</option>
              <option value="TOP_LEADERBOARD">Top Leaderboard</option>
              <option value="HEADER_AD">Header Ad</option>
              <option value="HOMEPAGE_CONTENT">Homepage Content</option>
              <option value="SIDEBAR_AD">Sidebar Ad</option>
              <option value="IN_ARTICLE_AD">In Article Ad</option>
              <option value="MOBILE_AD">Mobile Ad</option>
              <option value="FOOTER_AD">Footer Ad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advertisements List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-xs">
            Loading advertisements repository...
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Megaphone className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
            <p className="font-serif text-base text-black dark:text-white">No advertisements found</p>
            <p className="text-xs font-mono mt-1">Create a new campaign or adjust your filters.</p>
            <Link
              href="/admin/advertisements/create"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase"
            >
              <PlusCircle className="w-4 h-4" /> Create Ad
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                  <th className="py-3 px-4 font-semibold">Creative & Campaign</th>
                  <th className="py-3 px-4 font-semibold">Position</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Schedule</th>
                  <th className="py-3 px-4 font-semibold">Performance</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredAds.map((ad) => {
                  const statusBg =
                    ad.computedStatus === "ACTIVE"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : ad.computedStatus === "SCHEDULED"
                      ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                      : ad.computedStatus === "PAUSED"
                      ? "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      : ad.computedStatus === "EXPIRED"
                      ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-800/50"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800";

                  return (
                    <tr key={ad.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[240px]">
                          <div className="w-16 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                            <img
                              src={ad.imageUrl}
                              alt={ad.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif font-bold text-sm text-black dark:text-white line-clamp-1">
                              {ad.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono mt-0.5">
                              <span>Brand: {ad.advertiser || "Direct"}</span>
                              <span>•</span>
                              <span>P{ad.priority}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {ad.location.replace("_", " ")}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-mono block mt-0.5">
                          Device: {ad.device}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${statusBg}`}>
                          {ad.computedStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[10px] text-neutral-500">
                        <div>
                          Start: {ad.startDate ? formatArticleDate(ad.startDate) : "Immediate"}
                        </div>
                        <div>
                          End: {ad.endDate ? formatArticleDate(ad.endDate) : "Indefinite"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[9px] text-neutral-400 block">IMPR</span>
                            <span className="font-bold text-black dark:text-white">
                              {ad.viewCount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 block">CLICKS</span>
                            <span className="font-bold text-black dark:text-white">
                              {ad.clickCount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 block">CTR</span>
                            <span className="font-bold text-red-600">{ad.ctr}%</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewAd(ad);
                            setPreviewDevice("desktop");
                          }}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg transition"
                          title="Preview Creative on Devices"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(ad)}
                          disabled={actionLoading === ad.id}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg transition"
                          title={ad.isActive ? "Pause Serving" : "Resume Serving"}
                        >
                          {ad.isActive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(ad)}
                          disabled={actionLoading === ad.id}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg transition"
                          title="Duplicate Campaign"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/admin/advertisements/${ad.id}/edit`}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg transition inline-block"
                          title="Edit Campaign"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleArchive(ad)}
                          disabled={actionLoading === ad.id}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg transition"
                          title="Archive Campaign"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(ad)}
                          disabled={actionLoading === ad.id}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-600 hover:text-white rounded-lg transition"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Device Ad Preview Modal */}
      {previewAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-black text-white text-[9px] font-mono font-bold uppercase rounded">
                    {previewAd.location.replace("_", " ")}
                  </span>
                  <h3 className="font-serif font-bold text-base text-black dark:text-white">
                    {previewAd.name}
                  </h3>
                </div>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                  Target Destination: {previewAd.destinationUrl}
                </p>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-neutral-200 dark:bg-neutral-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      previewDevice === "desktop" ? "bg-black text-white dark:bg-white dark:text-black" : "text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("tablet")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      previewDevice === "tablet" ? "bg-black text-white dark:bg-white dark:text-black" : "text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" /> Tablet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      previewDevice === "mobile" ? "bg-black text-white dark:bg-white dark:text-black" : "text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewAd(null)}
                  className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Device Simulation */}
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-100 dark:bg-neutral-950 flex flex-col items-center justify-center">
              <div
                className={`transition-all duration-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-4 shadow-xl flex flex-col items-center ${
                  previewDevice === "desktop"
                    ? "w-full max-w-3xl"
                    : previewDevice === "tablet"
                    ? "w-[600px]"
                    : "w-[340px]"
                }`}
              >
                <div className="w-full text-center pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                    Advertisement Preview ({previewDevice.toUpperCase()})
                  </span>
                </div>

                <div className="relative w-full rounded-lg overflow-hidden group">
                  <img
                    src={
                      previewDevice === "mobile" && previewAd.mobileImage
                        ? previewAd.mobileImage
                        : previewDevice === "tablet" && previewAd.tabletImage
                        ? previewAd.tabletImage
                        : previewAd.desktopImage || previewAd.imageUrl
                    }
                    alt={previewAd.name}
                    className="w-full h-auto max-h-[260px] object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-white text-[9px] font-mono uppercase rounded">
                    Sponsored • {previewAd.advertiser || "Direct Partner"}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="text-xs font-mono text-neutral-500">
                Placement: <span className="font-bold text-black dark:text-white">{previewAd.location}</span> • Priority: P{previewAd.priority}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewAd.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Destination (New Tab)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewAd(null)}
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
