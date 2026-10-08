"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Save,
  Send,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Edit2,
  CheckCircle,
  RotateCcw,
  ExternalLink,
  Download,
  Mail,
  Phone,
  Layers,
} from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import {
  DEFAULT_ADVERTISING_CONFIG,
  DEFAULT_SITE_BUILDER_CONFIG,
  AdvertisingSectionConfig,
  AdvertisingPageConfig,
  SiteBuilderConfig,
} from "@/lib/site-builder-defaults";

export default function AdvertisingBuilderPage() {
  const [config, setConfig] = useState<SiteBuilderConfig>(DEFAULT_SITE_BUILDER_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Section Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AdvertisingSectionConfig | null>(null);
  const [formData, setFormData] = useState<Partial<AdvertisingSectionConfig>>({
    id: "",
    title: "",
    subtitle: "",
    placementTag: "",
    description: "",
    specs: "",
    pricingNote: "",
    features: [],
    isVisible: true,
    order: 1,
  });
  const [featuresText, setFeaturesText] = useState("");

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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const adConfig: AdvertisingPageConfig = config.advertising || DEFAULT_ADVERTISING_CONFIG;
  const sections = adConfig.sections || DEFAULT_ADVERTISING_CONFIG.sections;

  const handleSave = async (isPublish = false) => {
    try {
      setSaving(true);
      const res = await fetch("/api/site-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, isPublish }),
      });
      if (res.ok) {
        setStatusMessage(
          isPublish
            ? "✓ Advertising page & commercial rate cards published live to production!"
            : "✓ Advertising page configuration saved as draft."
        );
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        alert("Failed to save advertising configuration.");
      }
    } catch {
      alert("Error saving advertising configuration.");
    } finally {
      setSaving(false);
    }
  };

  const updateAdConfigField = (field: keyof AdvertisingPageConfig, value: any) => {
    setConfig({
      ...config,
      advertising: {
        ...adConfig,
        [field]: value,
      },
    });
  };

  const handleOpenAdd = () => {
    setEditingSection(null);
    setFormData({
      id: `ad_sec_${Date.now()}`,
      title: "",
      subtitle: "",
      placementTag: "DISPLAY / SPONSORED",
      description: "",
      specs: "",
      pricingNote: "Starting from ₹50,000 / $600 per campaign window",
      features: [],
      isVisible: true,
      order: sections.length + 1,
    });
    setFeaturesText("");
    setModalOpen(true);
  };

  const handleOpenEdit = (sec: AdvertisingSectionConfig) => {
    setEditingSection(sec);
    setFormData({ ...sec });
    setFeaturesText((sec.features || []).join("\n"));
    setModalOpen(true);
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert("Section title is required.");
      return;
    }

    const featuresList = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const updatedItem: AdvertisingSectionConfig = {
      id: formData.id || `ad_sec_${Date.now()}`,
      title: formData.title.trim(),
      subtitle: formData.subtitle?.trim() || "",
      placementTag: formData.placementTag?.trim() || "AD UNIT",
      description: formData.description?.trim() || "",
      specs: formData.specs?.trim() || "",
      pricingNote: formData.pricingNote?.trim() || "",
      features: featuresList,
      isVisible: formData.isVisible !== false,
      order: formData.order || sections.length + 1,
    };

    let newSections: AdvertisingSectionConfig[];
    if (editingSection) {
      newSections = sections.map((s) => (s.id === editingSection.id ? updatedItem : s));
    } else {
      newSections = [...sections, updatedItem];
    }

    newSections.forEach((sec, idx) => {
      sec.order = idx + 1;
    });

    setConfig({
      ...config,
      advertising: {
        ...adConfig,
        sections: newSections,
      },
    });

    setModalOpen(false);
  };

  const handleDeleteSection = (id: string) => {
    if (!confirm("Are you sure you want to delete this advertising section?")) return;
    const newSections = sections.filter((s) => s.id !== id);
    newSections.forEach((sec, idx) => {
      sec.order = idx + 1;
    });
    setConfig({
      ...config,
      advertising: {
        ...adConfig,
        sections: newSections,
      },
    });
  };

  const handleToggleVisible = (id: string) => {
    const newSections = sections.map((s) => {
      if (s.id === id) {
        return { ...s, isVisible: !s.isVisible };
      }
      return s;
    });
    setConfig({
      ...config,
      advertising: {
        ...adConfig,
        sections: newSections,
      },
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    newSections.forEach((sec, idx) => {
      sec.order = idx + 1;
    });

    setConfig({
      ...config,
      advertising: {
        ...adConfig,
        sections: newSections,
      },
    });
  };

  const handleResetDefaults = () => {
    if (!confirm("Reset advertising configuration to default 9 enterprise sections?")) return;
    setConfig({
      ...config,
      advertising: DEFAULT_ADVERTISING_CONFIG,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-sans">
      <SiteBuilderNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-mono font-bold uppercase rounded">
              SITE BUILDER
            </span>
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[9px] font-mono font-bold uppercase rounded">
              ADVERTISING HUB &amp; MEDIA KIT
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-black dark:text-white mt-1">
            Advertising Page &amp; Commercial Sections Studio
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Administer the /advertise portal, 9 advertising placements, rate card copy, CTA parameters, and media kit downloads
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-mono font-bold uppercase transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Ad Format</span>
          </button>

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
            className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
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

      {/* Hero & CTA Configuration Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-red-600" />
            <h2 className="font-serif font-bold text-base text-black dark:text-white">
              Advertising Portal Hero &amp; Conversion CTA
            </h2>
          </div>
          <Link
            href="/advertise"
            target="_blank"
            className="text-xs font-mono text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
          >
            <span>View /advertise</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
              Hero Heading
            </label>
            <input
              type="text"
              value={adConfig.heroHeading || ""}
              onChange={(e) => updateAdConfigField("heroHeading", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-serif font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
              Hero Subheading
            </label>
            <input
              type="text"
              value={adConfig.heroSubheading || ""}
              onChange={(e) => updateAdConfigField("heroSubheading", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
            Hero Description Paragraph
          </label>
          <textarea
            rows={2}
            value={adConfig.heroDescription || ""}
            onChange={(e) => updateAdConfigField("heroDescription", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
              CTA Button Text
            </label>
            <input
              type="text"
              value={adConfig.ctaText || ""}
              onChange={(e) => updateAdConfigField("ctaText", e.target.value)}
              placeholder="e.g. Request Rate Card"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
              CTA Destination URL / Anchor
            </label>
            <input
              type="text"
              value={adConfig.ctaDestination || ""}
              onChange={(e) => updateAdConfigField("ctaDestination", e.target.value)}
              placeholder="e.g. #inquiry-form or /advertise"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
              Commercial Desk Email
            </label>
            <input
              type="email"
              value={adConfig.contactEmail || ""}
              onChange={(e) => updateAdConfigField("contactEmail", e.target.value)}
              placeholder="e.g. advertise@leadjenmediadaily.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
              Media Kit PDF URL (Optional)
            </label>
            <input
              type="text"
              value={adConfig.downloadKitUrl || ""}
              onChange={(e) => updateAdConfigField("downloadKitUrl", e.target.value)}
              placeholder="e.g. /media-kit-2026.pdf"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 9 Advertising Sections Manager */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-black dark:text-white" />
            <h2 className="font-serif font-bold text-base text-black dark:text-white">
              Configured Advertising Placements ({sections.length})
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Reorder or edit specs, tags, and features
          </span>
        </div>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {sections.map((section, index) => (
            <div
              key={section.id || index}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                section.isVisible ? "bg-transparent" : "bg-neutral-50/70 dark:bg-neutral-950/70 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex flex-col items-center justify-center gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 disabled:opacity-20"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-neutral-400">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === sections.length - 1}
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 disabled:opacity-20"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-black dark:text-white">
                      {section.title}
                    </h3>
                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono font-bold uppercase rounded">
                      {section.placementTag || "AD UNIT"}
                    </span>
                    {section.specs && (
                      <span className="text-xs font-mono text-neutral-400">
                        ({section.specs})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans line-clamp-1">
                    {section.description}
                  </p>
                  {section.features && section.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {section.features.map((f, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleVisible(section.id)}
                  className={`p-2 rounded-lg transition ${
                    section.isVisible
                      ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                      : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                  title={section.isVisible ? "Visible (Click to Hide)" : "Hidden (Click to Show)"}
                >
                  {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(section)}
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
                  title="Edit Section"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                  title="Delete Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-serif font-bold text-xl text-black dark:text-white">
                {editingSection ? `Edit Ad Format: ${editingSection.title}` : "Add New Advertising Format"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white text-sm font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Format Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Category Page Advertising"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Placement Tag / Category
                  </label>
                  <input
                    type="text"
                    value={formData.placementTag || ""}
                    onChange={(e) => setFormData({ ...formData, placementTag: e.target.value })}
                    placeholder="e.g. CATEGORY SPONSORSHIP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle || ""}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Contextual Section Takeovers"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Display Specs &amp; Dimensions
                  </label>
                  <input
                    type="text"
                    value={formData.specs || ""}
                    onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                    placeholder="e.g. 970x250, 300x250, 300x600, JPG/HTML5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of this ad unit, reader context, and impact..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                  Pricing / Commercial Note
                </label>
                <input
                  type="text"
                  value={formData.pricingNote || ""}
                  onChange={(e) => setFormData({ ...formData, pricingNote: e.target.value })}
                  placeholder="e.g. Available on CPM, Fixed Weekly, or Exclusive Tenancy basis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                  Key Features &amp; Inclusions (One per line)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono resize-y"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisible !== false}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded accent-black"
                  />
                  <span>Visible on Public /advertise Portal</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition"
                >
                  Save Ad Format
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
