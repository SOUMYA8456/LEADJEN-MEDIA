"use client";

import React, { useState } from "react";
import { Share2, Link as LinkIcon, Check, MessageCircle, Twitter, Facebook } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? url || window.location.href : "";

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + shareUrl)}`;
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center gap-2 py-3 border-y border-neutral-200 dark:border-neutral-800">
      <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 mr-2 flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" /> Share:
      </span>

      {/* WhatsApp */}
      <a
        href={shareWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-black hover:text-white transition"
        aria-label="Share to WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </a>

      {/* X / Twitter */}
      <a
        href={shareTwitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-black hover:text-white transition"
        aria-label="Share to X"
      >
        <Twitter className="w-4 h-4" />
      </a>

      {/* Facebook */}
      <a
        href={shareFacebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-black hover:text-white transition"
        aria-label="Share to Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-black hover:text-white transition text-xs font-mono font-bold"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-black dark:text-white font-bold" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
