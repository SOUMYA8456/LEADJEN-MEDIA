import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { DEFAULT_SERVICES, DEFAULT_SITE_BUILDER_CONFIG, ServiceItemConfig, SiteBuilderConfig } from "@/lib/site-builder-defaults";
import { InquiryForm } from "@/components/forms/InquiryForm";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Share2,
  Megaphone,
  Layers,
  ArrowLeft,
  Building,
  Video,
  Camera,
  Mic,
  TrendingUp,
  FileText,
  Users,
  Shield,
  HeartHandshake,
  Award,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getServicesConfig(): Promise<ServiceItemConfig[]> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settings?.siteConfigJson) {
      const parsed: SiteBuilderConfig = JSON.parse(settings.siteConfigJson);
      if (parsed.services?.items && parsed.services.items.length > 0) {
        return parsed.services.items;
      }
    }
  } catch {}
  return DEFAULT_SERVICES;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjenmediadaily.com";
  const services = await getServicesConfig();
  const service = services.find((s) => s.slug === params.slug);

  if (!service) {
    return { title: "Service Not Found | LEADJEN MEDIA" };
  }

  const pageUrl = `${siteUrl}/services/${service.slug}`;
  return {
    title: `${service.title} | Leadjen Media Creative & Enterprise Services`,
    description: service.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${service.title} — Leadjen Media`,
      description: service.description,
      url: pageUrl,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const services = await getServicesConfig();
  const service = services.find((s) => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  const otherServices = services.filter((s) => s.slug !== params.slug && s.isVisible !== false);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-[#1E1B1A] selection:text-white">
      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-mono text-neutral-500">
          <Link href="/" className="hover:text-black dark:hover:text-white">
            HOME
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link href="/services" className="hover:text-black dark:hover:text-white">
            SERVICES
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-black dark:text-white font-bold uppercase truncate">
            {service.title}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-[#1E1B1A] text-white py-14 sm:py-20 border-b border-neutral-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-neutral-800 border border-neutral-700 text-neutral-300">
              LEADJEN MEDIA SERVICES
            </span>
            {service.badge && (
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-red-600/20 text-red-400 border border-red-500/30">
                {service.badge}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.15]">
            {service.title}
          </h1>

          <p className="text-base sm:text-xl font-sans text-neutral-300 max-w-3xl leading-relaxed">
            {service.description}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <a
              href="#inquiry-form"
              className="px-8 py-3.5 rounded-xl bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition shadow-xl flex items-center gap-2"
            >
              <span>Request Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/advertise"
              className="px-6 py-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4 text-red-500" />
              <span>Advertising &amp; Media Kit</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content & Features Section */}
      <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Key Deliverables Grid */}
        {service.features && service.features.length > 0 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                CORE CAPABILITIES &amp; DELIVERABLES
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-white mt-1">
                What We Deliver
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {service.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-black dark:text-white">
                      {feature}
                    </h3>
                    <p className="text-xs text-neutral-500 font-sans mt-1">
                      Executed according to premier journalistic &amp; corporate production benchmarks.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In-depth Overview */}
        {service.longDescription && (
          <div className="space-y-6 bg-neutral-50 dark:bg-neutral-900/60 p-8 sm:p-12 rounded-3xl border border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
              EDITORIAL &amp; CREATIVE EXCELLENCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-white">
              Strategic Approach
            </h2>
            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300 font-sans">
              <p>{service.longDescription}</p>
            </div>
          </div>
        )}

        {/* Lead Inquiry Form */}
        <div className="pt-8">
          <InquiryForm
            defaultType="SERVICE"
            defaultService={service.title}
            heading={`Partner on ${service.title}`}
            subheading={`Discuss deliverables, timelines, and commercial proposals directly with the Leadjen Media ${service.title} desk.`}
          />
        </div>

        {/* Related / Other Leadjen Services */}
        {otherServices.length > 0 && (
          <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
                  EXPLORE OUR NETWORK
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-black dark:text-white mt-0.5">
                  Other Leadjen Media Services
                </h3>
              </div>
              <Link
                href="/services"
                className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherServices.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition block space-y-2 group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                      {item.badge || "SERVICE"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-black dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
