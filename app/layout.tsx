import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { LeaderboardAd } from "@/components/ads/AdBanner";
import { Header } from "@/components/news/Header";
import { Footer } from "@/components/layout/Footer";
import prisma from "@/lib/db";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LEADJEN MEDIA | Independent Journalism. Important Stories.",
  description:
    "Leading digital news publishing platform covering India, world affairs, politics, business, technology, sports, health, and science.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
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
  const now = new Date();
  try {
    topAd = await prisma.advertisement.findFirst({
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
    });
  } catch (e) {
    // Graceful fallback if database warming
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjen-media-news.vercel.app";

  // JSON-LD News Organization Structured Data
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "LEADJEN MEDIA",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
    },
    slogan: "Independent Journalism. Important Stories.",
    sameAs: [
      "https://x.com/leadjenmedia",
      "https://linkedin.com/company/leadjenmedia",
      "https://facebook.com/leadjenmedia",
    ],
  };

  // JSON-LD WebSite Structured Data with SearchAction
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LEADJEN MEDIA",
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
        <ThemeProvider>
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
