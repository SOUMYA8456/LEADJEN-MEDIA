import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    });
    return NextResponse.json({ authors });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionFromRequest(req);
    if (!user || user.role === "REPORTER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, designation, bio, avatar, email, twitter, linkedin } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = slugify(name);
    const author = await prisma.author.create({
      data: {
        name,
        slug,
        designation: designation || "Senior Editorial Correspondent",
        bio,
        avatar: avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
        email,
        twitter,
        linkedin,
      },
    });

    return NextResponse.json({ success: true, author });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create author" }, { status: 500 });
  }
}
