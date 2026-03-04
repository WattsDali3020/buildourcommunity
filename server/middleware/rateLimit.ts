import { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = "Too many requests, please try again later" } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();
    
    const entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (entry.count >= maxRequests) {
      return res.status(429).json({ error: message });
    }
    
    entry.count++;
    return next();
  };
}

export const purchaseRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: "Too many purchase attempts, please wait a minute",
});

export const voteRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: "Too many votes, please wait a minute",
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Too many authentication attempts, please try again later",
});

export const globalWriteRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: "Too many requests, please try again later",
});

setInterval(() => {
  const now = Date.now();
  const keys = Array.from(rateLimitStore.keys());
  for (const key of keys) {
    const entry = rateLimitStore.get(key);
    if (entry && now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);
