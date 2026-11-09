import test from "node:test";
import assert from "node:assert/strict";
import {
  STAGE_BOUNDARIES,
  commonFundingDeadline,
  eligibleForStage,
  evaluateStagedPurchase,
  residencyTierOf,
  sharesLocked,
  stageForElapsedDays,
  unsoldRemainder,
  voteWeightForTier,
  weightedVotingPower,
} from "../shared/accessRules.ts";

const property = { county: "Cherokee", state: "GA" };
const clock = new Date("2026-01-01T00:00:00Z");

function atDay(day: number): Date {
  return new Date(clock.getTime() + day * 24 * 60 * 60 * 1000);
}

test("stages follow day 90 and day 180, with no fourth stage", () => {
  assert.equal(stageForElapsedDays(0), "county");
  assert.equal(stageForElapsedDays(89.9), "county");
  assert.equal(stageForElapsedDays(90), "state");
  assert.equal(stageForElapsedDays(179.9), "state");
  assert.equal(stageForElapsedDays(180), "national");
  assert.equal(stageForElapsedDays(400), "national");
});

test("residency tiers require verification for the county boundary", () => {
  assert.equal(
    residencyTierOf({ county: "Cherokee", state: "GA", country: "USA", kycStatus: "pending" }, property),
    "unverified"
  );
  assert.equal(
    residencyTierOf({ county: "Cherokee", state: "GA", country: "USA", kycStatus: "verified" }, property),
    "county"
  );
  assert.equal(
    residencyTierOf({ county: "Fulton", state: "GA", country: "USA", kycStatus: "verified" }, property),
    "in_state"
  );
  assert.equal(
    residencyTierOf({ county: "King", state: "WA", country: "USA", kycStatus: "verified" }, property),
    "other_us"
  );
  assert.equal(
    residencyTierOf({ county: "Toronto", state: "ON", country: "Canada", kycStatus: "verified" }, property),
    "unverified"
  );
});

test("vote weights are 1.5 / 1.0 / 0.75 and unverified holders still vote", () => {
  assert.equal(voteWeightForTier("county"), 1.5);
  assert.equal(voteWeightForTier("in_state"), 1);
  assert.equal(voteWeightForTier("other_us"), 0.75);
  assert.equal(voteWeightForTier("unverified"), 0.75);
  assert.equal(weightedVotingPower(100, "county"), 150);
  assert.equal(weightedVotingPower(100, "in_state"), 100);
  assert.equal(weightedVotingPower(100, "other_us"), 75);
  assert.equal(weightedVotingPower(100, "unverified"), 75);
});

test("county stage rejects everyone except verified county residents", () => {
  assert.equal(eligibleForStage("county", "county"), true);
  assert.equal(eligibleForStage("in_state", "county"), false);
  assert.equal(eligibleForStage("other_us", "county"), false);
  assert.equal(eligibleForStage("unverified", "county"), false);
});

test("later stages stay open to earlier residents and sell only the remainder", () => {
  assert.equal(eligibleForStage("county", "state"), true);
  assert.equal(eligibleForStage("in_state", "state"), true);
  assert.equal(eligibleForStage("other_us", "state"), false);
  assert.equal(eligibleForStage("county", "national"), true);
  assert.equal(eligibleForStage("in_state", "national"), true);
  assert.equal(eligibleForStage("other_us", "national"), true);
  assert.equal(unsoldRemainder(1000, 0), 1000);
  assert.equal(unsoldRemainder(1000, 250), 750);
});

test("allowance is unset until configured and is the same cap inside a stage", () => {
  const base = {
    now: atDay(1),
    clockStart: clock,
    fundingDeadline: commonFundingDeadline(clock),
    tier: "county" as const,
    requestedStage: "county",
    tokenCount: 10,
    alreadyPurchasedThisStage: 0,
    totalSupply: 1000,
    tokensSold: 0,
  };

  const unset = evaluateStagedPurchase({ ...base, perPersonAllowance: null });
  assert.equal(unset.allowed, false);
  assert.match(unset.reason || "", /not configured/);

  const first = evaluateStagedPurchase({ ...base, perPersonAllowance: 25, tokenCount: 25 });
  assert.equal(first.allowed, true);
  assert.equal(first.remainder, 1000);

  const over = evaluateStagedPurchase({
    ...base,
    perPersonAllowance: 25,
    alreadyPurchasedThisStage: 20,
    tokenCount: 10,
  });
  assert.equal(over.allowed, false);
  assert.match(over.reason || "", /allowance/);
});

test("an in-state buyer is blocked on day 1 and allowed on day 91 against the remainder", () => {
  const blocked = evaluateStagedPurchase({
    now: atDay(1),
    clockStart: clock,
    fundingDeadline: commonFundingDeadline(clock),
    tier: "in_state",
    requestedStage: "state",
    tokenCount: 10,
    alreadyPurchasedThisStage: 0,
    perPersonAllowance: 40,
    totalSupply: 1000,
    tokensSold: 100,
  });
  assert.equal(blocked.allowed, false);

  const opened = evaluateStagedPurchase({
    now: atDay(91),
    clockStart: clock,
    fundingDeadline: commonFundingDeadline(clock),
    tier: "in_state",
    requestedStage: "state",
    tokenCount: 40,
    alreadyPurchasedThisStage: 0,
    perPersonAllowance: 40,
    totalSupply: 1000,
    tokensSold: 100,
  });
  assert.equal(opened.allowed, true);
  assert.equal(opened.remainder, 900);

  const overRemainder = evaluateStagedPurchase({
    now: atDay(91),
    clockStart: clock,
    fundingDeadline: commonFundingDeadline(clock),
    tier: "in_state",
    requestedStage: "state",
    tokenCount: 901,
    alreadyPurchasedThisStage: 0,
    perPersonAllowance: 1000,
    totalSupply: 1000,
    tokensSold: 100,
  });
  assert.equal(overRemainder.allowed, false);
  assert.match(overRemainder.reason || "", /remainder/);
});

test("other US buyers wait until day 180 and non-US buyers cannot purchase", () => {
  const input = {
    clockStart: clock,
    fundingDeadline: commonFundingDeadline(clock),
    tier: "other_us" as const,
    requestedStage: "national",
    tokenCount: 1,
    alreadyPurchasedThisStage: 0,
    perPersonAllowance: 10,
    totalSupply: 500,
    tokensSold: 0,
  };
  const early = evaluateStagedPurchase({ ...input, now: atDay(100) });
  assert.equal(early.allowed, false);

  const national = evaluateStagedPurchase({ ...input, now: atDay(180) });
  assert.equal(national.allowed, true);

  const abroad = evaluateStagedPurchase({ ...input, now: atDay(180), tier: "unverified" });
  assert.equal(abroad.allowed, false);
});

test("the funding clock is common and the lock does not open when it ends", () => {
  const deadline = commonFundingDeadline(clock);
  assert.equal(
    deadline.getTime() - clock.getTime(),
    STAGE_BOUNDARIES.fundingPeriodDays * 24 * 60 * 60 * 1000
  );

  const during = sharesLocked({ now: atDay(10), clockStart: clock, fundingDeadline: deadline });
  const lateBuyer = sharesLocked({ now: atDay(200), clockStart: clock, fundingDeadline: deadline });
  assert.equal(during.reason, lateBuyer.reason);
  assert.equal(during.locked, true);

  const after = sharesLocked({ now: atDay(365), clockStart: clock, fundingDeadline: deadline });
  assert.equal(after.locked, true);
  assert.match(after.reason, /undecided/);

  const beforeStart = sharesLocked({ now: atDay(0), clockStart: null, fundingDeadline: null });
  assert.equal(beforeStart.locked, true);
});
