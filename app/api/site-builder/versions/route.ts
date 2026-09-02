import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const versions = await prisma.siteBuilderVersion.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        versionName: true,
        description: true,
        publishedBy: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}
