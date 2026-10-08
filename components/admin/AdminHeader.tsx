"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu, X, Shield } from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface AdminHeaderProps {
  user: SessionUser | null;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function AdminHeader({ user, onToggleSidebar, isSidebarOpen }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-3 sm:px-6 z-20 sticky top-0">
      {/* Left side: Hamburger on mobile + Branding */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-1 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition focus:outline-none"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-1.5 font-serif font-black text-base sm:text-lg text-black dark:text-white truncate">
          <span>LEADJEN</span>
          <span className="text-red-600 font-sans font-bold text-xs uppercase px-1.5 py-0.5 bg-red-600/10 rounded">
            CMS
          </span>
        </div>

        <span className="hidden md:inline-block text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
          v2.6 Enterprise
        </span>
      </div>

      {/* Right side: Actions & User */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-500 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition border border-neutral-200 dark:border-neutral-800"
          title="Open Public Website in New Tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Live Site</span>
        </Link>

        {/* User Info & Role Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-neutral-200 dark:border-neutral-800">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold font-mono shadow-xs"
              title={`${user.name} (${user.role})`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left max-w-[130px] lg:max-w-[180px]">
              <span className="text-xs font-bold text-black dark:text-white block leading-none truncate">
                {user.name}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-red-600 dark:text-red-400 font-bold block mt-0.5 truncate">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-1.5 sm:p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
