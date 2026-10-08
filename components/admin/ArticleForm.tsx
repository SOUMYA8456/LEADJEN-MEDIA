"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
  Send,
  Calendar,
  Save,
  Archive,
  Sparkles,
  Link as LinkIcon,
  X,
  Clock,
  Bold,
  Heading,
  Quote,
  Flame,
  TrendingUp,
  Star,
  MessageSquare,
  Radio,
  Shield,
  CheckCircle,
  Globe,
  Search,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { slugify } from "@/lib/utils";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  slug: string;
  designation?: string | null;
  avatar?: string | null;
}

interface ArticleFormProps {
  initialData?: any;
  categories: Category[];
  authors: Author[];
  isEditing?: boolean;
}

export function ArticleForm({
  initialData,
  categories = [],
  authors = [],
  isEditing = false,
}: ArticleFormProps) {
  const router = useRouter();

  const [session, setSession] = useState<{ id: string; name: string; role: string } | null>(null);
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80"
  );
  const [gallery, setGallery] = useState<string[]>(
    initialData?.gallery ? (typeof initialData.gallery === "string" ? JSON.parse(initialData.gallery) : initialData.gallery) : []
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || "");
  const [authorId, setAuthorId] = useState(initialData?.authorId || authors[0]?.id || "");
  const [status, setStatus] = useState<"DRAFT" | "IN_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED">(
    initialData?.status || "DRAFT"
  );
  const [reviewFeedback, setReviewFeedback] = useState<string>(initialData?.reviewFeedback || "");
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : ""
  );

  // Flags
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? false);
  const [isBreaking, setIsBreaking] = useState<boolean>(initialData?.isBreaking ?? false);
  const [isTrending, setIsTrending] = useState<boolean>(initialData?.isTrending ?? false);
  const [isVideo, setIsVideo] = useState<boolean>(initialData?.isVideo ?? false);
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [isOpinion, setIsOpinion] = useState<boolean>(initialData?.isOpinion ?? false);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [ogImage, setOgImage] = useState(initialData?.ogImage || "");

  // UI state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  const isReporter = session?.role === "REPORTER";
  const isEditorOrAdmin = session?.role === "EDITOR" || session?.role === "SUPER_ADMIN";

  // Auto generate slug if creating and user hasn't manually customized it
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing && (!slug || slug === slugify(title))) {
      setSlug(slugify(val));
    }
  };

  // Real Image Upload to /api/upload
  const processUploadFile = async (file: File, isGallery = false) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(15);
    setError("");

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 150);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const data = await res.json();
      if (res.ok && data.url) {
        if (isGallery) {
          setGallery([...gallery, data.url]);
        } else {
          setFeaturedImage(data.url);
          if (!ogImage) setOgImage(data.url);
        }
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 400);
      } else {
        setUploading(false);
        setError(data.error || "Upload failed. Please check image format and size.");
      }
    } catch (err) {
      clearInterval(interval);
      setUploading(false);
      setError("Network error while uploading image");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadFile(file, isGallery);
    }
  };

  // Quick formatting buttons for content
  const insertTag = (openTag: string, closeTag: string) => {
    setContent((prev: string) => `${prev}\n${openTag}Your formatted content here${closeTag}\n`);
  };

  const handleSubmit = async (targetStatus?: "DRAFT" | "IN_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED") => {
    const publishStatus = targetStatus || status;
    setSaving(true);
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Article title is required.");
      setSaving(false);
      return;
    }

    if (!content.trim()) {
      setError("Article content cannot be empty.");
      setSaving(false);
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      setSaving(false);
      return;
    }

    const payload = {
      title,
      slug: slug || slugify(title),
      subtitle,
      excerpt: excerpt || title,
      content,
      featuredImage,
      gallery: gallery.length > 0 ? JSON.stringify(gallery) : null,
      categoryId,
      authorId: authorId || authors[0]?.id,
      status: publishStatus,
      isFeatured: isReporter ? false : isFeatured,
      isBreaking: isReporter ? false : isBreaking,
      isTrending,
      isVideo,
      videoUrl: isVideo ? videoUrl : null,
      isOpinion,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      ogImage: ogImage || featuredImage,
      scheduledAt: publishStatus === "SCHEDULED" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      reviewFeedback: publishStatus === "IN_REVIEW" ? null : reviewFeedback,
      clientUpdatedAt: initialData?.updatedAt || null,
    };

    try {
      const url = isEditing ? `/api/articles/${initialData.id}` : "/api/articles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        const msg =
          publishStatus === "IN_REVIEW"
            ? "Article submitted for editorial review."
            : publishStatus === "PUBLISHED"
            ? "Article successfully published live!"
            : publishStatus === "APPROVED"
            ? "Article approved by desk."
            : publishStatus === "SCHEDULED"
            ? "Article scheduled for publication."
            : "Draft saved successfully.";

        setSuccess(msg);
        setTimeout(() => {
          router.push("/admin/news-desk");
          router.refresh();
        }, 1200);
      } else {
        setError(data.error || "Failed to save article");
      }
    } catch (err) {
      setError("Network error while submitting article.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!initialData?.id) return;
    try {
      setIsDeleting(true);
      setError("");
      const res = await fetch(`/api/articles/${initialData.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccess("Article deleted successfully. Redirecting to news desk...");
        setTimeout(() => {
          router.push("/admin/news-desk");
          router.refresh();
        }, 1000);
      } else {
        const d = await res.json();
        setError(d.error || "Failed to delete article");
      }
    } catch (e) {
      setError("Network error while deleting article");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedAuthor = authors.find((a) => a.id === authorId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white">
              {isEditing ? "Edit Editorial Article" : "Create New Article"}
            </h1>
            <span className="px-2.5 py-0.5 bg-black text-white dark:bg-white dark:text-black rounded text-[10px] font-mono font-bold uppercase">
              {status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            LEADJEN MEDIA Content Management & Editorial Dispatch Studio
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preview Button */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <Eye className="w-4 h-4 text-red-600" />
            <span>Preview</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit("DRAFT")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          {/* Submit For Review */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit("IN_REVIEW")}
            className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-red-500" />
            <span>Submit For Review</span>
          </button>

          {/* Editor/Admin Only Buttons */}
          {isEditorOrAdmin && (
            <>
              {/* Approve Button */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit("APPROVED")}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-black text-white dark:bg-neutral-100 dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-red-500" />
                <span>Approve</span>
              </button>

              {/* Schedule Button */}
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setStatus("SCHEDULED");
                  if (!scheduledAt) {
                    const tomorrow = new Date(Date.now() + 86400000);
                    setScheduledAt(tomorrow.toISOString().slice(0, 16));
                  }
                  handleSubmit("SCHEDULED");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition border border-neutral-300 dark:border-neutral-700 disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </button>

              {/* Publish Live */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit("PUBLISHED")}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-red-950 transition disabled:opacity-50"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{saving ? "Publishing..." : "PUBLISH NOW"}</span>
              </button>
            </>
          )}

          {/* Delete Article Button when editing */}
          {isEditing && (
            <button
              type="button"
              disabled={saving || isDeleting}
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-600 hover:text-white dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition border border-red-200 dark:border-red-900/50 disabled:opacity-50"
              title="Permanently Delete Article"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Editor Feedback Callout Box (if changes requested) */}
      {reviewFeedback && status === "DRAFT" && (
        <div className="p-5 bg-red-950/15 border-2 border-red-600/50 rounded-2xl space-y-2 text-red-700 dark:text-red-300 font-mono shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-red-600" />
            <span>EDITORIAL REVIEW FEEDBACK — ACTION REQUIRED BEFORE APPROVAL:</span>
          </div>
          <p className="text-sm font-sans italic text-black dark:text-white bg-white dark:bg-neutral-900 p-3 rounded-xl border border-red-600/30">
            &quot;{reviewFeedback}&quot;
          </p>
          <p className="text-[11px] text-neutral-500">
            Make the requested revisions above and click <strong>[SUBMIT FOR REVIEW]</strong> to send the updated draft back to the editorial desk.
          </p>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-800 text-red-400 text-xs font-mono font-bold rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-black text-white border border-neutral-700 text-xs font-mono font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-red-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Form Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Main Editorial Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Article Title */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white mb-1">
                Article Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. India's Technology Sector Enters a New Phase of Digital Growth"
                className="w-full text-lg sm:text-xl font-serif font-bold p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
              />
            </div>

            {/* Custom Slug */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Article Slug (URL)
              </label>
              <div className="flex items-center text-xs font-mono text-neutral-500 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                <span className="text-neutral-400">/{selectedCategory?.slug || "category"}/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent flex-1 text-black dark:text-white font-bold focus:outline-none ml-1 font-mono"
                />
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white mb-1">
                Subtitle / Deck (Optional)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A compelling supporting headline explaining key developments"
                className="w-full text-sm p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white focus:outline-none font-serif"
              />
            </div>

            {/* Excerpt / Summary */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white mb-1">
                Editorial Excerpt / Summary (Appears on cards & search)
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A concise 2-sentence summary of the story..."
                className="w-full text-sm p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white focus:outline-none font-sans"
              />
            </div>
          </div>

          {/* Featured Image Management */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                Featured Lead Image *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMediaLibraryOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Select from Media Library</span>
                </button>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Uploading to Media Storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-black dark:bg-white h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Image Preview & Controls */}
            {featuredImage && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 group">
                <img
                  src={featuredImage}
                  alt="Featured preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMediaLibraryOpen(true)}
                    className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-mono font-bold uppercase hover:bg-neutral-200 transition shadow-md"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeaturedImage("")}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-mono font-bold uppercase hover:bg-red-700 transition shadow-md"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Drag and Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processUploadFile(file);
              }}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition ${
                isDragOver
                  ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-800"
                  : "border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-950/60"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase cursor-pointer transition shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Upload from Computer</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Or drag and drop JPG, PNG, WEBP, GIF up to 10MB
                </span>
              </div>
            </div>

            {/* Direct Image URL fallback */}
            <div className="pt-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                Direct Image URL (Alternative):
              </span>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => {
                  setFeaturedImage(e.target.value);
                  if (!ogImage) setOgImage(e.target.value);
                }}
                placeholder="https://..."
                className="w-full text-xs p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Article Content Editor */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                Article Body Content *
              </label>
              {/* Quick Format Toolbar */}
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-mono">
                <button
                  type="button"
                  onClick={() => insertTag("<p>", "</p>")}
                  className="px-2 py-1 hover:bg-white dark:hover:bg-neutral-700 rounded font-semibold text-black dark:text-white"
                  title="Paragraph"
                >
                  P
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<h3>", "</h3>")}
                  className="px-2 py-1 hover:bg-white dark:hover:bg-neutral-700 rounded font-semibold text-black dark:text-white"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<strong>", "</strong>")}
                  className="px-2 py-1 hover:bg-white dark:hover:bg-neutral-700 rounded font-semibold text-black dark:text-white"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<blockquote>", "</blockquote>")}
                  className="px-2 py-1 hover:bg-white dark:hover:bg-neutral-700 rounded font-semibold text-black dark:text-white"
                  title="Blockquote"
                >
                  Quote
                </button>
              </div>
            </div>

            <textarea
              rows={16}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write or paste your complete editorial story here. Supports HTML paragraphs, headers, blockquotes, and lists..."
              className="w-full text-sm font-serif p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white leading-relaxed focus:outline-none"
            />
          </div>

          {/* SEO & Social Share Optimization Panel */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-black dark:text-white" />
                <h3 className="font-serif font-black text-base text-black dark:text-white">
                  SEO &amp; Google News Optimization
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold rounded">
                SERP &amp; SOCIAL
              </span>
            </div>

            {/* Custom SEO Headline & Description */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-500">
                    SEO Meta Title (Optional Override)
                  </label>
                  <span className={`text-[10px] font-mono ${
                    (seoTitle || title).length > 70 ? "text-amber-500 font-bold" : "text-neutral-400"
                  }`}>
                    {(seoTitle || title).length} / 60-70 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "SEO optimized headline for Google..."}
                  className="w-full text-xs p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-500">
                    SEO Meta Description (Optional Override)
                  </label>
                  <span className={`text-[10px] font-mono ${
                    (seoDescription || excerpt).length > 160 ? "text-amber-500 font-bold" : "text-neutral-400"
                  }`}>
                    {(seoDescription || excerpt).length} / 150-160 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || "Search engine summary..."}
                  className="w-full text-xs p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* LIVE GOOGLE SERP SNIPPET PREVIEW */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1 font-sans">
              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono uppercase text-neutral-400 font-bold">
                <Search className="w-3 h-3" />
                <span>Google Search Snippet Preview:</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black text-white text-[8px] font-mono font-bold flex items-center justify-center rounded-full">
                  LM
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-black dark:text-white">
                    Leadjen Media
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    leadjen-media-news.vercel.app › {selectedCategory?.slug || "news"} › {slug || "story-slug"}
                  </span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-black dark:text-white hover:underline cursor-pointer line-clamp-1 mt-0.5">
                {seoTitle || title || "Editorial Article Headline — Leadjen Media"} | LEADJEN MEDIA
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-snug">
                {seoDescription || excerpt || "Article synopsis will automatically populate here for search engines and news syndication."}
              </p>
            </div>

            {/* LIVE SOCIAL SHARE CARD PREVIEW */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 font-sans">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-neutral-400 font-bold">
                <Share2 className="w-3 h-3" />
                <span>Social Share (OpenGraph / X) Card Preview:</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                {(ogImage || featuredImage) && (
                  <div className="aspect-[16/9] w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
                    <img
                      src={ogImage || featuredImage}
                      alt="Social preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block font-bold">
                    LEADJENMEDIA.COM • {selectedCategory?.name || "NEWS"}
                  </span>
                  <h4 className="text-xs font-bold text-black dark:text-white line-clamp-1">
                    {seoTitle || title || "Article Headline"}
                  </h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-1">
                    {seoDescription || excerpt || "Short summary of the story for social feeds."}
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time Editorial Quality Validation Checklist */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-mono space-y-1.5">
              <span className="font-bold text-neutral-500 block uppercase text-[10px]">
                Search Readiness Checks:
              </span>
              <div className="flex items-center gap-2">
                {title.length >= 20 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className={title.length >= 20 ? "text-neutral-700 dark:text-neutral-300" : "text-amber-500"}>
                  {title.length >= 20 ? "Headline length meets standards" : "Headline too short for optimal search visibility"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {excerpt.length >= 40 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className={excerpt.length >= 40 ? "text-neutral-700 dark:text-neutral-300" : "text-amber-500"}>
                  {excerpt.length >= 40 ? "Excerpt summary provided" : "Provide a 2-sentence summary for search snippets"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {featuredImage ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className={featuredImage ? "text-neutral-700 dark:text-neutral-300" : "text-amber-500"}>
                  {featuredImage ? "Featured lead image attached" : "Attach a lead image for Google Discover readiness"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Editorial Settings & Metadata (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category & Author Box */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <h3 className="font-serif font-black text-base text-black dark:text-white">
              Editorial Classification
            </h3>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white mb-1">
                News Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Select */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white mb-1">
                Bylined Author
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full p-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-sans focus:outline-none"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.designation || "Correspondent"})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white mb-1">
                Editorial Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase font-bold focus:outline-none"
              >
                <option value="DRAFT">DRAFT (IN PREPARATION)</option>
                <option value="IN_REVIEW">IN REVIEW (SUBMITTED)</option>
                {isEditorOrAdmin && <option value="APPROVED">APPROVED BY DESK</option>}
                {isEditorOrAdmin && <option value="SCHEDULED">SCHEDULED PUBLICATION</option>}
                {isEditorOrAdmin && <option value="PUBLISHED">PUBLISHED LIVE</option>}
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            {/* Scheduled Datetime if SCHEDULED */}
            {status === "SCHEDULED" && isEditorOrAdmin && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 font-mono">
                <label className="block text-[11px] font-bold text-black dark:text-white uppercase">
                  Schedule Date & Time (IST)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-black dark:text-white font-mono"
                />
              </div>
            )}
          </div>

          {/* Editorial Badges & Visibility Flags (Editor Only) */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <h3 className="font-serif font-black text-base text-black dark:text-white">
              Editorial Signals & Badges
            </h3>

            {/* Breaking News Flag */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <span className="text-xs font-mono font-bold text-red-600 block uppercase">
                  🔴 Urgent Breaking News
                </span>
                <span className="text-[10px] text-neutral-400 block font-sans">
                  Streams to top homepage breaking ticker bar
                </span>
              </div>
              <input
                type="checkbox"
                checked={isBreaking}
                disabled={isReporter}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </label>

            {/* Featured Story Flag */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <span className="text-xs font-mono font-bold text-black dark:text-white block uppercase">
                  ⭐ Top Hero / Lead Story
                </span>
                <span className="text-[10px] text-neutral-400 block font-sans">
                  Eligible for primary hero banner placements
                </span>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                disabled={isReporter}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-black cursor-pointer"
              />
            </label>

            {/* Trending Flag */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <span className="text-xs font-mono font-bold text-black dark:text-white block uppercase">
                  Trending Topic
                </span>
                <span className="text-[10px] text-neutral-400 block font-sans">
                  Highlight in trending sidebar and stream
                </span>
              </div>
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 accent-black cursor-pointer"
              />
            </label>

            {/* Opinion Flag */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <div>
                <span className="text-xs font-mono font-bold text-black dark:text-white block uppercase">
                  Opinion / Editorial
                </span>
                <span className="text-[10px] text-neutral-400 block font-sans">
                  Columnist analysis and opinion badge
                </span>
              </div>
              <input
                type="checkbox"
                checked={isOpinion}
                onChange={(e) => setIsOpinion(e.target.checked)}
                className="w-4 h-4 accent-black cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-xs font-mono uppercase text-red-600 font-bold">
                {selectedCategory?.name} • DRAFT PREVIEW
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white">
              {title || "Untitled Editorial Article"}
            </h1>

            {subtitle && (
              <p className="font-serif text-sm text-neutral-600 dark:text-neutral-400 italic">
                {subtitle}
              </p>
            )}

            {featuredImage && (
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-100">
                <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="text-sm font-serif text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
              {content || "No body content entered yet."}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
              <div className="p-3 bg-red-600/10 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-black dark:text-white">
                  Delete Article
                </h3>
                <span className="text-[10px] font-mono text-red-600 uppercase font-bold">
                  Permanent Action
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300 font-sans">
              <p>Are you sure you want to delete this article?</p>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="font-serif font-bold text-black dark:text-white line-clamp-2">
                  &ldquo;{title || initialData?.title}&rdquo;
                </p>
                <p className="text-[10px] font-mono text-neutral-400 mt-1 uppercase">
                  Status: {status}
                </p>
              </div>
              <p className="text-[11px] text-red-600 dark:text-red-400 font-mono">
                ⚠️ This will permanently remove the dispatch from the live portal, search index, and archives.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteArticle}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-md shadow-red-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting..." : "Yes, Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Selector Modal */}
      <MediaLibraryModal
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={(selectedUrl) => {
          setFeaturedImage(selectedUrl);
          if (!ogImage) setOgImage(selectedUrl);
        }}
        title="Select Featured Lead Image"
      />
    </div>
  );
}
