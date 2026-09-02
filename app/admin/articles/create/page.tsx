import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function CreateArticlePage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <ArticleForm categories={categories} authors={authors} isEditing={false} />
    </div>
  );
}
