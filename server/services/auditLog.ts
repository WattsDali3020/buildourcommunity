import { db } from "../db";
import { auditLog } from "@shared/schema";
import type { Request } from "express";

interface AuditEventParams {
  userId?: string | null;
  action: string;
  targetTable?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  req?: Request;
}

export async function logAuditEvent({
  userId,
  action,
  targetTable,
  targetId,
  metadata,
  req,
}: AuditEventParams): Promise<void> {
  try {
    const ipAddress = req?.ip || req?.headers["x-forwarded-for"]?.toString() || null;
    await db.insert(auditLog).values({
      userId: userId || null,
      action,
      targetTable: targetTable || null,
      targetId: targetId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ipAddress,
    });
  } catch (error) {
    console.error("[AuditLog] Failed to log event:", error);
  }
}
