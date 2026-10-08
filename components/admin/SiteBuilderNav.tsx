"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Layout,
  Navigation,
  FileText,
  Radio,
  Video,
  Camera,
  Search,
  Users,
  Layers,
  Shield,
  Columns,
  Megaphone,
  AlertTriangle,
  Palette,
} from "lucide-react";

export const SITE_BUILDER_TABS = [
  { label: "Overview", href: "/admin/site-builder", icon: Layout },
  { label: "Global Brand", href: "/admin/site-builder/global", icon: Globe },
  { label: "Design & Typography", href: "/admin/site-builder/design", icon: Palette },
  { label: "Header", href: "/admin/site-builder/header", icon: Columns },
  { label: "Navigation", href: "/admin/site-builder/navigation", icon: Navigation },
  { label: "Homepage", href: "/admin/homepage", icon: Layers },
  { label: "Categories", href: "/admin/site-builder/categories", icon: Columns },
  { label: "Article Layout", href: "/admin/site-builder/article", icon: FileText },
  { label: "Live Desk", href: "/admin/site-builder/live", icon: Radio },
  { label: "Video Page", href: "/admin/site-builder/videos", icon: Video },
  { label: "Photo Page", href: "/admin/site-builder/photos", icon: Camera },
  { label: "Search Page", href: "/admin/site-builder/search", icon: Search },
  { label: "Author Pages", href: "/admin/site-builder/authors", icon: Users },
  { label: "Footer", href: "/admin/site-builder/footer", icon: Columns },
  { label: "Static Pages", href: "/admin/pages", icon: FileText },
  { label: "404 Page", href: "/admin/site-builder/404", icon: AlertTriangle },
  { label: "Ad Layout", href: "/admin/advertisements", icon: Megaphone },
];

export function SiteBuilderNav() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-2 py-1.5 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 min-w-max">
        {SITE_BUILDER_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
