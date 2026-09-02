"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Layers,
  Trash2,
  Upload,
  Film,
  Image as ImageIcon,
  Code,
} from "lucide-react";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { AdCreativeRenderer } from "@/components/ads/AdBanner";

const POSITIONS = [
  { id: "TOP_LEADERBOARD", name: "Top Leaderboard", description: "Prominent banner displayed above the main header.", desktopSize: "970 × 250 px" },
  { id: "HEADER_AD", name: "Header Ad", description: "Placed inside the header navigation row.", desktopSize: "728 × 90 px" },
  { id: "HOMEPAGE_CONTENT", name: "Homepage Content Ad", description: "In-stream banner separating category news sections.", desktopSize: "970 × 250 px" },
  { id: "SIDEBAR_AD", name: "Sidebar Ad", description: "Sticky vertical display ad in right-hand sidebar.", desktopSize: "300 × 250 / 600 px" },
  { id: "IN_ARTICLE_AD", name: "In Article Ad", description: "Contextual ad embedded between article paragraphs.", desktopSize: "728 × 90 px" },
  { id: "MOBILE_AD", name: "Mobile Sticky Ad", description: "Optimized banner pinned to smartphone viewports.", desktopSize: "320 × 50 / 100 px" },
  { id: "FOOTER_AD", name: "Footer Ad", description: "Wide leaderboard banner immediately above footer.", desktopSize: "970 × 90 px" },
];

export default function EditAdvertisementPage() {
  const params = useParams();
  const router = useRouter();
  const adId = params.id as string;

  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<"desktop" | "tablet" | "mobile" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaLibraryTarget, setMediaLibraryTarget] = useState<"desktop" | "tablet" | "mobile" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAd() {
      try {
        setLoading(true);
        const res = await fetch(`/api/ads/${adId}`);
        if (res.ok) {
          const data = await res.json();
          const a = data.ad;
          setFormData({
            name: a.name || "",
            advertiser: a.advertiser || "",
            campaignName: a.campaignName || "",
            creativeType: a.creativeType || "IMAGE",
            location: a.location || "TOP_LEADERBOARD",
            imageUrl: a.imageUrl || "",
            desktopImage: a.desktopImage || a.imageUrl || "",
            tabletImage: a.tabletImage || "",
            mobileImage: a.mobileImage || "",
            destinationUrl: a.destinationUrl || "",
            htmlContent: a.htmlContent || "",
            priority: a.priority || 50,
            status: a.status || "ACTIVE",
            device: a.device || "ALL",
            rotationMode: a.rotationMode || "SINGLE",
            rotationInterval: a.rotationInterval || 10,
            startDate: a.startDate ? new Date(a.startDate).toISOString().slice(0, 10) : "",
            endDate: a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : "",
            maxImpressions: a.maxImpressions || "",
            maxClicks: a.maxClicks || "",
            isActive: a.isActive ?? true,
          });
        } else {
          setError("Advertisement not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load advertisement.");
      } finally {
        setLoading(false);
      }
    }
    loadAd();
  }, [adId]);

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
          setFormData((prev: any) => ({
            ...prev,
            desktopImage: data.url,
            imageUrl: data.url,
          }));
        } else if (target === "tablet") {
          setFormData((prev: any) => ({ ...prev, tabletImage: data.url }));
        } else if (target === "mobile") {
          setFormData((prev: any) => ({ ...prev, mobileImage: data.url }));
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
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/ads/${adId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update advertisement");
      }

      setSuccessMsg("Advertisement campaign updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs font-mono text-neutral-400">
        Loading campaign settings...
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-8 text-center text-red-500 font-mono text-xs">
        {error || "Advertisement not found."}
      </div>
    );
  }

  const selectedPosition = POSITIONS.find((p) => p.id === formData.location) || POSITIONS[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24 font-sans">
      {/* Header */}
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
              CAMPAIGN EDITOR
            </span>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-0.5">
              Edit Advertisement
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
          <span>{submitting ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-800 rounded-2xl flex items-center gap-2 text-xs font-mono text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-black text-white border border-neutral-700 rounded-2xl flex items-center gap-2 text-xs font-mono">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. VIEWPORT PLACEMENT */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              1. Viewport Placement Slot
            </h3>
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CREATIVE TYPE & SOURCE */}
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

            {/* VIDEO CREATIVE */}
            {formData.creativeType === "VIDEO" && (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
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
              </div>
            )}

            {/* IMAGE CREATIVES */}
            {formData.creativeType === "IMAGE" && (
              <div className="space-y-4">
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

                  <label className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono cursor-pointer hover:border-black dark:hover:border-white transition">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingTarget === "desktop" ? `Uploading (${uploadProgress}%)` : "Upload New File"}</span>
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

                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.desktopImage}
                    onChange={(e) =>
                      setFormData({ ...formData, desktopImage: e.target.value, imageUrl: e.target.value })
                    }
                    className="w-full text-xs p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-black dark:text-white font-mono focus:outline-none"
                  />
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                      Tablet Creative (Optional)
                    </span>
                    <button
                      type="button"
                      onClick={() => setMediaLibraryTarget("tablet")}
                      className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>From Library</span>
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

                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                      Mobile Creative (Optional)
                    </span>
                    <button
                      type="button"
                      onClick={() => setMediaLibraryTarget("mobile")}
                      className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>From Library</span>
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
                value={formData.destinationUrl}
                onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-serif font-bold text-sm text-black dark:text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Live Responsive Preview
              </span>

              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg transition ${
                    previewDevice === "desktop"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
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
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

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
                    Start Date
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
                    End Date
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
                  Priority Weight (1 to 100)
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
            setFormData((prev: any) => ({
              ...prev,
              desktopImage: selectedUrl,
              imageUrl: selectedUrl,
            }));
          } else if (mediaLibraryTarget === "tablet") {
            setFormData((prev: any) => ({ ...prev, tabletImage: selectedUrl }));
          } else if (mediaLibraryTarget === "mobile") {
            setFormData((prev: any) => ({ ...prev, mobileImage: selectedUrl }));
          }
          setMediaLibraryTarget(null);
        }}
        title="Select Advertisement Creative Asset"
      />
    </div>
  );
}
