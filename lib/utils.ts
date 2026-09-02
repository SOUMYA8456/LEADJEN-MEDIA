import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const textOnly = content.replace(/<[^>]*>?/gm, "");
  const words = textOnly.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Just now";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "Recently";
  }
}

export function formatArticleDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "MMMM d, yyyy");
  } catch {
    return "";
  }
}

export function formatArticleTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "h:mm a");
  } catch {
    return "";
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || "";
  return text.substring(0, maxLength).trim() + "...";
}
