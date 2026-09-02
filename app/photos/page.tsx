import React from "react";
import prisma from "@/lib/db";
import { PhotoGallerySection } from "@/components/news/PhotoGallerySection";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photo Journalism & Visual Stories | LEADJEN MEDIA",
  description: "Award-winning editorial photography and visual photo essays documenting key national and global events.",
};

export default async function PhotosPage() {
  const gallery = await prisma.photoGallery.findFirst({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="w-full bg-white dark:bg-editorial-darkBg py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-4 border-b-2 border-gray-950 dark:border-white">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            <Link href="/" className="hover:underline">HOME</Link> / PHOTOS
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-gray-950 dark:text-white tracking-tight uppercase">
            PHOTO JOURNALISM
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl font-sans">
            Capturing the defining human moments, mega infrastructure projects, and natural landscapes across the globe.
          </p>
        </div>

        <PhotoGallerySection gallery={gallery} />
      </div>
    </div>
  );
}
