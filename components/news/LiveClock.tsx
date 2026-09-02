"use client";

import React, { useState, useEffect } from "react";

interface LiveClockProps {
  timezone?: string;
  format?: "12h" | "24h";
  label?: string;
  className?: string;
}

export function LiveClock({
  timezone = "Asia/Kolkata",
  format = "12h",
  label = "IST",
  className = "",
}: LiveClockProps) {
  const [timeString, setTimeString] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    const updateClock = () => {
      try {
        const now = new Date();
        const is12Hour = format === "12h";

        const options: Intl.DateTimeFormatOptions = {
          timeZone: timezone,
          hour: is12Hour ? "numeric" : "2-digit",
          minute: "2-digit",
          hour12: is12Hour,
        };

        const formatter = new Intl.DateTimeFormat("en-US", options);
        const formatted = formatter.format(now);
        setTimeString(`${formatted} ${label}`.trim());
      } catch (err) {
        const now = new Date();
        setTimeString(`${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} ${label}`);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [timezone, format, label]);

  if (!mounted || !timeString) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-mono text-gray-400 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        <span className="opacity-70">LIVE --:-- IST</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-mono font-bold tracking-tight text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700/60 shadow-2xs select-none ${className}`}
      title={`Live Newsroom Clock (${timezone})`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
      </span>
      <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 dark:text-red-400">
        LIVE
      </span>
      <span className="text-gray-400">•</span>
      <span className="text-gray-900 dark:text-gray-200">{timeString}</span>
    </div>
  );
}
