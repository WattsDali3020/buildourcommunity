import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/properties", async (req: Request, res: Response) => {
    const properties = await storage.getProperties();
    res.json(properties);
  });

  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    const property = await storage.getProperty(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const offering = await storage.getOfferingByPropertyId(property.id);
    let phases: any[] = [];
    
    if (offering) {
      const offeringPhases = await storage.getOfferingPhases(offering.id);
      phases = offeringPhases.map(phase => ({
        ...phase,
        currentPrice: Number(phase.currentPrice),
        basePrice: Number(phase.basePrice),
        priceMultiplier: Number(phase.priceMultiplier),
      }));
    }

    res.json({
      property,
      offering,
      phases,
    });
  });

  app.post("/api/properties", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid property data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to create property" });
    }
  });

  app.get("/api/offerings/:offeringId/phases", async (req: Request, res: Response) => {
    const phases = await storage.getOfferingPhases(req.params.offeringId);
    res.json(phases.map(phase => ({
      ...phase,
      currentPrice: Number(phase.currentPrice),
      basePrice: Number(phase.basePrice),
      priceMultiplier: Number(phase.priceMultiplier),
    })));
  });

  app.get("/api/offerings/:offeringId/active-phase", async (req: Request, res: Response) => {
    const phase = await storage.getActivePhase(req.params.offeringId);
    if (!phase) {
      return res.status(404).json({ error: "No active phase found" });
    }
    res.json({
      ...phase,
      currentPrice: Number(phase.currentPrice),
      basePrice: Number(phase.basePrice),
      priceMultiplier: Number(phase.priceMultiplier),
    });
  });

  app.post("/api/purchases/check-eligibility", async (req: Request, res: Response) => {
    const { userId, phaseId, tokenCount } = req.body;
    
    if (!userId || !phaseId || !tokenCount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await storage.canUserPurchase(userId, phaseId, tokenCount);
    res.json(result);
  });

  app.post("/api/purchases", async (req: Request, res: Response) => {
    const { userId, offeringId, phaseId, tokenCount, pricePerToken } = req.body;

    if (!userId || !offeringId || !phaseId || !tokenCount || !pricePerToken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const eligibility = await storage.canUserPurchase(userId, phaseId, tokenCount);
    if (!eligibility.allowed) {
      return res.status(403).json({ error: eligibility.reason });
    }

    const totalAmount = (tokenCount * pricePerToken).toString();
    
    const purchase = await storage.createTokenPurchase({
      userId,
      offeringId,
      phaseId,
      tokenCount,
      pricePerToken: pricePerToken.toString(),
      totalAmount,
    });

    res.status(201).json(purchase);
  });

  app.get("/api/users/:userId/holdings", async (req: Request, res: Response) => {
    const holdings = await storage.getUserHoldings(req.params.userId);
    res.json(holdings);
  });

  app.get("/api/users/:userId/voting-power/:offeringId", async (req: Request, res: Response) => {
    const votingPower = await storage.calculateVotingPower(req.params.userId, req.params.offeringId);
    res.json({ votingPower });
  });

  app.get("/api/proposals", async (req: Request, res: Response) => {
    const offeringId = req.query.offeringId as string | undefined;
    const proposals = await storage.getProposals(offeringId);
    res.json(proposals);
  });

  app.get("/api/proposals/:id", async (req: Request, res: Response) => {
    const proposal = await storage.getProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }
    res.json(proposal);
  });

  app.post("/api/proposals/:id/vote", async (req: Request, res: Response) => {
    const { userId, voteDirection } = req.body;
    const proposalId = req.params.id;

    if (!userId || voteDirection === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const proposal = await storage.getProposal(proposalId);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    const hasVoted = await storage.hasUserVoted(userId, proposalId);
    if (hasVoted) {
      return res.status(403).json({ error: "User has already voted on this proposal" });
    }

    const votingPower = await storage.calculateVotingPower(userId, proposal.offeringId);
    if (votingPower === 0) {
      return res.status(403).json({ error: "User has no voting power for this offering" });
    }

    const vote = await storage.castVote(proposalId, userId, voteDirection, votingPower);
    res.status(201).json(vote);
  });

  return httpServer;
}
