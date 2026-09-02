import prisma from "./db";
import { Role } from "@prisma/client";

export interface CreateNotificationParams {
  userId?: string | null;
  targetRole?: Role | null;
  message: string;
  type: "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | "PUBLISHED" | "SCHEDULED" | "SYSTEM";
  articleId?: string | null;
  link?: string | null;
}

export async function createEditorialNotification(params: CreateNotificationParams) {
  try {
    return await prisma.editorialNotification.create({
      data: {
        userId: params.userId || null,
        targetRole: params.targetRole || null,
        message: params.message,
        type: params.type,
        articleId: params.articleId || null,
        link: params.link || null,
      },
    });
  } catch (error) {
    console.error("Failed to create editorial notification:", error);
    return null;
  }
}
