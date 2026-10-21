"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Radio,
  Moon,
  Sun,
  Shield,
  Video,
  Camera,
  Headphones,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  User,
  LogIn,
  ExternalLink,
  Flame,
  Globe,
  Megaphone,
  Briefcase,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { DEFAULT_SERVICES, ServiceItemConfig } from "@/lib/site-builder-defaults";
import { SearchModal } from "./SearchModal";
import { LiveClock } from "./LiveClock";

export interface NavItem {
  name: string;
  href: string;
  inMore?: boolean;
}

export const DEFAULT_PRIMARY_NAV: NavItem[] = [
  { name: "HOME", href: "/" },
  { name: "INDIA", href: "/india" },
  { name: "WORLD", href: "/world" },
  { name: "POLITICS", href: "/politics" },
  { name: "BUSINESS", href: "/business" },
  { name: "TECHNOLOGY", href: "/technology" },
  { name: "SPORTS", href: "/sports" },
  { name: "ENTERTAINMENT", href: "/entertainment" },
  { name: "HEALTH", href: "/health" },
  { name: "SCIENCE", href: "/science" },
  { name: "LIFESTYLE", href: "/lifestyle" },
  { name: "TRAVEL", href: "/travel" },
  { name: "VIDEO", href: "/videos" },
  { name: "PHOTOS", href: "/photos" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_PRIMARY_NAV);
  const [sessionUser, setSessionUser] = useState<any | null>(null);

  // Settings
  const [showLive, setShowLive] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [clockTimezone, setClockTimezone] = useState("Asia/Kolkata");
  const [clockFormat, setClockFormat] = useState<"12h" | "24h">("12h");
  const [clockLabel, setClockLabel] = useState("IST");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [headerAnnouncement, setHeaderAnnouncement] = useState("");
  const [siteLogo, setSiteLogo] = useState("");
  const [tagline, setTagline] = useState("INDEPENDENT JOURNALISM • INSIGHT • IMPACT");

  const { theme, toggleTheme, siteConfig } = useTheme();
  const pathname = usePathname();
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const servicesList: ServiceItemConfig[] = (
    siteConfig?.services?.items && siteConfig.services.items.length > 0
      ? siteConfig.services.items
      : DEFAULT_SERVICES
  )
    .filter((s) => s.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const adConfig = siteConfig?.advertising;

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSessionUser(null);
      setUserDropdownOpen(false);
      window.location.href = "/";
    } catch {}
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Fetch site navigation & settings
    fetch("/api/settings/site")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          if (data.settings.headerNavItems) {
            try {
              const parsed = JSON.parse(data.settings.headerNavItems);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const visible = parsed.filter((item: any) => item.isVisible !== false);
                setNavItems(visible);
              }
            } catch {}
          }
          if (data.settings.showLiveButton !== undefined) setShowLive(data.settings.showLiveButton);
          if (data.settings.showSearchButton !== undefined) setShowSearch(data.settings.showSearchButton);
          if (data.settings.showClock !== undefined) setShowClock(data.settings.showClock);
          if (data.settings.clockTimezone) setClockTimezone(data.settings.clockTimezone);
          if (data.settings.clockFormat) setClockFormat(data.settings.clockFormat as any);
          if (data.settings.clockLabel) setClockLabel(data.settings.clockLabel);
          if (data.settings.showAnnouncement !== undefined) setShowAnnouncement(data.settings.showAnnouncement);
          if (data.settings.headerAnnouncement) setHeaderAnnouncement(data.settings.headerAnnouncement);
          if (data.settings.siteConfig?.global?.siteLogo) setSiteLogo(data.settings.siteConfig.global.siteLogo);
          if (data.settings.siteConfig?.global?.tagline) setTagline(data.settings.siteConfig.global.tagline);
        }
      })
      .catch(() => {});

    // Check staff session
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setSessionUser(data.user);
      })
      .catch(() => {});

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close more menu on click outside or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setMoreMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Helper to determine if a nav link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#FFF8E7]/95 dark:bg-gray-950/95 backdrop-blur-md shadow-none border-b border-[#E8DCCB] dark:border-gray-800"
            : "bg-[#FFF8E7] dark:bg-gray-950 border-b border-[#E8DCCB] dark:border-gray-800"
        }`}
      >
        {/* Editorial Top Announcement Banner */}
        {showAnnouncement && headerAnnouncement && (
          <div className="w-full bg-[#4A0B1C] text-white py-1.5 px-4 text-center text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b border-[#60152B]">
            <span className="w-2 h-2 rounded-full bg-[#B42332] animate-pulse" />
            <span>{headerAnnouncement}</span>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 1. PRIMARY MAIN HEADER                                                 */}
        {/* ======================================================================= */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            {/* LEFT: Menu Button */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-2 p-2 -ml-2 text-[#4A0B1C] dark:text-gray-200 hover:text-[#6B1024] dark:hover:text-white rounded-lg hover:bg-[#F7EEDB] dark:hover:bg-gray-800/80 transition"
                aria-label="Open Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden lg:inline text-xs font-mono font-bold uppercase tracking-wider">
                  Menu
                </span>
              </button>
            </div>

            {/* CENTER: Official Leadjen Media Logo & Sub-tagline */}
            <div className="flex-1 flex flex-col items-center justify-center text-center min-w-0 px-2">
              <Link href="/" className="inline-block group focus:outline-none select-none">
                <img
                  src="/images/logo.png"
                  alt="LEADJEN MEDIA"
                  className="h-9 sm:h-12 md:h-14 w-auto object-contain dark:hidden transition-transform group-hover:scale-[1.01]"
                />
                <img
                  src="/images/logo-white.png"
                  alt="LEADJEN MEDIA"
                  className="h-9 sm:h-12 md:h-14 w-auto object-contain hidden dark:block transition-transform group-hover:scale-[1.01]"
                />
              </Link>
              <p className="hidden md:block text-[10px] font-mono tracking-[0.22em] text-[#665858] dark:text-gray-400 uppercase mt-1 font-semibold">
                INDEPENDENT JOURNALISM • INSIGHT • IMPACT
              </p>
            </div>

            {/* RIGHT: Utility Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              {/* Live Clock with Red Indicator */}
              {showClock && (
                <LiveClock
                  timezone={clockTimezone}
                  format={clockFormat}
                  label={clockLabel}
                  className="hidden md:flex"
                />
              )}

              {/* WATCH Button */}
              <Link
                href="/videos"
                className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                  isLinkActive("/videos")
                    ? "bg-[#4A0B1C] text-white shadow-none"
                    : "text-[#4A0B1C] dark:text-gray-300 hover:text-[#6B1024] dark:hover:text-white hover:bg-[#F7EEDB] dark:hover:bg-gray-800"
                }`}
                title="Leadjen Video Journalism"
              >
                <Video className="w-3.5 h-3.5 text-[#4A0B1C] dark:text-white" />
                <span>Watch</span>
              </Link>

              {/* LISTEN Button */}
              <Link
                href="/listen"
                className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                  isLinkActive("/listen")
                    ? "bg-[#4A0B1C] text-white shadow-none"
                    : "text-[#4A0B1C] dark:text-gray-300 hover:text-[#6B1024] dark:hover:text-white hover:bg-[#F7EEDB] dark:hover:bg-gray-800"
                }`}
                title="Leadjen Audio Journalism & Daily Briefings"
              >
                <Headphones className="w-3.5 h-3.5 text-[#4A0B1C] dark:text-white" />
                <span>Listen</span>
              </Link>

              {/* Search Icon Trigger */}
              {showSearch && (
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(true)}
                  className="p-2 text-[#4A0B1C] dark:text-gray-300 hover:text-[#6B1024] dark:hover:text-white rounded-full hover:bg-[#F7EEDB] dark:hover:bg-gray-800 transition"
                  aria-label="Search articles"
                  title="Search news, topics, and authors"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Dark/Light Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 text-[#4A0B1C] dark:text-gray-300 hover:text-[#6B1024] dark:hover:text-white rounded-full hover:bg-[#F7EEDB] dark:hover:bg-gray-800 transition"
                aria-label="Toggle Theme"
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 2. PRIMARY CATEGORY NAVIGATION BAR WITH MORE ▾ MEGA MENU               */}
        {/* ======================================================================= */}
        <div className="border-t border-[#60152B] bg-[#4A0B1C] text-white relative shadow-sm">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <nav
              aria-label="Primary Categories"
              className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar py-1.5 text-xs font-mono font-bold tracking-wider uppercase"
            >
              {/* Primary Navigation Links */}
              {navItems.map((cat) => {
                const active = isLinkActive(cat.href);
                return (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className={`whitespace-nowrap px-2.5 py-1.5 rounded-md transition-all relative select-none ${
                      active
                        ? "text-white bg-[#7A2038] font-extrabold border-b-2 border-[#F4DDE3] shadow-xs"
                        : "text-white/90 hover:text-white hover:bg-white/10 shadow-none"
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}

              {/* MORE ▾ Dropdown Trigger Button */}
              <div className="relative flex-shrink-0">
                <button
                  ref={moreButtonRef}
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  onMouseEnter={() => setMoreMenuOpen(true)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition font-extrabold uppercase whitespace-nowrap ${
                    moreMenuOpen
                      ? "bg-[#7A2038] text-white"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                  aria-expanded={moreMenuOpen}
                  aria-haspopup="true"
                >
                  <span>MORE</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 text-[#F4DDE3] ${
                      moreMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </nav>
          </div>

          {/* ======================================================================= */}
          {/* 3. MORE ▾ PROFESSIONAL EDITORIAL MEGA MENU                             */}
          {/* ======================================================================= */}
          <div
            ref={moreMenuRef}
            onMouseLeave={() => setMoreMenuOpen(false)}
            className={`absolute top-full left-0 right-0 z-50 bg-[#FFF8E7] dark:bg-gray-950 border-b border-[#E8DCCB] dark:border-gray-800 shadow-2xl transition-all duration-200 ${
              moreMenuOpen
                ? "opacity-100 visible translate-y-0 pointer-events-auto"
                : "opacity-0 invisible -translate-y-2 pointer-events-none"
            }`}
          >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
                  {/* Column 1: NEWS */}
                  <div className="space-y-3">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#4A0B1C] dark:text-white flex items-center gap-1.5 pb-1.5 border-b border-[#E8DCCB] dark:border-gray-800">
                      <BookOpen className="w-3.5 h-3.5" />
                      NEWS & OPINION
                    </h3>
                    <ul className="space-y-2 text-xs font-sans text-[#241A1A] dark:text-gray-300">
                      <li>
                        <Link
                          href="/search?q=opinion"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Opinion & Editorials
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/search?q=investigations"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Investigations
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/search?q=explainers"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Explainers & Analysis
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/search?q=factcheck"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Fact Check Desk
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/search?q=education"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Education
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/search?q=jobs"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Careers & Jobs
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: BUSINESS & FINANCE */}
                  <div className="space-y-3">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#4A0B1C] dark:text-white flex items-center gap-1.5 pb-1.5 border-b border-[#E8DCCB] dark:border-gray-800">
                      <Briefcase className="w-3.5 h-3.5" />
                      BUSINESS & MARKETS
                    </h3>
                    <ul className="space-y-2 text-xs font-sans text-[#241A1A] dark:text-gray-300">
                      <li>
                        <Link
                          href="/business"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Stock Markets & Indices
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/business"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Personal Finance
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/technology"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Startups & Venture Capital
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/business"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Real Estate & Infra
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/business"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Global Economy
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: LIFESTYLE & CULTURE */}
                  <div className="space-y-3">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#4A0B1C] dark:text-white flex items-center gap-1.5 pb-1.5 border-b border-[#E8DCCB] dark:border-gray-800">
                      <Sparkles className="w-3.5 h-3.5" />
                      LIFESTYLE & CULTURE
                    </h3>
                    <ul className="space-y-2 text-xs font-sans text-[#241A1A] dark:text-gray-300">
                      <li>
                        <Link
                          href="/lifestyle"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Food & Dining
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/travel"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Travel Dispatches
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/entertainment"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Culture & Arts
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/lifestyle"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Fashion & Trends
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/health"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Wellness & Mental Health
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/technology"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Auto & Mobility
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 4: MULTIMEDIA */}
                  <div className="space-y-3">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#4A0B1C] dark:text-white flex items-center gap-1.5 pb-1.5 border-b border-[#E8DCCB] dark:border-gray-800">
                      <Video className="w-3.5 h-3.5" />
                      MULTIMEDIA HUB
                    </h3>
                    <ul className="space-y-2 text-xs font-sans text-[#241A1A] dark:text-gray-300">
                      <li>
                        <Link
                          href="/videos"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5 font-medium flex items-center justify-between"
                        >
                          <span>Video Journalism</span>
                          <span className="text-[10px] font-mono bg-[#F7EEDB] dark:bg-leadjen-950 text-[#4A0B1C] px-1 rounded font-bold">
                            HD
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/photos"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5 font-medium"
                        >
                          Photo Essays & Lightbox
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/listen"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5 font-medium flex items-center justify-between"
                        >
                          <span>Audio Podcasts & Briefs</span>
                          <span className="text-[10px] font-mono bg-[#6B1024] text-white px-1 rounded font-bold">
                            NEW
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/#newsletter"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Editorial Dispatch Newsletters
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 5: SPECIAL SECTIONS */}
                  <div className="space-y-3">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#4A0B1C] dark:text-white flex items-center gap-1.5 pb-1.5 border-b border-[#E8DCCB] dark:border-gray-800">
                      <Flame className="w-3.5 h-3.5" />
                      SPECIAL DESKS
                    </h3>
                    <ul className="space-y-2 text-xs font-sans text-[#241A1A] dark:text-gray-300">
                      <li>
                        <Link
                          href="/live"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5 text-[#B42332] dark:text-red-400 font-bold"
                        >
                          🔴 Live Developing Wire
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/search?sort=most_read"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Most Read Stories
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/search?q=trending"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Trending Topics
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/search"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Editor&apos;s Picks
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 6: ABOUT LEADJEN MEDIA */}
                  <div className="space-y-3">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#4A0B1C] dark:text-white flex items-center gap-1.5 pb-1.5 border-b border-[#E8DCCB] dark:border-gray-800">
                      <Globe className="w-3.5 h-3.5" />
                      ABOUT LEADJEN MEDIA
                    </h3>
                    <ul className="space-y-2 text-xs font-sans text-[#241A1A] dark:text-gray-300">
                      <li>
                        <Link
                          href="/about"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5 font-medium"
                        >
                          About Leadjen Media
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={adConfig?.ctaDestination || "/advertise"}
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5 text-[#B42332] dark:text-red-400 font-bold"
                        >
                          ★ Advertise With Us
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/services"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5 font-medium"
                        >
                          Creative &amp; Agency Services
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/contact"
                          onClick={() => setMoreMenuOpen(false)}
                          className="hover:text-[#6B1024] dark:hover:text-white hover:underline block py-0.5"
                        >
                          Contact Newsroom
                        </Link>
                      </li>
                    </ul>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* 4. FULL-HEIGHT EDITORIAL SLIDING MENU DRAWER (HAMBURGER)                 */}
      {/* ======================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-sm w-full bg-[#4A0B1C] text-white shadow-2xl p-6 overflow-y-auto z-10 animate-in slide-in-from-left duration-300 border-r border-white/10">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-[rgba(255,255,255,0.16)]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="/images/logo-white.png"
                  alt="LEADJEN MEDIA"
                  className="h-9 sm:h-10 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-white hover:text-white rounded-lg hover:bg-white/10 transition"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* In-drawer Search Trigger */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#60152B] rounded-xl text-xs font-mono text-[#F4DDE3] border border-white/20 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-white" />
                  <span className="text-[#F4DDE3]">Search news &amp; topics...</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-white/80">Search</span>
              </button>
            </div>

            {/* TOP-LEVEL HIGHLIGHT: ADVERTISE WITH LEADJEN MEDIA */}
            <div className="mt-4">
              <Link
                href={adConfig?.ctaDestination || "/advertise"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white text-[#4A0B1C] shadow-lg hover:opacity-95 transition group border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#6B1024] text-white flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-black uppercase tracking-wider text-[#4A0B1C]">
                      ADVERTISE WITH LEADJEN MEDIA
                    </div>
                    <div className="text-[10px] text-[#665858] font-sans">
                      Rate Card, Media Kit &amp; Partnerships
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#4A0B1C] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Drawer Navigation Desks */}
            <div className="mt-6 space-y-6">
              {/* Main Desks */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F4DDE3] px-3 block mb-1">
                  MAIN NEWS SECTIONS
                </span>
                {navItems.map((cat) => {
                  const active = isLinkActive(cat.href);
                  return (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition ${
                        active
                          ? "bg-[#7A2038] text-white font-extrabold shadow-xs"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#F4DDE3]" />
                    </Link>
                  );
                })}
              </div>

              {/* ABOUT LEADJEN MEDIA (11 Services) */}
              <div className="space-y-1 pt-4 border-t border-[rgba(255,255,255,0.16)]">
                <div className="flex items-center justify-between px-3 mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F4DDE3]">
                    ABOUT LEADJEN MEDIA
                  </span>
                  <span className="text-[9px] font-mono uppercase bg-[#60152B] text-[#F4DDE3] border border-white/20 px-1.5 py-0.5 rounded font-bold">
                    SERVICES
                  </span>
                </div>

                <div className="space-y-0.5">
                  {servicesList.map((service) => {
                    const sHref = service.slug === "about" || service.id === "service_1"
                      ? "/about"
                      : (service.url || `/services/${service.slug}`);
                    const isExternal = sHref.startsWith("http://") || sHref.startsWith("https://");
                    const active = !isExternal && isLinkActive(sHref);

                    if (isExternal) {
                      return (
                        <a
                          key={service.id || service.slug}
                          href={sHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold transition text-white hover:bg-white/10"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B42332] flex-shrink-0" />
                            <span className="truncate">{service.title}</span>
                          </div>
                          {service.badge ? (
                            <span className="text-[9px] font-mono bg-[#60152B] text-[#F4DDE3] border border-white/20 px-1.5 py-0.5 rounded font-bold flex-shrink-0 ml-2">
                              {service.badge}
                            </span>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#F4DDE3] flex-shrink-0 ml-2" />
                          )}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={service.id || service.slug}
                        href={sHref}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold transition ${
                          active
                            ? "bg-[#7A2038] text-white font-extrabold shadow-xs"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B42332] flex-shrink-0" />
                          <span className="truncate">{service.title}</span>
                        </div>
                        {service.badge ? (
                          <span className="text-[9px] font-mono bg-[#60152B] text-[#F4DDE3] border border-white/20 px-1.5 py-0.5 rounded font-bold flex-shrink-0 ml-2">
                            {service.badge}
                          </span>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-[#F4DDE3] flex-shrink-0 ml-2" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Multimedia & Audio */}
              <div className="space-y-1 pt-4 border-t border-[rgba(255,255,255,0.16)]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F4DDE3] px-3 block mb-1">
                  MULTIMEDIA &amp; AUDIO
                </span>
                <Link
                  href="/videos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold text-white hover:bg-white/10 uppercase"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-white" />
                    <span>Watch Videos</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#F4DDE3]" />
                </Link>
                <Link
                  href="/photos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold text-white hover:bg-white/10 uppercase"
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-white" />
                    <span>Photo Essays</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#F4DDE3]" />
                </Link>
                <Link
                  href="/listen"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold text-white hover:bg-white/10 uppercase"
                >
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-white" />
                    <span>Listen Podcasts</span>
                  </div>
                  <span className="text-[9px] font-mono bg-[#60152B] text-[#F4DDE3] border border-white/20 px-1.5 py-0.5 rounded font-bold">
                    NEW
                  </span>
                </Link>
              </div>

              {/* Discover & Special */}
              <div className="space-y-1 pt-4 border-t border-[rgba(255,255,255,0.16)]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F4DDE3] px-3 block mb-1">
                  DISCOVER &amp; SPECIAL
                </span>
                <Link
                  href="/live"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold text-white hover:bg-white/10 uppercase"
                >
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#B42332] animate-pulse" />
                    <span className="text-[#F4DDE3]">Live Developing Wire</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#F4DDE3]" />
                </Link>
                <Link
                  href="/search?sort=most_read"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold text-white hover:bg-white/10 uppercase"
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-white" />
                    <span>Most Read Stories</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#F4DDE3]" />
                </Link>
              </div>

              {/* Company & Newsroom */}
              <div className="space-y-1 pt-4 border-t border-[rgba(255,255,255,0.16)]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F4DDE3] px-3 block mb-1">
                  COMPANY
                </span>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-[#F4DDE3] hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  About Leadjen Media
                </Link>
                <Link
                  href="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-[#F4DDE3] hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Creative &amp; Enterprise Services
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-[#F4DDE3] hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Contact Editorial Newsroom
                </Link>
                <Link
                  href="/advertise"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-[#F4DDE3] hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Advertise With Us
                </Link>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.16)] space-y-3">
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#60152B] rounded-xl border border-white/20">
                <span className="text-xs font-mono text-[#F4DDE3] font-bold">
                  Theme Appearance
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 bg-[#7A2038] text-white rounded-lg hover:bg-white/20 transition"
                  aria-label="Toggle appearance"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-center space-y-1 font-mono pt-2">
                <img
                  src="/images/leadjen-bottom-logo.png"
                  alt="LEADJEN MEDIA"
                  className="h-8 sm:h-9 w-auto object-contain mx-auto mb-2 opacity-95"
                />
                <p className="text-[10px] text-[#F4DDE3]/80 font-medium">
                  © 2026 LEADJEN MEDIA. All rights reserved.
                </p>
                <p className="text-[9px] text-[#F4DDE3]/60">
                  Registered Digital News Publisher.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 5. SEARCH OVERLAY MODAL                                                 */}
      {/* ======================================================================= */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
