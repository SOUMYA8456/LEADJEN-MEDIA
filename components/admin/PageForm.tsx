"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  Globe,
  FileText,
  Trash2,
} from "lucide-react";
import { MediaLibraryModal } from "./MediaLibraryModal";
import Link from "next/link";

interface PageFormData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: string;
}

export function PageForm({ initialData }: { initialData?: PageFormData }) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");

  const [saving, setSaving] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title,
      slug,
      content,
      featuredImage: featuredImage || null,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || null,
      status,
    };

    try {
      const url = isEditing ? `/api/pages/${initialData!.id}` : "/api/pages";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save page.");
      }

      router.push("/admin/pages");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">
              {isEditing ? "EDIT EDITORIAL PAGE" : "NEW EDITORIAL PAGE"}
            </span>
            <h1 className="font-serif font-black text-2xl text-black dark:text-white">
              {title || "Untitled Page"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {slug && (
            <Link
              href={`/${slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Page"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono rounded-xl">
          {error}
        </div>
      )}

      {/* Main Details */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
            Page Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Editorial Standards & Code of Ethics"
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-serif text-black dark:text-white focus:outline-hidden focus:border-black dark:focus:border-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              URL Slug *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-r-0 border-neutral-300 dark:border-neutral-700 text-neutral-500 font-mono text-xs rounded-l-xl">
                /
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="editorial-standards"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-r-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
            >
              <option value="PUBLISHED">PUBLISHED (Live)</option>
              <option value="DRAFT">DRAFT (Unpublished)</option>
            </select>
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
            Featured Header Image (Optional)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://... or select from Media Library"
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setMediaModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase shrink-0 transition"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Media Library</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
            Page Content (HTML Supported) *
          </label>
          <textarea
            rows={14}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<h2>Section Header</h2><p>Page description and editorial text...</p>"
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-serif text-black dark:text-white focus:outline-hidden leading-relaxed"
          />
        </div>
      </div>

      {/* SEO Settings */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <Globe className="w-4 h-4 text-black dark:text-white" />
          <h3 className="font-serif font-bold text-sm text-black dark:text-white">
            SEO &amp; Search Engine Metadata
          </h3>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
            SEO Meta Title
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={title ? `${title} | LEADJEN MEDIA` : "Page SEO Title"}
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
            SEO Meta Description
          </label>
          <textarea
            rows={3}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Brief description for Google search snippets and social shares..."
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Media Library Modal */}
      {mediaModalOpen && (
        <MediaLibraryModal
          isOpen={mediaModalOpen}
          onClose={() => setMediaModalOpen(false)}
          onSelect={(url) => {
            setFeaturedImage(url);
            setMediaModalOpen(false);
          }}
        />
      )}
    </form>
  );
}
