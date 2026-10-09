"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  Plus,
  Save,
  Send,
  Eye,
  RotateCcw,
  History,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Sparkles,
  Layout,
  Search,
  X,
  Maximize2,
  RefreshCw,
  Sliders,
  Check,
  ShieldCheck,
  Radio,
  FileDiff,
  Lock,
  Navigation,
  Link as LinkIcon,
  Globe,
  Settings,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  category: { name: string; slug: string };
  author: { name: string };
  status: string;
}

interface Section {
  id: string;
  name: string;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  enabled: boolean;
  sortOrder: number;
  layout: string;
  contentSource: string;
  categoryId?: string | null;
  category?: Category | null;
  storyLimit: number;
  background: string;
  spacing: string;
  borders: string;
  imageRatio: string;
  showImages: boolean;
  showExcerpt: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showReadingTime: boolean;
  showCategory: boolean;
  showViewAll: boolean;
  viewAllUrl?: string | null;
  desktopCols: number;
  tabletCols: number;
  mobileCols: number;
  customSettings?: string | null;
  manualArticles?: { article: Article; sortOrder: number }[];
}

interface NavItem {
  name: string;
  href: string;
  isVisible?: boolean;
  inMore?: boolean;
  isProtected?: boolean;
}

const DEFAULT_ADMIN_NAV: NavItem[] = [
  { name: "HOME", href: "/", isVisible: true, isProtected: true },
  { name: "INDIA", href: "/india", isVisible: true },
  { name: "WORLD", href: "/world", isVisible: true },
  { name: "POLITICS", href: "/politics", isVisible: true },
  { name: "BUSINESS", href: "/business", isVisible: true },
  { name: "TECHNOLOGY", href: "/technology", isVisible: true },
  { name: "SPORTS", href: "/sports", isVisible: true },
  { name: "ENTERTAINMENT", href: "/entertainment", isVisible: true },
  { name: "HEALTH", href: "/health", isVisible: true },
  { name: "SCIENCE", href: "/science", isVisible: true },
  { name: "LIFESTYLE", href: "/lifestyle", isVisible: true },
  { name: "TRAVEL", href: "/travel", isVisible: true },
  { name: "VIDEO", href: "/videos", isVisible: true },
  { name: "PHOTOS", href: "/photos", isVisible: true },
];

export default function HomepageBuilderPage() {
  const [activeTab, setActiveTab] = useState<"sections" | "navigation">("sections");
  const [sections, setSections] = useState<Section[]>([]);
  const [publishedSections, setPublishedSections] = useState<Section[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_ADMIN_NAV);
  const [publishedNavItems, setPublishedNavItems] = useState<NavItem[]>(DEFAULT_ADMIN_NAV);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Draft tracking state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [lastPublishedTime, setLastPublishedTime] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<number>(Date.now());

  // Modals and drawers state
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingNavItem, setEditingNavItem] = useState<{ item: NavItem; index: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddNavModalOpen, setIsAddNavModalOpen] = useState(false);
  const [newNavName, setNewNavName] = useState("");
  const [newNavUrl, setNewNavUrl] = useState("");
  const [newNavInMore, setNewNavInMore] = useState(false);

  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showChangesPanel, setShowChangesPanel] = useState(true);

  // Article search inside section modal
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Unsaved changes beforeunload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved homepage changes. Leave without saving?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Fullscreen preview scroll-lock and escape key listener
  useEffect(() => {
    if (isFullscreenPreviewOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFullscreenPreviewOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isFullscreenPreviewOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [secRes, catRes, verRes, setRes] = await Promise.all([
        fetch("/api/homepage/sections?draft=true"),
        fetch("/api/categories"),
        fetch("/api/homepage/versions"),
        fetch("/api/settings/site?draft=true"),
      ]);

      const secData = await secRes.json();
      const catData = await catRes.json();
      const verData = await verRes.json();
      const setData = await setRes.json();

      if (secData.sections) {
        setSections(secData.sections);
        setPublishedSections(JSON.parse(JSON.stringify(secData.sections)));
      }
      if (catData.categories) setCategories(catData.categories);
      if (setData.settings?.headerNavItems) {
        try {
          const parsed = JSON.parse(setData.settings.headerNavItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNavItems(parsed);
            setPublishedNavItems(JSON.parse(JSON.stringify(parsed)));
          }
        } catch {}
      }

      setHasUnsavedChanges(false);
      setLastSavedTime(
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST"
      );

      if (verData.versions && verData.versions.length > 0) {
        setVersions(verData.versions);
        setLastPublishedTime(
          new Date(verData.versions[0].publishedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " IST"
        );
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load homepage draft from PostgreSQL", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Diff calculation between Draft and Published state
  const getDraftChanges = (): string[] => {
    const changes: string[] = [];

    // Section modifications
    sections.forEach((s, idx) => {
      const pub = publishedSections.find((p) => p.id === s.id);
      if (pub) {
        if (pub.sortOrder !== idx) {
          changes.push(`Reordered section "${s.name}": #${pub.sortOrder + 1} → #${idx + 1}`);
        }
        if (pub.enabled !== s.enabled) {
          changes.push(`Section visibility: "${s.name}" is now ${s.enabled ? "Enabled" : "Disabled"}`);
        }
        if (pub.title !== s.title && s.title) {
          changes.push(`Title updated: "${pub.title || pub.name}" → "${s.title}"`);
        }
      }
    });

    // Navigation modifications
    if (JSON.stringify(navItems) !== JSON.stringify(publishedNavItems)) {
      changes.push(`Primary Navigation customized (${navItems.filter((n) => n.isVisible !== false).length} active items)`);
    }

    if (changes.length === 0) {
      changes.push("Draft is identical to the currently published live homepage.");
    }

    return changes;
  };

  // Navigation management functions
  const moveNavItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= navItems.length) return;

    const updated = [...navItems];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;

    setNavItems(updated);
    setHasUnsavedChanges(true);
    syncNavDraft(updated);
  };

  const toggleNavItemVisible = (index: number) => {
    const item = navItems[index];
    if (item.isProtected) {
      alert(`The "${item.name}" item is a protected system item.`);
      return;
    }
    const updated = [...navItems];
    updated[index] = { ...item, isVisible: item.isVisible === false ? true : false };
    setNavItems(updated);
    setHasUnsavedChanges(true);
    syncNavDraft(updated);
  };

  const toggleNavItemInMore = (index: number) => {
    const item = navItems[index];
    if (item.isProtected) return;
    const updated = [...navItems];
    updated[index] = { ...item, inMore: !item.inMore };
    setNavItems(updated);
    setHasUnsavedChanges(true);
    syncNavDraft(updated);
  };

  const handleAddNavItem = () => {
    if (!newNavName.trim() || !newNavUrl.trim()) return;
    const newItem: NavItem = {
      name: newNavName.toUpperCase().trim(),
      href: newNavUrl.trim(),
      isVisible: true,
      inMore: newNavInMore,
    };
    const updated = [...navItems, newItem];
    setNavItems(updated);
    setNewNavName("");
    setNewNavUrl("");
    setNewNavInMore(false);
    setIsAddNavModalOpen(false);
    setHasUnsavedChanges(true);
    syncNavDraft(updated);
    setMessage({ text: `Navigation item "${newItem.name}" added to draft.`, type: "success" });
  };

  const handleDeleteNavItem = (index: number) => {
    const item = navItems[index];
    if (item.isProtected) {
      alert(`Protected item "${item.name}" cannot be deleted.`);
      return;
    }
    if (!confirm(`Remove "${item.name}" from navigation?`)) return;
    const updated = navItems.filter((_, i) => i !== index);
    setNavItems(updated);
    setHasUnsavedChanges(true);
    syncNavDraft(updated);
  };

  const handleSaveNavItemEdit = () => {
    if (!editingNavItem) return;
    const updated = [...navItems];
    updated[editingNavItem.index] = {
      ...editingNavItem.item,
      name: editingNavItem.item.name.toUpperCase().trim(),
    };
    setNavItems(updated);
    setEditingNavItem(null);
    setHasUnsavedChanges(true);
    syncNavDraft(updated);
  };

  const syncNavDraft = async (items: NavItem[]) => {
    try {
      await fetch("/api/settings/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftHeaderNavItems: items }),
      });
      setPreviewKey(Date.now());
      setLastSavedTime(
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST"
      );
    } catch {}
  };

  // Section reordering functions
  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((sec, idx) => ({ ...sec, sortOrder: idx }));
    setSections(reordered);
    setHasUnsavedChanges(true);
    triggerAutoDraftSync(reordered);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...sections];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    const reordered = updated.map((sec, idx) => ({ ...sec, sortOrder: idx }));
    setSections(reordered);
    setDraggedIndex(index);
    setHasUnsavedChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    triggerAutoDraftSync(sections);
  };

  const toggleSectionEnabled = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSections(updated);
    setHasUnsavedChanges(true);
    triggerAutoDraftSync(updated);
  };

  const triggerAutoDraftSync = async (sectionsToSync: Section[]) => {
    try {
      await fetch("/api/homepage/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: sectionsToSync }),
      });
      setPreviewKey(Date.now());
      setLastSavedTime(
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST"
      );
    } catch {}
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to remove this section from the homepage draft?")) return;
    try {
      const res = await fetch(`/api/homepage/sections/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = sections.filter((s) => s.id !== id).map((s, idx) => ({ ...s, sortOrder: idx }));
        setSections(updated);
        setPreviewKey(Date.now());
        setMessage({ text: "Section removed from draft", type: "success" });
      }
    } catch {
      setMessage({ text: "Error deleting section", type: "error" });
    }
  };

  const handleDuplicateSection = (section: Section) => {
    const duplicated: Section = {
      ...section,
      id: `temp-${Date.now()}`,
      name: `${section.name} (Copy)`,
      title: section.title ? `${section.title} (Copy)` : null,
      sortOrder: sections.length,
    };
    const updated = [...sections, duplicated];
    setSections(updated);
    setHasUnsavedChanges(true);
    triggerAutoDraftSync(updated);
    setMessage({ text: "Section duplicated in draft. Preview updated.", type: "success" });
  };

  // Save Draft (Explicit Action)
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await Promise.all([
        fetch("/api/homepage/sections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections }),
        }),
        fetch("/api/settings/site", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftHeaderNavItems: navItems }),
        }),
      ]);

      setHasUnsavedChanges(false);
      const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST";
      setLastSavedTime(timeStr);
      setPreviewKey(Date.now());
      setMessage({ text: `✓ Draft saved successfully! (Last saved: ${timeStr})`, type: "success" });
    } catch {
      setMessage({ text: "Network error saving draft", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Publish to Live Site
  const handlePublish = async () => {
    try {
      setPublishing(true);
      await Promise.all([
        fetch("/api/homepage/sections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections }),
        }),
        fetch("/api/settings/site", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftHeaderNavItems: navItems }),
        }),
      ]);

      const res = await fetch("/api/homepage/publish", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setPublishedSections(JSON.parse(JSON.stringify(sections)));
        setPublishedNavItems(JSON.parse(JSON.stringify(navItems)));
        setHasUnsavedChanges(false);
        const pubTime =
          new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " IST";
        setLastPublishedTime(pubTime);
        setPreviewKey(Date.now());
        setMessage({
          text: `🎉 Homepage & Navigation published live! (Published: ${pubTime})`,
          type: "success",
        });
      } else {
        setMessage({ text: data.error || "Failed to publish", type: "error" });
      }
    } catch {
      setMessage({ text: "Error publishing to production", type: "error" });
    } finally {
      setPublishing(false);
    }
  };

  const handleResetDefault = async () => {
    if (!confirm("Reset homepage & navigation draft to standard Leadjen Media editorial default?")) return;
    try {
      setLoading(true);
      await fetch("/api/homepage/reset", { method: "POST" });
      await fetch("/api/settings/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftHeaderNavItems: DEFAULT_ADMIN_NAV, headerNavItems: DEFAULT_ADMIN_NAV }),
      });
      await fetchData();
      setPreviewKey(Date.now());
      setMessage({ text: "Homepage & navigation restored to default editorial layout.", type: "success" });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (sec: Section) => {
    setEditingSection({ ...sec });
    setActiveSectionId(sec.id);
    if (sec.manualArticles) {
      setSelectedArticles(sec.manualArticles.map((m) => m.article));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSaveSectionEdit = async () => {
    if (!editingSection) return;
    try {
      setSaving(true);
      const payload = {
        ...editingSection,
        manualArticleIds: selectedArticles.map((a) => a.id),
      };

      const res = await fetch(`/api/homepage/sections/${editingSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = sections.map((s) => (s.id === editingSection.id ? data.section : s));
        setSections(updated);
        setEditingSection(null);
        setHasUnsavedChanges(true);
        triggerAutoDraftSync(updated);
        setMessage({ text: `Section "${editingSection.name}" updated in draft! Preview refreshed.`, type: "success" });
      }
    } finally {
      setSaving(false);
    }
  };

  const searchArticles = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.articles) setSearchResults(data.articles);
    } catch {}
  };

  const toggleSelectArticle = (art: Article) => {
    if (selectedArticles.some((a) => a.id === art.id)) {
      setSelectedArticles((prev) => prev.filter((a) => a.id !== art.id));
    } else {
      setSelectedArticles((prev) => [...prev, art]);
    }
  };

  const handleAddPreset = async (preset: Partial<Section>) => {
    try {
      const res = await fetch("/api/homepage/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = [...sections, data.section];
        setSections(updated);
        setIsAddModalOpen(false);
        setHasUnsavedChanges(true);
        triggerAutoDraftSync(updated);
        setMessage({ text: `Added section: ${preset.name}`, type: "success" });
      }
    } catch {
      setMessage({ text: "Error creating section", type: "error" });
    }
  };

  const openVersionsModal = async () => {
    try {
      const res = await fetch("/api/homepage/versions");
      const data = await res.json();
      if (data.versions) setVersions(data.versions);
      setIsVersionModalOpen(true);
    } catch {}
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm("Restore homepage to this previous version snapshot in your draft?")) return;
    try {
      setLoading(true);
      const res = await fetch("/api/homepage/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      if (res.ok) {
        await fetchData();
        setIsVersionModalOpen(false);
        setHasUnsavedChanges(true);
        setPreviewKey(Date.now());
        setMessage({
          text: "Snapshot restored to draft. Click [Publish Live] when ready to deploy publicly.",
          type: "success",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pb-20 space-y-5">
      {/* Top Header & Global Actions Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 bg-leadjen-600/20 text-leadjen-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="font-serif font-black text-xl sm:text-2xl text-white tracking-tight">
              HOMEPAGE & NAVIGATION BUILDER
            </h1>
            <span className="px-2.5 py-0.5 bg-amber-950/80 text-amber-300 text-[11px] font-mono font-bold rounded-full border border-amber-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              DRAFT PREVIEW MODE
            </span>
            {hasUnsavedChanges ? (
              <span className="px-2.5 py-0.5 bg-yellow-950 text-yellow-400 text-[11px] font-mono font-bold rounded-full border border-yellow-800">
                UNSAVED CHANGES
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-green-950 text-green-400 text-[11px] font-mono font-bold rounded-full border border-green-800">
                ALL DRAFT SAVED
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-sans mt-1.5">
            Reorder news categories, configure editorial sections, customize headlines, and inspect live multi-device preview before publishing.
          </p>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider transition border border-gray-700"
            title="Compare draft against currently published live homepage"
          >
            <FileDiff className="w-4 h-4 text-leadjen-400" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          <button
            type="button"
            onClick={openVersionsModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider transition border border-gray-700"
            title="View published version snapshots and rollbacks"
          >
            <History className="w-4 h-4 text-gray-300" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition border border-gray-700"
            title="Reset draft to default Leadjen editorial layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 border border-gray-600 shadow"
          >
            <Save className="w-4 h-4 text-leadjen-300" />
            <span>{saving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPublishConfirmOpen(true)}
            disabled={publishing}
            className="flex items-center gap-1.5 px-5 py-2 bg-leadjen-600 hover:bg-leadjen-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-leadjen-600/30 disabled:opacity-50 font-sans"
          >
            <Send className="w-4 h-4" />
            <span>{publishing ? "Publishing..." : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {/* Notifications Message */}
      {message && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-mono font-bold ${
            message.type === "success"
              ? "bg-green-950/90 text-green-300 border border-green-800"
              : "bg-red-950/90 text-red-300 border border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TWO-PANEL EDITORIAL WORKSPACE: CONTROLS (LEFT) + LIVE PREVIEW (RIGHT)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* LEFT PANEL: CONTROLS (5 COLS)                                          */}
        {/* ======================================================================= */}
        <div className="xl:col-span-5 space-y-4">
          {/* Main Control Suite Mode Switcher: SECTIONS vs NAVIGATION */}
          <div className="bg-gray-950 p-1.5 rounded-xl border border-gray-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("sections")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold uppercase transition ${
                activeTab === "sections"
                  ? "bg-leadjen-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Homepage Sections ({sections.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("navigation")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold uppercase transition ${
                activeTab === "navigation"
                  ? "bg-leadjen-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigation ({navItems.length})</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* TAB 1: HOMEPAGE SECTIONS BUILDER                                      */}
          {/* ===================================================================== */}
          {activeTab === "sections" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-gray-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
                  HOMEPAGE SECTIONS ORDER
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-leadjen-600 hover:bg-leadjen-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>

              {/* Structurally Protected Top Components */}
              <div className="p-3 bg-gray-950/80 border border-dashed border-gray-800 rounded-xl flex items-center justify-between text-xs font-mono text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-300 font-bold rounded text-[10px]">STRUCTURAL</span>
                  <span className="text-gray-300">1. Top Ad → 2. Header → 3. Navigation</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-gray-500" />
              </div>

              {/* Sections List */}
              <div className="space-y-2.5 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
                {sections.map((sec, idx) => {
                  const isActive = activeSectionId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 select-none cursor-pointer ${
                        draggedIndex === idx
                          ? "opacity-50 border-leadjen-500 bg-gray-900/60"
                          : isActive
                          ? "bg-leadjen-950/40 border-leadjen-500/80 shadow-md shadow-leadjen-950/50"
                          : sec.enabled
                          ? "bg-gray-900/80 border-gray-800 hover:border-gray-700"
                          : "bg-gray-950/40 border-gray-900 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-gray-300 rounded"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <span className="font-mono font-bold text-xs text-leadjen-400 w-5">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-serif font-bold text-sm text-white truncate max-w-[180px]">
                              {sec.name}
                            </h3>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded font-bold">
                              {sec.type}
                            </span>
                          </div>
                          {sec.title && (
                            <p className="text-[11px] text-gray-400 font-sans truncate max-w-[200px]">
                              &quot;{sec.title}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => moveSection(idx, "up")}
                            disabled={idx === 0}
                            className="p-0.5 text-gray-400 hover:text-white disabled:opacity-20 transition"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(idx, "down")}
                            disabled={idx === sections.length - 1}
                            className="p-0.5 text-gray-400 hover:text-white disabled:opacity-20 transition"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSectionEnabled(sec.id)}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition ${
                            sec.enabled
                              ? "bg-green-950 text-green-400 border border-green-800"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}
                        >
                          {sec.enabled ? "Live" : "Hidden"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(sec)}
                          className="p-1.5 text-leadjen-400 hover:text-leadjen-300 hover:bg-leadjen-950/60 rounded transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Structurally Protected Bottom Footer Component */}
              <div className="p-3 bg-gray-950/80 border border-dashed border-gray-800 rounded-xl flex items-center justify-between text-xs font-mono text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-300 font-bold rounded text-[10px]">STRUCTURAL</span>
                  <span className="text-gray-300">16. Leadjen Media 4-Column Editorial Footer</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: NAVIGATION & HEADER MANAGEMENT                                */}
          {/* ===================================================================== */}
          {activeTab === "navigation" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-gray-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
                  PRIMARY NAVIGATION BAR DESKS
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddNavModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-leadjen-600 hover:bg-leadjen-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              </div>

              <p className="text-xs text-gray-400 font-sans">
                Drag or use arrows to reorder. Items appear left-to-right across the primary news navigation bar.
              </p>

              {/* Navigation Items List */}
              <div className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
                {navItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      item.isVisible !== false
                        ? "bg-gray-900/80 border-gray-800"
                        : "bg-gray-950/40 border-gray-900 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-xs text-leadjen-400 w-5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-mono font-bold text-xs text-white uppercase">{item.name}</h4>
                          {item.isProtected && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-gray-800 text-amber-400 rounded font-bold">
                              Protected
                            </span>
                          )}
                          {item.inMore && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded font-bold">
                              In More
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono truncate">{item.href}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveNavItem(idx, "up")}
                          disabled={idx === 0}
                          className="p-0.5 text-gray-400 hover:text-white disabled:opacity-20 transition"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveNavItem(idx, "down")}
                          disabled={idx === navItems.length - 1}
                          className="p-0.5 text-gray-400 hover:text-white disabled:opacity-20 transition"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleNavItemVisible(idx)}
                        disabled={item.isProtected}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition ${
                          item.isVisible !== false
                            ? "bg-green-950 text-green-400 border border-green-800"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        } disabled:opacity-50`}
                      >
                        {item.isVisible !== false ? "Live" : "Hidden"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingNavItem({ item, index: idx })}
                        className="p-1.5 text-leadjen-400 hover:text-leadjen-300 rounded transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {!item.isProtected && (
                        <button
                          type="button"
                          onClick={() => handleDeleteNavItem(idx)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changes Made in Current Draft Inspector Panel */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-leadjen-400" />
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                  CHANGES MADE IN THIS DRAFT
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangesPanel(!showChangesPanel)}
                className="text-[10px] font-mono text-leadjen-400 hover:underline"
              >
                {showChangesPanel ? "Collapse" : "Expand"}
              </button>
            </div>
            {showChangesPanel && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {getDraftChanges().map((change, i) => (
                  <div
                    key={i}
                    className="p-1.5 bg-gray-900/80 border border-gray-800/80 rounded text-[11px] font-mono text-gray-300 flex items-start gap-1.5"
                  >
                    <span className="text-leadjen-400 font-bold">✓</span>
                    <span className="line-clamp-2">{change}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT PANEL: LIVE HOMEPAGE & HEADER PREVIEW CANVAS (7 COLS)             */}
        {/* ======================================================================= */}
        <div className="xl:col-span-7 sticky top-20 flex flex-col h-[calc(100vh-6.5rem)] bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Preview Header Bar */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                LIVE DRAFT PREVIEW
              </span>
              <span className="hidden md:inline text-[10px] font-mono text-gray-400">
                (Full Header & Layout • Instant Sync)
              </span>
            </div>

            {/* Viewport Switcher */}
            <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                  previewDevice === "desktop"
                    ? "bg-leadjen-600 text-white font-bold shadow"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Desktop 1440px"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">1440px</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("tablet")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                  previewDevice === "tablet"
                    ? "bg-leadjen-600 text-white font-bold shadow"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Tablet 768px"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">768px</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                  previewDevice === "mobile"
                    ? "bg-leadjen-600 text-white font-bold shadow"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Mobile 390px"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">390px</span>
              </button>
            </div>

            {/* Preview Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewKey(Date.now())}
                className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                title="Reload Preview Frame"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreenPreviewOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition border border-gray-700"
              >
                <Maximize2 className="w-3.5 h-3.5 text-leadjen-400" />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>

              <a
                href="/?preview=draft"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition border border-gray-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Tab</span>
              </a>
            </div>
          </div>

          {/* Preview Canvas Container */}
          <div className="flex-1 bg-neutral-900/80 p-2 sm:p-4 overflow-y-auto flex items-start justify-center">
            <div
              className={`h-full min-h-[600px] bg-white transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-gray-800 ${
                previewDevice === "desktop"
                  ? "w-full max-w-full"
                  : previewDevice === "tablet"
                  ? "w-[768px] max-w-full"
                  : "w-[390px] max-w-full"
              }`}
            >
              <iframe
                ref={previewIframeRef}
                src={`/?preview=draft&t=${previewKey}`}
                className="w-full h-full min-h-[700px] border-0 bg-white"
                title="Live Leadjen Media Draft Preview"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT NAVIGATION ITEM MODAL                                                */}
      {/* ========================================================================= */}
      {editingNavItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-serif font-black text-lg text-white">Edit Navigation Desk</h3>
              <button
                type="button"
                onClick={() => setEditingNavItem(null)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block font-bold uppercase text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingNavItem.item.name}
                  onChange={(e) =>
                    setEditingNavItem({
                      ...editingNavItem,
                      item: { ...editingNavItem.item, name: e.target.value },
                    })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-400 mb-1">Target URL</label>
                <input
                  type="text"
                  value={editingNavItem.item.href}
                  onChange={(e) =>
                    setEditingNavItem({
                      ...editingNavItem,
                      item: { ...editingNavItem.item, href: e.target.value },
                    })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNavItem.item.isVisible !== false}
                    onChange={(e) =>
                      setEditingNavItem({
                        ...editingNavItem,
                        item: { ...editingNavItem.item, isVisible: e.target.checked },
                      })
                    }
                  />
                  <span>Show in Navigation</span>
                </label>
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingNavItem.item.inMore)}
                    onChange={(e) =>
                      setEditingNavItem({
                        ...editingNavItem,
                        item: { ...editingNavItem.item, inMore: e.target.checked },
                      })
                    }
                  />
                  <span>Move to MORE Menu</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setEditingNavItem(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNavItemEdit}
                className="px-5 py-2 bg-leadjen-600 hover:bg-leadjen-700 text-white rounded-xl text-xs font-bold uppercase"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW NAVIGATION ITEM MODAL                                             */}
      {/* ========================================================================= */}
      {isAddNavModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-serif font-black text-lg text-white">Add Navigation Item</h3>
              <button
                type="button"
                onClick={() => setIsAddNavModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block font-bold uppercase text-gray-400 mb-1">Display Label</label>
                <input
                  type="text"
                  placeholder="e.g., OPINION, AI & TECH, CLIMATE"
                  value={newNavName}
                  onChange={(e) => setNewNavName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-400 mb-1">Route Path / URL</label>
                <input
                  type="text"
                  placeholder="e.g., /opinion, /technology, /climate"
                  value={newNavUrl}
                  onChange={(e) => setNewNavUrl(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNavInMore}
                    onChange={(e) => setNewNavInMore(e.target.checked)}
                  />
                  <span>Place inside MORE Mega Menu dropdown</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsAddNavModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNavItem}
                className="px-5 py-2 bg-leadjen-600 hover:bg-leadjen-700 text-white rounded-xl text-xs font-bold uppercase"
              >
                Add Link to Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION SETTINGS EDIT MODAL / DRAWER                                     */}
      {/* ========================================================================= */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-leadjen-400">
                  SECTION CONFIGURATION
                </span>
                <h2 className="font-serif font-black text-xl text-white">
                  {editingSection.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
                  Section Admin Name
                </label>
                <input
                  type="text"
                  value={editingSection.name}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, name: e.target.value })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
                  Public Section Heading
                </label>
                <input
                  type="text"
                  value={editingSection.title || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title: e.target.value })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
                  Section Subtitle / Description
                </label>
                <input
                  type="text"
                  value={editingSection.subtitle || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, subtitle: e.target.value })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
                  Section Type
                </label>
                <select
                  value={editingSection.type}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, type: e.target.value })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="HERO">HERO (Lead Story 3-Col / Full)</option>
                  <option value="VIDEO_BRIEF">VIDEO_BRIEF (Top Video Briefing)</option>
                  <option value="BREAKING_TICKER">BREAKING_TICKER (Live Marquee)</option>
                  <option value="LATEST_NEWS">LATEST_NEWS (Timeline + Most Read)</option>
                  <option value="CATEGORY_SECTION">CATEGORY_SECTION (News Desk)</option>
                  <option value="NEWS_GRID">NEWS_GRID (Multi-Column Grid)</option>
                  <option value="MOST_READ">MOST_READ (Analytics Rank 01-05)</option>
                  <option value="TRENDING">TRENDING (Editorial Curated)</option>
                  <option value="VIDEO">VIDEO (Video Broadcasts)</option>
                  <option value="PHOTO_GALLERY">PHOTO_GALLERY (Lightbox)</option>
                  <option value="ADVERTISEMENT">ADVERTISEMENT (Dynamic Banner)</option>
                  <option value="EDITORIAL_DISPATCH">EDITORIAL_DISPATCH (Newsletter Box)</option>
                  <option value="NEWSLETTER">NEWSLETTER (Subscription Box)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-1">
                  Story Limit ({editingSection.storyLimit} stories)
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={editingSection.storyLimit}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      storyLimit: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSectionEdit}
                disabled={saving}
                className="px-6 py-2 bg-leadjen-600 hover:bg-leadjen-700 text-white rounded-xl text-xs font-bold uppercase shadow"
              >
                {saving ? "Saving..." : "Apply to Draft"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Preset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <h2 className="font-serif font-black text-xl text-white">Choose a Section Preset</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "Special Leadjen Video Brief", type: "VIDEO_BRIEF", layout: "video-brief", contentSource: "VIDEO", storyLimit: 1, desc: "High-impact video briefing block positioned near top of homepage." },
                { name: "Breaking News & Trending Ticker", type: "BREAKING_TICKER", layout: "ticker", contentSource: "BREAKING", storyLimit: 5, desc: "Animated radar ticker for wire bulletins." },
                { name: "Main Editorial Hero (3-Column)", type: "HERO", layout: "hero-3col", contentSource: "FEATURED", storyLimit: 5, desc: "Lead developing stories, primary story, and sidebar." },
                { name: "Secondary Headlines Grid (4-Column)", type: "NEWS_GRID", layout: "four-col", contentSource: "LATEST", storyLimit: 4, desc: "Responsive 4-column developing reports grid." },
                { name: "Leadjen Video Journalism", type: "VIDEO", layout: "video-grid", contentSource: "VIDEO", storyLimit: 3, desc: "Broadcast-style video grid with pop-up player." },
                { name: "Leadjen Photo Journalism", type: "PHOTO_GALLERY", layout: "gallery-grid", contentSource: "PHOTO", storyLimit: 1, desc: "Visual photography essay block with lightbox." },
                { name: "Latest News Timeline Wire", type: "LATEST_NEWS", layout: "latest-split", contentSource: "LATEST", storyLimit: 6, desc: "Chronological news feed wire split with Most Read." },
                { name: "Leadjen Editorial Dispatch", type: "EDITORIAL_DISPATCH", layout: "newsletter-box", contentSource: "LATEST", storyLimit: 1, desc: "Daily email briefing subscription CTA box." },
              ].map((preset, i) => (
                <div
                  key={i}
                  onClick={() =>
                    handleAddPreset({
                      name: preset.name,
                      type: preset.type,
                      layout: preset.layout,
                      contentSource: preset.contentSource,
                      storyLimit: preset.storyLimit,
                      title: preset.name,
                      enabled: true,
                      sortOrder: sections.length,
                    })
                  }
                  className="p-4 bg-gray-950 border border-gray-800 hover:border-leadjen-500 rounded-xl cursor-pointer transition"
                >
                  <h4 className="font-serif font-bold text-sm text-white mb-1">{preset.name}</h4>
                  <p className="text-xs text-gray-400">{preset.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {isFullscreenPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-serif font-black text-base sm:text-lg text-white">FULLSCREEN DRAFT PREVIEW</span>
              <span className="px-2 py-0.5 bg-amber-950 text-amber-300 text-[10px] font-mono font-bold rounded-full border border-amber-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                DRAFT
              </span>
            </div>

            {/* Device Switcher & Preview Controls */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 transition ${
                    previewDevice === "desktop"
                      ? "bg-leadjen-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Desktop View (100% / 1280px)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 transition ${
                    previewDevice === "tablet"
                      ? "bg-leadjen-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 transition ${
                    previewDevice === "mobile"
                      ? "bg-leadjen-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Mobile View (390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Mobile</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewKey(Date.now())}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition border border-gray-700"
                title="Reload Preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <a
                href={`/?preview=draft&t=${previewKey}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition border border-gray-700"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsFullscreenPreviewOpen(false);
                  setIsPublishConfirmOpen(true);
                }}
                className="px-4 py-1.5 bg-leadjen-600 hover:bg-leadjen-700 text-white rounded-xl text-xs font-bold uppercase shadow tracking-wider transition"
              >
                Publish Live
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenPreviewOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Iframe Viewport Area */}
          <div className="flex-1 bg-neutral-950 p-2 sm:p-4 overflow-y-auto flex items-center justify-center">
            <div
              className={`h-full w-full transition-all duration-300 flex items-center justify-center ${
                previewDevice === "mobile"
                  ? "max-w-[400px] py-4"
                  : previewDevice === "tablet"
                  ? "max-w-[800px] py-4"
                  : "max-w-[1400px]"
              }`}
            >
              <iframe
                src={`/?preview=draft&t=${previewKey}`}
                className="w-full h-full min-h-[85vh] border border-gray-800 bg-white rounded-xl shadow-2xl"
                title="Fullscreen Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-serif font-black text-lg text-white">Draft vs. Live Homepage Comparison</h3>
              <button type="button" onClick={() => setIsCompareModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {getDraftChanges().map((change, i) => (
                <div key={i} className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 flex items-start gap-2">
                  <span className="text-leadjen-400 font-bold">✓</span>
                  <span>{change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirm Modal */}
      {isPublishConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-serif font-black text-lg text-white">Publish Homepage & Navigation Live?</h3>
              <button type="button" onClick={() => setIsPublishConfirmOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400">All draft sections and navigation order will immediately deploy to public production.</p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button type="button" onClick={() => setIsPublishConfirmOpen(false)} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold uppercase">
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsPublishConfirmOpen(false);
                  await handlePublish();
                }}
                disabled={publishing}
                className="px-6 py-2 bg-leadjen-600 hover:bg-leadjen-700 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-leadjen-600/30"
              >
                {publishing ? "Publishing..." : "Confirm & Publish Live"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version Snapshots Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-serif font-black text-lg text-white">Homepage Version History & Rollback</h3>
              <button type="button" onClick={() => setIsVersionModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id} className="p-3 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-xs text-white">{v.name}</h4>
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">{new Date(v.publishedAt).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRollback(v.id)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-leadjen-600 text-white rounded-lg text-xs font-bold uppercase transition"
                  >
                    Rollback
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
