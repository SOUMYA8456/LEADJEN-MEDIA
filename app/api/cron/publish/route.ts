import { NextRequest, NextResponse } from "next/server";
import { syncScheduledArticles } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await syncScheduledArticles();

    // Invalidate caches to refresh public pages
    try {
      revalidatePath("/");
      revalidatePath("/search");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Scheduled articles promotion check completed.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to run scheduled publish job" }, { status: 500 });
  }
}
