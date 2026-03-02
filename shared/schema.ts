import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, sessions, type User, type UpsertUser } from "./models/auth";

export { users, sessions, type User, type UpsertUser };

export const kycStatusEnum = pgEnum("kyc_status", [
  "pending",
  "submitted",
  "verified",
  "rejected"
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "vacant_land",
  "historic_building", 
  "commercial",
  "downtown"
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "tokenizing",
  "live",
  "funded",
  "rejected"
]);

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  status: propertyStatusEnum("status").default("draft"),
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  county: text("county").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  parcelNumber: text("parcel_number"),
  acreage: decimal("acreage", { precision: 10, scale: 2 }),
  squareFootage: integer("square_footage"),
  yearBuilt: integer("year_built"),
  currentUse: text("current_use"),
  proposedUse: text("proposed_use").notNull(),
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }).notNull(),
  fundingGoal: decimal("funding_goal", { precision: 15, scale: 2 }).notNull(),
  communityBenefits: text("community_benefits").array(),
  projectedROI: decimal("projected_roi", { precision: 5, scale: 2 }),
  projectedJobs: integer("projected_jobs"),
  projectedHousingUnits: integer("projected_housing_units"),
  imageUrl: text("image_url"),
  documentUrls: text("document_urls").array(),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  status: true,
  submittedAt: true,
  approvedAt: true,
  createdAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export const offeringPhaseEnum = pgEnum("offering_phase", [
  "county",
  "state", 
  "national",
  "international"
]);

export const offeringTypeEnum = pgEnum("offering_type", [
  "public",
  "private"
]);

export const offeringStatusEnum = pgEnum("offering_status", [
  "upcoming",
  "active",
  "completed",
  "cancelled",
  "failed_funding"
]);

export const fundingOutcomeEnum = pgEnum("funding_outcome", [
  "in_progress",
  "funded",
  "failed",
  "refunded"
]);

export const tokenOfferings = pgTable("token_offerings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenName: text("token_name").notNull(),
  totalSupply: integer("total_supply").notNull(),
  tokensSold: integer("tokens_sold").default(0),
  contractAddress: text("contract_address"),
  currentPhase: offeringPhaseEnum("current_phase").default("county"),
  status: offeringStatusEnum("status").default("upcoming"),
  fundingOutcome: fundingOutcomeEnum("funding_outcome").default("in_progress"),
  minimumFundingThreshold: decimal("minimum_funding_threshold", { precision: 15, scale: 2 }),
  fundingDeadline: timestamp("funding_deadline"),
  totalFundingRaised: decimal("total_funding_raised", { precision: 15, scale: 2 }).default("0"),
  interestRateOnRefund: decimal("interest_rate_on_refund", { precision: 5, scale: 2 }).default("3.00"),
  offeringType: offeringTypeEnum("offering_type").default("public"),
  accessCode: text("access_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTokenOfferingSchema = createInsertSchema(tokenOfferings).omit({
  id: true,
  tokensSold: true,
  contractAddress: true,
  currentPhase: true,
  status: true,
  createdAt: true,
});

export type InsertTokenOffering = z.infer<typeof insertTokenOfferingSchema>;
export type TokenOffering = typeof tokenOfferings.$inferSelect;

// Fund escrow tracking - USDC deposits and yield generation for investor protection
export const fundEscrow = pgTable("fund_escrow", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offeringId: varchar("offering_id").references(() => tokenOfferings.id).notNull(),
  totalUsdcDeposited: decimal("total_usdc_deposited", { precision: 18, scale: 6 }).default("0"),
  totalYieldEarned: decimal("total_yield_earned", { precision: 18, scale: 6 }).default("0"),
  currentYieldRate: decimal("current_yield_rate", { precision: 5, scale: 2 }).default("3.00"),
  yieldProtocol: text("yield_protocol").default("aave_v3"),
  yieldContractAddress: text("yield_contract_address"),
  lastYieldAccrualAt: timestamp("last_yield_accrual_at").defaultNow(),
  escrowWalletAddress: text("escrow_wallet_address"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type FundEscrow = typeof fundEscrow.$inferSelect;

export const offeringPhases = pgTable("offering_phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offeringId: varchar("offering_id").references(() => tokenOfferings.id).notNull(),
  phase: offeringPhaseEnum("phase").notNull(),
  phaseOrder: integer("phase_order").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  priceMultiplier: decimal("price_multiplier", { precision: 5, scale: 2 }).notNull(),
  tokenAllocation: integer("token_allocation").notNull(),
  tokensSold: integer("tokens_sold").default(0),
  maxTokensPerPerson: integer("max_tokens_per_person").notNull(),
  eligibilityCounty: text("eligibility_county"),
  eligibilityState: text("eligibility_state"),
  eligibilityCountry: text("eligibility_country"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  isActive: boolean("is_active").default(false),
});

export const insertOfferingPhaseSchema = createInsertSchema(offeringPhases).omit({
  id: true,
  tokensSold: true,
  isActive: true,
});

export type InsertOfferingPhase = z.infer<typeof insertOfferingPhaseSchema>;
export type OfferingPhase = typeof offeringPhases.$inferSelect;

export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending",
  "confirmed",
  "failed",
  "refunded"
]);

export const tokenPurchases = pgTable("token_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  offeringId: varchar("offering_id").references(() => tokenOfferings.id).notNull(),
  phaseId: varchar("phase_id").references(() => offeringPhases.id).notNull(),
  tokenCount: integer("token_count").notNull(),
  pricePerToken: decimal("price_per_token", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  usdcAmount: decimal("usdc_amount", { precision: 18, scale: 6 }),
  usdcConversionRate: decimal("usdc_conversion_rate", { precision: 10, scale: 4 }),
  paymentMethod: text("payment_method").default("usdc"),
  paymentIntentId: text("payment_intent_id"),
  transactionHash: text("transaction_hash"),
  usdcTransactionHash: text("usdc_transaction_hash"),
  status: purchaseStatusEnum("status").default("pending"),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const insertTokenPurchaseSchema = createInsertSchema(tokenPurchases).omit({
  id: true,
  transactionHash: true,
  usdcTransactionHash: true,
  status: true,
  purchasedAt: true,
});

export type InsertTokenPurchase = z.infer<typeof insertTokenPurchaseSchema>;
export type TokenPurchase = typeof tokenPurchases.$inferSelect;

export const tokenHoldings = pgTable("token_holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  offeringId: varchar("offering_id").references(() => tokenOfferings.id).notNull(),
  tokenCount: integer("token_count").notNull(),
  averagePurchasePrice: decimal("average_purchase_price", { precision: 10, scale: 2 }).notNull(),
  votingPower: integer("voting_power").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TokenHolding = typeof tokenHoldings.$inferSelect;

// Failed funding refund and share transfer system
export const refundStatusEnum = pgEnum("refund_status", [
  "pending",
  "processing",
  "completed",
  "failed"
]);

export const tokenRefunds = pgTable("token_refunds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  offeringId: varchar("offering_id").references(() => tokenOfferings.id).notNull(),
  tokenCount: integer("token_count").notNull(),
  originalAmount: decimal("original_amount", { precision: 15, scale: 2 }).notNull(),
  interestEarned: decimal("interest_earned", { precision: 15, scale: 2 }).notNull(),
  totalRefundAmount: decimal("total_refund_amount", { precision: 15, scale: 2 }).notNull(),
  refundTransactionHash: text("refund_transaction_hash"),
  status: refundStatusEnum("status").default("pending"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export type TokenRefund = typeof tokenRefunds.$inferSelect;

export const shareTransferStatusEnum = pgEnum("share_transfer_status", [
  "pending",
  "approved",
  "completed",
  "rejected"
]);

export const shareTransfers = pgTable("share_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  fromOfferingId: varchar("from_offering_id").references(() => tokenOfferings.id).notNull(),
  toOfferingId: varchar("to_offering_id").references(() => tokenOfferings.id).notNull(),
  tokenCount: integer("token_count").notNull(),
  originalValue: decimal("original_value", { precision: 15, scale: 2 }).notNull(),
  transferValue: decimal("transfer_value", { precision: 15, scale: 2 }).notNull(),
  status: shareTransferStatusEnum("status").default("pending"),
  requestedAt: timestamp("requested_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type ShareTransfer = typeof shareTransfers.$inferSelect;

// Funding timeline configuration - 1 year distribution algo
// CRITICAL: 100% funding is required for loan issuance
// If funding target is not met within 1 year, investors receive refunds with 3% APR
export const FUNDING_TIMELINE_CONFIG = {
  totalDurationDays: 365,
  phaseDurations: {
    county: { daysMin: 30, daysMax: 90, targetPercent: 25 },
    state: { daysMin: 45, daysMax: 120, targetPercent: 50 },
    national: { daysMin: 60, daysMax: 120, targetPercent: 75 },
    international: { daysMin: 30, daysMax: 35, targetPercent: 100 },
  },
  // 100% funding required - no partial funding allowed per investor protection model
  minimumFundingPercent: 100,
  gracePeriodDays: 30,
  refundInterestRate: 3.0,
} as const;

export function calculatePhaseDuration(
  phase: keyof typeof FUNDING_TIMELINE_CONFIG.phaseDurations,
  currentFundingPercent: number,
  targetPercent: number
): number {
  const config = FUNDING_TIMELINE_CONFIG.phaseDurations[phase];
  const progressRatio = currentFundingPercent / targetPercent;
  if (progressRatio >= 0.8) {
    return config.daysMin;
  } else if (progressRatio >= 0.5) {
    return Math.floor((config.daysMin + config.daysMax) / 2);
  }
  return config.daysMax;
}

export function calculateRefundWithInterest(
  originalAmount: number,
  purchaseDate: Date,
  interestRate: number = FUNDING_TIMELINE_CONFIG.refundInterestRate
): { interest: number; total: number } {
  const now = new Date();
  const daysHeld = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
  const yearFraction = daysHeld / 365;
  const interest = Number((originalAmount * (interestRate / 100) * yearFraction).toFixed(2));
  return { interest, total: originalAmount + interest };
}

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "active",
  "passed",
  "rejected",
  "executed"
]);

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offeringId: varchar("offering_id").references(() => tokenOfferings.id).notNull(),
  proposerId: varchar("proposer_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: proposalStatusEnum("status").default("draft"),
  votesFor: integer("votes_for").default(0),
  votesAgainst: integer("votes_against").default(0),
  totalVoters: integer("total_voters").default(0),
  quorumRequired: integer("quorum_required").notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  status: true,
  votesFor: true,
  votesAgainst: true,
  totalVoters: true,
  createdAt: true,
});

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").references(() => proposals.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  offeringId: varchar("offering_id").references(() => tokenOfferings.id).notNull(),
  tokenBalanceAtVote: integer("token_balance_at_vote").notNull(),
  voteDirection: boolean("vote_direction").notNull(),
  votingPower: integer("voting_power").notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
});

export type Vote = typeof votes.$inferSelect;

// Vote eligibility check - must own tokens to vote
export function canVote(tokenBalance: number): boolean {
  return tokenBalance > 0;
}

export function calculateVotingPower(tokenBalance: number): number {
  return tokenBalance;
}

// Community Property Election System
export const nominationStatusEnum = pgEnum("nomination_status", [
  "submitted",
  "under_review",
  "approved",
  "in_voting",
  "selected",
  "rejected"
]);

export const ownerDetectionStatusEnum = pgEnum("owner_detection_status", [
  "pending",
  "searching",
  "found",
  "not_found",
  "verified"
]);

export const propertyNominations = pgTable("property_nominations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nominatorId: varchar("nominator_id").references(() => users.id),
  propertyAddress: text("property_address").notNull(),
  city: text("city").notNull(),
  county: text("county").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  // Map coordinates for location
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  parcelId: text("parcel_id"),
  // Nomination details
  description: text("description").notNull(),
  whyThisProperty: text("why_this_property").notNull(),
  currentCondition: text("current_condition"),
  estimatedSize: text("estimated_size"),
  // Desired use voting
  desiredUses: text("desired_uses").array(),
  topVotedUse: text("top_voted_use"),
  // Owner detection
  ownerDetectionStatus: ownerDetectionStatusEnum("owner_detection_status").default("pending"),
  detectedOwnerName: text("detected_owner_name"),
  detectedOwnerType: text("detected_owner_type"), // individual, corporation, government, estate
  detectedOwnerAddress: text("detected_owner_address"),
  detectedOwnerEmail: text("detected_owner_email"),
  detectedOwnerPhone: text("detected_owner_phone"),
  ownerDataSource: text("owner_data_source"), // county_assessor, regrid, opencorporates
  ownerDataConfidence: integer("owner_data_confidence"), // 0-100
  ownerNotifiedAt: timestamp("owner_notified_at"),
  ownerNotificationLink: text("owner_notification_link"),
  ownerResponseStatus: text("owner_response_status"), // pending, interested, not_interested
  // Status
  status: nominationStatusEnum("status").default("submitted"),
  nominationVotes: integer("nomination_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertyNominationSchema = createInsertSchema(propertyNominations).omit({
  id: true,
  status: true,
  nominationVotes: true,
  createdAt: true,
});

export type InsertPropertyNomination = z.infer<typeof insertPropertyNominationSchema>;
export type PropertyNomination = typeof propertyNominations.$inferSelect;

// Community needs categories from surveys
export const communityNeeds = pgTable("community_needs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  county: text("county").notNull(),
  state: text("state").notNull(),
  category: text("category").notNull(),
  need: text("need").notNull(),
  description: text("description"),
  priority: integer("priority").default(0),
  voteCount: integer("vote_count").default(0),
  isGeneric: boolean("is_generic").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommunityNeedSchema = createInsertSchema(communityNeeds).omit({
  id: true,
  priority: true,
  voteCount: true,
  createdAt: true,
});

export type InsertCommunityNeed = z.infer<typeof insertCommunityNeedSchema>;
export type CommunityNeed = typeof communityNeeds.$inferSelect;

// Property use proposals - what the community wants property to become
export const useProposalStatusEnum = pgEnum("use_proposal_status", [
  "proposed",
  "in_voting",
  "approved",
  "rejected"
]);

export const propertyUseProposals = pgTable("property_use_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nominationId: varchar("nomination_id").references(() => propertyNominations.id).notNull(),
  proposerId: varchar("proposer_id").references(() => users.id),
  proposedUse: text("proposed_use").notNull(),
  description: text("description").notNull(),
  communityNeedIds: text("community_need_ids").array(),
  estimatedBudget: decimal("estimated_budget", { precision: 15, scale: 2 }),
  estimatedJobs: integer("estimated_jobs"),
  estimatedTimeline: text("estimated_timeline"),
  status: useProposalStatusEnum("status").default("proposed"),
  votesFor: integer("votes_for").default(0),
  votesAgainst: integer("votes_against").default(0),
  totalVoters: integer("total_voters").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertyUseProposalSchema = createInsertSchema(propertyUseProposals).omit({
  id: true,
  status: true,
  votesFor: true,
  votesAgainst: true,
  totalVoters: true,
  createdAt: true,
});

export type InsertPropertyUseProposal = z.infer<typeof insertPropertyUseProposalSchema>;
export type PropertyUseProposal = typeof propertyUseProposals.$inferSelect;

// Votes on property nominations
export const nominationVotes = pgTable("nomination_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nominationId: varchar("nomination_id").references(() => propertyNominations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
});

export type NominationVote = typeof nominationVotes.$inferSelect;

// Votes on property use proposals
export const useProposalVotes = pgTable("use_proposal_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").references(() => propertyUseProposals.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  voteDirection: boolean("vote_direction").notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
});

export type UseProposalVote = typeof useProposalVotes.$inferSelect;

// Votes on community needs
export const communityNeedVotes = pgTable("community_need_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  needId: varchar("need_id").references(() => communityNeeds.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
});

export type CommunityNeedVote = typeof communityNeedVotes.$inferSelect;

// Votes on desired uses for nominations
export const desiredUseVotes = pgTable("desired_use_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nominationId: varchar("nomination_id").references(() => propertyNominations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  desiredUse: text("desired_use").notNull(), // from GENERIC_PROPERTY_USES
  votedAt: timestamp("voted_at").defaultNow(),
});

export type DesiredUseVote = typeof desiredUseVotes.$inferSelect;

// Property Grants and Incentives - tracking government funding at all levels
export const grantLevelEnum = pgEnum("grant_level", [
  "city",
  "county",
  "state",
  "federal"
]);

export const grantStatusEnum = pgEnum("grant_status", [
  "identified",
  "applied",
  "under_review",
  "awarded",
  "disbursed",
  "rejected",
  "expired"
]);

export const grantTypeEnum = pgEnum("grant_type", [
  "community_development",
  "historic_preservation",
  "brownfield_remediation",
  "affordable_housing",
  "economic_development",
  "infrastructure",
  "environmental",
  "opportunity_zone",
  "tax_credit",
  "other"
]);

export const propertyGrants = pgTable("property_grants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  grantName: text("grant_name").notNull(),
  grantLevel: grantLevelEnum("grant_level").notNull(),
  grantType: grantTypeEnum("grant_type").notNull(),
  grantingAgency: text("granting_agency").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: grantStatusEnum("status").default("identified"),
  applicationDeadline: timestamp("application_deadline"),
  appliedAt: timestamp("applied_at"),
  awardedAt: timestamp("awarded_at"),
  disbursedAt: timestamp("disbursed_at"),
  complianceRequirements: text("compliance_requirements"),
  jobsRequired: integer("jobs_required"),
  affordableUnitsRequired: integer("affordable_units_required"),
  reportingFrequency: text("reporting_frequency"),
  notes: text("notes"),
  documentUrls: text("document_urls").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertyGrantSchema = createInsertSchema(propertyGrants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPropertyGrant = z.infer<typeof insertPropertyGrantSchema>;
export type PropertyGrant = typeof propertyGrants.$inferSelect;

// Capital stack summary type for frontend use
export interface CapitalStackSummary {
  totalProjectCost: number;
  tokenFunding: number;
  grantFunding: {
    city: number;
    county: number;
    state: number;
    federal: number;
    total: number;
  };
  grantsByStatus: {
    secured: number;
    pending: number;
    identified: number;
  };
  remainingToRaise: number;
  percentFunded: number;
}

// Owner contact attempts - tracking outreach to property owners
export const contactMethodEnum = pgEnum("contact_method", [
  "email",
  "sms",
  "phone",
  "mail",
  "portal_link"
]);

export const contactStatusEnum = pgEnum("contact_status", [
  "pending",
  "sent",
  "delivered",
  "opened",
  "responded",
  "bounced",
  "failed"
]);

export const ownerContactAttempts = pgTable("owner_contact_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nominationId: varchar("nomination_id").references(() => propertyNominations.id).notNull(),
  method: contactMethodEnum("method").notNull(),
  recipient: text("recipient").notNull(), // email address, phone number, or mailing address
  subject: text("subject"),
  messagePreview: text("message_preview"),
  portalLinkToken: text("portal_link_token"), // unique token for owner portal access
  status: contactStatusEnum("status").default("pending"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  respondedAt: timestamp("responded_at"),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type OwnerContactAttempt = typeof ownerContactAttempts.$inferSelect;

// Blockchain deployments - tracking smart contract deployments on Base
export const deploymentStatusEnum = pgEnum("deployment_status", [
  "pending",
  "deploying",
  "deployed",
  "verified",
  "failed"
]);

export const blockchainDeployments = pgTable("blockchain_deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offeringId: varchar("offering_id").references(() => tokenOfferings.id).notNull(),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  // Contract details
  contractType: text("contract_type").notNull(), // ERC20, ERC1155
  contractAddress: text("contract_address"),
  deployerAddress: text("deployer_address"),
  // Base network details
  networkId: integer("network_id").default(8453), // Base mainnet
  networkName: text("network_name").default("Base"),
  deploymentTxHash: text("deployment_tx_hash"),
  blockNumber: integer("block_number"),
  // Token details
  tokenName: text("token_name").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  totalSupply: integer("total_supply").notNull(),
  decimals: integer("decimals").default(0),
  // Status
  status: deploymentStatusEnum("status").default("pending"),
  verificationUrl: text("verification_url"),
  errorMessage: text("error_message"),
  // Timestamps
  deployedAt: timestamp("deployed_at"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BlockchainDeployment = typeof blockchainDeployments.$inferSelect;

// Generic property use choices
// Property Submissions - for property owners submitting their properties for tokenization
export const submissionStatusEnum = pgEnum("submission_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected"
]);

export const propertySubmissions = pgTable("property_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id),
  // Property Details
  propertyType: text("property_type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  // Location
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  county: text("county").notNull(),
  // Financials
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }).notNull(),
  fundingGoal: decimal("funding_goal", { precision: 15, scale: 2 }).notNull(),
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }),
  // Community Impact
  communityBenefits: text("community_benefits").array(),
  // Status
  status: submissionStatusEnum("status").default("draft"),
  ownershipConfirmed: boolean("ownership_confirmed").default(false),
  termsAccepted: boolean("terms_accepted").default(false),
  // Review info
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  // Timestamps
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertySubmissionSchema = createInsertSchema(propertySubmissions).omit({
  id: true,
  status: true,
  reviewNotes: true,
  reviewedBy: true,
  reviewedAt: true,
  submittedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPropertySubmission = z.infer<typeof insertPropertySubmissionSchema>;
export type PropertySubmission = typeof propertySubmissions.$inferSelect;

// Documents uploaded for property submissions
export const submissionDocuments = pgTable("submission_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").references(() => propertySubmissions.id).notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  storageKey: text("storage_key").notNull(),
  documentType: text("document_type").notNull(), // ownership_proof, deed, survey, etc.
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertSubmissionDocumentSchema = createInsertSchema(submissionDocuments).omit({
  id: true,
  uploadedAt: true,
});

export type InsertSubmissionDocument = z.infer<typeof insertSubmissionDocumentSchema>;
export type SubmissionDocument = typeof submissionDocuments.$inferSelect;

// Private offering invites - email-based invitations
export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "sent",
  "accepted",
  "declined",
  "expired"
]);

export const privateOfferingInvites = pgTable("private_offering_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offeringId: varchar("offering_id").references(() => tokenOfferings.id).notNull(),
  email: text("email").notNull(),
  inviteeName: text("invitee_name"),
  inviteCode: text("invite_code").notNull(),
  status: inviteStatusEnum("status").default("pending"),
  maxTokens: integer("max_tokens"),
  tokensPurchased: integer("tokens_purchased").default(0),
  invitedBy: varchar("invited_by").references(() => users.id),
  sentAt: timestamp("sent_at"),
  acceptedAt: timestamp("accepted_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrivateOfferingInviteSchema = createInsertSchema(privateOfferingInvites).omit({
  id: true,
  status: true,
  tokensPurchased: true,
  sentAt: true,
  acceptedAt: true,
  createdAt: true,
});

export type InsertPrivateOfferingInvite = z.infer<typeof insertPrivateOfferingInviteSchema>;
export type PrivateOfferingInvite = typeof privateOfferingInvites.$inferSelect;

// Waitlist signups for beta notifications
export const waitlistRoleEnum = pgEnum("waitlist_role", [
  "investor",
  "property_owner",
  "community_member",
  "other"
]);

export const waitlist = pgTable("waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  role: waitlistRoleEnum("role").notNull(),
  message: varchar("message", { length: 250 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true,
});

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;

export const GENERIC_PROPERTY_USES = [
  { id: "affordable_housing", label: "Affordable Housing", category: "Housing" },
  { id: "mixed_use", label: "Mixed-Use Development", category: "Development" },
  { id: "community_center", label: "Community Center", category: "Community" },
  { id: "small_business_hub", label: "Small Business Hub / Incubator", category: "Economic" },
  { id: "healthcare_facility", label: "Healthcare Facility", category: "Healthcare" },
  { id: "youth_center", label: "Youth Recreation Center", category: "Community" },
  { id: "senior_center", label: "Senior Services Center", category: "Community" },
  { id: "arts_culture", label: "Arts & Culture Space", category: "Culture" },
  { id: "urban_farm", label: "Urban Farm / Community Garden", category: "Food" },
  { id: "workforce_training", label: "Workforce Training Center", category: "Education" },
  { id: "childcare", label: "Childcare Facility", category: "Family" },
  { id: "food_hall", label: "Food Hall / Market", category: "Food" },
  { id: "coworking", label: "Co-Working Space", category: "Economic" },
  { id: "park_greenspace", label: "Park / Green Space", category: "Recreation" },
  { id: "historic_preservation", label: "Historic Preservation", category: "Culture" },
] as const;

export const PHASE_CONFIG = {
  county: {
    order: 1,
    name: "County",
    description: "Local community members only",
    maxTokensPerPerson: 100,
    basePrice: 12.50,
    priceMultiplier: 1.0,
    allocationPercent: 25,
  },
  state: {
    order: 2,
    name: "State",
    description: "State residents",
    maxTokensPerPerson: 250,
    basePrice: 12.50,
    priceMultiplier: 1.5,
    allocationPercent: 25,
  },
  national: {
    order: 3,
    name: "National",
    description: "All US residents",
    maxTokensPerPerson: 500,
    basePrice: 12.50,
    priceMultiplier: 2.25,
    allocationPercent: 25,
  },
  international: {
    order: 4,
    name: "International",
    description: "Global investors",
    maxTokensPerPerson: 1000,
    basePrice: 12.50,
    priceMultiplier: 3.0,
    allocationPercent: 25,
  },
} as const;

export const wishes = pgTable("wishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  zipCode: text("zip_code"),
  votes: integer("votes").notNull().default(0),
  email: text("email"),
  takeItFurther: boolean("take_it_further").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWishSchema = createInsertSchema(wishes).omit({
  id: true,
  votes: true,
  createdAt: true,
});

export type InsertWish = z.infer<typeof insertWishSchema>;
export type Wish = typeof wishes.$inferSelect;

export const serviceBidStatusEnum = pgEnum("service_bid_status", [
  "pending",
  "approved",
  "rejected"
]);

export const serviceBids = pgTable("service_bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceType: text("service_type").notNull(),
  zipCode: text("zip_code").notNull(),
  companyName: text("company_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  description: text("description").notNull(),
  bidAmount: decimal("bid_amount", { precision: 12, scale: 2 }).notNull(),
  status: serviceBidStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceBidSchema = createInsertSchema(serviceBids).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertServiceBid = z.infer<typeof insertServiceBidSchema>;
export type ServiceBid = typeof serviceBids.$inferSelect;

export function calculatePhasePrice(basePrice: number, phase: keyof typeof PHASE_CONFIG): number {
  return Number((basePrice * PHASE_CONFIG[phase].priceMultiplier).toFixed(2));
}

export function getPhaseAllocation(totalSupply: number, phase: keyof typeof PHASE_CONFIG): number {
  return Math.floor(totalSupply * (PHASE_CONFIG[phase].allocationPercent / 100));
}
