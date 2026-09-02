"use client";

import React, { useState, useEffect } from "react";
import { Heart, Check } from "lucide-react";

interface FollowCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  className?: string;
}

const STORAGE_KEY = "leadjen_followed_categories";

export function FollowCategoryButton({
  categoryId,
  categoryName,
  className = "",
}: FollowCategoryButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    try {
      const follows = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(follows) && follows.includes(categoryId)) {
        setIsFollowing(true);
      }
    } catch {}
  }, [categoryId]);

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const follows: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      let nextFollows: string[];
      if (follows.includes(categoryId)) {
        nextFollows = follows.filter((id) => id !== categoryId);
        setIsFollowing(false);
      } else {
        nextFollows = [...follows, categoryId];
        setIsFollowing(true);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFollows));

      // Background sync to server
      fetch(`/api/categories/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: isFollowing ? undefined : JSON.stringify({ categoryId }),
      }).catch(() => {});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleFollow}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition ${
        isFollowing
          ? "bg-black text-white dark:bg-white dark:text-black shadow-none"
          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      } ${className}`}
      title={isFollowing ? `Following ${categoryName}` : `Follow ${categoryName}`}
    >
      {isFollowing ? (
        <>
          <Check className="w-3.5 h-3.5 text-white dark:text-black font-black" />
          <span>Following ✓</span>
        </>
      ) : (
        <>
          <Heart className="w-3.5 h-3.5 text-neutral-400" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
