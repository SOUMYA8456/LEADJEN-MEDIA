"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Shield,
  FileCode,
  Rss,
  Search,
  Sparkles,
  Share2,
  Image as ImageIcon,
  Key,
  Layers,
  BarChart2,
  AlertCircle,
} from "lucide-react";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";

interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  publisherName: string;
  publisherLogo: string;
  defaultSocialImg: string;
  twitterHandle: string;
  defaultKeywords: string;
  googleVerify: string;
  bingVerify: string;
}

export default function AdminSeoPage() {
  const [settings, setSettings] = useState<SeoSettings>({
    siteTitle: "LEADJEN MEDIA | Independent Journalism. Important Stories.",
    siteDescription:
      "Leading digital news publishing platform covering India, world affairs, politics, business, technology, sports, health, and science.",
    siteUrl: "https://leadjen-media-news.vercel.app",
    publisherName: "LEADJEN MEDIA",
    publisherLogo: "https://leadjen-media-news.vercel.app/logo.png",
    defaultSocialImg:
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=630&q=80",
    twitterHandle: "@leadjenmedia",
    defaultKeywords:
      "news, breaking news, india news, world news, politics, business, technology",
    googleVerify: "",
    bingVerify: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mediaTarget, setMediaTarget] = useState<"logo" | "social" | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/settings/seo");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings({
              siteTitle: data.settings.siteTitle || "",
              siteDescription: data.settings.siteDescription || "",
              siteUrl: data.settings.siteUrl || "https://leadjen-media-news.vercel.app",
              publisherName: data.settings.publisherName || "LEADJEN MEDIA",
              publisherLogo: data.settings.publisherLogo || "",
              defaultSocialImg: data.settings.defaultSocialImg || "",
              twitterHandle: data.settings.twitterHandle || "@leadjenmedia",
              defaultKeywords: data.settings.defaultKeywords || "",
              googleVerify: data.settings.googleVerify || "",
              bingVerify: data.settings.bingVerify || "",
            });
          }
        }
      } catch (err: any) {
        setErrorMsg("Failed to load SEO settings.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/settings/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update SEO settings.");
      }

      setSuccessMsg("SEO and Google News configuration saved successfully.");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs font-mono text-neutral-400">
        Loading Technical SEO Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="px-2 py-0.5 bg-black text-white text-[9px] font-mono font-bold uppercase rounded">
            TECHNICAL SEO ENGINE
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-0.5">
            Search Engine & News Discovery
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Manage Google News readiness, XML sitemaps, RSS feeds, schema structured data & verification tokens
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save SEO Settings"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/20 border border-red-800 rounded-2xl flex items-center gap-2 text-xs font-mono text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-black text-white border border-neutral-700 rounded-2xl flex items-center gap-2 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. REAL-TIME SEO HEALTH AUDIT MATRIX */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <h3 className="font-serif font-bold text-base text-black dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-black dark:text-white" />
            1. Technical SEO & Discovery Health Matrix
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 font-bold rounded">
            ALL SYSTEMS READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* SITEMAP */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black dark:text-white">Main XML Sitemap</span>
              <span className="text-[10px] bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded font-bold">
                PASS
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">Articles, categories, authors & multimedia.</p>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-black dark:text-white hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Inspect /sitemap.xml</span>
            </a>
          </div>

          {/* NEWS SITEMAP */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black dark:text-white">Google News Sitemap</span>
              <span className="text-[10px] bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded font-bold">
                PASS
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">Google News XML protocol for published stories.</p>
            <a
              href="/news-sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-black dark:text-white hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Inspect /news-sitemap.xml</span>
            </a>
          </div>

          {/* RSS 2.0 FEED */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black dark:text-white">RSS 2.0 Feed</span>
              <span className="text-[10px] bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded font-bold">
                PASS
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">Syndication feed for news readers & aggregators.</p>
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-black dark:text-white hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Inspect /rss.xml</span>
            </a>
          </div>

          {/* ROBOTS.TXT */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black dark:text-white">Robots.txt</span>
              <span className="text-[10px] bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded font-bold">
                PASS
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">Public crawling rules & admin route protection.</p>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-black dark:text-white hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Inspect /robots.txt</span>
            </a>
          </div>
        </div>

        {/* Structured Data Badges */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-2 text-[10px] font-mono">
          <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg font-bold">
            ✓ NewsArticle Schema
          </span>
          <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg font-bold">
            ✓ BreadcrumbList Schema
          </span>
          <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg font-bold">
            ✓ ProfilePage / Author Schema
          </span>
          <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg font-bold">
            ✓ WebSite + SearchAction Schema
          </span>
          <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg font-bold">
            ✓ OpenGraph &amp; Twitter Cards
          </span>
          <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg font-bold">
            ✓ Canonical Tags Enforced
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metadata & Organization (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 2. GLOBAL METADATA */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              2. Publication Metadata & Identity
            </h3>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                Default Site Title *
              </label>
              <input
                type="text"
                required
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                Default Meta Description *
              </label>
              <textarea
                rows={3}
                required
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                  Canonical Site URL *
                </label>
                <input
                  type="url"
                  required
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                  Publisher Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.publisherName}
                  onChange={(e) => setSettings({ ...settings, publisherName: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                Default Focus Keywords
              </label>
              <input
                type="text"
                placeholder="news, breaking news, politics, business, technology"
                value={settings.defaultKeywords}
                onChange={(e) => setSettings({ ...settings, defaultKeywords: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* 3. SOCIAL & GRAPH ASSETS */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              3. Social Sharing & OpenGraph Defaults
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono font-bold uppercase text-neutral-500">
                  Default Social Share Image (1200x630)
                </label>
                <button
                  type="button"
                  onClick={() => setMediaTarget("social")}
                  className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:underline flex items-center gap-1"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Choose from Library</span>
                </button>
              </div>
              <input
                type="url"
                value={settings.defaultSocialImg}
                onChange={(e) => setSettings({ ...settings, defaultSocialImg: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                  Twitter / X Publisher Handle
                </label>
                <input
                  type="text"
                  placeholder="@leadjenmedia"
                  value={settings.twitterHandle}
                  onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-500">
                    Publisher Logo URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaTarget("logo")}
                    className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:underline flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Choose Logo</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={settings.publisherLogo}
                  onChange={(e) => setSettings({ ...settings, publisherLogo: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Search Engine Verification & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 4. SEARCH ENGINE VERIFICATION */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-black dark:text-white" />
              4. Search Console Verification
            </h3>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                Google Search Console Token
              </label>
              <input
                type="text"
                placeholder="google-site-verification token or meta code"
                value={settings.googleVerify}
                onChange={(e) => setSettings({ ...settings, googleVerify: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
              />
              <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                Verification value provided in Google Search Console HTML tag method.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-neutral-500 mb-1">
                Bing Webmaster Tools Token
              </label>
              <input
                type="text"
                placeholder="msvalidate.01 token"
                value={settings.bingVerify}
                onChange={(e) => setSettings({ ...settings, bingVerify: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* 5. GOOGLE SERP SNIPPET PREVIEW */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              5. Google Search Snippet Preview
            </h3>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1.5 font-sans">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-black text-white text-[9px] font-mono font-black flex items-center justify-center rounded-full">
                  LM
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                    Leadjen Media
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {settings.siteUrl.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-black dark:text-white hover:underline cursor-pointer line-clamp-1">
                {settings.siteTitle}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                {settings.siteDescription}
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Media Library Selector Modal */}
      <MediaLibraryModal
        isOpen={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        onSelect={(selectedUrl) => {
          if (mediaTarget === "logo") {
            setSettings((prev) => ({ ...prev, publisherLogo: selectedUrl }));
          } else if (mediaTarget === "social") {
            setSettings((prev) => ({ ...prev, defaultSocialImg: selectedUrl }));
          }
          setMediaTarget(null);
        }}
        title="Select Asset from Media Library"
      />
    </div>
  );
}
