import React from "react";
import prisma from "@/lib/db";
import { DEFAULT_ADVERTISING_CONFIG, AdvertisingPageConfig, DEFAULT_SITE_BUILDER_CONFIG, SiteBuilderConfig } from "@/lib/site-builder-defaults";
import { InquiryForm } from "@/components/forms/InquiryForm";
import Link from "next/link";
import {
  Megaphone,
  TrendingUp,
  Users,
  Eye,
  Award,
  Download,
  Mail,
  Phone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  FileText,
  Video,
  Monitor,
  LayoutTemplate,
  PieChart,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjenmediadaily.com";
  let adConfig: AdvertisingPageConfig = DEFAULT_ADVERTISING_CONFIG;

  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settings?.siteConfigJson) {
      const parsed: SiteBuilderConfig = JSON.parse(settings.siteConfigJson);
      if (parsed.advertising) adConfig = parsed.advertising;
    }
  } catch {}

  return {
    title: "Advertise With Leadjen Media Daily | Premium Digital News Advertising & Brand Partnerships",
    description:
      adConfig.heroDescription ||
      "Reach influential leaders, decision-makers, and high-net-worth audiences across India and global markets through Leadjen Media Daily's premier news publishing network.",
    alternates: { canonical: `${siteUrl}/advertise` },
    openGraph: {
      title: "Advertise With Leadjen Media Daily",
      description: adConfig.heroDescription,
      url: `${siteUrl}/advertise`,
      type: "website",
    },
  };
}

export default async function AdvertisePage() {
  let adConfig: AdvertisingPageConfig = DEFAULT_ADVERTISING_CONFIG;
  let siteName = "LEADJEN MEDIA DAILY";

  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settings?.siteConfigJson) {
      const parsed: SiteBuilderConfig = JSON.parse(settings.siteConfigJson);
      if (parsed.advertising) adConfig = parsed.advertising;
      if (parsed.global?.siteName) siteName = parsed.global.siteName;
    }
  } catch {}

  const activeSections = (adConfig.sections || DEFAULT_ADVERTISING_CONFIG.sections)
    .filter((s) => s.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const sectionTitles = activeSections.map((s) => s.title);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-[#1E1B1A] selection:text-white">
      {/* ======================================================================= */}
      {/* 1. HERO SECTION                                                        */}
      {/* ======================================================================= */}
      <section className="relative overflow-hidden bg-[#1E1B1A] text-white py-16 sm:py-24 border-b border-neutral-800">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-neutral-800/80 border border-neutral-700 text-neutral-300">
            <Megaphone className="w-3.5 h-3.5 text-red-500" />
            <span>COMMERCIAL ADVERTISING &amp; ENTERPRISE MEDIA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            {adConfig.heroHeading || "Amplify Your Brand With India's Most Authoritative Newsroom"}
          </h1>

          <p className="text-lg sm:text-xl font-sans text-neutral-300 max-w-2xl mx-auto font-light">
            {adConfig.heroSubheading || "High-impact digital advertising, brand sponsorships, and bespoke editorial partnerships."}
          </p>

          <p className="text-sm sm:text-base font-sans text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            {adConfig.heroDescription}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#inquiry-form"
              className="px-8 py-3.5 rounded-xl bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition shadow-xl flex items-center gap-2"
            >
              <span>{adConfig.ctaText || "Request Rate Card & Media Kit"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {adConfig.downloadKitUrl ? (
              <a
                href={adConfig.downloadKitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Media Kit (PDF)</span>
              </a>
            ) : (
              <a
                href="#inquiry-form"
                className="px-6 py-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Media Kit</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 2. AUDIENCE METRICS & REACH BENCHMARKS                                  */}
      {/* ======================================================================= */}
      <section className="py-12 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
              AUDIENCE PROFILE &amp; REACH
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black">
              Connect With High-Intent Decision Makers
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-1 shadow-xs">
              <div className="text-3xl sm:text-4xl font-serif font-black text-black dark:text-white">
                3.8M+
              </div>
              <div className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
                Monthly Pageviews
              </div>
              <p className="text-[11px] text-neutral-400 font-sans pt-1">
                Across digital desktop, AMP, &amp; mobile web
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-1 shadow-xs">
              <div className="text-3xl sm:text-4xl font-serif font-black text-red-600 dark:text-red-500">
                74%
              </div>
              <div className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
                Tier-1 Metro Readership
              </div>
              <p className="text-[11px] text-neutral-400 font-sans pt-1">
                Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-1 shadow-xs">
              <div className="text-3xl sm:text-4xl font-serif font-black text-black dark:text-white">
                4m 12s
              </div>
              <div className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
                Avg Session Engagement
              </div>
              <p className="text-[11px] text-neutral-400 font-sans pt-1">
                3.2x higher dwell time than industry averages
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-1 shadow-xs">
              <div className="text-3xl sm:text-4xl font-serif font-black text-black dark:text-white">
                82%
              </div>
              <div className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
                CXO &amp; Professional Audience
              </div>
              <p className="text-[11px] text-neutral-400 font-sans pt-1">
                Founders, executives, policymakers, investors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 3. ALL 9 ADVERTISING SECTIONS & FORMATS                                */}
      {/* ======================================================================= */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
            COMPREHENSIVE ADVERTISING SUITE
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight">
            Premium Ad Units &amp; Editorial Placements
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
            Choose from highly-visible display inventory, premium category takeovers, or native sponsored journalism crafted by our enterprise studio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {activeSections.map((section, idx) => (
            <div
              key={section.id || idx}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 group shadow-xs hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {section.placementTag || `FORMAT 0${idx + 1}`}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 font-semibold">
                    #0{idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold text-black dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                    {section.title}
                  </h3>
                  <p className="text-xs font-mono text-neutral-500 mt-1">
                    {section.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                  {section.description}
                </p>

                {section.specs && (
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl text-xs font-mono text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
                    <span className="font-bold text-black dark:text-white">Specs: </span>
                    {section.specs}
                  </div>
                )}

                {section.features && section.features.length > 0 && (
                  <ul className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    {section.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs font-sans text-neutral-600 dark:text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                {section.pricingNote && (
                  <p className="text-[11px] font-mono text-neutral-500">
                    {section.pricingNote}
                  </p>
                )}
                <a
                  href="#inquiry-form"
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-black hover:text-white dark:bg-neutral-800 dark:hover:bg-white dark:hover:text-black text-neutral-800 dark:text-neutral-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <span>Book Placement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 4. EDITORIAL COMPLIANCE & QUALITY GUARANTEES                           */}
      {/* ======================================================================= */}
      <section className="py-16 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold">Editorial Integrity</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                All sponsored journalism is transparently labeled in compliance with global press council and digital advertising ethics standards.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold">Audited Analytics</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Receive weekly impression reports, CTR transparency, and conversion telemetry verified via privacy-compliant analytics infrastructure.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold">Rapid Turnaround</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Standard display campaigns deploy within 24 hours of creative approval. Custom sponsored editorial publishes within 3–5 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 5. INTERACTIVE INQUIRY FORM                                            */}
      {/* ======================================================================= */}
      <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <InquiryForm
          defaultType="ADVERTISING"
          advertisingOptions={sectionTitles}
          heading="Advertise With Leadjen Media Daily"
          subheading="Fill out the campaign requirements below to request our confidential media kit, rate card, and custom proposal."
        />
      </section>

      {/* ======================================================================= */}
      {/* 6. DIRECT SALES CONTACT DESK                                            */}
      {/* ======================================================================= */}
      <section className="py-12 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h3 className="text-lg font-serif font-bold">
            Prefer Direct Commercial Communication?
          </h3>
          <p className="text-xs text-neutral-500 font-sans">
            Our corporate advertising and media partnerships bureau is available Monday – Friday, 9:00 AM – 7:00 PM IST.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            <a
              href={`mailto:${adConfig.contactEmail || "advertise@leadjenmediadaily.com"}`}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-black dark:text-white hover:underline"
            >
              <Mail className="w-4 h-4 text-red-600" />
              <span>{adConfig.contactEmail || "advertise@leadjenmediadaily.com"}</span>
            </a>

            {adConfig.contactPhone && (
              <a
                href={`tel:${adConfig.contactPhone}`}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-black dark:text-white hover:underline"
              >
                <Phone className="w-4 h-4 text-red-600" />
                <span>{adConfig.contactPhone}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
