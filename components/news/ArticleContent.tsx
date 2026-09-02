"use client";

import React, { useState } from "react";
import { Bookmark, Printer, Type, Check } from "lucide-react";
import { InArticleAd } from "@/components/ads/AdBanner";

interface ArticleContentProps {
  content: string;
  ad?: any;
}

export function ArticleContent({ content, ad }: ArticleContentProps) {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [saved, setSaved] = useState(false);

  const fontClasses = {
    sm: "text-base leading-relaxed",
    base: "text-lg leading-relaxed",
    lg: "text-xl leading-loose",
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  return (
    <div className="w-full">
      {/* Reader Controls Toolbar */}
      <div className="flex items-center justify-between py-2.5 px-3 my-4 bg-gray-50 dark:bg-editorial-darkCard rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-mono">
        {/* Font Size Adjuster */}
        <div className="flex items-center gap-1.5">
          <Type className="w-4 h-4 text-gray-500" />
          <span className="text-gray-500 uppercase mr-1">Text Size:</span>
          <button
            type="button"
            onClick={() => setFontSize("sm")}
            className={`px-2 py-1 rounded ${
              fontSize === "sm"
                ? "bg-[#1E1B1A] dark:bg-white text-white dark:text-black font-bold"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setFontSize("base")}
            className={`px-2 py-1 rounded ${
              fontSize === "base"
                ? "bg-[#1E1B1A] dark:bg-white text-white dark:text-black font-bold"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontSize("lg")}
            className={`px-2 py-1 rounded ${
              fontSize === "lg"
                ? "bg-[#1E1B1A] dark:bg-white text-white dark:text-black font-bold"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            A+
          </button>
        </div>

        {/* Print & Save Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition ${
              saved
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Article Body Content */}
      <div
        className={`article-content max-w-none text-gray-900 dark:text-gray-100 font-serif ${fontClasses[fontSize]} space-y-5`}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>

      {/* Inline Advertisement */}
      <InArticleAd ad={ad} />
    </div>
  );
}
