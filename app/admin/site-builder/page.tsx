"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Layout,
  Navigation,
  FileText,
  Radio,
  Video,
  Camera,
  Search,
  Users,
  Layers,
  Columns,
  Megaphone,
  AlertTriangle,
  Palette,
  Sparkles,
  Save,
  Send,
  Eye,
  RotateCcw,
  History,
  CheckCircle,
  Monitor,
  Tablet,
  Smartphone,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export default function SiteBuilderDashboard() {
  const [config, setConfig] = useState<SiteBuilderConfig>(DEFAULT_SITE_BUILDER_CONFIG);
  const [hasDraft, setHasDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [versionName, setVersionName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/site-builder?draft=true");
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setHasDraft(data.hasDraft);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/site-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, isPublish: false }),
      });
      const data = await res.json();
      if (res.ok) {
        setHasDraft(true);
        setStatusMessage("✓ Draft saved successfully. Changes are ready to preview.");
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishLive = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/site-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          isPublish: true,
          versionName: versionName || `Version ${new Date().toLocaleTimeString("en-IN")}`,
        }),
      });
      if (res.ok) {
        setHasDraft(false);
        setPublishModalOpen(false);
        setStatusMessage("✓ Site Builder configuration successfully published to live website!");
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch {
      alert("Publish failed.");
    } finally {
      setSaving(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await fetch("/api/site-builder/versions");
      const data = await res.json();
      if (data.versions) {
        setVersions(data.versions);
        setHistoryModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm("Are you sure you want to restore this configuration snapshot to the live website?")) return;
    try {
      const res = await fetch(`/api/site-builder/versions/${versionId}/restore`, { method: "POST" });
      if (res.ok) {
        setHistoryModalOpen(false);
        fetchConfig();
        alert("Version restored successfully!");
      }
    } catch {
      alert("Restore failed.");
    }
  };

  const builderCards = [
    {
      title: "Global Brand & Identity",
      href: "/admin/site-builder/global",
      icon: Globe,
      desc: "Brand logo, site title, favicon, contact information, social links, and copyright text.",
    },
    {
      title: "Design Tokens & Typography",
      href: "/admin/site-builder/design",
      icon: Palette,
      desc: "Pixel-level control of newsroom colors, responsive font sizes, heading font families, and container spacing.",
    },
    {
      title: "Header & Top Bar",
      href: "/admin/site-builder/header",
      icon: Columns,
      desc: "Sticky header, logo sizing, live clock timezone, live button, search toggle, and announcement banner.",
    },
    {
      title: "Navigation & Mega Menu",
      href: "/admin/site-builder/navigation",
      icon: Navigation,
      desc: "Primary menu items, category links, mega menu content, reordering, and visibility toggles.",
    },
    {
      title: "About Leadjen Services",
      href: "/admin/site-builder/services",
      icon: Sparkles,
      desc: "Manage the 11 About Leadjen Media service items, hamburger drawer links, landing pages, and deliverables.",
    },
    {
      title: "Advertising Hub Studio",
      href: "/admin/site-builder/advertising",
      icon: Megaphone,
      desc: "Manage the /advertise portal, 9 commercial advertising formats, media kit download, and conversion CTAs.",
    },
    {
      title: "Homepage Layout Builder",
      href: "/admin/homepage",
      icon: Layers,
      desc: "Drag-and-drop hero section, category grids, video journalism, trending wire, and layout ordering.",
    },
    {
      title: "Category Page Templates",
      href: "/admin/site-builder/categories",
      icon: Columns,
      desc: "Global category templates, sidebar widgets, hero story limit, and category-specific overrides.",
    },
    {
      title: "Article Page Layout & Ads",
      href: "/admin/site-builder/article",
      icon: FileText,
      desc: "Article breadcrumbs, reading progress bar, author bio, social share, comments, and ad placements.",
    },
    {
      title: "Live News Desk",
      href: "/admin/site-builder/live",
      icon: Radio,
      desc: "Live desk stream header, ticker banner, timeline sort order, and sidebar layout.",
    },
    {
      title: "Video Journalism",
      href: "/admin/site-builder/videos",
      icon: Video,
      desc: "Featured video player, video grid columns, videos per page, and video ad placement.",
    },
    {
      title: "Photo Journalism",
      href: "/admin/site-builder/photos",
      icon: Camera,
      desc: "Featured photo gallery, grid layout, captions, photographer credit, and galleries per page.",
    },
    {
      title: "Search & Discovery",
      href: "/admin/site-builder/search",
      icon: Search,
      desc: "Search results page layout, results per page, search filters, and discovery sidebar.",
    },
    {
      title: "Author Profile Pages",
      href: "/admin/site-builder/authors",
      icon: Users,
      desc: "Author biography layout, social media icons, article feed, and correspondent sidebar.",
    },
    {
      title: "Footer & Legal Columns",
      href: "/admin/site-builder/footer",
      icon: Columns,
      desc: "4-column navigation, editorial disclaimer, newsletter box, and copyright bar.",
    },
    {
      title: "Static & Policy Pages",
      href: "/admin/pages",
      icon: FileText,
      desc: "Manage About Us, Privacy Policy, Terms, Editorial Standards, and custom editorial pages.",
    },
    {
      title: "404 Error Page Customizer",
      href: "/admin/site-builder/404",
      icon: AlertTriangle,
      desc: "Custom 404 heading, recovery description, latest stories feed, and search box toggle.",
    },
    {
      title: "Advertisement Layouts",
      href: "/admin/advertisements",
      icon: Megaphone,
      desc: "Leaderboards, sidebar units, in-article banners, and device targeting.",
    },
    {
      title: "SEO Defaults & Syndication",
      href: "/admin/seo",
      icon: Globe,
      desc: "Default meta titles, OpenGraph images, Google News XML Sitemap, and RSS feeds.",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-sans">
      <SiteBuilderNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-mono font-bold uppercase rounded">
              SITE BUILDER CORE
            </span>
            {hasDraft && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-mono font-bold uppercase rounded flex items-center gap-1">
                ● UNSAVED DRAFT ACTIVE
              </span>
            )}
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-1">
            Site Builder &amp; Page Layout Studio
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Full admin control over content, layouts, sections, navigation, headers, footers, and page templates
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchVersions}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-mono font-bold uppercase transition"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={() => setPublishModalOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-mono rounded-xl">
          {statusMessage}
        </div>
      )}

      {/* Grid of Page & Layout Builders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {builderCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white rounded-2xl shadow-xs transition group space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition">
                  <Icon className="w-4 h-4" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition" />
              </div>
              <h3 className="font-serif font-bold text-base text-black dark:text-white pt-1">
                {card.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans leading-relaxed">
                {card.desc}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Live Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-white dark:bg-neutral-950 rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-neutral-800">
            {/* Preview Toolbar */}
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-red-500">
                  ● LIVE PREVIEW
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  (Rendering actual components with active draft settings)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-2 rounded-lg transition ${previewDevice === "desktop" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
                  title="Desktop Viewport (1440px)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-2 rounded-lg transition ${previewDevice === "tablet" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
                  title="Tablet Viewport (768px)"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-2 rounded-lg transition ${previewDevice === "mobile" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
                  title="Mobile Viewport (390px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg transition ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Iframe Container */}
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center p-4 overflow-hidden">
              <div
                className="h-full bg-white dark:bg-neutral-950 shadow-2xl transition-all duration-300 rounded-xl overflow-hidden"
                style={{
                  width:
                    previewDevice === "mobile"
                      ? "390px"
                      : previewDevice === "tablet"
                      ? "768px"
                      : "100%",
                }}
              >
                <iframe
                  src="/?preview=true"
                  className="w-full h-full border-none"
                  title="Site Builder Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-serif font-black text-xl text-black dark:text-white">
              Publish Changes to Live Website
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
              You are about to publish all modified Site Builder settings (Header, Navigation, Brand, Category templates, and Article layouts) to the live website for all public visitors.
            </p>

            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-neutral-500 mb-1">
                Version Note / Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Navigation update & Header adjustments"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-xs font-mono font-bold uppercase rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishLive}
                disabled={saving}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition disabled:opacity-50"
              >
                {saving ? "Publishing..." : "Confirm & Publish Live"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-black dark:text-white" />
                <h3 className="font-serif font-black text-lg text-black dark:text-white">
                  Site Builder Version History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {versions.length === 0 ? (
                <p className="py-8 text-center text-neutral-400 font-mono">No previous snapshots recorded yet.</p>
              ) : (
                versions.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-black dark:text-white">{v.versionName}</p>
                      <p className="text-[10px] font-mono text-neutral-400">
                        {v.publishedBy ? `By ${v.publishedBy} • ` : ""}
                        {new Date(v.createdAt).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(v.id)}
                      className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white text-[11px] font-mono font-bold uppercase rounded-lg transition"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
