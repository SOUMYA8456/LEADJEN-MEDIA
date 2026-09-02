"use client";

import React, { useState, useEffect } from "react";
import { Columns, Save, Eye } from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export default function HeaderBuilder() {
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
        setStatusMessage(isPublish ? "✓ Header settings published live!" : "✓ Header settings saved as draft.");
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Failed to save header settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateHeader = (field: string, value: any) => {
    setConfig({
      ...config,
      header: {
        ...config.header,
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
              HEADER &amp; TOP BAR
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-black dark:text-white mt-1">
            Header &amp; Top Bar Configuration
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

      {/* Header Controls Form */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-6">
        {/* Toggle Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Sticky Header</p>
              <p className="text-[11px] text-neutral-500">Keep header visible when scrolling</p>
            </div>
            <input
              type="checkbox"
              checked={config.header.stickyHeader}
              onChange={(e) => updateHeader("stickyHeader", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Live Desk Indicator</p>
              <p className="text-[11px] text-neutral-500">Show red pulsing LIVE button in top bar</p>
            </div>
            <input
              type="checkbox"
              checked={config.header.showLiveButton}
              onChange={(e) => updateHeader("showLiveButton", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Search Button</p>
              <p className="text-[11px] text-neutral-500">Show instant search trigger in top bar</p>
            </div>
            <input
              type="checkbox"
              checked={config.header.showSearchButton}
              onChange={(e) => updateHeader("showSearchButton", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Editorial Clock</p>
              <p className="text-[11px] text-neutral-500">Show real-time newsroom clock</p>
            </div>
            <input
              type="checkbox"
              checked={config.header.showClock}
              onChange={(e) => updateHeader("showClock", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>
        </div>

        {/* Clock Settings */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h4 className="font-serif font-bold text-sm text-black dark:text-white">
            Editorial Clock Customization
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-neutral-500 mb-1">Timezone</label>
              <select
                value={config.header.clockTimezone}
                onChange={(e) => updateHeader("clockTimezone", e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (BST)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-500 mb-1">Clock Format</label>
              <select
                value={config.header.clockFormat}
                onChange={(e) => updateHeader("clockFormat", e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
              >
                <option value="12h">12-Hour (05:30 PM)</option>
                <option value="24h">24-Hour (17:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-500 mb-1">Clock Label</label>
              <input
                type="text"
                value={config.header.clockLabel}
                onChange={(e) => updateHeader("clockLabel", e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Top Announcement Banner */}
        <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-bold text-xs text-black dark:text-white">Header Top Announcement Banner</p>
              <p className="text-[11px] text-neutral-500">Display high-priority editorial bulletin banner at the very top of the header</p>
            </div>
            <input
              type="checkbox"
              checked={config.header.showAnnouncement}
              onChange={(e) => updateHeader("showAnnouncement", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          {config.header.showAnnouncement && (
            <input
              type="text"
              value={config.header.headerAnnouncement}
              onChange={(e) => updateHeader("headerAnnouncement", e.target.value)}
              placeholder="e.g. SPECIAL REPORT: Global Geopolitical & Semiconductor Summit coverage underway"
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-hidden"
            />
          )}
        </div>
      </div>
    </div>
  );
}
