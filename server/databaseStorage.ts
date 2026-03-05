import { 
  type User, type UpsertUser,
  type Property, type InsertProperty,
  type TokenOffering, type InsertTokenOffering,
  type OfferingPhase, type InsertOfferingPhase,
  type TokenPurchase, type InsertTokenPurchase,
  type TokenHolding,
  type Proposal, type InsertProposal,
  type Vote,
  type PropertySubmission, type InsertPropertySubmission,
  type SubmissionDocument, type InsertSubmissionDocument,
  type PropertyNomination, type InsertPropertyNomination,
  type DesiredUseVote,
  type PrivateOfferingInvite, type InsertPrivateOfferingInvite,
  type PropertyGrant, type InsertPropertyGrant, type CapitalStackSummary,
  type Waitlist,
  type Wish, type InsertWish,
  type ServiceBid, type InsertServiceBid,
  type ShareTransfer,
  type TokenRefund,
  type ProfessionalProfile, type InsertProfessionalProfile,
  type ProfessionalEndorsement, type InsertProfessionalEndorsement,
  type ProjectProfessionalMatch, type InsertProjectProfessionalMatch,
  type ProfessionalServiceArea, type InsertProfessionalServiceArea,
  type AgentTask, type InsertAgentTask,
  type ReputationEvent, type InsertReputationEvent,
  PHASE_CONFIG, calculatePhasePrice, getPhaseAllocation,
  users, properties, tokenOfferings, offeringPhases, tokenPurchases, 
  tokenHoldings, proposals, votes, propertySubmissions, submissionDocuments,
  propertyNominations, desiredUseVotes, privateOfferingInvites, propertyGrants, waitlist, wishes,
  serviceBids, shareTransfers, tokenRefunds,
  professionalProfiles, professionalEndorsements, projectProfessionalMatches,
  professionalServiceAreas, agentTasks, reputationEvents
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUsersByKYCStatus(status: User["kycStatus"]): Promise<User[]> {
    if (status === null) {
      return db.select().from(users).where(sql`${users.kycStatus} IS NULL`);
    }
    return db.select().from(users).where(sql`${users.kycStatus} = ${status}`);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          walletAddress: userData.walletAddress,
          county: userData.county,
          state: userData.state,
          country: userData.country,
          kycStatus: userData.kycStatus,
          kycVerifiedAt: userData.kycVerifiedAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getProperties(): Promise<Property[]> {
    return db.select().from(properties).where(
      inArray(properties.status, ['live', 'funded'])
    );
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values({
        ...insertProperty,
        id: randomUUID(),
        status: "submitted",
        createdAt: new Date(),
      })
      .returning();
    return property;
  }

  async updatePropertyStatus(id: string, status: Property["status"]): Promise<Property | undefined> {
    const updates: any = { status };
    if (status === "approved") updates.approvedAt = new Date();
    if (status === "submitted") updates.submittedAt = new Date();
    
    const [property] = await db
      .update(properties)
      .set(updates)
      .where(eq(properties.id, id))
      .returning();
    return property || undefined;
  }

  async getTokenOffering(id: string): Promise<TokenOffering | undefined> {
    const [offering] = await db.select().from(tokenOfferings).where(eq(tokenOfferings.id, id));
    return offering || undefined;
  }

  async getAllTokenOfferings(): Promise<TokenOffering[]> {
    return db.select().from(tokenOfferings).where(sql`${tokenOfferings.deletedAt} IS NULL`);
  }

  async getOfferingByPropertyId(propertyId: string): Promise<TokenOffering | undefined> {
    const [offering] = await db.select().from(tokenOfferings).where(eq(tokenOfferings.propertyId, propertyId));
    return offering || undefined;
  }

  async getTokenOfferingsByProperty(propertyId: string): Promise<TokenOffering[]> {
    return db.select().from(tokenOfferings).where(eq(tokenOfferings.propertyId, propertyId));
  }

  async createTokenOffering(offering: InsertTokenOffering): Promise<TokenOffering> {
    const [newOffering] = await db
      .insert(tokenOfferings)
      .values({
        ...offering,
        id: randomUUID(),
        createdAt: new Date(),
      })
      .returning();
    return newOffering;
  }

  async getOfferingPhases(offeringId: string): Promise<OfferingPhase[]> {
    return db.select().from(offeringPhases)
      .where(eq(offeringPhases.offeringId, offeringId))
      .orderBy(offeringPhases.phaseOrder);
  }

  async getActivePhase(offeringId: string): Promise<OfferingPhase | undefined> {
    const [phase] = await db.select().from(offeringPhases)
      .where(and(
        eq(offeringPhases.offeringId, offeringId),
        eq(offeringPhases.isActive, true)
      ));
    return phase || undefined;
  }

  async createOfferingPhase(phase: InsertOfferingPhase): Promise<OfferingPhase> {
    const [newPhase] = await db
      .insert(offeringPhases)
      .values({
        ...phase,
        id: randomUUID(),
      })
      .returning();
    return newPhase;
  }

  async updateOffering(id: string, data: Partial<{ tokensSold: number; totalFundingRaised: string }>): Promise<TokenOffering | undefined> {
    const [updated] = await db
      .update(tokenOfferings)
      .set(data)
      .where(eq(tokenOfferings.id, id))
      .returning();
    return updated || undefined;
  }

  async updateOfferingPhase(id: string, data: Partial<{ tokensSold: number }>): Promise<OfferingPhase | undefined> {
    const [updated] = await db
      .update(offeringPhases)
      .set(data)
      .where(eq(offeringPhases.id, id))
      .returning();
    return updated || undefined;
  }

  async getUserPurchasesForPhase(userId: string, phaseId: string): Promise<TokenPurchase[]> {
    return db.select().from(tokenPurchases)
      .where(and(
        eq(tokenPurchases.userId, userId),
        eq(tokenPurchases.phaseId, phaseId)
      ));
  }

  async getUserPurchases(userId: string): Promise<TokenPurchase[]> {
    return db.select().from(tokenPurchases)
      .where(eq(tokenPurchases.userId, userId))
      .orderBy(desc(tokenPurchases.purchasedAt));
  }

  async getPurchaseByPaymentIntentId(paymentIntentId: string): Promise<TokenPurchase | undefined> {
    const [purchase] = await db.select().from(tokenPurchases)
      .where(eq(tokenPurchases.paymentIntentId, paymentIntentId));
    return purchase;
  }

  async createTokenPurchase(purchase: InsertTokenPurchase): Promise<TokenPurchase> {
    const [newPurchase] = await db
      .insert(tokenPurchases)
      .values({
        ...purchase,
      })
      .returning();
    
    const phase = this.extractPhaseFromPhaseId(purchase.phaseId);
    
    await this.updateHoldings(purchase.userId, purchase.offeringId, purchase.tokenCount, phase);
    await this.updatePhaseTokensSold(purchase.phaseId, purchase.tokenCount);
    await this.updateOfferingTotals(purchase.offeringId, purchase.tokenCount, purchase.totalAmount);
    
    return newPurchase;
  }
  
  private extractPhaseFromPhaseId(phaseId: string): string {
    const validPhases = ["county", "state", "national", "international"];
    const parts = phaseId.toLowerCase().split("-");
    for (const part of parts.reverse()) {
      if (validPhases.includes(part)) {
        return part;
      }
    }
    return "international";
  }

  async createPurchase(purchaseData: {
    userId: string;
    propertyId?: string;
    offeringId: string;
    tokenCount: number;
    pricePerToken: string;
    totalAmount: string;
    paymentMethod: string;
    phase: string;
    votingPower?: number;
    status: string;
    paymentIntentId?: string;
  }): Promise<TokenPurchase> {
    const phaseId = purchaseData.propertyId ? `${purchaseData.propertyId}-${purchaseData.phase}` : `unknown-${purchaseData.phase}`;
    const [newPurchase] = await db
      .insert(tokenPurchases)
      .values({
        id: randomUUID(),
        userId: purchaseData.userId,
        offeringId: purchaseData.offeringId,
        phaseId,
        tokenCount: purchaseData.tokenCount,
        pricePerToken: purchaseData.pricePerToken,
        totalAmount: purchaseData.totalAmount,
        paymentMethod: purchaseData.paymentMethod,
        paymentIntentId: purchaseData.paymentIntentId || null,
        status: purchaseData.status as TokenPurchase["status"],
        purchasedAt: new Date(),
      })
      .returning();
    
    return newPurchase;
  }

  async updatePurchaseStatus(id: string, status: TokenPurchase["status"]): Promise<TokenPurchase | undefined> {
    const [updated] = await db
      .update(tokenPurchases)
      .set({ status })
      .where(eq(tokenPurchases.id, id))
      .returning();
    return updated || undefined;
  }

  private async updateHoldings(userId: string, offeringId: string, addedTokenCount: number, phase?: string): Promise<void> {
    const [existing] = await db.select().from(tokenHoldings)
      .where(and(
        eq(tokenHoldings.userId, userId),
        eq(tokenHoldings.offeringId, offeringId)
      ));
    
    const multiplier = phase === "county" ? 1.5 
      : phase === "state" ? 1.25 
      : phase === "national" ? 1.0 
      : 0.75;
    const addedVotingPower = Math.floor(addedTokenCount * multiplier);
    
    if (existing) {
      await db.update(tokenHoldings)
        .set({ 
          tokenCount: existing.tokenCount + addedTokenCount,
          votingPower: (existing.votingPower || 0) + addedVotingPower,
          updatedAt: new Date()
        })
        .where(eq(tokenHoldings.id, existing.id));
    } else {
      await db.insert(tokenHoldings).values({
        userId,
        offeringId,
        tokenCount: addedTokenCount,
        averagePurchasePrice: "0",
        votingPower: addedVotingPower,
      });
    }
  }

  private async updatePhaseTokensSold(phaseId: string, tokenCount: number): Promise<void> {
    await db.update(offeringPhases)
      .set({ 
        tokensSold: sql`${offeringPhases.tokensSold} + ${tokenCount}` 
      })
      .where(eq(offeringPhases.id, phaseId));
  }

  private async updateOfferingTotals(offeringId: string, tokenCount: number, amount: string): Promise<void> {
    const [offering] = await db.select().from(tokenOfferings).where(eq(tokenOfferings.id, offeringId));
    if (offering) {
      const newTokensSold = (offering.tokensSold || 0) + tokenCount;
      const newFundingRaised = (parseFloat(offering.totalFundingRaised || "0") + parseFloat(amount)).toString();
      
      await db.update(tokenOfferings)
        .set({ 
          tokensSold: newTokensSold,
          totalFundingRaised: newFundingRaised
        })
        .where(eq(tokenOfferings.id, offeringId));
    }
  }

  async canUserPurchase(userId: string, phaseId: string, tokenCount: number): Promise<{ allowed: boolean; reason?: string }> {
    const [phase] = await db.select().from(offeringPhases).where(eq(offeringPhases.id, phaseId));
    if (!phase) {
      return { allowed: false, reason: "Phase not found" };
    }

    if (!phase.isActive) {
      return { allowed: false, reason: "This phase is not currently active" };
    }

    const userPurchases = await this.getUserPurchasesForPhase(userId, phaseId);
    const totalUserTokens = userPurchases.reduce((sum, p) => sum + p.tokenCount, 0);

    if (totalUserTokens + tokenCount > phase.maxTokensPerPerson) {
      return { 
        allowed: false, 
        reason: `Exceeds maximum of ${phase.maxTokensPerPerson} tokens per person in this phase` 
      };
    }

    const tokensAvailable = phase.tokenAllocation - (phase.tokensSold || 0);
    if (tokenCount > tokensAvailable) {
      return { allowed: false, reason: `Only ${tokensAvailable} tokens remaining in this phase` };
    }

    return { allowed: true };
  }

  async getUserHoldings(userId: string): Promise<TokenHolding[]> {
    return db.select().from(tokenHoldings).where(eq(tokenHoldings.userId, userId));
  }

  async getHoldingsByOffering(offeringId: string): Promise<TokenHolding[]> {
    return db.select().from(tokenHoldings).where(eq(tokenHoldings.offeringId, offeringId));
  }

  async getHoldingByUserAndOffering(userId: string, offeringId: string): Promise<TokenHolding | undefined> {
    const [holding] = await db.select().from(tokenHoldings)
      .where(and(
        eq(tokenHoldings.userId, userId),
        eq(tokenHoldings.offeringId, offeringId)
      ));
    return holding || undefined;
  }

  async updateHolding(id: string, data: Partial<{ tokenCount: number }>): Promise<TokenHolding | undefined> {
    const updateData: any = { updatedAt: new Date() };
    if (data.tokenCount !== undefined) updateData.tokenCount = data.tokenCount;
    
    const [updated] = await db
      .update(tokenHoldings)
      .set(updateData)
      .where(eq(tokenHoldings.id, id))
      .returning();
    return updated || undefined;
  }

  async createHolding(data: { userId: string; offeringId: string; tokenCount: number; purchasePhase: string; averagePurchasePrice: string }): Promise<TokenHolding> {
    const multiplier = data.purchasePhase === "county" ? 1.5 
      : data.purchasePhase === "state" ? 1.25 
      : data.purchasePhase === "national" ? 1.0 
      : 0.75;
    const votingPower = Math.floor(data.tokenCount * multiplier);
    
    const [holding] = await db
      .insert(tokenHoldings)
      .values({
        id: randomUUID(),
        userId: data.userId,
        offeringId: data.offeringId,
        tokenCount: data.tokenCount,
        averagePurchasePrice: data.averagePurchasePrice,
        votingPower,
        updatedAt: new Date(),
      })
      .returning();
    return holding;
  }

  async updateOrCreateHolding(
    userId: string, 
    offeringId: string, 
    tokenCount: number, 
    pricePerToken: number, 
    votingPower: number
  ): Promise<TokenHolding> {
    const [existing] = await db.select().from(tokenHoldings)
      .where(and(
        eq(tokenHoldings.userId, userId),
        eq(tokenHoldings.offeringId, offeringId)
      ));

    if (existing) {
      const newTokenCount = existing.tokenCount + tokenCount;
      const existingCost = parseFloat(existing.averagePurchasePrice || '0') * existing.tokenCount;
      const newCost = pricePerToken * tokenCount;
      const newAvgPrice = (existingCost + newCost) / newTokenCount;
      const newVotingPower = (existing.votingPower || 0) + votingPower;

      const [updated] = await db
        .update(tokenHoldings)
        .set({
          tokenCount: newTokenCount,
          averagePurchasePrice: newAvgPrice.toFixed(2),
          votingPower: newVotingPower,
        })
        .where(eq(tokenHoldings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newHolding] = await db
        .insert(tokenHoldings)
        .values({
          userId,
          offeringId,
          tokenCount,
          averagePurchasePrice: pricePerToken.toFixed(2),
          votingPower,
        })
        .returning();
      return newHolding;
    }
  }

  async getProposals(offeringId?: string): Promise<Proposal[]> {
    if (offeringId) {
      return db.select().from(proposals)
        .where(eq(proposals.offeringId, offeringId))
        .orderBy(desc(proposals.createdAt));
    }
    return db.select().from(proposals).orderBy(desc(proposals.createdAt));
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal || undefined;
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const [newProposal] = await db
      .insert(proposals)
      .values({
        ...proposal,
        id: randomUUID(),
        status: "active",
        votesFor: 0,
        votesAgainst: 0,
        createdAt: new Date(),
      })
      .returning();
    return newProposal;
  }

  async getVotesForProposal(proposalId: string): Promise<Vote[]> {
    return db.select().from(votes).where(eq(votes.proposalId, proposalId));
  }

  async hasUserVoted(userId: string, proposalId: string): Promise<boolean> {
    const [vote] = await db.select().from(votes)
      .where(and(
        eq(votes.userId, userId),
        eq(votes.proposalId, proposalId)
      ));
    return !!vote;
  }

  async castVote(proposalId: string, userId: string, voteDirection: boolean, votingPower: number): Promise<Vote> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
    if (!proposal) {
      throw new Error("Proposal not found");
    }

    const [newVote] = await db
      .insert(votes)
      .values({
        proposalId,
        userId,
        offeringId: proposal.offeringId,
        tokenBalanceAtVote: votingPower,
        voteDirection,
        votingPower,
      })
      .returning();

    const updates = voteDirection
      ? { votesFor: (proposal.votesFor || 0) + votingPower }
      : { votesAgainst: (proposal.votesAgainst || 0) + votingPower };
    
    await db.update(proposals).set(updates).where(eq(proposals.id, proposalId));

    return newVote;
  }

  async calculateVotingPower(userId: string, offeringId: string): Promise<number> {
    // Get all confirmed purchases for this user and offering
    const purchases = await db.select()
      .from(tokenPurchases)
      .where(and(
        eq(tokenPurchases.userId, userId),
        eq(tokenPurchases.offeringId, offeringId),
        eq(tokenPurchases.status, "confirmed")
      ));
    
    let totalVotingPower = 0;
    
    for (const purchase of purchases) {
      // Get the phase to determine the multiplier
      const [phase] = await db.select()
        .from(offeringPhases)
        .where(eq(offeringPhases.id, purchase.phaseId));
      
      if (phase) {
        // Apply phase-based voting multipliers (Community-First model)
        // County: 1.5x, State: 1.25x, National: 1.0x, International: 0.75x
        const multiplier = phase.phase === "county" ? 1.5 
          : phase.phase === "state" ? 1.25 
          : phase.phase === "national" ? 1.0 
          : 0.75;
        totalVotingPower += Math.floor(purchase.tokenCount * multiplier);
      }
    }
    
    return totalVotingPower;
  }

  async createPropertySubmission(submission: InsertPropertySubmission): Promise<PropertySubmission> {
    const [newSubmission] = await db
      .insert(propertySubmissions)
      .values({
        ...submission,
        id: randomUUID(),
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newSubmission;
  }

  async getPropertySubmission(id: string): Promise<PropertySubmission | undefined> {
    const [submission] = await db.select().from(propertySubmissions).where(eq(propertySubmissions.id, id));
    return submission || undefined;
  }

  async getPropertySubmissionsByOwner(ownerId: string): Promise<PropertySubmission[]> {
    return db.select().from(propertySubmissions)
      .where(eq(propertySubmissions.ownerId, ownerId))
      .orderBy(desc(propertySubmissions.createdAt));
  }

  async getPropertySubmissionsByStatus(status: PropertySubmission["status"]): Promise<PropertySubmission[]> {
    return db.select().from(propertySubmissions)
      .where(sql`${propertySubmissions.status} = ${status}`)
      .orderBy(desc(propertySubmissions.createdAt));
  }

  async updatePropertySubmission(id: string, data: Partial<InsertPropertySubmission>): Promise<PropertySubmission | undefined> {
    const [updated] = await db
      .update(propertySubmissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(propertySubmissions.id, id))
      .returning();
    return updated || undefined;
  }

  async updatePropertySubmissionStatus(
    id: string, 
    status: PropertySubmission["status"], 
    reviewNotes?: string, 
    reviewedBy?: string
  ): Promise<PropertySubmission | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (status === "submitted") updates.submittedAt = new Date();
    if (status === "approved" || status === "rejected") {
      updates.reviewedAt = new Date();
      if (reviewNotes) updates.reviewNotes = reviewNotes;
      if (reviewedBy) updates.reviewedBy = reviewedBy;
    }
    
    const [updated] = await db
      .update(propertySubmissions)
      .set(updates)
      .where(eq(propertySubmissions.id, id))
      .returning();
    return updated || undefined;
  }

  async addSubmissionDocument(document: InsertSubmissionDocument): Promise<SubmissionDocument> {
    const [newDoc] = await db
      .insert(submissionDocuments)
      .values({
        ...document,
        id: randomUUID(),
        uploadedAt: new Date(),
      })
      .returning();
    return newDoc;
  }

  async getSubmissionDocuments(submissionId: string): Promise<SubmissionDocument[]> {
    return db.select().from(submissionDocuments)
      .where(eq(submissionDocuments.submissionId, submissionId));
  }

  async deleteSubmissionDocument(id: string): Promise<boolean> {
    const result = await db.delete(submissionDocuments).where(eq(submissionDocuments.id, id));
    return true;
  }

  async createPropertyNomination(nomination: InsertPropertyNomination): Promise<PropertyNomination> {
    const [newNomination] = await db
      .insert(propertyNominations)
      .values({
        ...nomination,
        id: randomUUID(),
        status: "submitted",
        nominationVotes: 0,
        ownerDetectionStatus: "pending",
        createdAt: new Date(),
      })
      .returning();
    return newNomination;
  }

  async getPropertyNomination(id: string): Promise<PropertyNomination | undefined> {
    const [nomination] = await db.select().from(propertyNominations).where(eq(propertyNominations.id, id));
    return nomination || undefined;
  }

  async getPropertyNominations(): Promise<PropertyNomination[]> {
    return db.select().from(propertyNominations).orderBy(desc(propertyNominations.createdAt));
  }

  async getPropertyNominationsByStatus(status: PropertyNomination["status"]): Promise<PropertyNomination[]> {
    return db.select().from(propertyNominations)
      .where(sql`${propertyNominations.status} = ${status}`)
      .orderBy(desc(propertyNominations.createdAt));
  }

  async updatePropertyNomination(id: string, data: Partial<PropertyNomination>): Promise<PropertyNomination | undefined> {
    const [updated] = await db
      .update(propertyNominations)
      .set(data)
      .where(eq(propertyNominations.id, id))
      .returning();
    return updated || undefined;
  }

  async addDesiredUseVote(nominationId: string, userId: string, desiredUse: string): Promise<DesiredUseVote> {
    const [newVote] = await db
      .insert(desiredUseVotes)
      .values({
        nominationId,
        userId,
        desiredUse,
      })
      .returning();
    return newVote;
  }

  async getDesiredUseVotes(nominationId: string): Promise<DesiredUseVote[]> {
    return db.select().from(desiredUseVotes).where(eq(desiredUseVotes.nominationId, nominationId));
  }

  async hasUserVotedOnNomination(userId: string, nominationId: string): Promise<boolean> {
    const [vote] = await db.select().from(desiredUseVotes)
      .where(and(
        eq(desiredUseVotes.userId, userId),
        eq(desiredUseVotes.nominationId, nominationId)
      ));
    return !!vote;
  }

  async updateNominationOwnerInfo(nominationId: string, ownerInfo: {
    ownerDetectionStatus?: string;
    detectedOwnerName?: string;
    detectedOwnerType?: string;
    detectedOwnerAddress?: string;
    detectedOwnerEmail?: string;
    detectedOwnerPhone?: string;
    ownerDataSource?: string;
    ownerDataConfidence?: number;
    ownerNotifiedAt?: Date;
    ownerNotificationLink?: string;
    ownerResponseStatus?: string;
  }): Promise<PropertyNomination | undefined> {
    const [nomination] = await db.select().from(propertyNominations).where(eq(propertyNominations.id, nominationId));
    if (!nomination) return undefined;

    const updateData: any = {};
    if (ownerInfo.ownerDetectionStatus) updateData.ownerDetectionStatus = ownerInfo.ownerDetectionStatus;
    if (ownerInfo.detectedOwnerName) updateData.detectedOwnerName = ownerInfo.detectedOwnerName;
    if (ownerInfo.detectedOwnerType) updateData.detectedOwnerType = ownerInfo.detectedOwnerType;
    if (ownerInfo.detectedOwnerAddress) updateData.detectedOwnerAddress = ownerInfo.detectedOwnerAddress;
    if (ownerInfo.detectedOwnerEmail) updateData.detectedOwnerEmail = ownerInfo.detectedOwnerEmail;
    if (ownerInfo.detectedOwnerPhone) updateData.detectedOwnerPhone = ownerInfo.detectedOwnerPhone;
    if (ownerInfo.ownerDataSource) updateData.ownerDataSource = ownerInfo.ownerDataSource;
    if (ownerInfo.ownerDataConfidence !== undefined) updateData.ownerDataConfidence = ownerInfo.ownerDataConfidence;
    if (ownerInfo.ownerNotifiedAt) updateData.ownerNotifiedAt = ownerInfo.ownerNotifiedAt;
    if (ownerInfo.ownerNotificationLink) updateData.ownerNotificationLink = ownerInfo.ownerNotificationLink;
    if (ownerInfo.ownerResponseStatus) updateData.ownerResponseStatus = ownerInfo.ownerResponseStatus;

    const [updated] = await db
      .update(propertyNominations)
      .set(updateData)
      .where(eq(propertyNominations.id, nominationId))
      .returning();
    return updated || undefined;
  }

  // Private Offering Invites
  async createPrivateOfferingInvite(invite: InsertPrivateOfferingInvite): Promise<PrivateOfferingInvite> {
    const [newInvite] = await db
      .insert(privateOfferingInvites)
      .values({
        id: randomUUID(),
        ...invite,
        status: "pending",
        tokensPurchased: 0,
        createdAt: new Date(),
      })
      .returning();
    return newInvite;
  }

  async getPrivateOfferingInvite(id: string): Promise<PrivateOfferingInvite | undefined> {
    const [invite] = await db.select().from(privateOfferingInvites).where(eq(privateOfferingInvites.id, id));
    return invite || undefined;
  }

  async getPrivateOfferingInviteByCode(inviteCode: string): Promise<PrivateOfferingInvite | undefined> {
    const [invite] = await db.select().from(privateOfferingInvites).where(eq(privateOfferingInvites.inviteCode, inviteCode));
    return invite || undefined;
  }

  async getPrivateOfferingInvitesByOffering(offeringId: string): Promise<PrivateOfferingInvite[]> {
    return db.select().from(privateOfferingInvites).where(eq(privateOfferingInvites.offeringId, offeringId));
  }

  async getPrivateOfferingInvitesByEmail(email: string): Promise<PrivateOfferingInvite[]> {
    return db.select().from(privateOfferingInvites).where(eq(privateOfferingInvites.email, email));
  }

  async updatePrivateOfferingInviteStatus(id: string, status: PrivateOfferingInvite["status"]): Promise<PrivateOfferingInvite | undefined> {
    const updateData: any = { status };
    if (status === "sent") updateData.sentAt = new Date();
    if (status === "accepted") updateData.acceptedAt = new Date();
    
    const [updated] = await db
      .update(privateOfferingInvites)
      .set(updateData)
      .where(eq(privateOfferingInvites.id, id))
      .returning();
    return updated || undefined;
  }

  async validatePrivateOfferingAccess(offeringId: string, accessCode: string): Promise<boolean> {
    const [offering] = await db.select().from(tokenOfferings).where(eq(tokenOfferings.id, offeringId));
    if (!offering) return false;
    if (offering.offeringType !== "private") return true;
    return offering.accessCode === accessCode;
  }

  async validateInviteCode(offeringId: string, inviteCode: string): Promise<PrivateOfferingInvite | null> {
    const [invite] = await db.select().from(privateOfferingInvites)
      .where(and(
        eq(privateOfferingInvites.offeringId, offeringId),
        eq(privateOfferingInvites.inviteCode, inviteCode)
      ));
    
    if (!invite) return null;
    if (invite.status === "expired" || invite.status === "declined") return null;
    if (invite.expiresAt && invite.expiresAt < new Date()) return null;
    return invite;
  }

  async createPropertyGrant(grant: InsertPropertyGrant): Promise<PropertyGrant> {
    const [created] = await db.insert(propertyGrants).values(grant).returning();
    return created;
  }

  async getPropertyGrant(id: string): Promise<PropertyGrant | undefined> {
    const [grant] = await db.select().from(propertyGrants).where(eq(propertyGrants.id, id));
    return grant || undefined;
  }

  async getPropertyGrantsByProperty(propertyId: string): Promise<PropertyGrant[]> {
    return db.select().from(propertyGrants).where(eq(propertyGrants.propertyId, propertyId));
  }

  async updatePropertyGrant(id: string, data: Partial<InsertPropertyGrant>): Promise<PropertyGrant | undefined> {
    const [updated] = await db
      .update(propertyGrants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(propertyGrants.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePropertyGrant(id: string): Promise<boolean> {
    const result = await db.delete(propertyGrants).where(eq(propertyGrants.id, id)).returning();
    return result.length > 0;
  }

  async getCapitalStackSummary(propertyId: string): Promise<CapitalStackSummary> {
    const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
    const grants = await this.getPropertyGrantsByProperty(propertyId);
    const totalProjectCost = property?.fundingGoal ? parseFloat(property.fundingGoal) : 0;
    
    const grantFunding = { city: 0, county: 0, state: 0, federal: 0, total: 0 };
    const grantsByStatus = { secured: 0, pending: 0, identified: 0 };
    
    for (const grant of grants) {
      const amount = parseFloat(grant.amount);
      if (grant.grantLevel === "city") grantFunding.city += amount;
      if (grant.grantLevel === "county") grantFunding.county += amount;
      if (grant.grantLevel === "state") grantFunding.state += amount;
      if (grant.grantLevel === "federal") grantFunding.federal += amount;
      
      if (grant.status === "awarded" || grant.status === "disbursed") {
        grantsByStatus.secured += amount;
      } else if (grant.status === "applied" || grant.status === "under_review") {
        grantsByStatus.pending += amount;
      } else if (grant.status === "identified") {
        grantsByStatus.identified += amount;
      }
    }
    
    grantFunding.total = grantFunding.city + grantFunding.county + grantFunding.state + grantFunding.federal;
    
    const offerings = await db.select().from(tokenOfferings).where(eq(tokenOfferings.propertyId, propertyId));
    const tokenFunding = offerings.reduce((sum, o) => sum + parseFloat(o.totalFundingRaised || "0"), 0);
    
    const totalFunded = tokenFunding + grantsByStatus.secured;
    const remainingToRaise = Math.max(0, totalProjectCost - totalFunded);
    const percentFunded = totalProjectCost > 0 ? (totalFunded / totalProjectCost) * 100 : 0;
    
    return { totalProjectCost, tokenFunding, grantFunding, grantsByStatus, remainingToRaise, percentFunded };
  }

  async addToWaitlist(email: string, role: string, message?: string): Promise<Waitlist> {
    const [entry] = await db.insert(waitlist).values({
      email,
      role: role as Waitlist["role"],
      message: message || null,
    }).returning();
    return entry;
  }

  async getWaitlistByEmail(email: string): Promise<Waitlist | undefined> {
    const [entry] = await db.select().from(waitlist).where(eq(waitlist.email, email));
    return entry || undefined;
  }

  async getWaitlistEntries(): Promise<Waitlist[]> {
    return db.select().from(waitlist).orderBy(desc(waitlist.createdAt));
  }

  async getWishes(): Promise<Wish[]> {
    return db.select().from(wishes).orderBy(desc(wishes.votes));
  }

  async createWish(wish: InsertWish): Promise<Wish> {
    const [entry] = await db.insert(wishes).values(wish).returning();
    return entry;
  }

  async getWishesByZipCode(zipCode: string): Promise<Wish[]> {
    return db.select().from(wishes).where(eq(wishes.zipCode, zipCode)).orderBy(desc(wishes.votes));
  }

  async upvoteWish(id: string): Promise<Wish | undefined> {
    const [updated] = await db.update(wishes)
      .set({ votes: sql`${wishes.votes} + 1` })
      .where(eq(wishes.id, id))
      .returning();
    return updated || undefined;
  }

  async getServiceBids(): Promise<ServiceBid[]> {
    return db.select().from(serviceBids).orderBy(desc(serviceBids.createdAt));
  }

  async getServiceBidsByZipCode(zipCode: string): Promise<ServiceBid[]> {
    return db.select().from(serviceBids).where(eq(serviceBids.zipCode, zipCode)).orderBy(desc(serviceBids.createdAt));
  }

  async createServiceBid(bid: InsertServiceBid): Promise<ServiceBid> {
    const [entry] = await db.insert(serviceBids).values(bid).returning();
    return entry;
  }

  async updateServiceBidStatus(id: string, status: ServiceBid["status"]): Promise<ServiceBid | undefined> {
    const [updated] = await db.update(serviceBids)
      .set({ status })
      .where(eq(serviceBids.id, id))
      .returning();
    return updated || undefined;
  }

  async getUserShareTransfers(userId: string): Promise<ShareTransfer[]> {
    return db.select().from(shareTransfers).where(eq(shareTransfers.userId, userId)).orderBy(desc(shareTransfers.requestedAt));
  }

  async createShareTransfer(transfer: { userId: string; fromOfferingId: string; toOfferingId: string; tokenCount: number; originalValue: string; transferValue: string; recipientWalletAddress?: string }): Promise<ShareTransfer> {
    const [entry] = await db.insert(shareTransfers).values({
      userId: transfer.userId,
      fromOfferingId: transfer.fromOfferingId,
      toOfferingId: transfer.toOfferingId,
      tokenCount: transfer.tokenCount,
      originalValue: transfer.originalValue,
      transferValue: transfer.transferValue,
    }).returning();
    return entry;
  }

  async getUserRefunds(userId: string): Promise<TokenRefund[]> {
    return db.select().from(tokenRefunds).where(eq(tokenRefunds.userId, userId)).orderBy(desc(tokenRefunds.requestedAt));
  }

  async createRefundRequest(refund: { userId: string; offeringId: string; tokenCount: number; originalAmount: string; interestEarned: string; totalRefundAmount: string }): Promise<TokenRefund> {
    const [entry] = await db.insert(tokenRefunds).values({
      userId: refund.userId,
      offeringId: refund.offeringId,
      tokenCount: refund.tokenCount,
      originalAmount: refund.originalAmount,
      interestEarned: refund.interestEarned,
      totalRefundAmount: refund.totalRefundAmount,
    }).returning();
    return entry;
  }

  async updatePurchaseReconciliationStatus(id: string, reconciliationStatus: TokenPurchase["reconciliationStatus"]): Promise<TokenPurchase | undefined> {
    const [updated] = await db
      .update(tokenPurchases)
      .set({ reconciliationStatus })
      .where(eq(tokenPurchases.id, id))
      .returning();
    return updated || undefined;
  }

  async getStuckPurchases(minutesThreshold: number): Promise<TokenPurchase[]> {
    const cutoff = new Date(Date.now() - minutesThreshold * 60 * 1000);
    return db.select().from(tokenPurchases)
      .where(
        and(
          sql`${tokenPurchases.reconciliationStatus} IN ('pending_payment', 'payment_received', 'minting')`,
          sql`${tokenPurchases.purchasedAt} < ${cutoff}`
        )
      )
      .orderBy(desc(tokenPurchases.purchasedAt));
  }

  async getAllPurchases(): Promise<TokenPurchase[]> {
    return db.select().from(tokenPurchases).orderBy(desc(tokenPurchases.purchasedAt));
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile> {
    const [created] = await db.insert(professionalProfiles).values(profile).returning();
    return created;
  }

  async getProfessionalProfile(id: string): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db.select().from(professionalProfiles).where(eq(professionalProfiles.id, id));
    return profile || undefined;
  }

  async getProfessionalProfileByUserId(userId: string): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId));
    return profile || undefined;
  }

  async getProfessionalProfiles(filters?: { county?: string; state?: string; specialty?: string; role?: string; status?: string }): Promise<ProfessionalProfile[]> {
    let query = db.select().from(professionalProfiles);
    const conditions: any[] = [];

    if (filters?.county) {
      conditions.push(sql`${filters.county} = ANY(${professionalProfiles.serviceCounties})`);
    }
    if (filters?.state) {
      conditions.push(sql`${filters.state} = ANY(${professionalProfiles.serviceStates})`);
    }
    if (filters?.specialty) {
      conditions.push(sql`${filters.specialty} = ANY(${professionalProfiles.specialties})`);
    }

    if (conditions.length > 0) {
      return db.select().from(professionalProfiles).where(and(...conditions)).orderBy(desc(professionalProfiles.createdAt));
    }
    return db.select().from(professionalProfiles).orderBy(desc(professionalProfiles.createdAt));
  }

  async updateProfessionalProfile(id: string, data: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile | undefined> {
    const [updated] = await db.update(professionalProfiles).set({ ...data, updatedAt: new Date() }).where(eq(professionalProfiles.id, id)).returning();
    return updated || undefined;
  }

  async updateProfessionalProfileStatus(id: string, status: string, verifiedAt?: Date): Promise<ProfessionalProfile | undefined> {
    const updateData: any = { isLicenseVerified: status === "verified", updatedAt: new Date() };
    if (verifiedAt) {
      updateData.licenseVerifiedAt = verifiedAt;
    }
    const [updated] = await db.update(professionalProfiles).set(updateData).where(eq(professionalProfiles.id, id)).returning();
    return updated || undefined;
  }

  async getProfessionalsByCounty(county: string): Promise<ProfessionalProfile[]> {
    return db.select().from(professionalProfiles)
      .where(and(
        sql`${county} = ANY(${professionalProfiles.serviceCounties})`,
        eq(professionalProfiles.isLicenseVerified, true),
        eq(professionalProfiles.isAvailable, true)
      ))
      .orderBy(desc(professionalProfiles.reputationScore));
  }

  async createEndorsement(endorsement: InsertProfessionalEndorsement): Promise<ProfessionalEndorsement> {
    const [created] = await db.insert(professionalEndorsements).values(endorsement).returning();
    await db.update(professionalProfiles)
      .set({ totalEndorsements: sql`${professionalProfiles.totalEndorsements} + 1` })
      .where(eq(professionalProfiles.id, endorsement.professionalId));
    return created;
  }

  async getEndorsementsByProfessional(professionalId: string): Promise<ProfessionalEndorsement[]> {
    return db.select().from(professionalEndorsements)
      .where(eq(professionalEndorsements.professionalId, professionalId))
      .orderBy(desc(professionalEndorsements.createdAt));
  }

  async hasUserEndorsed(userId: string, professionalId: string): Promise<boolean> {
    const [existing] = await db.select().from(professionalEndorsements)
      .where(and(
        eq(professionalEndorsements.userId, userId),
        eq(professionalEndorsements.professionalId, professionalId)
      ));
    return !!existing;
  }

  async getEndorsementCount(professionalId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(professionalEndorsements)
      .where(eq(professionalEndorsements.professionalId, professionalId));
    return Number(result?.count || 0);
  }

  async createProjectMatch(match: InsertProjectProfessionalMatch): Promise<ProjectProfessionalMatch> {
    const [created] = await db.insert(projectProfessionalMatches).values(match).returning();
    return created;
  }

  async getProjectMatch(id: string): Promise<ProjectProfessionalMatch | undefined> {
    const [match] = await db.select().from(projectProfessionalMatches).where(eq(projectProfessionalMatches.id, id));
    return match || undefined;
  }

  async getMatchesByOffering(offeringId: string): Promise<ProjectProfessionalMatch[]> {
    return db.select().from(projectProfessionalMatches)
      .where(eq(projectProfessionalMatches.offeringId, offeringId))
      .orderBy(desc(projectProfessionalMatches.createdAt));
  }

  async getMatchesByProfessional(professionalId: string): Promise<ProjectProfessionalMatch[]> {
    return db.select().from(projectProfessionalMatches)
      .where(eq(projectProfessionalMatches.professionalId, professionalId))
      .orderBy(desc(projectProfessionalMatches.createdAt));
  }

  async updateProjectMatchStatus(id: string, status: string, data?: Partial<ProjectProfessionalMatch>): Promise<ProjectProfessionalMatch | undefined> {
    const updateData: any = { status };
    if (status === "interested" || status === "rejected") {
      updateData.respondedAt = new Date();
    }
    if (status === "selected") {
      updateData.selectedAt = new Date();
    }
    if (status === "completed") {
      updateData.completedAt = new Date();
    }
    if (data) {
      Object.assign(updateData, data);
    }
    const [updated] = await db.update(projectProfessionalMatches).set(updateData).where(eq(projectProfessionalMatches.id, id)).returning();
    return updated || undefined;
  }

  async createServiceArea(area: InsertProfessionalServiceArea): Promise<ProfessionalServiceArea> {
    const [created] = await db.insert(professionalServiceAreas).values(area).returning();
    return created;
  }

  async getServiceAreasByProfessional(professionalId: string): Promise<ProfessionalServiceArea[]> {
    return db.select().from(professionalServiceAreas)
      .where(eq(professionalServiceAreas.professionalId, professionalId));
  }

  async deleteServiceArea(id: string): Promise<boolean> {
    const result = await db.delete(professionalServiceAreas).where(eq(professionalServiceAreas.id, id)).returning();
    return result.length > 0;
  }

  async createAgentTask(task: InsertAgentTask): Promise<AgentTask> {
    const [created] = await db.insert(agentTasks).values(task).returning();
    return created;
  }

  async getAgentTask(id: number): Promise<AgentTask | undefined> {
    const [task] = await db.select().from(agentTasks).where(eq(agentTasks.id, id));
    return task || undefined;
  }

  async getAgentTasks(status?: string): Promise<AgentTask[]> {
    if (status) {
      return db.select().from(agentTasks).where(eq(agentTasks.status, status)).orderBy(desc(agentTasks.createdAt));
    }
    return db.select().from(agentTasks).orderBy(desc(agentTasks.createdAt));
  }

  async updateAgentTaskStatus(id: number, status: string, data?: Partial<AgentTask>): Promise<AgentTask | undefined> {
    const updateData: any = { status };
    if (status === "running") {
      updateData.startedAt = new Date();
    }
    if (status === "completed" || status === "failed") {
      updateData.completedAt = new Date();
    }
    if (data) {
      Object.assign(updateData, data);
    }
    const [updated] = await db.update(agentTasks).set(updateData).where(eq(agentTasks.id, id)).returning();
    return updated || undefined;
  }

  async createReputationEvent(event: InsertReputationEvent): Promise<ReputationEvent> {
    const [created] = await db.insert(reputationEvents).values(event).returning();
    await db.update(professionalProfiles)
      .set({ reputationScore: sql`${professionalProfiles.reputationScore} + ${event.pointsDelta}` })
      .where(eq(professionalProfiles.id, event.professionalId));
    return created;
  }

  async getReputationEventsByProfessional(professionalId: string): Promise<ReputationEvent[]> {
    return db.select().from(reputationEvents)
      .where(eq(reputationEvents.professionalId, professionalId))
      .orderBy(desc(reputationEvents.createdAt));
  }
}
