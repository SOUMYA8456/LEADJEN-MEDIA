"use client";

import React, { useState, useEffect } from "react";
import { Globe, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";

export default function GlobalSettingsBuilder() {
  const [config, setConfig] = useState<SiteBuilderConfig>(DEFAULT_SITE_BUILDER_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<"siteLogo" | "defaultSocialImage">("siteLogo");

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
        setStatusMessage(isPublish ? "✓ Global settings published live!" : "✓ Global settings saved as draft.");
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateGlobal = (field: string, value: any) => {
    setConfig({
      ...config,
      global: {
        ...config.global,
        [field]: value,
      },
    });
  };

  const updateSocial = (network: string, value: string) => {
    setConfig({
      ...config,
      global: {
        ...config.global,
        socialLinks: {
          ...config.global.socialLinks,
          [network]: value,
        },
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
              GLOBAL BRAND
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-black dark:text-white mt-1">
            Global Brand &amp; Identity Settings
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

      {/* Brand Form */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Site Brand Name *
            </label>
            <input
              type="text"
              value={config.global.siteName}
              onChange={(e) => updateGlobal("siteName", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-serif text-black dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Editorial Tagline
            </label>
            <input
              type="text"
              value={config.global.tagline}
              onChange={(e) => updateGlobal("tagline", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
            Site Description (Meta &amp; About)
          </label>
          <textarea
            rows={3}
            value={config.global.siteDescription}
            onChange={(e) => updateGlobal("siteDescription", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-hidden"
          />
        </div>

        {/* Logos & Assets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Header Brand Logo URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={config.global.siteLogo}
                onChange={(e) => updateGlobal("siteLogo", e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  setMediaTargetField("siteLogo");
                  setMediaModalOpen(true);
                }}
                className="p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-black dark:text-white rounded-xl transition"
                title="Select from Media Library"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Default Social OpenGraph Image
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={config.global.defaultSocialImage}
                onChange={(e) => updateGlobal("defaultSocialImage", e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  setMediaTargetField("defaultSocialImage");
                  setMediaModalOpen(true);
                }}
                className="p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-black dark:text-white rounded-xl transition"
                title="Select from Media Library"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact & Social */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={config.global.contactEmail}
              onChange={(e) => updateGlobal("contactEmail", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Newsroom Telephone
            </label>
            <input
              type="text"
              value={config.global.contactPhone}
              onChange={(e) => updateGlobal("contactPhone", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Social URLs */}
        <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="font-serif font-bold text-sm text-black dark:text-white">
            Official Social Media Links
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-0.5">X (Twitter)</label>
              <input
                type="text"
                value={config.global.socialLinks.twitter}
                onChange={(e) => updateSocial("twitter", e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-0.5">LinkedIn</label>
              <input
                type="text"
                value={config.global.socialLinks.linkedin}
                onChange={(e) => updateSocial("linkedin", e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-0.5">Facebook</label>
              <input
                type="text"
                value={config.global.socialLinks.facebook}
                onChange={(e) => updateSocial("facebook", e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-0.5">YouTube</label>
              <input
                type="text"
                value={config.global.socialLinks.youtube}
                onChange={(e) => updateSocial("youtube", e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {mediaModalOpen && (
        <MediaLibraryModal
          isOpen={mediaModalOpen}
          onClose={() => setMediaModalOpen(false)}
          onSelect={(url) => {
            updateGlobal(mediaTargetField, url);
            setMediaModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
