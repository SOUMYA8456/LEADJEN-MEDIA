"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Check } from "lucide-react";

interface SaveArticleButtonProps {
  articleId: string;
  className?: string;
  variant?: "icon" | "button";
}

const STORAGE_KEY = "leadjen_saved_articles";

export function SaveArticleButton({
  articleId,
  className = "",
  variant = "button",
}: SaveArticleButtonProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved) && saved.includes(articleId)) {
        setIsSaved(true);
      }
    } catch {}
  }, [articleId]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const saved: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      let nextSaved: string[];
      if (saved.includes(articleId)) {
        nextSaved = saved.filter((id) => id !== articleId);
        setIsSaved(false);
      } else {
        nextSaved = [...saved, articleId];
        setIsSaved(true);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSaved));

      // Also fire background sync to server if user is logged in
      fetch(`/api/bookmarks`, {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: isSaved ? undefined : JSON.stringify({ articleId }),
      }).catch(() => {});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={handleToggleSave}
          className={`p-2 rounded-full transition ${
            isSaved
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          } ${className}`}
          aria-label={isSaved ? "Remove from saved stories" : "Save story"}
          title={isSaved ? "Saved to your device" : "Save story to read later"}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleToggleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition ${
            isSaved
              ? "bg-black text-white dark:bg-white dark:text-black shadow-none"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          } ${className}`}
          title={isSaved ? "Saved to your device" : "Save story to read later"}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-white dark:text-black font-black" />
              <span>Saved ✓</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-neutral-400" />
              <span>Save</span>
            </>
          )}
        </button>
      )}
    </>
  );
}
