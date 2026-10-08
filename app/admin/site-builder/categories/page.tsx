"use client";

import React, { useState, useEffect } from "react";
import { Columns, Save, Sliders, CheckCircle, LayoutGrid, List, Sparkles } from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";

const LAYOUT_STYLES = [
  {
    id: "split-hero",
    label: "Split Hero & Stream",
    desc: "Large lead hero card on left/top with vertical stream and 4-column sidebar",
    icon: Columns,
  },
  {
    id: "magazine-grid",
    label: "Magazine Multi-Column Grid",
    desc: "Evenly balanced 3 or 4 column news card grid with high-resolution imagery",
    icon: LayoutGrid,
  },
  {
    id: "editorial-list",
    label: "Editorial List & Thumbnails",
    desc: "Linear chronological feed with bold headlines, excerpts, and compact media",
    icon: List,
  },
  {
    id: "compact-wire",
    label: "Compact Headline Wire",
    desc: "Fast-loading, high-density wire format designed for financial & breaking news",
    icon: Sliders,
  },
];

export default function CategoryPagesBuilder() {
  const [config, setConfig] = useState<SiteBuilderConfig>(DEFAULT_SITE_BUILDER_CONFIG);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatSlug, setSelectedCatSlug] = useState("india");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/site-builder?draft=true").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([builderData, catsData]) => {
      if (builderData.config) setConfig(builderData.config);
      if (catsData.categories && catsData.categories.length > 0) {
        setCategories(catsData.categories);
        setSelectedCatSlug(catsData.categories[0].slug);
      }
      setLoading(false);
    });
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
        setStatusMessage(isPublish ? "✓ Category templates published live!" : "✓ Category templates saved as draft.");
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateGlobalCat = (field: string, value: any) => {
    setConfig({
      ...config,
      categories: {
        ...config.categories,
        [field]: value,
      },
    });
  };

  const currentOverride = config.categories?.categoryOverrides?.[selectedCatSlug] || {};

  const updateCategoryOverride = (field: string, value: any) => {
    const existingOverrides = config.categories?.categoryOverrides || {};
    setConfig({
      ...config,
      categories: {
        ...config.categories,
        categoryOverrides: {
          ...existingOverrides,
          [selectedCatSlug]: {
            ...existingOverrides[selectedCatSlug],
            [field]: value,
          },
        },
      },
    });
  };

  const effectiveLayout = currentOverride.layoutStyle || config.categories?.layoutStyle || "split-hero";

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
              CATEGORY TEMPLATES
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-black dark:text-white mt-1">
            Category Page Templates &amp; Overrides
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Configure global category layouts and set custom per-category layout overrides
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

      {/* Global Category Layout Style */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5">
        <h3 className="font-serif font-black text-lg text-black dark:text-white">
          Default Category Layout Style
        </h3>
        <p className="text-xs text-neutral-500 font-sans">
          Select the structural presentation style for category landing pages.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LAYOUT_STYLES.map((style) => {
            const Icon = style.icon;
            const isSelected = (config.categories?.layoutStyle || "split-hero") === style.id;
            return (
              <div
                key={style.id}
                onClick={() => updateGlobalCat("layoutStyle", style.id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-800"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 bg-neutral-50/50 dark:bg-neutral-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-black dark:text-white" />
                    <span className="font-serif font-bold text-sm text-black dark:text-white">
                      {style.label}
                    </span>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-black dark:text-white" />}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
                  {style.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Category Settings */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5">
        <h3 className="font-serif font-black text-lg text-black dark:text-white">
          Global Default Category Widgets &amp; Columns
        </h3>
        <p className="text-xs text-neutral-500 font-sans">
          These settings apply to all category pages unless a category-specific override is defined below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Featured Lead Story</p>
              <p className="text-[11px] text-neutral-500">Show high-impact hero article card at top</p>
            </div>
            <input
              type="checkbox"
              checked={config.categories?.showFeaturedStory !== false}
              onChange={(e) => updateGlobalCat("showFeaturedStory", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Right Sidebar</p>
              <p className="text-[11px] text-neutral-500">Enable 4-column sidebar with widgets</p>
            </div>
            <input
              type="checkbox"
              checked={config.categories?.showSidebar !== false}
              onChange={(e) => updateGlobalCat("showSidebar", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Trending / Most Read</p>
              <p className="text-[11px] text-neutral-500">Display trending articles in sidebar</p>
            </div>
            <input
              type="checkbox"
              checked={config.categories?.showMostRead !== false}
              onChange={(e) => updateGlobalCat("showMostRead", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Sidebar Advertisement</p>
              <p className="text-[11px] text-neutral-500">Display display unit in category sidebar</p>
            </div>
            <input
              type="checkbox"
              checked={config.categories?.showAdBanner !== false}
              onChange={(e) => updateGlobalCat("showAdBanner", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Newsletter Subscription Box</p>
              <p className="text-[11px] text-neutral-500">Embed newsletter card in sidebar or stream</p>
            </div>
            <input
              type="checkbox"
              checked={config.categories?.showNewsletter !== false}
              onChange={(e) => updateGlobalCat("showNewsletter", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Grid Columns</p>
              <p className="text-[11px] text-neutral-500">Default column count for magazine grid</p>
            </div>
            <select
              value={config.categories?.defaultGridColumns || 3}
              onChange={(e) => updateGlobalCat("defaultGridColumns", Number(e.target.value))}
              className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category-Specific Overrides */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="font-serif font-black text-lg text-black dark:text-white">
              Category-Specific Layout Overrides
            </h3>
            <p className="text-xs text-neutral-500 font-sans">
              Override layout defaults for specific high-traffic verticals
            </p>
          </div>

          <select
            value={selectedCatSlug}
            onChange={(e) => setSelectedCatSlug(e.target.value)}
            className="px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono font-bold text-black dark:text-white focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name.toUpperCase()} (/{c.slug})
              </option>
            ))}
          </select>
        </div>

        {/* Override Controls for Selected Category */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Layout Style Override for /{selectedCatSlug}
              </label>
              <select
                value={effectiveLayout}
                onChange={(e) => updateCategoryOverride("layoutStyle", e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white"
              >
                {LAYOUT_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Grid Columns Override
              </label>
              <select
                value={currentOverride.gridColumns || config.categories?.defaultGridColumns || 3}
                onChange={(e) => updateCategoryOverride("gridColumns", Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <p className="font-bold text-xs text-black dark:text-white">Sidebar</p>
                <p className="text-[11px] text-neutral-500">Enable sidebar for {selectedCatSlug}</p>
              </div>
              <input
                type="checkbox"
                checked={currentOverride.showSidebar !== undefined ? currentOverride.showSidebar : config.categories?.showSidebar !== false}
                onChange={(e) => updateCategoryOverride("showSidebar", e.target.checked)}
                className="w-4 h-4 accent-black dark:accent-white"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <p className="font-bold text-xs text-black dark:text-white">Ad Banner</p>
                <p className="text-[11px] text-neutral-500">Enable ads for {selectedCatSlug}</p>
              </div>
              <input
                type="checkbox"
                checked={currentOverride.showAdBanner !== undefined ? currentOverride.showAdBanner : config.categories?.showAdBanner !== false}
                onChange={(e) => updateCategoryOverride("showAdBanner", e.target.checked)}
                className="w-4 h-4 accent-black dark:accent-white"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <p className="font-bold text-xs text-black dark:text-white">Trending Wire</p>
                <p className="text-[11px] text-neutral-500">Enable trending widget</p>
              </div>
              <input
                type="checkbox"
                checked={currentOverride.showMostRead !== undefined ? currentOverride.showMostRead : config.categories?.showMostRead !== false}
                onChange={(e) => updateCategoryOverride("showMostRead", e.target.checked)}
                className="w-4 h-4 accent-black dark:accent-white"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
