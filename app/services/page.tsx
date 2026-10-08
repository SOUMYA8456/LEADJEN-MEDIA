import React from "react";
import prisma from "@/lib/db";
import { DEFAULT_SERVICES, DEFAULT_SITE_BUILDER_CONFIG, ServiceItemConfig, SiteBuilderConfig } from "@/lib/site-builder-defaults";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Megaphone,
  CheckCircle2,
  Briefcase,
  Layers,
  Globe,
  Radio,
  Video,
  Camera,
  Mic,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Creative & Enterprise Services | LEADJEN MEDIA",
  description:
    "Explore Leadjen Media's full suite of commercial and creative services: Digital Marketing, Media House, Podcasting, Editorial Press, Personal Branding, Videography, and PR.",
};

export default async function ServicesHubPage() {
  let services: ServiceItemConfig[] = DEFAULT_SERVICES;

  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settings?.siteConfigJson) {
      const parsed: SiteBuilderConfig = JSON.parse(settings.siteConfigJson);
      if (parsed.services?.items && parsed.services.items.length > 0) {
        services = parsed.services.items;
      }
    }
  } catch {}

  const activeServices = services
    .filter((s) => s.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-[#1E1B1A] selection:text-white">
      {/* Hero */}
      <section className="bg-[#1E1B1A] text-white py-16 sm:py-24 border-b border-neutral-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-neutral-800 border border-neutral-700 text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>ENTERPRISE &amp; CREATIVE CAPABILITIES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Leadjen Media Creative &amp; Digital Enterprise Services
          </h1>

          <p className="text-base sm:text-xl font-sans text-neutral-300 max-w-2xl mx-auto font-light">
            Empowering brands, leaders, and institutions with premier digital storytelling, media production, and marketing intelligence.
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
              href="/about"
              className="px-6 py-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center gap-2"
            >
              <span>About Leadjen Media</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
            OUR PORTFOLIO
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black">
            Complete Media &amp; Strategy Solutions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-sans">
            Every service is powered by the production standards, reach, and journalistic excellence of Leadjen Media.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeServices.map((service, idx) => (
            <Link
              key={service.id || idx}
              href={service.url || `/services/${service.slug}`}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 group shadow-xs hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {service.badge || "SERVICE"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition" />
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold text-black dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                    {service.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                  {service.description}
                </p>

                {service.features && service.features.length > 0 && (
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                    {service.features.slice(0, 3).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs font-sans text-neutral-600 dark:text-neutral-300">
                        <CheckCircle2 className="w-3 h-3 text-black dark:text-white flex-shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white group-hover:underline flex items-center gap-1">
                  <span>Explore Service</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
