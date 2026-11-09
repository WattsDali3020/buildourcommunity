/**
 * Confirmed access, vote-weight, and funding-clock rules (owner, Nov 5–9, 2026).
 *
 * Residency verification is a stub: callers pass kycStatus === "verified".
 * No KYC provider is integrated.
 *
 * Early completion, transfer exceptions, refunds, and post-period liquidity
 * are not decided. sharesLocked stays closed on both sides of day 365.
 */

export const STAGE_BOUNDARIES = {
  /** County-only through the end of the 90th day. */
  countyEndDay: 90,
  /** Statewide through the end of day 180. Nationwide after that. */
  stateEndDay: 180,
  /** One common funding period. Not a rolling year per purchase. */
  fundingPeriodDays: 365,
} as const;

export const VOTE_WEIGHTS = {
  countyResident: 1.5,
  inState: 1.0,
  otherUs: 0.75,
} as const;

/**
 * Owner's initial price intent, in USD. This is a parameter for server and
 * contract configuration. Do not paste it into user-facing marketing copy.
 */
export const INITIAL_TOKEN_PRICE_USD = 12.5;

export type AccessStage = "county" | "state" | "national";

/** Unverified and non-US holders still vote, at the other-US weight. */
export type ResidencyTier = "county" | "in_state" | "other_us" | "unverified";

const US_COUNTRIES = new Set([
  "us",
  "usa",
  "u.s.",
  "u.s.a.",
  "united states",
  "united states of america",
]);

export function normalizePlace(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

export function isUsCountry(country?: string | null): boolean {
  const value = normalizePlace(country);
  return value.length > 0 && US_COUNTRIES.has(value);
}

export function stageForElapsedDays(elapsedDays: number): AccessStage {
  if (elapsedDays < STAGE_BOUNDARIES.countyEndDay) return "county";
  if (elapsedDays < STAGE_BOUNDARIES.stateEndDay) return "state";
  return "national";
}

export function elapsedDaysBetween(clockStart: Date, now: Date): number {
  return (now.getTime() - clockStart.getTime()) / (1000 * 60 * 60 * 24);
}

export function commonFundingDeadline(clockStart: Date): Date {
  return new Date(
    clockStart.getTime() + STAGE_BOUNDARIES.fundingPeriodDays * 24 * 60 * 60 * 1000
  );
}

export interface ResidencyInput {
  county?: string | null;
  state?: string | null;
  country?: string | null;
  kycStatus?: string | null;
}

export interface PropertyPlace {
  county: string;
  state: string;
}

/**
 * County tier requires a verified county+state match ("hard boundary").
 * That check is not a residents-only voting rule.
 */
export function residencyTierOf(user: ResidencyInput, property: PropertyPlace): ResidencyTier {
  if (user.kycStatus !== "verified") return "unverified";

  const sameState =
    normalizePlace(user.state) !== "" &&
    normalizePlace(user.state) === normalizePlace(property.state);
  const sameCounty =
    sameState &&
    normalizePlace(user.county) !== "" &&
    normalizePlace(user.county) === normalizePlace(property.county);

  if (sameCounty) return "county";
  if (sameState) return "in_state";
  if (isUsCountry(user.country)) return "other_us";
  return "unverified";
}

export function voteWeightForTier(tier: ResidencyTier): number {
  if (tier === "county") return VOTE_WEIGHTS.countyResident;
  if (tier === "in_state") return VOTE_WEIGHTS.inState;
  return VOTE_WEIGHTS.otherUs;
}

export function weightedVotingPower(tokenCount: number, tier: ResidencyTier): number {
  return Math.floor(tokenCount * voteWeightForTier(tier));
}

export function eligibleForStage(tier: ResidencyTier, stage: AccessStage): boolean {
  if (tier === "county") return true;
  if (tier === "in_state") return stage !== "county";
  if (tier === "other_us") return stage === "national";
  return false;
}

export function unsoldRemainder(totalSupply: number, tokensSold: number): number {
  return Math.max(0, totalSupply - tokensSold);
}

export interface StagedPurchaseInput {
  now: Date;
  clockStart: Date | null;
  fundingDeadline: Date | null;
  tier: ResidencyTier;
  requestedStage: string;
  tokenCount: number;
  alreadyPurchasedThisStage: number;
  /** Null or <= 0 means the owner has not chosen an allowance. */
  perPersonAllowance: number | null;
  totalSupply: number;
  tokensSold: number;
}

export interface StagedPurchaseResult {
  allowed: boolean;
  reason?: string;
  stage?: AccessStage;
  remainder: number;
}

export function evaluateStagedPurchase(input: StagedPurchaseInput): StagedPurchaseResult {
  const remainder = unsoldRemainder(input.totalSupply, input.tokensSold);

  if (!input.clockStart) {
    return { allowed: false, reason: "Funding clock has not started", remainder };
  }
  if (input.fundingDeadline && input.now.getTime() >= input.fundingDeadline.getTime()) {
    return { allowed: false, reason: "Funding period has ended", remainder };
  }

  const stage = stageForElapsedDays(elapsedDaysBetween(input.clockStart, input.now));
  if (input.requestedStage !== stage) {
    return {
      allowed: false,
      reason: `Current access stage is ${stage}`,
      remainder,
      stage,
    };
  }
  if (!eligibleForStage(input.tier, stage)) {
    return {
      allowed: false,
      reason: "Not eligible for the current access stage",
      remainder,
      stage,
    };
  }
  if (input.perPersonAllowance == null || input.perPersonAllowance <= 0) {
    return {
      allowed: false,
      reason: "Per-person purchase allowance is not configured",
      remainder,
      stage,
    };
  }
  if (input.alreadyPurchasedThisStage + input.tokenCount > input.perPersonAllowance) {
    return {
      allowed: false,
      reason: "Exceeds the per-person allowance for this stage",
      remainder,
      stage,
    };
  }
  if (input.tokenCount > remainder) {
    return {
      allowed: false,
      reason: "Exceeds the unsold remainder",
      remainder,
      stage,
    };
  }

  return { allowed: true, remainder, stage };
}

/**
 * All shares stay locked through the common funding period.
 * After that, liquidity is undecided, so the lock stays closed.
 * Early completion and transfer-exception flags are not arguments here:
 * they must not open transfers until the owner defines them.
 */
export function sharesLocked(input: {
  now: Date;
  clockStart: Date | null;
  fundingDeadline: Date | null;
}): { locked: true; reason: string } {
  if (
    !input.clockStart ||
    !input.fundingDeadline ||
    input.now.getTime() < input.fundingDeadline.getTime()
  ) {
    return { locked: true, reason: "Transfers locked through the common funding period" };
  }
  return { locked: true, reason: "Post-period liquidity policy is undecided" };
}
