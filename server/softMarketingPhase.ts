import type { NextFunction, Request, Response } from "express";
import { insertWishSchema, type InsertWish } from "@shared/schema";

/**
 * Soft-marketing phase gate.
 *
 * Selected routes return 503 before their handlers run. The handlers stay
 * in the source tree. Set SOFT_MARKETING_WRITES_DISABLED to false to restore
 * them. No environment variable is consulted. Contract files are not part of
 * this gate.
 */
export const SOFT_MARKETING_WRITES_DISABLED = true;

export const UNAVAILABLE_MESSAGE = "This action is not available.";

export type DisabledRoute = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
};

export const DISABLED_ROUTES: readonly DisabledRoute[] = [
  { method: "POST", path: "/api/waitlist" },
  { method: "POST", path: "/api/revitascore/register" },
  { method: "POST", path: "/api/service-bids" },
  { method: "POST", path: "/api/user/kyc" },
  { method: "GET", path: "/api/admin/kyc-pending" },
  { method: "POST", path: "/api/admin/kyc/:userId/approve" },
  { method: "POST", path: "/api/admin/kyc/:userId/reject" },
  { method: "POST", path: "/api/user/wallet" },
  { method: "POST", path: "/api/purchases" },
  { method: "POST", path: "/api/purchases/check-eligibility" },
  { method: "POST", path: "/api/purchase" },
  { method: "POST", path: "/api/purchase/confirm" },
  { method: "POST", path: "/api/webhooks/stripe" },
  { method: "POST", path: "/api/transfers" },
  { method: "POST", path: "/api/refunds" },
  { method: "POST", path: "/api/offerings/:offeringId/process-refunds" },
  { method: "GET", path: "/api/investor-protection/:propertyId" },
  { method: "POST", path: "/api/private-offerings/:offeringId/invites" },
  { method: "POST", path: "/api/private-offerings/invites/:inviteId/accept" },
  { method: "POST", path: "/api/proposals/:id/vote" },
  { method: "GET", path: "/api/users/:userId/holdings" },
  { method: "GET", path: "/api/users/:userId/voting-power/:offeringId" },
];

const compiledRoutes = DISABLED_ROUTES.map((route) => ({
  method: route.method,
  pattern: pathToRegExp(route.path),
}));

function pathToRegExp(path: string): RegExp {
  const body = path
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        return "[^/]+";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return new RegExp(`^${body}$`);
}

export function normalizeRequestPath(path: string): string {
  const withoutQuery = path.split("?")[0] ?? path;
  if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery;
}

export function matchesDisabledWrite(method: string, path: string): boolean {
  const normalizedMethod = method.toUpperCase();
  const normalizedPath = normalizeRequestPath(path);
  return compiledRoutes.some(
    (route) => route.method === normalizedMethod && route.pattern.test(normalizedPath),
  );
}

export function createSoftMarketingWriteGate(enabled: boolean = SOFT_MARKETING_WRITES_DISABLED) {
  return function softMarketingWriteGate(req: Request, res: Response, next: NextFunction): void {
    if (enabled && matchesDisabledWrite(req.method, req.path)) {
      res.status(503).json({ error: UNAVAILABLE_MESSAGE });
      return;
    }
    next();
  };
}

export const softMarketingWriteGate = createSoftMarketingWriteGate();

function omitWishEmail(input: unknown): unknown {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return input;
  }
  const copy = { ...(input as Record<string, unknown>) };
  delete copy.email;
  return copy;
}

/**
 * Wish writes stay available. The email field is dropped before validation
 * and storage so a lead-capture address is not kept.
 */
export function wishRecordForStorage(input: unknown): InsertWish {
  const parsed = insertWishSchema.parse(omitWishEmail(input));
  return { ...parsed, email: null };
}
