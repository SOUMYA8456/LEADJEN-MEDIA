import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.editorialNotification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { targetRole: user.role },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, markAllAsRead } = await req.json();

    if (markAllAsRead) {
      await prisma.editorialNotification.updateMany({
        where: {
          OR: [
            { userId: user.id },
            { targetRole: user.role },
          ],
          isRead: false,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (id) {
      await prisma.editorialNotification.update({
        where: { id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "ID or markAllAsRead required" }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
