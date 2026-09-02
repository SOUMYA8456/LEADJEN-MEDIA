"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut, Shield, User as UserIcon } from "lucide-react";
import { SessionUser } from "@/lib/auth";

export function AdminHeader({ user }: { user: SessionUser | null }) {
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
    <header className="h-16 bg-white dark:bg-editorial-darkCard border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-serif font-black text-lg text-gray-900 dark:text-white">
          <span>LEADJEN</span>
          <span className="text-leadjen-600 dark:text-leadjen-400 font-light">CMS</span>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          v2.6 Enterprise
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-leadjen-600 dark:hover:text-leadjen-400 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Public Site</span>
        </Link>

        {/* User Info & Role Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="w-7 h-7 rounded-full bg-leadjen-100 dark:bg-leadjen-900/60 text-leadjen-700 dark:text-leadjen-300 flex items-center justify-center text-xs font-bold font-mono">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-gray-900 dark:text-white block leading-none">
                {user.name}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-leadjen-600 dark:text-leadjen-400">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
