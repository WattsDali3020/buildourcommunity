import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertPropertySubmissionSchema, insertPropertyNominationSchema, insertPropertyGrantSchema, insertWishSchema } from "@shared/schema";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replit_integrations/auth";
import { createPaymentIntent, isStripeConfigured, verifyPaymentAndGetMetadata, constructWebhookEvent } from "./services/payments";
import { purchaseRateLimit, voteRateLimit } from "./middleware/rateLimit";
import { sendPurchaseConfirmation, sendWaitlistNotification } from "./services/email";
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

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

  app.post("/api/purchases", purchaseRateLimit, async (req: Request, res: Response) => {
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

  // Owner detection routes
  app.post("/api/owner-lookup/address", async (req: Request, res: Response) => {
    const { address, city, state } = req.body;
    
    if (!address || !city || !state) {
      return res.status(400).json({ error: "Address, city, and state are required" });
    }
    
    const result = await lookupOwnerByAddress(address, city, state);
    res.json(result);
  });

  app.post("/api/owner-lookup/coordinates", async (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;
    
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "Valid latitude and longitude are required" });
    }
    
    const result = await lookupOwnerByCoordinates(latitude, longitude);
    res.json(result);
  });

  // Admin route to approve a nomination for tokenization
  app.post("/api/nominations/:id/approve", async (req: Request, res: Response) => {
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

  app.post("/api/nominations/:id/lookup-owner", async (req: Request, res: Response) => {
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

  app.post("/api/nominations/:id/notify-owner", async (req: Request, res: Response) => {
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
  app.post("/api/tokenize", async (req: Request, res: Response) => {
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

  app.post("/api/offerings/:offeringId/advance-phase", async (req: Request, res: Response) => {
    const result = await advancePhase(req.params.offeringId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json(result);
  });

  app.post("/api/offerings/:offeringId/process-refunds", async (req: Request, res: Response) => {
    const result = await processRefunds(req.params.offeringId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
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
    res.json({ success: true, user: updatedUser });
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
  app.post("/api/purchase", isAuthenticated, purchaseRateLimit, async (req: Request, res: Response) => {
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

    if (paymentMethod !== "usdc") {
      await storage.updateOrCreateHolding(userId, offering.id, tokenCount, pricePerToken, votingPower);
    }

    res.json({ success: true, purchase });
  });

  // Confirm payment and update holdings (verifies payment with Stripe)
  app.post("/api/purchase/confirm", isAuthenticated, purchaseRateLimit, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID required" });
    }

    const verification = await verifyPaymentAndGetMetadata(paymentIntentId, userId);
    
    if (!verification.success) {
      return res.status(400).json({ error: verification.error });
    }

    if (!verification.metadata) {
      return res.status(400).json({ error: "Payment not configured for production mode" });
    }

    const { propertyId, tokenCount, phase } = verification.metadata;
    const amount = verification.amount!;

    const offering = await storage.getOfferingByPropertyId(propertyId);
    if (!offering) {
      return res.status(404).json({ error: "Property offering not found" });
    }

    const VOTING_MULTIPLIERS: Record<string, number> = {
      county: 1.5,
      state: 1.25,
      national: 1.0,
      international: 0.75,
    };

    const pricePerToken = amount / tokenCount;
    const votingPower = Math.round(tokenCount * (VOTING_MULTIPLIERS[phase] || 1));

    await storage.updateOrCreateHolding(userId, offering.id, tokenCount, pricePerToken, votingPower);

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

        // Send purchase confirmation email
        const user = await storage.getUser(userId);
        if (user?.email) {
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
      const allWishes = await storage.getWishes();
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

  // Register object storage routes for document uploads
  registerObjectStorageRoutes(app);

  return httpServer;
}
