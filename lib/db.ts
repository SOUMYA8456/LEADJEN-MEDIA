import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Server-side scheduling promotion:
 * Promotes all SCHEDULED articles whose scheduledAt <= now to PUBLISHED status.
 */
export async function syncScheduledArticles() {
  try {
    const now = new Date();
    const readyArticles = await prisma.article.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        category: true,
      },
    });

    if (readyArticles.length > 0) {
      await prisma.article.updateMany({
        where: {
          id: { in: readyArticles.map((a) => a.id) },
        },
        data: {
          status: "PUBLISHED",
          publishedAt: now,
        },
      });

      // Lazy import broadcast to prevent circular dependency
      try {
        const { broadcastRealtimeEvent } = await import("@/lib/realtime");
        readyArticles.forEach((art) => {
          broadcastRealtimeEvent("ARTICLE_PUBLISHED", {
            id: art.id,
            title: art.title,
            slug: art.slug,
            category: art.category.slug,
          });
        });
        broadcastRealtimeEvent("HOMEPAGE_SYNC", {
          action: "SCHEDULED_PROMOTED",
          count: readyArticles.length,
        });
      } catch {}
    }
  } catch (error) {
    console.error("Error syncing scheduled articles:", error);
  }
}

export default prisma;

