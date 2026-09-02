import React from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [article, categories, authors] = await Promise.all([
    prisma.article.findUnique({
      where: { id: params.id },
      include: { category: true, author: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <ArticleForm
        initialData={article}
        categories={categories}
        authors={authors}
        isEditing={true}
      />
    </div>
  );
}
