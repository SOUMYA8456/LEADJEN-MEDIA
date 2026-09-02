"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Camera, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface PhotoItem {
  url: string;
  caption: string;
  photographer?: string;
}

interface PhotoGallerySectionProps {
  title?: string;
  gallery?: {
    id: string;
    title: string;
    description?: string | null;
    coverImage: string;
    images: string; // JSON
    photographer?: string | null;
  } | null;
}

export function PhotoGallerySection({
  title = "LEADJEN PHOTO JOURNALISM",
  gallery,
}: PhotoGallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!gallery) return null;

  let photoList: PhotoItem[] = [];
  try {
    photoList = JSON.parse(gallery.images);
  } catch {
    photoList = [
      { url: gallery.coverImage, caption: gallery.title, photographer: gallery.photographer || "Leadjen Visuals" },
    ];
  }

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % photoList.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + photoList.length) % photoList.length);
    }
  };

  return (
    <section className="w-full py-8 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-gray-950 dark:border-white">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-black dark:text-white" />
          <h2 className="font-serif font-black text-xl sm:text-2xl text-gray-950 dark:text-white tracking-tight uppercase">
            {title}
          </h2>
        </div>
        <Link
          href="/photos"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black dark:text-white hover:underline"
        >
          <span>All Galleries</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photoList.slice(0, 3).map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setLightboxIndex(idx)}
            className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer shadow-none"
          >
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition flex flex-col justify-end p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300">
                Photo {idx + 1} of {photoList.length}
              </span>
              <p className="text-white text-xs sm:text-sm font-serif font-medium line-clamp-2 mt-0.5">
                {photo.caption}
              </p>
              {photo.photographer && (
                <span className="text-[10px] text-gray-300 font-sans mt-1">
                  Credit: {photo.photographer}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-white rounded-full bg-black/50 z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 p-3 text-white bg-black/60 hover:bg-black/90 rounded-full transition z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image & Caption */}
          <div className="max-w-5xl w-full flex flex-col items-center">
            <div className="relative max-h-[75vh] w-full flex items-center justify-center">
              <img
                src={photoList[lightboxIndex].url}
                alt={photoList[lightboxIndex].caption}
                className="max-h-[75vh] max-w-full object-contain rounded"
              />
            </div>
            <div className="mt-4 text-center max-w-2xl px-4">
              <p className="text-white text-sm sm:text-base font-serif">
                {photoList[lightboxIndex].caption}
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-gray-400 mt-1 font-mono">
                <span>Credit: {photoList[lightboxIndex].photographer || "Leadjen Visuals"}</span>
                <span>•</span>
                <span>{lightboxIndex + 1} / {photoList.length}</span>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 p-3 text-white bg-black/60 hover:bg-black/90 rounded-full transition z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
}
