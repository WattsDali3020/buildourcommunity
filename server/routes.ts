import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertPropertySubmissionSchema, insertPropertyNominationSchema, insertPropertyGrantSchema, insertWishSchema, insertServiceBidSchema } from "@shared/schema";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { setupAuth, isAuthenticated, isAdmin, requireKYCApproved } from "./replit_integrations/auth";
import { createPaymentIntent, isStripeConfigured, verifyPaymentAndGetMetadata, constructWebhookEvent } from "./services/payments";
import { purchaseRateLimit, voteRateLimit, globalWriteRateLimit } from "./middleware/rateLimit";
import { sendPurchaseConfirmation, sendWaitlistNotification, sendPhaseAdvancementNotification, sendRefundNotification, sendProposalNotification } from "./services/email";
import { 
  lookupOwnerByAddress, 
  lookupOwnerByCoordinates, 
  prepareOwnerOutreach,
  decodeOwnerNotificationToken
} from "./services/ownerDetection";
import { notifyPropertyOwner, logNotification } from "./services/notifications";
import { 
  initiateTokenization, 
  getTokenizationStatus,
  advancePhase,
  processRefunds 
} from "./services/tokenizationOrchestrator";
import { getExplorerUrl } from "./services/blockchain";
import { logAuditEvent } from "./services/auditLog";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  app.use((req, res, next) => {
    if (["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
      return globalWriteRateLimit(req, res, next);
    }
    next();
  });

  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const properties = await storage.getProperties();
      const proposals = await storage.getProposals();
      const activeProposals = proposals.filter((p: any) => p.status === "active");

      let totalUsers = 0;
      let totalInvested = "0";
      try {
        const { db } = await import("./db");
        const { users, tokenHoldings } = await import("@shared/schema");
        const { sql } = await import("drizzle-orm");
        const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(users);
        totalUsers = Number(userCountResult[0]?.count || 0);
        const investedResult = await db.select({
          total: sql<string>`COALESCE(SUM(token_count * CAST(average_purchase_price AS DECIMAL)), 0)`
        }).from(tokenHoldings);
        totalInvested = String(investedResult[0]?.total || "0");
      } catch {}

      res.json({
        totalProperties: properties.length,
        totalUsers,
        totalInvested,
        activeProposals: activeProposals.length,
        totalProposals: proposals.length,
      });
    } catch (error) {
      res.json({
        totalProperties: 0,
        totalUsers: 0,
        totalInvested: "0",
        activeProposals: 0,
        totalProposals: 0,
      });
    }
  });

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

  app.post("/api/properties", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertySchema.parse({
        ...req.body,
        ownerId: req.session.userId,
      });
      const property = await storage.createProperty(validatedData);
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

  app.post("/api/purchases", isAuthenticated, requireKYCApproved, purchaseRateLimit, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const { offeringId, phaseId, tokenCount, pricePerToken } = req.body;

    if (!offeringId || !phaseId || !tokenCount || !pricePerToken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await storage.getUser(userId);
    if (!user?.riskDisclosureAcknowledgedAt) {
      return res.status(403).json({ error: "Risk disclosure acknowledgment required before purchasing" });
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

    await logAuditEvent({
      userId,
      action: "token_purchase",
      targetTable: "token_purchases",
      targetId: purchase.id,
      metadata: { offeringId, phaseId, tokenCount, totalAmount },
      req,
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

  app.post("/api/proposals", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { offeringId, title, description, quorumRequired, startsAt, endsAt } = req.body;
      if (!offeringId || !title || !description || !quorumRequired) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const proposal = await storage.createProposal({
        offeringId,
        proposerId: userId,
        title,
        description,
        quorumRequired,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
      });

      try {
        const offering = await storage.getTokenOffering(offeringId);
        if (offering) {
          const property = await storage.getProperty(offering.propertyId);
          const holdings = await storage.getHoldingsByOffering(offeringId);
          for (const holding of holdings) {
            const user = await storage.getUser(holding.userId);
            if (user?.email && user.emailNotificationsEnabled !== false) {
              await sendProposalNotification(
                user.email,
                title,
                property?.name || "Property"
              );
            }
          }
        }
      } catch (emailErr) {
        console.error("[Email] Failed to send proposal notifications:", emailErr);
      }

      res.status(201).json(proposal);
    } catch (error) {
      console.error("Error creating proposal:", error);
      res.status(500).json({ error: "Failed to create proposal" });
    }
  });

  app.post("/api/proposals/:id/vote", isAuthenticated, voteRateLimit, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { voteDirection } = req.body;
    const proposalId = req.params.id;

    if (voteDirection === undefined) {
      return res.status(400).json({ error: "Missing vote direction" });
    }

    const proposal = await storage.getProposal(proposalId);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    const hasVoted = await storage.hasUserVoted(userId, proposalId);
    if (hasVoted) {
      return res.status(403).json({ error: "You have already voted on this proposal" });
    }

    const votingPower = await storage.calculateVotingPower(userId, proposal.offeringId);
    if (votingPower === 0) {
      return res.status(403).json({ error: "You have no voting power for this offering" });
    }

    const vote = await storage.castVote(proposalId, userId, voteDirection, votingPower);

    await logAuditEvent({
      userId,
      action: "governance_vote",
      targetTable: "votes",
      targetId: vote.id,
      metadata: { proposalId, voteDirection, votingPower },
      req,
    });

    res.status(201).json(vote);
  });

  // Property Submissions API
  app.post("/api/property-submissions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertySubmissionSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
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

  app.patch("/api/property-submissions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const submission = await storage.getPropertySubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      if (submission.userId !== req.session.userId) {
        return res.status(403).json({ error: "You can only edit your own submissions" });
      }
      
      const updated = await storage.updatePropertySubmission(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update submission" });
    }
  });

  app.post("/api/property-submissions/:id/submit", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const submission = await storage.getPropertySubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      if (submission.userId !== req.session.userId) {
        return res.status(403).json({ error: "You can only submit your own submissions" });
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

  app.patch("/api/property-submissions/:id/status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
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
  app.post("/api/property-submissions/:id/documents", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const submission = await storage.getPropertySubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      if (submission.userId !== req.session.userId) {
        return res.status(403).json({ error: "You can only add documents to your own submissions" });
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

  app.delete("/api/property-submissions/:submissionId/documents/:docId", isAuthenticated, async (req: Request, res: Response) => {
    const submission = await storage.getPropertySubmission(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    if (submission.userId !== req.session.userId) {
      return res.status(403).json({ error: "You can only delete documents from your own submissions" });
    }
    const deleted = await storage.deleteSubmissionDocument(req.params.docId);
    if (!deleted) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json({ success: true });
  });

  // Property Nominations API
  app.post("/api/nominations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertyNominationSchema.parse({
        ...req.body,
        nominatorId: req.session.userId,
      });
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

  // Owner detection routes
  app.post("/api/owner-lookup/address", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { address, city, state } = req.body;
    
    if (!address || !city || !state) {
      return res.status(400).json({ error: "Address, city, and state are required" });
    }
    
    const result = await lookupOwnerByAddress(address, city, state);
    res.json(result);
  });

  app.post("/api/owner-lookup/coordinates", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;
    
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "Valid latitude and longitude are required" });
    }
    
    const result = await lookupOwnerByCoordinates(latitude, longitude);
    res.json(result);
  });

  // Admin route to approve a nomination for tokenization
  app.post("/api/nominations/:id/approve", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const nomination = await storage.getPropertyNomination(req.params.id);
      if (!nomination) {
        return res.status(404).json({ error: "Nomination not found" });
      }
      
      // Update nomination status to approved
      await storage.updateNominationOwnerInfo(req.params.id, {
        ownerResponseStatus: "interested", // Owner has agreed to participate
      });
      
      // In production, this would also:
      // - Verify owner has confirmed interest
      // - Check all required documentation
      // - Create a formal property listing
      
      res.json({ 
        success: true, 
        message: "Nomination approved for tokenization",
        nominationId: req.params.id 
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to approve nomination" });
    }
  });

  app.post("/api/nominations/:id/lookup-owner", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const nominationId = req.params.id;
    const nomination = await storage.getPropertyNomination(nominationId);
    
    if (!nomination) {
      return res.status(404).json({ error: "Nomination not found" });
    }
    
    let result;
    if (nomination.latitude && nomination.longitude) {
      result = await lookupOwnerByCoordinates(
        parseFloat(nomination.latitude),
        parseFloat(nomination.longitude)
      );
    } else {
      result = await lookupOwnerByAddress(
        nomination.propertyAddress,
        nomination.city,
        nomination.state
      );
    }
    
    if (result.success && result.owner) {
      await storage.updateNominationOwnerInfo(nominationId, {
        ownerDetectionStatus: "found",
        detectedOwnerName: result.owner.name,
        detectedOwnerAddress: result.owner.mailingAddress,
        detectedOwnerEmail: result.owner.email,
        detectedOwnerPhone: result.owner.phone,
        ownerDataSource: result.owner.dataSource,
        ownerDataConfidence: result.owner.confidence === "high" ? 90 : result.owner.confidence === "medium" ? 60 : 30,
      });
    }
    
    res.json(result);
  });

  app.post("/api/nominations/:id/notify-owner", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const nominationId = req.params.id;
    const nomination = await storage.getPropertyNomination(nominationId);
    
    if (!nomination) {
      return res.status(404).json({ error: "Nomination not found" });
    }
    
    if (!nomination.detectedOwnerName) {
      return res.status(400).json({ error: "Owner information not found. Run owner lookup first." });
    }
    
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const votes = await storage.getDesiredUseVotes(nominationId);
    
    // Group votes by desired use and count them
    const votesByUse: Record<string, number> = {};
    for (const vote of votes) {
      votesByUse[vote.desiredUse] = (votesByUse[vote.desiredUse] || 0) + 1;
    }
    const topUse = Object.entries(votesByUse).length > 0
      ? Object.entries(votesByUse).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : "community development";
    
    const outreach = prepareOwnerOutreach(
      nominationId,
      nomination.detectedOwnerName,
      nomination.propertyAddress,
      topUse,
      baseUrl
    );
    
    const results = await notifyPropertyOwner(
      outreach,
      nomination.detectedOwnerEmail || undefined,
      nomination.detectedOwnerPhone || undefined
    );
    
    for (const result of results) {
      logNotification({
        nominationId,
        timestamp: new Date(),
        channel: result.channel as "email" | "sms" | "link",
        recipient: result.channel === "email" ? nomination.detectedOwnerEmail || undefined : nomination.detectedOwnerPhone || undefined,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });
    }
    
    await storage.updateNominationOwnerInfo(nominationId, {
      ownerNotifiedAt: new Date(),
      ownerNotificationLink: outreach.notificationLink,
    });
    
    res.json({ 
      success: true, 
      notificationLink: outreach.notificationLink,
      results 
    });
  });

  app.get("/api/owner-response/:token", async (req: Request, res: Response) => {
    const decoded = decodeOwnerNotificationToken(req.params.token);
    
    if (!decoded) {
      return res.status(400).json({ error: "Invalid or expired link" });
    }
    
    const nomination = await storage.getPropertyNomination(decoded.nominationId);
    if (!nomination) {
      return res.status(404).json({ error: "Property nomination not found" });
    }
    
    const votes = await storage.getDesiredUseVotes(decoded.nominationId);
    
    res.json({
      nomination: {
        propertyAddress: nomination.propertyAddress,
        city: nomination.city,
        county: nomination.county,
        state: nomination.state,
        description: nomination.description,
      },
      communityVotes: votes,
      tokenExpiresAt: new Date(decoded.timestamp + 30 * 24 * 60 * 60 * 1000),
    });
  });

  app.post("/api/owner-response/:token", async (req: Request, res: Response) => {
    const decoded = decodeOwnerNotificationToken(req.params.token);
    
    if (!decoded) {
      return res.status(400).json({ error: "Invalid or expired link" });
    }
    
    const { interested, contactEmail, contactPhone, message } = req.body;
    
    const nomination = await storage.getPropertyNomination(decoded.nominationId);
    if (!nomination) {
      return res.status(404).json({ error: "Property nomination not found" });
    }
    
    const responseStatus = interested ? "interested" : "not_interested";
    
    await storage.updateNominationOwnerInfo(decoded.nominationId, {
      ownerResponseStatus: responseStatus,
      detectedOwnerEmail: contactEmail || nomination.detectedOwnerEmail,
      detectedOwnerPhone: contactPhone || nomination.detectedOwnerPhone,
    });
    
    // Log the owner response for tracking
    logNotification({
      nominationId: decoded.nominationId,
      timestamp: new Date(),
      channel: "link",
      recipient: contactEmail || nomination.detectedOwnerEmail || undefined,
      success: true,
    });
    
    console.log(`[Owner Response] ${nomination.propertyAddress}: Owner responded as ${responseStatus}`);
    
    res.json({ success: true, message: "Response recorded. We will be in touch shortly." });
  });

  // Tokenization routes
  app.post("/api/tokenize", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { nominationId, propertyValue, tokenName, tokenSymbol, totalTokens } = req.body;
    
    if (!nominationId || !propertyValue || !tokenName || !tokenSymbol || !totalTokens) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = await initiateTokenization({
      nominationId,
      propertyValue,
      tokenName,
      tokenSymbol,
      totalTokens,
    });
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.status(201).json(result);
  });

  app.get("/api/tokenization-status/:propertyId", async (req: Request, res: Response) => {
    const status = await getTokenizationStatus(req.params.propertyId);
    res.json(status);
  });

  app.post("/api/offerings/:offeringId/advance-phase", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const result = await advancePhase(req.params.offeringId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    try {
      if (result.newPhase) {
        const offering = await storage.getTokenOffering(req.params.offeringId);
        if (offering) {
          const property = await storage.getProperty(offering.propertyId);
          const holdings = await storage.getHoldingsByOffering(req.params.offeringId);
          for (const holding of holdings) {
            const user = await storage.getUser(holding.userId);
            if (user?.email && user.emailNotificationsEnabled !== false) {
              await sendPhaseAdvancementNotification(
                user.email,
                property?.name || "Property",
                result.newPhase,
                holding.tokenCount
              );
            }
          }
        }
      }
    } catch (emailErr) {
      console.error("[Email] Failed to send phase advancement notifications:", emailErr);
    }
    
    res.json(result);
  });

  app.post("/api/offerings/:offeringId/process-refunds", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const result = await processRefunds(req.params.offeringId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    try {
      if (result.refundsProcessed > 0) {
        const offering = await storage.getTokenOffering(req.params.offeringId);
        if (offering) {
          const property = await storage.getProperty(offering.propertyId);
          const holdings = await storage.getHoldingsByOffering(req.params.offeringId);
          for (const holding of holdings) {
            const user = await storage.getUser(holding.userId);
            if (user?.email && user.emailNotificationsEnabled !== false) {
              const detail = result.refundDetails.find(d => d.purchaseId);
              const interest = detail?.interest || 0;
              const total = detail?.total || 0;
              await sendRefundNotification(
                user.email,
                property?.name || "Property",
                total,
                interest
              );
            }
          }
        }
      }
    } catch (emailErr) {
      console.error("[Email] Failed to send refund notifications:", emailErr);
    }
    
    res.json(result);
  });

  app.get("/api/blockchain/explorer/:type/:value", async (req: Request, res: Response) => {
    const { type, value } = req.params;
    
    if (type !== "address" && type !== "tx") {
      return res.status(400).json({ error: "Type must be 'address' or 'tx'" });
    }
    
    const url = getExplorerUrl(type as "address" | "tx", value);
    res.json({ url });
  });

  // User and KYC routes
  app.get("/api/user", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    res.json(user);
  });

  app.get("/api/user/holdings", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const holdings = await storage.getUserHoldings(userId);
    res.json(holdings);
  });

  app.post("/api/user/kyc", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const { firstName, lastName, county, state, country } = req.body;
    const currentUser = await storage.getUser(userId);
    
    const user = await storage.upsertUser({
      id: userId,
      email: currentUser?.email,
      firstName,
      lastName,
      county,
      state,
      country: country || "USA",
      kycStatus: "submitted",
    });
    
    res.json({ success: true, user });
  });

  app.post("/api/user/wallet", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }
    
    const currentUser = await storage.getUser(userId);
    const user = await storage.upsertUser({
      id: userId,
      email: currentUser?.email,
      walletAddress,
    });
    
    res.json({ success: true, user });
  });

  app.post("/api/user/acknowledge-risks", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const currentUser = await storage.getUser(userId);
    const user = await storage.upsertUser({
      id: userId,
      email: currentUser?.email,
      riskDisclosureAcknowledgedAt: new Date(),
    });

    res.json({ success: true, user });
  });

  app.get("/api/user/purchases", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const purchases = await storage.getUserPurchases(userId);
    
    const purchasesWithDetails = await Promise.all(purchases.map(async (purchase) => {
      const offering = await storage.getTokenOffering(purchase.offeringId);
      const property = offering ? await storage.getProperty(offering.propertyId) : null;
      return {
        ...purchase,
        propertyName: property?.name || "Unknown Property",
        tokenSymbol: offering?.tokenSymbol || "TOKEN",
      };
    }));
    
    res.json(purchasesWithDetails);
  });

  app.patch("/api/user/email-preferences", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { emailNotificationsEnabled } = req.body;
    if (typeof emailNotificationsEnabled !== "boolean") {
      return res.status(400).json({ error: "emailNotificationsEnabled must be a boolean" });
    }
    const currentUser = await storage.getUser(userId);
    const user = await storage.upsertUser({
      id: userId,
      email: currentUser?.email,
      emailNotificationsEnabled,
    });
    res.json({ success: true, emailNotificationsEnabled: user.emailNotificationsEnabled });
  });

  // Admin submissions endpoint
  app.get("/api/submissions", async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    let submissions;
    if (status) {
      submissions = await storage.getPropertySubmissionsByStatus(status as any);
    } else {
      submissions = await storage.getPropertySubmissionsByStatus("submitted");
    }
    res.json(submissions);
  });

  // Admin KYC verification endpoints
  app.get("/api/admin/kyc-pending", isAdmin, async (req: Request, res: Response) => {
    const users = await storage.getUsersByKYCStatus("submitted");
    res.json(users);
  });

  app.post("/api/admin/kyc/:userId/approve", isAdmin, async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updatedUser = await storage.upsertUser({
      ...user,
      kycStatus: "verified",
      kycVerifiedAt: new Date(),
    });
    await logAuditEvent({
      userId: req.session.userId,
      action: "kyc_approved",
      targetTable: "users",
      targetId: userId,
      metadata: { previousStatus: user.kycStatus },
      req,
    });
    res.json({ success: true, user: updatedUser });
  });

  app.post("/api/admin/kyc/:userId/reject", isAdmin, async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updatedUser = await storage.upsertUser({
      ...user,
      kycStatus: "rejected",
    });
    await logAuditEvent({
      userId: req.session.userId,
      action: "kyc_rejected",
      targetTable: "users",
      targetId: userId,
      metadata: { previousStatus: user.kycStatus },
      req,
    });
    res.json({ success: true, user: updatedUser });
  });

  // Admin: Payment Reconciliation - view stuck purchases and manage reconciliation
  app.get("/api/admin/reconciliation/stuck", isAdmin, async (req: Request, res: Response) => {
    try {
      const minutes = parseInt(req.query.minutes as string) || 10;
      const stuckPurchases = await storage.getStuckPurchases(minutes);

      const purchasesWithDetails = await Promise.all(stuckPurchases.map(async (purchase) => {
        const offering = await storage.getTokenOffering(purchase.offeringId);
        const property = offering ? await storage.getProperty(offering.propertyId) : null;
        const user = await storage.getUser(purchase.userId);
        return {
          ...purchase,
          propertyName: property?.name || "Unknown Property",
          tokenSymbol: offering?.tokenSymbol || "TOKEN",
          userEmail: user?.email || "Unknown",
          userName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Unknown",
        };
      }));

      res.json(purchasesWithDetails);
    } catch (error) {
      console.error("[Reconciliation] Error fetching stuck purchases:", error);
      res.status(500).json({ error: "Failed to fetch stuck purchases" });
    }
  });

  app.get("/api/admin/reconciliation/all", isAdmin, async (req: Request, res: Response) => {
    try {
      const allPurchases = await storage.getAllPurchases();

      const purchasesWithDetails = await Promise.all(allPurchases.map(async (purchase) => {
        const offering = await storage.getTokenOffering(purchase.offeringId);
        const property = offering ? await storage.getProperty(offering.propertyId) : null;
        const user = await storage.getUser(purchase.userId);
        return {
          ...purchase,
          propertyName: property?.name || "Unknown Property",
          tokenSymbol: offering?.tokenSymbol || "TOKEN",
          userEmail: user?.email || "Unknown",
          userName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Unknown",
        };
      }));

      res.json(purchasesWithDetails);
    } catch (error) {
      console.error("[Reconciliation] Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.post("/api/admin/reconciliation/:purchaseId/retry", isAdmin, async (req: Request, res: Response) => {
    try {
      const { purchaseId } = req.params;
      const purchase = await storage.getAllPurchases().then(ps => ps.find(p => p.id === purchaseId));

      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }

      if (purchase.reconciliationStatus !== "failed_mint" && purchase.reconciliationStatus !== "minting") {
        return res.status(400).json({ error: "Purchase is not in a retriable state" });
      }

      await storage.updatePurchaseReconciliationStatus(purchaseId, "minting");

      await logAuditEvent({
        userId: req.session.userId,
        action: "reconciliation_retry",
        targetTable: "token_purchases",
        targetId: purchaseId,
        metadata: { previousStatus: purchase.reconciliationStatus },
        req,
      });

      res.json({ success: true, message: "Purchase marked for retry" });
    } catch (error) {
      console.error("[Reconciliation] Error retrying purchase:", error);
      res.status(500).json({ error: "Failed to retry purchase" });
    }
  });

  app.post("/api/admin/reconciliation/:purchaseId/refund", isAdmin, async (req: Request, res: Response) => {
    try {
      const { purchaseId } = req.params;
      const purchase = await storage.getAllPurchases().then(ps => ps.find(p => p.id === purchaseId));

      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }

      if (purchase.reconciliationStatus !== "failed_mint") {
        return res.status(400).json({ error: "Only failed_mint purchases can be refunded" });
      }

      await storage.updatePurchaseReconciliationStatus(purchaseId, "refund_initiated");

      await logAuditEvent({
        userId: req.session.userId,
        action: "reconciliation_refund_initiated",
        targetTable: "token_purchases",
        targetId: purchaseId,
        metadata: { amount: purchase.totalAmount, userId: purchase.userId },
        req,
      });

      if (purchase.paymentIntentId) {
        try {
          const { processRefund: processStripeRefund } = await import("./services/payments");
          await processStripeRefund(purchase.paymentIntentId, parseFloat(purchase.totalAmount));
          await storage.updatePurchaseStatus(purchaseId, "refunded");
        } catch (refundErr) {
          console.error("[Reconciliation] Stripe refund failed:", refundErr);
          return res.status(500).json({ error: "Stripe refund failed — purchase flagged for manual review" });
        }
      } else {
        await storage.updatePurchaseStatus(purchaseId, "refunded");
      }

      res.json({ success: true, message: "Refund processed for failed purchase" });
    } catch (error) {
      console.error("[Reconciliation] Error initiating refund:", error);
      res.status(500).json({ error: "Failed to initiate refund" });
    }
  });

  // Investor protection: Calculate refund with 3% APR
  app.get("/api/investor-protection/:propertyId", async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const offering = await storage.getOfferingByPropertyId(propertyId);
    if (!offering) {
      return res.json({
        eligible: false,
        reason: "No active offering for this property",
      });
    }

    const holdings = await storage.getUserHoldings(userId);
    const propertyHolding = holdings.find(h => h.offeringId === offering.id);

    if (!propertyHolding) {
      return res.json({
        eligible: false,
        reason: "You have no holdings in this property",
      });
    }

    const fundingGoal = parseFloat(offering.minimumFundingThreshold?.toString() || "0");
    const fundingRaised = parseFloat(offering.totalFundingRaised?.toString() || "0");
    const fundingPercent = fundingGoal > 0 ? (fundingRaised / fundingGoal) * 100 : 0;
    const minimumThreshold = 60;

    const deadlineDate = offering.fundingDeadline ? new Date(offering.fundingDeadline) : null;
    const now = new Date();
    const deadlinePassed = deadlineDate ? now > deadlineDate : false;

    const tokenCount = propertyHolding.tokenCount;
    const avgPrice = parseFloat(propertyHolding.averagePurchasePrice || "0");
    const investedAmount = tokenCount * avgPrice;
    const holdingUpdatedAt = propertyHolding.updatedAt ? new Date(propertyHolding.updatedAt) : now;
    const daysHeld = Math.floor((now.getTime() - holdingUpdatedAt.getTime()) / (1000 * 60 * 60 * 24));
    const yearFraction = daysHeld / 365;
    const aprAmount = investedAmount * 0.03 * yearFraction;
    const refundAmount = investedAmount + aprAmount;

    const eligible = fundingPercent < minimumThreshold && deadlinePassed;

    res.json({
      eligible,
      fundingPercent: fundingPercent.toFixed(1),
      minimumThreshold,
      deadlinePassed,
      deadline: offering.fundingDeadline,
      investedAmount: investedAmount.toFixed(2),
      tokenCount,
      daysHeld,
      aprAmount: aprAmount.toFixed(2),
      refundAmount: refundAmount.toFixed(2),
      options: eligible ? ["refund", "transfer"] : [],
    });
  });

  // Token purchase endpoint with phase enforcement
  app.post("/api/purchase", isAuthenticated, requireKYCApproved, purchaseRateLimit, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { propertyId, tokenCount, phase, paymentMethod, amount } = req.body;

    if (!propertyId || !tokenCount || !phase || !paymentMethod || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await storage.getUser(userId);
    if (!user || user.kycStatus !== "verified") {
      return res.status(403).json({ error: "KYC verification required" });
    }

    if (!user.riskDisclosureAcknowledgedAt) {
      return res.status(403).json({ error: "Risk disclosure acknowledgment required before purchasing" });
    }

    if (!user.walletAddress) {
      return res.status(403).json({ error: "Wallet connection required" });
    }

    const offering = await storage.getOfferingByPropertyId(propertyId);
    if (!offering) {
      return res.status(404).json({ error: "Property offering not found" });
    }

    if (!tokenCount || tokenCount <= 0 || !Number.isInteger(tokenCount)) {
      return res.status(400).json({ error: "Invalid token count" });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const phases = await storage.getOfferingPhases(offering.id);
    const activePhase = phases.find(p => p.phase === phase && p.isActive);
    
    if (!activePhase) {
      return res.status(403).json({ error: `Phase '${phase}' is not currently active for this offering` });
    }

    const eligibility = await storage.canUserPurchase(userId, activePhase.id, tokenCount);
    if (!eligibility.allowed) {
      return res.status(403).json({ error: eligibility.reason });
    }

    const expectedPrice = parseFloat(activePhase.currentPrice) * tokenCount;
    const priceTolerance = 0.01;
    if (Math.abs(expectedPrice - amount) > priceTolerance * expectedPrice) {
      return res.status(400).json({ error: "Price mismatch. Please refresh and try again." });
    }

    const VOTING_MULTIPLIERS: Record<string, number> = {
      county: 1.5,
      state: 1.25,
      national: 1.0,
      international: 0.75,
    };

    const pricePerToken = amount / tokenCount;
    const votingPower = Math.round(tokenCount * (VOTING_MULTIPLIERS[phase] || 1));

    if (paymentMethod === "card") {
      const paymentIntent = await createPaymentIntent(amount, {
        userId,
        propertyId,
        tokenCount,
        phase,
      });

      if (!paymentIntent) {
        return res.status(500).json({ error: "Failed to create payment" });
      }

      const purchase = await storage.createPurchase({
        userId,
        propertyId,
        offeringId: offering.id,
        tokenCount,
        pricePerToken: pricePerToken.toFixed(2),
        totalAmount: amount.toFixed(2),
        paymentMethod,
        phase,
        votingPower,
        status: "pending",
        paymentIntentId: paymentIntent.id,
      });

      await storage.updatePurchaseReconciliationStatus(purchase.id, "pending_payment");

      await logAuditEvent({
        userId,
        action: "purchase_initiated",
        targetTable: "token_purchases",
        targetId: purchase.id,
        metadata: { reconciliationStatus: "pending_payment", paymentMethod: "card", amount },
        req,
      });

      return res.json({ 
        success: true, 
        purchase,
        paymentIntent: {
          clientSecret: paymentIntent.clientSecret,
          id: paymentIntent.id,
        }
      });
    }

    const purchase = await storage.createPurchase({
      userId,
      propertyId,
      offeringId: offering.id,
      tokenCount,
      pricePerToken: pricePerToken.toFixed(2),
      totalAmount: amount.toFixed(2),
      paymentMethod,
      phase,
      votingPower,
      status: paymentMethod === "usdc" ? "pending_crypto" : "completed",
    });

    if (paymentMethod === "usdc") {
      await storage.updatePurchaseReconciliationStatus(purchase.id, "pending_payment");
      await logAuditEvent({
        userId,
        action: "purchase_initiated",
        targetTable: "token_purchases",
        targetId: purchase.id,
        metadata: { reconciliationStatus: "pending_payment", paymentMethod: "usdc", amount },
        req,
      });
    } else {
      await storage.updatePurchaseReconciliationStatus(purchase.id, "confirmed");
      await storage.updateOrCreateHolding(userId, offering.id, tokenCount, pricePerToken, votingPower);

      await logAuditEvent({
        userId,
        action: "purchase_confirmed",
        targetTable: "token_purchases",
        targetId: purchase.id,
        metadata: { reconciliationStatus: "confirmed", paymentMethod, amount },
        req,
      });

      try {
        if (user.email && user.emailNotificationsEnabled !== false) {
          const property = await storage.getProperty(propertyId);
          if (property) {
            await sendPurchaseConfirmation(user.email, property.name, tokenCount, amount);
          }
        }
      } catch (emailErr) {
        console.error("[Email] Failed to send purchase confirmation:", emailErr);
      }
    }

    res.json({ success: true, purchase });
  });

  // Confirm payment and update holdings (verifies payment with Stripe)
  // Two-phase commit: payment_received → minting → confirmed (or failed_mint)
  app.post("/api/purchase/confirm", isAuthenticated, requireKYCApproved, purchaseRateLimit, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID required" });
    }

    const existingPurchase = await storage.getPurchaseByPaymentIntentId(paymentIntentId);

    const verification = await verifyPaymentAndGetMetadata(paymentIntentId, userId);
    
    if (!verification.success) {
      if (existingPurchase) {
        await storage.updatePurchaseReconciliationStatus(existingPurchase.id, "failed_mint");
        await logAuditEvent({
          userId,
          action: "payment_verification_failed",
          targetTable: "token_purchases",
          targetId: existingPurchase.id,
          metadata: { paymentIntentId, error: verification.error, reconciliationStatus: "failed_mint" },
          req,
        });
      }
      return res.status(400).json({ error: verification.error });
    }

    if (!verification.metadata) {
      return res.status(400).json({ error: "Payment not configured for production mode" });
    }

    if (existingPurchase) {
      await storage.updatePurchaseReconciliationStatus(existingPurchase.id, "payment_received");
      await logAuditEvent({
        userId,
        action: "payment_received",
        targetTable: "token_purchases",
        targetId: existingPurchase.id,
        metadata: { paymentIntentId, reconciliationStatus: "payment_received" },
        req,
      });
    }

    const { propertyId, tokenCount, phase } = verification.metadata;
    const amount = verification.amount!;

    const offering = await storage.getOfferingByPropertyId(propertyId);
    if (!offering) {
      if (existingPurchase) {
        await storage.updatePurchaseReconciliationStatus(existingPurchase.id, "failed_mint");
        await logAuditEvent({
          userId,
          action: "mint_failed_no_offering",
          targetTable: "token_purchases",
          targetId: existingPurchase.id,
          metadata: { propertyId, reconciliationStatus: "failed_mint" },
          req,
        });
      }
      return res.status(404).json({ error: "Property offering not found" });
    }

    if (existingPurchase) {
      await storage.updatePurchaseReconciliationStatus(existingPurchase.id, "minting");
      await logAuditEvent({
        userId,
        action: "minting_started",
        targetTable: "token_purchases",
        targetId: existingPurchase.id,
        metadata: { reconciliationStatus: "minting" },
        req,
      });
    }

    const VOTING_MULTIPLIERS: Record<string, number> = {
      county: 1.5,
      state: 1.25,
      national: 1.0,
      international: 0.75,
    };

    const pricePerToken = amount / tokenCount;
    const votingPower = Math.round(tokenCount * (VOTING_MULTIPLIERS[phase] || 1));

    try {
      await storage.updateOrCreateHolding(userId, offering.id, tokenCount, pricePerToken, votingPower);

      if (existingPurchase) {
        await storage.updatePurchaseStatus(existingPurchase.id, "confirmed");
        await storage.updatePurchaseReconciliationStatus(existingPurchase.id, "confirmed");
        await logAuditEvent({
          userId,
          action: "purchase_confirmed",
          targetTable: "token_purchases",
          targetId: existingPurchase.id,
          metadata: { reconciliationStatus: "confirmed", tokenCount, amount },
          req,
        });
      }
    } catch (mintError) {
      console.error("[Purchase] Minting/holding update failed after payment:", mintError);
      if (existingPurchase) {
        await storage.updatePurchaseReconciliationStatus(existingPurchase.id, "failed_mint");
        await logAuditEvent({
          userId,
          action: "mint_failed",
          targetTable: "token_purchases",
          targetId: existingPurchase.id,
          metadata: { reconciliationStatus: "failed_mint", error: String(mintError) },
          req,
        });
      }
      return res.status(500).json({ error: "Payment received but minting failed. Your purchase has been flagged for admin review and refund processing." });
    }

    try {
      const user = await storage.getUser(userId);
      if (user?.email && user.emailNotificationsEnabled !== false) {
        const property = await storage.getProperty(propertyId);
        if (property) {
          await sendPurchaseConfirmation(user.email, property.name, tokenCount, amount);
        }
      }
    } catch (emailErr) {
      console.error("[Email] Failed to send purchase confirmation:", emailErr);
    }

    res.json({ success: true, message: "Purchase confirmed and holdings updated" });
  });

  // ===== Private Offering Routes =====
  
  // Create a private offering invite
  app.post("/api/private-offerings/:offeringId/invites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { offeringId } = req.params;
      const { email, inviteeName, maxTokens, expiresInDays } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Verify user owns the property/offering
      const offering = await storage.getTokenOffering(offeringId);
      if (!offering) {
        return res.status(404).json({ error: "Offering not found" });
      }

      if (offering.offeringType !== "private") {
        return res.status(400).json({ error: "This is not a private offering" });
      }

      // Generate unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) 
        : null;

      const invite = await storage.createPrivateOfferingInvite({
        offeringId,
        email,
        inviteeName: inviteeName || null,
        inviteCode,
        maxTokens: maxTokens || null,
        invitedBy: userId,
        expiresAt,
      });

      res.status(201).json(invite);
    } catch (error) {
      console.error("Error creating invite:", error);
      res.status(500).json({ error: "Failed to create invite" });
    }
  });

  // Get all invites for an offering (property owner only)
  app.get("/api/private-offerings/:offeringId/invites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { offeringId } = req.params;
      const invites = await storage.getPrivateOfferingInvitesByOffering(offeringId);
      res.json(invites);
    } catch (error) {
      console.error("Error fetching invites:", error);
      res.status(500).json({ error: "Failed to fetch invites" });
    }
  });

  // Validate an invite or access code
  app.post("/api/private-offerings/validate-access", async (req: Request, res: Response) => {
    try {
      const { offeringId, accessCode, inviteCode } = req.body;

      if (!offeringId) {
        return res.status(400).json({ error: "Offering ID is required" });
      }

      // Check if it's a valid access code
      if (accessCode) {
        const isValid = await storage.validatePrivateOfferingAccess(offeringId, accessCode);
        return res.json({ valid: isValid, type: "accessCode" });
      }

      // Check if it's a valid invite code
      if (inviteCode) {
        const invite = await storage.validateInviteCode(offeringId, inviteCode);
        if (invite) {
          return res.json({ 
            valid: true, 
            type: "inviteCode", 
            invite: {
              id: invite.id,
              email: invite.email,
              inviteeName: invite.inviteeName,
              maxTokens: invite.maxTokens
            }
          });
        }
        return res.json({ valid: false, type: "inviteCode" });
      }

      return res.status(400).json({ error: "Either accessCode or inviteCode is required" });
    } catch (error) {
      console.error("Error validating access:", error);
      res.status(500).json({ error: "Failed to validate access" });
    }
  });

  // Accept an invite (mark as accepted when user starts the purchase process)
  app.post("/api/private-offerings/invites/:inviteId/accept", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { inviteId } = req.params;
      const invite = await storage.getPrivateOfferingInvite(inviteId);
      
      if (!invite) {
        return res.status(404).json({ error: "Invite not found" });
      }

      if (invite.status === "expired" || invite.status === "declined") {
        return res.status(400).json({ error: "This invite is no longer valid" });
      }

      if (invite.expiresAt && invite.expiresAt < new Date()) {
        await storage.updatePrivateOfferingInviteStatus(inviteId, "expired");
        return res.status(400).json({ error: "This invite has expired" });
      }

      const updated = await storage.updatePrivateOfferingInviteStatus(inviteId, "accepted");
      res.json(updated);
    } catch (error) {
      console.error("Error accepting invite:", error);
      res.status(500).json({ error: "Failed to accept invite" });
    }
  });

  // Get offering with access check for private offerings
  app.get("/api/offerings/:offeringId/with-access", async (req: Request, res: Response) => {
    try {
      const { offeringId } = req.params;
      const { accessCode, inviteCode } = req.query as { accessCode?: string; inviteCode?: string };

      const offering = await storage.getTokenOffering(offeringId);
      if (!offering) {
        return res.status(404).json({ error: "Offering not found" });
      }

      // If public offering, return it
      if (offering.offeringType === "public" || offering.offeringType === null) {
        const property = await storage.getProperty(offering.propertyId);
        const phases = await storage.getOfferingPhases(offeringId);
        return res.json({ 
          offering, 
          property, 
          phases,
          accessGranted: true,
          isPrivate: false
        });
      }

      // For private offerings, validate access
      let accessGranted = false;
      let inviteDetails = null;

      if (accessCode) {
        accessGranted = await storage.validatePrivateOfferingAccess(offeringId, accessCode);
      }

      if (!accessGranted && inviteCode) {
        const invite = await storage.validateInviteCode(offeringId, inviteCode);
        if (invite) {
          accessGranted = true;
          inviteDetails = {
            id: invite.id,
            maxTokens: invite.maxTokens,
            tokensPurchased: invite.tokensPurchased
          };
        }
      }

      if (!accessGranted) {
        return res.json({ 
          isPrivate: true,
          accessGranted: false,
          message: "This is a private offering. Please provide a valid access code or invite."
        });
      }

      const property = await storage.getProperty(offering.propertyId);
      const phases = await storage.getOfferingPhases(offeringId);
      
      res.json({ 
        offering, 
        property, 
        phases,
        accessGranted: true,
        isPrivate: true,
        inviteDetails
      });
    } catch (error) {
      console.error("Error fetching offering with access:", error);
      res.status(500).json({ error: "Failed to fetch offering" });
    }
  });

  // Property Grants API
  app.get("/api/properties/:propertyId/grants", async (req: Request, res: Response) => {
    try {
      const grants = await storage.getPropertyGrantsByProperty(req.params.propertyId);
      res.json(grants);
    } catch (error) {
      console.error("Error fetching grants:", error);
      res.status(500).json({ error: "Failed to fetch grants" });
    }
  });

  app.get("/api/properties/:propertyId/capital-stack", async (req: Request, res: Response) => {
    try {
      const summary = await storage.getCapitalStackSummary(req.params.propertyId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching capital stack:", error);
      res.status(500).json({ error: "Failed to fetch capital stack" });
    }
  });

  app.post("/api/properties/:propertyId/grants", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertyGrantSchema.parse({
        ...req.body,
        propertyId: req.params.propertyId,
      });
      const grant = await storage.createPropertyGrant(validatedData);
      res.status(201).json(grant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid grant data", details: error.errors });
      }
      console.error("Error creating grant:", error);
      res.status(500).json({ error: "Failed to create grant" });
    }
  });

  app.patch("/api/grants/:grantId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const grant = await storage.updatePropertyGrant(req.params.grantId, req.body);
      if (!grant) {
        return res.status(404).json({ error: "Grant not found" });
      }
      res.json(grant);
    } catch (error) {
      console.error("Error updating grant:", error);
      res.status(500).json({ error: "Failed to update grant" });
    }
  });

  app.delete("/api/grants/:grantId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deletePropertyGrant(req.params.grantId);
      if (!deleted) {
        return res.status(404).json({ error: "Grant not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting grant:", error);
      res.status(500).json({ error: "Failed to delete grant" });
    }
  });

  // Stripe webhook endpoint for payment confirmations
  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log("[Webhook] Stripe webhook secret not configured");
      return res.status(200).json({ received: true, processed: false });
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      return res.status(400).json({ error: "Missing raw body" });
    }

    const event = constructWebhookEvent(rawBody, signature, webhookSecret);
    if (!event) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    try {
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const { userId, propertyId, tokenCount, phase } = paymentIntent.metadata;

        // Idempotency check: verify this payment hasn't been processed already
        const existingPurchase = await storage.getPurchaseByPaymentIntentId(paymentIntent.id);
        if (existingPurchase && existingPurchase.status === "completed") {
          console.log(`[Webhook] Payment ${paymentIntent.id} already completed - skipping`);
          return res.status(200).json({ received: true, processed: true, duplicate: true });
        }

        const property = await storage.getProperty(propertyId);
        if (!property) {
          console.error(`[Webhook] Property ${propertyId} not found`);
          return res.status(200).json({ received: true, processed: false });
        }

        const offering = await storage.getOfferingByPropertyId(propertyId);
        if (!offering) {
          console.error(`[Webhook] Offering for property ${propertyId} not found`);
          return res.status(200).json({ received: true, processed: false });
        }

        const parsedTokenCount = parseInt(tokenCount, 10);
        const amount = paymentIntent.amount / 100;
        
        // Apply voting power multipliers
        const multiplier = phase === "county" ? 1.5 
          : phase === "state" ? 1.25 
          : phase === "national" ? 1.0 
          : 0.75;
        const addedVotingPower = Math.floor(parsedTokenCount * multiplier);

        // Update holdings with proper voting power
        await storage.updateOrCreateHolding(
          userId,
          offering.id,
          parsedTokenCount,
          amount / parsedTokenCount,
          addedVotingPower
        );

        // Update offering totals
        await storage.updateOffering(offering.id, {
          tokensSold: (offering.tokensSold || 0) + parsedTokenCount,
          totalFundingRaised: String(parseFloat(offering.totalFundingRaised || "0") + amount),
        });

        // Update phase tokens sold
        const phases = await storage.getOfferingPhases(offering.id);
        const activePhase = phases.find(p => p.phase === phase);
        if (activePhase) {
          await storage.updateOfferingPhase(activePhase.id, {
            tokensSold: (activePhase.tokensSold || 0) + parsedTokenCount,
          });
        }

        // Update existing purchase status or create completed record
        if (existingPurchase && existingPurchase.status === "pending") {
          // Update purchase status to completed (existing pending purchase from /api/purchase)
          await storage.updatePurchaseStatus(existingPurchase.id, "completed");
        } else if (!existingPurchase) {
          // Create new purchase record if none exists (shouldn't happen normally, but handle edge case)
          await storage.createPurchase({
            userId,
            offeringId: offering.id,
            tokenCount: parsedTokenCount,
            phase,
            pricePerToken: String(amount / parsedTokenCount),
            totalAmount: String(amount),
            paymentMethod: "card",
            paymentIntentId: paymentIntent.id,
            status: "completed",
          });
        }

        const user = await storage.getUser(userId);
        if (user?.email && user.emailNotificationsEnabled !== false) {
          await sendPurchaseConfirmation(user.email, property.name, parsedTokenCount, amount);
        }

        console.log(`[Webhook] Payment processed: ${parsedTokenCount} tokens for user ${userId}`);
      }

      res.status(200).json({ received: true, processed: true });
    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Waitlist signup endpoint
  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      const { email, role, message } = req.body;
      
      if (!email || !role) {
        return res.status(400).json({ error: "Email and role are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      // Validate role
      const validRoles = ["investor", "property_owner", "community_member", "other"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      // Validate message length if provided
      const sanitizedMessage = message ? String(message).slice(0, 250) : undefined;
      
      // Check if email already exists
      const existing = await storage.getWaitlistByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "This email is already on the waitlist" });
      }
      
      const entry = await storage.addToWaitlist(email, role, sanitizedMessage);
      
      // Send notification email to admin (non-blocking)
      try {
        const emailSent = await sendWaitlistNotification(email, role, sanitizedMessage);
        if (!emailSent) {
          console.log(`[Waitlist] Admin notification email not sent for ${email}`);
        }
      } catch (emailError) {
        console.error("[Waitlist] Failed to send admin notification:", emailError);
      }
      
      res.status(201).json({ success: true, message: "Successfully joined the waitlist!", id: entry.id });
    } catch (error) {
      console.error("Waitlist signup error:", error);
      res.status(500).json({ error: "Failed to join waitlist" });
    }
  });

  app.get("/api/wishes", async (req: Request, res: Response) => {
    try {
      const zipCode = req.query.zipCode as string | undefined;
      const allWishes = zipCode 
        ? await storage.getWishesByZipCode(zipCode)
        : await storage.getWishes();
      res.json(allWishes);
    } catch (error) {
      console.error("Failed to fetch wishes:", error);
      res.status(500).json({ error: "Failed to fetch wishes" });
    }
  });

  app.post("/api/wishes", async (req: Request, res: Response) => {
    try {
      const parsed = insertWishSchema.parse(req.body);
      const wish = await storage.createWish(parsed);
      res.status(201).json(wish);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid wish data", details: error.errors });
      }
      console.error("Failed to create wish:", error);
      res.status(500).json({ error: "Failed to create wish" });
    }
  });

  app.post("/api/wishes/:id/vote", async (req: Request, res: Response) => {
    try {
      const wish = await storage.upvoteWish(req.params.id);
      if (!wish) {
        return res.status(404).json({ error: "Wish not found" });
      }
      res.json(wish);
    } catch (error) {
      console.error("Failed to upvote wish:", error);
      res.status(500).json({ error: "Failed to upvote wish" });
    }
  });

  // Service Bids
  app.get("/api/service-bids", async (req: Request, res: Response) => {
    try {
      const zipCode = req.query.zipCode as string | undefined;
      const bids = zipCode
        ? await storage.getServiceBidsByZipCode(zipCode)
        : await storage.getServiceBids();
      res.json(bids);
    } catch (error) {
      console.error("Failed to fetch service bids:", error);
      res.status(500).json({ error: "Failed to fetch service bids" });
    }
  });

  app.post("/api/service-bids", async (req: Request, res: Response) => {
    try {
      const parsed = insertServiceBidSchema.parse(req.body);
      const bid = await storage.createServiceBid(parsed);
      res.status(201).json(bid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid service bid data", details: error.errors });
      }
      console.error("Failed to create service bid:", error);
      res.status(500).json({ error: "Failed to create service bid" });
    }
  });

  app.patch("/api/service-bids/:id/status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const bid = await storage.updateServiceBidStatus(req.params.id, status);
      if (!bid) {
        return res.status(404).json({ error: "Service bid not found" });
      }
      res.json(bid);
    } catch (error) {
      console.error("Failed to update service bid status:", error);
      res.status(500).json({ error: "Failed to update service bid status" });
    }
  });

  // Professional Profiles
  app.post("/api/professionals/apply", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const existing = await storage.getProfessionalProfileByUserId(userId);
      if (existing) {
        return res.status(409).json({ error: "You already have a professional profile" });
      }
      const { isLicenseVerified, licenseVerifiedAt, isInsuranceVerified, completedProjects, totalEndorsements, reputationScore, ...safeBody } = req.body;
      const profile = await storage.createProfessionalProfile({
        ...safeBody,
        userId,
      });
      await logAuditEvent({
        userId,
        action: "professional_apply",
        targetTable: "professional_profiles",
        targetId: profile.id,
        metadata: { licenseType: req.body.licenseType, licenseState: req.body.licenseState },
        req,
      });
      res.status(201).json(profile);
    } catch (error) {
      console.error("Failed to create professional profile:", error);
      res.status(500).json({ error: "Failed to create professional profile" });
    }
  });

  app.get("/api/professionals", async (req: Request, res: Response) => {
    try {
      const { county, state, specialty, role } = req.query;
      const profiles = await storage.getProfessionalProfiles({
        county: county as string,
        state: state as string,
        specialty: specialty as string,
        role: role as string,
      });
      const verified = profiles.filter(p => p.isLicenseVerified);
      res.json(verified);
    } catch (error) {
      console.error("Failed to fetch professionals:", error);
      res.status(500).json({ error: "Failed to fetch professionals" });
    }
  });

  app.get("/api/professionals/available/:county", async (req: Request, res: Response) => {
    try {
      const profiles = await storage.getProfessionalsByCounty(req.params.county);
      res.json(profiles);
    } catch (error) {
      console.error("Failed to fetch professionals by county:", error);
      res.status(500).json({ error: "Failed to fetch professionals" });
    }
  });

  app.get("/api/professionals/:id", async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfessionalProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Professional profile not found" });
      }
      const endorsementCount = await storage.getEndorsementCount(profile.id);
      res.json({ ...profile, endorsementCount });
    } catch (error) {
      console.error("Failed to fetch professional:", error);
      res.status(500).json({ error: "Failed to fetch professional" });
    }
  });

  app.patch("/api/professionals/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfessionalProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Professional profile not found" });
      }
      if (profile.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized to update this profile" });
      }
      const { userId: _u, isLicenseVerified: _lv, licenseVerifiedAt: _la, isInsuranceVerified: _iv, completedProjects: _cp, totalEndorsements: _te, reputationScore: _rs, id: _id, ...safeUpdate } = req.body;
      const updated = await storage.updateProfessionalProfile(req.params.id, safeUpdate);
      res.json(updated);
    } catch (error) {
      console.error("Failed to update professional profile:", error);
      res.status(500).json({ error: "Failed to update professional profile" });
    }
  });

  app.post("/api/professionals/:id/endorse", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const professionalId = req.params.id;
      const profile = await storage.getProfessionalProfile(professionalId);
      if (!profile) {
        return res.status(404).json({ error: "Professional profile not found" });
      }
      const alreadyEndorsed = await storage.hasUserEndorsed(userId, professionalId);
      if (alreadyEndorsed) {
        return res.status(409).json({ error: "You have already endorsed this professional" });
      }
      const endorsement = await storage.createEndorsement({
        professionalId,
        userId,
        comment: req.body.comment || null,
      });
      res.status(201).json(endorsement);
    } catch (error) {
      console.error("Failed to create endorsement:", error);
      res.status(500).json({ error: "Failed to create endorsement" });
    }
  });

  app.get("/api/professionals/:id/endorsements", async (req: Request, res: Response) => {
    try {
      const endorsements = await storage.getEndorsementsByProfessional(req.params.id);
      res.json(endorsements);
    } catch (error) {
      console.error("Failed to fetch endorsements:", error);
      res.status(500).json({ error: "Failed to fetch endorsements" });
    }
  });

  app.get("/api/professionals/:id/matches", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfessionalProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Professional profile not found" });
      }
      if (profile.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized to view these matches" });
      }
      const matches = await storage.getMatchesByProfessional(req.params.id);
      res.json(matches);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  // Admin Professional Routes
  app.get("/api/admin/professionals/pending", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const profiles = await storage.getProfessionalProfiles({ status: "pending" });
      const pending = profiles.filter(p => !p.isLicenseVerified);
      res.json(pending);
    } catch (error) {
      console.error("Failed to fetch pending professionals:", error);
      res.status(500).json({ error: "Failed to fetch pending professionals" });
    }
  });

  app.post("/api/admin/professionals/:id/verify", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfessionalProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Professional profile not found" });
      }
      const updated = await storage.updateProfessionalProfileStatus(req.params.id, "verified", new Date());
      await logAuditEvent({
        userId: req.session.userId!,
        action: "professional_verify",
        targetTable: "professional_profiles",
        targetId: req.params.id,
        metadata: { professionalUserId: profile.userId },
        req,
      });
      res.json(updated);
    } catch (error) {
      console.error("Failed to verify professional:", error);
      res.status(500).json({ error: "Failed to verify professional" });
    }
  });

  app.post("/api/admin/professionals/:id/reject", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfessionalProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Professional profile not found" });
      }
      const updated = await storage.updateProfessionalProfileStatus(req.params.id, "rejected");
      await logAuditEvent({
        userId: req.session.userId!,
        action: "professional_reject",
        targetTable: "professional_profiles",
        targetId: req.params.id,
        metadata: { professionalUserId: profile.userId },
        req,
      });
      res.json(updated);
    } catch (error) {
      console.error("Failed to reject professional:", error);
      res.status(500).json({ error: "Failed to reject professional" });
    }
  });

  app.post("/api/admin/professionals/:id/suspend", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfessionalProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Professional profile not found" });
      }
      const updated = await storage.updateProfessionalProfileStatus(req.params.id, "suspended");
      await logAuditEvent({
        userId: req.session.userId!,
        action: "professional_suspend",
        targetTable: "professional_profiles",
        targetId: req.params.id,
        metadata: { professionalUserId: profile.userId },
        req,
      });
      res.json(updated);
    } catch (error) {
      console.error("Failed to suspend professional:", error);
      res.status(500).json({ error: "Failed to suspend professional" });
    }
  });

  // Project Matching Routes
  app.get("/api/offerings/:offeringId/professionals", async (req: Request, res: Response) => {
    try {
      const matches = await storage.getMatchesByOffering(req.params.offeringId);
      res.json(matches);
    } catch (error) {
      console.error("Failed to fetch offering professionals:", error);
      res.status(500).json({ error: "Failed to fetch offering professionals" });
    }
  });

  app.post("/api/offerings/:offeringId/professionals/invite", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { professionalId, roleNeeded, proposedAmount, tokenAllocationPercent, tokenAllocationAmount } = req.body;
      if (!professionalId || !roleNeeded) {
        return res.status(400).json({ error: "Missing required fields: professionalId, roleNeeded" });
      }
      const match = await storage.createProjectMatch({
        offeringId: req.params.offeringId,
        professionalId,
        roleNeeded,
        proposedAmount: proposedAmount?.toString(),
        tokenAllocationPercent: tokenAllocationPercent?.toString(),
        tokenAllocationAmount: tokenAllocationAmount?.toString(),
        invitedAt: new Date(),
      });
      await logAuditEvent({
        userId: req.session.userId!,
        action: "professional_invite",
        targetTable: "project_professional_matches",
        targetId: match.id,
        metadata: { offeringId: req.params.offeringId, professionalId, roleNeeded },
        req,
      });
      res.status(201).json(match);
    } catch (error) {
      console.error("Failed to invite professional:", error);
      res.status(500).json({ error: "Failed to invite professional" });
    }
  });

  app.post("/api/professionals/matches/:matchId/respond", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const match = await storage.getProjectMatch(req.params.matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      const profile = await storage.getProfessionalProfile(match.professionalId);
      if (!profile || profile.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized to respond to this match" });
      }
      const { status, proposalDetails, proposedAmount } = req.body;
      if (!["interested", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'interested' or 'rejected'" });
      }
      const updated = await storage.updateProjectMatchStatus(req.params.matchId, status, {
        proposalDetails,
        proposedAmount: proposedAmount?.toString(),
      } as any);
      res.json(updated);
    } catch (error) {
      console.error("Failed to respond to match:", error);
      res.status(500).json({ error: "Failed to respond to match" });
    }
  });

  app.post("/api/offerings/:offeringId/professionals/select", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { matchId, tokenAllocationPercent, tokenAllocationAmount } = req.body;
      if (!matchId) {
        return res.status(400).json({ error: "Missing required field: matchId" });
      }
      const match = await storage.getProjectMatch(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      if (match.offeringId !== req.params.offeringId) {
        return res.status(400).json({ error: "Match does not belong to this offering" });
      }
      const updated = await storage.updateProjectMatchStatus(matchId, "selected", {
        tokenAllocationPercent: tokenAllocationPercent?.toString(),
        tokenAllocationAmount: tokenAllocationAmount?.toString(),
      } as any);
      await logAuditEvent({
        userId: req.session.userId!,
        action: "professional_select",
        targetTable: "project_professional_matches",
        targetId: matchId,
        metadata: { offeringId: req.params.offeringId, tokenAllocationPercent, tokenAllocationAmount },
        req,
      });
      res.json(updated);
    } catch (error) {
      console.error("Failed to select professional:", error);
      res.status(500).json({ error: "Failed to select professional" });
    }
  });

  // Service Area Routes
  app.post("/api/professionals/:id/service-areas", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfessionalProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Professional profile not found" });
      }
      if (profile.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized to modify this profile's service areas" });
      }
      const area = await storage.createServiceArea({
        professionalId: req.params.id,
        ...req.body,
      });
      res.status(201).json(area);
    } catch (error) {
      console.error("Failed to add service area:", error);
      res.status(500).json({ error: "Failed to add service area" });
    }
  });

  app.delete("/api/professionals/:id/service-areas/:areaId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfessionalProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Professional profile not found" });
      }
      if (profile.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized to modify this profile's service areas" });
      }
      const areas = await storage.getServiceAreasByProfessional(req.params.id);
      const ownsArea = areas.some(a => a.id === req.params.areaId);
      if (!ownsArea) {
        return res.status(404).json({ error: "Service area not found for this profile" });
      }
      const deleted = await storage.deleteServiceArea(req.params.areaId);
      if (!deleted) {
        return res.status(404).json({ error: "Service area not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete service area:", error);
      res.status(500).json({ error: "Failed to delete service area" });
    }
  });

  // Agent Task Routes
  app.get("/api/admin/agent-tasks", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const tasks = await storage.getAgentTasks(status);
      res.json(tasks);
    } catch (error) {
      console.error("Failed to fetch agent tasks:", error);
      res.status(500).json({ error: "Failed to fetch agent tasks" });
    }
  });

  app.post("/api/admin/agent-tasks", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { agentType, priority, inputData, relatedPropertyId, relatedOfferingId, relatedUserId, scheduledFor, maxRetries } = req.body;
      if (!agentType) {
        return res.status(400).json({ error: "Missing required field: agentType" });
      }
      const validTypes = ["property_sourcing", "owner_outreach", "grant_research", "contractor_sourcing", "realtor_outreach", "legal_compliance", "investor_relations", "community_engagement"];
      if (!validTypes.includes(agentType)) {
        return res.status(400).json({ error: `Invalid agentType. Must be one of: ${validTypes.join(", ")}` });
      }
      const task = await storage.createAgentTask({
        agentType,
        priority,
        inputData,
        relatedPropertyId,
        relatedOfferingId,
        relatedUserId,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        maxRetries,
      });
      await logAuditEvent({
        userId: req.session.userId!,
        action: "agent_task_create",
        targetTable: "agent_tasks",
        targetId: String(task.id),
        metadata: { agentType, priority },
        req,
      });
      res.status(201).json(task);
    } catch (error) {
      console.error("Failed to create agent task:", error);
      res.status(500).json({ error: "Failed to create agent task" });
    }
  });

  app.patch("/api/admin/agent-tasks/:id/status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { status, outputData, errorMessage } = req.body;
      const validStatuses = ["queued", "running", "completed", "failed", "needs_human"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      }
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ error: "Invalid task ID" });
      }
      const updated = await storage.updateAgentTaskStatus(taskId, status, { outputData, errorMessage } as any);
      if (!updated) {
        return res.status(404).json({ error: "Agent task not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Failed to update agent task status:", error);
      res.status(500).json({ error: "Failed to update agent task status" });
    }
  });

  // Share Transfers
  app.get("/api/user/transfers", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const transfers = await storage.getUserShareTransfers(userId);
      res.json(transfers);
    } catch (error) {
      console.error("Failed to fetch transfers:", error);
      res.status(500).json({ error: "Failed to fetch transfers" });
    }
  });

  app.post("/api/transfers", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { offeringId, recipientWalletAddress, tokenCount } = req.body;

    if (!offeringId || !recipientWalletAddress || !tokenCount) {
      return res.status(400).json({ error: "Missing required fields: offeringId, recipientWalletAddress, tokenCount" });
    }

    if (tokenCount <= 0) {
      return res.status(400).json({ error: "Token count must be positive" });
    }

    try {
      const holding = await storage.getHoldingByUserAndOffering(userId, offeringId);
      if (!holding) {
        return res.status(404).json({ error: "No holdings found for this offering" });
      }

      if (holding.tokenCount < tokenCount) {
        return res.status(400).json({ error: `Insufficient tokens. You hold ${holding.tokenCount} tokens.` });
      }

      const pricePerToken = parseFloat(holding.averagePurchasePrice || "0");
      const originalValue = (tokenCount * pricePerToken).toFixed(2);

      const transfer = await storage.createShareTransfer({
        userId,
        fromOfferingId: offeringId,
        toOfferingId: offeringId,
        tokenCount,
        originalValue,
        transferValue: originalValue,
        recipientWalletAddress,
      });

      res.status(201).json(transfer);
    } catch (error) {
      console.error("Failed to create transfer:", error);
      res.status(500).json({ error: "Failed to create transfer request" });
    }
  });

  // Refund Requests
  app.get("/api/user/refunds", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const refunds = await storage.getUserRefunds(userId);
      res.json(refunds);
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
      res.status(500).json({ error: "Failed to fetch refunds" });
    }
  });

  app.post("/api/refunds", isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { offeringId, tokenCount } = req.body;

    if (!offeringId || !tokenCount) {
      return res.status(400).json({ error: "Missing required fields: offeringId, tokenCount" });
    }

    try {
      const holding = await storage.getHoldingByUserAndOffering(userId, offeringId);
      if (!holding) {
        return res.status(404).json({ error: "No holdings found for this offering" });
      }

      if (holding.tokenCount < tokenCount) {
        return res.status(400).json({ error: `Insufficient tokens. You hold ${holding.tokenCount} tokens.` });
      }

      const { calculateRefundWithInterest } = await import("@shared/schema");
      const originalAmount = tokenCount * parseFloat(holding.averagePurchasePrice || "0");
      const purchaseDate = holding.updatedAt || new Date();
      const { interest, total } = calculateRefundWithInterest(originalAmount, purchaseDate);

      const refund = await storage.createRefundRequest({
        userId,
        offeringId,
        tokenCount,
        originalAmount: originalAmount.toFixed(2),
        interestEarned: interest.toFixed(2),
        totalRefundAmount: total.toFixed(2),
      });

      res.status(201).json(refund);
    } catch (error) {
      console.error("Failed to create refund request:", error);
      res.status(500).json({ error: "Failed to create refund request" });
    }
  });

  // Register object storage routes for document uploads
  registerObjectStorageRoutes(app);

  return httpServer;
}
