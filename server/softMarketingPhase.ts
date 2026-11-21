import type { NextFunction, Request, Response } from "express";

/**
 * Soft-marketing phase gate.
 *
 * Selected write routes return 503 before their handlers run. The handlers
 * stay in the source tree. Set SOFT_MARKETING_WRITES_DISABLED to false and
 * redeploy to restore them. No environment variable is consulted.
 */
export const SOFT_MARKETING_WRITES_DISABLED = true;

export const UNAVAILABLE_MESSAGE = "This action is not available.";

export type DisabledWriteRoute = {
  method: "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
};

export const DISABLED_WRITE_ROUTES: readonly DisabledWriteRoute[] = [
  { method: "POST", path: "/api/waitlist" },
  { method: "POST", path: "/api/revitascore/register" },
  { method: "POST", path: "/api/service-bids" },
  { method: "POST", path: "/api/user/kyc" },
  { method: "POST", path: "/api/admin/kyc/:userId/approve" },
  { method: "POST", path: "/api/admin/kyc/:userId/reject" },
  { method: "POST", path: "/api/user/wallet" },
  { method: "POST", path: "/api/purchases" },
  { method: "POST", path: "/api/purchase" },
  { method: "POST", path: "/api/purchase/confirm" },
  { method: "POST", path: "/api/webhooks/stripe" },
  { method: "POST", path: "/api/transfers" },
  { method: "POST", path: "/api/refunds" },
  { method: "POST", path: "/api/private-offerings/:offeringId/invites" },
  { method: "POST", path: "/api/private-offerings/invites/:inviteId/accept" },
  { method: "POST", path: "/api/proposals/:id/vote" },
];

const compiledRoutes = DISABLED_WRITE_ROUTES.map((route) => ({
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
