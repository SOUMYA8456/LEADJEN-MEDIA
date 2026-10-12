"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, Link as LinkIcon, Loader2 } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  onOpenMediaLibrary?: () => void;
  maxSizeMB?: number;
  aspectRatioHint?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
}

export function ImageUploadField({
  label = "Upload Image",
  value = "",
  onChange,
  onOpenMediaLibrary,
  maxSizeMB = 10,
  aspectRatioHint,
  placeholder = "https://...",
  helpText,
  required = false,
  className = "",
}: ImageUploadFieldProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeStr?: string } | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrl = value || "";

  // Load image dimensions whenever currentUrl changes
  useEffect(() => {
    if (!currentUrl) {
      setImageMeta(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageMeta((prev) => ({
        ...prev,
        width: img.naturalWidth,
        height: img.naturalHeight,
      }));
    };
    img.src = currentUrl;
  }, [currentUrl]);

  const handleFile = async (file: File) => {
    setError(null);

    // 1. Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError("Please upload a valid image file (JPG, PNG, WEBP, GIF, AVIF).");
      return;
    }

    // 2. Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Image size exceeds the ${maxSizeMB} MB limit.`);
      return;
    }

    const sizeInKB = Math.round(file.size / 1024);
    const sizeStr = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

    // 3. Upload file to /api/upload
    try {
      setUploading(true);
      setProgress(25);

      const formData = new FormData();
      formData.append("file", file);

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await res.json();
      if (res.ok && data.url) {
        setImageMeta({ width: 0, height: 0, sizeStr });
        onChange(data.url);
        setError(null);
      } else {
        setError(data.error || "Upload failed. Please try again.");
      }
    } catch (err: any) {
      setError("Network error while uploading image. Please check your connection.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 300);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange("");
    setImageMeta(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2">
            {onOpenMediaLibrary && (
              <button
                type="button"
                onClick={onOpenMediaLibrary}
                className="text-[10px] font-mono text-neutral-500 hover:text-black dark:hover:text-white hover:underline inline-flex items-center gap-1"
              >
                <ImageIcon className="w-3 h-3" />
                <span>Media Library</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUrlFallback(!showUrlFallback)}
              className="text-[10px] font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 inline-flex items-center gap-1"
            >
              <LinkIcon className="w-2.5 h-2.5" />
              <span>{showUrlFallback ? "Hide URL" : "Enter URL"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Active Image Preview Card */}
      {currentUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5">
            {/* Thumbnail */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-black/10 dark:bg-black/40 flex-shrink-0 border border-neutral-200 dark:border-neutral-800">
              <img
                src={currentUrl}
                alt="Selected preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=300&q=80";
                }}
              />
            </div>

            {/* Details & Actions */}
            <div className="flex-1 min-w-0 w-full space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Image Ready</span>
              </div>

              <p className="text-[11px] font-mono text-neutral-500 truncate max-w-full">
                {currentUrl}
              </p>

              {imageMeta && (imageMeta.width > 0 || imageMeta.sizeStr) && (
                <div className="flex items-center justify-center sm:justify-start gap-3 text-[10px] font-mono text-neutral-400">
                  {imageMeta.width > 0 && (
                    <span>
                      {imageMeta.width} × {imageMeta.height} px
                    </span>
                  )}
                  {imageMeta.sizeStr && <span>{imageMeta.sizeStr}</span>}
                </div>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-black dark:text-white rounded-lg text-xs font-mono font-bold transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-400 rounded-lg text-xs font-mono font-bold transition"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upload Progress Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4 z-10 text-white">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <span className="text-xs font-mono">Uploading image... {progress}%</span>
              <div className="w-48 h-1.5 bg-neutral-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
            isDragOver
              ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-800"
              : "border-neutral-300 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 hover:border-neutral-400 dark:hover:border-neutral-700"
          }`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-3 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-600 dark:text-neutral-400" />
              <span className="text-xs font-mono font-bold text-black dark:text-white">
                Uploading from computer... {progress}%
              </span>
              <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black dark:bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Upload className="w-5 h-5" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-black dark:text-white">
                  Click to upload from computer
                </span>
                <span className="text-xs text-neutral-400 font-sans block mt-0.5">
                  or drag and drop an image file here
                </span>
              </div>

              <div className="text-[10px] font-mono text-neutral-400 pt-1">
                JPG, PNG, WEBP, GIF, AVIF up to {maxSizeMB} MB
                {aspectRatioHint && ` • Recommended: ${aspectRatioHint}`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Fallback Field */}
      {showUrlFallback && (
        <div className="pt-1 animate-in fade-in">
          <input
            type="text"
            value={currentUrl}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-xs p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
          />
          <span className="text-[10px] font-mono text-neutral-400 block mt-1">
            Direct web URL or existing media file path
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs font-mono text-red-600 dark:text-red-400 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Optional Help Text */}
      {helpText && !error && (
        <p className="text-[10px] font-mono text-neutral-400">{helpText}</p>
      )}
    </div>
  );
}
