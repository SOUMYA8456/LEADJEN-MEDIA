import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    // Check if viewed within last 1 hour by same IP to prevent view spam
    const recentView = await prisma.articleView.findFirst({
      where: {
        articleId: params.id,
        ipHash: ip,
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60), // 1 hr
        },
      },
    });

    if (!recentView) {
      await Promise.all([
        prisma.article.update({
          where: { id: params.id },
          data: { viewCount: { increment: 1 } },
        }),
        prisma.articleView.create({
          data: {
            articleId: params.id,
            ipHash: ip,
            userAgent: userAgent.slice(0, 200),
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
