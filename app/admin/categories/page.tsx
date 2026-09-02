import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-gray-950 dark:text-white">
            News Categories
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Manage editorial hierarchy and section feeds
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-editorial-darkCard rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-[10px] font-mono uppercase text-gray-400">
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug / URL</th>
              <th className="py-3 px-4">Published Articles</th>
              <th className="py-3 px-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                <td className="py-3 px-4 font-mono text-gray-400">{cat.order}</td>
                <td className="py-3 px-4 font-bold text-gray-950 dark:text-white">
                  {cat.name}
                </td>
                <td className="py-3 px-4 font-mono text-leadjen-600 dark:text-leadjen-400">
                  /{cat.slug}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-gray-700 dark:text-gray-300">
                  {cat._count.articles} stories
                </td>
                <td className="py-3 px-4 text-gray-500 truncate max-w-xs">
                  {cat.description || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
