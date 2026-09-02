import React from "react";
import { notFound } from "next/navigation";
import prisma, { syncScheduledArticles } from "@/lib/db";
import { HorizontalNewsCard } from "@/components/news/NewsCard";
import Link from "next/link";
import { Twitter, Linkedin } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const author = await prisma.author.findUnique({
    where: { slug: params.slug },
  });

  if (!author) {
    return { title: "Author Not Found | LEADJEN MEDIA" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjen-media-news.vercel.app";
  const authorUrl = `${siteUrl}/author/${params.slug}`;

  return {
    title: `${author.name} — Author & Correspondent | LEADJEN MEDIA`,
    description: author.bio || `Read articles, investigative analysis, and reports written by ${author.name} for Leadjen Media.`,
    alternates: {
      canonical: authorUrl,
    },
    openGraph: {
      title: `${author.name} — Leadjen Media`,
      description: author.bio || `Read stories by ${author.name}`,
      url: authorUrl,
      images: author.avatar ? [{ url: author.avatar }] : [],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${author.name} — Leadjen Media`,
      description: author.bio || `Read stories by ${author.name}`,
      images: author.avatar ? [author.avatar] : [],
    },
  };
}

export default async function AuthorProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  await syncScheduledArticles();
  const now = new Date();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjen-media-news.vercel.app";
  const authorUrl = `${siteUrl}/author/${params.slug}`;

  const author = await prisma.author.findUnique({
    where: { slug: params.slug },
    include: {
      articles: {
        where: { status: "PUBLISHED", publishedAt: { lte: now } },
        include: { category: true, author: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!author) {
    notFound();
  }

  const authorJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: author.name,
      jobTitle: author.designation || "Senior Editorial Correspondent",
      description: author.bio,
      image: author.avatar,
      url: authorUrl,
      sameAs: [author.twitter, author.linkedin].filter(Boolean),
      worksFor: {
        "@type": "NewsMediaOrganization",
        name: "LEADJEN MEDIA",
        url: siteUrl,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
      />
      <div className="w-full bg-white dark:bg-editorial-darkBg py-10 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Author Bio Header Card */}
        <div className="p-8 bg-gray-50 dark:bg-editorial-darkCard rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left shadow-none">
          <img
            src={author.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"}
            alt={author.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-none bg-gray-200 flex-shrink-0"
          />
          <div className="space-y-2 flex-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              LEADJEN EDITORIAL CORRESPONDENT
            </span>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-gray-950 dark:text-white">
              {author.name}
            </h1>
            <p className="text-xs font-mono text-gray-500 font-semibold">
              {author.designation || "Senior Journalist"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-sans max-w-2xl">
              {author.bio || "Staff correspondent for Leadjen Media covering national and international affairs."}
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
              {author.twitter && (
                <a
                  href={author.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-gray-200 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {author.linkedin && (
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-gray-200 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Articles by Author */}
        <div className="space-y-6">
          <div className="pb-3 border-b-2 border-gray-950 dark:border-white flex items-center justify-between">
            <h2 className="font-serif font-black text-xl text-gray-950 dark:text-white uppercase tracking-tight">
              ARTICLES BY {author.name} ({author.articles.length})
            </h2>
          </div>

          <div className="space-y-4">
            {author.articles.map((article) => (
              <HorizontalNewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
