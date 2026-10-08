import React from "react";
import prisma from "@/lib/db";
import { DEFAULT_SERVICES, DEFAULT_SITE_BUILDER_CONFIG, ServiceItemConfig, SiteBuilderConfig } from "@/lib/site-builder-defaults";
import Link from "next/link";
import {
  Globe,
  Shield,
  Award,
  Users,
  Building,
  Target,
  ArrowRight,
  ChevronRight,
  Megaphone,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Leadjen Media | Independent Journalism, Impact & Media Enterprise",
  description:
    "Learn about Leadjen Media Daily's editorial charter, independent journalism principles, investigative reporting standards, leadership, and commercial agency divisions.",
};

export default async function AboutPage() {
  let services: ServiceItemConfig[] = DEFAULT_SERVICES;
  let siteName = "LEADJEN MEDIA";
  let tagline = "INDEPENDENT JOURNALISM • INSIGHT • IMPACT";

  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settings?.siteConfigJson) {
      const parsed: SiteBuilderConfig = JSON.parse(settings.siteConfigJson);
      if (parsed.services?.items && parsed.services.items.length > 0) {
        services = parsed.services.items;
      }
      if (parsed.global?.siteName) siteName = parsed.global.siteName;
      if (parsed.global?.tagline) tagline = parsed.global.tagline;
    }
  } catch {}

  const activeServices = services
    .filter((s) => s.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-[#1E1B1A] selection:text-white">
      {/* Hero Header */}
      <section className="bg-[#1E1B1A] text-white py-16 sm:py-24 border-b border-neutral-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-neutral-800 border border-neutral-700 text-neutral-300">
            <Globe className="w-3.5 h-3.5 text-red-500" />
            <span>EDITORIAL CHARTER &amp; ENTERPRISE OVERVIEW</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            About Leadjen Media
          </h1>

          <p className="text-base sm:text-xl font-sans text-neutral-300 max-w-2xl mx-auto font-light">
            {tagline}
          </p>

          <p className="text-sm sm:text-base font-sans text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Leadjen Media is an independent digital news publishing and media enterprise dedicated to authoritative journalism, investigative depth, cultural insight, and full-spectrum creative communications.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/advertise"
              className="px-8 py-3.5 rounded-xl bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition shadow-xl flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4 text-red-600" />
              <span>Advertise With Leadjen Media</span>
            </Link>

            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center gap-2"
            >
              <span>Contact Newsroom</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Pillars */}
      <section className="py-16 sm:py-20 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
              OUR MISSION &amp; STANDARDS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black">
              Built on Uncompromising Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-lg font-serif font-bold">Unflinching Independence</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                Our editorial reporting operates free from corporate or political bias, holding institutions accountable through verified multi-source reporting.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-lg font-serif font-bold">Clarity &amp; Context</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                Beyond breaking bulletins, we deliver comprehensive data journalism, expert analysis, and historical depth that make sense of a complex world.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-lg font-serif font-bold">Creative Media Excellence</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                We bridge high-end multimedia production, podcasting, personal branding, and digital strategy under one world-class creative house.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full Services Section */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
            ENTERPRISE CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight">
            Leadjen Media Services &amp; Ventures
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-sans">
            Explore our specialized media, production, and advisory divisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeServices.map((service, idx) => (
            <Link
              key={service.id || idx}
              href={service.url || `/services/${service.slug}`}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white rounded-3xl p-6 flex flex-col justify-between transition group shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    {service.badge || `SERVICE 0${idx + 1}`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition" />
                </div>
                <h3 className="text-lg font-serif font-bold text-black dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                  {service.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-black dark:text-white group-hover:underline">
                  Learn More
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
