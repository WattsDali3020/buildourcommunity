import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../../db";
import { upsertUser, getUser } from "./storage";
import * as client from "openid-client";

if (!process.env.REPLIT_DEPLOYMENT && !process.env.ISSUER_URL) {
  console.warn("Running outside Replit - Auth will be disabled");
}

const PgSession = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
    codeVerifier?: string;
    state?: string;
  }
}

let oidcConfig: client.Configuration | null = null;

export async function setupAuth(app: Express): Promise<void> {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: new PgSession({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  app.get("/api/auth/user", async (req, res) => {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });

  const issuerUrl = process.env.ISSUER_URL;
  if (!issuerUrl) {
    console.log("ISSUER_URL not set - Replit Auth disabled");
    
    app.get("/api/login", (req, res) => {
      res.status(503).json({ error: "Auth not configured - ISSUER_URL not set" });
    });
    
    app.get("/api/logout", (req, res) => {
      req.session.destroy(() => {
        res.redirect("/");
      });
    });
    
    return;
  }

  const clientId = process.env.REPL_ID!;
  const clientSecret = process.env.REPLIT_OIDC_SECRET || "";
  
  try {
    oidcConfig = await client.discovery(new URL(issuerUrl), clientId, clientSecret);
  } catch (error) {
    console.error("Failed to discover OIDC configuration:", error);
    return;
  }

  app.get("/api/login", async (req, res) => {
    if (!oidcConfig) {
      return res.status(500).json({ error: "Auth not configured" });
    }

    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();

    req.session.codeVerifier = codeVerifier;
    req.session.state = state;

    const redirectUri = `${req.protocol}://${req.get("host")}/api/callback`;

    const authUrl = client.buildAuthorizationUrl(oidcConfig, {
      redirect_uri: redirectUri,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });

    res.redirect(authUrl.href);
  });

  app.get("/api/callback", async (req, res) => {
    if (!oidcConfig) {
      return res.redirect("/");
    }

    try {
      const codeVerifier = req.session.codeVerifier;
      const expectedState = req.session.state;

      if (!codeVerifier || !expectedState) {
        console.error("Missing session data for callback");
        return res.redirect("/");
      }

      const redirectUri = `${req.protocol}://${req.get("host")}/api/callback`;
      const currentUrl = new URL(req.url, `${req.protocol}://${req.get("host")}`);

      const tokens = await client.authorizationCodeGrant(oidcConfig, currentUrl, {
        pkceCodeVerifier: codeVerifier,
        expectedState,
        idTokenExpected: true,
      });

      const claims = tokens.claims();
      
      if (!claims || !claims.sub) {
        console.error("No claims in token");
        return res.redirect("/");
      }

      const userInfo = await client.fetchUserInfo(oidcConfig, tokens.access_token, claims.sub);

      await upsertUser({
        id: claims.sub,
        email: userInfo.email ?? null,
        firstName: (userInfo as any).first_name ?? null,
        lastName: (userInfo as any).last_name ?? null,
        profileImageUrl: (userInfo as any).profile_image_url ?? null,
      });

      req.session.userId = claims.sub;
      delete req.session.codeVerifier;
      delete req.session.state;

      res.redirect("/");
    } catch (error) {
      console.error("Auth callback error:", error);
      res.redirect("/");
    }
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

export const requireKYCApproved: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await getUser(req.session.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (user.kycStatus !== "verified") {
    return res.status(403).json({ 
      error: "KYC verification required",
      kycStatus: user.kycStatus,
      message: "You must complete KYC verification before making purchases. Please visit your dashboard to submit verification."
    });
  }
  next();
};

export { getUser, upsertUser } from "./storage";
