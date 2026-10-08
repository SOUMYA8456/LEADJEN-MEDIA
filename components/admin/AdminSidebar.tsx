"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderTree,
  Users,
  Radio,
  Megaphone,
  UserCheck,
  ChevronRight,
  Layers,
  Settings,
  Calendar,
  Shield,
  Clock,
  BarChart3,
  Image as ImageIcon,
  Flame,
  Globe,
  MessageSquare,
  Activity,
  X,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface NavGroup {
  groupTitle?: string;
  items: {
    label: string;
    href: string;
    icon: any;
    highlight?: boolean;
    superAdminOnly?: boolean;
    editorOrAdmin?: boolean;
  }[];
}

interface AdminSidebarProps {
  user: SessionUser | null;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ user, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      groupTitle: "NEWS DESK",
      items: [
        { label: "Editorial News Desk", href: "/admin/news-desk", icon: Radio, highlight: true },
        { label: "Newsroom Overview", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      groupTitle: "CONTENT",
      items: [
        { label: "All Articles", href: "/admin/articles", icon: FileText },
        { label: "Write Article", href: "/admin/articles/create", icon: PlusCircle },
        { label: "Taxonomies", href: "/admin/categories", icon: FolderTree },
        { label: "Correspondents", href: "/admin/authors", icon: Users },
        { label: "Media Library", href: "/admin/media", icon: ImageIcon },
      ],
    },
    {
      groupTitle: "NEWSROOM",
      items: [
        { label: "Breaking Bulletins", href: "/admin/breaking", icon: Flame },
        { label: "Live Wire Desk", href: "/admin/live", icon: Clock },
        { label: "Editorial Calendar", href: "/admin/editorial-calendar", icon: Calendar },
      ],
    },
    {
      groupTitle: "WEBSITE BUILDER",
      items: [
        { label: "Site Builder Studio", href: "/admin/site-builder", icon: Layers, editorOrAdmin: true, highlight: true },
        { label: "Homepage Builder", href: "/admin/homepage", icon: LayoutDashboard, editorOrAdmin: true },
        { label: "Static & Policy Pages", href: "/admin/pages", icon: FileText, editorOrAdmin: true },
        { label: "Technical SEO", href: "/admin/seo", icon: Globe, editorOrAdmin: true },
        { label: "Brand & Navigation", href: "/admin/settings/site", icon: Settings, superAdminOnly: true },
      ],
    },
    {
      groupTitle: "MONETIZATION",
      items: [
        { label: "Advertisements", href: "/admin/advertisements", icon: Megaphone, editorOrAdmin: true },
        { label: "Ad Analytics", href: "/admin/advertisements/analytics", icon: BarChart3, editorOrAdmin: true },
      ],
    },
    {
      groupTitle: "ANALYTICS",
      items: [
        { label: "Analytics Dashboard", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      groupTitle: "AUDIENCE",
      items: [
        { label: "Reader Community", href: "/admin/readers", icon: Users, editorOrAdmin: true },
        { label: "Comment Moderation", href: "/admin/comments", icon: MessageSquare, editorOrAdmin: true },
      ],
    },
    {
      groupTitle: "SYSTEM",
      items: [
        { label: "System Health & Security", href: "/admin/system", icon: Activity, superAdminOnly: true },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: Shield, editorOrAdmin: true },
        { label: "User Roles (RBAC)", href: "/admin/users", icon: UserCheck, superAdminOnly: true },
      ],
    },
  ];

  return (
    <aside className="w-72 sm:w-64 bg-black text-neutral-300 h-screen flex flex-col border-r border-neutral-800 flex-shrink-0 select-none">
      {/* Brand Header with Mobile Close button */}
      <div className="p-4 sm:p-6 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <Link href="/admin/news-desk" onClick={onCloseMobile} className="block">
            <img
              src="/images/logo-white.png"
              alt="LEADJEN MEDIA"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </Link>
          <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400 uppercase mt-2 block">
            Editorial Newsroom CMS
          </span>
        </div>

        {/* Close Button on Mobile (< lg) */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links Grouped */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto no-scrollbar">
        {navGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter((item) => {
            if (item.superAdminOnly && user?.role !== "SUPER_ADMIN") return false;
            if (item.editorOrAdmin && user?.role === "REPORTER") return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupTitle || `g-${gIdx}`} className="space-y-1">
              {group.groupTitle && (
                <span className="px-3 text-[9px] font-mono font-bold tracking-widest uppercase text-neutral-500 block mb-1">
                  {group.groupTitle}
                </span>
              )}
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition relative ${
                      isActive
                        ? "bg-neutral-900 text-white border-l-4 border-red-600 shadow-sm pl-2"
                        : item.highlight
                        ? "bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/40"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-red-500" : item.highlight ? "text-red-500 animate-pulse" : "text-neutral-400"
                        }`}
                      />
                      <span className="uppercase">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-neutral-800 text-[11px] text-neutral-500 font-mono space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="truncate mr-2">Role: {user?.role || "GUEST"}</span>
          <span className="text-red-500 font-bold flex-shrink-0">🔴 LIVE</span>
        </div>
        <p className="text-[10px] text-neutral-400 flex items-center gap-1.5 pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
          PostgreSQL Active
        </p>
      </div>
    </aside>
  );
}
