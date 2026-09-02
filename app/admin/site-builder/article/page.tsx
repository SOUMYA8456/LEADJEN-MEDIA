"use client";

import React, { useState, useEffect } from "react";
import { FileText, Save, Megaphone, CheckCircle } from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export default function ArticlePageBuilder() {
  const [config, setConfig] = useState<SiteBuilderConfig>(DEFAULT_SITE_BUILDER_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/site-builder?draft=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (isPublish = false) => {
    try {
      setSaving(true);
      const res = await fetch("/api/site-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, isPublish }),
      });
      if (res.ok) {
        setStatusMessage(isPublish ? "✓ Article page template published live!" : "✓ Article page template saved as draft.");
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateArticle = (field: string, value: boolean) => {
    setConfig({
      ...config,
      article: {
        ...config.article,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 font-sans">
      <SiteBuilderNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-mono font-bold uppercase rounded">
              SITE BUILDER
            </span>
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[9px] font-mono font-bold uppercase rounded">
              ARTICLE TEMPLATE
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-black dark:text-white mt-1">
            Article Layout &amp; Ad Placements
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Configure reading experience modules, author credits, comments, and in-article ad slots
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm"
          >
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-mono rounded-xl">
          {statusMessage}
        </div>
      )}

      {/* Editorial Modules Section */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5">
        <h3 className="font-serif font-black text-lg text-black dark:text-white">
          Article Reading Experience Modules
        </h3>
        <p className="text-xs text-neutral-500 font-sans">
          Toggle interactive and editorial components rendered on story dispatches
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Breadcrumb Navigation</p>
              <p className="text-[11px] text-neutral-500">Show Home / Category / Article breadcrumb</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.showBreadcrumbs}
              onChange={(e) => updateArticle("showBreadcrumbs", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Reading Progress Bar</p>
              <p className="text-[11px] text-neutral-500">Top scroll indicator showing reading percentage</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.showReadingProgressBar}
              onChange={(e) => updateArticle("showReadingProgressBar", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Author Biography Card</p>
              <p className="text-[11px] text-neutral-500">Show journalist bio and social links at foot</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.showAuthorBio}
              onChange={(e) => updateArticle("showAuthorBio", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Social Sharing Buttons</p>
              <p className="text-[11px] text-neutral-500">X, LinkedIn, WhatsApp &amp; copy link triggers</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.showSocialShare}
              onChange={(e) => updateArticle("showSocialShare", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Comments Section</p>
              <p className="text-[11px] text-neutral-500">Display moderated reader comments section</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.showComments}
              onChange={(e) => updateArticle("showComments", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Related Stories Grid</p>
              <p className="text-[11px] text-neutral-500">Related category dispatches below article</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.showRelatedStories}
              onChange={(e) => updateArticle("showRelatedStories", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Most Read Sidebar</p>
              <p className="text-[11px] text-neutral-500">Show trending stories in right sidebar</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.showMostReadSidebar}
              onChange={(e) => updateArticle("showMostReadSidebar", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Newsletter Signup Box</p>
              <p className="text-[11px] text-neutral-500">Daily newsletter subscription box</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.showNewsletterBox}
              onChange={(e) => updateArticle("showNewsletterBox", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>
        </div>
      </div>

      {/* In-Article Advertisement Placements */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-black dark:text-white" />
          <h3 className="font-serif font-black text-lg text-black dark:text-white">
            In-Article Advertisement Slots
          </h3>
        </div>
        <p className="text-xs text-neutral-500 font-sans">
          Toggle active advertisement placement units within article dispatches
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Top Article Leaderboard</p>
              <p className="text-[11px] text-neutral-500">Above article title</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.topAdEnabled}
              onChange={(e) => updateArticle("topAdEnabled", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Middle In-Content Ad</p>
              <p className="text-[11px] text-neutral-500">Embedded between article paragraphs</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.middleAdEnabled}
              onChange={(e) => updateArticle("middleAdEnabled", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Sidebar Advertisement</p>
              <p className="text-[11px] text-neutral-500">Display unit in article sidebar</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.sidebarAdEnabled}
              onChange={(e) => updateArticle("sidebarAdEnabled", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Bottom Article Ad</p>
              <p className="text-[11px] text-neutral-500">Before comments and related stories</p>
            </div>
            <input
              type="checkbox"
              checked={config.article.bottomAdEnabled}
              onChange={(e) => updateArticle("bottomAdEnabled", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
