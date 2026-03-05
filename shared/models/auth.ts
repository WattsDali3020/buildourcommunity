import { pgTable, text, timestamp, varchar, pgEnum, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "contractor", "realtor", "attorney", "engineer", "architect", "lender", "inspector", "appraiser"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  walletAddress: text("wallet_address"),
  county: text("county"),
  state: text("state"),
  country: text("country").default("USA"),
  role: userRoleEnum("role").default("user"),
  kycStatus: text("kyc_status").default("pending"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  riskDisclosureAcknowledgedAt: timestamp("risk_disclosure_acknowledged_at"),
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey().notNull(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
