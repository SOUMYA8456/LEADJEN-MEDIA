import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { getMediaUsages } from "@/lib/media-usage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type") || "ALL"; // ALL, IMAGES, VIDEOS, AUDIO
    const usageStatus = searchParams.get("usageStatus") || "ALL"; // ALL, IN_USE, UNUSED
    const sort = searchParams.get("sort") || "latest"; // latest, oldest, name
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "60", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { filename: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type === "IMAGES") {
      where.mimeType = { startsWith: "image/" };
    } else if (type === "VIDEOS") {
      where.mimeType = { startsWith: "video/" };
    } else if (type === "AUDIO") {
      where.mimeType = { startsWith: "audio/" };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "name") {
      orderBy = { originalName: "asc" };
    }

    const [mediaItems, totalCount] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    // Compute reverse usages for each media asset across all 8 models
    const mediaWithUsages = await Promise.all(
      mediaItems.map(async (m) => {
        const usages = await getMediaUsages(m.id, m.url, m.filename);

        // Sanitize url: Never expose multi-megabyte base64 strings in API responses!
        const publicUrl = m.url && m.url.startsWith("data:")
          ? `/api/media/${m.id}/file`
          : m.url;

        return {
          id: m.id,
          filename: m.filename,
          originalName: m.originalName,
          url: publicUrl,
          publicId: m.publicId,
          mimeType: m.mimeType,
          size: m.size,
          width: m.width,
          height: m.height,
          altText: m.altText,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          usages,
          usageCount: usages.length,
          inUse: usages.length > 0,
        };
      })
    );

    // Filter by usage status if requested
    let filteredMedia = mediaWithUsages;
    if (usageStatus === "IN_USE") {
      filteredMedia = mediaWithUsages.filter((m) => m.inUse);
    } else if (usageStatus === "UNUSED") {
      filteredMedia = mediaWithUsages.filter((m) => !m.inUse);
    }

    return NextResponse.json({
      media: filteredMedia,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json({ error: "Failed to fetch media assets" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized access. Staff permission required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    let idsToDelete: string[] = [];

    // Check if bulk deletion requested via request body
    if (!id && req.headers.get("content-type")?.includes("application/json")) {
      try {
        const body = await req.json();
        if (Array.isArray(body.ids)) {
          idsToDelete = body.ids;
        }
      } catch {}
    } else if (id) {
      idsToDelete = [id];
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: "At least one Media ID is required" }, { status: 400 });
    }

    const existingItems = await prisma.media.findMany({
      where: { id: { in: idsToDelete } },
    });

    if (existingItems.length === 0) {
      return NextResponse.json({ error: "Media items not found" }, { status: 404 });
    }

    // Verify reverse references for all items if force is not set
    if (!force) {
      const blockedItems: { id: string; name: string; usages: any[] }[] = [];

      for (const item of existingItems) {
        const usages = await getMediaUsages(item.id, item.url, item.filename);
        if (usages.length > 0) {
          blockedItems.push({
            id: item.id,
            name: item.originalName,
            usages,
          });
        }
      }

      if (blockedItems.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete ${blockedItems.length} media asset(s) because they are actively in use. Replace or detach their references first to avoid broken content.`,
            blockedItems,
            requiresForce: true,
          },
          { status: 409 }
        );
      }
    }

    // Execute atomic deletion
    await prisma.media.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    // Write audit logs
    for (const item of existingItems) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action: "MEDIA_DELETED",
            entityType: "MEDIA",
            entityId: item.id,
            entityTitle: item.originalName,
            details: JSON.stringify({ filename: item.filename, forced: force }),
          },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${existingItems.length} media asset(s)`,
      deletedCount: existingItems.length,
    });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Failed to delete media asset" }, { status: 500 });
  }
}
