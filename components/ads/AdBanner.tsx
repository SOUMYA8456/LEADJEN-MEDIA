"use client";

import React, { useEffect, useRef, useState } from "react";
import { Advertisement } from "@prisma/client";
import { sanitizeVideoUrl } from "@/lib/storage";

interface AdBannerProps {
  ad?: Advertisement | any | null;
  location?: string;
  className?: string;
  fallbackText?: string;
  isAdminPreview?: boolean;
}

// Client-side impression and click tracker
function trackAdEvent(
  adId: string,
  type: "IMPRESSION" | "CLICK",
  location?: string,
  isAdminPreview: boolean = false
) {
  if (!adId || adId.startsWith("default-") || isAdminPreview) return;

  try {
    const device =
      typeof window !== "undefined"
        ? window.innerWidth >= 1024
          ? "DESKTOP"
          : window.innerWidth >= 640
          ? "TABLET"
          : "MOBILE"
        : "DESKTOP";

    fetch(`/api/ads/${adId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, device, location, isAdminPreview }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

/**
 * Universal Creative Content Renderer (Image, Video, HTML)
 */
export function AdCreativeRenderer({
  ad,
  aspectClass = "aspect-[16/5]",
  onAdClick,
}: {
  ad: any;
  aspectClass?: string;
  onAdClick?: () => void;
}) {
  const creativeType = ad.creativeType || "IMAGE";
  const [imageError, setImageError] = useState(false);

  // VIDEO CREATIVE
  if (creativeType === "VIDEO") {
    const videoResult = sanitizeVideoUrl(ad.destinationUrl || ad.imageUrl || "");
    const videoUrl = videoResult.valid ? videoResult.embedUrl : "";

    if (videoUrl?.includes("youtube") || videoUrl?.includes("vimeo")) {
      return (
        <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-black`}>
          <iframe
            src={videoUrl}
            title={ad.name || "Sponsored Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      );
    }

    return (
      <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-black`}>
        <video
          src={videoUrl}
          controls
          muted
          playsInline
          poster={ad.desktopImage || ad.imageUrl}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // HTML CREATIVE
  if (creativeType === "HTML" && ad.htmlContent) {
    return (
      <div
        className={`w-full ${aspectClass} overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2 flex items-center justify-center`}
        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
      />
    );
  }

  // IMAGE CREATIVE (DEFAULT)
  const desktopSrc = ad.desktopImage || ad.imageUrl || "";
  const tabletSrc = ad.tabletImage || desktopSrc;
  const mobileSrc = ad.mobileImage || tabletSrc;

  if (imageError || !desktopSrc) {
    return (
      <div className={`w-full ${aspectClass} rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center p-4 text-center`}>
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
          Advertisement • {ad.advertiser || "Leadjen Partner"}
        </span>
        <h4 className="font-serif font-bold text-sm text-black dark:text-white mt-1">
          {ad.name || "Sponsored Partner"}
        </h4>
      </div>
    );
  }

  return (
    <a
      href={ad.destinationUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onAdClick}
      className="relative block w-full h-full rounded-xl overflow-hidden group bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800"
    >
      <picture className="w-full h-full">
        {mobileSrc && <source media="(max-width: 640px)" srcSet={mobileSrc} />}
        {tabletSrc && <source media="(max-width: 1024px)" srcSet={tabletSrc} />}
        <img
          src={desktopSrc}
          alt={ad.name || "Advertisement"}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex items-center px-6">
        <div>
          <span className="inline-block bg-[#1E1B1A] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded tracking-wide uppercase mb-1">
            {ad.advertiser || "Featured Partner"}
          </span>
          <h4 className="text-white font-serif text-xs sm:text-sm md:text-base font-bold tracking-tight line-clamp-1">
            {ad.name}
          </h4>
        </div>
      </div>
    </a>
  );
}

export function LeaderboardAd({
  ad,
  className = "",
  isAdminPreview = false,
}: {
  ad?: Advertisement | any | null;
  className?: string;
  isAdminPreview?: boolean;
}) {
  const currentAd = ad || {
    id: "default-leaderboard",
    name: "Leadjen Executive Summit 2026",
    advertiser: "Leadjen Media Global",
    creativeType: "IMAGE",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=200&q=80",
    desktopImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=200&q=80",
    tabletImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=728&h=90&q=80",
    mobileImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=320&h=100&q=80",
    destinationUrl: "https://leadjenmedia.com/partner",
    location: "TOP_LEADERBOARD",
  };

  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && currentAd.id && !currentAd.id.startsWith("default-")) {
      trackedRef.current = true;
      trackAdEvent(currentAd.id, "IMPRESSION", "TOP_LEADERBOARD", isAdminPreview);
    }
  }, [currentAd.id, isAdminPreview]);

  return (
    <div className={`w-full bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 py-2.5 px-4 transition-colors ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">
          Advertisement • Sponsored Partner
        </span>
        <div className="w-full max-w-5xl h-[70px] sm:h-[90px] md:h-[110px]">
          <AdCreativeRenderer
            ad={currentAd}
            onAdClick={() => trackAdEvent(currentAd.id, "CLICK", "TOP_LEADERBOARD", isAdminPreview)}
          />
        </div>
      </div>
    </div>
  );
}

export function SidebarAd({
  ad,
  className = "",
  isAdminPreview = false,
}: {
  ad?: Advertisement | any | null;
  className?: string;
  isAdminPreview?: boolean;
}) {
  const currentAd = ad || {
    id: "default-sidebar",
    name: "Enterprise Cloud Infrastructure",
    advertiser: "Enterprise Cloud",
    creativeType: "IMAGE",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=500&q=80",
    destinationUrl: "https://leadjenmedia.com/partner",
    location: "SIDEBAR_AD",
  };

  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && currentAd.id && !currentAd.id.startsWith("default-")) {
      trackedRef.current = true;
      trackAdEvent(currentAd.id, "IMPRESSION", "SIDEBAR_AD", isAdminPreview);
    }
  }, [currentAd.id, isAdminPreview]);

  return (
    <div className={`w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-2xl text-center shadow-none ${className}`}>
      <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 dark:text-neutral-500 block mb-1.5">
        Advertisement
      </span>
      <div className="w-full h-[250px]">
        <AdCreativeRenderer
          ad={currentAd}
          aspectClass="h-[250px]"
          onAdClick={() => trackAdEvent(currentAd.id, "CLICK", "SIDEBAR_AD", isAdminPreview)}
        />
      </div>
    </div>
  );
}

export function InArticleAd({
  ad,
  className = "",
  isAdminPreview = false,
}: {
  ad?: Advertisement | any | null;
  className?: string;
  isAdminPreview?: boolean;
}) {
  const currentAd = ad || {
    id: "default-in-article",
    name: "Global Wealth & Strategic Investments 2026",
    advertiser: "Global Wealth Forum",
    creativeType: "IMAGE",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&h=250&q=80",
    destinationUrl: "https://leadjenmedia.com/partner",
    location: "IN_ARTICLE_AD",
  };

  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && currentAd.id && !currentAd.id.startsWith("default-")) {
      trackedRef.current = true;
      trackAdEvent(currentAd.id, "IMPRESSION", "IN_ARTICLE_AD", isAdminPreview);
    }
  }, [currentAd.id, isAdminPreview]);

  return (
    <div className={`my-8 p-4 bg-neutral-50 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800 text-center ${className}`}>
      <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 dark:text-neutral-500 block mb-2">
        Advertisement • Special Insight
      </span>
      <div className="w-full h-[120px] sm:h-[140px]">
        <AdCreativeRenderer
          ad={currentAd}
          aspectClass="h-[120px] sm:h-[140px]"
          onAdClick={() => trackAdEvent(currentAd.id, "CLICK", "IN_ARTICLE_AD", isAdminPreview)}
        />
      </div>
    </div>
  );
}

export function HomepageContentAd({
  ad,
  className = "",
  isAdminPreview = false,
}: {
  ad?: Advertisement | any | null;
  className?: string;
  isAdminPreview?: boolean;
}) {
  const currentAd = ad || {
    id: "default-content-ad",
    name: "Asia Pacific Clean Energy Infrastructure Summit",
    advertiser: "Clean Energy Alliance",
    creativeType: "IMAGE",
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&h=250&q=80",
    destinationUrl: "https://leadjenmedia.com/partner",
    location: "HOMEPAGE_CONTENT",
  };

  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && currentAd.id && !currentAd.id.startsWith("default-")) {
      trackedRef.current = true;
      trackAdEvent(currentAd.id, "IMPRESSION", "HOMEPAGE_CONTENT", isAdminPreview);
    }
  }, [currentAd.id, isAdminPreview]);

  return (
    <div className={`w-full max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center">
        <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 dark:text-neutral-500 block mb-2">
          Advertisement • Sponsored Content
        </span>
        <div className="w-full h-[100px] sm:h-[130px]">
          <AdCreativeRenderer
            ad={currentAd}
            aspectClass="h-[100px] sm:h-[130px]"
            onAdClick={() => trackAdEvent(currentAd.id, "CLICK", "HOMEPAGE_CONTENT", isAdminPreview)}
          />
        </div>
      </div>
    </div>
  );
}
