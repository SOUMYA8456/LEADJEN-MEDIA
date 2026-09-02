"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Navigation,
  Globe,
  Sliders,
  X,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  isVisible: boolean;
  order: number;
}

const DEFAULT_PRIMARY_NAV_CATEGORIES: NavItem[] = [
  { name: "HOME", href: "/", isVisible: true, order: 0 },
  { name: "INDIA", href: "/india", isVisible: true, order: 1 },
  { name: "WORLD", href: "/world", isVisible: true, order: 2 },
  { name: "POLITICS", href: "/politics", isVisible: true, order: 3 },
  { name: "BUSINESS", href: "/business", isVisible: true, order: 4 },
  { name: "TECHNOLOGY", href: "/technology", isVisible: true, order: 5 },
  { name: "SPORTS", href: "/sports", isVisible: true, order: 6 },
  { name: "ENTERTAINMENT", href: "/entertainment", isVisible: true, order: 7 },
  { name: "HEALTH", href: "/health", isVisible: true, order: 8 },
  { name: "SCIENCE", href: "/science", isVisible: true, order: 9 },
  { name: "LIFESTYLE", href: "/lifestyle", isVisible: true, order: 10 },
  { name: "TRAVEL", href: "/travel", isVisible: true, order: 11 },
];

interface FooterLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export default function SiteSettingsPage() {
  const [siteName, setSiteName] = useState("LEADJEN MEDIA");
  const [tagline, setTagline] = useState("Independent journalism. Important stories.");
  const [logoText, setLogoText] = useState("LEADJEN MEDIA");
  const [logoImage, setLogoImage] = useState("");
  const [breakingNewsSpeed, setBreakingNewsSpeed] = useState(35);
  const [showLiveButton, setShowLiveButton] = useState(true);
  const [showSearchButton, setShowSearchButton] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [clockTimezone, setClockTimezone] = useState("Asia/Kolkata");
  const [clockFormat, setClockFormat] = useState<"12h" | "24h">("12h");
  const [clockLabel, setClockLabel] = useState("IST");

  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>([]);
  const [draggedNavIndex, setDraggedNavIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New Custom Link input
  const [newNavName, setNewNavName] = useState("");
  const [newNavHref, setNewNavHref] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/site");
      const data = await res.json();
      if (data.settings) {
        const s = data.settings;
        setSiteName(s.siteName || "LEADJEN MEDIA");
        setTagline(s.tagline || "Independent journalism. Important stories.");
        setLogoText(s.logoText || "LEADJEN MEDIA");
        setLogoImage(s.logoImage || "");
        setBreakingNewsSpeed(s.breakingNewsSpeed || 35);
        setShowLiveButton(s.showLiveButton !== false);
        setShowSearchButton(s.showSearchButton !== false);
        setShowClock(s.showClock !== false);
        setClockTimezone(s.clockTimezone || "Asia/Kolkata");
        setClockFormat((s.clockFormat as any) || "12h");
        setClockLabel(s.clockLabel || "IST");

        if (s.headerNavItems) {
          try {
            setNavItems(JSON.parse(s.headerNavItems));
          } catch {}
        }
        if (s.footerColumns) {
          try {
            setFooterColumns(JSON.parse(s.footerColumns));
          } catch {}
        }
      }
    } catch {
      setMessage({ text: "Failed to load site settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        siteName,
        tagline,
        logoText,
        logoImage,
        breakingNewsSpeed,
        showLiveButton,
        showSearchButton,
        showClock,
        clockTimezone,
        clockFormat,
        clockLabel,
        headerNavItems: navItems,
        footerColumns,
      };

      const res = await fetch("/api/settings/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ text: "Site branding & navigation settings updated!", type: "success" });
      } else {
        setMessage({ text: "Failed to update settings", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error saving settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Nav Item controls
  const moveNavItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= navItems.length) return;
    const updated = [...navItems];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setNavItems(updated.map((item, i) => ({ ...item, order: i })));
  };

  const handleNavDragStart = (index: number) => {
    setDraggedNavIndex(index);
  };

  const handleNavDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedNavIndex === null || draggedNavIndex === index) return;
    const updated = [...navItems];
    const draggedItem = updated[draggedNavIndex];
    updated.splice(draggedNavIndex, 1);
    updated.splice(index, 0, draggedItem);
    setNavItems(updated.map((item, i) => ({ ...item, order: i })));
    setDraggedNavIndex(index);
  };

  const handleNavDragEnd = () => {
    setDraggedNavIndex(null);
  };

  const toggleNavItemVisible = (index: number) => {
    setNavItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isVisible: !item.isVisible } : item))
    );
  };

  const editNavItem = (index: number) => {
    const current = navItems[index];
    const newName = prompt("Edit Navigation Label:", current.name);
    if (newName === null) return;
    const newHref = prompt("Edit Destination URL:", current.href);
    if (newHref === null) return;

    setNavItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              name: newName.trim().toUpperCase() || item.name,
              href: newHref.trim() || item.href,
            }
          : item
      )
    );
  };

  const restoreDefaultNav = () => {
    if (!confirm("Reset navigation bar to default 12 categories in standard order?")) return;
    setNavItems(DEFAULT_PRIMARY_NAV_CATEGORIES);
    setMessage({ text: "Restored default 12 categories! Click 'Save Settings' to apply.", type: "success" });
  };

  const removeNavItem = (index: number) => {
    setNavItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomNavItem = () => {
    if (!newNavName.trim() || !newNavHref.trim()) return;
    const newItem: NavItem = {
      name: newNavName.trim().toUpperCase(),
      href: newNavHref.trim(),
      isVisible: true,
      order: navItems.length,
    };
    setNavItems((prev) => [...prev, newItem]);
    setNewNavName("");
    setNewNavHref("");
  };

  // Footer Link controls
  const addFooterLink = (colIdx: number) => {
    const label = prompt("Enter link label:");
    if (!label) return;
    const url = prompt("Enter destination URL:", "/");
    if (!url) return;

    setFooterColumns((prev) =>
      prev.map((col, i) =>
        i === colIdx ? { ...col, links: [...col.links, { label, url }] } : col
      )
    );
  };

  const removeFooterLink = (colIdx: number, linkIdx: number) => {
    setFooterColumns((prev) =>
      prev.map((col, i) =>
        i === colIdx
          ? { ...col, links: col.links.filter((_, li) => li !== linkIdx) }
          : col
      )
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-leadjen-600/20 text-leadjen-400 rounded-lg">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="font-serif font-black text-2xl text-white tracking-tight">
              SITE & NAVIGATION SETTINGS
            </h1>
          </div>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Configure editorial header navigation, branding, footer columns, and interactive toggles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-leadjen-600 hover:bg-leadjen-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-mono font-bold ${
            message.type === "success"
              ? "bg-green-950/80 text-green-300 border border-green-800"
              : "bg-red-950/80 text-red-300 border border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Brand Identity */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-serif font-bold text-lg text-white border-b border-gray-800 pb-2">
          Brand Identity & Header Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
              Company / Brand Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
              Editorial Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
              Header Logo Text
            </label>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
              Breaking Marquee Speed ({breakingNewsSpeed} seconds)
            </label>
            <input
              type="range"
              min="15"
              max="60"
              value={breakingNewsSpeed}
              onChange={(e) => setBreakingNewsSpeed(parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLiveButton}
              onChange={(e) => setShowLiveButton(e.target.checked)}
              className="rounded border-gray-700"
            />
            <span>Show 🔴 LIVE Button in Header</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSearchButton}
              onChange={(e) => setShowSearchButton(e.target.checked)}
              className="rounded border-gray-700"
            />
            <span>Show Search Button in Header</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showClock}
              onChange={(e) => setShowClock(e.target.checked)}
              className="rounded border-gray-700"
            />
            <span>Enable Live Real-Time Header Clock</span>
          </label>
        </div>

        {/* Live Clock Timezone & Format settings */}
        {showClock && (
          <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3 mt-4">
            <span className="text-xs font-mono font-bold uppercase text-leadjen-400 block">
              LIVE HEADER CLOCK CONFIGURATION
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
                  Timezone
                </label>
                <select
                  value={clockTimezone}
                  onChange={(e) => setClockTimezone(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="Asia/Kolkata">India (Asia/Kolkata - IST)</option>
                  <option value="Europe/London">London / UK (Europe/London - GMT/BST)</option>
                  <option value="America/New_York">New York / US (America/New_York - EST/EDT)</option>
                  <option value="Asia/Dubai">Dubai / UAE (Asia/Dubai - GST)</option>
                  <option value="Asia/Singapore">Singapore (Asia/Singapore - SGT)</option>
                  <option value="UTC">Universal Time (UTC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
                  Clock Format
                </label>
                <select
                  value={clockFormat}
                  onChange={(e) => setClockFormat(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="12h">12-Hour (e.g. 02:35:10 PM)</option>
                  <option value="24h">24-Hour (e.g. 14:35:10)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
                  Timezone Label Suffix
                </label>
                <input
                  type="text"
                  value={clockLabel}
                  onChange={(e) => setClockLabel(e.target.value)}
                  placeholder="IST"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation Categories Manager */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
          <div>
            <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <span>Header Navigation Bar Links</span>
              <span className="px-2 py-0.5 bg-leadjen-950 text-leadjen-400 border border-leadjen-800 text-[10px] font-mono font-bold rounded-full">
                {navItems.length} destinations
              </span>
            </h2>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              Drag & drop, reorder, rename labels, change URLs, or toggle category visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={restoreDefaultNav}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-mono font-bold transition border border-gray-700 self-start sm:self-auto"
          >
            <span>Restore Default 12 Categories</span>
          </button>
        </div>

        <div className="space-y-2">
          {navItems.map((item, idx) => (
            <div
              key={idx}
              draggable={true}
              onDragStart={() => handleNavDragStart(idx)}
              onDragOver={(e) => handleNavDragOver(e, idx)}
              onDragEnd={handleNavDragEnd}
              className={`p-3 rounded-xl border flex items-center justify-between transition cursor-move ${
                draggedNavIndex === idx
                  ? "opacity-50 border-leadjen-500 bg-gray-900"
                  : item.isVisible
                  ? "bg-gray-950 border-gray-800 text-white hover:border-gray-700"
                  : "bg-gray-950/40 border-gray-900 text-gray-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gray-500 hover:text-leadjen-400 font-bold select-none">
                  ☰ {idx + 1}.
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => editNavItem(idx)}
                      className="text-[10px] font-mono text-leadjen-400 hover:underline"
                    >
                      (Edit)
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono block">
                    {item.href}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleNavItemVisible(idx)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition ${
                    item.isVisible
                      ? "bg-green-950 text-green-400 border border-green-800"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {item.isVisible ? "Visible" : "Hidden"}
                </button>

                <button
                  type="button"
                  onClick={() => moveNavItem(idx, "up")}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 hover:bg-gray-800 rounded"
                  title="Move Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveNavItem(idx, "down")}
                  disabled={idx === navItems.length - 1}
                  className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 hover:bg-gray-800 rounded"
                  title="Move Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeNavItem(idx)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Navigation Link */}
        <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-gray-400 block">
            Add Custom Header Navigation Link
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Label (e.g. OPINION)"
              value={newNavName}
              onChange={(e) => setNewNavName(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Destination URL (e.g. /opinion)"
              value={newNavHref}
              onChange={(e) => setNewNavHref(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white"
            />
            <button
              type="button"
              onClick={addCustomNavItem}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
            >
              + Add Link
            </button>
          </div>
        </div>
      </div>

      {/* 3. Footer Columns Builder */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-serif font-bold text-lg text-white border-b border-gray-800 pb-2">
          Footer Columns & Links Management
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {footerColumns.map((col, colIdx) => (
            <div
              key={colIdx}
              className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3"
            >
              <input
                type="text"
                value={col.title}
                onChange={(e) => {
                  const updated = [...footerColumns];
                  updated[colIdx].title = e.target.value;
                  setFooterColumns(updated);
                }}
                className="w-full bg-gray-900 border border-gray-800 rounded p-1.5 text-xs font-mono font-bold text-leadjen-400 uppercase"
              />

              <div className="space-y-1.5">
                {col.links.map((link, linkIdx) => (
                  <div
                    key={linkIdx}
                    className="flex items-center justify-between p-1.5 bg-gray-900/60 rounded text-xs"
                  >
                    <span className="text-gray-300 truncate max-w-[120px]">{link.label}</span>
                    <button
                      type="button"
                      onClick={() => removeFooterLink(colIdx, linkIdx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addFooterLink(colIdx)}
                className="w-full py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded text-[11px] font-mono font-bold uppercase transition"
              >
                + Add Link
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
