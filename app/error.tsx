"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error internally
    console.error("Editorial Application Error:", error.message);
  }, [error]);

  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-neutral-950 text-center font-sans">
      <div className="max-w-md space-y-6">
        <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-mono font-bold uppercase rounded tracking-widest inline-block shadow-xs">
          500 • EDITORIAL WIRE NOTICE
        </span>

        <h1 className="font-serif font-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight">
          Service Temporarily Interrupted
        </h1>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
          An unexpected issue occurred while rendering this news dispatch. Our technical desk has been notified.
        </p>

        {error.digest && (
          <p className="text-[10px] font-mono text-neutral-400">
            Incident Reference: {error.digest}
          </p>
        )}

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <Home className="w-4 h-4" />
            <span>Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
