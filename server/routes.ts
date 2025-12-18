import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertPropertySubmissionSchema, insertPropertyNominationSchema } from "@shared/schema";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

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

  // Property Submissions API
  app.post("/api/property-submissions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertySubmissionSchema.parse(req.body);
      const submission = await storage.createPropertySubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid submission data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to create property submission" });
    }
  });

  app.get("/api/property-submissions/:id", async (req: Request, res: Response) => {
    const submission = await storage.getPropertySubmission(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    
    const documents = await storage.getSubmissionDocuments(submission.id);
    res.json({ submission, documents });
  });

  app.get("/api/property-submissions", async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const ownerId = req.query.ownerId as string | undefined;
    
    let submissions;
    if (ownerId) {
      submissions = await storage.getPropertySubmissionsByOwner(ownerId);
    } else if (status) {
      submissions = await storage.getPropertySubmissionsByStatus(status as any);
    } else {
      submissions = await storage.getPropertySubmissionsByStatus("submitted");
    }
    
    res.json(submissions);
  });

  app.patch("/api/property-submissions/:id", async (req: Request, res: Response) => {
    try {
      const submission = await storage.getPropertySubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      const updated = await storage.updatePropertySubmission(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update submission" });
    }
  });

  app.post("/api/property-submissions/:id/submit", async (req: Request, res: Response) => {
    try {
      const submission = await storage.getPropertySubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      if (!submission.ownershipConfirmed || !submission.termsAccepted) {
        return res.status(400).json({ error: "Please confirm ownership and accept terms before submitting" });
      }
      
      const updated = await storage.updatePropertySubmissionStatus(req.params.id, "submitted");
      res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Failed to submit property" });
    }
  });

  app.patch("/api/property-submissions/:id/status", async (req: Request, res: Response) => {
    try {
      const { status, reviewNotes, reviewedBy } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const submission = await storage.getPropertySubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      const updated = await storage.updatePropertySubmissionStatus(
        req.params.id, 
        status, 
        reviewNotes, 
        reviewedBy
      );
      res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update submission status" });
    }
  });

  // Submission Documents API
  app.post("/api/property-submissions/:id/documents", async (req: Request, res: Response) => {
    try {
      const submission = await storage.getPropertySubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      const { fileName, fileType, fileSize, storageKey, documentType } = req.body;
      
      if (!fileName || !fileType || !fileSize || !storageKey || !documentType) {
        return res.status(400).json({ error: "Missing required document fields" });
      }
      
      const document = await storage.addSubmissionDocument({
        submissionId: req.params.id,
        fileName,
        fileType,
        fileSize,
        storageKey,
        documentType,
      });
      
      res.status(201).json(document);
    } catch (error) {
      return res.status(500).json({ error: "Failed to add document" });
    }
  });

  app.get("/api/property-submissions/:id/documents", async (req: Request, res: Response) => {
    const documents = await storage.getSubmissionDocuments(req.params.id);
    res.json(documents);
  });

  app.delete("/api/property-submissions/:submissionId/documents/:docId", async (req: Request, res: Response) => {
    const deleted = await storage.deleteSubmissionDocument(req.params.docId);
    if (!deleted) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json({ success: true });
  });

  // Property Nominations API
  app.post("/api/nominations", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertyNominationSchema.parse(req.body);
      const nomination = await storage.createPropertyNomination(validatedData);
      res.status(201).json(nomination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid nomination data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to create nomination" });
    }
  });

  app.get("/api/nominations", async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    let nominations;
    if (status) {
      nominations = await storage.getPropertyNominationsByStatus(status as any);
    } else {
      nominations = await storage.getPropertyNominations();
    }
    res.json(nominations);
  });

  app.get("/api/nominations/:id", async (req: Request, res: Response) => {
    const nomination = await storage.getPropertyNomination(req.params.id);
    if (!nomination) {
      return res.status(404).json({ error: "Nomination not found" });
    }
    const votes = await storage.getDesiredUseVotes(nomination.id);
    res.json({ nomination, votes });
  });

  app.post("/api/nominations/:id/vote", async (req: Request, res: Response) => {
    const { userId, desiredUse } = req.body;
    const nominationId = req.params.id;

    if (!userId || !desiredUse) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const nomination = await storage.getPropertyNomination(nominationId);
    if (!nomination) {
      return res.status(404).json({ error: "Nomination not found" });
    }

    const hasVoted = await storage.hasUserVotedOnNomination(userId, nominationId);
    if (hasVoted) {
      return res.status(403).json({ error: "User has already voted on this nomination" });
    }

    const vote = await storage.addDesiredUseVote(nominationId, userId, desiredUse);
    res.status(201).json(vote);
  });

  // Register object storage routes for document uploads
  registerObjectStorageRoutes(app);

  return httpServer;
}
