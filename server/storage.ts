import { 
  type User, type InsertUser,
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
  PHASE_CONFIG, calculatePhasePrice, getPhaseAllocation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updatePropertyStatus(id: string, status: Property["status"]): Promise<Property | undefined>;
  
  getTokenOffering(id: string): Promise<TokenOffering | undefined>;
  getOfferingByPropertyId(propertyId: string): Promise<TokenOffering | undefined>;
  createTokenOffering(offering: InsertTokenOffering): Promise<TokenOffering>;
  
  getOfferingPhases(offeringId: string): Promise<OfferingPhase[]>;
  getActivePhase(offeringId: string): Promise<OfferingPhase | undefined>;
  createOfferingPhase(phase: InsertOfferingPhase): Promise<OfferingPhase>;
  
  getUserPurchasesForPhase(userId: string, phaseId: string): Promise<TokenPurchase[]>;
  createTokenPurchase(purchase: InsertTokenPurchase): Promise<TokenPurchase>;
  canUserPurchase(userId: string, phaseId: string, tokenCount: number): Promise<{ allowed: boolean; reason?: string }>;
  
  getUserHoldings(userId: string): Promise<TokenHolding[]>;
  getHoldingsByOffering(offeringId: string): Promise<TokenHolding[]>;
  
  getProposals(offeringId?: string): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  
  getVotesForProposal(proposalId: string): Promise<Vote[]>;
  hasUserVoted(userId: string, proposalId: string): Promise<boolean>;
  castVote(proposalId: string, userId: string, voteDirection: boolean, votingPower: number): Promise<Vote>;
  
  calculateVotingPower(userId: string, offeringId: string): Promise<number>;
  
  // Property Submissions
  createPropertySubmission(submission: InsertPropertySubmission): Promise<PropertySubmission>;
  getPropertySubmission(id: string): Promise<PropertySubmission | undefined>;
  getPropertySubmissionsByOwner(ownerId: string): Promise<PropertySubmission[]>;
  getPropertySubmissionsByStatus(status: PropertySubmission["status"]): Promise<PropertySubmission[]>;
  updatePropertySubmission(id: string, data: Partial<InsertPropertySubmission>): Promise<PropertySubmission | undefined>;
  updatePropertySubmissionStatus(id: string, status: PropertySubmission["status"], reviewNotes?: string, reviewedBy?: string): Promise<PropertySubmission | undefined>;
  
  // Submission Documents
  addSubmissionDocument(document: InsertSubmissionDocument): Promise<SubmissionDocument>;
  getSubmissionDocuments(submissionId: string): Promise<SubmissionDocument[]>;
  deleteSubmissionDocument(id: string): Promise<boolean>;
  
  // Property Nominations
  createPropertyNomination(nomination: InsertPropertyNomination): Promise<PropertyNomination>;
  getPropertyNomination(id: string): Promise<PropertyNomination | undefined>;
  getPropertyNominations(): Promise<PropertyNomination[]>;
  getPropertyNominationsByStatus(status: PropertyNomination["status"]): Promise<PropertyNomination[]>;
  updatePropertyNomination(id: string, data: Partial<PropertyNomination>): Promise<PropertyNomination | undefined>;
  
  // Desired Use Votes
  addDesiredUseVote(nominationId: string, userId: string, desiredUse: string): Promise<DesiredUseVote>;
  getDesiredUseVotes(nominationId: string): Promise<DesiredUseVote[]>;
  hasUserVotedOnNomination(userId: string, nominationId: string): Promise<boolean>;
  
  // Owner Detection
  updateNominationOwnerInfo(nominationId: string, ownerInfo: {
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
  }): Promise<PropertyNomination | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private properties: Map<string, Property>;
  private tokenOfferings: Map<string, TokenOffering>;
  private offeringPhases: Map<string, OfferingPhase>;
  private tokenPurchases: Map<string, TokenPurchase>;
  private tokenHoldings: Map<string, TokenHolding>;
  private proposals: Map<string, Proposal>;
  private votes: Map<string, Vote>;
  private propertySubmissions: Map<string, PropertySubmission>;
  private submissionDocuments: Map<string, SubmissionDocument>;
  private propertyNominations: Map<string, PropertyNomination>;
  private desiredUseVotes: Map<string, DesiredUseVote>;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.tokenOfferings = new Map();
    this.offeringPhases = new Map();
    this.tokenPurchases = new Map();
    this.tokenHoldings = new Map();
    this.proposals = new Map();
    this.votes = new Map();
    this.propertySubmissions = new Map();
    this.submissionDocuments = new Map();
    this.propertyNominations = new Map();
    this.desiredUseVotes = new Map();
    
    this.seedMockData();
  }

  private seedMockData() {
    const etowahProperty: Property = {
      id: "etowah-wellness-village",
      ownerId: null,
      name: "Etowah Riverfront Wellness Village",
      description: "A transformative mixed-use development along the Etowah River in Canton, Georgia.",
      propertyType: "downtown",
      status: "live",
      streetAddress: "100 Riverfront Drive",
      city: "Canton",
      county: "Cherokee",
      state: "Georgia",
      zipCode: "30114",
      parcelNumber: null,
      acreage: "15.0",
      squareFootage: 65000,
      yearBuilt: null,
      currentUse: "Vacant industrial",
      proposedUse: "Mixed-use wellness village with housing, retail, and community center",
      estimatedValue: "8000000",
      fundingGoal: "10000000",
      communityBenefits: ["Affordable Housing", "Local Job Creation", "Community Center", "Green Space / Parks"],
      projectedROI: "8.0",
      projectedJobs: 120,
      projectedHousingUnits: 50,
      imageUrl: null,
      documentUrls: null,
      submittedAt: new Date(),
      approvedAt: new Date(),
      createdAt: new Date(),
    };
    this.properties.set(etowahProperty.id, etowahProperty);

    const etowahOffering: TokenOffering = {
      id: "etowah-offering",
      propertyId: "etowah-wellness-village",
      tokenSymbol: "ETOWAH",
      tokenName: "Etowah Wellness Token",
      totalSupply: 100000,
      tokensSold: 18500,
      contractAddress: null,
      currentPhase: "county",
      status: "active",
      fundingOutcome: "in_progress",
      minimumFundingThreshold: "6000000",
      fundingDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      totalFundingRaised: "231250",
      interestRateOnRefund: "3.00",
      createdAt: new Date(),
    };
    this.tokenOfferings.set(etowahOffering.id, etowahOffering);

    const phases: Array<{ phase: "county" | "state" | "national" | "international"; isActive: boolean; tokensSold: number }> = [
      { phase: "county", isActive: true, tokensSold: 18500 },
      { phase: "state", isActive: false, tokensSold: 0 },
      { phase: "national", isActive: false, tokensSold: 0 },
      { phase: "international", isActive: false, tokensSold: 0 },
    ];

    phases.forEach(({ phase, isActive, tokensSold }) => {
      const config = PHASE_CONFIG[phase];
      const phaseData: OfferingPhase = {
        id: `etowah-${phase}`,
        offeringId: "etowah-offering",
        phase,
        phaseOrder: config.order,
        basePrice: "12.50",
        currentPrice: calculatePhasePrice(12.50, phase).toString(),
        priceMultiplier: config.priceMultiplier.toString(),
        tokenAllocation: getPhaseAllocation(100000, phase),
        tokensSold,
        maxTokensPerPerson: config.maxTokensPerPerson,
        eligibilityCounty: phase === "county" ? "Cherokee" : null,
        eligibilityState: phase === "county" || phase === "state" ? "Georgia" : null,
        eligibilityCountry: phase !== "international" ? "USA" : null,
        startsAt: null,
        endsAt: null,
        isActive,
      };
      this.offeringPhases.set(phaseData.id, phaseData);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      walletAddress: null,
      county: null,
      state: null,
      country: "USA",
      isVerified: false,
    };
    this.users.set(id, user);
    return user;
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.status === "live" || p.status === "funded");
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      id,
      ownerId: insertProperty.ownerId ?? null,
      name: insertProperty.name,
      description: insertProperty.description,
      propertyType: insertProperty.propertyType,
      status: "submitted",
      streetAddress: insertProperty.streetAddress,
      city: insertProperty.city,
      county: insertProperty.county,
      state: insertProperty.state,
      zipCode: insertProperty.zipCode,
      parcelNumber: insertProperty.parcelNumber ?? null,
      acreage: insertProperty.acreage ?? null,
      squareFootage: insertProperty.squareFootage ?? null,
      yearBuilt: insertProperty.yearBuilt ?? null,
      currentUse: insertProperty.currentUse ?? null,
      proposedUse: insertProperty.proposedUse,
      estimatedValue: insertProperty.estimatedValue,
      fundingGoal: insertProperty.fundingGoal,
      communityBenefits: insertProperty.communityBenefits ?? null,
      projectedROI: insertProperty.projectedROI ?? null,
      projectedJobs: insertProperty.projectedJobs ?? null,
      projectedHousingUnits: insertProperty.projectedHousingUnits ?? null,
      imageUrl: insertProperty.imageUrl ?? null,
      documentUrls: insertProperty.documentUrls ?? null,
      submittedAt: new Date(),
      approvedAt: null,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updatePropertyStatus(id: string, status: Property["status"]): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (property) {
      property.status = status;
      if (status === "approved") {
        property.approvedAt = new Date();
      }
      this.properties.set(id, property);
      return property;
    }
    return undefined;
  }

  async getTokenOffering(id: string): Promise<TokenOffering | undefined> {
    return this.tokenOfferings.get(id);
  }

  async getOfferingByPropertyId(propertyId: string): Promise<TokenOffering | undefined> {
    return Array.from(this.tokenOfferings.values()).find(o => o.propertyId === propertyId);
  }

  async createTokenOffering(insertOffering: InsertTokenOffering): Promise<TokenOffering> {
    const id = randomUUID();
    const offering: TokenOffering = {
      id,
      propertyId: insertOffering.propertyId,
      tokenSymbol: insertOffering.tokenSymbol,
      tokenName: insertOffering.tokenName,
      totalSupply: insertOffering.totalSupply,
      tokensSold: 0,
      contractAddress: null,
      currentPhase: "county",
      status: "upcoming",
      fundingOutcome: insertOffering.fundingOutcome ?? "in_progress",
      minimumFundingThreshold: insertOffering.minimumFundingThreshold ?? null,
      fundingDeadline: insertOffering.fundingDeadline ?? null,
      totalFundingRaised: insertOffering.totalFundingRaised ?? "0",
      interestRateOnRefund: insertOffering.interestRateOnRefund ?? "3.00",
      createdAt: new Date(),
    };
    this.tokenOfferings.set(id, offering);
    return offering;
  }

  async getOfferingPhases(offeringId: string): Promise<OfferingPhase[]> {
    return Array.from(this.offeringPhases.values())
      .filter(p => p.offeringId === offeringId)
      .sort((a, b) => a.phaseOrder - b.phaseOrder);
  }

  async getActivePhase(offeringId: string): Promise<OfferingPhase | undefined> {
    return Array.from(this.offeringPhases.values()).find(p => p.offeringId === offeringId && p.isActive);
  }

  async createOfferingPhase(insertPhase: InsertOfferingPhase): Promise<OfferingPhase> {
    const id = randomUUID();
    const phase: OfferingPhase = {
      id,
      offeringId: insertPhase.offeringId,
      phase: insertPhase.phase,
      phaseOrder: insertPhase.phaseOrder,
      basePrice: insertPhase.basePrice,
      currentPrice: insertPhase.currentPrice,
      priceMultiplier: insertPhase.priceMultiplier,
      tokenAllocation: insertPhase.tokenAllocation,
      tokensSold: 0,
      maxTokensPerPerson: insertPhase.maxTokensPerPerson,
      eligibilityCounty: insertPhase.eligibilityCounty ?? null,
      eligibilityState: insertPhase.eligibilityState ?? null,
      eligibilityCountry: insertPhase.eligibilityCountry ?? null,
      startsAt: insertPhase.startsAt ?? null,
      endsAt: insertPhase.endsAt ?? null,
      isActive: false,
    };
    this.offeringPhases.set(id, phase);
    return phase;
  }

  async getUserPurchasesForPhase(userId: string, phaseId: string): Promise<TokenPurchase[]> {
    return Array.from(this.tokenPurchases.values()).filter(
      p => p.userId === userId && p.phaseId === phaseId && p.status === "confirmed"
    );
  }

  async canUserPurchase(userId: string, phaseId: string, tokenCount: number): Promise<{ allowed: boolean; reason?: string }> {
    const phase = this.offeringPhases.get(phaseId);
    if (!phase) {
      return { allowed: false, reason: "Phase not found" };
    }

    if (!phase.isActive) {
      return { allowed: false, reason: "This phase is not currently active" };
    }

    const user = await this.getUser(userId);
    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    if (phase.eligibilityCounty && user.county !== phase.eligibilityCounty) {
      return { allowed: false, reason: `This phase is restricted to ${phase.eligibilityCounty} County residents` };
    }

    if (phase.eligibilityState && user.state !== phase.eligibilityState) {
      return { allowed: false, reason: `This phase is restricted to ${phase.eligibilityState} residents` };
    }

    if (phase.eligibilityCountry && user.country !== phase.eligibilityCountry) {
      return { allowed: false, reason: `This phase is restricted to ${phase.eligibilityCountry} residents` };
    }

    const userPurchases = await this.getUserPurchasesForPhase(userId, phaseId);
    const totalPurchased = userPurchases.reduce((sum, p) => sum + p.tokenCount, 0);

    if (totalPurchased + tokenCount > phase.maxTokensPerPerson) {
      return { 
        allowed: false, 
        reason: `You can only purchase ${phase.maxTokensPerPerson - totalPurchased} more tokens in this phase (max ${phase.maxTokensPerPerson} per person)` 
      };
    }

    const tokensRemaining = phase.tokenAllocation - (phase.tokensSold || 0);
    if (tokenCount > tokensRemaining) {
      return { allowed: false, reason: `Only ${tokensRemaining} tokens remaining in this phase` };
    }

    return { allowed: true };
  }

  async createTokenPurchase(insertPurchase: InsertTokenPurchase): Promise<TokenPurchase> {
    const id = randomUUID();
    const purchase: TokenPurchase = {
      id,
      userId: insertPurchase.userId,
      offeringId: insertPurchase.offeringId,
      phaseId: insertPurchase.phaseId,
      tokenCount: insertPurchase.tokenCount,
      pricePerToken: insertPurchase.pricePerToken,
      totalAmount: insertPurchase.totalAmount,
      usdcAmount: insertPurchase.usdcAmount ?? null,
      usdcConversionRate: insertPurchase.usdcConversionRate ?? null,
      paymentMethod: insertPurchase.paymentMethod ?? "usdc",
      transactionHash: null,
      usdcTransactionHash: null,
      status: "pending",
      purchasedAt: new Date(),
    };
    this.tokenPurchases.set(id, purchase);
    return purchase;
  }

  async getUserHoldings(userId: string): Promise<TokenHolding[]> {
    return Array.from(this.tokenHoldings.values()).filter(h => h.userId === userId);
  }

  async getHoldingsByOffering(offeringId: string): Promise<TokenHolding[]> {
    return Array.from(this.tokenHoldings.values()).filter(h => h.offeringId === offeringId);
  }

  async getProposals(offeringId?: string): Promise<Proposal[]> {
    const proposals = Array.from(this.proposals.values());
    if (offeringId) {
      return proposals.filter(p => p.offeringId === offeringId);
    }
    return proposals;
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = randomUUID();
    const proposal: Proposal = {
      id,
      offeringId: insertProposal.offeringId,
      proposerId: insertProposal.proposerId,
      title: insertProposal.title,
      description: insertProposal.description,
      status: "draft",
      votesFor: 0,
      votesAgainst: 0,
      totalVoters: 0,
      quorumRequired: insertProposal.quorumRequired,
      startsAt: insertProposal.startsAt ?? null,
      endsAt: insertProposal.endsAt ?? null,
      createdAt: new Date(),
    };
    this.proposals.set(id, proposal);
    return proposal;
  }

  async getVotesForProposal(proposalId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(v => v.proposalId === proposalId);
  }

  async hasUserVoted(userId: string, proposalId: string): Promise<boolean> {
    return Array.from(this.votes.values()).some(v => v.userId === userId && v.proposalId === proposalId);
  }

  async castVote(proposalId: string, userId: string, voteDirection: boolean, votingPower: number): Promise<Vote> {
    const id = randomUUID();
    const proposal = this.proposals.get(proposalId);
    
    const vote: Vote = {
      id,
      proposalId,
      userId,
      offeringId: proposal?.offeringId || "",
      tokenBalanceAtVote: votingPower,
      voteDirection,
      votingPower,
      votedAt: new Date(),
    };
    this.votes.set(id, vote);
    
    if (proposal) {
      if (voteDirection) {
        proposal.votesFor = (proposal.votesFor || 0) + votingPower;
      } else {
        proposal.votesAgainst = (proposal.votesAgainst || 0) + votingPower;
      }
      proposal.totalVoters = (proposal.totalVoters || 0) + 1;
      this.proposals.set(proposalId, proposal);
    }
    
    return vote;
  }

  async calculateVotingPower(userId: string, offeringId: string): Promise<number> {
    const purchases = Array.from(this.tokenPurchases.values())
      .filter(p => p.userId === userId && p.status === "confirmed");
    
    let totalVotingPower = 0;
    
    for (const purchase of purchases) {
      const phase = this.offeringPhases.get(purchase.phaseId);
      if (phase && phase.offeringId === offeringId) {
        const multiplier = phase.phase === "county" ? 1.5 
          : phase.phase === "state" ? 1.25 
          : phase.phase === "national" ? 1.0 
          : 0.75;
        totalVotingPower += Math.floor(purchase.tokenCount * multiplier);
      }
    }
    
    return totalVotingPower;
  }

  // Property Submissions
  async createPropertySubmission(insertSubmission: InsertPropertySubmission): Promise<PropertySubmission> {
    const id = randomUUID();
    const submission: PropertySubmission = {
      id,
      ownerId: insertSubmission.ownerId ?? null,
      propertyType: insertSubmission.propertyType,
      name: insertSubmission.name,
      description: insertSubmission.description,
      streetAddress: insertSubmission.streetAddress,
      city: insertSubmission.city,
      state: insertSubmission.state,
      zipCode: insertSubmission.zipCode,
      county: insertSubmission.county,
      estimatedValue: insertSubmission.estimatedValue,
      fundingGoal: insertSubmission.fundingGoal,
      expectedReturn: insertSubmission.expectedReturn ?? null,
      communityBenefits: insertSubmission.communityBenefits ?? null,
      status: "draft",
      ownershipConfirmed: insertSubmission.ownershipConfirmed ?? false,
      termsAccepted: insertSubmission.termsAccepted ?? false,
      reviewNotes: null,
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.propertySubmissions.set(id, submission);
    return submission;
  }

  async getPropertySubmission(id: string): Promise<PropertySubmission | undefined> {
    return this.propertySubmissions.get(id);
  }

  async getPropertySubmissionsByOwner(ownerId: string): Promise<PropertySubmission[]> {
    return Array.from(this.propertySubmissions.values()).filter(s => s.ownerId === ownerId);
  }

  async getPropertySubmissionsByStatus(status: PropertySubmission["status"]): Promise<PropertySubmission[]> {
    return Array.from(this.propertySubmissions.values()).filter(s => s.status === status);
  }

  async updatePropertySubmission(id: string, data: Partial<InsertPropertySubmission>): Promise<PropertySubmission | undefined> {
    const submission = this.propertySubmissions.get(id);
    if (!submission) return undefined;

    const updated: PropertySubmission = {
      ...submission,
      ...data,
      updatedAt: new Date(),
    };
    this.propertySubmissions.set(id, updated);
    return updated;
  }

  async updatePropertySubmissionStatus(
    id: string, 
    status: PropertySubmission["status"], 
    reviewNotes?: string, 
    reviewedBy?: string
  ): Promise<PropertySubmission | undefined> {
    const submission = this.propertySubmissions.get(id);
    if (!submission) return undefined;

    const updated: PropertySubmission = {
      ...submission,
      status,
      reviewNotes: reviewNotes ?? submission.reviewNotes,
      reviewedBy: reviewedBy ?? submission.reviewedBy,
      reviewedAt: reviewedBy ? new Date() : submission.reviewedAt,
      submittedAt: status === "submitted" ? new Date() : submission.submittedAt,
      updatedAt: new Date(),
    };
    this.propertySubmissions.set(id, updated);
    return updated;
  }

  // Submission Documents
  async addSubmissionDocument(insertDoc: InsertSubmissionDocument): Promise<SubmissionDocument> {
    const id = randomUUID();
    const doc: SubmissionDocument = {
      id,
      submissionId: insertDoc.submissionId,
      fileName: insertDoc.fileName,
      fileType: insertDoc.fileType,
      fileSize: insertDoc.fileSize,
      storageKey: insertDoc.storageKey,
      documentType: insertDoc.documentType,
      uploadedAt: new Date(),
    };
    this.submissionDocuments.set(id, doc);
    return doc;
  }

  async getSubmissionDocuments(submissionId: string): Promise<SubmissionDocument[]> {
    return Array.from(this.submissionDocuments.values()).filter(d => d.submissionId === submissionId);
  }

  async deleteSubmissionDocument(id: string): Promise<boolean> {
    return this.submissionDocuments.delete(id);
  }

  // Property Nominations
  async createPropertyNomination(insertNomination: InsertPropertyNomination): Promise<PropertyNomination> {
    const id = randomUUID();
    const nomination: PropertyNomination = {
      id,
      nominatorId: insertNomination.nominatorId ?? null,
      propertyAddress: insertNomination.propertyAddress,
      city: insertNomination.city,
      county: insertNomination.county,
      state: insertNomination.state,
      zipCode: insertNomination.zipCode ?? null,
      latitude: insertNomination.latitude ?? null,
      longitude: insertNomination.longitude ?? null,
      parcelId: insertNomination.parcelId ?? null,
      description: insertNomination.description,
      whyThisProperty: insertNomination.whyThisProperty,
      currentCondition: insertNomination.currentCondition ?? null,
      estimatedSize: insertNomination.estimatedSize ?? null,
      desiredUses: insertNomination.desiredUses ?? null,
      topVotedUse: null,
      ownerDetectionStatus: "pending",
      detectedOwnerName: null,
      detectedOwnerType: null,
      detectedOwnerAddress: null,
      detectedOwnerEmail: null,
      detectedOwnerPhone: null,
      ownerDataSource: null,
      ownerDataConfidence: null,
      ownerNotifiedAt: null,
      ownerNotificationLink: null,
      ownerResponseStatus: null,
      status: "submitted",
      nominationVotes: 0,
      createdAt: new Date(),
    };
    this.propertyNominations.set(id, nomination);
    return nomination;
  }

  async getPropertyNomination(id: string): Promise<PropertyNomination | undefined> {
    return this.propertyNominations.get(id);
  }

  async getPropertyNominations(): Promise<PropertyNomination[]> {
    return Array.from(this.propertyNominations.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getPropertyNominationsByStatus(status: PropertyNomination["status"]): Promise<PropertyNomination[]> {
    return Array.from(this.propertyNominations.values())
      .filter(n => n.status === status)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updatePropertyNomination(id: string, data: Partial<PropertyNomination>): Promise<PropertyNomination | undefined> {
    const nomination = this.propertyNominations.get(id);
    if (!nomination) return undefined;

    const updated: PropertyNomination = {
      ...nomination,
      ...data,
    };
    this.propertyNominations.set(id, updated);
    return updated;
  }

  // Desired Use Votes
  async addDesiredUseVote(nominationId: string, userId: string, desiredUse: string): Promise<DesiredUseVote> {
    const id = randomUUID();
    const vote: DesiredUseVote = {
      id,
      nominationId,
      userId,
      desiredUse,
      votedAt: new Date(),
    };
    this.desiredUseVotes.set(id, vote);
    
    // Update the nomination with the vote count
    const nomination = this.propertyNominations.get(nominationId);
    if (nomination) {
      nomination.nominationVotes = (nomination.nominationVotes ?? 0) + 1;
      this.propertyNominations.set(nominationId, nomination);
    }
    
    return vote;
  }

  async getDesiredUseVotes(nominationId: string): Promise<DesiredUseVote[]> {
    return Array.from(this.desiredUseVotes.values()).filter(v => v.nominationId === nominationId);
  }

  async hasUserVotedOnNomination(userId: string, nominationId: string): Promise<boolean> {
    return Array.from(this.desiredUseVotes.values()).some(
      v => v.nominationId === nominationId && v.userId === userId
    );
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
    const nomination = this.propertyNominations.get(nominationId);
    if (!nomination) return undefined;
    
    const updated: PropertyNomination = {
      ...nomination,
      ownerDetectionStatus: (ownerInfo.ownerDetectionStatus as any) || nomination.ownerDetectionStatus,
      detectedOwnerName: ownerInfo.detectedOwnerName || nomination.detectedOwnerName,
      detectedOwnerType: ownerInfo.detectedOwnerType || nomination.detectedOwnerType,
      detectedOwnerAddress: ownerInfo.detectedOwnerAddress || nomination.detectedOwnerAddress,
      detectedOwnerEmail: ownerInfo.detectedOwnerEmail || nomination.detectedOwnerEmail,
      detectedOwnerPhone: ownerInfo.detectedOwnerPhone || nomination.detectedOwnerPhone,
      ownerDataSource: ownerInfo.ownerDataSource || nomination.ownerDataSource,
      ownerDataConfidence: ownerInfo.ownerDataConfidence ?? nomination.ownerDataConfidence,
      ownerNotifiedAt: ownerInfo.ownerNotifiedAt || nomination.ownerNotifiedAt,
      ownerNotificationLink: ownerInfo.ownerNotificationLink || nomination.ownerNotificationLink,
      ownerResponseStatus: ownerInfo.ownerResponseStatus || nomination.ownerResponseStatus,
    };
    
    this.propertyNominations.set(nominationId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
