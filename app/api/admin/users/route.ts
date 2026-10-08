import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import crypto from "crypto";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/admin/users — List all staff & users (SUPER_ADMIN only)
export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Super Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const where: any = {};
    if (roleFilter && roleFilter !== "ALL") {
      where.role = roleFilter as Role;
    }
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, authors] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          designation: true,
          department: true,
          bio: true,
          role: true,
          avatar: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              comments: true,
              bookmarks: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      }),
      prisma.author.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          slug: true,
          _count: {
            select: { articles: true },
          },
        },
      }),
    ]);

    // Map author articles count to user by matching email or name
    const usersWithStats = users.map((u) => {
      const matchingAuthor = authors.find(
        (a) =>
          (a.email && a.email.toLowerCase() === u.email.toLowerCase()) ||
          a.name.toLowerCase() === u.name.toLowerCase()
      );
      return {
        ...u,
        authorProfile: matchingAuthor
          ? {
              id: matchingAuthor.id,
              slug: matchingAuthor.slug,
              articleCount: matchingAuthor._count.articles,
            }
          : null,
      };
    });

    const superAdminCount = users.filter((u) => u.role === "SUPER_ADMIN" && u.status === "ACTIVE").length;

    return NextResponse.json({
      users: usersWithStats,
      stats: {
        total: users.length,
        superAdmins: superAdminCount,
        editors: users.filter((u) => u.role === "EDITOR").length,
        reporters: users.filter((u) => u.role === "REPORTER").length,
        readers: users.filter((u) => u.role === "READER").length,
        active: users.filter((u) => u.status === "ACTIVE").length,
        suspended: users.filter((u) => u.status === "SUSPENDED").length,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch editorial staff list" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users — Add New Employee / Staff Member (SUPER_ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Super Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      displayName,
      email,
      designation,
      department,
      role = "REPORTER",
      bio,
      avatar,
      status = "ACTIVE",
      password: customPassword,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: `User with email "${normalizedEmail}" already exists.` },
        { status: 409 }
      );
    }

    // Generate or use password
    const rawPassword =
      customPassword && customPassword.trim().length >= 6
        ? customPassword.trim()
        : `LjMedia@${crypto.randomBytes(3).toString("hex")}`;

    const passwordHash = await hashPassword(rawPassword);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        displayName: displayName?.trim() || name.trim(),
        email: normalizedEmail,
        designation: designation?.trim() || (role === "SUPER_ADMIN" ? "Executive Editor" : role === "EDITOR" ? "Senior Editor" : "Staff Reporter"),
        department: department?.trim() || "Newsroom Desk",
        role: role as Role,
        bio: bio?.trim() || null,
        avatar: avatar?.trim() || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
        status: status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        designation: true,
        department: true,
        bio: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If staff member (SUPER_ADMIN, EDITOR, REPORTER), sync/create Author profile for article attribution
    let authorProfile = null;
    if (["SUPER_ADMIN", "EDITOR", "REPORTER"].includes(role)) {
      const baseSlug = slugify(name.trim());
      let finalSlug = baseSlug;
      let count = 1;
      while (await prisma.author.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${baseSlug}-${count++}`;
      }

      authorProfile = await prisma.author.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          designation: designation?.trim() || (role === "SUPER_ADMIN" ? "Executive Editor" : role === "EDITOR" ? "Senior Editor" : "Staff Reporter"),
          department: department?.trim() || "Newsroom Desk",
          bio: bio?.trim() || null,
          avatar: newUser.avatar,
          email: normalizedEmail,
          status: newUser.status,
        },
      });
    }

    // Audit Logging
    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: "USER_CREATED",
      entityType: "USER",
      entityId: newUser.id,
      entityTitle: `${newUser.name} (${newUser.email}) - ${newUser.role}`,
      newStatus: newUser.status,
      details: {
        createdUserId: newUser.id,
        role: newUser.role,
        department: newUser.department,
        designation: newUser.designation,
        authorProfileId: authorProfile?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...newUser,
        authorProfile: authorProfile
          ? { id: authorProfile.id, slug: authorProfile.slug, articleCount: 0 }
          : null,
      },
      tempPassword: rawPassword, // Returned ONLY once for Super Admin modal copy
    });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to create employee account" },
      { status: 500 }
    );
  }
}
