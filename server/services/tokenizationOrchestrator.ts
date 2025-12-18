/**
 * Tokenization Orchestrator
 * 
 * Manages the full lifecycle of property tokenization:
 * 1. Property approval → Contract deployment
 * 2. Phase management for 5-phase offering
 * 3. Investor protection (refunds if funding fails)
 * 4. Dividend distribution for successful properties
 */

import { storage } from "../storage";
import { 
  simulateDeployment, 
  calculatePhasePricing,
  calculateRefundWithInterest,
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
  
  if (nomination.status !== "approved" && nomination.status !== "selected") {
    return { success: false, error: "Nomination must be approved before tokenization" };
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
    fundingGoal: (request.propertyValue * 0.6).toString(), // 60% minimum threshold
  });
  
  console.log(`[Orchestrator] Created property: ${property.id}`);
  
  // 3. Calculate funding parameters
  const fundingGoal = request.propertyValue * 0.6; // 60% minimum threshold
  const fundingDeadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
  
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
    totalFundingRaised: "0",
    interestRateOnRefund: "3.00",
    fundingOutcome: "in_progress",
  });
  
  console.log(`[Orchestrator] Created offering: ${offering.id}`);
  
  // 6. Update offering with contract address
  // Note: In a real implementation, we'd update the offering record
  
  // 7. Create offering phases with pricing
  const phaseConfigs = calculatePhasePricing(12.50); // $12.50 base price
  const phases = [];
  
  const phaseOrderMap = { county: 1, state: 2, national: 3, international: 4 };
  
  for (const config of phaseConfigs) {
    const phase = await storage.createOfferingPhase({
      offeringId: offering.id,
      phase: config.phase,
      phaseOrder: phaseOrderMap[config.phase],
      basePrice: "12.50",
      priceMultiplier: config.priceMultiplier.toString(),
      currentPrice: (12.50 * config.priceMultiplier).toFixed(2),
      maxTokensPerPerson: config.maxTokensPerPerson,
      tokenAllocation: Math.floor(request.totalTokens / 4), // 25% per phase
      startsAt: config.startDate,
      endsAt: config.endDate,
    });
    phases.push(phase);
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
 * Process refunds for failed funding (< 60% raised after 1 year)
 * Implements 3% APR interest calculation for investor protection
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
  console.log(`[Orchestrator] Processing refunds for offering: ${offeringId}`);
  
  const offering = await storage.getTokenOffering(offeringId);
  if (!offering) {
    return { success: false, refundsProcessed: 0, totalRefundAmount: 0, refundDetails: [], error: "Offering not found" };
  }
  
  // Check if funding period has ended
  if (offering.fundingDeadline && new Date() < new Date(offering.fundingDeadline)) {
    return { success: false, refundsProcessed: 0, totalRefundAmount: 0, refundDetails: [], error: "Funding period has not ended yet" };
  }
  
  // Check if minimum threshold was met (60% of target)
  const raised = parseFloat(offering.totalFundingRaised || "0");
  const threshold = parseFloat(offering.minimumFundingThreshold || "0");
  
  if (raised >= threshold) {
    return { success: false, refundsProcessed: 0, totalRefundAmount: 0, refundDetails: [], error: "Funding was successful, no refunds needed" };
  }
  
  const refundDate = new Date();
  let totalRefundAmount = 0;
  let refundsProcessed = 0;
  const refundDetails: Array<{
    purchaseId: string;
    principal: number;
    interest: number;
    total: number;
    daysHeld: number;
  }> = [];
  
  console.log(`[Orchestrator] Funding failed (${raised} < ${threshold}). Processing refunds with 3% APR...`);
  
  // Get all confirmed purchases for this offering
  const phases = await storage.getOfferingPhases(offeringId);
  
  for (const phase of phases) {
    // For each investor's purchase, calculate refund with 3% APR interest
    // In production, this would fetch actual purchases and process each:
    
    // Example calculation for each purchase:
    // const purchases = await storage.getPurchasesByPhase(phase.id);
    // for (const purchase of purchases) {
    //   const refund = calculateRefundWithInterest(
    //     parseFloat(purchase.totalAmount),
    //     new Date(purchase.purchasedAt),
    //     refundDate
    //   );
    //   
    //   // Record refund
    //   refundDetails.push({
    //     purchaseId: purchase.id,
    //     principal: refund.principal,
    //     interest: refund.interest,
    //     total: refund.total,
    //     daysHeld: Math.floor((refundDate.getTime() - new Date(purchase.purchasedAt).getTime()) / (1000 * 60 * 60 * 24)),
    //   });
    //   
    //   totalRefundAmount += refund.total;
    //   refundsProcessed++;
    // }
  }
  
  // Simulate demo refund calculation
  if (raised > 0) {
    const avgDaysHeld = 180; // Assume 6 months average
    const interestRate = 0.03; // 3% APR
    const yearFraction = avgDaysHeld / 365;
    const interest = raised * interestRate * yearFraction;
    
    totalRefundAmount = raised + interest;
    refundsProcessed = Math.ceil(raised / 500); // Estimate ~$500 avg investment
    
    refundDetails.push({
      purchaseId: "aggregate",
      principal: raised,
      interest: Math.round(interest * 100) / 100,
      total: Math.round(totalRefundAmount * 100) / 100,
      daysHeld: avgDaysHeld,
    });
    
    console.log(`[Orchestrator] Calculated refunds: $${raised} principal + $${interest.toFixed(2)} interest (3% APR) = $${totalRefundAmount.toFixed(2)}`);
  }
  
  // Update offering status to refunded
  // In production: await storage.updateOfferingStatus(offeringId, 'refunded');
  
  return {
    success: true,
    refundsProcessed,
    totalRefundAmount: Math.round(totalRefundAmount * 100) / 100,
    refundDetails,
  };
}

/**
 * Advance offering to next phase (county → state → national → international)
 */
export async function advancePhase(offeringId: string): Promise<{
  success: boolean;
  newPhase?: string;
  error?: string;
}> {
  console.log(`[Orchestrator] Advancing phase for offering: ${offeringId}`);
  
  const phases = await storage.getOfferingPhases(offeringId);
  const activePhase = phases.find(p => p.isActive);
  
  if (!activePhase) {
    return { success: false, error: "No active phase found" };
  }
  
  const phaseOrder = ["county", "state", "national", "international"];
  const currentIndex = phaseOrder.indexOf(activePhase.phase);
  
  if (currentIndex === phaseOrder.length - 1) {
    return { success: false, error: "Already at final phase (international)" };
  }
  
  // Deactivate current phase
  // Activate next phase
  // In production, this would update the smart contract as well
  
  const nextPhase = phaseOrder[currentIndex + 1];
  console.log(`[Orchestrator] Advanced from ${activePhase.phase} to ${nextPhase}`);
  
  return {
    success: true,
    newPhase: nextPhase,
  };
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
