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
  PHASE_CONFIG, calculatePhasePrice, getPhaseAllocation,
  users, properties, tokenOfferings, offeringPhases, tokenPurchases, 
  tokenHoldings, proposals, votes, propertySubmissions, submissionDocuments,
  propertyNominations, desiredUseVotes
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

  async getUserPurchasesForPhase(userId: string, phaseId: string): Promise<TokenPurchase[]> {
    return db.select().from(tokenPurchases)
      .where(and(
        eq(tokenPurchases.userId, userId),
        eq(tokenPurchases.phaseId, phaseId)
      ));
  }

  async createTokenPurchase(purchase: InsertTokenPurchase): Promise<TokenPurchase> {
    const [newPurchase] = await db
      .insert(tokenPurchases)
      .values({
        ...purchase,
      })
      .returning();
    
    await this.updateHoldings(purchase.userId, purchase.offeringId, purchase.tokenCount);
    await this.updatePhaseTokensSold(purchase.phaseId, purchase.tokenCount);
    await this.updateOfferingTotals(purchase.offeringId, purchase.tokenCount, purchase.totalAmount);
    
    return newPurchase;
  }

  async createPurchase(purchaseData: {
    userId: string;
    propertyId: string;
    offeringId: string;
    tokenCount: number;
    pricePerToken: string;
    totalAmount: string;
    paymentMethod: string;
    phase: string;
    votingPower: number;
    status: string;
  }): Promise<TokenPurchase> {
    const phaseId = `${purchaseData.propertyId}-${purchaseData.phase}`;
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
        status: purchaseData.status as TokenPurchase["status"],
        purchasedAt: new Date(),
      })
      .returning();
    
    return newPurchase;
  }

  private async updateHoldings(userId: string, offeringId: string, addedTokenCount: number): Promise<void> {
    const [existing] = await db.select().from(tokenHoldings)
      .where(and(
        eq(tokenHoldings.userId, userId),
        eq(tokenHoldings.offeringId, offeringId)
      ));
    
    if (existing) {
      await db.update(tokenHoldings)
        .set({ 
          tokenCount: existing.tokenCount + addedTokenCount,
          votingPower: existing.tokenCount + addedTokenCount,
          updatedAt: new Date()
        })
        .where(eq(tokenHoldings.id, existing.id));
    } else {
      await db.insert(tokenHoldings).values({
        userId,
        offeringId,
        tokenCount: addedTokenCount,
        averagePurchasePrice: "0",
        votingPower: addedTokenCount,
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
    const holdings = await this.getUserHoldings(userId);
    const holding = holdings.find(h => h.offeringId === offeringId);
    return holding?.tokenCount || 0;
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
}
