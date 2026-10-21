import React from "react";
import prisma from "@/lib/db";
import Link from "next/link";
import {
  Globe,
  Shield,
  Award,
  Users,
  Target,
  ArrowRight,
  ChevronRight,
  Megaphone,
  CheckCircle2,
  BookOpen,
  Eye,
  Scale,
  CheckCircle,
  Twitter,
  Linkedin,
  Mail,
  Quote,
  Sparkles,
  ArrowUpRight,
  Radio,
} from "lucide-react";
import type { Metadata } from "next";
import { getAboutPageData } from "@/lib/about-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjenmediadaily.com";
  const { settings } = await getAboutPageData(false);

  return {
    title: `${settings.heroHeading} | Leadership, Newsroom Charter & Editorial Mission`,
    description: settings.heroSubtitle || settings.introduction.slice(0, 160),
    alternates: {
      canonical: `${siteUrl}/about`,
    },
    openGraph: {
      title: `${settings.heroHeading} — Leadjen Media Daily`,
      description: settings.heroSubtitle || settings.introduction.slice(0, 160),
      url: `${siteUrl}/about`,
      siteName: "LEADJEN MEDIA",
      images: [
        {
          url: settings.ceoPhoto && !settings.ceoPhoto.startsWith("data:")
            ? settings.ceoPhoto
            : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
          width: 1200,
          height: 630,
          alt: "About Leadjen Media News",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.heroHeading} — Leadjen Media Daily`,
      description: settings.heroSubtitle || settings.introduction.slice(0, 160),
      images: [
        settings.ceoPhoto && !settings.ceoPhoto.startsWith("data:")
          ? settings.ceoPhoto
          : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  };
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams?: { preview?: string };
}) {
  const isPreview = searchParams?.preview === "true" || searchParams?.preview === "draft";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjenmediadaily.com";

  // Fetch settings and team members (including drafts if preview=true)
  const [{ settings, teamMembers }, categories] = await Promise.all([
    getAboutPageData(isPreview),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      take: 12,
    }).catch(() => []),
  ]);

  // Value icon mapping helper
  const getValueIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case "shield":
        return <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "eye":
        return <Eye className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "scale":
        return <Scale className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
  };

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "NewsMediaOrganization",
      name: "LEADJEN MEDIA",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description: settings.introduction,
      founder: {
        "@type": "Person",
        name: settings.ceoName,
        jobTitle: settings.ceoDesignation,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <div className="min-h-screen bg-[#FFF8E7] dark:bg-neutral-950 text-[#241A1A] dark:text-neutral-100 selection:bg-[#4A0B1C] selection:text-white font-sans">
        {/* Admin Preview Mode Floating Notice */}
        {isPreview && (
          <div className="sticky top-0 z-50 bg-amber-500 text-black py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>PREVIEW MODE: Showing both Published and Draft editorial profiles</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/about"
                className="underline hover:text-white"
              >
                Open Admin Manager →
              </Link>
              <Link
                href="/about"
                className="px-2.5 py-1 bg-black text-white rounded text-[10px] uppercase font-bold"
              >
                Exit Preview
              </Link>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* SECTION A: HERO                                                         */}
        {/* ======================================================================= */}
        <section className="bg-[#4A0B1C] text-white py-16 sm:py-24 border-b border-[#60152B] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-[#60152B] border border-[#7A2038] text-[#F4DDE3]">
              <Globe className="w-3.5 h-3.5 text-[#B42332]" />
              <span>EDITORIAL CHARTER &amp; NEWSROOM LEADERSHIP</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.1] max-w-4xl mx-auto uppercase">
              {settings.heroHeading}
            </h1>

            <p className="text-base sm:text-2xl font-serif text-[#F4DDE3] max-w-3xl mx-auto font-medium leading-snug">
              {settings.heroSubtitle}
            </p>

            <p className="text-sm sm:text-base font-sans text-[#F4DDE3]/85 max-w-3xl mx-auto leading-relaxed font-light">
              {settings.introduction}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="#leadership"
                className="px-6 sm:px-8 py-3 rounded-xl bg-white text-[#4A0B1C] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#F7EEDB] transition shadow-lg flex items-center gap-2"
              >
                <span>Meet Our Leadership</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="#team"
                className="px-6 py-3 rounded-xl bg-[#60152B] border border-[rgba(255,255,255,0.2)] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#7A2038] transition flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-[#F4DDE3]" />
                <span>Editorial Team</span>
              </Link>

              <Link
                href="/contact"
                className="px-6 py-3 rounded-xl bg-[#60152B] border border-[rgba(255,255,255,0.2)] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#7A2038] transition flex items-center gap-2"
              >
                <span>Contact Newsroom</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION B: CEO & DIRECTOR PROFILE (MEET OUR LEADERSHIP)                 */}
        {/* ======================================================================= */}
        <section id="leadership" className="py-16 sm:py-24 border-b border-[#E8DCCB] dark:border-neutral-800 bg-[#FFF8E7] dark:bg-neutral-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#6B1024] dark:text-red-400">
                EXECUTIVE DIRECTION
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#241A1A] dark:text-neutral-100">
                Meet Our Leadership
              </h2>
              <p className="text-xs sm:text-sm text-[#665858] dark:text-neutral-400 font-mono uppercase tracking-wider">
                CEO &amp; DIRECTOR
              </p>
            </div>

            {/* Premium Two-Column Layout */}
            <div className="bg-[#FFFCF5] dark:bg-neutral-900/60 rounded-3xl border border-[#E8DCCB] dark:border-neutral-800 p-6 sm:p-10 lg:p-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Side: Large Professional CEO Portrait */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-[#E8DCCB] dark:border-neutral-700 bg-[#F7EEDB] dark:bg-neutral-800">
                    <img
                      src={
                        settings.ceoPhoto ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={settings.ceoName}
                      className="w-full h-full object-cover object-top"
                    />

                    {/* Demo badge if default placeholder */}
                    {(!settings.ceoPhoto || settings.ceoName === "CEO & Director") && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-xs text-[10px] font-mono text-amber-400 font-bold tracking-wider uppercase border border-amber-400/30">
                        Demo Portrait • Editable
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#665858] mt-2">
                    Leadjen Media Executive Direction
                  </span>
                </div>

                {/* Right Side: CEO Name, Designation, Bio & Leadership Message */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-[#F7EEDB] dark:bg-neutral-800 text-[#4A0B1C] dark:text-neutral-300 inline-block mb-3">
                      {settings.ceoDesignation}
                    </span>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-[#241A1A] dark:text-neutral-100">
                      {settings.ceoName}
                    </h3>
                  </div>

                  {/* Biography */}
                  <div className="text-sm sm:text-base text-[#665858] dark:text-neutral-300 font-sans leading-relaxed space-y-3">
                    <p>{settings.ceoBio}</p>
                  </div>

                  {/* Leadership Quote Message */}
                  {settings.ceoMessage && (
                    <div className="relative p-6 sm:p-7 rounded-2xl bg-[#FFF8E7] dark:bg-neutral-950 border-l-4 border-l-[#4A0B1C] dark:border-l-white border border-[#E8DCCB] dark:border-neutral-800 shadow-xs space-y-2">
                      <Quote className="w-6 h-6 text-[#6B1024]/40 dark:text-neutral-700 mb-1" />
                      <p className="font-serif italic text-base sm:text-lg text-[#241A1A] dark:text-neutral-100 leading-relaxed">
                        &ldquo;{settings.ceoMessage}&rdquo;
                      </p>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#665858] block pt-1">
                        — Leadership Statement • Leadjen Media Daily
                      </span>
                    </div>
                  )}

                  {/* Optional Professional Social Media Links */}
                  {(settings.ceoTwitter || settings.ceoLinkedin || settings.ceoEmail) && (
                    <div className="pt-2 flex items-center gap-3">
                      <span className="text-xs font-mono uppercase text-[#665858] mr-1">
                        Connect:
                      </span>
                      {settings.ceoLinkedin && (
                        <a
                          href={settings.ceoLinkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-[#F7EEDB] dark:bg-neutral-800 border border-[#E8DCCB] dark:border-neutral-700 text-[#4A0B1C] dark:text-neutral-300 hover:text-[#6B1024] dark:hover:text-white hover:border-[#4A0B1C] dark:hover:border-white transition"
                          aria-label="CEO LinkedIn"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {settings.ceoTwitter && (
                        <a
                          href={settings.ceoTwitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-[#F7EEDB] dark:bg-neutral-800 border border-[#E8DCCB] dark:border-neutral-700 text-[#4A0B1C] dark:text-neutral-300 hover:text-[#6B1024] dark:hover:text-white hover:border-[#4A0B1C] dark:hover:border-white transition"
                          aria-label="CEO Twitter"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {settings.ceoEmail && (
                        <a
                          href={`mailto:${settings.ceoEmail}`}
                          className="p-2.5 rounded-xl bg-[#F7EEDB] dark:bg-neutral-800 border border-[#E8DCCB] dark:border-neutral-700 text-[#4A0B1C] dark:text-neutral-300 hover:text-[#6B1024] dark:hover:text-white hover:border-[#4A0B1C] dark:hover:border-white transition"
                          aria-label="CEO Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION C: MEET OUR TEAM (EMPLOYEE PROFILES)                            */}
        {/* ======================================================================= */}
        <section id="team" className="py-16 sm:py-24 border-b border-[#E8DCCB] dark:border-neutral-800 bg-[#F7EEDB] dark:bg-neutral-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#6B1024] dark:text-red-400">
                NEWSROOM EXCELLENCE
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#241A1A] dark:text-neutral-100">
                Meet Our Team
              </h2>
              <p className="text-xs sm:text-sm text-[#665858] dark:text-neutral-400 font-sans leading-relaxed">
                The journalists, investigative correspondents, video producers, and digital editors driving authoritative dispatches across our bureaus.
              </p>
            </div>

            {/* Responsive Card Grid: 4 Desktop, 2 Tablet, 1 Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-[#FFFCF5] dark:bg-neutral-900 rounded-2xl border border-[#E8DCCB] dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Consistent Aspect Ratio Photograph with Crop & Subtle Hover */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7EEDB] dark:bg-neutral-800">
                      <img
                        src={
                          member.photo ||
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Demo Profile Badge */}
                      {member.isDemo && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[9px] font-mono text-amber-400 font-bold tracking-wider uppercase border border-amber-400/30">
                          Demo Profile
                        </div>
                      )}

                      {member.status === "DRAFT" && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-mono font-bold tracking-wider uppercase">
                          Draft
                        </div>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B42332] dark:text-red-400 block line-clamp-1">
                        {member.designation}
                      </span>

                      <h4 className="font-serif font-black text-lg text-[#241A1A] dark:text-neutral-100 leading-snug">
                        {member.name}
                      </h4>

                      <p className="text-xs text-[#665858] dark:text-neutral-400 font-sans line-clamp-3 leading-relaxed pt-1">
                        {member.bio || "Staff journalist covering national policy, economy, and investigative reports."}
                      </p>
                    </div>
                  </div>

                  {/* Social / Contact Links Footer */}
                  <div className="px-5 py-3.5 border-t border-[#E8DCCB] dark:border-neutral-800 flex items-center justify-between text-[#665858]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#665858]">
                      Editorial Desk
                    </span>
                    <div className="flex items-center gap-2">
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#4A0B1C] dark:hover:text-white transition"
                          aria-label={`${member.name} on X`}
                        >
                          <Twitter className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#4A0B1C] dark:hover:text-white transition"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:text-[#4A0B1C] dark:hover:text-white transition"
                          aria-label={`Email ${member.name}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION D: OUR MISSION & VISION                                         */}
        {/* ======================================================================= */}
        <section className="py-16 sm:py-24 border-b border-[#E8DCCB] dark:border-neutral-800 bg-[#FFF8E7] dark:bg-neutral-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Mission Card */}
              <div className="p-8 sm:p-10 bg-[#FFFCF5] dark:bg-neutral-900 rounded-3xl border border-[#E8DCCB] dark:border-neutral-800 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#4A0B1C] text-white flex items-center justify-center font-bold">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6B1024] dark:text-red-400">
                    OUR CHARTER
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#241A1A] dark:text-neutral-100">
                    {settings.missionTitle}
                  </h3>
                  <p className="text-sm sm:text-base text-[#665858] dark:text-neutral-300 font-sans leading-relaxed">
                    {settings.missionText}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E8DCCB] dark:border-neutral-800 text-xs font-mono text-[#665858]">
                  Ethical Journalism • Source Verification • Accountability
                </div>
              </div>

              {/* Vision Card */}
              <div className="p-8 sm:p-10 bg-[#FFFCF5] dark:bg-neutral-900 rounded-3xl border border-[#E8DCCB] dark:border-neutral-800 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#4A0B1C] text-white flex items-center justify-center font-bold">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6B1024] dark:text-red-400">
                    FUTURE FORWARD
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#241A1A] dark:text-neutral-100">
                    {settings.visionTitle}
                  </h3>
                  <p className="text-sm sm:text-base text-[#665858] dark:text-neutral-300 font-sans leading-relaxed">
                    {settings.visionText}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E8DCCB] dark:border-neutral-800 text-xs font-mono text-[#665858]">
                  Multimedia Innovation • National Scope • Global Perspective
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION E: OUR EDITORIAL VALUES                                         */}
        {/* ======================================================================= */}
        <section className="py-16 sm:py-24 border-b border-[#E8DCCB] dark:border-neutral-800 bg-[#F7EEDB] dark:bg-neutral-900/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#6B1024] dark:text-red-400">
                STANDARDS &amp; ETHICS
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#241A1A] dark:text-neutral-100">
                {settings.valuesTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#665858] font-sans">
                The institutional pillars guiding every story, investigation, and analysis published by Leadjen Media.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(settings.values || []).map((val, idx) => (
                <div
                  key={val.id || idx}
                  className="p-6 bg-[#FFFCF5] dark:bg-neutral-900 rounded-2xl border border-[#E8DCCB] dark:border-neutral-800 space-y-3 shadow-xs hover:border-[#4A0B1C] dark:hover:border-white transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F7EEDB] dark:bg-neutral-800 text-[#4A0B1C] flex items-center justify-center">
                    {getValueIcon(val.icon || val.title)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#665858]">
                      Pillar 0{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-lg font-serif font-bold text-[#241A1A] dark:text-neutral-100 group-hover:text-[#6B1024] dark:group-hover:text-red-400 transition">
                    {val.title}
                  </h4>
                  <p className="text-xs text-[#665858] dark:text-neutral-400 font-sans leading-relaxed">
                    {val.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION F: WHAT WE COVER (REAL CATEGORIES)                              */}
        {/* ======================================================================= */}
        {categories.length > 0 && (
          <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#6B1024] dark:text-red-400">
                EDITORIAL BEATS
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#241A1A] dark:text-neutral-100">
                {settings.coverageTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#665858] font-sans">
                {settings.coverageText}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className="p-5 bg-[#FFFCF5] dark:bg-neutral-900 border border-[#E8DCCB] dark:border-neutral-800 hover:border-[#4A0B1C] dark:hover:border-white rounded-2xl flex flex-col justify-between transition group shadow-xs hover:shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="w-2 h-2 rounded-full bg-[#B42332]" />
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#665858] group-hover:text-[#4A0B1C] dark:group-hover:text-white transition" />
                    </div>
                    <h4 className="font-serif font-bold text-base text-[#241A1A] dark:text-neutral-100 group-hover:text-[#6B1024] dark:group-hover:text-red-400 transition">
                      {cat.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#665858] pt-2 block">
                    Explore Wire →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* SECTION G: ENTERPRISE & AGENCY PATHWAY                                   */}
        {/* ======================================================================= */}
        <section className="bg-[#4A0B1C] text-white py-12 border-t border-[#60152B]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F4DDE3]">
                COMMERCIAL &amp; GROWTH SOLUTIONS
              </span>
              <h4 className="font-serif font-bold text-lg text-white">
                Looking for Leadjen Media Digital Marketing Agency?
              </h4>
              <p className="text-xs text-[#F4DDE3]/90 font-sans max-w-xl">
                Our specialized commercial agency powers enterprise growth, programmatic advertising, brand positioning, and digital strategy.
              </p>
            </div>

            <a
              href="https://leadjenmedia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white text-[#4A0B1C] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#F7EEDB] transition shrink-0 flex items-center gap-2 shadow-sm"
            >
              <span>Visit Agency Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
