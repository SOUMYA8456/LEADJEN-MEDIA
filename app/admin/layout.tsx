import React from "react";
import { getSession } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AdminLayoutClient user={session}>
      {children}
    </AdminLayoutClient>
  );
}
