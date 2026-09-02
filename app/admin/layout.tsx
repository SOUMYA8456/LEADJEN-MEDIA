import React from "react";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If on login page, render children directly without sidebar/header
  const headerList = headers();
  const pathname = headerList.get("x-next-pathname") || "";

  // Note: in Next.js Server Components, we verify session for protected subpages
  // We provide the layout for all admin dashboard routes
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-editorial-darkBg text-gray-900 dark:text-gray-100 flex">
      {session && <AdminSidebar user={session} />}
      <div className="flex-1 flex flex-col min-w-0">
        {session && <AdminHeader user={session} />}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
