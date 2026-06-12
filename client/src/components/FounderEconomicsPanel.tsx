'use client';

import React from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { EscrowABI } from '@/lib/contracts/escrow';
import { GovernanceABI } from '@/lib/contracts/governance';
import { ESCROW_ADDRESS, GOVERNANCE_ADDRESS } from '@/lib/contracts/addresses';
import { toOnChainPropertyId } from '@/lib/contracts/propertyId';

interface FounderEconomicsPanelProps {
  propertyId: string | number;
  proposalId?: number;
  showPersonalImpact?: boolean;
  compact?: boolean;
}

export function FounderEconomicsPanel({
  propertyId,
  proposalId,
  showPersonalImpact = false,
  compact = false,
}: FounderEconomicsPanelProps) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const escrowConfigured = !!ESCROW_ADDRESS && ESCROW_ADDRESS !== ZERO_ADDRESS;
  const governanceConfigured = !!GOVERNANCE_ADDRESS && GOVERNANCE_ADDRESS !== ZERO_ADDRESS;

  const onChainPropertyId = toOnChainPropertyId(propertyId);

  const escrowReadEnabled = onChainPropertyId !== null && escrowConfigured;

  const { data: escrowStatus, isLoading: escrowLoading } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: EscrowABI,
    functionName: 'getEscrowStatus',
    args: onChainPropertyId !== null ? [onChainPropertyId] : undefined,
    query: { enabled: escrowReadEnabled },
  });

  const { data: quarterlyState, isLoading: quarterlyLoading } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: EscrowABI,
    functionName: 'getQuarterlyState',
    args: onChainPropertyId !== null ? [onChainPropertyId] : undefined,
    query: { enabled: escrowReadEnabled },
  });

  const impactReadEnabled = !!proposalId && governanceConfigured;

  const { data: impactReport, isLoading: impactLoading } = useReadContract({
    address: GOVERNANCE_ADDRESS,
    abi: GovernanceABI,
    functionName: 'getImpactReport',
    args: proposalId ? [BigInt(proposalId)] : undefined,
    query: { enabled: impactReadEnabled },
  });

  const isLoading = Boolean(escrowLoading || quarterlyLoading || (proposalId && impactLoading));

  if (isLoading) {
    return (
      <Card className={compact ? 'w-full' : 'w-full max-w-2xl'}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!escrowStatus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No escrow data available for this property yet.</p>
        </CardContent>
      </Card>
    );
  }

  const [totalRaised, fundingTarget, projectBudget, , isComplete, founderFeePaid, percentFunded] = escrowStatus as any;

  const impactScore = impactReport ? Number(impactReport[1]) : 0;
  const isImpactEligible = impactScore >= 70;
  const founderFeeBps = 100;
  const founderFeeAmount = isImpactEligible 
    ? (Number(totalRaised) * founderFeeBps) / 10000 
    : 0;

  const formattedTarget = (Number(fundingTarget) / 1e18).toFixed(2);
  const formattedBudget = (Number(projectBudget) / 1e18).toFixed(2);
  const formattedFee = (founderFeeAmount / 1e18).toFixed(2);

  return (
    <Card className={compact ? 'w-full border-l-4 border-l-amber-500' : 'w-full max-w-2xl'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Founder Economics — 1% Impact-Gated Model</CardTitle>
          <Badge variant={isImpactEligible ? 'default' : 'secondary'} className="text-xs">
            {isImpactEligible ? 'ELIGIBLE' : 'IMPACT REVIEW PENDING'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Transparent platform sustainability fee • Gated by on-chain governance impact score (≥70)
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Funding Progress</span>
            <span className="font-mono">{Number(percentFunded) / 100}%</span>
          </div>
          <Progress value={Number(percentFunded) / 100} className="h-2 mb-3" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Gross Raise Target</div>
              <div className="font-mono text-lg font-semibold">${formattedTarget}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Project Net Budget</div>
              <div className="font-mono text-lg font-semibold">${formattedBudget}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between items-baseline">
              <div>
                <div className="font-medium">Founder 1% Fee</div>
                <div className="text-xs text-muted-foreground">
                  {isImpactEligible ? 'Unlocked (impact ≥70)' : 'Locked until impact threshold met'}
                </div>
              </div>
              <div className={`font-mono text-xl font-semibold ${isImpactEligible ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                ${formattedFee}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Project always receives its full required budget. Founder cut only unlocks on community-approved impact score.
            </p>
          </div>
        </div>

        {quarterlyState && (
          <div>
            <div className="text-sm font-medium mb-2">Quarterly Distribution Layer</div>
            <div className="text-xs text-muted-foreground mb-1">1% of actual rental / appreciation income</div>
            <div className="text-sm">
              Next distribution: <span className="font-mono">~{new Date(Number(quarterlyState[2]) * 1000).toLocaleDateString()}</span>
            </div>
            {Number(quarterlyState[1]) > 0 && (
              <div className="text-xs mt-1 text-emerald-600">
                Pending income detected — founder share will be calculated automatically via Chainlink Automation.
              </div>
            )}
          </div>
        )}

        {proposalId && impactReport && (
          <div className="rounded border p-3 text-sm">
            <div className="flex items-center gap-2">
              <span>Linked Proposal Impact Score:</span>
              <Badge variant={isImpactEligible ? 'default' : 'outline'}>{impactScore}/100</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Threshold for founder fee unlock: <strong>70</strong>. Score set at proposal creation and visible in governance.
            </p>
          </div>
        )}

        {showPersonalImpact && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            Your participation contributes to escrow inflows and PhaseManager thresholds that determine advancement and fee eligibility.
          </div>
        )}

        {/* NEW: CLARITY-aligned explanatory section */}
        <div className="text-xs text-muted-foreground border-t pt-3 space-y-2">
          <p>
            <strong>Real Asset + Community Impact</strong><br />
            Each PropertyToken represents a fractional claim on a specific real estate asset held through a dedicated legal entity (LLC/SPV). 
            The 1% platform sustainability fee only becomes available after the community approves an impact report (score ≥70/100) via on-chain governance.
          </p>
          
          <p>
            <strong>Performance-Tied, Not Upfront Extraction</strong><br />
            The founder receives 1% of actual quarterly income (rental, appreciation, or other cash flow) only when real value has been created and verified by participants. 
            If a project underperforms or impact thresholds are not met, the fee is not paid. This structure aligns platform sustainability with measurable community outcomes.
          </p>
          
          <p className="text-[10px]">
            All figures are read live from the Escrow and Governance contracts on Base. 
            This design supports regulatory clarity by tying economics to real utility and verified impact rather than speculative value.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
