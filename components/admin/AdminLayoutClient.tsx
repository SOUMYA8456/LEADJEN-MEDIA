"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SessionUser } from "@/lib/auth";

interface AdminLayoutClientProps {
  user: SessionUser | null;
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent background body scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex relative overflow-x-hidden">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar (Permanent on Desktop >= lg, Slide-out Drawer on Mobile < lg) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static lg:z-auto transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <AdminSidebar user={user} onCloseMobile={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminHeader
          user={user}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isSidebarOpen={sidebarOpen}
        />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
