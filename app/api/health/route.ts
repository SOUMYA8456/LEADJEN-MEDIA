import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "ok";
  let dbLatencyMs = 0;
  let errorDetail: string | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err: any) {
    dbStatus = "error";
    errorDetail = "Database query check failed";
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const storageProvider = cloudName ? "cloudinary_signed" : "permanent_postgres";

  const isHealthy = dbStatus === "ok";
  const overallLatency = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      checks: {
        application: {
          status: "ok",
          version: "1.0.0",
          nodeEnv: process.env.NODE_ENV || "development",
        },
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          error: errorDetail,
        },
        storage: {
          status: "ok",
          provider: storageProvider,
          maxUploadBytes: 10 * 1024 * 1024,
        },
        realtime: {
          status: "ok",
          protocol: "Server-Sent Events (SSE)",
          endpoint: "/api/realtime/stream",
        },
      },
      responseTimeMs: overallLatency,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
