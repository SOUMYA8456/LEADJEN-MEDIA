import prisma from "./db";

export interface LogAuditParams {
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entityType: "ARTICLE" | "BREAKING_NEWS" | "LIVE_COVERAGE" | "LIVE_UPDATE" | "HOMEPAGE" | "NAVIGATION" | "USER" | "SETTING" | string;
  entityId?: string | null;
  entityTitle?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  details?: any;
}

export async function logAuditEvent(params: LogAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || null,
        userRole: params.userRole || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        entityTitle: params.entityTitle || null,
        previousStatus: params.previousStatus || null,
        newStatus: params.newStatus || null,
        details: params.details ? (typeof params.details === "string" ? params.details : JSON.stringify(params.details)) : null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
