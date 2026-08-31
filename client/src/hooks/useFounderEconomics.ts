'use client';

import { useReadContract } from 'wagmi';
import { EscrowABI } from '@/lib/contracts/escrow';
import { GovernanceABI } from '@/lib/contracts/governance';
import { ESCROW_ADDRESS, GOVERNANCE_ADDRESS } from '@/lib/contracts/addresses';

interface UseFounderEconomicsParams {
  propertyId: number;
  proposalId?: number;
}

interface FounderEconomicsData {
  // Raw contract data
  escrowStatus: any | undefined;
  quarterlyState: any | undefined;
  impactReport: any | undefined;
  
  // Computed / derived
  isLoading: boolean;
  error: Error | null;
  
  totalRaised: number;
  fundingTarget: number;
  projectBudget: number;
  percentFunded: number;
  isFunded: boolean;
  founderFeePaid: boolean;
  
  impactScore: number;
  isImpactEligible: boolean;
  founderFeeAmount: number; // in wei
  
  formattedTarget: string;
  formattedBudget: string;
  formattedFee: string;
  
  hasPendingQuarterlyIncome: boolean;
  nextDistributionDate: Date | null;
}

export function useFounderEconomics({ propertyId, proposalId }: UseFounderEconomicsParams): FounderEconomicsData {
  const { data: escrowStatus, isLoading: escrowLoading, error: escrowError } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: EscrowABI,
    functionName: 'getEscrowStatus',
    args: [BigInt(propertyId)],
  });

  const { data: quarterlyState, isLoading: quarterlyLoading } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: EscrowABI,
    functionName: 'getQuarterlyState',
    args: [BigInt(propertyId)],
  });

  const { data: impactReport, isLoading: impactLoading, error: impactError } = useReadContract({
    address: GOVERNANCE_ADDRESS,
    abi: GovernanceABI,
    functionName: 'getImpactReport',
    args: proposalId ? [BigInt(proposalId)] : undefined,
    query: { enabled: !!proposalId },
  });

  const isLoading = Boolean(escrowLoading || quarterlyLoading || (proposalId && impactLoading));
  const error = escrowError || impactError || null;

  // Safe defaults
  const totalRaised = escrowStatus ? Number(escrowStatus[0]) : 0;
  const fundingTarget = escrowStatus ? Number(escrowStatus[1]) : 0;
  const projectBudget = escrowStatus ? Number(escrowStatus[2]) : 0;
  const percentFunded = escrowStatus ? Number(escrowStatus[6]) : 0;
  const isFunded = escrowStatus ? Boolean(escrowStatus[4]) : false;
  const founderFeePaid = escrowStatus ? Boolean(escrowStatus[5]) : false;

  const impactScore = impactReport ? Number(impactReport[1]) : 0;
  const isImpactEligible = impactScore >= 70;

  const FOUNDER_FEE_BPS = 100;
  const founderFeeAmount = isImpactEligible 
    ? Math.floor((totalRaised * FOUNDER_FEE_BPS) / 10000) 
    : 0;

  const formattedTarget = (fundingTarget / 1e18).toFixed(2);
  const formattedBudget = (projectBudget / 1e18).toFixed(2);
  const formattedFee = (founderFeeAmount / 1e18).toFixed(2);

  const hasPendingQuarterlyIncome = quarterlyState ? Number(quarterlyState[1]) > 0 : false;
  const nextDistributionDate = quarterlyState 
    ? new Date(Number(quarterlyState[2]) * 1000) 
    : null;

  return {
    escrowStatus,
    quarterlyState,
    impactReport,
    isLoading,
    error,
    totalRaised,
    fundingTarget,
    projectBudget,
    percentFunded,
    isFunded,
    founderFeePaid,
    impactScore,
    isImpactEligible,
    founderFeeAmount,
    formattedTarget,
    formattedBudget,
    formattedFee,
    hasPendingQuarterlyIncome,
    nextDistributionDate,
  };
}
