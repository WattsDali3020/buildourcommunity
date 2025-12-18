import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  county: text("county"),
  state: text("state"),
  country: text("country").default("USA"),
  isVerified: boolean("is_verified").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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

export const offeringStatusEnum = pgEnum("offering_status", [
  "upcoming",
  "active",
  "completed",
  "cancelled"
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
  transactionHash: text("transaction_hash"),
  status: purchaseStatusEnum("status").default("pending"),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const insertTokenPurchaseSchema = createInsertSchema(tokenPurchases).omit({
  id: true,
  transactionHash: true,
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
  voteDirection: boolean("vote_direction").notNull(),
  votingPower: integer("voting_power").notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
});

export type Vote = typeof votes.$inferSelect;

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

export function calculatePhasePrice(basePrice: number, phase: keyof typeof PHASE_CONFIG): number {
  return Number((basePrice * PHASE_CONFIG[phase].priceMultiplier).toFixed(2));
}

export function getPhaseAllocation(totalSupply: number, phase: keyof typeof PHASE_CONFIG): number {
  return Math.floor(totalSupply * (PHASE_CONFIG[phase].allocationPercent / 100));
}
