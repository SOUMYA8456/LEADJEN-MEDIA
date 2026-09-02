import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { UserCheck, Shield } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-red-600" />
            Editorial Role Access Control (RBAC)
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Manage newsroom credentials and publishing authority levels
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role Permission</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover bg-neutral-200"
                    />
                    <span className="font-bold text-black dark:text-white">
                      {u.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                      u.role === "SUPER_ADMIN"
                        ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                        : u.role === "EDITOR"
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black font-bold"
                        : "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-300">
                  {u.email}
                </td>
                <td className="py-3 px-4 font-mono text-neutral-400">
                  {formatTimeAgo(u.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
