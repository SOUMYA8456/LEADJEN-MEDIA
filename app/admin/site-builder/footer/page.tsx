"use client";

import React, { useState, useEffect } from "react";
import { Columns, Save, Plus, Trash2 } from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export default function FooterBuilder() {
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
        setStatusMessage(isPublish ? "✓ Footer settings published live!" : "✓ Footer settings saved as draft.");
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateFooter = (field: string, value: any) => {
    setConfig({
      ...config,
      footer: {
        ...config.footer,
        [field]: value,
      },
    });
  };

  const updateColumnTitle = (colIndex: number, title: string) => {
    const newCols = [...config.footer.columns];
    newCols[colIndex].title = title;
    updateFooter("columns", newCols);
  };

  const addLinkToColumn = (colIndex: number) => {
    const newCols = [...config.footer.columns];
    newCols[colIndex].links.push({ label: "New Link", url: "/" });
    updateFooter("columns", newCols);
  };

  const updateLink = (colIndex: number, linkIndex: number, field: "label" | "url", value: string) => {
    const newCols = [...config.footer.columns];
    newCols[colIndex].links[linkIndex][field] = value;
    updateFooter("columns", newCols);
  };

  const removeLink = (colIndex: number, linkIndex: number) => {
    const newCols = [...config.footer.columns];
    newCols[colIndex].links = newCols[colIndex].links.filter((_, idx) => idx !== linkIndex);
    updateFooter("columns", newCols);
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
              FOOTER &amp; LEGAL
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-black dark:text-white mt-1">
            Global Footer &amp; Column Builder
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

      {/* Footer Settings Form */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
            Footer Editorial Statement / About Description
          </label>
          <textarea
            rows={3}
            value={config.footer.description}
            onChange={(e) => updateFooter("description", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
            Copyright Line
          </label>
          <input
            type="text"
            value={config.footer.copyrightText}
            onChange={(e) => updateFooter("copyrightText", e.target.value)}
            className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <span className="text-xs font-bold text-black dark:text-white">Social Icons</span>
            <input
              type="checkbox"
              checked={config.footer.showSocialLinks}
              onChange={(e) => updateFooter("showSocialLinks", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <span className="text-xs font-bold text-black dark:text-white">Newsletter Signup</span>
            <input
              type="checkbox"
              checked={config.footer.showNewsletter}
              onChange={(e) => updateFooter("showNewsletter", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
            <span className="text-xs font-bold text-black dark:text-white">Back To Top</span>
            <input
              type="checkbox"
              checked={config.footer.showBackToTop}
              onChange={(e) => updateFooter("showBackToTop", e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white"
            />
          </label>
        </div>

        {/* 4-Column Navigation Builder */}
        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="font-serif font-bold text-sm text-black dark:text-white">
            4-Column Navigation Layout
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.footer.columns.map((col, colIndex) => (
              <div
                key={colIndex}
                className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3"
              >
                <input
                  type="text"
                  value={col.title}
                  onChange={(e) => updateColumnTitle(colIndex, e.target.value)}
                  placeholder="Column Title"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono font-bold uppercase text-black dark:text-white focus:outline-hidden"
                />

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {col.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(colIndex, linkIndex, "label", e.target.value)}
                        placeholder="Label"
                        className="w-1/2 px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-[11px] font-sans text-black dark:text-white focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateLink(colIndex, linkIndex, "url", e.target.value)}
                        placeholder="/url"
                        className="w-1/2 px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-[11px] font-mono text-neutral-600 dark:text-neutral-400 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(colIndex, linkIndex)}
                        className="p-1 hover:bg-red-500/10 text-neutral-400 hover:text-red-600 rounded"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addLinkToColumn(colIndex)}
                  className="w-full py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-black dark:text-white rounded-lg text-[11px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Link</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
