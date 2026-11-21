import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import express, { type Express, type Request, type RequestHandler, type Response } from "express";
import { createHash } from "node:crypto";
import {
  DISABLED_ROUTES,
  SOFT_MARKETING_WRITES_DISABLED,
  UNAVAILABLE_MESSAGE,
  createSoftMarketingWriteGate,
  matchesDisabledWrite,
  softMarketingWriteGate,
  wishRecordForStorage,
} from "./softMarketingPhase";

const SAMPLE_BODY = {
  email: "person@example.com",
  firstName: "Sample",
  lastName: "Person",
  role: "community_member",
  walletAddress: "0xsample",
  marker: "sample-marker-do-not-echo",
};

const LEFT_ON_WRITES: Array<[string, string]> = [
  ["POST", "/api/properties"],
  ["POST", "/api/proposals"],
  ["POST", "/api/property-submissions"],
  ["PATCH", "/api/property-submissions/sub-1"],
  ["POST", "/api/property-submissions/sub-1/submit"],
  ["PATCH", "/api/property-submissions/sub-1/status"],
  ["POST", "/api/property-submissions/sub-1/documents"],
  ["DELETE", "/api/property-submissions/sub-1/documents/doc-1"],
  ["POST", "/api/nominations"],
  ["POST", "/api/nominations/nom-1/vote"],
  ["POST", "/api/owner-lookup/address"],
  ["POST", "/api/owner-lookup/coordinates"],
  ["POST", "/api/nominations/nom-1/approve"],
  ["POST", "/api/nominations/nom-1/lookup-owner"],
  ["POST", "/api/nominations/nom-1/notify-owner"],
  ["POST", "/api/owner-response/tok-1"],
  ["POST", "/api/tokenize"],
  ["POST", "/api/offerings/off-1/advance-phase"],
  ["POST", "/api/user/acknowledge-risks"],
  ["PATCH", "/api/user/email-preferences"],
  ["POST", "/api/admin/reconciliation/purch-1/retry"],
  ["POST", "/api/admin/reconciliation/purch-1/refund"],
  ["POST", "/api/private-offerings/validate-access"],
  ["GET", "/api/private-offerings/off-1/invites"],
  ["POST", "/api/properties/prop-1/grants"],
  ["PATCH", "/api/grants/grant-1"],
  ["DELETE", "/api/grants/grant-1"],
  ["POST", "/api/wishes"],
  ["POST", "/api/wishes/wish-1/vote"],
  ["GET", "/api/service-bids"],
  ["PATCH", "/api/service-bids/bid-1/status"],
  ["POST", "/api/professionals/apply"],
  ["POST", "/api/professionals/express-interest"],
  ["PATCH", "/api/professionals/pro-1"],
  ["POST", "/api/professionals/pro-1/endorse"],
  ["POST", "/api/admin/professionals/pro-1/verify"],
  ["POST", "/api/admin/professionals/pro-1/reject"],
  ["POST", "/api/admin/professionals/pro-1/suspend"],
  ["POST", "/api/offerings/off-1/professionals/invite"],
  ["POST", "/api/professionals/matches/match-1/respond"],
  ["POST", "/api/offerings/off-1/professionals/select"],
  ["POST", "/api/professionals/pro-1/service-areas"],
  ["DELETE", "/api/professionals/pro-1/service-areas/area-1"],
  ["POST", "/api/admin/agent-tasks"],
  ["PATCH", "/api/admin/agent-tasks/task-1/status"],
  ["GET", "/api/user/transfers"],
  ["GET", "/api/user/refunds"],
  ["GET", "/api/user/purchases"],
  ["GET", "/api/user/holdings"],
  ["POST", "/api/admin/revitascore/keys"],
  ["GET", "/api/revitascore/counties"],
  ["GET", "/api/revitascore/Fulton/housing"],
  ["POST", "/api/uploads/request-url"],
  ["GET", "/api/login"],
  ["GET", "/api/callback"],
  ["GET", "/api/logout"],
  ["GET", "/api/auth/user"],
  ["GET", "/api/properties"],
  ["GET", "/api/wishes"],
  ["GET", "/"],
];

function examplePath(path: string): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => `${name}-sample`);
}

function mountEcho(app: Express, hits: string[]) {
  const touch = (req: Request, res: Response) => {
    hits.push(`${req.method} ${req.path}`);
    res.status(200).json({ reached: true });
  };

  const seen = new Set<string>();
  const mount = (method: string, path: string) => {
    const key = `${method} ${path}`;
    if (seen.has(key)) return;
    seen.add(key);
    const lower = method.toLowerCase() as "get" | "post" | "patch" | "delete";
    app[lower](path, touch);
  };

  for (const route of DISABLED_ROUTES) {
    mount(route.method, route.path);
    mount("GET", route.path);
  }
  for (const [method, path] of LEFT_ON_WRITES) {
    mount(method, path);
  }
}

async function withServer(
  gate: RequestHandler,
  fn: (port: number, hits: string[]) => Promise<void>,
) {
  const hits: string[] = [];
  const app = express();
  app.use(express.json());
  app.use(gate);
  mountEcho(app, hits);

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  try {
    await fn(address.port, hits);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function send(port: number, method: string, path: string) {
  const hasBody = method !== "GET" && method !== "HEAD" && method !== "DELETE";
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: hasBody ? { "content-type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(SAMPLE_BODY) : undefined,
  });
  const text = await response.text();
  return { status: response.status, text };
}

test("soft-marketing writes are disabled by the production constant", () => {
  assert.equal(SOFT_MARKETING_WRITES_DISABLED, true);
  const lowered = UNAVAILABLE_MESSAGE.toLowerCase();
  for (const word of ["offer", "price", "token", "invest"]) {
    assert.equal(lowered.includes(word), false);
  }
  assert.equal(UNAVAILABLE_MESSAGE, "This action is not available.");
});

test("matcher pauses only the approved write routes", () => {
  for (const route of DISABLED_ROUTES) {
    const path = examplePath(route.path);
    assert.equal(matchesDisabledWrite(route.method, path), true, `${route.method} ${path}`);
    assert.equal(matchesDisabledWrite(route.method, `${path}/`), true, `trailing slash ${path}`);
    assert.equal(matchesDisabledWrite(route.method, `${path}?x=1`), true, `query ${path}`);
    if (route.method !== "GET") {
      assert.equal(matchesDisabledWrite("GET", path), false, `GET ${path}`);
    }
  }

  for (const [method, path] of LEFT_ON_WRITES) {
    assert.equal(matchesDisabledWrite(method, path), false, `${method} ${path}`);
  }

  const bypasses: Array<[string, string]> = [
    ["POST", "/API/WAITLIST"],
    ["POST", "/api/Waitlist"],
    ["POST", "/api/revitascore/REGISTER"],
    ["POST", "/api/Service-Bids"],
    ["POST", "/api/webhooks/Stripe"],
    ["POST", "/API/purchase"],
    ["POST", "/api/Refunds"],
    ["POST", "/api/User/KYC"],
    ["POST", "/api/Proposals/p1/vote"],
    ["GET", "/api/Users/u1/holdings"],
    ["GET", "/api/USERS/u1/voting-power/o1"],
    ["GET", "/api/Investor-Protection/p1"],
    ["GET", "/API/admin/KYC-pending"],
    ["HEAD", "/api/users/u1/holdings"],
    ["HEAD", "/api/investor-protection/p1"],
    ["HEAD", "/api/admin/kyc-pending"],
    ["HEAD", "/api/Users/u1/holdings"],
    ["HEAD", "/API/INVESTOR-PROTECTION/p1"],
  ];
  for (const [method, path] of bypasses) {
    assert.equal(matchesDisabledWrite(method, path), true, `${method} ${path}`);
  }

  const stillOpen: Array<[string, string]> = [
    ["HEAD", "/api/waitlist"],
    ["HEAD", "/api/wishes"],
    ["HEAD", "/api/user/holdings"],
    ["GET", "/API/User/Holdings"],
    ["HEAD", "/API/User/Holdings"],
    ["POST", "/api/Nominations/n1/vote"],
    ["POST", "/API/WISHES"],
    ["HEAD", "/api/private-offerings/off-1/invites"],
    ["GET", "/api/Service-Bids"],
  ];
  for (const [method, path] of stillOpen) {
    assert.equal(matchesDisabledWrite(method, path), false, `${method} ${path}`);
  }
});

test("paused writes return 503 and do not run the handler or echo the body", async () => {
  await withServer(softMarketingWriteGate, async (port, hits) => {
    const extraPaths = ["/api/waitlist/", "/api/waitlist?source=page", "/api/user/kyc?unused=1"];
    for (const route of DISABLED_ROUTES) {
      const path = examplePath(route.path);
      const before = hits.length;
      const result = await send(port, route.method, path);
      assert.equal(result.status, 503, `${route.method} ${path}`);
      assert.equal(result.text, JSON.stringify({ error: UNAVAILABLE_MESSAGE }));
      assert.equal(result.text.includes(SAMPLE_BODY.email), false);
      assert.equal(result.text.includes(SAMPLE_BODY.marker), false);
      assert.equal(result.text.includes(SAMPLE_BODY.walletAddress), false);
      assert.equal(hits.length, before, `handler ran for ${route.method} ${path}`);
    }

    for (const path of extraPaths) {
      const before = hits.length;
      const result = await send(port, "POST", path);
      assert.equal(result.status, 503, path);
      assert.equal(result.text.includes(SAMPLE_BODY.marker), false);
      assert.equal(hits.length, before, path);
    }

    for (const route of DISABLED_ROUTES) {
      if (route.method === "GET") continue;
      const path = examplePath(route.path);
      const result = await send(port, "GET", path);
      assert.equal(result.status, 200, `GET ${path}`);
      assert.equal(result.text, JSON.stringify({ reached: true }));
    }
  });
});

test("left-on routes still reach their handlers", async () => {
  await withServer(softMarketingWriteGate, async (port) => {
    const samples: Array<[string, string]> = [
      ["GET", "/api/properties"],
      ["GET", "/api/login"],
      ["GET", "/api/callback"],
      ["GET", "/api/wishes"],
      ["GET", "/api/service-bids"],
      ["GET", "/api/user/purchases"],
      ["GET", "/api/user/holdings"],
      ["GET", "/api/revitascore/counties"],
      ["POST", "/api/wishes"],
      ["POST", "/api/wishes/wish-1/vote"],
      ["POST", "/api/nominations/nom-1/vote"],
      ["POST", "/api/private-offerings/validate-access"],
      ["POST", "/api/user/acknowledge-risks"],
      ["POST", "/api/proposals"],
      ["POST", "/api/property-submissions"],
      ["POST", "/api/nominations"],
      ["POST", "/api/properties/prop-1/grants"],
      ["PATCH", "/api/grants/grant-1"],
      ["DELETE", "/api/grants/grant-1"],
      ["POST", "/api/professionals/apply"],
      ["POST", "/api/tokenize"],
      ["POST", "/api/offerings/off-1/advance-phase"],
      ["POST", "/api/admin/reconciliation/purch-1/refund"],
      ["POST", "/api/admin/revitascore/keys"],
      ["PATCH", "/api/service-bids/bid-1/status"],
      ["PATCH", "/api/user/email-preferences"],
      ["POST", "/api/uploads/request-url"],
      ["POST", "/api/offerings/off-1/professionals/invite"],
      ["GET", "/api/private-offerings/off-1/invites"],
    ];

    for (const [method, path] of samples) {
      const result = await send(port, method, path);
      assert.equal(result.status, 200, `${method} ${path}`);
      assert.equal(result.text, JSON.stringify({ reached: true }), `${method} ${path}`);
    }
  });
});

test("mixed-case paths and HEAD on gated GETs return 503 and do not reach handlers", async () => {
  const hits: string[] = [];
  const app = express();
  app.use(express.json());
  app.use(softMarketingWriteGate);
  const touch = (req: Request, res: Response) => {
    hits.push(`${req.method} ${req.path}`);
    res.status(200).json({ reached: true });
  };
  app.post("/api/waitlist", touch);
  app.post("/api/webhooks/stripe", touch);
  app.post("/api/revitascore/register", touch);
  app.post("/api/service-bids", touch);
  app.post("/api/purchase", touch);
  app.post("/api/refunds", touch);
  app.post("/api/user/kyc", touch);
  app.post("/api/proposals/:id/vote", touch);
  app.get("/api/users/:userId/holdings", touch);
  app.get("/api/users/:userId/voting-power/:offeringId", touch);
  app.get("/api/investor-protection/:propertyId", touch);
  app.get("/api/admin/kyc-pending", touch);
  app.get("/api/user/holdings", touch);
  app.get("/api/wishes", touch);
  app.get("/api/service-bids", touch);
  app.get("/api/private-offerings/:offeringId/invites", touch);
  app.post("/api/nominations/:id/vote", touch);
  app.post("/api/wishes", touch);

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const stopped: Array<[string, string]> = [
      ["POST", "/API/WAITLIST"],
      ["POST", "/api/Waitlist"],
      ["POST", "/api/revitascore/REGISTER"],
      ["POST", "/api/Service-Bids"],
      ["POST", "/api/webhooks/Stripe"],
      ["POST", "/API/purchase"],
      ["POST", "/api/Refunds"],
      ["POST", "/api/User/KYC"],
      ["POST", "/api/Proposals/p1/vote"],
      ["GET", "/api/Users/u1/holdings"],
      ["GET", "/api/USERS/u1/voting-power/o1"],
      ["GET", "/api/Investor-Protection/p1"],
      ["GET", "/API/admin/KYC-pending"],
      ["HEAD", "/api/users/u1/holdings"],
      ["HEAD", "/api/investor-protection/p1"],
      ["HEAD", "/api/admin/kyc-pending"],
      ["HEAD", "/api/Users/u1/holdings"],
    ];
    for (const [method, path] of stopped) {
      const before = hits.length;
      const result = await send(port, method, path);
      assert.equal(result.status, 503, `${method} ${path} -> ${result.status} ${result.text}`);
      if (method !== "HEAD") {
        assert.equal(result.text, JSON.stringify({ error: UNAVAILABLE_MESSAGE }), `${method} ${path}`);
      }
      assert.equal(result.text.includes("Email and role are required"), false, path);
      assert.equal(result.text.includes("reached"), false, path);
      assert.equal(hits.length, before, `handler ran for ${method} ${path}`);
    }

    const open: Array<[string, string]> = [
      ["GET", "/api/user/holdings"],
      ["HEAD", "/api/user/holdings"],
      ["GET", "/API/User/Holdings"],
      ["HEAD", "/API/User/Holdings"],
      ["GET", "/api/wishes"],
      ["HEAD", "/api/wishes"],
      ["GET", "/api/Service-Bids"],
      ["HEAD", "/api/private-offerings/off-1/invites"],
      ["POST", "/api/Nominations/n1/vote"],
      ["POST", "/API/WISHES"],
    ];
    for (const [method, path] of open) {
      const before = hits.length;
      const result = await send(port, method, path);
      assert.equal(result.status, 200, `${method} ${path} -> ${result.status} ${result.text}`);
      if (method !== "HEAD") {
        assert.equal(result.text, JSON.stringify({ reached: true }), `${method} ${path}`);
      }
      assert.equal(hits.length, before + 1, `${method} ${path}`);
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("turning the flag off lets a paused route reach its handler", async () => {
  await withServer(createSoftMarketingWriteGate(false), async (port, hits) => {
    const result = await send(port, "POST", "/api/waitlist");
    assert.equal(result.status, 200);
    assert.equal(result.text, JSON.stringify({ reached: true }));
    assert.deepEqual(hits, ["POST /api/waitlist"]);
  });
});

test("registerRoutes installs the gate without removing handlers", () => {
  const source = readFileSync(new URL("./routes.ts", import.meta.url), "utf8");
  const gateAt = source.indexOf("app.use(softMarketingWriteGate)");
  const rateLimitAt = source.indexOf("return globalWriteRateLimit");
  const waitlistAt = source.indexOf('app.post("/api/waitlist"');
  assert.ok(gateAt > 0);
  assert.ok(rateLimitAt > gateAt);
  assert.ok(waitlistAt > gateAt);

  for (const route of DISABLED_ROUTES) {
    assert.ok(
      source.includes(`"${route.path}"`),
      `missing handler registration for ${route.method} ${route.path}`,
    );
  }

  assert.match(source, /storage\.addToWaitlist\(email, role, sanitizedMessage\)/);
  assert.match(source, /kycStatus: "submitted"/);
  assert.match(source, /app\.post\("\/api\/webhooks\/stripe"/);
  assert.match(source, /constructWebhookEvent\(rawBody, signature, webhookSecret\)/);
  assert.match(source, /calculateVotingPower\(userId, proposal\.offeringId\)/);
  assert.match(source, /app\.post\("\/api\/purchases\/check-eligibility"/);
  assert.match(source, /app\.post\("\/api\/user\/acknowledge-risks"/);
  assert.match(source, /app\.post\("\/api\/private-offerings\/validate-access"/);
  assert.match(source, /app\.post\("\/api\/wishes"/);
  assert.match(source, /wishRecordForStorage\(req\.body\)/);
  assert.match(source, /app\.post\("\/api\/tokenize"/);
  assert.match(source, /app\.post\("\/api\/nominations\/:id\/vote"/);
  assert.equal(source.includes("contracts/Escrow.sol"), false);

  const authSource = readFileSync(
    new URL("./replit_integrations/auth/replitAuth.ts", import.meta.url),
    "utf8",
  );
  assert.match(authSource, /app\.get\("\/api\/login"/);
  assert.match(authSource, /app\.get\("\/api\/callback"/);

  const gateSource = readFileSync(new URL("./softMarketingPhase.ts", import.meta.url), "utf8");
  assert.equal(gateSource.includes("req.body"), false);
  assert.equal(gateSource.includes("console."), false);
});

test("wish email is dropped and the rest of the wish is kept", () => {
  const address = "person@example.com";
  const withoutEmail = wishRecordForStorage({
    title: "A shaded corner",
    description: "Benches and trees",
    category: "park",
    location: "Cherokee County",
    zipCode: "30114",
  });
  assert.equal(withoutEmail.email, null);
  assert.equal(withoutEmail.title, "A shaded corner");
  assert.equal(withoutEmail.description, "Benches and trees");
  assert.equal(withoutEmail.category, "park");
  assert.equal(withoutEmail.location, "Cherokee County");
  assert.equal(withoutEmail.zipCode, "30114");

  const withEmail = wishRecordForStorage({
    title: "A shaded corner",
    description: "Benches and trees",
    category: "park",
    location: "Cherokee County",
    zipCode: "30114",
    email: address,
  });
  assert.equal(withEmail.email, null);
  assert.equal(JSON.stringify(withEmail).includes(address), false);
  assert.equal(withEmail.title, "A shaded corner");

  const stored: Array<{ email: string | null }> = [];
  stored.push({ email: withEmail.email ?? null });
  stored.push({ email: withoutEmail.email ?? null });
  assert.equal(stored.every((row) => row.email === null), true);
  assert.equal(JSON.stringify(stored).includes(address), false);
});

test("Escrow.sol is unchanged", () => {
  const escrow = readFileSync(new URL("../contracts/Escrow.sol", import.meta.url));
  const hash = createHash("sha256").update(escrow).digest("hex");
  assert.equal(hash, "3040d8b2cd3ba772c9dd3e7b7bbc7abf875ffd7f07362202708b3bfc8a614706");
});

test("real route registration pauses approved writes and keeps the original handlers for routes that stay on", async () => {
  const repoRoot = fileURLToPath(new URL("..", import.meta.url));
  const tsxCli = fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url));
  const child = spawn(process.execPath, [tsxCli, "server/softMarketingPhase.livecheck.ts"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      DATABASE_URL: "postgres://127.0.0.1:9/none",
      SESSION_SECRET: "test-only-secret",
      ISSUER_URL: "",
      REPLIT_DEPLOYMENT: "",
    },
  });

  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  const killTimer = setTimeout(() => child.kill("SIGKILL"), 20000);
  const code = await new Promise<number | null>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  clearTimeout(killTimer);

  assert.equal(code, 0, `${stderr}\n${stdout}`);
  assert.match(stdout, /INTEGRATION_OK/);
});
