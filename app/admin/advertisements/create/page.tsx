"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  ArrowLeft,
  Save,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Film,
  Image as ImageIcon,
  Code,
  Play,
  RotateCcw,
} from "lucide-react";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { AdCreativeRenderer } from "@/components/ads/AdBanner";
import { sanitizeVideoUrl } from "@/lib/storage";

const POSITIONS = [
  {
    id: "TOP_LEADERBOARD",
    name: "Top Leaderboard",
    description: "Prominent banner displayed above the main header and logo navigation.",
    desktopSize: "970 × 250 px",
    tabletSize: "728 × 90 px",
    mobileSize: "320 × 100 px",
    diagram: "TOP_BAR",
  },
  {
    id: "HEADER_AD",
    name: "Header Ad",
    description: "Placed inside the header navigation row alongside live clock & tools.",
    desktopSize: "728 × 90 px",
    tabletSize: "468 × 60 px",
    mobileSize: "320 × 50 px",
    diagram: "HEADER_ROW",
  },
  {
    id: "HOMEPAGE_CONTENT",
    name: "Homepage Content Ad",
    description: "In-stream banner separating dynamic homepage category news sections.",
    desktopSize: "970 × 250 px",
    tabletSize: "728 × 90 px",
    mobileSize: "300 × 250 px",
    diagram: "CONTENT_ROW",
  },
  {
    id: "SIDEBAR_AD",
    name: "Sidebar Ad",
    description: "Sticky vertical display ad in right-hand sidebar alongside trending stories.",
    desktopSize: "300 × 250 / 600 px",
    tabletSize: "300 × 250 px",
    mobileSize: "300 × 250 px",
    diagram: "SIDEBAR_COL",
  },
  {
    id: "IN_ARTICLE_AD",
    name: "In Article Ad",
    description: "Contextual ad embedded between editorial paragraphs on article reading pages.",
    desktopSize: "728 × 90 px",
    tabletSize: "600 × 120 px",
    mobileSize: "300 × 250 px",
    diagram: "ARTICLE_INLINE",
  },
  {
    id: "MOBILE_AD",
    name: "Mobile Sticky Ad",
    description: "Optimized banner pinned to the bottom of smartphone viewports.",
    desktopSize: "Hidden",
    tabletSize: "320 × 50 px",
    mobileSize: "320 × 50 / 100 px",
    diagram: "MOBILE_PIN",
  },
  {
    id: "FOOTER_AD",
    name: "Footer Ad",
    description: "Wide leaderboard banner placed immediately above footer dispatches.",
    desktopSize: "970 × 90 px",
    tabletSize: "728 × 90 px",
    mobileSize: "320 × 50 px",
    diagram: "FOOTER_BAR",
  },
];

export default function CreateAdvertisementPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    advertiser: "",
    campaignName: "",
    creativeType: "IMAGE", // IMAGE, VIDEO, HTML
    location: "TOP_LEADERBOARD",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=250&q=80",
    desktopImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=250&q=80",
    tabletImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=728&h=90&q=80",
    mobileImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=320&h=100&q=80",
    destinationUrl: "https://leadjenmedia.com/partner",
    htmlContent: "",
    priority: 50,
    status: "ACTIVE",
    device: "ALL",
    rotationMode: "SINGLE",
    rotationInterval: 10,
    startDate: "",
    endDate: "",
    maxImpressions: "",
    maxClicks: "",
    isActive: true,
  });

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<"desktop" | "tablet" | "mobile" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaLibraryTarget, setMediaLibraryTarget] = useState<"desktop" | "tablet" | "mobile" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPosition = POSITIONS.find((p) => p.id === formData.location) || POSITIONS[0];

  const handleCreativeFileUpload = async (
    file: File,
    target: "desktop" | "tablet" | "mobile"
  ) => {
    if (!file) return;
    setUploadingTarget(target);
    setUploadProgress(20);
    setError(null);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 150);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "desktop") {
          setFormData((prev) => ({
            ...prev,
            desktopImage: data.url,
            imageUrl: data.url,
          }));
        } else if (target === "tablet") {
          setFormData((prev) => ({ ...prev, tabletImage: data.url }));
        } else if (target === "mobile") {
          setFormData((prev) => ({ ...prev, mobileImage: data.url }));
        }
        setTimeout(() => {
          setUploadingTarget(null);
          setUploadProgress(0);
        }, 300);
      } else {
        setUploadingTarget(null);
        setError(data.error || "Failed to upload creative asset");
      }
    } catch (err) {
      clearInterval(interval);
      setUploadingTarget(null);
      setError("Network error uploading ad creative");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create advertisement");
      }

      router.push("/admin/advertisements");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/advertisements"
            className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="px-2 py-0.5 bg-black text-white text-[9px] font-mono font-bold uppercase rounded">
              ADVERTISING STUDIO
            </span>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-0.5">
              Create New Advertisement
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? "Saving..." : "Save & Launch Ad"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-800 rounded-2xl flex items-center gap-2 text-xs font-mono text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Placement & Campaign Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. VISUAL PLACEMENT SELECTOR */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-black dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-black dark:text-white" />
                  1. Viewport Placement Slot
                </h3>
                <p className="text-xs font-mono text-neutral-400">
                  Select the exact layout position for this campaign
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POSITIONS.map((pos) => {
                const isSelected = formData.location === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, location: pos.id })}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? "border-black dark:border-white bg-black/5 dark:bg-white/5 ring-1 ring-black dark:ring-white"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-black dark:text-white">
                          {pos.name}
                        </span>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-black dark:text-white" />}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                        {pos.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 mt-2 block">
                      Desktop: {pos.desktopSize}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CREATIVE TYPE SELECTION */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              2. Creative Type & Source
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, creativeType: "IMAGE" })}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  formData.creativeType === "IMAGE"
                    ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-xs font-mono">IMAGE BANNER</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, creativeType: "VIDEO" })}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  formData.creativeType === "VIDEO"
                    ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                }`}
              >
                <Film className="w-5 h-5" />
                <span className="text-xs font-mono">VIDEO AD</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, creativeType: "HTML" })}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  formData.creativeType === "HTML"
                    ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                }`}
              >
                <Code className="w-5 h-5" />
                <span className="text-xs font-mono">CUSTOM HTML</span>
              </button>
            </div>

            {/* IF VIDEO AD */}
            {formData.creativeType === "VIDEO" && (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-black dark:text-white mb-1">
                    Secure Video Stream URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or MP4 URL"
                    value={formData.destinationUrl}
                    onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                    className="w-full text-xs p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-black dark:text-white font-mono focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                    ✓ Validated for YouTube, Vimeo, MP4 and Cloudinary videos (no javascript: or executable schemes).
                  </span>
                </div>
              </div>
            )}

            {/* IF IMAGE AD */}
            {formData.creativeType === "IMAGE" && (
              <div className="space-y-4">
                {/* Desktop Creative Upload */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                      Desktop Creative Asset (Primary) *
                    </span>
                    <button
                      type="button"
                      onClick={() => setMediaLibraryTarget("desktop")}
                      className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>From Media Library</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono cursor-pointer hover:border-black dark:hover:border-white transition">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingTarget === "desktop" ? `Uploading (${uploadProgress}%)` : "Upload Desktop Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCreativeFileUpload(file, "desktop");
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="url"
                    placeholder="Or enter image URL https://..."
                    value={formData.desktopImage}
                    onChange={(e) =>
                      setFormData({ ...formData, desktopImage: e.target.value, imageUrl: e.target.value })
                    }
                    className="w-full text-xs p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-black dark:text-white font-mono focus:outline-none"
                  />
                </div>

                {/* Tablet Creative */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                      Tablet Creative (Optional - Fallbacks to Desktop)
                    </span>
                    <button
                      type="button"
                      onClick={() => setMediaLibraryTarget("tablet")}
                      className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>From Media Library</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.tabletImage}
                    onChange={(e) => setFormData({ ...formData, tabletImage: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-black dark:text-white font-mono focus:outline-none"
                  />
                </div>

                {/* Mobile Creative */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                      Mobile Creative (Optional - Fallbacks to Desktop)
                    </span>
                    <button
                      type="button"
                      onClick={() => setMediaLibraryTarget("mobile")}
                      className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>From Media Library</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.mobileImage}
                    onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-black dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* IF HTML AD */}
            {formData.creativeType === "HTML" && (
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase text-black dark:text-white">
                  Custom HTML Markup
                </label>
                <textarea
                  rows={4}
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  placeholder="<div>Sponsored content banner</div>"
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* 3. CAMPAIGN METADATA */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              3. Campaign Metadata & Destination
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                  Advertisement Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leadjen Executive Summit 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                  Advertiser / Brand Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Cloud Corp"
                  value={formData.advertiser}
                  onChange={(e) => setFormData({ ...formData, advertiser: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                Destination Click URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/promo"
                value={formData.destinationUrl}
                onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Multi-Device Preview & Scheduling (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* LIVE MULTI-DEVICE PREVIEW */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-serif font-bold text-sm text-black dark:text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Live Responsive Preview
              </span>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg transition ${
                    previewDevice === "desktop"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
                  title="Desktop Viewport (1440px)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-1.5 rounded-lg transition ${
                    previewDevice === "tablet"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
                  title="Tablet Viewport (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg transition ${
                    previewDevice === "mobile"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
                  title="Mobile Viewport (390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div
              className={`mx-auto bg-neutral-100 dark:bg-neutral-950 rounded-xl p-3 border border-neutral-200 dark:border-neutral-800 transition-all ${
                previewDevice === "desktop"
                  ? "w-full"
                  : previewDevice === "tablet"
                  ? "w-[85%]"
                  : "w-[65%]"
              }`}
            >
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block text-center mb-1">
                Preview: {selectedPosition.name} ({previewDevice.toUpperCase()})
              </span>

              <AdCreativeRenderer ad={formData} />
            </div>

            {/* Scheduling & Priority Settings */}
            <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs font-mono">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Status & Delivery
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase font-bold focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (LIVE DELIVERING)</option>
                  <option value="SCHEDULED">SCHEDULED DATES</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Start Date (IST)
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    End Date (IST)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Priority Weight (1 to 100 - Higher Wins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 50 })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Media Library Selector Modal */}
      <MediaLibraryModal
        isOpen={Boolean(mediaLibraryTarget)}
        onClose={() => setMediaLibraryTarget(null)}
        onSelect={(selectedUrl) => {
          if (mediaLibraryTarget === "desktop") {
            setFormData((prev) => ({
              ...prev,
              desktopImage: selectedUrl,
              imageUrl: selectedUrl,
            }));
          } else if (mediaLibraryTarget === "tablet") {
            setFormData((prev) => ({ ...prev, tabletImage: selectedUrl }));
          } else if (mediaLibraryTarget === "mobile") {
            setFormData((prev) => ({ ...prev, mobileImage: selectedUrl }));
          }
          setMediaLibraryTarget(null);
        }}
        title="Select Advertisement Creative Asset"
      />
    </div>
  );
}
