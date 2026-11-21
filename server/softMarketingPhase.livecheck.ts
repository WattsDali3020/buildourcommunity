/**
 * Local check against the real route table.
 * Uses a dummy database URL on 127.0.0.1 and does not call an identity provider.
 * Run via `tsx server/softMarketingPhase.livecheck.ts`. The process exits when finished.
 */
import assert from "node:assert/strict";
import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { UNAVAILABLE_MESSAGE } from "./softMarketingPhase";

const SAMPLE_BODY = {
  email: "person@example.com",
  firstName: "Sample",
  lastName: "Person",
  role: "community_member",
  walletAddress: "0xsample",
  marker: "sample-marker-do-not-echo",
};

async function send(port: number, method: string, path: string) {
  const hasBody = method !== "GET" && method !== "DELETE";
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: hasBody ? { "content-type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(SAMPLE_BODY) : undefined,
  });
  const text = await response.text();
  return { status: response.status, text };
}

async function main() {
  process.env.DATABASE_URL = "postgres://127.0.0.1:9/none";
  process.env.SESSION_SECRET = "test-only-secret";
  delete process.env.ISSUER_URL;
  delete process.env.REPLIT_DEPLOYMENT;

  const [{ registerRoutes }, { pool }] = await Promise.all([
    import("./routes"),
    import("./db"),
  ]);

  const app = express();
  app.use(express.json());
  const server = createServer(app);
  const timeout = setTimeout(() => {
    console.error("livecheck timed out");
    process.exit(1);
  }, 20000);

  try {
    await registerRoutes(server, app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = (server.address() as AddressInfo).port;

    const paused: Array<[string, string]> = [
      ["POST", "/api/waitlist"],
      ["POST", "/api/revitascore/register"],
      ["POST", "/api/service-bids"],
      ["POST", "/api/user/kyc"],
      ["GET", "/api/admin/kyc-pending"],
      ["POST", "/api/admin/kyc/user-1/approve"],
      ["POST", "/api/admin/kyc/user-1/reject"],
      ["POST", "/api/user/wallet"],
      ["POST", "/api/purchases"],
      ["POST", "/api/purchases/check-eligibility"],
      ["POST", "/api/purchase"],
      ["POST", "/api/purchase/confirm"],
      ["POST", "/api/webhooks/stripe"],
      ["POST", "/api/transfers"],
      ["POST", "/api/refunds"],
      ["POST", "/api/offerings/off-1/process-refunds"],
      ["GET", "/api/investor-protection/prop-1"],
      ["POST", "/api/private-offerings/off-1/invites"],
      ["POST", "/api/private-offerings/invites/inv-1/accept"],
      ["POST", "/api/proposals/prop-1/vote"],
      ["GET", "/api/users/user-1/holdings"],
      ["GET", "/api/users/user-1/voting-power/off-1"],
    ];

    for (const [method, path] of paused) {
      const result = await send(port, method, path);
      assert.equal(result.status, 503, path);
      assert.equal(result.text, JSON.stringify({ error: UNAVAILABLE_MESSAGE }));
      assert.equal(result.text.includes(SAMPLE_BODY.email), false, path);
      assert.equal(result.text.includes(SAMPLE_BODY.marker), false, path);
      assert.equal(result.text.includes(SAMPLE_BODY.walletAddress), false, path);
    }

    const counties = await send(port, "GET", "/api/revitascore/counties");
    assert.equal(counties.status, 200);
    assert.equal(counties.text.includes("\"counties\""), true);
    assert.equal(counties.text.includes(UNAVAILABLE_MESSAGE), false);

    const projectTypes = await send(port, "GET", "/api/revitascore/project-types");
    assert.equal(projectTypes.status, 200);
    assert.equal(projectTypes.text.includes("\"projectTypes\""), true);

    const login = await send(port, "GET", "/api/login");
    assert.equal(login.status, 503);
    assert.equal(login.text, JSON.stringify({ error: "Auth not configured - ISSUER_URL not set" }));

    const callback = await send(port, "GET", "/api/callback");
    assert.equal(callback.status, 404);
    assert.equal(callback.text.includes(UNAVAILABLE_MESSAGE), false);

    const validateAccess = await send(port, "POST", "/api/private-offerings/validate-access");
    assert.equal(validateAccess.status, 400);
    assert.equal(validateAccess.text, JSON.stringify({ error: "Offering ID is required" }));

    const wish = await send(port, "POST", "/api/wishes");
    assert.equal(wish.status, 400);
    assert.equal(wish.text.includes("Invalid wish data"), true);
    assert.equal(wish.text.includes(UNAVAILABLE_MESSAGE), false);
    assert.equal(wish.text.includes(SAMPLE_BODY.email), false);

    const nominationVote = await send(port, "POST", "/api/nominations/nom-1/vote");
    assert.equal(nominationVote.status, 400);
    assert.equal(nominationVote.text, JSON.stringify({ error: "Missing required fields" }));

    const ownHoldings = await send(port, "GET", "/api/user/holdings");
    assert.equal(ownHoldings.status, 401);
    assert.equal(ownHoldings.text, JSON.stringify({ error: "Unauthorized" }));

    const advancePhase = await send(port, "POST", "/api/offerings/off-1/advance-phase");
    assert.equal(advancePhase.status, 401);
    assert.equal(advancePhase.text, JSON.stringify({ error: "Unauthorized" }));

    for (const path of [
      "/api/user/acknowledge-risks",
      "/api/proposals",
      "/api/professionals/apply",
      "/api/tokenize",
      "/api/properties/prop-1/grants",
      "/api/uploads/request-url",
      "/api/nominations",
    ]) {
      const result = await send(port, "POST", path);
      assert.equal(result.status, 401, path);
      assert.equal(result.text, JSON.stringify({ error: "Unauthorized" }));
    }

    console.log("INTEGRATION_OK");
  } finally {
    clearTimeout(timeout);
    if (server.listening) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
