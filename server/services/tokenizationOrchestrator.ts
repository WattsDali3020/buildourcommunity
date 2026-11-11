/**
 * Tokenization Orchestrator
 * 
 * Manages the full lifecycle of property tokenization:
 * 1. Property approval → Contract deployment
 * 2. Staged access to the unsold remainder (county, statewide, nationwide)
 * 3. Investor protection (refunds if funding fails)
 * 4. Dividend distribution for successful properties
 */

import { storage } from "../storage";
import {
  INITIAL_TOKEN_PRICE_USD,
  commonFundingDeadline,
  elapsedDaysBetween,
  stageForElapsedDays,
} from "@shared/accessRules";
import { 
  simulateDeployment, 
  calculatePhasePricing,
  getExplorerUrl,
  TokenDeploymentConfig,
  DeploymentResult,
} from "./blockchain";

export interface TokenizationRequest {
  nominationId: string;
  propertyValue: number; // Appraised value in USD
  tokenName: string;
  tokenSymbol: string;
  totalTokens: number;
}

export interface TokenizationResult {
  success: boolean;
  propertyId?: string;
  offeringId?: string;
  contractAddress?: string;
  transactionHash?: string;
  explorerUrl?: string;
  phases?: any[];
  error?: string;
}

/**
 * Initiate tokenization for an approved property nomination
 */
export async function initiateTokenization(
  request: TokenizationRequest
): Promise<TokenizationResult> {
  console.log(`[Orchestrator] Initiating tokenization for nomination: ${request.nominationId}`);
  
  // 1. Validate nomination exists and is approved
  const nomination = await storage.getPropertyNomination(request.nominationId);
  if (!nomination) {
    return { success: false, error: "Nomination not found" };
  }
  
  // Allow tokenization if nomination is approved/selected OR if owner has expressed interest
  const isApproved = nomination.status === "approved" || nomination.status === "selected";
  const ownerInterested = nomination.ownerResponseStatus === "interested";
  
  if (!isApproved && !ownerInterested) {
    return { success: false, error: "Nomination must be approved or owner must express interest before tokenization" };
  }
  
  // 2. Create the property record
  // Map desired use to valid property type
  const propertyTypeMap: Record<string, "vacant_land" | "historic_building" | "commercial" | "downtown"> = {
    "housing": "downtown",
    "retail": "commercial",
    "healthcare": "commercial",
    "education": "commercial",
    "childcare": "commercial",
    "food_service": "commercial",
    "arts_culture": "historic_building",
    "green_space": "vacant_land",
    "office": "commercial",
    "mixed_use": "downtown",
    "recreation": "vacant_land",
    "social_services": "commercial",
  };
  
  const propertyType = propertyTypeMap[nomination.topVotedUse || ""] || "commercial";
  
  const property = await storage.createProperty({
    name: `${nomination.city} ${nomination.topVotedUse || "Community"} Project`,
    description: nomination.description,
    streetAddress: nomination.propertyAddress,
    city: nomination.city,
    state: nomination.state,
    county: nomination.county,
    zipCode: nomination.zipCode || "00000",
    propertyType,
    proposedUse: nomination.topVotedUse || "Community Development",
    estimatedValue: request.propertyValue.toString(),
    fundingGoal: request.propertyValue.toString(), // 100% funding required for loan issuance
  });
  
  console.log(`[Orchestrator] Created property: ${property.id}`);
  
  // 3. Calculate funding parameters
  const fundingGoal = request.propertyValue; // 100% funding required for loan issuance
  const fundingClockStart = new Date();
  const fundingDeadline = commonFundingDeadline(fundingClockStart);
  
  // 4. Deploy smart contract
  const deploymentConfig: TokenDeploymentConfig = {
    propertyId: property.id,
    tokenName: request.tokenName,
    tokenSymbol: request.tokenSymbol,
    totalSupply: request.totalTokens,
    propertyValue: request.propertyValue,
    fundingGoal,
    fundingDeadline,
  };
  
  const deployment = await simulateDeployment(deploymentConfig);
  
  if (!deployment.success) {
    return { success: false, error: deployment.error || "Contract deployment failed" };
  }
  
  console.log(`[Orchestrator] Contract deployed: ${deployment.contractAddress}`);
  
  // 5. Create token offering record
  const offering = await storage.createTokenOffering({
    propertyId: property.id,
    tokenSymbol: request.tokenSymbol,
    tokenName: request.tokenName,
    totalSupply: request.totalTokens,
    minimumFundingThreshold: fundingGoal.toString(),
    fundingDeadline,
    fundingClockStart,
    perPersonAllowance: null,
    totalFundingRaised: "0",
    interestRateOnRefund: "3.00",
    fundingOutcome: "in_progress",
  });
  
  console.log(`[Orchestrator] Created offering: ${offering.id}`);
  
  // 6. Update offering with contract address
  // Note: In a real implementation, we'd update the offering record
  
  // 7. Create access stages. One price parameter. No reserved buckets.
  //    Allowance stays unset until the owner chooses it.
  const phaseConfigs = calculatePhasePricing(INITIAL_TOKEN_PRICE_USD, fundingClockStart);
  const phases = [];
  const priceText = INITIAL_TOKEN_PRICE_USD.toFixed(2);
  
  const phaseOrderMap = { county: 1, state: 2, national: 3 };
  
  for (const config of phaseConfigs) {
    const phase = await storage.createOfferingPhase({
      offeringId: offering.id,
      phase: config.phase,
      phaseOrder: phaseOrderMap[config.phase],
      basePrice: priceText,
      priceMultiplier: "1.00",
      currentPrice: priceText,
      maxTokensPerPerson: 0,
      tokenAllocation: request.totalTokens,
      eligibilityCounty: config.phase === "county" ? nomination.county : null,
      eligibilityState: config.phase === "national" ? null : nomination.state,
      eligibilityCountry: config.phase === "national" ? "USA" : null,
      startsAt: config.startDate,
      endsAt: config.endDate,
    });
    phases.push(phase);
  }

  const countyPhase = phases.find((phase) => phase.phase === "county");
  if (countyPhase) {
    await storage.updateOfferingPhase(countyPhase.id, { isActive: true });
    countyPhase.isActive = true;
  }
  
  console.log(`[Orchestrator] Created ${phases.length} offering phases`);
  
  // 8. Update nomination status
  await storage.updatePropertyNomination(request.nominationId, {
    status: "selected",
  });
  
  // 9. Update property status to live
  await storage.updatePropertyStatus(property.id, "live");
  
  return {
    success: true,
    propertyId: property.id,
    offeringId: offering.id,
    contractAddress: deployment.contractAddress,
    transactionHash: deployment.transactionHash,
    explorerUrl: deployment.contractAddress 
      ? getExplorerUrl("address", deployment.contractAddress)
      : undefined,
    phases,
  };
}

/**
 * Hard-gated. The old 3% path is not a live rule.
 * TODO(owner): any later cash return is off-chain and is not calculated here.
 */
export async function processRefunds(offeringId: string): Promise<{
  success: boolean;
  refundsProcessed: number;
  totalRefundAmount: number;
  refundDetails: Array<{
    purchaseId: string;
    principal: number;
    interest: number;
    total: number;
    daysHeld: number;
  }>;
  error?: string;
}> {
  console.log(`[Orchestrator] Refunds are not enabled for offering: ${offeringId}`);
  return {
    success: false,
    refundsProcessed: 0,
    totalRefundAmount: 0,
    refundDetails: [],
    error: "Refunds are not enabled",
  };
}

/**
 * Align the active stage with the common funding clock.
 * Does not skip ahead of day 90 or day 180.
 */
export async function syncAccessStage(offeringId: string): Promise<{
  success: boolean;
  newPhase?: string;
  error?: string;
}> {
  const offering = await storage.getTokenOffering(offeringId);
  if (!offering) {
    return { success: false, error: "Offering not found" };
  }
  if (!offering.fundingClockStart) {
    return { success: false, error: "Funding clock has not started" };
  }

  const stage = stageForElapsedDays(elapsedDaysBetween(new Date(offering.fundingClockStart), new Date()));
  const phases = await storage.getOfferingPhases(offeringId);
  for (const phase of phases) {
    const shouldBeActive = phase.phase === stage;
    if (Boolean(phase.isActive) !== shouldBeActive) {
      await storage.updateOfferingPhase(phase.id, { isActive: shouldBeActive });
    }
  }
  if (offering.currentPhase !== stage) {
    await storage.updateOffering(offering.id, { currentPhase: stage });
  }
  return { success: true, newPhase: stage };
}

/** @deprecated Use syncAccessStage. Manual bucket advancement is not supported. */
export async function advancePhase(offeringId: string) {
  return syncAccessStage(offeringId);
}

/**
 * Get tokenization status for a property
 */
export async function getTokenizationStatus(propertyId: string): Promise<{
  isTokenized: boolean;
  contractAddress?: string;
  currentPhase?: string;
  fundingProgress?: number;
  daysRemaining?: number;
  totalInvestors?: number;
}> {
  const offering = await storage.getOfferingByPropertyId(propertyId);
  
  if (!offering) {
    return { isTokenized: false };
  }
  
  const phases = await storage.getOfferingPhases(offering.id);
  const activePhase = phases.find(p => p.isActive);
  
  const raised = parseFloat(offering.totalFundingRaised || "0");
  const threshold = parseFloat(offering.minimumFundingThreshold || "0");
  const fundingProgress = threshold > 0 ? (raised / threshold) * 100 : 0;
  
  let daysRemaining = 0;
  if (offering.fundingDeadline) {
    const deadline = new Date(offering.fundingDeadline);
    daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }
  
  const tokensSold = offering.tokensSold ?? 0;
  
  return {
    isTokenized: true,
    contractAddress: offering.contractAddress || undefined,
    currentPhase: activePhase?.phase,
    fundingProgress,
    daysRemaining,
    totalInvestors: tokensSold > 0 ? Math.ceil(tokensSold / 50) : 0, // Estimate
  };
}
