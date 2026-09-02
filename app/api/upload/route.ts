import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import prisma from "@/lib/db";
import { validateImageFile, uploadMedia } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR" && user.role !== "REPORTER")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "No file or invalid form-data provided" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Validate File
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Centralized Media Upload
    const { url, publicId } = await uploadMedia(buffer, file.name, file.type);

    // 4. Create Media record in PostgreSQL
    const altText = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        originalName: file.name,
        url,
        publicId,
        mimeType: file.type,
        size: file.size,
        altText,
      },
    });

    // 5. Audit Log Entry
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "MEDIA_UPLOADED",
          entityType: "MEDIA",
          entityId: media.id,
          entityTitle: file.name,
          details: JSON.stringify({ size: file.size, mimeType: file.type }),
        },
      });
    } catch (auditErr) {
      console.warn("Could not write audit log for media upload:", auditErr);
    }

    return NextResponse.json({
      success: true,
      url,
      media,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
