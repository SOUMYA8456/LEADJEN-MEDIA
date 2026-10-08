import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { LeaderboardAd } from "@/components/ads/AdBanner";
import { Header } from "@/components/news/Header";
import { Footer } from "@/components/layout/Footer";
import prisma from "@/lib/db";
import { DEFAULT_SITE_BUILDER_CONFIG, generateThemeCss, SiteBuilderConfig } from "@/lib/site-builder-defaults";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LEADJEN MEDIA | Independent Journalism. Important Stories.",
  description:
    "Leading digital news publishing platform covering India, world affairs, politics, business, technology, sports, health, and science.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://leadjenmediadaily.com"),
  openGraph: {
    title: "LEADJEN MEDIA — Independent Journalism. Important Stories.",
    description:
      "Authoritative reporting on breaking national events, technology, geopolitics, and global financial markets.",
    siteName: "LEADJEN MEDIA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LEADJEN MEDIA",
    description: "Independent Journalism. Important Stories.",
    creator: "@leadjenmedia",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch top leaderboard advertisement from PostgreSQL with priority and auto-expiry
  let topAd = null;
  let siteConfig: SiteBuilderConfig = DEFAULT_SITE_BUILDER_CONFIG;
  const now = new Date();
  try {
    const [adResult, settingsResult] = await Promise.all([
      prisma.advertisement.findFirst({
        where: {
          location: "TOP_LEADERBOARD",
          isActive: true,
          status: "ACTIVE",
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
        orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      }),
      prisma.siteSettings.findUnique({
        where: { id: "default" },
      }),
    ]);
    topAd = adResult;
    if (settingsResult?.siteConfigJson) {
      try {
        siteConfig = { ...DEFAULT_SITE_BUILDER_CONFIG, ...JSON.parse(settingsResult.siteConfigJson) };
      } catch {}
    }
  } catch (e) {
    // Graceful fallback if database warming
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjenmediadaily.com";
  const themeCss = generateThemeCss(siteConfig);

  // JSON-LD News Organization Structured Data
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: siteConfig.global?.siteName || "LEADJEN MEDIA",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
    },
    slogan: siteConfig.global?.tagline || "Independent Journalism. Important Stories.",
    sameAs: [
      siteConfig.global?.socialLinks?.twitter || "https://x.com/leadjenmedia",
      siteConfig.global?.socialLinks?.linkedin || "https://linkedin.com/company/leadjenmedia",
      siteConfig.global?.socialLinks?.facebook || "https://facebook.com/leadjenmedia",
    ],
  };

  // JSON-LD WebSite Structured Data with SearchAction
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.global?.siteName || "LEADJEN MEDIA",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style id="leadjen-theme-vars" dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} min-h-screen flex flex-col antialiased selection:bg-[#1E1B1A] selection:text-white dark:selection:bg-white dark:selection:text-black`}>
        <ThemeProvider initialConfig={siteConfig}>
          {/* Top Leaderboard Ad */}
          <LeaderboardAd ad={topAd} />

          {/* Sticky Editorial Header */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-1 w-full">{children}</main>

          {/* Editorial 5-Column Footer */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
