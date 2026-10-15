"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Save,
  RefreshCw,
  Loader2,
  Globe,
  Sparkles,
  Shield,
  Layers,
  HelpCircle,
} from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import { AboutSettingsData, EditorialValueItem, DEFAULT_ABOUT_SETTINGS } from "@/lib/about-defaults";

interface TeamMemberItem {
  id: string;
  name: string;
  designation: string;
  bio: string | null;
  photo: string | null;
  order: number;
  status: "PUBLISHED" | "DRAFT";
  isDemo: boolean;
  twitter?: string | null;
  linkedin?: string | null;
  email?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminAboutPage() {
  const [activeTab, setActiveTab] = useState<"ceo" | "team" | "content">("ceo");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<AboutSettingsData>(DEFAULT_ABOUT_SETTINGS);

  // Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMemberItem | null>(null);

  // Modal Form State
  const [formName, setFormName] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formPhoto, setFormPhoto] = useState("");
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [formIsDemo, setFormIsDemo] = useState(false);
  const [formTwitter, setFormTwitter] = useState("");
  const [formLinkedin, setFormLinkedin] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/about?includeDrafts=true");
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.settings) setSettings(data.settings);
        if (Array.isArray(data.teamMembers)) setTeamMembers(data.teamMembers);
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to load about data" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Network error loading about page data" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setFeedback(null);
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: "success", text: "About page settings saved successfully!" });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Network error saving settings" });
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormName("");
    setFormDesignation("");
    setFormBio("");
    setFormPhoto("");
    const highestOrder = teamMembers.reduce((max, m) => Math.max(max, m.order || 0), 0);
    setFormOrder(highestOrder + 1);
    setFormStatus("PUBLISHED");
    setFormIsDemo(false);
    setFormTwitter("");
    setFormLinkedin("");
    setFormEmail("");
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMemberItem) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormDesignation(member.designation);
    setFormBio(member.bio || "");
    setFormPhoto(member.photo || "");
    setFormOrder(member.order || 1);
    setFormStatus(member.status);
    setFormIsDemo(Boolean(member.isDemo));
    setFormTwitter(member.twitter || "");
    setFormLinkedin(member.linkedin || "");
    setFormEmail(member.email || "");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("Please enter the employee's full name.");
      return;
    }
    if (!formDesignation.trim()) {
      setModalError("Please enter the employee's designation.");
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError(null);

      const payload = {
        name: formName.trim(),
        designation: formDesignation.trim(),
        bio: formBio.trim() || null,
        photo: formPhoto.trim() || null,
        order: Number(formOrder) || 1,
        status: formStatus,
        isDemo: formIsDemo,
        twitter: formTwitter.trim() || null,
        linkedin: formLinkedin.trim() || null,
        email: formEmail.trim() || null,
      };

      if (editingMember) {
        // Update existing member
        const res = await fetch(`/api/about/team/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setTeamMembers((prev) =>
            prev.map((m) => (m.id === editingMember.id ? data.member : m)).sort((a, b) => a.order - b.order)
          );
          setIsModalOpen(false);
          setFeedback({ type: "success", text: `Updated "${payload.name}" successfully!` });
          setTimeout(() => setFeedback(null), 3000);
        } else {
          setModalError(data.error || "Failed to update employee.");
        }
      } else {
        // Create new member
        const res = await fetch("/api/about/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setTeamMembers((prev) => [...prev, data.member].sort((a, b) => a.order - b.order));
          setIsModalOpen(false);
          setFeedback({ type: "success", text: `Added "${payload.name}" to team!` });
          setTimeout(() => setFeedback(null), 3000);
        } else {
          setModalError(data.error || "Failed to create employee.");
        }
      }
    } catch (err: any) {
      setModalError("Network error saving employee.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: TeamMemberItem) => {
    const nextStatus = member.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/about/team/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setTeamMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m))
        );
        setFeedback({
          type: "success",
          text: `"${member.name}" set to ${nextStatus === "PUBLISHED" ? "Published (Visible)" : "Draft (Hidden)"}.`,
        });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {}
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      const res = await fetch(`/api/about/team/${deletingMember.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
        setFeedback({ type: "success", text: `Removed "${deletingMember.name}".` });
        setDeletingMember(null);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to delete team member." });
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= teamMembers.length) return;

    const reordered = [...teamMembers];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Re-assign consecutive orders
    const updatedWithOrders = reordered.map((m, idx) => ({
      ...m,
      order: idx + 1,
    }));

    setTeamMembers(updatedWithOrders);

    // Save to server
    try {
      await fetch("/api/about/team/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedWithOrders.map((m) => ({ id: m.id, order: m.order })),
        }),
      });
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SiteBuilderNav />
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
          <p className="text-xs font-mono text-neutral-400">Loading About Page Management...</p>
        </div>
      </div>
    );
  }

  const publishedCount = teamMembers.filter((m) => m.status === "PUBLISHED").length;
  const draftCount = teamMembers.filter((m) => m.status === "DRAFT").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <SiteBuilderNav />

      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
              EDITORIAL CMS
            </span>
            <span className="text-xs font-mono text-neutral-400">/admin/about</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            About Leadjen Media Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-sans mt-1">
            Configure executive leadership (CEO &amp; Director), manage newsroom employees, and customize the public editorial charter.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/about"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <span>Live About Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/about?preview=true"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Drafts</span>
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Primary Section Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-t-2xl p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("ceo")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition ${
            activeTab === "ceo"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>CEO &amp; Director</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition ${
            activeTab === "team"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Members ({teamMembers.length})</span>
          {draftCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[9px] rounded-full font-bold">
              {draftCount} Draft
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition ${
            activeTab === "content"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>About Content &amp; Values</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CEO & DIRECTOR MANAGEMENT                                         */}
      {/* ========================================================================= */}
      {activeTab === "ceo" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                  EXECUTIVE LEADERSHIP
                </span>
                <h3 className="text-xl font-serif font-black text-neutral-900 dark:text-neutral-100 mt-1">
                  CEO &amp; Director Profile Settings
                </h3>
                <p className="text-xs text-neutral-500 font-sans mt-1">
                  All fields are editable placeholders until the actual executive details are entered.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    CEO Full Name *
                  </label>
                  <input
                    type="text"
                    value={settings.ceoName}
                    onChange={(e) => setSettings({ ...settings, ceoName: e.target.value })}
                    placeholder="e.g. Leadership Desk / Executive Director"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Executive Designation *
                  </label>
                  <input
                    type="text"
                    value={settings.ceoDesignation}
                    onChange={(e) => setSettings({ ...settings, ceoDesignation: e.target.value })}
                    placeholder="e.g. CEO & Director / Founder & Chief Executive"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Professional Biography
                  </label>
                  <textarea
                    rows={4}
                    value={settings.ceoBio}
                    onChange={(e) => setSettings({ ...settings, ceoBio: e.target.value })}
                    placeholder="Short summary of background, strategic vision, and media leadership experience..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Leadership Message / Quote
                  </label>
                  <textarea
                    rows={4}
                    value={settings.ceoMessage}
                    onChange={(e) => setSettings({ ...settings, ceoMessage: e.target.value })}
                    placeholder="Executive quote on journalistic integrity, independent reporting, or public mission..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white leading-relaxed font-serif italic"
                  />
                  <span className="text-[11px] text-neutral-400 font-mono mt-1 block">
                    This appears prominently as an emphasized quote card alongside the CEO portrait.
                  </span>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      LinkedIn URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={settings.ceoLinkedin || ""}
                      onChange={(e) => setSettings({ ...settings, ceoLinkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Twitter / X URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={settings.ceoTwitter || ""}
                      onChange={(e) => setSettings({ ...settings, ceoTwitter: e.target.value })}
                      placeholder="https://x.com/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                    Direct Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={settings.ceoEmail || ""}
                    onChange={(e) => setSettings({ ...settings, ceoEmail: e.target.value })}
                    placeholder="leadership@leadjenmedia.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-400">
                  Updates take effect immediately on the live website.
                </span>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? "Saving Changes..." : "Save CEO Profile"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Local Computer Photo Upload & Live Card Preview */}
            <div className="lg:col-span-5 space-y-6">
              {/* Photo Upload Container */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
                    EXECUTIVE PORTRAIT
                  </span>
                  <h4 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 mt-0.5">
                    CEO Photograph
                  </h4>
                  <p className="text-xs text-neutral-500 font-sans">
                    Select a high-resolution portrait directly from your computer (JPG, PNG, WebP up to 10 MB).
                  </p>
                </div>

                <ImageUploadField
                  label="Upload CEO Photo (Local Computer)"
                  value={settings.ceoPhoto}
                  onChange={(url) => setSettings({ ...settings, ceoPhoto: url })}
                  maxSizeMB={10}
                  aspectRatioHint="Recommended: 4:5 or 3:4 vertical editorial portrait"
                  helpText="Select an image file from your local computer. It will be uploaded securely and displayed on the public About page."
                />
              </div>

              {/* Live Preview Card */}
              <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                    PUBLIC PREVIEW • CEO SECTION
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded font-semibold text-neutral-600 dark:text-neutral-400">
                    Real-time
                  </span>
                </div>

                <div className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                    <img
                      src={settings.ceoPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"}
                      alt={settings.ceoName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[9px] font-mono text-white font-bold uppercase">
                      CEO Portrait
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      {settings.ceoDesignation}
                    </span>
                    <h5 className="font-serif font-black text-lg text-neutral-900 dark:text-neutral-100">
                      {settings.ceoName}
                    </h5>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mt-1 line-clamp-3 leading-relaxed">
                      {settings.ceoBio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEAM MEMBERS (EMPLOYEE MANAGEMENT)                                */}
      {/* ========================================================================= */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {/* Action & Stats Bar */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                NEWSROOM DIRECTORY
              </span>
              <h3 className="text-xl font-serif font-black text-neutral-900 dark:text-neutral-100 mt-1">
                Newsroom Team &amp; Employee Roster
              </h3>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                Manage staff profiles, designations, display order, and publication status. Four demo profiles are initialized and can be edited or replaced.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs font-mono px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                <span className="font-bold text-green-600 dark:text-green-400">{publishedCount} Published</span>
                <span>•</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{draftCount} Drafts</span>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm ml-auto sm:ml-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {/* Employee Roster List */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono font-bold text-neutral-500 uppercase">
              <div className="grid grid-cols-12 w-full items-center gap-4">
                <span className="col-span-1 text-center">Order</span>
                <span className="col-span-5 sm:col-span-4">Employee / Designation</span>
                <span className="hidden sm:block sm:col-span-4">Short Biography</span>
                <span className="col-span-3 sm:col-span-2 text-center">Status</span>
                <span className="col-span-3 sm:col-span-1 text-right">Actions</span>
              </div>
            </div>

            {teamMembers.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Users className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="text-sm font-serif font-bold">No team members added yet.</p>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold"
                >
                  Add First Team Member
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {teamMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="p-4 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition flex items-center"
                  >
                    <div className="grid grid-cols-12 w-full items-center gap-4">
                      {/* Order Controls */}
                      <div className="col-span-1 flex flex-col items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                          #{member.order}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(index, "down")}
                          disabled={index === teamMembers.length - 1}
                          className="p-1 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Photo & Name */}
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-700">
                          <img
                            src={member.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate block">
                              {member.name}
                            </span>
                            {member.isDemo && (
                              <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[9px] font-mono font-bold rounded">
                                DEMO
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-neutral-500 truncate block mt-0.5">
                            {member.designation}
                          </span>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="hidden sm:block sm:col-span-4 text-xs font-sans text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {member.bio || "No biography entered."}
                      </div>

                      {/* Status Toggle */}
                      <div className="col-span-3 sm:col-span-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase transition ${
                            member.status === "PUBLISHED"
                              ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 hover:bg-green-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200"
                          }`}
                          title="Click to toggle status"
                        >
                          {member.status === "PUBLISHED" ? (
                            <>
                              <Eye className="w-3 h-3 text-green-600 dark:text-green-400" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>Draft (Hidden)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(member)}
                          className="p-2 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                          title="Edit Employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingMember(member)}
                          className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ABOUT CONTENT, MISSION, VISION, VALUES                             */}
      {/* ========================================================================= */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                EDITORIAL CHARTER
              </span>
              <h3 className="text-xl font-serif font-black text-neutral-900 dark:text-neutral-100 mt-1">
                Headline, Mission &amp; Editorial Values Copy
              </h3>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                Customize the hero statements, institutional mission, vision, and core editorial values.
              </p>
            </div>

            {/* Hero Configuration */}
            <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <h4 className="text-sm font-mono font-bold uppercase text-neutral-800 dark:text-neutral-200">
                1. Hero Headline &amp; Introduction
              </h4>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-1">
                  Hero Heading
                </label>
                <input
                  type="text"
                  value={settings.heroHeading}
                  onChange={(e) => setSettings({ ...settings, heroHeading: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-serif font-bold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-1">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Introduction Text
                </label>
                <textarea
                  rows={4}
                  value={settings.introduction}
                  onChange={(e) => setSettings({ ...settings, introduction: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <h4 className="text-sm font-mono font-bold uppercase text-neutral-800 dark:text-neutral-200">
                2. Mission &amp; Vision
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-1">
                    Mission Title
                  </label>
                  <input
                    type="text"
                    value={settings.missionTitle}
                    onChange={(e) => setSettings({ ...settings, missionTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono font-bold mb-2 focus:outline-none"
                  />
                  <label className="block text-xs font-mono text-neutral-500 mb-1">Mission Statement</label>
                  <textarea
                    rows={4}
                    value={settings.missionText}
                    onChange={(e) => setSettings({ ...settings, missionText: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-sans leading-relaxed focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-1">
                    Vision Title
                  </label>
                  <input
                    type="text"
                    value={settings.visionTitle}
                    onChange={(e) => setSettings({ ...settings, visionTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono font-bold mb-2 focus:outline-none"
                  />
                  <label className="block text-xs font-mono text-neutral-500 mb-1">Vision Statement</label>
                  <textarea
                    rows={4}
                    value={settings.visionText}
                    onChange={(e) => setSettings({ ...settings, visionText: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-sans leading-relaxed focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Editorial Values */}
            <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-mono font-bold uppercase text-neutral-800 dark:text-neutral-200">
                  3. Four Core Editorial Values
                </h4>
                <span className="text-xs font-mono text-neutral-400">Presented as 4 elegant cards</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(settings.values || []).map((val, idx) => (
                  <div
                    key={val.id || idx}
                    className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 uppercase">
                        Value 0{idx + 1}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={val.title}
                      onChange={(e) => {
                        const updated = [...settings.values];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setSettings({ ...settings, values: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm font-serif font-bold focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={val.description}
                      onChange={(e) => {
                        const updated = [...settings.values];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        setSettings({ ...settings, values: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-xs font-sans leading-relaxed focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? "Saving Changes..." : "Save About Content"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT EMPLOYEE                                               */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                  {editingMember ? "EDIT EMPLOYEE PROFILE" : "ADD NEWSROOM EMPLOYEE"}
                </span>
                <h3 className="text-xl font-serif font-black text-neutral-900 dark:text-neutral-100">
                  {editingMember ? `Editing: ${editingMember.name}` : "Create New Team Member"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                    Employee Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. Senior News Correspondent"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                  Short Biography
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Specializations, journalistic beat coverage, or professional background..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white leading-relaxed"
                />
              </div>

              {/* Local Photo Upload with preview */}
              <div>
                <ImageUploadField
                  label="Upload Employee Photo (Choose Image From Computer)"
                  value={formPhoto}
                  onChange={(url) => setFormPhoto(url)}
                  maxSizeMB={10}
                  aspectRatioHint="Recommended: 3:4 portrait photo"
                  helpText="Select a photo from your local computer. It will upload securely to persistent media storage."
                />
              </div>

              {/* Ordering and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono font-bold"
                  >
                    <option value="PUBLISHED">Published (Visible Publicly)</option>
                    <option value="DRAFT">Draft (Hidden from Public)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isDemoCheckbox"
                    checked={formIsDemo}
                    onChange={(e) => setFormIsDemo(e.target.checked)}
                    className="w-4 h-4 rounded text-black border-neutral-300"
                  />
                  <label htmlFor="isDemoCheckbox" className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                    Mark as Demo Profile
                  </label>
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-500 mb-1">Twitter / X URL</label>
                  <input
                    type="url"
                    value={formTwitter}
                    onChange={(e) => setFormTwitter(e.target.value)}
                    placeholder="https://x.com/..."
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-500 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formLinkedin}
                    onChange={(e) => setFormLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/..."
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-500 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@leadjenmedia.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {modalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{modalSubmitting ? "Saving..." : editingMember ? "Save Changes" : "Save Employee"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG                                                */}
      {/* ========================================================================= */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold text-neutral-900 dark:text-neutral-100">
                Delete Team Member?
              </h4>
              <p className="text-xs text-neutral-500 font-sans mt-1">
                Are you sure you want to remove <span className="font-bold text-neutral-800 dark:text-neutral-200">{deletingMember.name}</span> ({deletingMember.designation})? This will remove them from the newsroom team directory.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMember}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
