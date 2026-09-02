import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Users, Mail, Twitter, Linkedin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
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
            Editorial Authors & Correspondents
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Manage journalists, columnists, and desk profiles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {authors.map((author) => (
          <div
            key={author.id}
            className="bg-white dark:bg-editorial-darkCard p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-start gap-4"
          >
            <img
              src={author.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover bg-gray-100 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-base text-gray-950 dark:text-white">
                {author.name}
              </h3>
              <p className="text-xs font-mono text-leadjen-600 dark:text-leadjen-400 font-semibold">
                {author.designation}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                {author.bio}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>{author._count.articles} published stories</span>
                <span className="text-leadjen-600">/author/{author.slug}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
