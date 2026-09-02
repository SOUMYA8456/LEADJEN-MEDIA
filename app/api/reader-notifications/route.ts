import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.userNotification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.userNotification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/reader-notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.userNotification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (notificationId) {
      await prisma.userNotification.updateMany({
        where: { id: notificationId, userId: user.id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/reader-notifications error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role === "REPORTER" || session.role === "READER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, message, type = "EDITORIAL", linkUrl, targetUserId } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    if (targetUserId) {
      const notif = await prisma.userNotification.create({
        data: {
          userId: targetUserId,
          title,
          message,
          type,
          linkUrl,
        },
      });
      return NextResponse.json({ success: true, notification: notif });
    }

    // Broadcast to all readers
    const readers = await prisma.user.findMany({
      where: { role: "READER", status: "ACTIVE" },
      select: { id: true },
    });

    if (readers.length > 0) {
      await prisma.userNotification.createMany({
        data: readers.map((r) => ({
          userId: r.id,
          title,
          message,
          type,
          linkUrl,
        })),
      });
    }

    return NextResponse.json({ success: true, broadcastCount: readers.length });
  } catch (error) {
    console.error("POST /api/reader-notifications error:", error);
    return NextResponse.json({ error: "Failed to dispatch notification" }, { status: 500 });
  }
}
