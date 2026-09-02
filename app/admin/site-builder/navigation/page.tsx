"use client";

import React, { useState, useEffect } from "react";
import {
  Navigation,
  Plus,
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Edit,
  CheckCircle,
  Layers,
} from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { DEFAULT_SITE_BUILDER_CONFIG, NavItemConfig, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export default function NavigationBuilder() {
  const [config, setConfig] = useState<SiteBuilderConfig>(DEFAULT_SITE_BUILDER_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [newItemName, setNewItemName] = useState("");
  const [newItemHref, setNewItemHref] = useState("");
  const [newItemMegaMenu, setNewItemMegaMenu] = useState(false);

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
        setStatusMessage(isPublish ? "✓ Navigation published live!" : "✓ Navigation saved as draft.");
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Failed to save navigation.");
    } finally {
      setSaving(false);
    }
  };

  const navItems = config.navigation.items || [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemHref.trim()) return;

    const newItem: NavItemConfig = {
      id: `nav_${Date.now()}`,
      name: newItemName.trim().toUpperCase(),
      href: newItemHref.trim(),
      isVisible: true,
      order: navItems.length + 1,
      isMegaMenu: newItemMegaMenu,
    };

    setConfig({
      ...config,
      navigation: {
        ...config.navigation,
        items: [...navItems, newItem],
      },
    });

    setNewItemName("");
    setNewItemHref("");
    setNewItemMegaMenu(false);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;

    const newItems = [...navItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update order values
    newItems.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setConfig({
      ...config,
      navigation: {
        ...config.navigation,
        items: newItems,
      },
    });
  };

  const handleToggleVisible = (index: number) => {
    const newItems = [...navItems];
    newItems[index].isVisible = !newItems[index].isVisible;
    setConfig({
      ...config,
      navigation: {
        ...config.navigation,
        items: newItems,
      },
    });
  };

  const handleToggleMega = (index: number) => {
    const newItems = [...navItems];
    newItems[index].isMegaMenu = !newItems[index].isMegaMenu;
    setConfig({
      ...config,
      navigation: {
        ...config.navigation,
        items: newItems,
      },
    });
  };

  const handleDelete = (index: number) => {
    const newItems = navItems.filter((_, idx) => idx !== index);
    newItems.forEach((item, idx) => {
      item.order = idx + 1;
    });
    setConfig({
      ...config,
      navigation: {
        ...config.navigation,
        items: newItems,
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
              MAIN NAVIGATION
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-black dark:text-white mt-1">
            Primary Navigation &amp; Mega Menu Builder
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Configure primary menu tabs, category links, mega menu overlays, order, and visibility
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

      {/* Add New Navigation Item Form */}
      <form onSubmit={handleAddItem} className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
        <h4 className="font-serif font-bold text-sm text-black dark:text-white">
          + Add Navigation Link
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Label (e.g. DIPLOMACY)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono uppercase text-black dark:text-white focus:outline-hidden"
          />
          <input
            type="text"
            required
            placeholder="URL Path (e.g. /diplomacy)"
            value={newItemHref}
            onChange={(e) => setNewItemHref(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-mono text-neutral-600 dark:text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={newItemMegaMenu}
                onChange={(e) => setNewItemMegaMenu(e.target.checked)}
                className="w-4 h-4 accent-black dark:accent-white"
              />
              <span>Mega Menu</span>
            </label>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase transition"
            >
              Add Link
            </button>
          </div>
        </div>
      </form>

      {/* Navigation Items List */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-neutral-100 dark:divide-neutral-800">
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-mono text-[10px] uppercase font-bold grid grid-cols-12 gap-2">
          <span className="col-span-1">Order</span>
          <span className="col-span-3">Menu Label</span>
          <span className="col-span-4">Target Path</span>
          <span className="col-span-2 text-center">Mega Menu</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {navItems.map((item, index) => (
          <div
            key={item.id || index}
            className={`p-3.5 grid grid-cols-12 gap-2 items-center text-xs font-sans hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition ${
              !item.isVisible ? "opacity-50" : ""
            }`}
          >
            <span className="col-span-1 font-mono font-bold text-neutral-400">
              #{index + 1}
            </span>

            <span className="col-span-3 font-mono font-bold text-black dark:text-white">
              {item.name}
            </span>

            <span className="col-span-4 font-mono text-neutral-500 truncate">
              {item.href}
            </span>

            <div className="col-span-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleToggleMega(index)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  item.isMegaMenu
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                }`}
              >
                {item.isMegaMenu ? "Mega Menu On" : "Simple Link"}
              </button>
            </div>

            <div className="col-span-2 flex items-center justify-end gap-1">
              {/* Move Up / Move Down */}
              <button
                type="button"
                disabled={index === 0}
                onClick={() => handleMove(index, "up")}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded disabled:opacity-20"
                title="Move Up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={index === navItems.length - 1}
                onClick={() => handleMove(index, "down")}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded disabled:opacity-20"
                title="Move Down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Visibility Toggle */}
              <button
                type="button"
                onClick={() => handleToggleVisible(index)}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded"
                title={item.isVisible ? "Hide from Navigation" : "Show in Navigation"}
              >
                {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="p-1.5 hover:bg-red-500/10 text-neutral-400 hover:text-red-600 rounded"
                title="Remove Navigation Item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
