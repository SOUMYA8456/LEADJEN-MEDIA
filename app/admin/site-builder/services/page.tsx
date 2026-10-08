"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
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
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { DEFAULT_SERVICES, DEFAULT_SITE_BUILDER_CONFIG, ServiceItemConfig, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export default function ServicesBuilderPage() {
  const [config, setConfig] = useState<SiteBuilderConfig>(DEFAULT_SITE_BUILDER_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Edit / Add Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItemConfig | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceItemConfig>>({
    id: "",
    title: "",
    slug: "",
    url: "",
    description: "",
    longDescription: "",
    badge: "",
    icon: "Sparkles",
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
            ? "✓ Services published live to production website & hamburger menu!"
            : "✓ Services configuration saved as draft."
        );
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        alert("Failed to save services configuration.");
      }
    } catch {
      alert("Error saving services configuration.");
    } finally {
      setSaving(false);
    }
  };

  const services = config.services?.items || DEFAULT_SERVICES;

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      id: `srv_${Date.now()}`,
      title: "",
      slug: "",
      url: "",
      description: "",
      longDescription: "",
      badge: "NEW",
      icon: "Sparkles",
      features: [],
      isVisible: true,
      order: services.length + 1,
    });
    setFeaturesText("");
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItemConfig) => {
    setEditingService(srv);
    setFormData({ ...srv });
    setFeaturesText((srv.features || []).join("\n"));
    setModalOpen(true);
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert("Service title is required.");
      return;
    }

    const slug = formData.slug?.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const url = formData.url?.trim() || (slug === "about" ? "/about" : `/services/${slug}`);
    const featuresList = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const updatedItem: ServiceItemConfig = {
      id: formData.id || `srv_${Date.now()}`,
      title: formData.title.trim(),
      slug,
      url,
      description: formData.description?.trim() || "",
      longDescription: formData.longDescription?.trim() || "",
      badge: formData.badge?.trim() || undefined,
      icon: formData.icon || "Sparkles",
      features: featuresList,
      isVisible: formData.isVisible !== false,
      order: formData.order || services.length + 1,
    };

    let newItems: ServiceItemConfig[];
    if (editingService) {
      newItems = services.map((s) => (s.id === editingService.id ? updatedItem : s));
    } else {
      newItems = [...services, updatedItem];
    }

    // Re-index order
    newItems.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setConfig({
      ...config,
      services: {
        ...config.services,
        items: newItems,
      },
    });

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const newItems = services.filter((s) => s.id !== id);
    newItems.forEach((item, idx) => {
      item.order = idx + 1;
    });
    setConfig({
      ...config,
      services: {
        ...config.services,
        items: newItems,
      },
    });
  };

  const handleToggleVisible = (id: string) => {
    const newItems = services.map((s) => {
      if (s.id === id) {
        return { ...s, isVisible: !s.isVisible };
      }
      return s;
    });
    setConfig({
      ...config,
      services: {
        ...config.services,
        items: newItems,
      },
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const newItems = [...services];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    newItems.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setConfig({
      ...config,
      services: {
        ...config.services,
        items: newItems,
      },
    });
  };

  const handleResetDefaults = () => {
    if (!confirm("Reset all services to original 11 official Leadjen Media services?")) return;
    setConfig({
      ...config,
      services: {
        items: DEFAULT_SERVICES,
      },
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
              COMPANY SERVICES &amp; HAMBURGER MENU
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-black dark:text-white mt-1">
            About Leadjen Media Services Manager
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Administer the 11 About Leadjen Media service items, hamburger drawer links, landing pages, deliverables, and order
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
            <span>Add Service</span>
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

      {/* Services List Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black dark:text-white" />
            <h2 className="font-serif font-bold text-base text-black dark:text-white">
              Configured Company Services ({services.length})
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Visible in Hamburger Drawer &amp; Mega Menu
          </span>
        </div>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {services.map((service, index) => (
            <div
              key={service.id || index}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                service.isVisible ? "bg-transparent" : "bg-neutral-50/70 dark:bg-neutral-950/70 opacity-60"
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
                    disabled={index === services.length - 1}
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 disabled:opacity-20"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-black dark:text-white">
                      {service.title}
                    </h3>
                    {service.badge && (
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono font-bold uppercase rounded">
                        {service.badge}
                      </span>
                    )}
                    <span className="text-xs font-mono text-neutral-400">
                      {service.url || `/services/${service.slug}`}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans line-clamp-1">
                    {service.description}
                  </p>
                  {service.features && service.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {service.features.map((f, fIdx) => (
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
                <Link
                  href={service.url || `/services/${service.slug}`}
                  target="_blank"
                  className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
                  title="View Live Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleToggleVisible(service.id)}
                  className={`p-2 rounded-lg transition ${
                    service.isVisible
                      ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                      : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                  title={service.isVisible ? "Visible (Click to Hide)" : "Hidden (Click to Show)"}
                >
                  {service.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(service)}
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
                  title="Edit Service"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(service.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                  title="Delete Service"
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
                {editingService ? `Edit: ${editingService.title}` : "Add New Company Service"}
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
                    Service Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Celebrity Interview"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. celebrity-interview"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Custom URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.url || ""}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="e.g. /services/celebrity-interview or /about"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. EXCLUSIVE / ENTERPRISE"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Concise overview of what this service offers..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                  Detailed Editorial Narrative
                </label>
                <textarea
                  rows={3}
                  value={formData.longDescription || ""}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  placeholder="In-depth explanation displayed on the service landing page..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                  Features &amp; Deliverables (One per line)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Deliverable 1&#10;Deliverable 2&#10;Deliverable 3"
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
                  <span>Show in Hamburger Menu &amp; Public Pages</span>
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
