"use client";

import React, { useState, useEffect } from "react";
import { Search, Save } from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export default function SearchPageBuilder() {
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
        setStatusMessage(isPublish ? "✓ Search page settings published live!" : "✓ Search page settings saved as draft.");
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateSearch = (field: string, value: any) => {
    setConfig({
      ...config,
      search: {
        ...config.search,
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
              SEARCH &amp; DISCOVERY
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-black dark:text-white mt-1">
            Search &amp; Discovery Page Customizer
          </h1>
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

      {/* Settings Form */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5">
        <h3 className="font-serif font-black text-lg text-black dark:text-white">
          Search Results Layout Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Right Sidebar</p>
              <p className="text-[11px] text-neutral-500">Show discovery sidebar widgets</p>
            </div>
            <input
              type="checkbox"
              checked={config.search.showSidebar}
              onChange={(e) => updateSearch("showSidebar", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Sidebar Advertisement</p>
              <p className="text-[11px] text-neutral-500">Enable display ad unit in search sidebar</p>
            </div>
            <input
              type="checkbox"
              checked={config.search.showAdBanner}
              onChange={(e) => updateSearch("showAdBanner", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
            Search Results Limit Per Query
          </label>
          <input
            type="number"
            min={10}
            max={60}
            value={config.search.resultsPerPage}
            onChange={(e) => updateSearch("resultsPerPage", parseInt(e.target.value) || 20)}
            className="w-full sm:w-72 px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
          />
        </div>
      </div>
    </div>
  );
}
