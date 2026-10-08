"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Twitter, Linkedin, Facebook, Youtube, ArrowUp, Shield } from "lucide-react";
import { DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";

export function Footer() {
  const [config, setConfig] = useState<SiteBuilderConfig>(DEFAULT_SITE_BUILDER_CONFIG);

  useEffect(() => {
    fetch("/api/settings/site")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.siteConfig) {
          setConfig(data.settings.siteConfig);
        } else if (data.settings?.footerColumns) {
          try {
            const parsedCols = JSON.parse(data.settings.footerColumns);
            if (Array.isArray(parsedCols) && parsedCols.length > 0) {
              setConfig((prev) => ({
                ...prev,
                footer: { ...prev.footer, columns: parsedCols },
              }));
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const footer = config.footer || DEFAULT_SITE_BUILDER_CONFIG.footer;
  const global = config.global || DEFAULT_SITE_BUILDER_CONFIG.global;

  return (
    <footer className="w-full bg-neutral-950 text-neutral-300 border-t border-neutral-800 font-sans">
      {/* Upper Footer: Brand & Back to Top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 border-b border-neutral-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Link href="/" className="inline-block mb-1">
              <img
                src={global.siteLogo || "/images/logo-white.png"}
                alt={global.siteName || "LEADJEN MEDIA"}
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-2 text-sm text-neutral-400 max-w-md font-sans leading-relaxed">
              {footer.description || global.tagline || "Independent journalism. Important stories. Providing authoritative coverage on national affairs, international relations, technology, and global markets."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Social Media Links */}
            {footer.showSocialLinks !== false && (
              <div className="flex items-center gap-3">
                {global.socialLinks?.twitter && (
                  <a
                    href={global.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-[#1E1B1A] text-neutral-400 hover:text-white flex items-center justify-center transition border border-neutral-800 hover:border-neutral-700"
                    aria-label="Leadjen Media on X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {global.socialLinks?.linkedin && (
                  <a
                    href={global.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-[#1E1B1A] text-neutral-400 hover:text-white flex items-center justify-center transition border border-neutral-800 hover:border-neutral-700"
                    aria-label="Leadjen Media on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {global.socialLinks?.facebook && (
                  <a
                    href={global.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-[#1E1B1A] text-neutral-400 hover:text-white flex items-center justify-center transition border border-neutral-800 hover:border-neutral-700"
                    aria-label="Leadjen Media on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {global.socialLinks?.youtube && (
                  <a
                    href={global.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-[#1E1B1A] text-neutral-400 hover:text-white flex items-center justify-center transition border border-neutral-800 hover:border-neutral-700"
                    aria-label="Leadjen Media on YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {footer.showBackToTop !== false && (
              <button
                type="button"
                onClick={scrollToTop}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono rounded border border-neutral-700 transition ml-2"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back to Top</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Navigation Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-sans">
          {footer.columns && footer.columns.length > 0 ? (
            footer.columns.map((col, idx) => (
              <div key={idx}>
                <h4 className="font-mono text-[11px] font-bold tracking-widest text-white uppercase mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link href={link.url} className="hover:text-white text-neutral-400 transition">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div>
              <h4 className="font-mono text-[11px] font-bold tracking-widest text-white uppercase mb-4">News</h4>
              <ul className="space-y-2.5">
                <li><Link href="/india" className="hover:text-white text-neutral-400">India</Link></li>
                <li><Link href="/world" className="hover:text-white text-neutral-400">World</Link></li>
                <li><Link href="/politics" className="hover:text-white text-neutral-400">Politics</Link></li>
                <li><Link href="/business" className="hover:text-white text-neutral-400">Business</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Copyright & Branding Strip */}
      <div className="border-t border-neutral-900 bg-black/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center space-y-4">
          {/* Centered Transparent Brand Logo */}
          <Link href="/" className="inline-block group focus:outline-none select-none transition-transform hover:scale-[1.03] duration-200">
            <img
              src="/images/leadjen-bottom-logo.png"
              alt="LEADJEN MEDIA"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain mx-auto"
            />
          </Link>

          {/* Centered Copyright & Registration Details */}
          <div className="space-y-1.5 max-w-2xl px-2">
            <p className="text-xs sm:text-sm text-neutral-300 font-mono font-medium tracking-wide">
              © {new Date().getFullYear()} LEADJEN MEDIA. All rights reserved. Registered Digital News Publisher.
            </p>
            <p className="text-[11px] sm:text-xs text-neutral-500 font-mono tracking-wider">
              Designed with Editorial Precision &amp; Fast Next.js Architecture.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
