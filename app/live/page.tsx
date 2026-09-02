import React from "react";
import prisma from "@/lib/db";
import type { Metadata } from "next";
import { LiveDeskStream } from "@/components/news/LiveDeskStream";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LIVE News Coverage & Developing Stories | LEADJEN MEDIA",
  description: "Real-time live news updates, breaking reports, minute-by-minute coverage from Leadjen Media correspondents.",
};

export default async function LiveNewsPage() {
  const [activeCoverage, liveUpdates] = await Promise.all([
    prisma.liveCoverage.findFirst({
      where: { status: { in: ["LIVE", "PAUSED", "UPCOMING"] } },
      orderBy: { startedAt: "desc" },
    }),
    prisma.liveUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <LiveDeskStream
      initialCoverage={activeCoverage as any}
      initialUpdates={liveUpdates as any}
    />
  );
}
