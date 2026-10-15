import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized. Staff permissions required." }, { status: 401 });
    }

    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload: items array required" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.teamMember.update({
          where: { id: item.id },
          data: { order: Number(item.order) || 0 },
        })
      )
    );

    return NextResponse.json({ success: true, count: items.length });
  } catch (error: any) {
    console.error("[PUT /api/about/team/reorder] Error:", error);
    return NextResponse.json({ error: "Failed to reorder team members" }, { status: 500 });
  }
}
